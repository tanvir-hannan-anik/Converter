"use client";
import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface UploadZoneProps {
  onDropFiles: (files: File[]) => void;
  accept?: DropzoneOptions['accept'];
  maxFiles?: number;
  label?: string;
}

function acceptedExtensions(accept?: DropzoneOptions['accept']): string {
  if (!accept) return '';
  return Object.values(accept)
    .flat()
    .map(ext => ext.replace('.', '').toUpperCase())
    .join(', ');
}

export default function UploadZone({
  onDropFiles,
  accept,
  maxFiles,
  label = "Drag & drop files here, or click to browse",
}: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onDropFiles(acceptedFiles);
  }, [onDropFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  });

  const exts = acceptedExtensions(accept);

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 group
        ${isDragActive
          ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
          : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/60'
        }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center select-none">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          isDragActive ? 'bg-blue-100 scale-110' : 'bg-slate-100 group-hover:bg-blue-50 group-hover:scale-105'
        }`}>
          <UploadCloud
            size={26}
            className={`transition-colors duration-200 ${
              isDragActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'
            }`}
          />
        </div>

        {/* Text */}
        <div>
          <p className={`text-sm font-semibold transition-colors ${
            isDragActive ? 'text-blue-600' : 'text-slate-700'
          }`}>
            {isDragActive ? "Drop files here…" : label}
          </p>
          {exts && (
            <p className="text-xs text-slate-400 mt-1">Supported: {exts}</p>
          )}
        </div>
      </div>
    </div>
  );
}
