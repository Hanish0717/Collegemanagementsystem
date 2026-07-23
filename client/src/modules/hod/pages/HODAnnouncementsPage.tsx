import React, { useState, useEffect, useRef } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { PageContainer } from '../components/shared/PageContainer';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { NotificationToast } from '../components/shared/NotificationToast';
import { exportToCSV } from '../utils/exportUtils';
import { downloadFile } from '../utils/exportUtils';
import {
  Megaphone, Plus, Download, Search, Filter, Eye, Edit3, Trash2, Archive, RefreshCw, FileText,
  FileCheck, Calendar, Users, AlertTriangle, ShieldAlert, CheckCircle2, Clock, Pin, File, Upload,
} from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  audience: string;
  department: string;
  semester?: number | null;
  section?: string | null;
  expiryDate?: string | null;
  status: 'Published' | 'Scheduled' | 'Archived' | 'Draft';
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  publishedBy: string;
  publishedDate: string;
}

const CATEGORIES = [
  'All', 'General', 'Academic', 'Examination', 'Attendance',
  'Placement', 'Internship', 'Event', 'Holiday', 'Meeting', 'Circular', 'Emergency',
];

const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];

const AUDIENCES = [
  'All', 'All Faculty', 'All Students', 'Faculty Only', 'Students Only',
  'Specific Faculty', 'Specific Student', 'Semester', 'Section', 'Class Advisors', 'Faculty Mentors',
];

const STATUSES = ['All', 'Published', 'Scheduled', 'Archived', 'Draft'];

const PRIORITY_BADGES: Record<string, string> = {
  Low: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900',
  Medium: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-900',
  High: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  Critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900',
};

const STATUS_BADGES: Record<string, string> = {
  Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  Archived: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

const STORAGE_KEY = 'cms_hod_announcements_store';

export function HODAnnouncementsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activeTab, setActiveTab] = useState<'announcements' | 'circulars'>('announcements');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedAudience, setSelectedAudience] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewAnn, setPreviewAnn] = useState<AnnouncementItem | null>(null);
  const [editingAnn, setEditingAnn] = useState<AnnouncementItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [audience, setAudience] = useState('All Students');
  const [semester, setSemester] = useState('5');
  const [section, setSection] = useState('A');
  const [expiryDate, setExpiryDate] = useState('2026-08-30');
  const [status, setStatus] = useState<'Published' | 'Scheduled' | 'Archived' | 'Draft'>('Published');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // 1. Try loading from localStorage store
    const saved = localStorage.getItem(`${STORAGE_KEY}_${departmentCode}`);
    if (saved) {
      try {
        setAnnouncements(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error parsing announcements store:', e);
      }
    }

    // 2. Default Seed Announcements
    const defaultData: AnnouncementItem[] = [
      {
        id: 'ANN-2026-001',
        title: 'Mid-1 Internal Examination Schedule & Syllabus',
        description: 'Official Mid-1 Examination timetable for all 3rd Year B.Tech students. Question papers will cover Modules 1 & 2.',
        category: 'Examination',
        priority: 'High',
        audience: 'All Students',
        department: departmentCode,
        semester: 5,
        section: 'A',
        expiryDate: '2026-08-15',
        status: 'Published',
        attachmentName: 'Mid1_Exam_Timetable_2026.pdf',
        publishedBy: `Dr. HOD (${departmentInfo.shortName})`,
        publishedDate: '2026-07-22',
      },
      {
        id: 'ANN-2026-002',
        title: 'NBA Accreditation Criterion 5 Faculty Review Meeting',
        description: 'All department faculty members are requested to attend the Criterion 5 compliance review in HOD Conference Room.',
        category: 'Meeting',
        priority: 'Critical',
        audience: 'All Faculty',
        department: departmentCode,
        semester: null,
        section: null,
        expiryDate: '2026-07-30',
        status: 'Published',
        attachmentName: 'NBA_Criterion5_Agenda.pdf',
        publishedBy: `Dr. HOD (${departmentInfo.shortName})`,
        publishedDate: '2026-07-20',
      },
      {
        id: 'ANN-2026-003',
        title: 'Campus Placement Drive — Microsoft & Google AI Labs',
        description: 'Eligible 5th & 7th semester students with CGPA >= 8.0 must submit resumes to Placement Cell by Friday.',
        category: 'Placement',
        priority: 'High',
        audience: 'All Students',
        department: departmentCode,
        semester: 5,
        section: null,
        expiryDate: '2026-08-10',
        status: 'Published',
        attachmentName: 'Placement_Eligibility_Matrix.pdf',
        publishedBy: `Dr. HOD (${departmentInfo.shortName})`,
        publishedDate: '2026-07-18',
      },
    ];

    setAnnouncements(defaultData);
    localStorage.setItem(`${STORAGE_KEY}_${departmentCode}`, JSON.stringify(defaultData));
  }, [departmentCode, departmentInfo.shortName]);

  const saveAnnouncements = (updated: AnnouncementItem[]) => {
    setAnnouncements(updated);
    localStorage.setItem(`${STORAGE_KEY}_${departmentCode}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('hod_store_updated'));
    window.dispatchEvent(new CustomEvent('notification_updated'));
  };

  const handleOpenCreateModal = () => {
    setTitle('');
    setDescription('');
    setCategory('Academic');
    setPriority('High');
    setAudience('All Students');
    setSemester('5');
    setSection('A');
    setExpiryDate('2026-08-30');
    setStatus('Published');
    setAttachment(null);
    setIsCreateModalOpen(true);
  };

  const handlePublishAnnouncement = () => {
    if (!title.trim() || !description.trim()) {
      NotificationToast.warning('Missing Required Fields', 'Please fill in both Announcement Title and Description.');
      return;
    }

    const newAnn: AnnouncementItem = {
      id: `ANN-${Date.now()}`,
      title,
      description,
      category,
      priority,
      audience,
      department: departmentCode,
      semester: semester ? parseInt(semester) : null,
      section: section || null,
      expiryDate,
      status,
      attachmentName: attachment ? attachment.name : 'Official_Notice.pdf',
      publishedBy: `Dr. HOD (${departmentInfo.shortName})`,
      publishedDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newAnn, ...announcements];
    saveAnnouncements(updated);

    setIsCreateModalOpen(false);

    NotificationToast.success(
      'Announcement Published & Dispatched',
      `Published "${newAnn.title}" — Automatically generated notifications for ${audience}!`
    );
  };

  const handleStatusChange = (id: string, newStatus: 'Published' | 'Scheduled' | 'Archived' | 'Draft') => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    saveAnnouncements(updated);
    NotificationToast.info('Status Updated', `Announcement status changed to ${newStatus}.`);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    saveAnnouncements(updated);
    NotificationToast.success('Announcement Deleted', `Removed announcement record ${id}.`);
  };

  const handleExportCSV = () => {
    const filename = `${departmentInfo.shortName}_Announcements_Records.csv`;
    const exportData = announcements.map((a) => ({
      'ID': a.id,
      'Title': a.title,
      'Category': a.category,
      'Priority': a.priority,
      'Audience': a.audience,
      'Department': a.department,
      'Published By': a.publishedBy,
      'Published Date': a.publishedDate,
      'Expiry Date': a.expiryDate || 'N/A',
      'Status': a.status,
      'Attachment': a.attachmentName || 'None',
    }));

    exportToCSV(filename, exportData);
    NotificationToast.success('Export Downloaded', `Exported ${exportData.length} announcement records to ${filename}.`);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchPri = selectedPriority === 'All' || a.priority === selectedPriority;
    const matchAud = selectedAudience === 'All' || a.audience === selectedAudience;
    const matchSta = selectedStatus === 'All' || a.status === selectedStatus;
    return matchSearch && matchCat && matchPri && matchAud && matchSta;
  });

  const circularsList = announcements.filter((a) => a.attachmentName || a.category === 'Circular');

  return (
    <PageContainer
      title="📢 Announcements & Circulars"
      subtitle={`Publish official department announcements, broadcast exam timetables, and dispatch circulars for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Announcements & Circulars' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" iconLeft={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" iconLeft={Plus} onClick={handleOpenCreateModal}>
            Create Announcement
          </Button>
        </div>
      }
    >
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-extrabold">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Megaphone className="size-4" /> Announcements Registry ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('circulars')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'circulars'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="size-4" /> Official Circulars Vault ({circularsList.length})
        </button>
      </div>

      {activeTab === 'announcements' ? (
        <>
          {/* Search Cockpit & Multi-Filters */}
          <GlassCard className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements by title, keyword, or circular contents..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Audience Target</label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Publish Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Announcements Table */}
          <GlassCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Announcement Title & Details</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Audience</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Published By</th>
                    <th className="p-3.5">Dates</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                        No announcements match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAnnouncements.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 max-w-xs">
                          <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                            {a.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{a.description}</p>
                          {a.attachmentName && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              <FileText className="size-3" /> {a.attachmentName}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {a.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                            {a.audience}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              PRIORITY_BADGES[a.priority] || PRIORITY_BADGES.Medium
                            }`}
                          >
                            {a.priority}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{a.publishedBy}</p>
                          <p className="text-[10px] text-slate-400">{a.department} Department</p>
                        </td>

                        <td className="p-3.5">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            Pub: {a.publishedDate}
                          </p>
                          {a.expiryDate && (
                            <p className="text-[10px] text-rose-500 font-semibold">Exp: {a.expiryDate}</p>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              STATUS_BADGES[a.status] || STATUS_BADGES.Published
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setPreviewAnn(a)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition cursor-pointer"
                            title="View Preview"
                          >
                            <Eye className="size-4" />
                          </button>
                          {a.status === 'Archived' ? (
                            <button
                              onClick={() => handleStatusChange(a.id, 'Published')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                              title="Republish"
                            >
                              <RefreshCw className="size-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(a.id, 'Archived')}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition cursor-pointer"
                              title="Archive Announcement"
                            >
                              <Archive className="size-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAnnouncement(a.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      ) : (
        /* Circulars Vault View */
        <div className="space-y-4">
          <GlassCard className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                {departmentInfo.shortName} Official Circulars & Document Orders
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Download verified PDF and Word circulars published by HOD Command Center
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {circularsList.length} Circulars Verified
            </span>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {circularsList.map((c) => (
              <GlassCard key={c.id} className="p-4 flex items-start gap-3 hover:shadow-md transition">
                <div className="size-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 text-blue-600">
                  <FileText className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                    {c.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Ref: {c.id} • Version v1.0 • Date: {c.publishedDate}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                      Target: {c.audience}
                    </span>
                    <span className="text-[10px] text-slate-400">By {c.publishedBy}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    downloadFile(
                      c.attachmentName || `${c.title.replace(/\s+/g, '_')}.pdf`,
                      `OFFICIAL CIRCULAR CONTENT\nDEPARTMENT: ${departmentInfo.name}\nTITLE: ${c.title}\nDATE: ${c.publishedDate}\nBY: ${c.publishedBy}`,
                      'text/plain;charset=utf-8;'
                    );
                    NotificationToast.success('Circular Downloaded', `Downloaded ${c.attachmentName || c.title}`);
                  }}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shrink-0"
                  title="Download Circular"
                >
                  <Download className="size-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* 1. Create Announcement Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="📢 Create Department Announcement"
        subtitle={`Publish new announcement for ${departmentInfo.name} — Delivers notifications automatically to recipient portals.`}
        variant="edit"
        confirmLabel="Publish Announcement"
        onConfirm={handlePublishAnnouncement}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
              Announcement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-1 Internal Examination Schedule & Guidelines"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
              Description / Circular Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed announcement message..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Highlighted Alert)</option>
                <option value="Critical">Critical (Immediate Emergency Push)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              {AUDIENCES.filter((a) => a !== 'All').map((aud) => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                Semester Target (Optional)
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="">All Semesters</option>
                <option value="1">Sem 1</option>
                <option value="3">Sem 3</option>
                <option value="5">Sem 5</option>
                <option value="7">Sem 7</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Attachment Upload Zone */}
          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
              Circular File Attachment (PDF/DOC/Image)
            </label>
            {attachment ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-400 flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-bold text-xs">
                <span className="flex items-center gap-1.5 truncate">
                  <FileCheck className="size-4 text-emerald-600" /> {attachment.name} (
                  {(attachment.size / 1024).toFixed(0)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-rose-600 hover:underline text-[10px]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-center cursor-pointer hover:bg-blue-100/50 transition"
              >
                <Upload className="size-5 text-blue-600 mx-auto mb-1" />
                <p className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">
                  Attach Circular File (PDF, DOCX, PNG)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && setAttachment(e.target.files[0])}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* 2. Announcement Preview Modal */}
      {previewAnn && (
        <Modal
          isOpen={Boolean(previewAnn)}
          onClose={() => setPreviewAnn(null)}
          title="📢 Announcement Preview"
          subtitle={`Published for ${previewAnn.department} Department`}
          variant="info"
          confirmLabel="Download Circular Attachment"
          cancelLabel="Close Preview"
          onConfirm={() => {
            if (previewAnn.attachmentName) {
              downloadFile(
                previewAnn.attachmentName,
                `OFFICIAL ANNOUNCEMENT ATTACHMENT\nTITLE: ${previewAnn.title}\nPUBLISHED BY: ${previewAnn.publishedBy}\nDATE: ${previewAnn.publishedDate}\nCONTENT:\n${previewAnn.description}`,
                'text/plain;charset=utf-8;'
              );
              NotificationToast.success('Attachment Downloaded', `Downloaded ${previewAnn.attachmentName}`);
            }
          }}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {previewAnn.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    PRIORITY_BADGES[previewAnn.priority] || PRIORITY_BADGES.Medium
                  }`}
                >
                  Priority: {previewAnn.priority}
                </span>
              </div>

              <h4 className="font-black text-slate-900 dark:text-white text-sm pt-1">
                {previewAnn.title}
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {previewAnn.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 font-semibold">
              <p className="text-slate-500">
                Target Audience: <span className="font-bold text-slate-900 dark:text-white">{previewAnn.audience}</span>
              </p>
              <p className="text-slate-500">
                Published By: <span className="font-bold text-slate-900 dark:text-white">{previewAnn.publishedBy}</span>
              </p>
              <p className="text-slate-500">
                Published Date: <span className="font-bold text-slate-900 dark:text-white">{previewAnn.publishedDate}</span>
              </p>
              {previewAnn.expiryDate && (
                <p className="text-rose-500">
                  Expiry Date: <span className="font-bold">{previewAnn.expiryDate}</span>
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
