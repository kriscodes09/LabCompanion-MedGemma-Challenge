import { getMedGemmaContent } from '../context/loader';

export interface ResearchPattern {
  markerName: string;
  populationFindings: string;
  studyTypes: string[];
  keyFactors: string[];
}

export function getResearchPattern(markerName: string): ResearchPattern {
  try {
    const content = getMedGemmaContent(markerName);
    
    // Extract research context from MedGemma
    const researchText = content.researchContext;
    
    // Parse out key information (simple version)
    const studyTypes = extractStudyTypes(researchText);
    const keyFactors = extractKeyFactors(researchText);
    
    return {
      markerName,
      populationFindings: researchText,
      studyTypes,
      keyFactors
    };
    
  } catch (error) {
    console.error(`Error getting research for ${markerName}:`, error);
    
    return {
      markerName,
      populationFindings: 'Research discusses various factors that may influence this marker.',
      studyTypes: ['Population studies', 'Clinical research'],
      keyFactors: []
    };
  }
}

function extractStudyTypes(text: string): string[] {
  const types: string[] = [];
  
  if (/population/i.test(text)) types.push('Population studies');
  if (/clinical/i.test(text)) types.push('Clinical research');
  if (/longitudinal/i.test(text)) types.push('Longitudinal studies');
  if (/meta-analysis/i.test(text)) types.push('Meta-analyses');
  if (/randomized/i.test(text)) types.push('Randomized controlled trials');
  
  return types.length > 0 ? types : ['General research'];
}

function extractKeyFactors(text: string): string[] {
  const factors: string[] = [];
  
  // Common factors mentioned in research
  if (/diet/i.test(text)) factors.push('Diet');
  if (/exercise|physical activity/i.test(text)) factors.push('Physical activity');
  if (/genetic/i.test(text)) factors.push('Genetics');
  if (/age/i.test(text)) factors.push('Age');
  if (/lifestyle/i.test(text)) factors.push('Lifestyle');
  if (/environment/i.test(text)) factors.push('Environmental factors');
  
  return factors;
}