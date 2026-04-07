"use client";
import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import SortablePageGrid, { SortableItem } from '@/components/SortablePageGrid';
import CoverEditor, { CoverOptions } from '@/components/CoverEditor';
import ImageEditorModal from '@/components/ImageEditorModal';
import { imagesToPdf, generateCoverPage } from '@/lib/pdfService';
import { convertToBlackAndWhite, applyAutoCropToFile } from '@/lib/imageProcessing';
import { PDFDocument } from 'pdf-lib';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface FileItem extends SortableItem {
  file: File;
}

export default function ConvertPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [coverOptions, setCoverOptions] = useState<CoverOptions>({
    semester: '',
    courseTitle: '',
    courseCode: '',
    studentName: '',
    teacherName: '',
    studentId: '',
    department: '',
    batch: '',
    submissionDate: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Configuration states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [applyBwFilter, setApplyBwFilter] = useState(false);
  const [applyAutoCrop, setApplyAutoCrop] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map(file => ({
      id: generateId(),
      url: URL.createObjectURL(file),
      name: file.name,
      file
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const handleSaveCrop = (croppedBlob: Blob) => {
    setFiles(prev => prev.map(f => {
      if (f.id === editingId) {
        URL.revokeObjectURL(f.url); // Memory cleanup securely
        return {
          ...f,
          url: URL.createObjectURL(croppedBlob),
          file: new File([croppedBlob], f.file.name, { type: 'image/jpeg' })
        };
      }
      return f;
    }));
    setEditingId(null);
  };

  const handleGeneratePdf = async () => {
    try {
      setIsProcessing(true);
      let imageFiles = files.map(f => f.file);
      
      let finalBytes: Uint8Array | null = null;
      let imagesPdfBytes: Uint8Array | null = null;

      // Safely apply destructive filters sequentially to prevent canvas memory thread leaks
      if ((applyBwFilter || applyAutoCrop) && imageFiles.length > 0) {
        const processedFiles = [];
        for (const file of imageFiles) {
          let currentFile = file;
          
          if (applyAutoCrop) {
            currentFile = await applyAutoCropToFile(currentFile);
          }
          if (applyBwFilter) {
            currentFile = await convertToBlackAndWhite(currentFile);
          }
          
          processedFiles.push(currentFile);
        }
        imageFiles = processedFiles;
      }

      if (imageFiles.length > 0) {
        imagesPdfBytes = await imagesToPdf(imageFiles);
        finalBytes = imagesPdfBytes;
      }

      // Add cover if provided
      if (
        coverOptions.courseTitle || 
        coverOptions.studentName || 
        coverOptions.courseCode
      ) {
        const coverBytes = await generateCoverPage(coverOptions);
        
        // Merge cover with images
        const finalDoc = await PDFDocument.create();
        
        const coverDoc = await PDFDocument.load(coverBytes);
        const [coverPage] = await finalDoc.copyPages(coverDoc, [0]);
        finalDoc.addPage(coverPage);

        if (imagesPdfBytes) {
          const imagesDoc = await PDFDocument.load(imagesPdfBytes);
          const copiedImagePages = await finalDoc.copyPages(imagesDoc, imagesDoc.getPageIndices());
          copiedImagePages.forEach((p) => finalDoc.addPage(p));
        }

        finalBytes = await finalDoc.save();
      }

      if (!finalBytes) {
        alert("Please upload images or add cover details before generating.");
        return;
      }

      // Download
      const blob = new Blob([finalBytes as unknown as BlobPart], { type: 'application/pdf' });
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
      alert("Failed to generate PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in transition duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image to PDF</h1>
        <p className="text-gray-500">Upload your images, reorder them, and optionally attach a beautiful cover.</p>
      </div>

      <UploadZone onDropFiles={handleDrop} accept={{ 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] }} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 min-h-[300px]">
          {files.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold border-b pb-2">Uploaded Images</h2>
              <SortablePageGrid 
                items={files} 
                onReorder={(items) => setFiles(items as FileItem[])} 
                onRemove={(id) => setFiles(files.filter(f => f.id !== id))} 
                onEdit={(id) => setEditingId(id)}
              />
              
              <label className="flex items-center gap-3 p-3 mt-4 border rounded-xl bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={applyAutoCrop}
                    onChange={(e) => setApplyAutoCrop(e.target.checked)}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Auto Crop All Images</span>
                  <span className="text-xs text-slate-600">Detects background paper bounds and aggressively crops empty space automatically.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 mt-2 border rounded-xl bg-orange-50 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    checked={applyBwFilter}
                    onChange={(e) => setApplyBwFilter(e.target.checked)}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Apply Black & White Filter</span>
                  <span className="text-xs text-slate-600">Simulates a crisp, structural document scanner output format.</span>
                </div>
              </label>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              No images uploaded yet. You can still generate just the cover page!
            </div>
          )}
        </div>

        <div className="space-y-6">
          <CoverEditor options={coverOptions} onChange={setCoverOptions} />
          <button 
            onClick={handleGeneratePdf}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Generate & Download PDF"}
          </button>
        </div>
      </div>
      
      <ImageEditorModal 
        isOpen={!!editingId}
        fileUrl={files.find(f => f.id === editingId)?.url || null}
        onClose={() => setEditingId(null)}
        onSave={handleSaveCrop}
      />
    </div>
  );
}
