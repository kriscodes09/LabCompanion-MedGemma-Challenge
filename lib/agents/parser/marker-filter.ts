import type { LabMarker } from '../types';
import { isSupportedMarker, normalizeMarkerName } from './normalizer';

export type FilterResult = {
  kept: LabMarker[];
  dropped: LabMarker[];
  stats: {
    total: number;
    kept: number;
    dropped: number;
    droppedUnsupported: number;
    droppedGarbage: number;
  };
};

/**
 * Light filter:
 * - Drop obvious OCR garbage
 * - Drop unsupported markers (whitelist)
 * - Keep the stuff you actually handle well
 *
 * This is intentionally conservative for hackathon stability.
 */
export function filterMarkers(markers: LabMarker[]): FilterResult {
  const dropped: LabMarker[] = [];
  const kept: LabMarker[] = [];

  let droppedUnsupported = 0;
  let droppedGarbage = 0;

  for (const m of markers) {
    const rawName = (m?.name ?? '').toString().trim();
    if (!rawName) {
      dropped.push(m);
      droppedGarbage++;
      continue;
    }

    const normalizedName = normalizeMarkerName(rawName);

    // 1) Hard drop obvious garbage names from OCR
    if (looksLikeGarbageMarkerName(rawName)) {
      dropped.push({ ...m, name: normalizedName });
      droppedGarbage++;
      continue;
    }

    // 2) Whitelist: only keep markers we support
    if (!isSupportedMarker(normalizedName)) {
      dropped.push({ ...m, name: normalizedName });
      droppedUnsupported++;
      continue;
    }

    // 3) Value sanity: if numeric is insane, drop (but allow strings)
    if (looksLikeGarbageValue(m.value)) {
      dropped.push({ ...m, name: normalizedName });
      droppedGarbage++;
      continue;
    }

    kept.push({ ...m, name: normalizedName });
  }

  return {
    kept,
    dropped,
    stats: {
      total: markers.length,
      kept: kept.length,
      dropped: dropped.length,
      droppedUnsupported,
      droppedGarbage,
    },
  };
}

/**
 * Heuristics tuned to catch “Nosh Weg Amxlojoield…” style OCR junk.
 * We DO allow normal marker formats and common lab abbreviations.
 */
function looksLikeGarbageMarkerName(name: string): boolean {
  const s = name.trim();

  // too short / too long
  if (s.length < 2) return true;
  if (s.length > 45) return true;

  const lower = s.toLowerCase();

  // common OCR noise tokens
  if (lower === '|' || lower === '||' || lower === '—' || lower === '-' || lower === '.' || lower === ',') return true;

  // must contain at least one letter (reject pure numbers/symbols)
  if (!/[a-zA-Z]/.test(s)) return true;

  // reject if mostly digits/symbols
  const letters = (s.match(/[a-zA-Z]/g) ?? []).length;
  const digits = (s.match(/\d/g) ?? []).length;
  const symbols = (s.match(/[^a-zA-Z0-9\s]/g) ?? []).length;
  const total = s.length;

  // Too many symbols relative to letters
  if (symbols >= 6 && letters <= 2) return true;

  // Almost all digits
  if (digits / total > 0.6) return true;

  // Weird “word salad” that is not a known marker
  // (we’ll still allow short abbreviations like LDL, HDL, AST, ALT, etc.)
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length >= 5) return true;

  // looks like accidental sentence fragment (ends with '=' or contains many '=')
  if ((s.match(/=/g) ?? []).length >= 2) return true;
  if (s.endsWith('=')) return true;

  return false;
}

function looksLikeGarbageValue(value: unknown): boolean {
  // allow strings (some pipelines keep raw string)
  if (typeof value === 'string') {
    // if it’s a string but basically nonsense, drop
    const t = value.trim();
    if (!t) return true;

    // pure OCR garbage number with huge length
    if (/^\d{8,}$/.test(t)) return true;

    // too many letters in the value field
    const letters = (t.match(/[a-zA-Z]/g) ?? []).length;
    if (letters >= 6) return true;

    return false;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return true;

    // Drop obviously insane values (hackathon guardrail)
    // (Keeps normal clinical ranges + common outliers)
    if (value > 1_000_000) return true;
    if (value < -1_000_000) return true;

    return false;
  }

  // unknown type
  return false;
}