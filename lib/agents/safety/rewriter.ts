import { detectViolations, getSafetyScore } from './detector';
import type { SafetyCheckResult } from '../types';

/**
 * LLM-free safety rewriter
 * - Uses deterministic string/regex transforms to remove prescriptive/diagnostic language
 * - Re-checks violations after rewrite
 * - Falls back to a safe generic message if still unsafe
 */
export async function rewriteToSafe(unsafeText: string): Promise<SafetyCheckResult> {
  const originalViolations = detectViolations(unsafeText);

  if (originalViolations.length === 0) {
    return {
      safe: true,
      originalText: unsafeText,
      rewrittenText: null,
      violations: [],
      reasoning: 'No safety violations detected. Text is safe.',
      score: 100,
    };
  }

  // Rewrite using deterministic transforms
  const rewritten = applySafetyTransforms(unsafeText);

  // Re-check
  const rewriteViolations = detectViolations(rewritten);
  const { score } = getSafetyScore(rewritten);

  if (rewriteViolations.length > 0) {
    const fallback = generateFallbackText();

    return {
      safe: false,
      originalText: unsafeText,
      rewrittenText: fallback,
      violations: originalViolations,
      reasoning: `Detected ${originalViolations.length} violation(s). Rule-based rewrite still unsafe; used fallback.`,
      score,
    };
  }

  return {
    safe: false,
    originalText: unsafeText,
    rewrittenText: rewritten,
    violations: originalViolations,
    reasoning: `Detected ${originalViolations.length} violation(s). Rewritten using rule-based safety transforms.`,
    score,
  };
}

/**
 * Core rewrite logic: removes "you should/need/must", diagnosis-y certainty,
 * prescriptive diet language, and treatment recommendations.
 *
 * Keep it educational and population-level.
 */
function applySafetyTransforms(text: string): string {
  let t = text;

  // 1) Replace directive language → discussion framing
  t = t.replace(/\byou should\b/gi, 'People often discuss this with their healthcare provider');
  t = t.replace(/\byou need to\b/gi, 'It may be helpful to discuss this with your healthcare provider');
  t = t.replace(/\byou must\b/gi, 'It’s best to discuss this with your healthcare provider');

  // 2) Replace recommendations by the assistant
  t = t.replace(/\bI recommend that you\b/gi, 'A healthcare provider can help you decide whether to');
  t = t.replace(/\bmy recommendation is\b/gi, 'A common next step is to discuss');
  t = t.replace(/\bI suggest you\b/gi, 'Some people choose to discuss');

  // 3) Diagnosis phrasing → association phrasing
  t = t.replace(/\byou have\b/gi, 'this can be associated with');
  t = t.replace(/\bthis means you (have|are|suffer from)\b/gi, 'this may be associated with');
  t = t.replace(/\bthis indicates (that you|you have)\b/gi, 'this may be seen in');
  t = t.replace(/\byour diagnosis is\b/gi, 'only a clinician can determine a diagnosis; this result may be seen in');
  t = t.replace(/\byou are (diabetic|anemic|sick|ill)\b/gi, 'some people with certain conditions may show similar patterns');

  // 4) Remove false certainty
  t = t.replace(/\bthis definitely means\b/gi, 'this may suggest');
  t = t.replace(/\byou certainly have\b/gi, 'this can sometimes be associated with');
  t = t.replace(/\bthis always indicates\b/gi, 'this can be associated with');
  t = t.replace(/\bthis proves\b/gi, 'this may be consistent with');
  t = t.replace(/\bwithout a doubt\b/gi, 'in some cases');

  // 5) Prescriptive diet/lifestyle commands → neutral pattern language
  t = t.replace(/\byou should eat\b/gi, 'Research often discusses dietary patterns that include');
  t = t.replace(/\byou must (eat|drink|avoid|stop|start)\b/gi, 'Research sometimes examines patterns related to');
  t = t.replace(/\byou need to (increase|decrease|change|add|remove)\b/gi, 'A healthcare provider may discuss whether it makes sense to adjust');
  t = t.replace(/\bavoid (eating|drinking)\b/gi, 'Some research discusses limiting');
  t = t.replace(/\bstop (eating|drinking|taking)\b/gi, 'It may be worth discussing changes to');

  // 6) Treatment recommendations → clinician framing
  t = t.replace(/\btake (this|these|a|an) (medication|supplement|drug|pill|medicine)\b/gi,
    'Only a clinician can recommend medications or supplements');
  t = t.replace(/\bstart (taking|using) (medication|supplement|drug)\b/gi,
    'Only a clinician can recommend starting medications or supplements');
  t = t.replace(/\btreatment (for you|is|should be)\b/gi,
    'Treatment decisions depend on your full clinical picture and should be discussed with a clinician');
  t = t.replace(/\bprescribed (medication|drug|treatment)\b/gi,
    'Clinicians may prescribe treatments depending on context');

  // 7) Personal assessment → neutral
  t = t.replace(/\byour (health|condition|situation) is\b/gi, 'Health situations can vary; this pattern may be discussed as');
  t = t.replace(/\byou're (healthy|unhealthy|sick|fine)\b/gi, 'Health status depends on many factors; lab values are one piece of information');
  t = t.replace(/\bbased on your results, you\b/gi, 'Based on these results, it may be useful to discuss with your clinician whether you');

  // Optional: ensure a gentle safety sentence exists
  if (!/consult your healthcare provider|discuss with your healthcare provider|clinician/i.test(t)) {
    t = `${t.trim()} Discuss these results with your healthcare provider for interpretation in context.`;
  }

  return t.trim();
}

function generateFallbackText(): string {
  return (
    'This information is educational only and describes general, population-level patterns. ' +
    'Lab results should be interpreted by a healthcare professional in the context of your full medical history, symptoms, and other tests. ' +
    'If you have questions about your results or next steps, discuss them with your healthcare provider.'
  );
}
