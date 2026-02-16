'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { extractTextFromImage, testOCR } from '@/lib/agents/parser/tesseract-ocr';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeToUnit(p: number) {
  if (!Number.isFinite(p)) return 0;
  const unit = p <= 1 ? p : p / 100;
  return clamp(unit, 0, 1);
}

export default function TestOCRPage() {
  const [result, setResult] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setProgress(0);
    setResult('');

    try {
      const res = await testOCR();
      setResult(`✅ SUCCESS!\n\nExtracted Text:\n${res.text}\n\nConfidence: ${Math.round(res.confidence * 100)}%`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setResult(`❌ ERROR: ${msg}`);
    }

    setLoading(false);
    setProgress(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setResult('');

    try {
      const res = await extractTextFromImage(file, (p) => {
        const unit = normalizeToUnit(p);
        setProgress(Math.round(unit * 100));
      });

      setResult(`✅ SUCCESS!\n\nExtracted Text:\n${res.text}\n\nConfidence: ${Math.round(res.confidence * 100)}%`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setResult(`❌ ERROR: ${msg}`);
    }

    setLoading(false);
    setProgress(0);
  };

  const clampedProgress = clamp(Math.round(progress), 0, 100);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🧪 Tesseract.js OCR Test</h1>
        <p className="text-gray-600 mb-8">Verify that local OCR (100% browser-based) works correctly</p>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Test 1: Built-in Test</h2>
          <p className="text-gray-600 mb-4">
            Creates a test image with lab values and extracts text.
            <br />
            <span className="text-sm">
              Should extract: &quot;Hemoglobin: 14.2 g/dL&quot;, &quot;Glucose: 98 mg/dL&quot;, etc.
            </span>
          </p>
          <Button onClick={handleTest} disabled={loading} size="lg">
            🚀 Run Built-in Test
          </Button>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Test 2: Upload Lab Report</h2>
          <p className="text-gray-600 mb-4">Upload a photo or screenshot of a lab report to test OCR accuracy</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </Card>

        {loading && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="font-semibold">Processing... {clampedProgress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">This runs 100% locally in your browser. No data is sent anywhere!</p>
          </Card>
        )}

        {result && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3 text-lg">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono overflow-x-auto">
              {result}
            </pre>
          </Card>
        )}

        <Card className="p-6 mt-6 bg-green-50 border-green-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            100% Privacy-First OCR
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Tesseract.js runs entirely in your browser</li>
            <li>✓ No cloud APIs, no data upload</li>
            <li>✓ Works offline after first load</li>
            <li>✓ Your lab data never leaves your device</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
