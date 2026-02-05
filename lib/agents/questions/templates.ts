// lib/agents/questions/templates.ts

export type QuestionCategory = 'medical' | 'lifestyle' | 'dietary' | 'clarification';

export const QUESTION_TEMPLATES: Record<QuestionCategory, string[]> = {
  medical: [
    'What does my {marker} result mean in plain language?',
    'What are the most common reasons {marker} can be high or low?',
    'Is {marker} something that tends to fluctuate day to day, or is it usually stable?',
    'How does {marker} relate to the body system it’s measuring?',
  ],
  lifestyle: [
    'What lifestyle factors (sleep, stress, exercise) can affect {marker}?',
    'Could dehydration, illness, or recent activity influence {marker}?',
    'Are there habits that are commonly associated with changes in {marker} over time?',
  ],
  dietary: [
    'What food patterns do studies commonly discuss in relation to {marker}?',
    'Are there dietary factors that are often linked with {marker} in research?',
    'Should I discuss my current eating patterns with you or a registered dietitian in relation to {marker}?',
  ],
  clarification: [
    'Do I need a repeat test for {marker} to confirm this result?',
    'Are there any follow-up labs you recommend to better understand {marker}?',
    'How should we interpret {marker} in the context of my other results?',
    'Do my symptoms (if any) change how you interpret {marker}?',
  ],
};
