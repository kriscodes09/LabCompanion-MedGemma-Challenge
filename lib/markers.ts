import { MarkerContext } from './types';

// Convert marker name to filename
function markerToFilename(marker: string): string {
  return marker
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/\//g, '-');
}

export async function getMarkerContext(markerName: string): Promise<MarkerContext | null> {
  try {
    const filename = markerToFilename(markerName);
    
    // Try to load the JSON file
    const data = await import(`@/data/markers/${filename}.json`);
    
    return {
      marker: data.marker,
      whatIsIt: data.whatIsIt,
      whyMeasured: data.whyMeasured,
      researchContext: data.researchContext,
      sources: data.sources,
    };
  } catch (error) {
    console.error(`Marker file not found: ${markerName}`, error);
    return null;
  }
}