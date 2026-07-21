import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentDocuments, DocumentItem } from '../services/hodFinalService';
import { PageContainer } from '../components/shared/PageContainer';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import {
  FolderOpen, Upload, Download, Search, Pin, FileText, File, Eye, MoreHorizontal,
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

export function HODDocumentsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchDepartmentDocuments(departmentCode).then(res => setDocs((res as any).documents || []));
  }, [departmentCode]);

  const filtered = docs.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const pinned = filtered.filter(d => d.pinned);
  const rest = filtered.filter(d => !d.pinned);

  return (
    <PageContainer
      title="Department Document Library"
      subtitle={`Accreditation files, academic documents, meeting minutes, and department circulars for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Document Library' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" iconLeft={Upload} onClick={() => NotificationToast.info('Upload Ready', 'Select a file to upload to the document vault.')}>
            Upload Document
          </Button>
        </div>
      }
    >
      {/* Search + Category Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents by name or tag..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition ${
                activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600'
              }`}>
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
            {pinned.map(d => <DocCard key={d.id} doc={d} />)}
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
          {rest.map(d => <DocRow key={d.id} doc={d} />)}
        </div>
      </div>
    </PageContainer>
  );
}

function DocCard({ doc }: { doc: DocumentItem }) {
  return (
    <GlassCard className="p-4 flex items-start gap-3 hover:shadow-md transition-all">
      <div className="size-10 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
        <FileText className="size-5 text-rose-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{doc.name}</h5>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{doc.category} • {doc.size} • {doc.uploadedDate}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {doc.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400">{t}</span>)}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button className="p-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-blue-600" title="Preview">
          <Eye className="size-3.5" />
        </button>
        <button className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-emerald-600" title="Download">
          <Download className="size-3.5" />
        </button>
      </div>
    </GlassCard>
  );
}

function DocRow({ doc }: { doc: DocumentItem }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 hover:shadow-md transition-all text-xs font-semibold">
      <File className="size-5 text-slate-400 shrink-0" />
      <span className="flex-1 font-bold text-slate-900 dark:text-white truncate">{doc.name}</span>
      <span className="text-slate-500 shrink-0 hidden sm:block">{doc.category}</span>
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${FORMAT_COLORS[doc.format] || 'bg-slate-100 text-slate-600'}`}>{doc.format}</span>
      <span className="text-slate-400 shrink-0 hidden md:block">{doc.size}</span>
      <span className="text-slate-400 shrink-0 hidden md:block">{doc.uploadedDate}</span>
      <div className="flex gap-1 shrink-0">
        <button className="p-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-blue-600"><Eye className="size-3.5" /></button>
        <button className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-emerald-600"><Download className="size-3.5" /></button>
      </div>
    </div>
  );
}
