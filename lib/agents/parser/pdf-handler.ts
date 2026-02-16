import type * as pdfjsLib from 'pdfjs-dist';

// Lazy load PDF.js only on client-side
let pdfjsModule: typeof pdfjsLib | null = null;

async function getPdfjs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing only works in browser');
  }
  
  if (!pdfjsModule) {
    pdfjsModule = await import('pdfjs-dist');
    
    // Set worker path
    pdfjsModule.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsModule.version}/build/pdf.worker.min.mjs`;
  }
  
  return pdfjsModule;
}

/**
 * Convert PDF to images for OCR processing
 */
export async function convertPdfToImages(file: File): Promise<File[]> {
  console.log('🔄 Starting PDF conversion...');
  
  try {
    const pdfjs = await getPdfjs();
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('📄 PDF file loaded, size:', arrayBuffer.byteLength);
    
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    console.log(`📚 PDF has ${pdf.numPages} page(s)`);
    
    const images: File[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`🖼️ Processing page ${pageNum}...`);
      
      const page = await pdf.getPage(pageNum);
      
      // Set scale for better OCR (2x for better quality)
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      console.log(`📐 Canvas size: ${canvas.width}x${canvas.height}`);
      
      // Render page to canvas - ADD canvas property
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }).promise;
      
      console.log(`✅ Page ${pageNum} rendered`);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) {
            resolve(b);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      });
      
      // Create file from blob
      const imageFile = new File(
        [blob], 
        `${file.name}_page${pageNum}.png`, 
        { type: 'image/png' }
      );
      
      images.push(imageFile);
      console.log(`✅ Page ${pageNum} converted to image (${blob.size} bytes)`);
    }
    
    console.log(`✅ PDF conversion complete! ${images.length} images created`);
    return images;
    
  } catch (error) {
    console.error('❌ PDF conversion error:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    throw error;
  }
}

/**
 * Check if file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}