// lib/types.ts

export interface LabValue {
  marker: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'low' | 'normal' | 'high';
  confidence: number;
}

export interface MarkerContext {
  marker: string;
  whatIsIt: string;
  whyMeasured: string[];
  researchContext: string;
  sources: string[];
}

export interface QuestionSet {
  aboutResults: string[];
  aboutNextSteps: string[];
  aboutContext: string[];
}