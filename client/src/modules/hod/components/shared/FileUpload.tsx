import React, { useState, ChangeEvent } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function FileUpload({ onFileSelect, accept = '.pdf,.doc,.docx,.xlsx,.png,.jpg', maxSizeMB = 10, label = 'Upload Department Document' }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds maximum limit of ${maxSizeMB}MB`);
      return;
    }
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>
      {selectedFile ? (
        <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="size-5 text-blue-600" />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={`p-6 rounded-2xl border-2 border-dashed text-center transition cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
              : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-blue-400'
          }`}
        >
          <input type="file" accept={accept} onChange={handleInputChange} className="hidden" id="file-upload-input" />
          <label htmlFor="file-upload-input" className="cursor-pointer">
            <UploadCloud className="size-8 text-blue-500 mx-auto mb-2" />
            <p className="font-extrabold text-slate-900 dark:text-white text-xs">Click to browse or drag & drop</p>
            <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, XLSX (Max {maxSizeMB}MB)</p>
          </label>
        </div>
      )}
    </div>
  );
}
