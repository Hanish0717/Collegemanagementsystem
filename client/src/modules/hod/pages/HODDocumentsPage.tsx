import React, { useState, useEffect, useRef } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentDocuments, DocumentItem } from '../services/hodFinalService';
import { PageContainer } from '../components/shared/PageContainer';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { Modal } from '../components/shared/Modal';
import { downloadFile } from '../utils/exportUtils';
import {
  FolderOpen, Upload, Download, Search, Pin, FileText, File, Eye, CheckCircle2, ShieldCheck, Tag, X, FileCheck, RefreshCw,
} from 'lucide-react';

const CATEGORIES = [
  'All', 'Accreditation', 'Academic Files', 'Meeting Minutes',
  'Lesson Plans', 'Course Files', 'Research Papers', 'Policies', 'Templates',
];

const FORMAT_COLORS: Record<string, string> = {
  PDF: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  DOCX: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  XLSX: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PPTX: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const STORAGE_KEY = 'cms_hod_dynamic_documents';

export function HODDocumentsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newCategory, setNewCategory] = useState('Academic Files');
  const [newFormat, setNewFormat] = useState('PDF');
  const [newSize, setNewSize] = useState('1.2 MB');
  const [newTags, setNewTags] = useState('R23, Academic, Official');
  const [isPinned, setIsPinned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // 1. Try loading from localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDocs(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error parsing documents store:', e);
      }
    }

    // 2. Fetch default documents
    fetchDepartmentDocuments(departmentCode).then((res) => {
      const initialDocs = (res as any).documents || [];
      setDocs(initialDocs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDocs));
    });
  }, [departmentCode]);

  const saveDocsToStore = (updatedDocs: DocumentItem[]) => {
    setDocs(updatedDocs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
    window.dispatchEvent(new CustomEvent('hod_store_updated'));
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setNewDocName(file.name.replace(/\.[^/.]+$/, ''));
    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    setNewFormat(['PDF', 'DOCX', 'XLSX', 'PPTX'].includes(ext) ? ext : 'PDF');
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setNewSize(sizeMb === '0.0' ? '450 KB' : `${sizeMb} MB`);
    NotificationToast.success('File Attached', `Selected "${file.name}" for upload.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleConfirmUpload = () => {
    if (!newDocName.trim()) {
      NotificationToast.warning('Invalid Input', 'Please enter a valid document title or select a file.');
      return;
    }

    const newDoc: DocumentItem = {
      id: `DOC-${Date.now()}`,
      name: newDocName,
      category: newCategory,
      uploadedBy: `Dr. HOD (${departmentInfo.shortName})`,
      uploadedDate: new Date().toISOString().split('T')[0],
      size: newSize || '1.0 MB',
      format: newFormat,
      pinned: isPinned,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const updated = [newDoc, ...docs];
    saveDocsToStore(updated);

    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setNewDocName('');
    setNewTags('R23, Academic, Official');
    setIsPinned(false);

    NotificationToast.success(
      'Document Uploaded Successfully',
      `Added "${newDoc.name}" to ${newCategory} category in ${departmentInfo.shortName} document vault.`
    );
  };

  const handleDownloadDoc = (doc: DocumentItem) => {
    const fileName = `${doc.name.replace(/\s+/g, '_')}.${doc.format.toLowerCase()}`;
    const fileContent = `====================================================================
COLLEGE MANAGEMENT SYSTEM — OFFICIAL DEPARTMENT DOCUMENT
DEPARTMENT: ${departmentInfo.name} (${departmentInfo.code})
DOCUMENT TITLE: ${doc.name}
DOCUMENT ID: ${doc.id}
CATEGORY: ${doc.category}
FORMAT: ${doc.format} | SIZE: ${doc.size}
UPLOADED BY: ${doc.uploadedBy}
UPLOAD DATE: ${doc.uploadedDate}
TAGS: ${doc.tags.join(', ')}
====================================================================

DOCUMENT DESCRIPTION & CONTENTS:
This official document is stored securely within the ${departmentInfo.name} Department Library.
It contains accredited academic blueprints, curriculum frameworks, meeting minutes, and course outcome attestations.

1. EXECUTIVE SUMMARY & OBJECTIVES:
   - Accredited by BOS (Board of Studies) & Academic Council.
   - Compliance verified for R23 Regulation Curriculum.
   - Authorized by HOD Command Center for Department Records.

2. DEPARTMENT AUTHORIZATION STAMP:
   Digitally Signed & Certified by Head of Department (${departmentInfo.name}).
   Timestamp: ${new Date().toLocaleString()}
`;

    downloadFile(fileName, fileContent, 'text/plain;charset=utf-8;');
    NotificationToast.success(
      'Document Download Started',
      `Downloaded ${fileName} (${doc.size}) to your local computer.`
    );
  };

  const filtered = docs.filter((d) => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const pinned = filtered.filter((d) => d.pinned);
  const rest = filtered.filter((d) => !d.pinned);

  return (
    <PageContainer
      title="Department Document Library"
      subtitle={`Accreditation files, academic documents, meeting minutes, and department circulars for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Document Library' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            iconLeft={Upload}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </Button>
        </div>
      }
    >
      {/* Search + Category Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name or tag..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Pinned Documents */}
      {pinned.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <Pin className="size-3.5 text-amber-500" /> Pinned Documents
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pinned.map((d) => (
              <DocCard
                key={d.id}
                doc={d}
                onPreview={() => setSelectedDocForPreview(d)}
                onDownload={() => handleDownloadDoc(d)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Documents */}
      <div className="space-y-2">
        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <FolderOpen className="size-3.5 text-blue-500" />
          {activeCategory === 'All' ? 'All Documents' : activeCategory} ({rest.length})
        </p>
        {rest.length === 0 && pinned.length === 0 && (
          <GlassCard className="p-12 text-center">
            <FolderOpen className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="font-extrabold text-slate-700 dark:text-white text-sm">No documents found</p>
            <p className="text-xs text-slate-500 mt-1">Upload your first document to get started.</p>
          </GlassCard>
        )}
        <div className="space-y-2">
          {rest.map((d) => (
            <DocRow
              key={d.id}
              doc={d}
              onPreview={() => setSelectedDocForPreview(d)}
              onDownload={() => handleDownloadDoc(d)}
            />
          ))}
        </div>
      </div>

      {/* 1. Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Department Document"
        subtitle={`Upload files to ${departmentInfo.name} official document repository`}
        variant="upload"
        confirmLabel="Upload File"
        onConfirm={handleConfirmUpload}
      >
        <div className="space-y-3">
          {/* File Drag & Drop / Selection Feedback Area */}
          {selectedFile ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-500 text-center space-y-1">
              <FileCheck className="size-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • File Format: {newFormat}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setNewDocName('');
                }}
                className="mt-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="size-3" /> Change File
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-5 border-2 border-dashed rounded-2xl text-center cursor-pointer transition ${
                isDragging
                  ? 'border-blue-600 bg-blue-100/60 dark:bg-blue-900/40 scale-102'
                  : 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50'
              }`}
            >
              <Upload className="size-8 text-blue-600 mx-auto mb-1 animate-pulse" />
              <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                Click or Drag & Drop a file here
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Supports PDF, DOCX, XLSX, PPTX (Up to 50MB)</p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
          />

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Document Title</label>
            <input
              type="text"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="e.g. Odd Semester Timetable 2026-27"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">File Format</label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="PDF">PDF Document</option>
                <option value="DOCX">Word (.docx)</option>
                <option value="XLSX">Excel (.xlsx)</option>
                <option value="PPTX">PowerPoint (.pptx)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Tags (comma-separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g. Timetable, Sem 5, R23"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-semibold text-xs"
            />
          </div>

          <label className="flex items-center gap-2 font-extrabold text-xs text-slate-800 dark:text-slate-200 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded size-4 text-blue-600"
            />
            Pin to top of Document Library
          </label>
        </div>
      </Modal>

      {/* 2. Document Preview / View Modal */}
      {selectedDocForPreview && (
        <Modal
          isOpen={Boolean(selectedDocForPreview)}
          onClose={() => setSelectedDocForPreview(null)}
          title="Document Viewer & Preview"
          subtitle={`Previewing official document for ${departmentInfo.name}`}
          variant="preview"
          confirmLabel="Download File"
          cancelLabel="Close Preview"
          onConfirm={() => {
            handleDownloadDoc(selectedDocForPreview);
            setSelectedDocForPreview(null);
          }}
        >
          <div className="space-y-4">
            {/* Header Details */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">
                  {selectedDocForPreview.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  {selectedDocForPreview.category} • {selectedDocForPreview.size} • Uploaded on {selectedDocForPreview.uploadedDate}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${FORMAT_COLORS[selectedDocForPreview.format] || 'bg-slate-200 text-slate-700'}`}>
                {selectedDocForPreview.format}
              </span>
            </div>

            {/* Document Body Preview Area */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-serif text-slate-800 dark:text-slate-200 text-xs space-y-3 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar shadow-inner">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-3 font-sans">
                <p className="font-black text-sm text-blue-600 dark:text-blue-400">COLLEGE OF ENGINEERING & TECHNOLOGY</p>
                <p className="font-extrabold text-xs text-slate-600 dark:text-slate-400">DEPARTMENT OF {departmentInfo.name.toUpperCase()}</p>
                <p className="text-[10px] text-slate-400 mt-1">Official Document Ref: {selectedDocForPreview.id}</p>
              </div>

              <h5 className="font-black text-center text-slate-900 dark:text-white text-xs font-sans">
                {selectedDocForPreview.name}
              </h5>

              <p className="text-justify text-[11px]">
                This document serves as an official institutional record for the Department of {departmentInfo.name} ({departmentInfo.code}). It details the accredited course structures, academic policies, meeting minutes, and laboratory operations verified under the R23 Curriculum Regulations.
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-sans text-[11px] space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Document Compliance Metadata:</p>
                <p>• Verified by BOS (Board of Studies) Committee</p>
                <p>• Department Head Authorizer: {selectedDocForPreview.uploadedBy}</p>
                <p>• Tags & Classification: {selectedDocForPreview.tags.join(', ')}</p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] font-sans text-slate-400 border-t border-slate-100 dark:border-slate-900">
                <span>Verified Seal: Certified ✅</span>
                <span>HOD Digital Signature Attached</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

function DocCard({
  doc,
  onPreview,
  onDownload,
}: {
  doc: DocumentItem;
  onPreview: () => void;
  onDownload: () => void;
}) {
  return (
    <GlassCard className="p-4 flex items-start gap-3 hover:shadow-md transition-all">
      <div className="size-10 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
        <FileText className="size-5 text-rose-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{doc.name}</h5>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
          {doc.category} • {doc.size} • {doc.uploadedDate}
        </p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {doc.tags.map((t) => (
            <span
              key={t}
              className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onPreview}
          className="p-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-blue-600 cursor-pointer"
          title="Preview Document"
        >
          <Eye className="size-4" />
        </button>
        <button
          onClick={onDownload}
          className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-emerald-600 cursor-pointer"
          title="Download File"
        >
          <Download className="size-4" />
        </button>
      </div>
    </GlassCard>
  );
}

function DocRow({
  doc,
  onPreview,
  onDownload,
}: {
  doc: DocumentItem;
  onPreview: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 hover:shadow-md transition-all text-xs font-semibold">
      <File className="size-5 text-slate-400 shrink-0" />
      <span className="flex-1 font-bold text-slate-900 dark:text-white truncate">{doc.name}</span>
      <span className="text-slate-500 shrink-0 hidden sm:block">{doc.category}</span>
      <span
        className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
          FORMAT_COLORS[doc.format] || 'bg-slate-100 text-slate-600'
        }`}
      >
        {doc.format}
      </span>
      <span className="text-slate-400 shrink-0 hidden md:block">{doc.size}</span>
      <span className="text-slate-400 shrink-0 hidden md:block">{doc.uploadedDate}</span>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onPreview}
          className="p-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-blue-600 cursor-pointer"
          title="Preview Document"
        >
          <Eye className="size-4" />
        </button>
        <button
          onClick={onDownload}
          className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-emerald-600 cursor-pointer"
          title="Download File"
        >
          <Download className="size-4" />
        </button>
      </div>
    </div>
  );
}
