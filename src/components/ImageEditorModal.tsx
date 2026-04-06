"use client";
import React, { useRef } from 'react';
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { getAutoCropRect } from '@/lib/imageProcessing';
import { Crop, Check, X, RotateCw, RotateCcw } from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  fileUrl: string | null;
  onClose: () => void;
  onSave: (croppedBlob: Blob) => void;
}

export default function ImageEditorModal({ isOpen, fileUrl, onClose, onSave }: ImageEditorModalProps) {
  const cropperRef = useRef<ReactCropperElement>(null);

  if (!isOpen || !fileUrl) return null;

  const handleAutoCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    
    // Snag the underlying HTML image natively from cropper's DOM injection
    const imageElement = document.querySelector('.cropper-hidden') as HTMLImageElement;
    if (imageElement) {
        const cropRect = getAutoCropRect(imageElement);
        if (cropRect) {
           cropper.setData(cropRect);
        } else {
           alert("Could not detect strong structural edges for auto-cropping. The background and foreground might not have enough structural contrast!");
        }
    }
  };

  const handleRotateLeft = () => {
    cropperRef.current?.cropper?.rotate(-90);
  };

  const handleRotateRight = () => {
    cropperRef.current?.cropper?.rotate(90);
  };

  const handleSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      }).toBlob((blob) => {
        if (blob) {
          onSave(blob);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in transition duration-500">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Crop Image</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500"/>
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden bg-slate-900 p-4 flex items-center justify-center min-h-[50vh]">
          <Cropper
            src={fileUrl}
            style={{ height: '100%', width: '100%' }}
            initialAspectRatio={NaN}
            guides={true}
            ref={cropperRef}
            viewMode={1}
            dragMode="crop"
            background={false}
            responsive={true}
            checkOrientation={false}
            autoCrop={true}
            autoCropArea={1}
            ready={handleAutoCrop}
          />
        </div>

        <div className="p-4 border-t bg-gray-50 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleAutoCrop}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg transition-colors shadow-sm"
              title="Auto Detect Document Bounds"
            >
              <Crop size={18} /> 
              <span className="hidden sm:inline">Magic Auto-Crop</span>
            </button>
            <button
              onClick={handleRotateLeft}
              className="p-2 border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm"
              title="Rotate Left"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={handleRotateRight}
              className="p-2 border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm"
              title="Rotate Right"
            >
              <RotateCw size={20} />
            </button>
          </div>
          
          <div className="flex gap-3">
             <button onClick={onClose} className="px-5 py-2 font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 bg-white shadow-sm">
                Cancel
             </button>
             <button 
                onClick={handleSave} 
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
             >
                <Check size={18}/> 
                Save Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
