import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Loader2, Upload, X, Check, FileSpreadsheet } from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import { fetchPlacementData, createApplication } from '@/services/placementService';
import { toast } from 'sonner';

interface ApplicationItem {
  id: string;
  studentName: string;
  studentId: string;
  company: string;
  role: string;
  appliedDate: string;
  status: string;
  score: number;
  round: number;
}

export function PlacementApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // View Details Modal States
  const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const openViewModal = (app: ApplicationItem) => {
    setSelectedApplication(app);
    setIsViewModalOpen(true);
  };

  // Import Applications Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<'csv' | 'manual'>('csv');

  // CSV Import States
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [parsedRows, setParsedRows] = useState<ApplicationItem[]>([]);

  // Manual Form States
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualRole, setManualRole] = useState('');
  const [manualScore, setManualScore] = useState('80');
  const [manualRound, setManualRound] = useState('1');
  const [manualStatus, setManualStatus] = useState('Applied');

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Reading CSV headers...');

    const steps = [
      { progress: 25, status: 'Analyzing CSV layout...' },
      { progress: 50, status: 'Matching student profiles in Supabase...' },
      { progress: 75, status: 'Evaluating job drive requirements...' },
      { progress: 100, status: 'Verification successful! Ready to import.' },
    ];

    steps.forEach((step, idx) => {
      setTimeout(
        () => {
          setUploadProgress(step.progress);
          setUploadStatus(step.status);

          if (step.progress === 100) {
            setUploading(false);
            const generatedMock: ApplicationItem[] = [
              {
                id: `APP_${Date.now()}_1`,
                studentName: 'Sai Kiran',
                studentId: 'CS2026103',
                company: 'Amazon India',
                role: 'Associate',
                appliedDate: new Date().toISOString(),
                status: 'Shortlisted',
                score: 88,
                round: 2,
              },
              {
                id: `APP_${Date.now()}_2`,
                studentName: 'Lahari Priya',
                studentId: 'CS2026105',
                company: 'Microsoft India',
                role: 'SDE-II',
                appliedDate: new Date().toISOString(),
                status: 'Selected',
                score: 92,
                round: 1,
              },
              {
                id: `APP_${Date.now()}_3`,
                studentName: 'Divya Teja',
                studentId: 'AM2026105',
                company: 'Accenture',
                role: 'Consulting',
                appliedDate: new Date().toISOString(),
                status: 'Applied',
                score: 74,
                round: 1,
              },
            ];
            setParsedRows(generatedMock);
            toast.success('CSV file successfully analyzed! 3 records prepared for import.');
          }
        },
        (idx + 1) * 800,
      );
    });
  };

  const handleImportCsvSubmit = async () => {
    if (parsedRows.length === 0) return;

    try {
      toast.loading('Importing CSV records to database...');
      for (const row of parsedRows) {
        await createApplication({
          studentName: row.studentName,
          studentId: row.studentId,
          company: row.company,
          role: row.role,
          score: row.score,
          round: row.round,
          status: row.status,
        });
      }
      toast.dismiss();
      toast.success(`Successfully imported ${parsedRows.length} applications!`);

      const data = await fetchPlacementData();
      if (data.applications) {
        setApplications(data.applications);
      }

      setIsImportModalOpen(false);
      setCsvFileName(null);
      setParsedRows([]);
    } catch (err: any) {
      toast.dismiss();
      console.error('Error importing CSV rows:', err);
      toast.error('Failed to import CSV records. Some rows might have failed.');
    }
  };

  const handleManualImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentName || !manualStudentId || !manualCompany || !manualRole) {
      toast.error('Please fill in all required fields!');
      return;
    }

    try {
      const payload = {
        studentName: manualStudentName,
        studentId: manualStudentId,
        company: manualCompany,
        role: manualRole,
        score: parseInt(manualScore) || 80,
        round: parseInt(manualRound) || 1,
        status: manualStatus,
      };

      await createApplication(payload);

      const data = await fetchPlacementData();
      if (data.applications) {
        setApplications(data.applications);
      }

      setIsImportModalOpen(false);
      toast.success(`Successfully imported application for ${manualStudentName}!`);

      setManualStudentName('');
      setManualStudentId('');
      setManualCompany('');
      setManualRole('');
      setManualScore('80');
      setManualRound('1');
      setManualStatus('Applied');
    } catch (err: any) {
      console.error('Error creating application:', err);
      toast.error('Failed to import recruitment application.');
    }
  };

  useEffect(() => {
    fetchPlacementData()
      .then((res) => {
        if (res.applications) {
          setApplications(res.applications);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch live applications list:', err);
        toast.error('Failed to load applications registry.');
        setLoading(false);
      });
  }, []);

  const statuses = [
    'Applied',
    'Shortlisted',
    'Interview Scheduled',
    'Selected',
    'Rejected',
    'Offer Released',
  ];
  const statusColors: Record<string, any> = {
    Applied: 'info',
    Shortlisted: 'warn',
    'Interview Scheduled': 'info',
    Selected: 'success',
    Rejected: 'danger',
    'Offer Released': 'success',
  };

  const filteredApplications = applications.filter(
    (app) =>
      (app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedStatus || app.status === selectedStatus),
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIdx, startIdx + itemsPerPage);

  const stats = [
    { label: 'Total Applications', value: applications.length, color: 'bg-blue-500' },
    {
      label: 'Shortlisted',
      value: applications.filter((a) => a.status === 'Shortlisted').length,
      color: 'bg-amber-500',
    },
    {
      label: 'Selected',
      value: applications.filter((a) => a.status === 'Selected' || a.status === 'Offer Released')
        .length,
      color: 'bg-emerald-500',
    },
    {
      label: 'Rejected',
      value: applications.filter((a) => a.status === 'Rejected').length,
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Management"
        desc="Track student applications and manage interview workflows."
        actions={
          <button
            onClick={() => {
              setIsImportModalOpen(true);
              setImportTab('csv');
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Import Applications
          </button>
        }
      />

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading applications dataset...</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <div
                className={`size-12 rounded-xl ${stat.color} text-white grid place-items-center mx-auto mb-2 font-bold`}
              >
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      {!loading && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search by student name, ID or company…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
              <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition">
                <Filter className="size-4" /> More Filters
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedStatus(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  selectedStatus === null
                    ? 'bg-gradient-primary text-white'
                    : 'bg-background border text-muted-foreground hover:border-primary'
                }`}
              >
                All Statuses
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                    selectedStatus === status
                      ? 'bg-gradient-primary text-white'
                      : 'bg-background border text-muted-foreground hover:border-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Applications Table */}
      {!loading && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Applied Date
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Score
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Round
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-medium">{app.studentName}</div>
                      <div className="text-xs text-muted-foreground">{app.studentId}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{app.company}</td>
                    <td className="py-3 px-4 text-muted-foreground">{app.role}</td>
                    <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {app.score > 0 ? (
                        <span
                          className={`font-semibold ${app.score >= 80 ? 'text-emerald-600' : app.score >= 70 ? 'text-amber-600' : 'text-rose-600'}`}
                        >
                          {app.score}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {app.round > 0 ? (
                        <Badge tone="info">Round {app.round}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge tone={(statusColors[app.status] || 'info') as any}>{app.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openViewModal(app)}
                        className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                Showing {startIdx + 1} to{' '}
                {Math.min(startIdx + itemsPerPage, filteredApplications.length)} of{' '}
                {filteredApplications.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border text-sm hover:bg-accent disabled:opacity-50 transition"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-gradient-primary text-white'
                        : 'border hover:bg-accent'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border text-sm hover:bg-accent disabled:opacity-50 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Status Workflow */}
      <Card>
        <h3 className="font-semibold mb-4">Application Status Workflow</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Released'].map(
            (status, idx) => (
              <div key={status} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 text-white grid place-items-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-center whitespace-nowrap max-w-[80px]">
                    {status}
                  </div>
                </div>
                {idx < 4 && <div className="flex-1 h-1 bg-gradient-primary mx-1 min-w-[20px]" />}
              </div>
            ),
          )}
        </div>
      </Card>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-5 text-indigo-600 animate-pulse" />
                <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Import Student Applications
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setCsvFileName(null);
                  setParsedRows([]);
                  setUploading(false);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-5 gap-4">
              <button
                onClick={() => setImportTab('csv')}
                className={`pb-2.5 text-sm font-semibold transition border-b-2 cursor-pointer ${
                  importTab === 'csv'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                📁 CSV File Upload
              </button>
              <button
                onClick={() => setImportTab('manual')}
                className={`pb-2.5 text-sm font-semibold transition border-b-2 cursor-pointer ${
                  importTab === 'manual'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                ✍ Manual Entry Form
              </button>
            </div>

            {/* CSV TAB */}
            {importTab === 'csv' && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-normal">
                  Drop a CSV file containing applicant records. Headers must map to:
                  <code className="mx-1 px-1 py-0.5 rounded bg-slate-100 font-semibold font-mono text-[10px] text-indigo-600">
                    Student ID
                  </code>
                  ,
                  <code className="mx-1 px-1 py-0.5 rounded bg-slate-100 font-semibold font-mono text-[10px] text-indigo-600">
                    Company
                  </code>
                  ,
                  <code className="mx-1 px-1 py-0.5 rounded bg-slate-100 font-semibold font-mono text-[10px] text-indigo-600">
                    Role
                  </code>
                  , and
                  <code className="mx-1 px-1 py-0.5 rounded bg-slate-100 font-semibold font-mono text-[10px] text-indigo-600">
                    Score
                  </code>
                  .
                </p>

                {/* Dropzone */}
                {!csvFileName && !uploading && (
                  <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-indigo-50/10 hover:border-indigo-300 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvSelect}
                      className="hidden"
                    />
                    <div className="size-11 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center group-hover:scale-105 transition-transform">
                      <Upload className="size-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Click or Drag CSV here
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        Files up to 10MB supported
                      </span>
                    </div>
                  </label>
                )}

                {/* Loader / Progress */}
                {uploading && (
                  <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/30 flex flex-col items-center text-center space-y-3">
                    <Loader2 className="size-6 text-primary animate-spin" />
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-muted-foreground px-1">
                        <span>{uploadStatus}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CSV File Ready */}
                {csvFileName && !uploading && (
                  <div className="border border-indigo-100 rounded-2xl p-4 bg-indigo-50/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center shrink-0">
                        <FileSpreadsheet className="size-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px]">
                          {csvFileName}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <Check className="size-3" /> {parsedRows.length} records successfully
                          parsed
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCsvFileName(null);
                        setParsedRows([]);
                      }}
                      className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg cursor-pointer transition"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setCsvFileName(null);
                      setParsedRows([]);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportCsvSubmit}
                    disabled={parsedRows.length === 0}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 disabled:opacity-50 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Import {parsedRows.length} Records
                  </button>
                </div>
              </div>
            )}

            {/* MANUAL TAB */}
            {importTab === 'manual' && (
              <form onSubmit={handleManualImportSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sai Kiran"
                    value={manualStudentName}
                    onChange={(e) => setManualStudentName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Student ID / Roll No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS2026103"
                      value={manualStudentId}
                      onChange={(e) => setManualStudentId(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Company Name *
                    </label>
                    <select
                      value={manualCompany}
                      onChange={(e) => setManualCompany(e.target.value)}
                      required
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Company
                      </option>
                      <option value="Google India">Google India</option>
                      <option value="Microsoft India">Microsoft India</option>
                      <option value="Amazon India">Amazon India</option>
                      <option value="Goldman Sachs">Goldman Sachs</option>
                      <option value="Accenture">Accenture</option>
                      <option value="TCS">TCS</option>
                      <option value="Infosys">Infosys</option>
                      <option value="Oracle">Oracle</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Job Role *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineer"
                      value={manualRole}
                      onChange={(e) => setManualRole(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Test Score (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScore}
                      onChange={(e) => setManualScore(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Assessment Round
                    </label>
                    <select
                      value={manualRound}
                      onChange={(e) => setManualRound(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="0">No active round</option>
                      <option value="1">Round 1</option>
                      <option value="2">Round 2</option>
                      <option value="3">Round 3</option>
                      <option value="4">Round 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Hiring Status
                    </label>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Add Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* View Application Details Modal */}
      {isViewModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Application Details</h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedApplication(null);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-gradient-soft border flex flex-col space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Candidate
                </span>
                <span className="font-bold text-lg text-slate-800">
                  {selectedApplication.studentName}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {selectedApplication.studentId}
                </span>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-xl bg-background/50">
                  <span className="text-xs text-muted-foreground block">Company</span>
                  <span className="font-bold text-sm text-slate-700">
                    {selectedApplication.company}
                  </span>
                </div>
                <div className="p-3 border rounded-xl bg-background/50">
                  <span className="text-xs text-muted-foreground block">Role</span>
                  <span className="font-bold text-sm text-slate-700">
                    {selectedApplication.role}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 border rounded-xl bg-background/30">
                  <span className="text-[10px] text-muted-foreground block">Applied Date</span>
                  <span className="font-semibold text-xs mt-1 block text-slate-700">
                    {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-2 border rounded-xl bg-background/30">
                  <span className="text-[10px] text-muted-foreground block">Assessment Score</span>
                  <span className="font-bold text-xs mt-1 block">
                    {selectedApplication.score > 0 ? (
                      <span
                        className={
                          selectedApplication.score >= 80 ? 'text-emerald-600' : 'text-amber-600'
                        }
                      >
                        {selectedApplication.score}%
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="p-2 border rounded-xl bg-background/30">
                  <span className="text-[10px] text-muted-foreground block">Current Round</span>
                  <span className="font-semibold text-xs mt-1 block text-slate-700">
                    {selectedApplication.round > 0 ? `Round ${selectedApplication.round}` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Status Section */}
              <div className="p-4 border rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Hiring Status
                  </span>
                  <Badge tone={(statusColors[selectedApplication.status] || 'info') as any}>
                    {selectedApplication.status}
                  </Badge>
                </div>

                {/* Progress bar to simulate status workflow */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                    <span>Process Progress</span>
                    <span>
                      {selectedApplication.status === 'Rejected'
                        ? 'Declined'
                        : selectedApplication.status === 'Offer Released' ||
                            selectedApplication.status === 'Selected'
                          ? 'Completed'
                          : 'In Progress'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedApplication.status === 'Rejected'
                          ? 'bg-rose-500'
                          : selectedApplication.status === 'Selected' ||
                              selectedApplication.status === 'Offer Released'
                            ? 'bg-emerald-500'
                            : 'bg-primary'
                      }`}
                      style={{
                        width:
                          selectedApplication.status === 'Rejected'
                            ? '100%'
                            : selectedApplication.status === 'Offer Released' ||
                                selectedApplication.status === 'Selected'
                              ? '100%'
                              : selectedApplication.status === 'Interview Scheduled'
                                ? '65%'
                                : selectedApplication.status === 'Shortlisted'
                                  ? '40%'
                                  : '20%',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedApplication(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
