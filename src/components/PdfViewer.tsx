"use client";
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File | string | Uint8Array | null;
}

export default function PdfViewer({ file }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  if (!file) {
    return <div className="p-4 text-gray-500 text-center border rounded w-full">No PDF to display</div>;
  }

  return (
    <div className="flex flex-col items-center max-w-full overflow-hidden bg-gray-50 p-4 rounded-lg border border-gray-200">
      <Document
        file={file as any}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col gap-4 items-center"
      >
        {Array.from(new Array(numPages || 0), (el, index) => (
          <Page 
            key={`page_${index + 1}`} 
            pageNumber={index + 1} 
            width={500} 
            className="shadow-lg bg-white"
          />
        ))}
      </Document>
    </div>
  );
}
