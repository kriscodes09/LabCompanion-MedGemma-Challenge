import type { ParsedLabReport, LabMarker } from '../types';
import { normalizeMarkerName, normalizeUnit, isSupportedMarker } from './normalizer';
import { filterMarkers } from './marker-filter';



export async function parseLabReport(input: string): Promise<ParsedLabReport> {
  try {
    // 1) If someone passed JSON text instead of an image, accept it.
    const jsonParsed = tryParseAsJson(input);
    if (jsonParsed) {
      const rawMarkers = coerceMarkers(jsonParsed.markers ?? []);
      const { kept } = filterMarkers(rawMarkers);

      return {
        markers: kept,
        extractedText: typeof jsonParsed.extractedText === 'string' ? jsonParsed.extractedText : '',
        confidence: typeof jsonParsed.confidence === 'number' ? jsonParsed.confidence : 0.8,
        timestamp: new Date().toISOString(),
      };
    }

    // 2) If input looks like plain text, attempt lightweight parsing.
    if (looksLikeText(input)) {
      const rawMarkers = extractMarkersFromText(input);
      const { kept } = filterMarkers(rawMarkers);

      return {
        markers: kept,
        extractedText: input,
        confidence: kept.length > 0 ? 0.6 : 0.2,
        timestamp: new Date().toISOString(),
      };
    }

    // 3) Otherwise: likely a base64 image string. We don't parse images here.
    return {
      markers: [],
      extractedText: '',
      confidence: 0.1,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Lab report parsing error:', error);
    return {
      markers: [],
      extractedText: '',
      confidence: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Extract ONLY one marker from the input.
 * Works if the input contains plaintext or JSON; otherwise returns null.
 */
export async function extractSingleMarker(input: string, markerName: string): Promise<LabMarker | null> {
  const target = normalizeMarkerName(markerName).toLowerCase();

  const jsonParsed = tryParseAsJson(input);
  if (jsonParsed?.markers) {
    const rawMarkers = coerceMarkers(jsonParsed.markers);
    const { kept } = filterMarkers(rawMarkers);
    const found = kept.find((m) => m.name.toLowerCase() === target);
    return found ?? null;
  }

  if (looksLikeText(input)) {
    const rawMarkers = extractMarkersFromText(input);
    const { kept } = filterMarkers(rawMarkers);
    const found = kept.find((m) => m.name.toLowerCase() === target);
    return found ?? null;
  }

  return null;
}

/** ---------------- Helpers ---------------- */

type JsonObject = Record<string, unknown>;

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function tryParseAsJson(input: string): JsonObject | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('{')) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function looksLikeText(input: string): boolean {
  // Heuristic: if it contains lots of letters/spaces and not base64-ish.
  const trimmed = input.trim();
  if (trimmed.length < 20) return false;

  // base64 images are mostly A-Z a-z 0-9 + / =
  const base64ish = /^[A-Za-z0-9+/=\s]+$/.test(trimmed);
  const hasWords = /[A-Za-z]{3,}/.test(trimmed);

  // If it's base64ish AND has almost no punctuation/newlines, treat as image.
  if (base64ish && !/\n|:|,|\./.test(trimmed)) return false;

  return hasWords;
}

function coerceMarkers(raw: unknown): LabMarker[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(coerceMarker).filter((m): m is LabMarker => Boolean(m && m.name));
}

function coerceMarker(raw: unknown): LabMarker | null {
  if (!isRecord(raw)) return null;

  const nameRaw = raw.name;
  const unitRaw = raw.unit;
  const valueRaw = raw.value;

const name = typeof nameRaw === 'string' ? normalizeMarkerName(nameRaw) : '';
if (!name) return null;

// ✅ Whitelist enforcement
if (!isSupportedMarker(name)) {
  return null;
}


  const value =
    typeof valueRaw === 'number'
      ? valueRaw
      : typeof valueRaw === 'string'
        ? safeNumber(valueRaw)
        : undefined;

  const unit = typeof unitRaw === 'string' ? normalizeUnit(unitRaw) : '';

  const referenceRange = coerceReferenceRange(raw.referenceRange, unit);

  const flagged =
    typeof raw.flagged === 'boolean'
      ? raw.flagged
      : inferFlagged(typeof value === 'number' ? value : undefined, referenceRange?.low, referenceRange?.high);

  return {
    name,
    value: value ?? (typeof valueRaw === 'string' ? valueRaw : ''),
    unit,
    referenceRange,
    flagged,
  };
}

function coerceReferenceRange(raw: unknown, fallbackUnit: string): LabMarker['referenceRange'] | undefined {
  if (!isRecord(raw)) return undefined;

  const low = typeof raw.low === 'number' ? raw.low : safeNumber(raw.low);
  const high = typeof raw.high === 'number' ? raw.high : safeNumber(raw.high);
  const unit = typeof raw.unit === 'string' ? normalizeUnit(raw.unit) : fallbackUnit;

  // ✅ allow partial ranges (low-only OR high-only)
  if (typeof low !== 'number' && typeof high !== 'number') return undefined;

  return { low, high, unit };
}

/**
 * Very lightweight plaintext extraction.
 * Supports lines like:
 * Hemoglobin 14.2 g/dL (12.0-16.0)
 * LDL Cholesterol: 120 mg/dL
 */
function extractMarkersFromText(text: string): LabMarker[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const markers: LabMarker[] = [];

  for (const line of lines) {
    // Try: "Name: value unit"
    const m1 = line.match(/^([A-Za-z][A-Za-z0-9\s()%.-]{1,60})[:\s]+(-?\d+(\.\d+)?)\s*([A-Za-zμ/%]+)?/);
    if (!m1) continue;

    const rawName = m1[1].trim();
    const value = Number(m1[2]);
    const unit = m1[4] ? normalizeUnit(m1[4]) : '';

    // Try to parse range "(low-high)" anywhere
    const rangeMatch = line.match(/\(?\s*(-?\d+(\.\d+)?)\s*[-–]\s*(-?\d+(\.\d+)?)\s*\)?/);
    const low = rangeMatch ? Number(rangeMatch[1]) : undefined;
    const high = rangeMatch ? Number(rangeMatch[3]) : undefined;

    const name = normalizeMarkerName(rawName);
    const flagged = inferFlagged(value, low, high);

    markers.push({
      name,
      value,
      unit,
      referenceRange: low !== undefined && high !== undefined ? { low, high, unit } : undefined,
      flagged,
    });
  }

  return markers;
}

function safeNumber(v: unknown): number | undefined {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v !== 'string') return undefined;

  const n = Number(v.replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function inferFlagged(value?: number, low?: number, high?: number): boolean {
  if (value === undefined) return false;
  if (low !== undefined && value < low) return true;
  if (high !== undefined && value > high) return true;
  return false;
}