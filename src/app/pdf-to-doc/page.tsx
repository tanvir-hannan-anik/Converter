"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import { pdfToDocx } from '@/lib/docxService';
import { FileText } from 'lucide-react';

export default function PdfToDocPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSourceFile(acceptedFiles[0]);
    }
  };

  const handleExtractAndDownload = async () => {
    if (!sourceFile) return;

    try {
      setIsProcessing(true);
      const docxBlob = await pdfToDocx(sourceFile);

      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      // Strip out `.pdf` from original filename and append `.docx` safely
      const rawName = sourceFile.name.toLowerCase().endsWith('.pdf') 
        ? sourceFile.name.slice(0, -4) 
        : sourceFile.name;
      a.download = `${rawName}_extracted.docx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to convert PDF into a Word document. The file might contain complex unreadable encryption or formatting failures.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in transition duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Convert PDF to Word</h1>
        <p className="text-gray-500">Extract all readable text from your PDF file seamlessly back into a Microsoft Word `.docx` document locally.</p>
      </div>

      {!sourceFile ? (
        <UploadZone 
          onDropFiles={handleDrop} 
          accept={{ 'application/pdf': ['.pdf'] }} 
          label="Drag & drop a single PDF file here, or click to browse"
        />
      ) : (
        <div className="bg-white p-8 rounded-xl border border-blue-100 shadow-sm space-y-6 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
            <FileText size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{sourceFile.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{(sourceFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-4">
             <button 
              onClick={() => setSourceFile(null)}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button 
              onClick={handleExtractAndDownload}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isProcessing ? "Extracting..." : "Download .docx"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
