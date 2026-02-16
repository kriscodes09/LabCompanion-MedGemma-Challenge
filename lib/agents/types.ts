// Shared types across all agents

export interface LabReferenceRange {
  low?: number;
  high?: number;
  unit?: string;
}

export interface LabMarker {
  name: string;
  value?: number | string;
  unit?: string;
  referenceRange?: LabReferenceRange;
  flagged?: boolean;
  confidence?: number; // extraction confidence (0–1)
}
export interface ParseQualitySummary {
  score: number;          // 0–100
  warnings: string[];     // human-readable
}

export interface ParsedLabReport {
  markers: LabMarker[];
  extractedText: string;
  confidence: number; // overall parse confidence (0–1)
  timestamp: string;
}

export interface MarkerContext {
  markerName: string;
  whatIsIt: string;
  whyMeasured?: string[];
  researchContext: string;
  foodPatterns?: string;
  generatedBy: string;
  generatedAt?: string;
  disclaimer?: string;
}

export interface Evidence {
  markerName: string;
  researchSummary: string;
  foodPatterns: string;
  usda2020Guidelines: string[];
  myPlateGroups: string[];
}

export type QuestionCategory = 'medical' | 'lifestyle' | 'dietary' | 'clarification';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  relevantMarkers: string[];
}

export interface SafetyCheckResult {
  safe: boolean;
  originalText: string;
  rewrittenText: string | null;
  violations: SafetyViolation[];
  reasoning: string;
  score: number;
}

export interface SafetyViolation {
  type: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  match: string;
  position: number;
  description: string;
}

export interface WorkflowSafetySummary {
  allSafe: boolean;
  checkedItems: number;
  violations: number;
}

export interface AgentLogItem {
  agent: string;
  status: 'ok' | 'warn' | 'error';
  ms?: number;
  message?: string;
}
export type ParseQuality = {
  score: number;      // 0–100
  warnings: string[]; // human tips when OCR looks sketchy
};

export interface WorkflowResult {
  parsed: ParsedLabReport;
  contexts: MarkerContext[];
  evidence: Evidence[];
  questions: Question[];
  safetyChecks: WorkflowSafetySummary;
  processingTime: number;

  // ✅ NEW (optional, non-breaking)
  warnings?: string[];

  // ✅ NEW (optional, non-breaking)
  agentLog?: AgentLogItem[];
  parseQuality?: ParseQualitySummary;
  
}

