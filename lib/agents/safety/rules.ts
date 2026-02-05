export const SAFETY_VIOLATIONS = {
  MEDICAL_ADVICE: {
    name: 'Medical Advice',
    patterns: [
      /you should (see|talk to|consult|visit|contact)/i,
      /you need to (see|talk to|consult|visit|contact)/i,
      /you must (see|talk to|consult|visit|contact)/i,
      /I recommend that you/i,
      /my recommendation is/i,
      /I suggest you/i,
    ],
    severity: 'HIGH',
    description: 'Provides direct medical advice to the user'
  },
  
  DIAGNOSIS: {
    name: 'Diagnosis',
    patterns: [
      /you have (diabetes|anemia|disease|condition|cancer|infection)/i,
      /this means you (have|are|suffer from)/i,
      /you are (diabetic|anemic|sick|ill)/i,
      /this indicates (that you|you have)/i,
      /you've been diagnosed/i,
      /your diagnosis is/i,
    ],
    severity: 'CRITICAL',
    description: 'Provides or implies a medical diagnosis'
  },
  
  PRESCRIPTIVE: {
    name: 'Prescriptive Language',
    patterns: [
      /you should eat/i,
      /you must (eat|drink|avoid|stop|start)/i,
      /you need to (increase|decrease|change|add|remove)/i,
      /avoid (eating|drinking)/i,
      /stop (eating|drinking|taking)/i,
    ],
    severity: 'MEDIUM',
    description: 'Tells user what to do with their diet or lifestyle'
  },
  
  CERTAINTY: {
    name: 'False Certainty',
    patterns: [
      /this definitely means/i,
      /you certainly have/i,
      /this always indicates/i,
      /you will (get|develop|have)/i,
      /this proves/i,
      /without a doubt/i,
    ],
    severity: 'HIGH',
    description: 'Makes definitive claims about health conditions'
  },
  
  TREATMENT: {
    name: 'Treatment Recommendation',
    patterns: [
      /take (this|these|a|an) (medication|supplement|drug|pill|medicine)/i,
      /start (taking|using) (medication|supplement|drug)/i,
      /treatment (for you|is|should be)/i,
      /prescribed (medication|drug|treatment)/i,
    ],
    severity: 'CRITICAL',
    description: 'Recommends specific medical treatments'
  },

  PERSONAL_ASSESSMENT: {
    name: 'Personal Health Assessment',
    patterns: [
      /your (health|condition|situation) is/i,
      /you're (healthy|unhealthy|sick|fine)/i,
      /based on your results, you/i,
    ],
    severity: 'HIGH',
    description: 'Makes personal health assessments'
  }
};

export type ViolationType = keyof typeof SAFETY_VIOLATIONS;
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';