"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import SortablePageGrid, { SortableItem } from '@/components/SortablePageGrid';
import { getPdfPageCount, reorderAndSavePdf } from '@/lib/pdfService';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface PageItem extends SortableItem {
  originalIndex: number;
}

export default function EditPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      setIsProcessing(true);
      const pageCount = await getPdfPageCount(file);
      
      const newPages = Array.from({ length: pageCount }).map((_, idx) => ({
        id: generateId(),
        url: '', // Generic fallback for SortableItem
        name: `Page ${idx + 1}`,
        originalIndex: idx
      }));

      setSourceFile(file);
      setPages(newPages);
    } catch (err) {
      console.error(err);
      alert("Failed to read PDF file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndDownload = async () => {
    if (!sourceFile || pages.length === 0) return;
    
    try {
      setIsProcessing(true);
      const orderedIndices = pages.map(p => p.originalIndex);
      const editedBytes = await reorderAndSavePdf(sourceFile, orderedIndices);

      const blob = new Blob([editedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Edited_Document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to save edited PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearUpload = () => {
    setSourceFile(null);
    setPages([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in transition duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit PDF</h1>
        <p className="text-gray-500">Upload a single PDF to rearrange its pages or remove pages you don't need.</p>
      </div>

      {!sourceFile ? (
        <UploadZone 
          onDropFiles={handleDrop} 
          accept={{ 'application/pdf': ['.pdf'] }} 
          label="Drag & drop a single PDF file here, or click to select"
        />
      ) : (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold">Editing: {sourceFile.name}</h2>
            <button 
              onClick={clearUpload}
              className="text-sm font-medium text-red-500 hover:text-red-700 focus:outline-none"
            >
              Start Over
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">Drag pages to reorder, or click the 'X' to remove a page.</p>

          <SortablePageGrid 
            items={pages} 
            onReorder={(items) => setPages(items as PageItem[])} 
            onRemove={(id) => setPages(pages.filter(p => p.id !== id))} 
          />

          <button 
            onClick={handleSaveAndDownload}
            disabled={isProcessing || pages.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 mt-6"
          >
            {isProcessing ? "Processing..." : "Save & Download PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
