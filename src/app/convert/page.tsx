"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import SortablePageGrid, { SortableItem } from '@/components/SortablePageGrid';
import CoverEditor, { CoverOptions } from '@/components/CoverEditor';
import ImageEditorModal from '@/components/ImageEditorModal';
import { imagesToPdf, generateCoverPage } from '@/lib/pdfService';
import { applyAutoCropToFile } from '@/lib/imageProcessing';
import { PDFDocument } from 'pdf-lib';
import PageHeader from '@/components/PageHeader';
import { FileImage, BookOpen, ScanLine, ArrowDownToLine, Trash2, ChevronDown, ChevronUp, Settings2, CheckCircle2 } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface FileItem extends SortableItem {
  file: File;
}

const emptyCoverOptions: CoverOptions = {
  semester: '',
  courseTitle: '',
  courseCode: '',
  studentName: '',
  teacherName: '',
  studentId: '',
  department: '',
  batch: '',
  submissionDate: '',
};

export default function ConvertPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [coverOptions, setCoverOptions] = useState<CoverOptions>(emptyCoverOptions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [applyAutoCrop, setApplyAutoCrop] = useState(false);
  const [showCover, setShowCover] = useState(false);

  const hasCoverData = !!(coverOptions.courseTitle || coverOptions.studentName || coverOptions.courseCode);
  const canGenerate = files.length > 0 || hasCoverData;

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

  const handleSaveCrop = (croppedBlob: Blob) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== editingId) return f;
      URL.revokeObjectURL(f.url);
      return {
        ...f,
        url: URL.createObjectURL(croppedBlob),
        file: new File([croppedBlob], f.file.name, { type: 'image/jpeg' }),
      };
    }));
    setEditingId(null);
  };

  const handleGeneratePdf = async () => {
    if (!canGenerate) return;

    try {
      setIsProcessing(true);
      let imageFiles = files.map(f => f.file);
      let finalBytes: Uint8Array | null = null;
      let imagesPdfBytes: Uint8Array | null = null;

      if (applyAutoCrop && imageFiles.length > 0) {
        const processed: File[] = [];
        for (const file of imageFiles) {
          processed.push(await applyAutoCropToFile(file));
        }
        imageFiles = processed;
      }

      if (imageFiles.length > 0) {
        imagesPdfBytes = await imagesToPdf(imageFiles);
        finalBytes = imagesPdfBytes;
      }

      if (hasCoverData) {
        const coverBytes = await generateCoverPage(coverOptions);
        const finalDoc = await PDFDocument.create();

        const coverDoc = await PDFDocument.load(coverBytes);
        const [coverPage] = await finalDoc.copyPages(coverDoc, [0]);
        finalDoc.addPage(coverPage);

        if (imagesPdfBytes) {
          const imagesDoc = await PDFDocument.load(imagesPdfBytes);
          const copiedPages = await finalDoc.copyPages(imagesDoc, imagesDoc.getPageIndices());
          copiedPages.forEach(p => finalDoc.addPage(p));
        }

        finalBytes = await finalDoc.save();
      }

      if (!finalBytes) return;

      const blob = new Blob([finalBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length === 0 ? 'Cover_Page.pdf' : 'Converted_Document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-enter">

      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <PageHeader
          icon={<FileImage />}
          title="Image to PDF"
          description="Convert JPG/PNG images into a professional PDF with optional cover page."
          color="blue"
        />
        {files.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 self-center">
            <CheckCircle2 size={15} />
            {files.length} image{files.length !== 1 ? 's' : ''} ready
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <UploadZone
        onDropFiles={handleDrop}
        accept={{ 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] }}
        label={files.length > 0 ? "Drop more images to add them..." : "Drag & drop JPG/PNG files here, or click to browse"}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* Left Panel: Images + Processing Options */}
        <div className="lg:col-span-3 space-y-4">
          {files.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <FileImage size={16} className="text-blue-500" />
                  Images
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {files.length}
                  </span>
                </h2>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={12} />
                  Clear all
                </button>
              </div>

              <SortablePageGrid
                items={files}
                onReorder={(items) => setFiles(items as FileItem[])}
                onRemove={handleRemove}
                onEdit={(id) => setEditingId(id)}
              />

              {/* Processing Options */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Settings2 size={12} />
                  Processing Options
                </p>

                <label className="flex items-start gap-3 p-3 border rounded-xl bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    checked={applyAutoCrop}
                    onChange={(e) => setApplyAutoCrop(e.target.checked)}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ScanLine size={14} className="text-blue-600" />
                      <span className="text-sm font-semibold text-slate-800">Smart Auto-Crop</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Detects and crops empty white borders around document content.
                    </span>
                  </div>
                </label>

              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <FileImage size={40} className="text-slate-200 mb-3" />
              <p className="text-slate-400 font-medium text-sm">No images yet</p>
              <p className="text-slate-300 text-xs mt-1">Upload images above to get started</p>
            </div>
          )}
        </div>

        {/* Right Panel: Cover Page + Generate */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24">

          {/* Cover Page Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowCover(!showCover)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 font-semibold text-slate-800">
                <BookOpen size={17} className="text-purple-500" />
                Cover Page
                {hasCoverData && (
                  <span className="text-xs bg-purple-100 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
                    Configured
                  </span>
                )}
              </div>
              {showCover
                ? <ChevronUp size={16} className="text-slate-400" />
                : <ChevronDown size={16} className="text-slate-400" />
              }
            </button>

            {showCover && (
              <div className="border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-400 mb-4">
                  Fills in a standard university assignment cover page prepended to your PDF.
                </p>
                <CoverEditor options={coverOptions} onChange={setCoverOptions} />
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePdf}
            disabled={isProcessing || !canGenerate}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed text-base"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                <ArrowDownToLine size={19} />
                Generate & Download PDF
              </>
            )}
          </button>

          {!canGenerate && (
            <p className="text-center text-xs text-slate-400">
              Upload images or configure a cover page to generate a PDF.
            </p>
          )}
        </div>
      </div>

      <ImageEditorModal
        isOpen={!!editingId}
        fileUrl={files.find(f => f.id === editingId)?.url ?? null}
        onClose={() => setEditingId(null)}
        onSave={handleSaveCrop}
      />
    </div>
  );
}
