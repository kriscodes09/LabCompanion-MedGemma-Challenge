import { Evidence } from '../types';
import { getResearchPattern } from './research';
import { getFoodPatterns } from './food-patterns';

export * from './research';
export * from './food-patterns';

export async function generateEvidence(markerName: string): Promise<Evidence> {
  const research = getResearchPattern(markerName);
  const foodPatterns = getFoodPatterns(markerName);
  
  return {
    markerName,
    researchSummary: research.populationFindings,
    foodPatterns: foodPatterns.usda2020Summary,
    usda2020Guidelines: foodPatterns.myPlateGroups.map(g => 
      `${g.name}: ${g.examples.join(', ')}`
    ),
    myPlateGroups: foodPatterns.myPlateGroups.map(g => g.name)
  };
}