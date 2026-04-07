"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import SortablePageGrid, { SortableItem } from '@/components/SortablePageGrid';
import { mergePdfs } from '@/lib/pdfService';

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
      url: URL.createObjectURL(file), // Sortable grid will render 'PDF' badge for pdfs
      name: file.name,
      file,
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const handleMergeAndDownload = async () => {
    try {
      setIsProcessing(true);
      const pdfFiles = files.map(f => f.file);
      const mergedBytes = await mergePdfs(pdfFiles);

      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Merged_Document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to merge PDFs. Please ensure all uploaded files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in transition duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Merge PDFs</h1>
        <p className="text-gray-500">Upload multiple PDF files, reorder them, and merge them into a single file.</p>
      </div>

      <UploadZone 
        onDropFiles={handleDrop} 
        accept={{ 'application/pdf': ['.pdf'] }} 
        label="Drag & drop PDF files here, or click to select"
      />
      
      {files.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Uploaded PDFs Order</h2>
            <SortablePageGrid 
              items={files} 
              onReorder={(items) => setFiles(items as FileItem[])} 
              onRemove={(id) => setFiles(files.filter(f => f.id !== id))} 
            />
          </div>

          <button 
            onClick={handleMergeAndDownload}
            disabled={isProcessing || files.length < 2}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Merge & Download PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
