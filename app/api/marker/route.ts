import { NextRequest, NextResponse } from 'next/server';
import { MarkerContext } from '@/lib/types';

// Convert marker name to filename
function markerToFilename(marker: string): string {
  return marker
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/\//g, '-');
}

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
    const filename = markerToFilename(markerName);
    
    // Dynamically import the JSON file
    const data = await import(`@/data/markers/${filename}.json`);
    
    const context: MarkerContext = {
      marker: data.marker,
      whatIsIt: data.whatIsIt,
      whyMeasured: data.whyMeasured,
      researchContext: data.researchContext,
      sources: data.sources,
    };

    return NextResponse.json({ 
      success: true,
      context 
    });
  } catch (error) {
    console.error(`Marker file not found: ${markerName}`, error);
    return NextResponse.json(
      { success: false, error: 'Marker data not found' },
      { status: 404 }
    );
  }
}