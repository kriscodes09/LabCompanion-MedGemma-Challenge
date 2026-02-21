import { LabMarker } from '../types';

const MARKER_NORMALIZATIONS: Record<string, string> = {
  'hgb': 'Hemoglobin',
  'hb': 'Hemoglobin',
  'hemoglobin': 'Hemoglobin',
  'a1c': 'Hemoglobin A1C',
  'hba1c': 'Hemoglobin A1C',
  'hb a1c': 'Hemoglobin A1C',
  'hemoglobin a1c': 'Hemoglobin A1C', 
  'chol': 'Total Cholesterol',
  'cholesterol': 'Total Cholesterol',
  'total cholesterol': 'Total Cholesterol', 
  'ldl': 'LDL Cholesterol',
  'ldl cholesterol': 'LDL Cholesterol', 
  'hdl': 'HDL Cholesterol',
  'hdl cholesterol': 'HDL Cholesterol', 
  'triglycerides': 'Triglycerides',
  'trig': 'Triglycerides',
  'glucose': 'Glucose',
  'glu': 'Glucose',
  'creat': 'Creatinine',
  'creatinine': 'Creatinine',
  'bun': 'Blood Urea Nitrogen',
  'blood urea nitrogen': 'Blood Urea Nitrogen', 
  'egfr': 'eGFR',
  'gfr': 'eGFR', 
  'alt': 'ALT',
  'ast': 'AST',
  'alp': 'Alkaline Phosphatase',
  'alkaline phosphatase': 'Alkaline Phosphatase', 
  'bili': 'Bilirubin',
  'bilirubin': 'Bilirubin', 
  'wbc': 'White Blood Cells',
  'white blood cells': 'White Blood Cells', 
  'rbc': 'Red Blood Cells',
  'red blood cells': 'Red Blood Cells', 
  'plt': 'Platelets',
  'platelets': 'Platelets', 
  'hct': 'Hematocrit',
  'hematocrit': 'Hematocrit', 
  'mcv': 'Mean Corpuscular Volume',
  'mean corpuscular volume': 'Mean Corpuscular Volume', 
  'mch': 'MCH', 
  'mchc': 'MCHC', 
  'rdw': 'RDW', 
  'na': 'Sodium',
  'sodium': 'Sodium', 
  'k': 'Potassium',
  'potassium': 'Potassium', 
  'cl': 'Chloride',
  'chloride': 'Chloride', 
  'ca': 'Calcium',
  'calcium': 'Calcium',
  'tsh': 'TSH',
  't4': 'T4',
  'vit d': 'Vitamin D',
  'vitamin d': 'Vitamin D', 
  'b12': 'Vitamin B12',
  'vitamin b12': 'Vitamin B12', 
  'folate': 'Folate',
  'iron': 'Iron',
  'ferritin': 'Ferritin',
};

export function normalizeMarkerName(name: string): string {
  const cleaned = name.toLowerCase().trim();
  return MARKER_NORMALIZATIONS[cleaned] || capitalizeWords(name);
}

export function normalizeMarkers(markers: LabMarker[]): LabMarker[] {
  return markers.map(marker => ({
    ...marker,
    name: normalizeMarkerName(marker.name)
  }));
}

export function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'g/dl': 'g/dL',
    'mg/dl': 'mg/dL',
    'mmol/l': 'mmol/L',
    'umol/l': 'μmol/L',
    'ng/ml': 'ng/mL',
    'pg/ml': 'pg/mL',
    'ml/min': 'mL/min',
    'iu/l': 'IU/L',
    'u/l': 'U/L',
  };
  
  const lower = unit.toLowerCase().trim();
  return unitMap[lower] || unit;
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function isSupportedMarker(markerName: string): boolean {
  const normalized = normalizeMarkerName(markerName);
  const supportedMarkers = [
    'Hemoglobin', 'Hematocrit', 'White Blood Cells', 'Red Blood Cells',
    'Platelets', 'Mean Corpuscular Volume', 'MCH', 'MCHC', 'RDW', // ADD MCH, MCHC, RDW
    'Glucose', 'Hemoglobin A1C', 'Creatinine', 'Blood Urea Nitrogen', 
    'eGFR', 'Sodium', 'Potassium', 'Calcium', 'Chloride', 
    'Total Cholesterol', 'LDL Cholesterol', 'HDL Cholesterol', 
    'Triglycerides', 'ALT', 'AST', 'Alkaline Phosphatase',
    'Bilirubin', 'TSH', 'T4', 'Vitamin D', 'Vitamin B12', 'Folate',
    'Ferritin', 'Iron'
  ];
  
  return supportedMarkers.includes(normalized);
}