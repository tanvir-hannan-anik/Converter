"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import SortablePageGrid, { SortableItem } from '@/components/SortablePageGrid';
import PageHeader from '@/components/PageHeader';
import { mergePdfs } from '@/lib/pdfService';
import { Layers, Trash2, ArrowDownToLine, Info } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface FileItem extends SortableItem {
  file: File;
}

export default function MergePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map(file => ({
      id: generateId(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleClearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.url));
    setFiles([]);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    try {
      setIsProcessing(true);
      const merged = await mergePdfs(files.map(f => f.file));

      const blob = new Blob([merged], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Merged_Document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to merge. Please ensure all files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 page-enter">

      <PageHeader
        icon={<Layers />}
        title="Merge PDFs"
        description="Upload PDFs, drag to reorder, then merge into a single document."
        color="violet"
      />

      {/* Upload zone — always visible */}
      <UploadZone
        onDropFiles={handleDrop}
        accept={{ 'application/pdf': ['.pdf'] }}
        label={files.length > 0 ? "Drop more PDFs to add them…" : "Drag & drop PDF files here, or click to browse"}
      />

      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* List header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Layers size={15} className="text-violet-500" />
              {files.length} file{files.length !== 1 ? 's' : ''} queued
            </div>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
              Clear all
            </button>
          </div>

          {/* File list */}
          <div className="p-4">
            <SortablePageGrid
              items={files}
              onReorder={(items) => setFiles(items as FileItem[])}
              onRemove={handleRemove}
            />
          </div>

          {/* Hint */}
          <div className="flex items-center gap-2 mx-4 mb-4 px-3 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-400 border border-slate-100">
            <Info size={13} className="shrink-0" />
            Pages are merged in the order shown above. Drag to reorder.
          </div>

          {/* Action */}
          <div className="px-4 pb-4">
            <button
              onClick={handleMerge}
              disabled={isProcessing || files.length < 2}
              className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Merging…
                </>
              ) : (
                <>
                  <ArrowDownToLine size={18} />
                  Merge & Download PDF
                </>
              )}
            </button>
            {files.length < 2 && (
              <p className="text-center text-xs text-slate-400 mt-2">Add at least 2 PDFs to merge.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
