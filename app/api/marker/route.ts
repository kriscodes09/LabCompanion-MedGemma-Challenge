import { NextRequest, NextResponse } from 'next/server';
import { getMedGemmaContent } from '@/lib/agents/context/loader';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const markerName = searchParams.get('name');

  if (!markerName) {
    return NextResponse.json(
      { success: false, error: 'Marker name required' },
      { status: 400 }
    );
  }

  try {
    // Use Context Agent to get MedGemma content
    const medgemmaContent = getMedGemmaContent(markerName);
    
    // Transform to match your UI expectations
    const context = {
      marker: medgemmaContent.markerName,
      whatIsIt: medgemmaContent.whatIsIt,
      whyMeasured: [
        'To assess overall health and screen for potential conditions',
        'To monitor treatment effectiveness and disease progression',
        'To evaluate organ function and detect abnormalities'
      ],
      researchContext: medgemmaContent.researchContext,
      foodPatterns: medgemmaContent.foodPatterns,
      sources: [
        'MedGemma 1.5 4B - Medical AI Model trained on biomedical literature',
        'USDA 2020 Dietary Guidelines for Americans'
      ],
      generatedBy: medgemmaContent.generatedBy,
      generatedAt: medgemmaContent.generatedAt,
      disclaimer: medgemmaContent.disclaimer
    };

    return NextResponse.json({ 
      success: true,
      context 
    });
    
  } catch (error) {
    console.error(`Failed to load MedGemma content for: ${markerName}`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Marker data not found'
      },
      { status: 404 }
    );
  }
}