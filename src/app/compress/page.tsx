"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import { compressPdfToTargetSize, CompressProgress } from '@/lib/compressService';
import PageHeader from '@/components/PageHeader';
import { Minimize2, FileText, X, ArrowDownToLine, Info } from 'lucide-react';

const PRESETS = [
  { label: '500 KB', value: '0.5' },
  { label: '1 MB', value: '1' },
  { label: '2 MB', value: '2' },
  { label: '5 MB', value: '5' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetSizeStr, setTargetSizeStr] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressData, setProgressData] = useState<CompressProgress | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setSourceFile(acceptedFiles[0]);
    setResultSize(null);
    setProgressData(null);
  };

  const handleCompress = async () => {
    if (!sourceFile) return;

    const targetSizeMB = parseFloat(targetSizeStr);
    if (isNaN(targetSizeMB) || targetSizeMB <= 0) {
      alert('Please enter a valid target size greater than 0.');
      return;
    }

    try {
      setIsProcessing(true);
      setResultSize(null);
      setProgressData({ status: 'Initializing…', progress: 0 });

      const compressedBytes = await compressPdfToTargetSize(
        sourceFile,
        targetSizeMB,
        (p) => setProgressData(p)
      );

      setResultSize(compressedBytes.byteLength);

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
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
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Compression failed: ${msg}`);
    } finally {
      setIsProcessing(false);
      setProgressData(null);
    }
  };

  const handleClear = () => {
    if (isProcessing) return;
    setSourceFile(null);
    setTargetSizeStr('1');
    setResultSize(null);
    setProgressData(null);
  };

  const reductionPct =
    sourceFile && resultSize
      ? Math.round((1 - resultSize / sourceFile.size) * 100)
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter">

      <PageHeader
        icon={<Minimize2 />}
        title="Compress PDF"
        description="Reduce PDF file size by rasterizing pages to a target size."
        color="sky"
      />

      {!sourceFile ? (
        <UploadZone
          onDropFiles={handleDrop}
          accept={{ 'application/pdf': ['.pdf'] }}
          label="Drag & drop a PDF file here, or click to select"
        />
      ) : (
        <div className="space-y-4">

          {/* File Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
              <FileText size={22} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate" title={sourceFile.name}>
                {sourceFile.name}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Original size: <span className="font-mono font-semibold text-gray-700">{formatSize(sourceFile.size)}</span>
              </p>
              {resultSize !== null && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">
                    Compressed: <span className="font-mono font-semibold text-green-600">{formatSize(resultSize)}</span>
                  </span>
                  {reductionPct !== null && reductionPct > 0 && (
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      -{reductionPct}% smaller
                    </span>
                  )}
                  {reductionPct !== null && reductionPct <= 0 && (
                    <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      Already optimal
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleClear}
              disabled={isProcessing}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
              title="Remove file"
            >
              <X size={18} />
            </button>
          </div>

          {/* Target Size */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Target Size</h2>

            {/* Preset Buttons */}
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setTargetSizeStr(preset.value)}
                  disabled={isProcessing}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all disabled:opacity-50 ${
                    targetSizeStr === preset.value
                      ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-cyan-400 hover:text-cyan-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={targetSizeStr}
                onChange={(e) => setTargetSizeStr(e.target.value)}
                disabled={isProcessing}
                className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-50 disabled:opacity-50"
                placeholder="e.g. 1.5"
              />
              <span className="text-sm text-gray-500 font-medium">MB (custom)</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <Info size={13} className="mt-0.5 shrink-0 text-gray-400" />
              <span>
                Compression works by rasterizing pages as images. Selectable text will not be preserved.
                Actual output size may vary slightly from the target.
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && progressData && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{progressData.status}</span>
                <span className="font-mono text-gray-500">{progressData.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-cyan-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressData.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Compress Button */}
          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed text-base"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Compressing…
              </>
            ) : (
              <>
                <ArrowDownToLine size={19} />
                {resultSize !== null ? 'Compress Again & Download' : 'Compress & Download PDF'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
