import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { LabValue } from '@/lib/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }
    
   // Extract base64 and detect media type
const [metadata, base64Data] = image.split(',');
const mediaType = metadata.match(/data:(image\/[^;]+)/)?.[1] || 'image/jpeg';

console.log('Detected media type:', mediaType);
    
    // Check size
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / 1024 / 1024;
    console.log(`Image size: ${sizeInMB.toFixed(2)} MB`);
    
    if (sizeInMB > 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Image too large. Please use an image under 5 MB.' 
        },
        { status: 400 }
      );
    }
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',  // ← Sonnet 4.5
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Extract ALL lab values from this medical lab report.

Return ONLY a valid JSON array (no markdown, no explanation):

[
  {
    "marker": "Hemoglobin",
    "value": 11.2,
    "unit": "g/dL",
    "referenceRange": "12.0-16.0",
    "status": "low",
    "confidence": 0.96
  }
]

Rules:
- Extract ALL visible lab values
- Include confidence score (0-1) for each
- Status must be "low", "normal", or "high"
- Use exact marker names from report`,
            },
          ],
        },
      ],
    });

   const text = message.content[0].type === 'text' 
  ? message.content[0].text 
  : '';

console.log('Raw response:', text.substring(0, 200));

// Strip markdown code fences if present
let cleanText = text.trim();
if (cleanText.startsWith('```json')) {
  cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
} else if (cleanText.startsWith('```')) {
  cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
}

console.log('Cleaned text:', cleanText.substring(0, 200));

const values: LabValue[] = JSON.parse(cleanText);
    
    return NextResponse.json({ 
      success: true,
      values 
    });
    
} catch (error: unknown) {
  console.error('Extraction error:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'Failed to extract values';
  
  // Better error messages
  let friendlyMessage = 'Failed to extract values';
  
  if (errorMessage.includes('rate_limit')) {
    friendlyMessage = 'API rate limit reached. Please wait a moment and try again.';
  } else if (errorMessage.includes('timeout')) {
    friendlyMessage = 'Request timed out. Please try again with a smaller image.';
  } else if (errorMessage.includes('invalid_request')) {
    friendlyMessage = 'Invalid image format. Please upload a clear photo or scan of your lab results.';
  } else if (error instanceof SyntaxError) {
    friendlyMessage = 'Could not parse lab values. Please try a clearer image.';
  } else if (errorMessage) {
    friendlyMessage = errorMessage;
  }
  
  return NextResponse.json(
    { success: false, error: friendlyMessage },
    { status: 500 }
  );
}
}