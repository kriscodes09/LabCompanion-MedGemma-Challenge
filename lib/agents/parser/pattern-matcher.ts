// lib/agents/parser/pattern-matcher.ts

export interface ParsedMarker {
  name: string;
  value: number;
  unit: string;
  referenceRange?: {
    low?: number;
    high?: number;
    unit: string;
  };
  status: 'low' | 'normal' | 'high';
}

/**
 * Parse lab report OCR text and extract structured marker data
 * Handles multiple formats:
 * 1. Table format: "Hemoglobin 7.2 H % 4.0-5.6"
 * 2. Inline format: "Hemoglobin 13.1 g/dL 13.0-17.7"
 * 3. Flagged format: "RBC 4.11 Low x10E6/uLs 4.14-5.80"
 */
export function parseLabText(text: string): ParsedMarker[] {
  console.log('🔍 Parsing lab text...');

  const lines = text.split('\n');
  const markers: ParsedMarker[] = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and headers
    if (!line || shouldSkipLine(line)) continue;

    // Try to parse the line
    const marker = parseLineAsMarker(line);

    if (marker) {
      const key = marker.name.toLowerCase();
      if (!seenNames.has(key)) {
        markers.push(marker);
        seenNames.add(key);
        console.log(`✓ Found: ${marker.name} = ${marker.value} ${marker.unit} (${marker.status})`);
      }
    }
  }

  console.log(`✅ Total markers found: ${markers.length}`);
  return markers;
}

/**
 * Try to parse a single line as a marker */
function parseLineAsMarker(line: string): ParsedMarker | null {
  const tokens = line.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length < 2) return null;

  // Find numeric value token
  let valueIndex = -1;
  let value = 0;

  for (let i = 0; i < tokens.length; i++) {
    const num = parseFloat(tokens[i]);
    if (!Number.isNaN(num) && tokens[i].match(/^-?\d+\.?\d*$/)) {
      valueIndex = i;
      value = num;
      break;
    }
  }

  if (valueIndex <= 0) return null;

  // Marker name
  const nameParts = tokens.slice(0, valueIndex);
  const rawName = nameParts.join(' ').trim();

  // reject obviously-non-marker “names”
  if (!isValidMarkerName(rawName)) return null;

  // Tokens after the value
  const afterValue = tokens.slice(valueIndex + 1);

  // Flag detection
  let flag: 'H' | 'L' | null = null;
  let flagIndex = -1;

  for (let i = 0; i < afterValue.length; i++) {
    const token = afterValue[i].toUpperCase();
    if (token === 'H' || token === 'HIGH') {
      flag = 'H';
      flagIndex = i;
      break;
    }
    if (token === 'L' || token === 'LOW') {
      flag = 'L';
      flagIndex = i;
      break;
    }
  }

  // Unit detection
  let unit = '';
  let unitIndex = 0;

  if (flagIndex === 0) {
    unit = afterValue[1] || '';
    unitIndex = 1;
  } else {
    unit = afterValue[0] || '';
    unitIndex = 0;
  }

  unit = unit.replace(/[,;]/g, '').trim();
  if (!unit) unit = 'units';

  // reject obvious metadata “units”
  if (!isValidUnit(unit)) return null;

  // Reference range
  let referenceRange: ParsedMarker['referenceRange'] = undefined;

  const rangeTokens = afterValue
    .slice(unitIndex + 1)
    .filter((t) => {
      const up = t.toUpperCase();
      return up !== 'H' && up !== 'L' && up !== 'HIGH' && up !== 'LOW';
    });

  // Parse ranges: "4.0-5.6", "<200", "≤200", ">40", "≥40"
  for (const rawToken of rangeTokens) {
    const token = rawToken.replace(/[–—]/g, '-').trim();

    // "4.0-5.6"
    const rangeMatch = token.match(/^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)$/);
    if (rangeMatch) {
      referenceRange = {
        low: parseFloat(rangeMatch[1]),
        high: parseFloat(rangeMatch[2]),
        unit,
      };
      break;
    }

    // "<200" or "≤200"
    const ltMatch = token.match(/^(<|≤)\s*(\d+\.?\d*)$/);
    if (ltMatch) {
      referenceRange = {
        high: parseFloat(ltMatch[2]),
        unit,
      };
      break;
    }

    // ">40" or "≥40"
    const gtMatch = token.match(/^(>|≥)\s*(\d+\.?\d*)$/);
    if (gtMatch) {
      referenceRange = {
        low: parseFloat(gtMatch[2]),
        unit,
      };
      break;
    }
  }

  // Status
  let status: 'low' | 'normal' | 'high' = 'normal';

  if (flag === 'H') status = 'high';
  else if (flag === 'L') status = 'low';
  else if (referenceRange) {
    if (typeof referenceRange.low === 'number' && value < referenceRange.low) status = 'low';
    else if (typeof referenceRange.high === 'number' && value > referenceRange.high) status = 'high';
  }

  return { name: rawName, value, unit, referenceRange, status };
}

/**
 * Validate marker “name” so metadata doesn’t slip through
 */
function isValidMarkerName(name: string): boolean {
  const n = name.trim();
  if (n.length < 2 || n.length > 40) return false;

  const lower = n.toLowerCase();

  // If it contains ":" it's almost always a label like "Phone:" "Acct:"
  if (n.includes(':')) return false;

  // Too many digits = likely an ID
  const digitCount = (n.match(/\d/g) ?? []).length;
  if (digitCount >= 3) return false;

  
  if (n.match(/\(\d{3}\)\s*\d{3}-\d{4}/) || n.match(/\d{3}-\d{3}-\d{4}/)) return false;

  // Common metadata keywords
  const banned = [
    'specimen',
    'specimenid',
    'accession',
    'acct',
    'account',
    'phone',
    'fax',
    'control',
    'patient',
    'provider',
    'physician',
    'doctor',
    'ordered',
    'collected',
    'received',
    'reported',
    'laboratory',
    'labcorp',
    'quest',
    'billing',
    'client',
    'address',
    'insurance',
    'status',
    'interpretation',
    'page',
  ];
  if (banned.some((k) => lower.includes(k))) return false;

  // Names that are basically gibberish punctuation
  if (n.replace(/[a-z0-9\s]/gi, '').length > 6) return false;

  return true;
}

/**
 * validate unit so metadata doesn’t slip through as “units”
 */
function isValidUnit(unit: string): boolean {
  const u = unit.trim().toLowerCase();
  if (!u) return false;

  // Common bad units from metadata labels
  const banned = ['phone', 'acct', 'account', 'specimen', 'control', 'id', 'rte', 'professional'];
  if (banned.some((b) => u.includes(b))) return false;

  return true;
}

/**
 * Checks if a line should be skipped */
function shouldSkipLine(line: string): boolean {
  const lower = line.toLowerCase();

  if (
    lower.includes('test name') ||
    lower.includes('result') ||
    lower.includes('reference') ||
    lower.includes('flag') ||
    lower.includes('units') ||
    lower.includes('interval')
  ) {
    return true;
  }

  if (
    lower.includes('patient') ||
    lower.includes('dob') ||
    lower.includes('collected') ||
    lower.includes('reported') ||
    lower.includes('physician') ||
    lower.includes('laboratory') ||
    lower.includes('gender') ||
    lower.includes('received') ||
    lower.includes('electronically') ||
    lower.includes('interpretation') ||
    lower.includes('page ') ||
    lower.includes('status')
  ) {
    return true;
  }

  // All-caps header lines (no digits)
  if (line === line.toUpperCase() && !line.match(/\d/)) return true;

  return false;
}