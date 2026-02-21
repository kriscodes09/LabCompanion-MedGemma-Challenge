import type { Question, LabMarker } from '../types';
import { QUESTION_TEMPLATES, QuestionCategory } from './templates';

/**
 * Questions Agent
 * Generates patient-friendly questions.
 */
export async function generateQuestions(markers: LabMarker[]): Promise<Question[]> {
  const templateQuestions = generateTemplateQuestions(markers);

  // Deduplicate and return top 10
  const deduped = dedupeQuestions(templateQuestions);
  return deduped.slice(0, 10);
}

function generateTemplateQuestions(markers: LabMarker[]): Question[] {
  const questions: Question[] = [];

  markers.forEach((marker, idx) => {
    // Medical meaning
    questions.push({
      id: `q-medical-${idx}`,
      text: `What does my ${marker.name} level mean for my overall health?`,
      category: 'medical',
      relevantMarkers: [marker.name],
    });

    // Clarification for flagged values
    if (marker.flagged) {
      questions.push({
        id: `q-clarification-${idx}`,
        text: `My ${marker.name} result looks flagged. What are the most common reasons for this, and how urgent is it?`,
        category: 'clarification',
        relevantMarkers: [marker.name],
      });

      // Diet (only if flagged)
      questions.push({
        id: `q-dietary-${idx}`,
        text: `Are there foods or eating patterns that could influence my ${marker.name}?`,
        category: 'dietary',
        relevantMarkers: [marker.name],
      });
    }

    // Lifestyle
    questions.push({
      id: `q-lifestyle-${idx}`,
      text: `What lifestyle factors (sleep, stress, exercise) could affect my ${marker.name}?`,
      category: 'lifestyle',
      relevantMarkers: [marker.name],
    });

    // Follow-up / next steps
    questions.push({
      id: `q-followup-${idx}`,
      text: `Do I need a repeat test or any follow-up labs for my ${marker.name}, and when?`,
      category: 'clarification',
      relevantMarkers: [marker.name],
    });
  });

  // Comparison question if multiple markers
  if (markers.length >= 2) {
    questions.push({
      id: 'q-comparison-1',
      text: `Do any of my results (like ${markers[0].name} and ${markers[1].name}) relate to each other or point to the same issue?`,
      category: 'clarification',
      relevantMarkers: [markers[0].name, markers[1].name],
    });
  }

  // Prioritization question if many markers
  if (markers.length >= 3) {
    const flagged = markers.filter((m) => m.flagged).map((m) => m.name);
    questions.push({
      id: 'q-priorities-1',
      text: flagged.length
        ? `Of my flagged results (${flagged.slice(0, 3).join(', ')}${flagged.length > 3 ? ', …' : ''}), what should we focus on first and why?`
        : `Which of my results should we focus on first, and why?`,
      category: 'clarification',
      relevantMarkers: flagged.length ? flagged : markers.map((m) => m.name),
    });
  }

  return questions;
}

function dedupeQuestions(questions: Question[]): Question[] {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = q.text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function generateQuestionForMarker(
  markerName: string,
  category: QuestionCategory
): Question {
  const templates = QUESTION_TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    id: `q-${category}-${markerName}-${Date.now()}`,
    text: template.replace('{marker}', markerName),
    category,
    relevantMarkers: [markerName],
  };
}
