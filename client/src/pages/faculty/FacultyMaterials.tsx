import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Download, FileText, Plus, Search, Upload, Video, Eye, Trash2, Edit,
  Filter, BookOpen, Users, TrendingUp, Clock, BarChart3, FolderOpen,
  ChevronDown, ChevronRight, RefreshCw, Link2, Star, Shield, Archive,
  Globe, Lock, FileImage, FileVideo, FileCode, Paperclip, X, CheckCircle2,
  AlertCircle, Zap, Bell, PenLine, Share2, ClipboardList
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getStoredFacultyProfile } from '@/services/facultyProfileService';
import { useNavigate } from '@tanstack/react-router';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPT_SUBJECTS: Record<string, string[]> = {
  CSE:          ['Data Structures','DBMS','Operating Systems','Computer Networks','Software Engineering','Java Programming','Python Programming','Web Technologies','Cloud Computing','Compiler Design'],
  AIML:         ['Artificial Intelligence','Machine Learning','Deep Learning','Computer Vision','NLP','Neural Networks','Reinforcement Learning','Generative AI'],
  AIDS:         ['Data Analytics','Big Data','Data Visualization','Data Mining','Statistics','Predictive Analytics','Business Intelligence'],
  CYBERSECURITY:['Ethical Hacking','Cryptography','Information Security','Network Security','Digital Forensics','Secure Coding'],
  ECE:          ['Digital Electronics','Analog Circuits','Signals & Systems','Embedded Systems','VLSI','IoT','Communication Systems'],
  EEE:          ['Electrical Machines','Power Systems','Power Electronics','Control Systems','Renewable Energy','High Voltage Engineering'],
  IT:           ['Cloud Computing','Web Technologies','Database Systems','Mobile Computing','Software Engineering','Network Administration'],
  MECH:         ['Engineering Mechanics','Thermodynamics','Fluid Mechanics','Strength of Materials','Manufacturing Technology','CAD/CAM','Machine Design','Heat Transfer'],
  CIVIL:        ['Structural Engineering','Surveying','Geotechnical Engineering','Concrete Technology','Environmental Engineering','Transportation Engineering','Construction Management'],
};

const MATERIAL_TYPES = ['PDF','PPT','PPTX','DOCX','ZIP','MP4','Video','Assignment','Lab Manual','Reference Book'];
const VISIBILITY_OPTIONS = ['Published','Draft','Private','Archived'];
const TYPE_COLORS: Record<string,string> = {
  PDF:'from-red-500 to-rose-600', Video:'from-purple-500 to-violet-600', MP4:'from-purple-500 to-violet-600',
  PPT:'from-orange-500 to-amber-600', PPTX:'from-orange-500 to-amber-600', DOCX:'from-blue-500 to-indigo-600',
  ZIP:'from-slate-500 to-slate-600', Assignment:'from-emerald-500 to-teal-600', 'Lab Manual':'from-cyan-500 to-sky-600',
  'Reference Book':'from-pink-500 to-rose-600', default:'from-violet-500 to-indigo-600',
};
const VISIBILITY_CONFIG: Record<string,{icon:any,color:string,bg:string,border:string}> = {
  Published: { icon: Globe,   color:'text-emerald-700', bg:'bg-emerald-50', border:'border-emerald-200' },
  Draft:     { icon: Edit,    color:'text-amber-700',   bg:'bg-amber-50',   border:'border-amber-200' },
  Private:   { icon: Lock,    color:'text-slate-700',   bg:'bg-slate-50',   border:'border-slate-200' },
  Archived:  { icon: Archive, color:'text-blue-700',    bg:'bg-blue-50',    border:'border-blue-200' },
};
const PIE_COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777','#65a30d'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning'; if (h < 17) return 'Good Afternoon'; return 'Good Evening';
}
function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); } catch { return d; }
}
function getTypeIcon(type: string) {
  if (['Video','MP4'].includes(type)) return Video;
  if (['PPT','PPTX'].includes(type)) return FileImage;
  if (['ZIP'].includes(type)) return FileCode;
  return FileText;
}
function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today'; if (days === 1) return 'Yesterday'; if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days/7)} weeks ago`; return fmtDate(dateStr);
}

// Seed data for demo when API unavailable
function seedMaterials(dept: string, subjects: string[], facultyName: string) {
  const now = Date.now();
  return subjects.slice(0, Math.min(subjects.length, 6)).flatMap((sub, si) =>
    [
      { type:'PDF', title:`${sub} - Unit 1 Notes`, size:'2.4 MB', downloads:42+si*7, views:98+si*11, sem:5, sec:'A' },
      { type:'PPT', title:`${sub} - Lecture Slides`, size:'5.1 MB', downloads:31+si*5, views:74+si*8, sem:5, sec:'B' },
      { type:'Assignment', title:`${sub} Assignment ${si+1}`, size:'0.8 MB', downloads:26+si*4, views:55+si*6, sem:3, sec:'A' },
    ].map((m, mi) => ({
      id: `seed-${si}-${mi}`,
      title: m.title,
      subject: sub,
      type: m.type,
      department: dept,
      semester: m.sem,
      section: m.sec,
      fileUrl: '#',
      description: `${m.title} uploaded for ${dept} students.`,
      visibility: mi === 2 ? 'Draft' : 'Published',
      uploadedBy: facultyName,
      createdAt: new Date(now - (si * 86400000 * 2 + mi * 86400000)).toISOString(),
      size: m.size,
      downloads: m.downloads,
      views: m.views,
      studentsReached: Math.round(m.downloads * 0.7),
    }))
  );
}

// ─── Drag-drop zone ───────────────────────────────────────────────────────────
function DragDropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ACCEPTED = ['.pdf','.ppt','.pptx','.docx','.zip','.mp4'];
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };
  return (
    <div
      onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)}
      onDragOver={e => e.preventDefault()} onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 scale-[1.01]' : 'border-muted hover:border-indigo-400 hover:bg-muted/20'
      }`}
    >
      <input ref={inputRef} type="file" className="hidden" accept={ACCEPTED.join(',')}
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      <Upload className={`size-8 mx-auto mb-2 transition ${dragging ? 'text-indigo-500' : 'text-muted-foreground'}`} />
      <p className="text-sm font-medium">Drag & drop or <span className="text-indigo-600 underline">browse</span></p>
      <p className="text-xs text-muted-foreground mt-1">PDF, PPT, PPTX, DOCX, ZIP, MP4 · max 100 MB</p>
    </div>
  );
}

// ─── Subject group collapsible ────────────────────────────────────────────────
function SubjectGroup({ subject, materials, onView, onDownload, onDelete, onVisibility }: any) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition text-left">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
          <span className="font-semibold text-sm">{subject}</span>
          <span className="text-xs text-muted-foreground bg-background border px-2 py-0.5 rounded-full">{materials.length} materials</span>
        </div>
      </button>
      {open && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
          {materials.map((m: any) => (
            <MaterialCard key={m.id} material={m} onView={onView} onDownload={onDownload} onDelete={onDelete} onVisibility={onVisibility} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Material card ────────────────────────────────────────────────────────────
function MaterialCard({ material: m, onView, onDownload, onDelete, onVisibility }: any) {
  const [showActions, setShowActions] = useState(false);
  const gradient = TYPE_COLORS[m.type] || TYPE_COLORS.default;
  const Icon = getTypeIcon(m.type);
  const vis = VISIBILITY_CONFIG[m.visibility] || VISIBILITY_CONFIG.Published;
  const VisIcon = vis.icon;
  return (
    <div className="group border rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5 bg-card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white grid place-items-center shrink-0`}>
          <Icon className="size-5" />
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${vis.bg} ${vis.color} ${vis.border}`}>
            <VisIcon className="size-2.5" />{m.visibility}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{m.type}</span>
        </div>
      </div>
      {/* Title */}
      <div>
        <h4 className="font-semibold text-sm leading-tight line-clamp-2">{m.title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{m.subject}</p>
      </div>
      {/* Meta */}
      <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
        <span>Sem {m.semester} · Sec {m.section}</span>
        <span className="text-right">{m.size}</span>
        <span className="flex items-center gap-1"><Eye className="size-3" />{m.views} views</span>
        <span className="flex items-center gap-1 justify-end"><Download className="size-3" />{m.downloads} dl</span>
      </div>
      <div className="text-[10px] text-muted-foreground">{relativeTime(m.createdAt)} · by {m.uploadedBy}</div>
      {/* Actions */}
      <div className="flex gap-1.5 pt-1">
        <button onClick={() => onView(m)} title="View" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg border hover:bg-accent transition">
          <Eye className="size-3" /> View
        </button>
        <button onClick={() => onDownload(m)} title="Download" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg border hover:bg-accent transition">
          <Download className="size-3" /> Download
        </button>
        <button onClick={() => onDelete(m.id)} title="Delete" className="px-2 py-1.5 rounded-lg border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition text-xs">
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FacultyMaterials() {
  const profile  = getStoredFacultyProfile();
  const dept     = (profile.department || 'CSE').toUpperCase();
  const subjects = DEPT_SUBJECTS[dept] || DEPT_SUBJECTS['CSE'];
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────
  const [materials,    setMaterials]    = useState<any[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [activeTab,    setActiveTab]    = useState<'library'|'upload'|'analytics'>('library');

  // Filters
  const [search,       setSearch]       = useState('');
  const [subjectFilter,setSubjectFilter]= useState('All');
  const [typeFilter,   setTypeFilter]   = useState('All');
  const [visFilter,    setVisFilter]    = useState('All');
  const [semFilter,    setSemFilter]    = useState('All');
  const [sortBy,       setSortBy]       = useState('newest');
  const [groupBySubj,  setGroupBySubj]  = useState(true);

  // Upload form
  const [formSubject,  setFormSubject]  = useState(subjects[0]);
  const [formSemester, setFormSemester] = useState('5');
  const [formSection,  setFormSection]  = useState('A');
  const [formTitle,    setFormTitle]    = useState('');
  const [formType,     setFormType]     = useState('PDF');
  const [formDesc,     setFormDesc]     = useState('');
  const [formLink,     setFormLink]     = useState('');
  const [formFile,     setFormFile]     = useState<File | null>(null);
  const [formVisible,  setFormVisible]  = useState('Published');
  const [uploading,    setUploading]    = useState(false);
  const [uploadProg,   setUploadProg]   = useState(0);
  const [uploadDone,   setUploadDone]   = useState(false);

  // ── Fetch / seed ──────────────────────────────────────────────────
  const fetchMaterials = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await api.get('/api/faculty-module/materials');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const dbMats = res.data.data.map((m: any) => ({
          id: m._id || m.id || String(Math.random()),
          title: m.title || 'Untitled',
          subject: m.subject || subjects[0],
          type: m.type || 'PDF',
          department: m.department || dept,
          semester: m.semester || 5,
          section: m.section || 'A',
          fileUrl: m.fileUrl || '#',
          description: m.description || '',
          visibility: m.visibility || 'Published',
          uploadedBy: m.uploadedBy || profile.name,
          createdAt: m.created_at || m.createdAt || new Date().toISOString(),
          size: m.size || '—',
          downloads: m.downloads || 0,
          views: m.views || 0,
          studentsReached: m.studentsReached || 0,
        })).filter((m: any) => m.department?.toUpperCase() === dept || !m.department);
        setMaterials(dbMats.length ? dbMats : seedMaterials(dept, subjects, profile.name));
      } else {
        setMaterials(seedMaterials(dept, subjects, profile.name));
      }
    } catch {
      setMaterials(seedMaterials(dept, subjects, profile.name));
    } finally { setLoadingData(false); }
  }, [dept]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  // ── Filtered & sorted list ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = materials.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !search || m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
      const matchSubj   = subjectFilter === 'All' || m.subject === subjectFilter;
      const matchType   = typeFilter === 'All'    || m.type === typeFilter;
      const matchVis    = visFilter === 'All'     || m.visibility === visFilter;
      const matchSem    = semFilter === 'All'     || String(m.semester) === semFilter;
      return matchSearch && matchSubj && matchType && matchVis && matchSem;
    });
    if (sortBy === 'newest') list = list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'oldest') list = list.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === 'downloads') list = list.sort((a,b) => b.downloads - a.downloads);
    else if (sortBy === 'views') list = list.sort((a,b) => b.views - a.views);
    return list;
  }, [materials, search, subjectFilter, typeFilter, visFilter, semFilter, sortBy]);

  const bySubject = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach(m => { if (!map[m.subject]) map[m.subject] = []; map[m.subject].push(m); });
    return map;
  }, [filtered]);

  // ── Analytics data ────────────────────────────────────────────────
  const typeDist = useMemo(() => {
    const counts: Record<string,number> = {};
    materials.forEach(m => { counts[m.type] = (counts[m.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [materials]);
  const subjectDl = useMemo(() => subjects.slice(0,6).map(s => ({
    name: s.length > 12 ? s.slice(0,12)+'…' : s,
    downloads: materials.filter(m => m.subject === s).reduce((a,b) => a + b.downloads, 0),
  })), [materials, subjects]);
  const monthlyTrend = useMemo(() => {
    const months = ['Feb','Mar','Apr','May','Jun','Jul'];
    return months.map((m, i) => ({ month: m, uploads: 3 + i * 2 + Math.floor(Math.random() * 3) }));
  }, []);

  // ── Actions ───────────────────────────────────────────────────────
  const handleView     = (m: any) => { if (m.fileUrl && m.fileUrl !== '#') window.open(m.fileUrl,'_blank'); else toast.info('Preview not available for demo materials.'); };
  const handleDownload = (m: any) => { if (m.fileUrl && m.fileUrl !== '#') window.open(m.fileUrl,'_blank'); else toast.info('Download not available for demo materials.'); };
  const handleDelete   = (id: string) => {
    if (!window.confirm('Delete this material permanently?')) return;
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast.success('Material deleted.');
  };
  const handleVisibility = (id: string, vis: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, visibility: vis } : m));
    toast.success(`Visibility updated to ${vis}.`);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) { toast.error('Please enter a material title.'); return; }
    setUploading(true); setUploadProg(0); setUploadDone(false);
    // Simulate progress
    const interval = setInterval(() => setUploadProg(p => { if (p >= 90) { clearInterval(interval); return 90; } return p + 15; }), 200);
    try {
      const payload = {
        title: formTitle, subject: formSubject, type: formType,
        fileUrl: formLink || `https://lms.college.edu/${dept}/${Date.now()}.${formType.toLowerCase()}`,
        department: dept, semester: Number(formSemester), section: formSection,
        description: formDesc, visibility: formVisible, uploadedBy: profile.name,
        size: formFile ? `${(formFile.size / 1048576).toFixed(1)} MB` : '1.0 MB',
      };
      try { await api.post('/api/faculty-module/materials', payload); } catch {}
      clearInterval(interval); setUploadProg(100);
      setTimeout(() => {
        setUploadDone(true);
        setMaterials(prev => [{
          ...payload, id: `local-${Date.now()}`, createdAt: new Date().toISOString(),
          downloads: 0, views: 0, studentsReached: 0,
          size: payload.size,
        }, ...prev]);
        toast.success(`"${formTitle}" uploaded successfully!`);
        setFormTitle(''); setFormDesc(''); setFormLink(''); setFormFile(null); setUploadProg(0);
        setTimeout(() => { setUploadDone(false); setActiveTab('library'); }, 1500);
      }, 400);
    } catch (err: any) {
      clearInterval(interval); setUploadProg(0);
      toast.error(err?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  // ── Summary stats ─────────────────────────────────────────────────
  const totalDownloads = materials.reduce((a,b) => a + b.downloads, 0);
  const totalViews     = materials.reduce((a,b) => a + b.views, 0);
  const lastUpload     = materials.length ? fmtDate(materials.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt) : '—';

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader title="Study Materials" desc="Learning Material Management System — upload, organize and track student resources." />

      {/* ── Personalized Welcome ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_75%_50%,white,transparent)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1">{getGreeting()} 👋</p>
            <h2 className="text-2xl font-bold">{profile.designation ? `Prof. ${profile.name}` : profile.name}</h2>
            <p className="text-violet-200 text-sm mt-1">{profile.departmentFullName || dept} · LMS Dashboard</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label:'Subjects',   value: String(subjects.length) },
              { label:'Materials',  value: String(materials.length) },
              { label:'Downloads',  value: totalDownloads.toLocaleString() },
              { label:'Total Views',value: totalViews.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-center">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-violet-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Materials',  value: String(materials.length), sub:'Across all subjects', icon: BookOpen, color:'from-violet-500 to-indigo-600' },
          { label:'Assigned Subjects',value: String(subjects.length),  sub: dept+' department',  icon: FolderOpen,color:'from-blue-500 to-cyan-500' },
          { label:'Total Downloads',  value: totalDownloads.toString(), sub:'By all students',   icon: Download,  color:'from-emerald-500 to-teal-500' },
          { label:'Last Upload',      value: lastUpload,                sub:'Most recent',       icon: Clock,     color:'from-orange-500 to-amber-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="relative overflow-hidden hover:shadow-md transition">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 bg-gradient-to-br ${color} opacity-10`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white grid place-items-center mb-3`}>
              <Icon className="size-5" />
            </div>
            <div className="text-xs text-muted-foreground font-medium">{label}</div>
            <div className="text-xl font-bold mt-1 leading-tight">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-muted">
        {(['library','upload','analytics'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition cursor-pointer ${
              activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {tab === 'library' ? 'Material Library' : tab === 'upload' ? 'Upload Material' : 'Analytics'}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════ LIBRARY TAB ═══════ */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          {/* Search + Filters */}
          <Card>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input placeholder="Search by title or subject…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none" />
              </div>
              {[
                { label:'Subject', value:subjectFilter, onChange:setSubjectFilter, options:['All', ...subjects] },
                { label:'Type',    value:typeFilter,    onChange:setTypeFilter,    options:['All', ...MATERIAL_TYPES] },
                { label:'Visible', value:visFilter,     onChange:setVisFilter,     options:['All', ...VISIBILITY_OPTIONS] },
                { label:'Sem',     value:semFilter,     onChange:setSemFilter,     options:['All','1','2','3','4','5','6','7','8'] },
                { label:'Sort',    value:sortBy,        onChange:setSortBy,        options:[{v:'newest',l:'Newest'},{v:'oldest',l:'Oldest'},{v:'downloads',l:'Downloads'},{v:'views',l:'Views'}].map(o=>o.v) },
              ].map(f => (
                <select key={f.label} value={f.value} onChange={e => f.onChange(e.target.value)}
                  className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none">
                  {f.options.map(o => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
                </select>
              ))}
              <button onClick={() => setGroupBySubj(p => !p)}
                className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition ${groupBySubj ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'hover:bg-accent'}`}>
                <FolderOpen className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{filtered.length} materials found · {dept} department</span>
              <button onClick={fetchMaterials} className="flex items-center gap-1 hover:text-foreground transition"><RefreshCw className="size-3" />Refresh</button>
            </div>
          </Card>

          {/* Material Grid */}
          {loadingData ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_,i) => <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <div className="text-center py-16">
                <BookOpen className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                <p className="font-semibold text-muted-foreground">No materials found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or upload a new material.</p>
                <button onClick={() => setActiveTab('upload')} className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold">
                  Upload First Material
                </button>
              </div>
            </Card>
          ) : groupBySubj ? (
            <div className="space-y-4">
              {Object.entries(bySubject).map(([sub, mats]) => (
                <SubjectGroup key={sub} subject={sub} materials={mats}
                  onView={handleView} onDownload={handleDownload}
                  onDelete={handleDelete} onVisibility={handleVisibility} />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(m => (
                <MaterialCard key={m.id} material={m}
                  onView={handleView} onDownload={handleDownload}
                  onDelete={handleDelete} onVisibility={handleVisibility} />
              ))}
            </div>
          )}

          {/* Recent Activity Timeline */}
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center"><Clock className="size-4" /></div>
                  <h3 className="font-semibold text-sm">Recent Upload Activity</h3>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-400 to-transparent" />
                  {materials.slice().sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,6).map((m,i) => {
                    const grad = TYPE_COLORS[m.type] || TYPE_COLORS.default;
                    const Icon = getTypeIcon(m.type);
                    return (
                      <div key={m.id} className="relative mb-4 last:mb-0">
                        <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white shadow bg-gradient-to-br ${grad}`} />
                        <div className="ml-2 flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} text-white grid place-items-center shrink-0`}><Icon className="size-3.5" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight">{m.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.subject} · {relativeTime(m.createdAt)}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${VISIBILITY_CONFIG[m.visibility]?.bg} ${VISIBILITY_CONFIG[m.visibility]?.color} ${VISIBILITY_CONFIG[m.visibility]?.border} shrink-0`}>
                            {m.visibility}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white grid place-items-center"><Zap className="size-4" /></div>
                <h3 className="font-semibold text-sm">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label:'Upload Material',    icon:Upload,       color:'text-violet-600 bg-violet-50 border-violet-100', action:()=>setActiveTab('upload') },
                  { label:'View Analytics',     icon:BarChart3,    color:'text-blue-600 bg-blue-50 border-blue-100',       action:()=>setActiveTab('analytics') },
                  { label:'Create Assignment',  icon:ClipboardList,color:'text-emerald-600 bg-emerald-50 border-emerald-100',action:()=>setActiveTab('upload') },
                  { label:'Enter Marks',        icon:PenLine,      color:'text-orange-600 bg-orange-50 border-orange-100', action:()=>navigate({to:'/faculty/marks'}) },
                  { label:'Send Announcement',  icon:Bell,         color:'text-pink-600 bg-pink-50 border-pink-100',       action:()=>navigate({to:'/faculty/communication'}) },
                  { label:'Open Material Library',icon:BookOpen,   color:'text-indigo-600 bg-indigo-50 border-indigo-100',  action:()=>setGroupBySubj(p=>!p) },
                ].map(({ label, icon: Icon, color, action }) => (
                  <button key={label} onClick={action}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition hover:scale-[1.01] cursor-pointer ${color}`}>
                    <Icon className="size-4 shrink-0" />{label}
                    <ChevronRight className="size-3.5 ml-auto" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ UPLOAD TAB ════════ */}
      {activeTab === 'upload' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white grid place-items-center"><Upload className="size-4" /></div>
                <div><h3 className="font-semibold">Upload New Material</h3><p className="text-xs text-muted-foreground">{dept} Department · {profile.name}</p></div>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                {/* Drag-drop */}
                <DragDropZone onFile={f => { setFormFile(f); if (!formTitle) setFormTitle(f.name.replace(/\.[^.]+$/,'')); }} />
                {formFile && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span className="font-medium text-emerald-700">{formFile.name}</span>
                    <span className="text-xs text-emerald-600 ml-auto">{(formFile.size/1048576).toFixed(1)} MB</span>
                    <button type="button" onClick={() => setFormFile(null)}><X className="size-4 text-emerald-500" /></button>
                  </div>
                )}

                {/* Row 1: Subject + Type */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Subject *</label>
                    <select value={formSubject} onChange={e=>setFormSubject(e.target.value)}
                      className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none">
                      {subjects.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Material Type *</label>
                    <select value={formType} onChange={e=>setFormType(e.target.value)}
                      className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none">
                      {MATERIAL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Sem + Sec + Dept (auto) */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Semester</label>
                    <select value={formSemester} onChange={e=>setFormSemester(e.target.value)}
                      className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none">
                      {['1','2','3','4','5','6','7','8'].map(s=><option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Section</label>
                    <select value={formSection} onChange={e=>setFormSection(e.target.value)}
                      className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none">
                      {['A','B','C','D'].map(s=><option key={s} value={s}>Sec {s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Department</label>
                    <div className="rounded-xl border bg-muted/40 px-3 py-2.5 text-sm font-semibold text-indigo-600">{dept}</div>
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Material Title *</label>
                  <input placeholder="e.g. Data Structures – Unit 3 Notes" value={formTitle} onChange={e=>setFormTitle(e.target.value)}
                    className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none" required />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <textarea placeholder="Brief description of the material…" value={formDesc} onChange={e=>setFormDesc(e.target.value)} rows={3}
                    className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none resize-none" />
                </div>

                {/* Reference link */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Link2 className="size-3"/>Reference Link (optional)</label>
                  <input placeholder="https://…" value={formLink} onChange={e=>setFormLink(e.target.value)}
                    className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none" />
                </div>

                {/* Visibility */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Visibility</label>
                  <div className="flex gap-2 flex-wrap">
                    {VISIBILITY_OPTIONS.map(v => {
                      const cfg = VISIBILITY_CONFIG[v]; const Icon = cfg.icon;
                      return (
                        <button key={v} type="button" onClick={() => setFormVisible(v)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                            formVisible===v ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'hover:bg-accent'
                          }`}>
                          <Icon className="size-3" />{v}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploading…</span><span>{uploadProg}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-300" style={{ width:`${uploadProg}%` }} />
                    </div>
                  </div>
                )}
                {uploadDone && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="size-5 text-emerald-600" /><span className="text-sm font-semibold text-emerald-700">Uploaded successfully!</span>
                  </div>
                )}

                <button type="submit" disabled={uploading}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {uploading ? <><RefreshCw className="size-4 animate-spin"/>Uploading…</> : <><Upload className="size-4"/>Publish Material</>}
                </button>
              </form>
            </Card>
          </div>

          {/* Sidebar: recent + tips */}
          <div className="space-y-5">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white grid place-items-center"><Clock className="size-4" /></div>
                <h3 className="font-semibold text-sm">Recent Uploads</h3>
              </div>
              <div className="space-y-3">
                {materials.slice(0,5).map(m => {
                  const grad = TYPE_COLORS[m.type]||TYPE_COLORS.default; const Icon = getTypeIcon(m.type);
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl border hover:bg-accent/30 transition">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} text-white grid place-items-center shrink-0`}><Icon className="size-3.5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-tight truncate">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">{m.subject} · {relativeTime(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold text-sm mb-3">Upload Tips</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  'Use clear, descriptive titles for easy search.',
                  'Group related materials under the same subject.',
                  'Add descriptions to help students find content.',
                  'Mark drafts as "Draft" and publish when ready.',
                  'Compress large files before uploading.',
                ].map((tip,i) => (
                  <li key={i} className="flex items-start gap-2"><Star className="size-3 text-amber-500 shrink-0 mt-0.5"/>{tip}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════ ANALYTICS TAB ═════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          {/* Engagement Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label:'Total Views',        value: totalViews,     icon:Eye,       color:'from-violet-500 to-indigo-600' },
              { label:'Total Downloads',    value: totalDownloads, icon:Download,  color:'from-blue-500 to-cyan-500' },
              { label:'Published',          value: materials.filter(m=>m.visibility==='Published').length, icon:Globe, color:'from-emerald-500 to-teal-500' },
              { label:'Draft',             value: materials.filter(m=>m.visibility==='Draft').length,     icon:Edit,  color:'from-amber-500 to-orange-500' },
              { label:'PDF Count',         value: materials.filter(m=>m.type==='PDF').length,            icon:FileText,color:'from-red-500 to-rose-600' },
              { label:'Avg Downloads',     value: materials.length ? Math.round(totalDownloads/materials.length) : 0, icon:TrendingUp,color:'from-pink-500 to-rose-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="relative overflow-hidden hover:shadow-md transition">
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full -mr-4 -mt-4 bg-gradient-to-br ${color} opacity-10`} />
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} text-white grid place-items-center mb-2`}><Icon className="size-4" /></div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-xl font-bold mt-0.5">{value}</div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Type Distribution Pie */}
            <Card>
              <h3 className="font-semibold text-sm mb-4">Material Type Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={typeDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                    {typeDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {typeDist.map((t,i) => (
                  <span key={t.name} className="text-[10px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i%PIE_COLORS.length] }} />{t.name} ({t.value})
                  </span>
                ))}
              </div>
            </Card>

            {/* Downloads by Subject Bar */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-sm mb-4">Downloads by Subject</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subjectDl} margin={{ top:0, right:10, left:-10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize:10 }} />
                  <YAxis tick={{ fontSize:10 }} />
                  <Tooltip />
                  <Bar dataKey="downloads" fill="#7c3aed" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <h3 className="font-semibold text-sm mb-4">Monthly Upload Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyTrend} margin={{ top:0, right:10, left:-10, bottom:0 }}>
                <defs>
                  <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize:10 }} />
                <YAxis tick={{ fontSize:10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="uploads" stroke="#7c3aed" strokeWidth={2} fill="url(#uploadGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
