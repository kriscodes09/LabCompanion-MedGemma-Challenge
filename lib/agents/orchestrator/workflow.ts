// lib/agents/orchestrator/workflow.ts

import type {
  Evidence,
  LabMarker,
  MarkerContext,
  WorkflowResult,
  WorkflowSafetySummary,
  AgentLogItem,
  ParseQualitySummary,
} from '../types';

import { normalizeMarkers } from '../parser';
import { parseLabText } from '../parser/pattern-matcher';

import { generateContextForMarker } from '../context';
import { generateEvidence } from '../evidence';
import { generateQuestions } from '../questions';
import { rewriteToSafe } from '../safety/rewriter';

const now = () => Date.now();

function pushLog(log: AgentLogItem[], item: AgentLogItem) {
  log.push(item);
}

/**
 * Parse quality (STRUCTURE reliability, not medical correctness)
 * Returns 0–100 score + warnings to explain why.
 */
function computeParseQuality(extractedText: string, markerCount: number): ParseQualitySummary {
  const warnings: string[] = [];

  const lines = extractedText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const totalLines = lines.length;

  let score = 100;

  if (markerCount === 0) {
    return { score: 0, warnings: ['No lab markers detected in OCR text.'] };
  }

  // Marker density heuristic
  const density = markerCount / Math.max(totalLines, 1);
  if (density < 0.05) {
    score -= 25;
    warnings.push('Very low marker density — OCR may be noisy or the report format may be unusual.');
  }

  // Low marker count
  if (markerCount < 5) {
    score -= 15;
    warnings.push('Few markers detected — report may be partial or OCR missed rows.');
  }

  // If OCR text is huge but markers are small → likely noise / headers / junk
  if (totalLines > 200 && markerCount < 10) {
    score -= 20;
    warnings.push('Lots of OCR text but few markers — consider cropping to just the results table.');
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  return { score, warnings };
}

export async function processLabText(extractedText: string, ocrConfidence: number): Promise<WorkflowResult> {
  const startTime = now();
  const agentLog: AgentLogItem[] = [];

  try {
    // 1) Parser Agent
    const t1 = now();
    const extracted = parseLabText(extractedText);

    pushLog(agentLog, {
      agent: 'Parser Agent',
      status: extracted.length > 0 ? 'ok' : 'error',
      ms: now() - t1,
      message: extracted.length > 0 ? `Extracted ${extracted.length} marker lines` : 'No markers extracted',
    });

    if (!extracted || extracted.length === 0) {
      throw new Error('No lab markers found in OCR text');
    }

    // 2) Normalize markers (part of Parser Agent - no separate log entry)
    const asLabMarkers: LabMarker[] = extracted.map((m) => ({
      name: m.name,
      value: m.value,
      unit: m.unit,
      referenceRange: m.referenceRange
        ? {
            low: m.referenceRange.low,
            high: m.referenceRange.high,
            unit: m.referenceRange.unit,
          }
        : undefined,
      flagged: m.status !== 'normal',
    }));

    const normalized = normalizeMarkers(asLabMarkers);

    // ✅ Parse Quality (after normalization so junk markers don't inflate score)
    const parseQuality = computeParseQuality(extractedText, normalized.length);

    // 3) Context Agent
    const t3 = now();
    const contexts: MarkerContext[] = await Promise.all(
      normalized.map((marker) =>
        generateContextForMarker(marker.name, typeof marker.value === 'number' ? marker.value : undefined)
      )
    );

    pushLog(agentLog, {
      agent: 'Context Agent',
      status: 'ok',
      ms: now() - t3,
      message: `Generated ${contexts.length} contexts`,
    });

    // 4) Evidence Agent
    const t4 = now();
    const evidence: Evidence[] = await Promise.all(normalized.map((marker) => generateEvidence(marker.name)));

    pushLog(agentLog, {
      agent: 'Evidence Agent',
      status: 'ok',
      ms: now() - t4,
      message: `Generated ${evidence.length} evidence blocks`,
    });

    // 5) Questions Agent
    const t5 = now();
    const questions = await generateQuestions(normalized);

    pushLog(agentLog, {
      agent: 'Questions Agent',
      status: 'ok',
      ms: now() - t5,
      message: `Generated ${questions.length} questions`,
    });

    // 6) Safety Agent
    const t6 = now();
    const safety = await validateAllContent(contexts, evidence);

    pushLog(agentLog, {
      agent: 'Safety Agent',
      status: safety.allSafe ? 'ok' : 'warn',
      ms: now() - t6,
      message: safety.allSafe ? 'All content passed safety checks' : `${safety.violations} rewrite(s) applied`,
    });

    const processingTime = now() - startTime;

    // Add Orchestrator summary at end
    pushLog(agentLog, {
      agent: 'Orchestrator',
      status: 'ok',
      ms: processingTime,
      message: `Coordinated ${agentLog.length} agents`,
    });

    const fallbackMarkers = safety.contexts
      .filter((c) => c.generatedBy === 'Fallback')
      .map((c) => c.markerName);

    const warnings =
      fallbackMarkers.length > 0
        ? [`Fallback content used for ${fallbackMarkers.length} marker(s): ${fallbackMarkers.join(', ')}`]
        : [];

    const safetyChecks: WorkflowSafetySummary = {
      allSafe: safety.allSafe,
      checkedItems: safety.checkedItems,
      violations: safety.violations,
    };

    return {
      parsed: {
        markers: normalized,
        extractedText,
        confidence: ocrConfidence,
        timestamp: new Date().toISOString(),
      },
      contexts: safety.contexts,
      evidence: safety.evidence,
      questions,
      safetyChecks,
      processingTime,
      warnings,
      agentLog,
      parseQuality,
    };
  } catch (err) {
    const processingTime = now() - startTime;

    pushLog(agentLog, {
      agent: 'Orchestrator',
      status: 'error',
      ms: processingTime,
      message: err instanceof Error ? err.message : 'Unknown error',
    });

    return {
      parsed: {
        markers: [],
        extractedText,
        confidence: ocrConfidence,
        timestamp: new Date().toISOString(),
      },
      contexts: [],
      evidence: [],
      questions: [],
      safetyChecks: { allSafe: false, checkedItems: 0, violations: 0 },
      processingTime,
      warnings: ['Workflow failed. See agent log for details.'],
      agentLog,
      parseQuality: { score: 0, warnings: ['Workflow failed before parse quality could be assessed.'] },
    };
  }
}

async function validateAllContent(
  contexts: MarkerContext[],
  evidence: Evidence[]
): Promise<{
  allSafe: boolean;
  checkedItems: number;
  violations: number;
  contexts: MarkerContext[];
  evidence: Evidence[];
}> {
  let totalViolations = 0;
  let checkedItems = 0;

  const rewrittenContexts: MarkerContext[] = [];

  for (const context of contexts) {
    const w = await rewriteToSafe(context.whatIsIt);
    checkedItems++;
    if (!w.safe) totalViolations += w.violations.length;

    const r = await rewriteToSafe(context.researchContext);
    checkedItems++;
    if (!r.safe) totalViolations += r.violations.length;

    let fpText = context.foodPatterns ?? '';
    if (fpText.trim().length > 0) {
      const fp = await rewriteToSafe(fpText);
      checkedItems++;
      if (!fp.safe) totalViolations += fp.violations.length;
      fpText = fp.rewrittenText || fpText;
    }

    rewrittenContexts.push({
      ...context,
      whatIsIt: w.rewrittenText || context.whatIsIt,
      researchContext: r.rewrittenText || context.researchContext,
      foodPatterns: fpText,
    });
  }

  const rewrittenEvidence: Evidence[] = [];
  for (const ev of evidence) {
    const res = await rewriteToSafe(ev.researchSummary);
    checkedItems++;
    if (!res.safe) totalViolations += res.violations.length;

    let fp = ev.foodPatterns ?? '';
    if (fp.trim().length > 0) {
      const safeFp = await rewriteToSafe(fp);
      checkedItems++;
      if (!safeFp.safe) totalViolations += safeFp.violations.length;
      fp = safeFp.rewrittenText || fp;
    }

    rewrittenEvidence.push({
      ...ev,
      researchSummary: res.rewrittenText || ev.researchSummary,
      foodPatterns: fp,
    });
  }

  return {
    allSafe: totalViolations === 0,
    checkedItems,
    violations: totalViolations,
    contexts: rewrittenContexts,
    evidence: rewrittenEvidence,
  };
}