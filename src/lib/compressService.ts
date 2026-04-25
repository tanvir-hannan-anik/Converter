import { PDFDocument } from 'pdf-lib';

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

  // Skip heavy processing if already within target
  if (pdfFile.size <= targetBytes) {
    onProgress?.({ status: 'Already within target size.', progress: 100 });
    return new Uint8Array(await pdfFile.arrayBuffer());
  }

  onProgress?.({ status: 'Loading PDF…', progress: 5 });

  const { pdfjs } = await import('react-pdf');

  // Always configure the worker — compress page doesn't use PdfViewer
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const fileArrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(fileArrayBuffer) }).promise;
  const numPages = pdf.numPages;

  // Reserve 10% headroom for PDF structure overhead
  const targetBytesPerPage = (targetBytes * 0.9) / numPages;

  onProgress?.({ status: 'Preparing…', progress: 10 });
  const newPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    onProgress?.({
      status: `Compressing page ${i} of ${numPages}…`,
      progress: 10 + Math.round(((i - 1) / numPages) * 80),
    });

    const page = await pdf.getPage(i);

    // Cap scale so very wide pages don't consume excessive memory
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = baseViewport.width > 1666 ? 2500 / baseViewport.width : 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    // Pre-fill white — pdfjs v5 renders with a transparent background,
    // which JPEG encodes as solid black without this.
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D canvas context');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // pdfjs-dist v5 primary API: pass the canvas element directly
    await page.render({ canvas, viewport }).promise;

    // Binary-search JPEG quality to approach target bytes-per-page
    let minQ = 0.01, maxQ = 0.92, quality = 0.5;
    let bestDataUrl = canvas.toDataURL('image/jpeg', quality);

    for (let iter = 0; iter < 6; iter++) {
      const approxBytes = bestDataUrl.length * 0.75; // base64 → raw byte estimate
      if (Math.abs(approxBytes - targetBytesPerPage) < targetBytesPerPage * 0.08) break;
      if (approxBytes > targetBytesPerPage) maxQ = quality;
      else minQ = quality;
      quality = (minQ + maxQ) / 2;
      bestDataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    const base64Data = bestDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const imageObj = await newPdfDoc.embedJpg(imageBytes);
    const pdfPage = newPdfDoc.addPage([canvas.width, canvas.height]);
    pdfPage.drawImage(imageObj, { x: 0, y: 0, width: canvas.width, height: canvas.height });

    // Release canvas memory immediately after use
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.({ status: 'Finalizing…', progress: 95 });
  const compressedBytes = await newPdfDoc.save();
  onProgress?.({ status: 'Done', progress: 100 });
  return compressedBytes;
}
