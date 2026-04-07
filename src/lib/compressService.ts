import { PDFDocument, rgb } from 'pdf-lib';


export interface CompressProgress {
  status: string;
  progress: number;
}

export async function compressPdfToTargetSize(
  pdfFile: File,
  targetSizeMB: number,
  onProgress?: (progress: CompressProgress) => void
): Promise<Uint8Array> {
  const targetBytes = targetSizeMB * 1024 * 1024;
  const fileArrayBuffer = await pdfFile.arrayBuffer();
  
  onProgress?.({ status: 'Loading PDF...', progress: 5 });
  
  const { pdfjs } = await import('react-pdf');
  
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const pdf = await pdfjs.getDocument(fileArrayBuffer).promise;
  const numPages = pdf.numPages;
  
  // Allocate target bytes roughly evenly per page, leaving 10% room for PDF metadata overhead
  const targetBytesPerPage = (targetBytes * 0.9) / numPages;
  
  onProgress?.({ status: 'Preparing document...', progress: 10 });
  const newPdfDoc = await PDFDocument.create();
  
  for (let i = 1; i <= numPages; i++) {
    onProgress?.({ 
      status: `Compressing page ${i} of ${numPages}...`, 
      progress: 10 + Math.round(((i - 1) / numPages) * 80)
    });
    
    // Render page to canvas
    const page = await pdf.getPage(i);
    // Use a scale of 1.5 for a decent baseline resolution (108 DPI approximate)
    let viewport = page.getViewport({ scale: 1.5 });
    
    // Optimization: If the PDF dimension is huge, cap the scale
    if (viewport.width > 2500) {
      viewport = page.getViewport({ scale: 1.0 });
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    
    // Find optimal JPEG quality for this page using simple binary search
    let quality = 0.5;
    let minQ = 0.01;
    let maxQ = 0.95; // don't go too high as it bloats file size
    let bestImageData = canvas.toDataURL('image/jpeg', quality);
    
    // Perform up to 5 iterations of binary search to hit the target size per page
    for (let iter = 0; iter < 5; iter++) {
      // base64 size heuristic: length * (3/4)
      const approxBytes = bestImageData.length * 0.75;
      
      const diff = approxBytes - targetBytesPerPage;
      // If we're within 10% of target bytes per page, break
      if (Math.abs(diff) < targetBytesPerPage * 0.1) {
        break;
      }
      
      if (approxBytes > targetBytesPerPage) {
        maxQ = quality;
      } else {
        minQ = quality;
      }
      quality = (minQ + maxQ) / 2;
      bestImageData = canvas.toDataURL('image/jpeg', quality);
    }
    
    // Draw the image onto the new PDF
    const base64Data = bestImageData.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const imageObj = await newPdfDoc.embedJpg(imageBytes);
    const pdfPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    
    pdfPage.drawImage(imageObj, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
    
    // Free memory
    canvas.width = 0;
    canvas.height = 0;
  }
  
  onProgress?.({ status: 'Finalizing PDF...', progress: 95 });
  const compressedBytes = await newPdfDoc.save();
  
  onProgress?.({ status: 'Done', progress: 100 });
  return compressedBytes;
}
