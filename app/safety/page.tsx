'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Info } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Lab Literacy Companion</h1>
          <p className="text-lg text-gray-600 mt-2">
           
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-12 space-y-16">
        
        {/* This Tool Does NOT */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">This Tool Does NOT</h2>
          </div>
          
          <div className="space-y-4 pl-13">
            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Diagnose medical conditions</h3>
              <p className="text-gray-600">
                Only licensed healthcare providers can diagnose based on lab results, symptoms, and medical history.
              </p>
            </div>

            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Prescribe treatments or medications</h3>
              <p className="text-gray-600">
                We never recommend specific treatments, medications, or dosage changes.
              </p>
            </div>

            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Replace your healthcare provider</h3>
              <p className="text-gray-600">
                This tool supplements, never replaces, professional medical care.
              </p>
            </div>

            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Provide medical advice</h3>
              <p className="text-gray-600">
                All content is educational and population-level only. Not personalized medical guidance.
              </p>
            </div>

            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Handle emergencies</h3>
              <p className="text-gray-600">
                For urgent concerns, contact your healthcare provider or emergency services immediately.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* This Tool DOES */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">This Tool DOES</h2>
          </div>
          
          <div className="space-y-4 pl-13">
            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Explain what lab markers mean</h3>
              <p className="text-gray-600">
                Plain-language explanations of what each test measures and why doctors order it.
              </p>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Share research-backed patterns</h3>
              <p className="text-gray-600">
                Educational context about what studies show regarding lab markers at a population level.
              </p>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Generate doctor visit questions</h3>
              <p className="text-gray-600">
                Personalized questions to help you prepare for appointments and have informed conversations.
              </p>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Connect food patterns to markers</h3>
              <p className="text-gray-600">
                USDA 2020 dietary guideline associations with lab values for educational purposes.
              </p>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Process everything locally</h3>
              <p className="text-gray-600">
                100% browser-based processing means your health data never leaves your device.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Privacy */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Privacy Commitment</h2>
          </div>
          
          <div className="space-y-4 pl-13">
            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Your lab reports never leave your device</h3>
              <p className="text-gray-600">
                100% local processing with no cloud uploads or external storage.
              </p>
            </div>

            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">All OCR and analysis happens in your browser</h3>
              <p className="text-gray-600">
                Zero external API calls means complete data sovereignty.
              </p>
            </div>

            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">Session-only storage</h3>
              <p className="text-gray-600">
                Data is deleted automatically when you close the tab.
              </p>
            </div>

            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="font-semibold text-lg text-gray-900">No tracking or data collection</h3>
              <p className="text-gray-600">
                No user accounts, no analytics, no third-party services.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8">
          <Button size="lg" onClick={() => router.push('/')}>
            Get Started
          </Button>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 mt-12">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              <strong>Currently:</strong> English-language lab reports • 30 supported biomarkers
            </p>
            <p className="text-gray-700 font-medium">
              Always consult a qualified healthcare professional for interpretation of your results.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}