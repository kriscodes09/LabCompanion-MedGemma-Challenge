'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { extractTextFromImage, extractTextFromMultipleImages } from '@/lib/agents/parser/tesseract-ocr';
import { processLabText } from '@/lib/agents/orchestrator/workflow';
import type { WorkflowResult } from '@/lib/agents/types';

import { ALL_NORMAL_SAMPLE, MIXED_RESULTS_SAMPLE, SOME_HIGH_SAMPLE } 
from '@/data/sample-reports';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}


function normalizeToUnit(p: number) {
  if (!Number.isFinite(p)) return 0;
  const unit = p <= 1 ? p : p / 100;
  return clamp(unit, 0, 1);
}

const SESSION_KEY = 'analysisSession';

export default function HomePage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const saveSessionAndGo = (workflowResult: WorkflowResult) => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...workflowResult,
      })
    );

    // optional cleanup 
    sessionStorage.removeItem('workflowResult');
    sessionStorage.removeItem('extractedMarkers');
    sessionStorage.removeItem('uploadTime');

    router.push('/results');
  };

  const handleSampleLoad = async (sampleText: string) => {
    setError('');
    setFile(null);
    setLoading(true);
    setProgress(50);
    setStage('Processing sample report...');

    try {
      const workflowResult = await processLabText(sampleText, 100);
      
      const markerCount = workflowResult?.parsed?.markers?.length ?? 0;
      if (markerCount === 0) {
        setError('No lab markers found in sample.');
        setLoading(false);
        setProgress(0);
        setStage('');
        return;
      }

      setProgress(100);
      setStage('Sample loaded successfully');
      saveSessionAndGo(workflowResult);
    } catch (err) {
      console.error('❌ Sample processing error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      setProgress(0);
      setStage('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setStage('Extracting text...');
    setError('');

    try {
      let ocrResult: { text: string; confidence: number };

      // Dynamically import PDF handler
      const pdfHandler = await import('@/lib/agents/parser/pdf-handler');

      // Check if PDF
      if (pdfHandler.isPDF(file)) {
        console.log('🔍 Detected PDF file');
        setStage('Converting PDF to images...');
        setProgress(10);

        const images = await pdfHandler.convertPdfToImages(file);
        console.log(`📄 PDF converted to ${images.length} page(s)`);

        setStage(`Extracting text from ${images.length} page(s)...`);

        ocrResult = await extractTextFromMultipleImages(images, (p, pageNum, totalPages) => {
          const unit = normalizeToUnit(p); // 0..1
          // Map OCR progress into 10% → 70%
          const mapped = Math.round(10 + unit * 60);
          setProgress(clamp(mapped, 0, 100));
          setStage(`Processing page ${pageNum} of ${totalPages}...`);
        });
      } else {
        console.log('🔍 Detected image file');
        setStage('Extracting text from image...');
        ocrResult = await extractTextFromImage(file, (p) => {
          const unit = normalizeToUnit(p); // 0..1
          // Map OCR progress into 0% → 70%
          const mapped = Math.round(unit * 70);
          setProgress(clamp(mapped, 0, 100));
        });
      }

      console.log('📄 OCR Result:', ocrResult.text);
      console.log('📊 OCR Confidence:', Math.round(ocrResult.confidence * 100) + '%');

      // Orchestrator
      setStage('Running multi-agent analysis...');
      setProgress(75);

      const workflowResult = await processLabText(ocrResult.text, ocrResult.confidence);

      // If no markers, show a friendly error
      const markerCount = workflowResult?.parsed?.markers?.length ?? 0;
      if (markerCount === 0) {
        setError('No lab markers found. Please try a clearer photo/PDF or a different page.');
        setLoading(false);
        setProgress(0);
        setStage('');
        return;
      }

      setStage('Saving session...');
      setProgress(90);

      saveSessionAndGo(workflowResult);
    } catch (err) {
      console.error('❌ Analysis error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setLoading(false);
      setProgress(0);
      setStage('');
    }
  };

  const clampedProgress = clamp(Math.round(progress), 0, 100);

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Lab Results Literacy Companion</h1>
          <p className="text-xl text-gray-600 mb-2">Understand your lab results. Prepare for your doctor visit.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="text-lg">🔒</span>
            <span>Privacy-first • 100% local processing</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="max-w-3xl mx-auto p-4 mb-6 bg-red-50 border-red-200">
            <p className="text-red-700 text-sm">⚠️ {error}</p>
          </Card>
        )}

        {/* Upload Area */}
        <Card className="max-w-3xl mx-auto p-8">
          {!loading && (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : file ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-6xl mb-4">{file ? '✓' : '📋'}</div>

                <h2 className="text-2xl font-semibold mb-2">{file ? file.name : 'Upload Your Lab Results'}</h2>

                <p className="text-gray-600 mb-6">
                  {file ? 'Ready to analyze' : 'Drag & drop or click to upload (Images or PDF)'}
                </p>

                <input
                  type="file"
                  id="file-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    size="lg"
                    className="cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </label>
              </div>

              {file && (
                <div className="mt-6 text-center">
                  <Button size="lg" onClick={handleAnalyze} className="px-12">
                    🔍 Analyze Lab Report
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">Processing happens locally on your device</p>
                </div>
              )}

              {/* Sample buttons */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-3">Or try a sample report:</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSampleLoad(ALL_NORMAL_SAMPLE)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                  >
                    All Normal
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSampleLoad(MIXED_RESULTS_SAMPLE)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                  >
                    Mixed Results
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSampleLoad(SOME_HIGH_SAMPLE)}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                  >
                    Multiple High
                  </button>
                </div>
              </div>
            </>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              </div>

              <h3 className="text-xl font-semibold mb-2">{stage}</h3>
              <p className="text-gray-600 mb-4">{clampedProgress}%</p>

              <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${clampedProgress}%` }}
                />
              </div>

              <p className="text-sm text-gray-500 mt-4">🔒 Your data is being processed locally in your browser</p>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}