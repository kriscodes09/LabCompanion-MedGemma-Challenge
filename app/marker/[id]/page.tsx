'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generatePDFReport } from '@/lib/export/pdf-generator';
import type { ExportMarker } from '@/lib/export/pdf-generator';
import type { WorkflowResult } from '@/lib/agents/types';

type RefRange = ExportMarker['referenceRange'];

type SessionMarker = {
  name: string;
  value?: number | string;
  unit?: string;
  referenceRange?: {
    low?: number;
    high?: number;
    unit?: string;
  };
  flagged?: boolean;
};

type MarkerContextLike = {
  markerName?: string;
  marker?: string; 
  whatIsIt: string;
  researchContext: string;
  foodPatterns?: string;
  generatedBy?: string;
  generatedAt?: string;
  disclaimer?: string;
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function deriveStatus(marker?: SessionMarker): 'low' | 'normal' | 'high' {
  if (!marker) return 'normal';
  const valueNum = toNumber(marker.value);

  const low = marker.referenceRange?.low;
  const high = marker.referenceRange?.high;

  if (valueNum !== null) {
    if (typeof low === 'number' && valueNum < low) return 'low';
    if (typeof high === 'number' && valueNum > high) return 'high';
    return 'normal';
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

export default function MarkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const markerName = decodeURIComponent(params.id as string);

  const [session, setSession] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('analysisSession');
    if (!data) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(data) as WorkflowResult;
      setSession(parsed);
      setLoading(false);
    } catch (e) {
      console.error('Failed to parse analysisSession:', e);
      router.push('/');
    }
  }, [router]);

  const marker: SessionMarker | undefined = useMemo(() => {
    const list = (session?.parsed?.markers ?? []) as SessionMarker[];
    return list.find((m) => m.name === markerName);
  }, [session, markerName]);

  const context: MarkerContextLike | undefined = useMemo(() => {
    const contexts = (session?.contexts ?? []) as MarkerContextLike[];
    const map = new Map<string, MarkerContextLike>();
    contexts.forEach((c) => {
      const key = (c.markerName ?? c.marker ?? '').toString();
      if (key) map.set(key, c);
    });
    return map.get(markerName);
  }, [session, markerName]);

  const status = useMemo(() => deriveStatus(marker), [marker]);

  useEffect(() => {
    if (!loading && session) setNotFound(!marker);
  }, [loading, session, marker]);

  const handleExportPDF = async () => {
    if (!marker) return;

    
    const valueNum = toNumber(marker.value);
    if (valueNum === null) {
      alert('This marker does not have a numeric value, so it cannot be exported to PDF yet.');
      return;
    }

    try {
      setIsExporting(true);

      const low = marker.referenceRange?.low;
      const high = marker.referenceRange?.high;

      const rr: RefRange =
        typeof low === 'number' || typeof high === 'number'
          ? {
              ...(typeof low === 'number' ? { low } : {}),
              ...(typeof high === 'number' ? { high } : {}),
              unit: marker.referenceRange?.unit ?? marker.unit ?? '',
            }
          : undefined;

      const exportMarker: ExportMarker = {
        name: marker.name,
        value: valueNum, 
        unit: marker.unit ?? '',
        referenceRange: rr,
        status,
        medgemmaContent: context
          ? {
              whatIsIt: context.whatIsIt,
              researchContext: context.researchContext,
              foodPatterns: context.foodPatterns ?? '',
            }
          : undefined,
      };

      await generatePDFReport([exportMarker]);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading marker information...</p>
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => router.push('/results')} className="mb-4">
            ← Back to Results
          </Button>

          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-900 font-semibold mb-1">Marker not found in this session.</p>
            <p className="text-sm text-yellow-800">
              This usually happens if you opened a marker URL directly without analyzing a report first.
            </p>
            <div className="mt-4">
              <Button onClick={() => router.push('/')}>Upload Lab Report</Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const generatedBy = context?.generatedBy ?? 'MedGemma (offline)';
  const isFallback = generatedBy === 'Fallback';

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push('/results')} className="mb-4">
            ← Back to Results
          </Button>

          <h1 className="text-4xl font-bold mb-2">{markerName}</h1>
          <p className="text-gray-600">Educational information (stored from your last analysis) • Source: {generatedBy}</p>

          <p className="text-sm text-gray-600 mt-2">
            Reference Range: {formatRange(marker?.referenceRange, marker?.unit)}
          </p>

          {isFallback && (
            <Card className="p-4 mt-4 bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-900">
                ⚠️ Offline MedGemma content wasn’t available for this marker, so the app used safe fallback educational text.
              </p>
            </Card>
          )}
        </div>

        {/* Export Button */}
        <div className="mb-6">
          <Button size="lg" className="w-full sm:w-auto" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? '⏳ Generating PDF...' : '📄 Export This Marker to PDF'}
          </Button>
        </div>

        {/* What is it? */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">What is this?</h2>
          <p className="text-gray-700 leading-relaxed">
            {context?.whatIsIt ??
              `${markerName} is a lab marker used by healthcare providers to assess health. Educational context for this marker was not found in the current session.`}
          </p>
        </Card>

        {/* Research Context */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">What does research say?</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {context?.researchContext ?? 'No research context available for this marker in the current session.'}
          </p>
        </Card>

        {/* Food Patterns */}
        {context?.foodPatterns && context.foodPatterns.trim().length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Food & Nutrition Context</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{context.foodPatterns}</p>
          </Card>
        )}

        {/* Questions for Doctor */}
        <Card className="p-6 mb-6 bg-purple-50 border-purple-200">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">💬 Questions to Ask Your Doctor</h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-purple-600 font-bold">1.</span>
              <span className="text-gray-700">What does my {markerName} level mean for my overall health?</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 font-bold">2.</span>
              <span className="text-gray-700">Should I be concerned about this result? What are the next steps?</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 font-bold">3.</span>
              <span className="text-gray-700">Are there lifestyle changes (diet, exercise, sleep) that could help?</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 font-bold">4.</span>
              <span className="text-gray-700">When should I retest this marker? How often should it be monitored?</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 font-bold">5.</span>
              <span className="text-gray-700">Are there medications or supplements that could affect this marker?</span>
            </li>
          </ul>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong className="text-yellow-700">⚠️ IMPORTANT DISCLAIMER:</strong>{' '}
            {context?.disclaimer ??
              'This is educational information only. It is NOT medical advice, diagnosis, or treatment. Always consult your healthcare provider.'}
          </p>
          <p className="text-xs text-gray-600 mt-3">
            Generated by: {context?.generatedBy ?? 'Unknown'} •{' '}
            {context?.generatedAt ? new Date(context.generatedAt).toLocaleDateString() : ''}
          </p>
        </Card>
      </div>
    </main>
  );
}
