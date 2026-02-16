// lib/agents/evidence/research.ts
import { getMedGemmaContent } from '../context/loader';

export interface ResearchPattern {
  markerName: string;
  populationFindings: string;
  source: 'medgemma_offline' | 'fallback';
}

export function getResearchPattern(markerName: string): ResearchPattern {
  const ctx = getMedGemmaContent(markerName);

  const source: 'medgemma_offline' | 'fallback' =
    ctx.generatedBy === 'Fallback' ? 'fallback' : 'medgemma_offline';

  const text =
    ctx.researchContext && ctx.researchContext.trim().length > 0
      ? ctx.researchContext
      : 'No offline research context available for this marker yet.';

  return {
    markerName,
    populationFindings: text,
    source,
  };
}
