import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Extract text from an image using Tesseract.js
 * 
 */
export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  
  console.log('🔍 Starting OCR with Tesseract.js...');
  
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: (m) => {
          // Progress updates
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            console.log(`OCR Progress: ${progress}%`);
            if (onProgress) onProgress(progress);
          }
        }
      }
    );

    console.log('✅ OCR Complete!');
    console.log(`Confidence: ${Math.round(result.data.confidence)}%`);
    
    return {
      text: result.data.text,
      confidence: result.data.confidence / 100 // Convert to 0-1
    };

  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text from multiple images and combine (for multi-page PDFs)
 */
export async function extractTextFromMultipleImages(
  imageFiles: File[],
  onProgress?: (progress: number, pageNum: number, totalPages: number) => void
): Promise<OCRResult> {
  console.log(`🔍 Starting OCR on ${imageFiles.length} page(s)...`);
  
  let combinedText = '';
  let totalConfidence = 0;
  
  for (let i = 0; i < imageFiles.length; i++) {
    const pageNum = i + 1;
    console.log(`📄 Processing page ${pageNum}/${imageFiles.length}...`);
    
    try {
      const result = await Tesseract.recognize(
        imageFiles[i],
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pageProgress = m.progress;
              const totalProgress = ((i + pageProgress) / imageFiles.length) * 100;
              if (onProgress) {
                onProgress(Math.round(totalProgress), pageNum, imageFiles.length);
              }
            }
          }
        }
      );
      
      combinedText += `\n--- Page ${pageNum} ---\n${result.data.text}\n`;
      totalConfidence += result.data.confidence;
      
      console.log(`✅ Page ${pageNum} complete (${Math.round(result.data.confidence)}% confidence)`);
      
    } catch (error) {
      console.error(`❌ Error processing page ${pageNum}:`, error);
      combinedText += `\n--- Page ${pageNum} (Error) ---\n`;
    }
  }
  
  const avgConfidence = totalConfidence / imageFiles.length;
  
  console.log('✅ All pages processed!');
  console.log(`Average confidence: ${Math.round(avgConfidence)}%`);
  
  return {
    text: combinedText,
    confidence: avgConfidence / 100 // Convert to 0-1
  };
}

/**
 * Test function - creates a simple image to verify Tesseract works
 */
export async function testOCR(): Promise<OCRResult> {
  console.log('🧪 Testing Tesseract.js OCR...');
  
  // Create a canvas with test text
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;
  
  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 600, 300);
  
  // Black text
  ctx.fillStyle = 'black';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Hemoglobin: 14.2 g/dL', 50, 100);
  ctx.fillText('Glucose: 98 mg/dL', 50, 150);
  ctx.fillText('Cholesterol: 180 mg/dL', 50, 200);
  
  // Convert to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!));
  });
  
  const file = new File([blob], 'test.png', { type: 'image/png' });
  
  return await extractTextFromImage(file, (progress) => {
    console.log(`Test OCR Progress: ${progress}%`);
  });
}