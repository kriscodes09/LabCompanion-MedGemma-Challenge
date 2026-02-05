'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarkerContext } from '@/lib/types';
import { generateSimpleExport } from '@/lib/export/simple-export';

export default function MarkerPage() {
  const router = useRouter();
  const params = useParams();
  const markerId = decodeURIComponent(params.id as string);
  const [context, setContext] = useState<MarkerContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContext() {
      try {
        const response = await fetch(`/api/marker?name=${encodeURIComponent(markerId)}`);
        const data = await response.json();
        if (data.success) {
          setContext(data.context);
        }
      } catch (error) {
        console.error('Failed to load marker context:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContext();
  }, [markerId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button - UPDATED */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back to Results
        </Button>

        {/* Marker header */}
        <Card className="p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{markerId}</h1>
          <p className="text-gray-600">
            Learn about this marker and prepare questions for your doctor.
          </p>
        </Card>

        {loading && (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Loading...</p>
          </Card>
        )}

        {!loading && !context && (
          <Card className="p-8">
            <p className="text-gray-600">
              Educational content for {markerId} is not yet available.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Coming soon!
            </p>
          </Card>
        )}

        {!loading && context && (
          <>
            {/* Education content */}
            <Card className="p-8 mb-6">
              <h2 className="text-2xl font-bold mb-4">What Is This?</h2>
              <p className="text-gray-700 mb-6">{context.whatIsIt}</p>

              <h3 className="text-xl font-bold mb-3">Why Is This Measured?</h3>
              <ul className="space-y-2 mb-6">
                {context.whyMeasured.map((reason, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-bold mb-3">Research Context</h3>
              <p className="text-gray-700 mb-4">{context.researchContext}</p>

              <h3 className="text-sm font-semibold text-gray-600 mb-2">Sources:</h3>
              <ul className="space-y-1">
                {context.sources.map((source, idx) => (
                  <li key={idx}>
                    <a 
                      href={source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Questions */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Questions for Your Doctor</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>What does my {markerId} result mean for me specifically?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>What could be causing this result?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Do I need any follow-up tests?</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>What lifestyle changes would you recommend?</span>
                </li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}