import type { Evidence, LabMarker, MarkerContext, WorkflowResult } from '../types';

import { parseLabReport, normalizeMarkers } from '../parser';
import { generateContextForMarker } from '../context';
import { generateEvidence } from '../evidence';
import { generateQuestions } from '../questions';
import { rewriteToSafe } from '../safety/rewriter';

/**
 * Main orchestrator workflow - coordinates all agents
 * Entry point for processing a complete lab report
 */
export async function processLabReport(imageBase64: string): Promise<WorkflowResult> {
  const startTime = Date.now();

  console.log('🎯 Starting workflow orchestration...');

  try {
    // STEP 1: Parse lab report (Parser Agent)
    console.log('📄 Step 1/5: Parsing lab report...');
    const parsed = await parseLabReport(imageBase64);

    if (!parsed.markers || parsed.markers.length === 0) {
      throw new Error('No markers could be extracted from the lab report');
    }

    // Normalize marker names
    const normalized = normalizeMarkers(parsed.markers);
    console.log(`✅ Extracted ${normalized.length} markers`);

    // STEP 2: Generate context for each marker (Context Agent)
    console.log('📚 Step 2/5: Generating educational context...');
    const contexts = await Promise.all(
      normalized.map((marker: LabMarker) =>
        generateContextForMarker(marker.name, typeof marker.value === 'number' ? marker.value : undefined)
      )
    );
    console.log(`✅ Generated context for ${contexts.length} markers`);

    // STEP 3: Generate evidence (Evidence Agent)
    console.log('🔬 Step 3/5: Generating evidence and food patterns...');
    const evidence = await Promise.all(
      normalized.map((marker: LabMarker) => generateEvidence(marker.name))
    );
    console.log(`✅ Generated evidence for ${evidence.length} markers`);

    // STEP 4: Generate questions (Questions Agent)
    console.log('❓ Step 4/5: Generating doctor questions...');
    const questions = await generateQuestions(normalized);
    console.log(`✅ Generated ${questions.length} questions`);

    // STEP 5: Safety validation (Safety Agent)
    console.log('🛡️  Step 5/5: Running safety validation...');
    const safetyResults = await validateAllContent(contexts, evidence);
    console.log(`✅ Safety check complete: ${safetyResults.violations} violations found`);

    const processingTime = Date.now() - startTime;
    console.log(`🎉 Workflow complete in ${processingTime}ms`);

    return {
      parsed: {
        ...parsed,
        markers: normalized,
      },
      contexts: safetyResults.contexts,
      evidence: safetyResults.evidence,
      questions,
      safetyChecks: {
        allSafe: safetyResults.allSafe,
        checkedItems: safetyResults.checkedItems,
        violations: safetyResults.violations,
      },
      processingTime,
    };
  } catch (error) {
    console.error('❌ Workflow error:', error);
    throw error;
  }
}

/**
 * Validate all generated content through Safety Agent
 * Returns rewritten copies (avoids mutating input objects)
 */
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
    // whatIsIt
    const w = await rewriteToSafe(context.whatIsIt);
    checkedItems++;
    if (!w.safe) totalViolations += w.violations.length;

    // researchContext
    const r = await rewriteToSafe(context.researchContext);
    checkedItems++;
    if (!r.safe) totalViolations += r.violations.length;

    rewrittenContexts.push({
      ...context,
      whatIsIt: w.rewrittenText || context.whatIsIt,
      researchContext: r.rewrittenText || context.researchContext,
    });
  }

  const rewrittenEvidence: Evidence[] = [];
  for (const ev of evidence) {
    const res = await rewriteToSafe(ev.researchSummary);
    checkedItems++;
    if (!res.safe) totalViolations += res.violations.length;

    rewrittenEvidence.push({
      ...ev,
      researchSummary: res.rewrittenText || ev.researchSummary,
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

/**
 * Process a single marker (for targeted queries)
 */
export async function processMarker(
  markerName: string,
  value?: number
): Promise<{
  context: MarkerContext;
  evidence: Evidence;
  safe: boolean;
}> {
  console.log(`🎯 Processing single marker: ${markerName}`);

  const context = await generateContextForMarker(markerName, value);
  const evidence = await generateEvidence(markerName);

  const safetyResult = await rewriteToSafe(context.whatIsIt);
  const safeContext: MarkerContext = {
    ...context,
    whatIsIt: !safetyResult.safe && safetyResult.rewrittenText ? safetyResult.rewrittenText : context.whatIsIt,
  };

  return {
    context: safeContext,
    evidence,
    safe: safetyResult.safe,
  };
}

/**
 * Batch process multiple markers without image upload
 */
export async function processMarkerBatch(
  markers: LabMarker[]
): Promise<Omit<WorkflowResult, 'parsed'>> {
  const startTime = Date.now();

  console.log(`🎯 Processing batch of ${markers.length} markers...`);

  const normalized = normalizeMarkers(markers);

  const contexts = await Promise.all(
    normalized.map((m: LabMarker) =>
      generateContextForMarker(m.name, typeof m.value === 'number' ? m.value : undefined)
    )
  );

  const evidence = await Promise.all(
    normalized.map((m: LabMarker) => generateEvidence(m.name))
  );

  const questions = await generateQuestions(normalized);

  const safetyResults = await validateAllContent(contexts, evidence);

  return {
    contexts: safetyResults.contexts,
    evidence: safetyResults.evidence,
    questions,
    safetyChecks: {
      allSafe: safetyResults.allSafe,
      checkedItems: safetyResults.checkedItems,
      violations: safetyResults.violations,
    },
    processingTime: Date.now() - startTime,
  };
}
