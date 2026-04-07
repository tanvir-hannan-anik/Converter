"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import { compressPdfToTargetSize, CompressProgress } from '@/lib/compressService';

export default function CompressPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetSizeStr, setTargetSizeStr] = useState<string>("1.0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressData, setProgressData] = useState<CompressProgress | null>(null);

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setSourceFile(acceptedFiles[0]);
  };

  const handleCompress = async () => {
    if (!sourceFile) return;
    
    const targetSizeMB = parseFloat(targetSizeStr);
    if (isNaN(targetSizeMB) || targetSizeMB <= 0) {
      alert("Please enter a valid target size greater than 0.");
      return;
    }

    try {
      setIsProcessing(true);
      setProgressData({ status: 'Initializing...', progress: 0 });
      
      const compressedBytes = await compressPdfToTargetSize(
        sourceFile,
        targetSizeMB,
        (progress) => setProgressData(progress)
      );

      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Compressed_${sourceFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("An error occurred during compression.");
    } finally {
      setIsProcessing(false);
      setProgressData(null);
    }
  };

  const clearUpload = () => {
    if (isProcessing) return;
    setSourceFile(null);
    setTargetSizeStr("1.0");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in transition duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compress PDF</h1>
        <p className="text-gray-500">Reduce the file size of your PDF document to a specific target size.</p>
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
            <div>
              <h2 className="text-xl font-semibold">Ready to compress:</h2>
              <p className="text-gray-600 mt-1 truncate max-w-sm" title={sourceFile.name}>{sourceFile.name}</p>
              <p className="text-sm text-gray-500 mt-1 font-mono">Original size: {(sourceFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={clearUpload}
              disabled={isProcessing}
              className="text-sm font-medium text-red-500 hover:text-red-700 focus:outline-none disabled:opacity-50"
            >
              Start Over
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Target Size (MB)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={targetSizeStr}
              onChange={(e) => setTargetSizeStr(e.target.value)}
              disabled={isProcessing}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
            />
            <p className="text-xs text-gray-500">
              Note: Compression relies on rendering pages as images, which will remove copy/pasteable text to fulfill strict size requirements.
            </p>
          </div>

          <button 
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mt-6 relative overflow-hidden"
          >
            {isProcessing && progressData ? (
              <div className="absolute inset-0 bg-blue-800" style={{ width: `${progressData.progress}%`, transition: 'width 0.3s ease-in-out' }} />
            ) : null}
            <span className="relative z-10">
              {isProcessing && progressData ? progressData.status : "Compress & Download PDF"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
