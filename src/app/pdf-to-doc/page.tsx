"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import PageHeader from '@/components/PageHeader';
import { pdfToDocx } from '@/lib/docxService';
import { FileText, X, ArrowDownToLine, Info } from 'lucide-react';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfToDocPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = (files: File[]) => {
    if (files.length > 0) setSourceFile(files[0]);
  };

  const handleConvert = async () => {
    if (!sourceFile) return;
    try {
      setIsProcessing(true);
      const docxBlob = await pdfToDocx(sourceFile);

      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement('a');
      a.href = url;
      const base = sourceFile.name.toLowerCase().endsWith('.pdf')
        ? sourceFile.name.slice(0, -4)
        : sourceFile.name;
      a.download = `${base}_extracted.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Conversion failed. The file may contain encrypted or non-readable content.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7 page-enter">

      <PageHeader
        icon={<FileText />}
        title="PDF to Word"
        description="Extract readable text from a PDF and download it as a .docx file."
        color="amber"
      />

      {!sourceFile ? (
        <UploadZone
          onDropFiles={handleDrop}
          accept={{ 'application/pdf': ['.pdf'] }}
          label="Drop a PDF file here, or click to browse"
          maxFiles={1}
        />
      ) : (
        <div className="space-y-4">

          {/* File card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
              <FileText size={24} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate" title={sourceFile.name}>
                {sourceFile.name}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">{formatSize(sourceFile.size)}</p>
            </div>
            <button
              onClick={() => setSourceFile(null)}
              disabled={isProcessing}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
              title="Remove"
            >
              <X size={18} />
            </button>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5 text-sm text-amber-700">
            <Info size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              Only selectable text is extracted. Scanned pages or image-based PDFs may produce little or no output.
            </span>
          </div>

          {/* Button */}
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Extracting text…
              </>
            ) : (
              <>
                <ArrowDownToLine size={18} />
                Convert & Download .docx
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
