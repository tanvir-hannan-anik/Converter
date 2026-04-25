"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import SortablePageGrid, { SortableItem } from '@/components/SortablePageGrid';
import PageHeader from '@/components/PageHeader';
import { getPdfPageCount, reorderAndSavePdf } from '@/lib/pdfService';
import { FileEdit, FileText, X, ArrowDownToLine, Info } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface PageItem extends SortableItem {
  originalIndex: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
      const count = await getPdfPageCount(file);
      setSourceFile(file);
      setPages(Array.from({ length: count }, (_, i) => ({
        id: generateId(),
        url: '',
        name: `Page ${i + 1}`,
        originalIndex: i,
      })));
    } catch (err) {
      console.error(err);
      alert("Failed to read the PDF file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!sourceFile || pages.length === 0) return;
    try {
      setIsProcessing(true);
      const edited = await reorderAndSavePdf(sourceFile, pages.map(p => p.originalIndex));

      const blob = new Blob([edited], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Edited_Document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to save the edited PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 page-enter">

      <PageHeader
        icon={<FileEdit />}
        title="Edit PDF"
        description="Rearrange or delete pages in any PDF document. Drag pages to reorder them."
        color="emerald"
      />

      {!sourceFile ? (
        <UploadZone
          onDropFiles={handleDrop}
          accept={{ 'application/pdf': ['.pdf'] }}
          label="Drop a single PDF file here, or click to browse"
          maxFiles={1}
        />
      ) : (
        <div className="space-y-4">

          {/* File info card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
              <FileText size={20} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate text-sm" title={sourceFile.name}>
                {sourceFile.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatSize(sourceFile.size)} · {pages.length} page{pages.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => { setSourceFile(null); setPages([]); }}
              disabled={isProcessing}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>

          {/* Page list card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Pages
                <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {pages.length} remaining
                </span>
              </span>
            </div>

            <div className="p-4">
              <SortablePageGrid
                items={pages}
                onReorder={(items) => setPages(items as PageItem[])}
                onRemove={(id) => setPages(prev => prev.filter(p => p.id !== id))}
              />
            </div>

            <div className="flex items-start gap-2 mx-4 mb-4 px-3 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-400 border border-slate-100">
              <Info size={13} className="mt-0.5 shrink-0" />
              Drag to reorder pages. Click × to delete a page. Removed pages cannot be recovered — download to confirm.
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={handleSave}
                disabled={isProcessing || pages.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <ArrowDownToLine size={18} />
                    Save & Download PDF
                  </>
                )}
              </button>
              {pages.length === 0 && (
                <p className="text-center text-xs text-red-400 mt-2">All pages have been removed.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
