'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AgentDashboard from '@/components/agent-dashboard';

import { generatePDFReport } from '@/lib/export/pdf-generator';
import type { ExportMarker } from '@/lib/export/pdf-generator';
import type { WorkflowResult, LabMarker } from '@/lib/agents/types';

type RefRange = ExportMarker['referenceRange'];

type ExtractedMarker = {
  name: string;
  value: number;
  unit: string;
  referenceRange?: RefRange;
  status: 'low' | 'normal' | 'high';
};

type MarkerContextLike = {
  markerName?: string;
  marker?: string; // older shape support
  whatIsIt: string;
  researchContext: string;
  foodPatterns?: string;
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function computeStatus(marker: LabMarker, numericValue: number): 'low' | 'normal' | 'high' {
  const rr = marker.referenceRange;

  if (rr) {
    if (typeof rr.low === 'number' && numericValue < rr.low) return 'low';
    if (typeof rr.high === 'number' && numericValue > rr.high) return 'high';
  }

  return marker.flagged ? 'high' : 'normal';
}

function formatRange(rr?: RefRange, fallbackUnit?: string): string {
  if (!rr) return 'N/A';

  const unit = rr.unit ?? fallbackUnit ?? '';
  const hasLow = typeof rr.low === 'number';
  const hasHigh = typeof rr.high === 'number';

  if (hasLow && hasHigh) return `${rr.low}–${rr.high}${unit ? ` ${unit}` : ''}`.trim();
  if (hasLow) return `≥ ${rr.low}${unit ? ` ${unit}` : ''}`.trim();
  if (hasHigh) return `≤ ${rr.high}${unit ? ` ${unit}` : ''}`.trim();
  return 'N/A';
}

export default function ResultsPage() {
  const router = useRouter();

  const [session, setSession] = useState<WorkflowResult | null>(null);
  const [markers, setMarkers] = useState<ExtractedMarker[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('analysisSession');
    if (!data) return;

    try {
      const parsedSession = JSON.parse(data) as WorkflowResult;
      setSession(parsedSession);

      const sessionMarkers: LabMarker[] = parsedSession.parsed?.markers ?? [];

      const derived: ExtractedMarker[] = sessionMarkers
        .map((m): ExtractedMarker | null => {
          const numericValue = toNumber(m.value);
          if (numericValue === null) return null;

          const unit = m.unit ?? '';
          const status = computeStatus(m, numericValue);

          const low = m.referenceRange?.low;
          const high = m.referenceRange?.high;

          const rr: RefRange =
            typeof low === 'number' || typeof high === 'number'
              ? {
                  ...(typeof low === 'number' ? { low } : {}),
                  ...(typeof high === 'number' ? { high } : {}),
                  unit: m.referenceRange?.unit ?? unit,
                }
              : undefined;

          return {
            name: m.name,
            value: numericValue,
            unit,
            referenceRange: rr,
            status,
          };
        })
        .filter((x): x is ExtractedMarker => x !== null);

      setMarkers(derived);
    } catch (e) {
      console.error('Failed to parse analysisSession:', e);
      setSession(null);
      setMarkers([]);
    }
  }, []);

  const lowMarkers = useMemo(() => markers.filter((m) => m.status === 'low'), [markers]);
  const normalMarkers = useMemo(() => markers.filter((m) => m.status === 'normal'), [markers]);
  const highMarkers = useMemo(() => markers.filter((m) => m.status === 'high'), [markers]);

  const getStatusColor = (status: ExtractedMarker['status']) => {
    switch (status) {
      case 'low':
        return 'border-red-300 bg-red-50';
      case 'high':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-green-300 bg-green-50';
    }
  };

  const handleDeleteAll = () => {
    if (confirm('Delete all lab data? This cannot be undone.')) {
      sessionStorage.removeItem('analysisSession');
      setSession(null);
      setMarkers([]);
      router.push('/');
    }
  };

  const handleExportPDF = async () => {
    if (!session) return;

    try {
      setIsExporting(true);

      const contexts: MarkerContextLike[] = session.contexts ?? [];
      const contextByMarker = new Map<string, MarkerContextLike>();

      contexts.forEach((c) => {
        const key = (c.markerName ?? c.marker ?? '').toString();
        if (key) contextByMarker.set(key, c);
      });

      const exportMarkers: ExportMarker[] = markers.map((m) => {
        const ctx = contextByMarker.get(m.name);

        return {
          name: m.name,
          value: m.value,
          unit: m.unit,
          referenceRange: m.referenceRange,
          status: m.status,
          medgemmaContent: ctx
            ? {
                whatIsIt: ctx.whatIsIt,
                researchContext: ctx.researchContext,
                foodPatterns: ctx.foodPatterns ?? '',
              }
            : undefined,
        };
      });

      await generatePDFReport(exportMarkers);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderSection = (title: string, icon: ReactNode, list: ExtractedMarker[], borderClass: string) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {icon}
          <span>
            {title} ({list.length})
          </span>
        </h2>

        <div className="space-y-3">
          {list.map((marker) => (
            <Card
              key={marker.name}
              className={`p-5 cursor-pointer hover:shadow-lg transition-all duration-200 ${getStatusColor(marker.status)}`}
              onClick={() => router.push(`/marker/${encodeURIComponent(marker.name)}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{marker.name}</h3>
                  <p className="text-sm text-gray-600">Reference Range: {formatRange(marker.referenceRange, marker.unit)}</p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-3xl font-bold ${
                      marker.status === 'low'
                        ? 'text-red-700'
                        : marker.status === 'high'
                          ? 'text-yellow-700'
                          : 'text-green-700'
                    }`}
                  >
                    {marker.value}
                  </p>
                  <p className="text-sm text-gray-600">{marker.unit}</p>
                </div>
              </div>

              <div className={`mt-3 pt-3 border-t ${borderClass}`}>
                <p className="text-sm text-gray-700">→ Click to learn more</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const parseQuality = session?.parseQuality;
  const showParseQuality = typeof parseQuality?.score === 'number' && parseQuality.score < 70;

  const parseQualityTitle =
    parseQuality && typeof parseQuality.score === 'number'
      ? parseQuality.score < 40
        ? 'Parse quality is low'
        : 'Parse quality may be unreliable'
      : 'Parse quality may be unreliable';

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
            ← Back to Home
          </Button>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Lab Results</h1>
              <p className="text-gray-600">{markers.length} markers analyzed • Click any marker to learn more</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              🗑️ Delete All Data
            </Button>
          </div>

          {/* ✅ Only show when parse quality is low */}
          {showParseQuality && (
            <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{parseQualityTitle}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    Score: <span className="font-semibold">{parseQuality?.score}/100</span>
                  </div>

                  {Array.isArray(parseQuality?.warnings) && parseQuality.warnings.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
                      {parseQuality.warnings.slice(0, 3).map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}

                  <div className="text-sm text-gray-600 mt-3">
                    Tip: try a clearer photo, crop to the results table, or upload a different page.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ✅ WOW FACTOR: agent log + safety summary */}
          {session && (
            <div className="mt-6">
              <AgentDashboard
  agentLog={session.agentLog}
  safetyChecks={session.safetyChecks}
  processingTime={session.processingTime}
  parseQuality={session.parseQuality}
/>
            </div>
          )}
        </div>

        {renderSection('Below Reference Range', <span className="text-red-600 text-2xl">⚠️</span>, lowMarkers, 'border-red-200')}
        {renderSection('Above Reference Range', <span className="text-yellow-600 text-2xl">⬆️</span>, highMarkers, 'border-yellow-200')}
        {renderSection('Within Reference Range', <span className="text-green-600 text-2xl">✓</span>, normalMarkers, 'border-green-200')}

        {markers.length > 0 && (
          <div className="text-center mt-8">
            <Button size="lg" className="px-8" onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? '⏳ Generating PDF...' : '📄 Export Complete Report to PDF'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
