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

export default function UploadZone({ onDropFiles, accept, maxFiles, label = "Drag & drop files here, or click to select" }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onDropFiles(acceptedFiles);
  }, [onDropFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
      `}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600 font-medium">
        {isDragActive ? "Drop the files now..." : label}
      </p>
    </div>
  );
}
