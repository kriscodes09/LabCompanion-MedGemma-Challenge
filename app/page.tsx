'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LabValue } from '@/lib/types';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [extracting, setExtracting] = useState(false);
  const [results, setResults] = useState<LabValue[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  async function handleAnalyze() {
    if (!image) return;
    
    setExtracting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.values && data.values.length > 0) {
          setResults(data.values);
        } else {
          setError('No lab values found in this image. Please make sure you uploaded a lab report with test results.');
        }
      } else {
        setError(data.error || 'Failed to extract values. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setExtracting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Lab Results Literacy Companion
          </h1>
          <p className="text-lg text-gray-600">
            Understand your lab results. Prepare for your doctor visit.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            🔒 Privacy-first • 100% local processing
          </p>
        </div>

        {!image && (
          <Card className="p-12">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📋</div>
              <div className="text-xl font-semibold text-gray-700 mb-2">
                {isDragActive ? 'Drop here' : 'Upload Your Lab Results'}
              </div>
              <div className="text-gray-500 mb-6">
                Drag & drop or click to upload
              </div>
              <Button size="lg">Choose File</Button>
            </div>
          </Card>
        )}

        {image && (
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Preview</h2>
                <p className="text-gray-600">{fileName}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setImage(null);
                  setResults(null);
                  setError(null);
                  setFileName('');
                }}
              >
                {results ? 'Upload Another Report' : 'Remove'}
              </Button>
            </div>
            
            <img
              src={image}
              alt="Lab results"
              className="max-w-full rounded-lg border mb-8"
            />

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleAnalyze}
              disabled={extracting}
            >
              {extracting ? '⏳ Analyzing...' : '📊 Analyze Results'}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {results && results.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Extracted Values:</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">Marker</th>
                        <th className="px-4 py-3 text-left">Value</th>
                        <th className="px-4 py-3 text-left">Reference</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            <a 
                              href={`/marker/${encodeURIComponent(result.marker)}`}
                              className="text-blue-600 hover:underline cursor-pointer"
                            >
                              {result.marker}
                            </a>
                          </td>
                          <td className="px-4 py-3">{result.value} {result.unit}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {result.referenceRange}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              result.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                              result.status === 'high' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                ⚠️ <strong>Educational only.</strong> Not medical advice.
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}