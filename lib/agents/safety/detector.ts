import { SAFETY_VIOLATIONS, ViolationType, Severity } from './rules';
import { SafetyViolation } from '../types';

export function detectViolations(text: string): SafetyViolation[] {
  const violations: SafetyViolation[] = [];
  
  for (const [key, rule] of Object.entries(SAFETY_VIOLATIONS)) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        violations.push({
          type: key as ViolationType,
          name: rule.name,
          severity: rule.severity as Severity,
          match: match[0],
          position: match.index || 0,
          description: rule.description
        });
      }
    }
  }
  
  // Sort by severity (CRITICAL first)
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  violations.sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  );
  
  return violations;
}

export function isSafe(text: string): boolean {
  const violations = detectViolations(text);
  return violations.length === 0;
}

export function getSafetyScore(text: string): {
  score: number;
  safe: boolean;
  violations: SafetyViolation[];
} {
  const violations = detectViolations(text);
  
  // Score: 100 = perfect, -10 per CRITICAL, -5 per HIGH, -3 per MEDIUM, -1 per LOW
  let score = 100;
  violations.forEach(v => {
    if (v.severity === 'CRITICAL') score -= 10;
    else if (v.severity === 'HIGH') score -= 5;
    else if (v.severity === 'MEDIUM') score -= 3;
    else score -= 1;
  });
  
  return {
    score: Math.max(0, score),
    safe: violations.length === 0,
    violations
  };
}