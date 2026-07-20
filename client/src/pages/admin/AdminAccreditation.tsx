import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BookOpen,
  FileText,
  Shield,
  Download,
  CheckCircle,
  Clock,
  Sliders,
  RefreshCw,
  FileCheck,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  User,
  Calendar,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { getStoredUser } from '@/services/authService';
import * as service from '@/services/accreditationService';

export function AdminAccreditation() {
  const currentUser = getStoredUser() || { name: 'System User', role: 'admin', department: 'CSE' };
  
  // Tab/Section control
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'naac' | 'evidence' | 'workflow' | 'committees' | 'reports' | 'analytics' | 'notifications' | 'audit' | 'department'
  >('dashboard');

  // Core accreditation datasets
  const [dashboardData, setDashboardData] = useState<any>({
    cycles: [],
    kpis: {
      naacGrade: "A++",
      naacCgpa: "3.82 / 4.00",
      cycle: "Cycle 3",
      validity: "Until Dec 2028",
      nextVisit: "October 2026",
      ssrCompletion: 88,
      aqarCompletion: 95,
      totalMetrics: 7,
      completedMetrics: 4,
      pendingMetrics: 3,
      evidenceCount: 3,
      approvedEvidences: 1,
      inReviewEvidences: 2,
      rejectedEvidences: 0,
      totalATR: 2,
      completedATR: 1,
      atrCompletionRate: 50
    },
    overdueMetrics: [],
    dueThisWeek: [],
    dueThisMonth: []
  });

  const [criteria, setCriteria] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [remarksHistory, setRemarksHistory] = useState<any[]>([]);

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCriteriaFilter, setSelectedCriteriaFilter] = useState('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // UI state variables
  const [loading, setLoading] = useState(true);
  const [activeCriteriaId, setActiveCriteriaId] = useState('CRT1');
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  
  // Modals / forms state
  const [showCreateMetricModal, setShowCreateMetricModal] = useState(false);
  const [showUploadEvidenceModal, setShowUploadEvidenceModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);
  const [showCreateATRModal, setShowCreateATRModal] = useState(false);
  const [selectedMeetingForATR, setSelectedMeetingForATR] = useState<any>(null);

  // Form Fields
  const [newMetric, setNewMetric] = useState({
    criteriaId: 'CRT1',
    code: '',
    name: '',
    description: '',
    weightage: '50',
    department: 'CSE',
    coordinator: 'Dr. John Smith',
    targetDate: ''
  });

  const [newEvidence, setNewEvidence] = useState({
    title: '',
    fileUrl: 'Evidence_Upload.pdf',
    fileType: 'PDF',
    department: 'CSE'
  });

  const [newMeeting, setNewMeeting] = useState({
    committeeId: 'COM001',
    title: '',
    agenda: '',
    date: '',
    time: '',
    venue: '',
    participants: ''
  });

  const [newATR, setNewATR] = useState({
    description: '',
    assignedTo: 'Dr. John Smith',
    dueDate: '',
    priority: 'Medium'
  });

  const [reviewForm, setReviewForm] = useState({
    stage: 'HOD',
    status: 'Approved',
    remarks: ''
  });

  // Fetch initial dashboard and resources
  const loadData = async () => {
    try {
      setLoading(true);
      const dash = await service.fetchDashboardData();
      if (dash) {
        setDashboardData(dash);
        if (dash.criteria) setCriteria(dash.criteria);
        if (dash.metrics) setMetrics(dash.metrics);
        if (dash.evidence) setEvidence(dash.evidence);
        if (dash.meetings) setMeetings(dash.meetings);
        if (dash.actionItems) setActionItems(dash.actionItems);
        if (dash.notifications) setNotifications(dash.notifications);
      }
      
      const commData = await service.fetchCommitteesAndMeetings();
      if (commData) {
        setCommittees(commData.committees || []);
      }
      
      const logs = await service.fetchAuditLogs();
      if (logs) setAuditLogs(logs);

      setLoading(false);
    } catch (err: any) {
      toast.error('Failed to load accreditation compliance datasets.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetric.code || !newMetric.name) {
      toast.error('Please enter metric ID code and name.');
      return;
    }
    try {
      const added = await service.createMetric(newMetric);
      if (added) {
        toast.success(`Metric ${newMetric.code} created successfully.`);
        setShowCreateMetricModal(false);
        setNewMetric({
          criteriaId: 'CRT1',
          code: '',
          name: '',
          description: '',
          weightage: '50',
          department: 'CSE',
          coordinator: 'Dr. John Smith',
          targetDate: ''
        });
        loadData();
      }
    } catch (err) {
      toast.error('Failed to save metric.');
    }
  };

  const handleUploadEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMetric) {
      toast.error('No metric selected for upload.');
      return;
    }
    if (!newEvidence.title) {
      toast.error('Please fill in evidence document description title.');
      return;
    }
    try {
      const added = await service.uploadEvidence({
        metricId: selectedMetric.id,
        ...newEvidence
      });
      if (added) {
        toast.success(`Evidence document metadata registered.`);
        setShowUploadEvidenceModal(false);
        setNewEvidence({
          title: '',
          fileUrl: 'Evidence_Upload.pdf',
          fileType: 'PDF',
          department: 'CSE'
        });
        loadData();
      }
    } catch (err) {
      toast.error('Failed to register evidence.');
    }
  };

  const handleScheduleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date) {
      toast.error('Please enter meeting title and date.');
      return;
    }
    try {
      const payload = {
        ...newMeeting,
        participants: newMeeting.participants.split(',').map(p => p.trim())
      };
      const added = await service.createMeeting(payload);
      if (added) {
        toast.success(`Quality audit meeting scheduled.`);
        setShowScheduleMeetingModal(false);
        setNewMeeting({
          committeeId: 'COM001',
          title: '',
          agenda: '',
          date: '',
          time: '',
          venue: '',
          participants: ''
        });
        loadData();
      }
    } catch (err) {
      toast.error('Failed to schedule meeting.');
    }
  };

  const handleCreateATRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newATR.description || !newATR.dueDate) {
      toast.error('Please enter ATR description and target due date.');
      return;
    }
    try {
      const added = await service.createActionItem({
        meetingId: selectedMeetingForATR?.id || 'MTG001',
        ...newATR
      });
      if (added) {
        toast.success('Action item logged to committee ATR registry.');
        setShowCreateATRModal(false);
        setNewATR({
          description: '',
          assignedTo: 'Dr. John Smith',
          dueDate: '',
          priority: 'Medium'
        });
        loadData();
      }
    } catch (err) {
      toast.error('Failed to assign ATR task.');
    }
  };

  const handleWorkflowSubmission = async (docId: string) => {
    try {
      const updated = await service.submitWorkflowState(docId, reviewForm);
      if (updated) {
        toast.success(`Workflow stage updated: ${reviewForm.stage} - ${reviewForm.status}`);
        setReviewForm({ stage: 'HOD', status: 'Approved', remarks: '' });
        loadData();
      }
    } catch (err) {
      toast.error('Failed to save review update.');
    }
  };

  const handleReplaceEvidenceSubmit = async (docId: string, fileUrl: string) => {
    try {
      const res = await service.replaceEvidence(docId, { fileUrl });
      if (res) {
        toast.success('New version replacement successfully compiled. Version incremented.');
        loadData();
      }
    } catch (err) {
      toast.error('Failed to replace file.');
    }
  };

  const handleMetricDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this metric mapping?')) return;
    try {
      await service.deleteMetric(id);
      toast.success('Metric deleted.');
      loadData();
    } catch (err) {
      toast.error('Failed to delete metric.');
    }
  };

  const handleActionItemClose = async (id: string) => {
    try {
      await service.updateActionItemStatus(id, { status: 'Completed', remarks: 'Action Taken completed and verified.' });
      toast.success('ATR status closed.');
      loadData();
    } catch (err) {
      toast.error('Failed to close action item.');
    }
  };

  // Compile SSR Chapter trigger
  const handleGenerateSSR = (criterionNum: number | 'all') => {
    const text = criterionNum === 'all' 
      ? 'Compiling full Self-Study Report (SSR) Chapters 1-7 indices and verification logs...' 
      : `Compiling SSR Criterion ${criterionNum} report and document vault checklists...`;
    
    toast.loading(text, { duration: 1500 });
    setTimeout(() => {
      toast.success(
        criterionNum === 'all' 
          ? 'NAAC Self-Study Report (SSR) Draft successfully generated! 14 chapters compiled.'
          : `Criterion ${criterionNum} Chapter report generated successfully!`
      );
    }, 1600);
  };

  // Filtering function
  const filteredMetrics = metrics.filter(m => {
    const matchesSearch = searchQuery === '' || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCriteria = selectedCriteriaFilter === 'all' || m.criteriaId === selectedCriteriaFilter;
    const matchesDept = selectedDeptFilter === 'all' || m.department === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'all' || m.status === selectedStatusFilter;

    return matchesSearch && matchesCriteria && matchesDept && matchesStatus;
  });

  const kpis = dashboardData.kpis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="NAAC Accreditation Management Portal"
        desc="Administer criteria compliance logs, metrics weightages, evidence reviews, and IQAC Action Taken Reports (ATRs)."
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-55"
          >
            <RefreshCw className={`size-4.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Systems Data</span>
          </button>
        }
      />

      {/* Main Split Portal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side Sub-Navigation Menu */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview Dashboard', icon: Sliders },
            { id: 'naac', label: 'NAAC Portal (1-7)', icon: BookOpen },
            { id: 'evidence', label: 'Evidence Vault', icon: FolderOpen },
            { id: 'workflow', label: 'Workflows & Reviews', icon: FileCheck },
            { id: 'committees', label: 'Committees & ATR', icon: Shield },
            { id: 'department', label: 'Department View (CSE)', icon: Layers },
            { id: 'reports', label: 'SSR & AQAR Reports', icon: FileText },
            { id: 'notifications', label: 'System Alerts', icon: AlertCircle },
            { id: 'audit', label: 'System Audit Trail', icon: Clock }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-indigo-600 text-white font-bold shadow-soft'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/50'
              }`}
            >
              <sec.icon className="size-4" />
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side Canvas Area */}
        <div className="lg:col-span-4 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <RefreshCw className="size-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-muted-foreground">Loading dynamic quality compliance statistics...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* SECTION: DASHBOARD OVERVIEW */}
              {activeSection === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* KPI Status Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="NAAC cumulative grade"
                      value={`${kpis.naacGrade} (${kpis.naacCgpa})`}
                      change={kpis.cycle}
                      icon={Award}
                      gradient="bg-gradient-primary"
                    />
                    <StatCard
                      label="SSR Completeness"
                      value={`${kpis.ssrCompletion}% Done`}
                      change={kpis.validity}
                      icon={BookOpen}
                      gradient="bg-gradient-violet"
                    />
                    <StatCard
                      label="AQAR Progress status"
                      value={`${kpis.aqarCompletion}% Compiled`}
                      change={`Next visit: ${kpis.nextVisit}`}
                      icon={Sliders}
                      gradient="bg-gradient-cyan"
                    />
                    <StatCard
                      label="IQAC ATR Completion"
                      value={`${kpis.atrCompletionRate}% Closed`}
                      change={`${kpis.completedATR} of ${kpis.totalATR} action items`}
                      icon={Shield}
                      gradient="bg-gradient-primary"
                    />
                  </div>

                  {/* Criteria completion rate */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">NAAC Criteria Progress Checklist</h3>
                        <p className="text-[10px] text-slate-500">Quality score compliance breakdown across 7 Criteria modules.</p>
                      </div>
                      <div className="space-y-3.5">
                        {criteria.map((c) => (
                          <div key={c.id} className="text-xs space-y-1.5 p-3 border rounded-xl bg-slate-50/50">
                            <div className="flex justify-between font-semibold text-slate-800">
                              <span>Criterion {c.number}: {c.title}</span>
                              <span className="font-mono text-indigo-700 font-bold">
                                {c.completionPercentage}% Complied
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${c.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Due Date & Alerts Summary */}
                    <Card className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Due Date Alert Monitor</h3>
                        <p className="text-[10px] text-slate-500">Track and monitor impending NAAC compliance targets.</p>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Overdue */}
                        <div>
                          <span className="text-[10px] font-bold text-rose-600 tracking-wider uppercase block mb-1">Overdue ({dashboardData.overdueMetrics.length})</span>
                          {dashboardData.overdueMetrics.length === 0 ? (
                            <p className="text-[11px] text-slate-500">No overdue items. Excellent!</p>
                          ) : (
                            <div className="space-y-2">
                              {dashboardData.overdueMetrics.map((m: any) => (
                                <div key={m.id} className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-[11px] flex justify-between items-center">
                                  <div>
                                    <span className="font-bold text-rose-700 font-mono mr-1.5">{m.code}</span>
                                    <span className="font-medium text-slate-700">{m.name}</span>
                                  </div>
                                  <Badge tone="danger">Overdue</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Due this week */}
                        <div>
                          <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block mb-1">Due This Week ({dashboardData.dueThisWeek.length})</span>
                          {dashboardData.dueThisWeek.length === 0 ? (
                            <p className="text-[11px] text-slate-500">No items due this week.</p>
                          ) : (
                            <div className="space-y-2">
                              {dashboardData.dueThisWeek.map((m: any) => (
                                <div key={m.id} className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-[11px] flex justify-between items-center">
                                  <div>
                                    <span className="font-bold text-amber-700 font-mono mr-1.5">{m.code}</span>
                                    <span className="font-medium text-slate-700">{m.name}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-amber-700">{m.daysRemaining} days left</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Due this month */}
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase block mb-1">Due This Month ({dashboardData.dueThisMonth.length})</span>
                          {dashboardData.dueThisMonth.length === 0 ? (
                            <p className="text-[11px] text-slate-500">No items due this month.</p>
                          ) : (
                            <div className="space-y-2">
                              {dashboardData.dueThisMonth.map((m: any) => (
                                <div key={m.id} className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] flex justify-between items-center">
                                  <div>
                                    <span className="font-bold text-indigo-700 font-mono mr-1.5">{m.code}</span>
                                    <span className="font-medium text-slate-700">{m.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500">{m.targetDate}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* SECTION: NAAC PORTAL (CRITERIA & METRICS) */}
              {activeSection === 'naac' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border rounded-2xl">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-800 text-sm">NAAC Criteria &amp; Metric Checklist</h3>
                      <button
                        onClick={() => setShowCreateMetricModal(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Add Metric
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search metrics..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      
                      <select
                        value={selectedCriteriaFilter}
                        onChange={(e) => setSelectedCriteriaFilter(e.target.value)}
                        className="border border-slate-200 rounded-xl text-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                      >
                        <option value="all">All Criteria</option>
                        {criteria.map((c) => (
                          <option key={c.id} value={c.id}>Crit {c.number}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-4 gap-4">
                    {/* Criteria Selector List */}
                    <div className="lg:col-span-1 space-y-1.5">
                      {criteria.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveCriteriaId(c.id);
                            setSelectedCriteriaFilter(c.id);
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition text-xs font-semibold flex justify-between items-center ${
                            activeCriteriaId === c.id
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-white border-slate-200/50 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>Criterion {c.number}</span>
                          <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border">{c.completionPercentage}%</span>
                        </button>
                      ))}
                    </div>

                    {/* Metrics List Table */}
                    <div className="lg:col-span-3 space-y-4">
                      {filteredMetrics.length === 0 ? (
                        <div className="bg-white border rounded-2xl p-12 text-center text-xs text-muted-foreground">
                          No matching metrics or checklists found for the filter criteria.
                        </div>
                      ) : (
                        filteredMetrics.map((m) => (
                          <div key={m.id} className="bg-white border rounded-2xl p-4 space-y-3 hover:border-indigo-300 transition">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-indigo-700 font-mono text-xs block mb-0.5">{m.code} - Weightage: {m.weightage}</span>
                                <h4 className="font-bold text-slate-800 text-xs leading-snug">{m.name}</h4>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Badge tone={m.status === 'Completed' ? 'success' : m.status === 'In_Progress' ? 'warn' : 'default'}>
                                  {m.status}
                                </Badge>
                                <button
                                  onClick={() => handleMetricDelete(m.id)}
                                  className="p-1 hover:bg-rose-50 rounded-lg text-rose-500 transition cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-[11px] text-slate-600 leading-normal">{m.description}</p>
                            
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-[10px] text-slate-500 font-semibold">
                              <div className="flex gap-4">
                                <span>Dept: <strong className="text-slate-700">{m.department}</strong></span>
                                <span>Coordinator: <strong className="text-slate-700">{m.coordinator}</strong></span>
                                <span>Due: <strong className="text-slate-700">{m.targetDate || 'TBD'}</strong></span>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setSelectedMetric(m);
                                  setShowUploadEvidenceModal(true);
                                }}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Upload className="size-3" /> Upload Evidence
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECTION: EVIDENCE VAULT */}
              {activeSection === 'evidence' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Self-Study Report (SSR) Supporting Data Vault</h3>
                      <p className="text-[10px] text-slate-500">Repository of submitted quality proofs, verifications, and revisions.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-slate-400">
                            <th className="text-left pb-2">Doc Title</th>
                            <th className="text-left pb-2">Department</th>
                            <th className="text-center pb-2">Version</th>
                            <th className="text-center pb-2">Status</th>
                            <th className="text-right pb-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {evidence.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/50">
                              <td className="py-3">
                                <span className="font-bold text-slate-800 block">{doc.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{doc.fileUrl}</span>
                              </td>
                              <td className="py-3 font-semibold text-slate-600">{doc.department}</td>
                              <td className="py-3 text-center font-mono font-bold text-indigo-600">v{doc.version}</td>
                              <td className="py-3 text-center">
                                <Badge tone={doc.status === 'Approved' ? 'success' : doc.status === 'Rejected' ? 'danger' : 'warn'}>
                                  {doc.status}
                                </Badge>
                              </td>
                              <td className="py-3 text-right space-x-1.5">
                                <button
                                  onClick={() => handleReplaceEvidenceSubmit(doc.id, `revised_${doc.fileUrl}`)}
                                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                                >
                                  Replace File
                                </button>
                                <a
                                  href="#"
                                  onClick={(e) => { e.preventDefault(); toast.success('Starting evidence document download...'); }}
                                  className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition inline-block"
                                >
                                  Download
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: APPROVAL WORKFLOWS */}
              {activeSection === 'workflow' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Role-Based Workflow Reviews</h3>
                      <p className="text-[10px] text-slate-500">Review documents in the approval pipeline: Faculty ➔ HOD ➔ IQAC ➔ Dean ➔ Principal ➔ Approved.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Documents Awaiting Review ({evidence.filter(e => e.status !== 'Approved').length})</span>
                        
                        <div className="space-y-3">
                          {evidence.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => setSelectedMetric(doc)}
                              className={`p-4 border rounded-2xl cursor-pointer transition text-xs space-y-2 ${
                                selectedMetric?.id === doc.id ? 'border-indigo-600 bg-indigo-50/20' : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-slate-800">{doc.title}</span>
                                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{doc.fileUrl}</span>
                                </div>
                                <Badge tone={doc.status === 'Approved' ? 'success' : 'warn'}>{doc.status}</Badge>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                                <span>Owner: <strong>{doc.owner || 'Dr. John Smith'}</strong></span>
                                <span>Dept: <strong>{doc.department}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Workflow Form */}
                      <div className="lg:col-span-1">
                        {selectedMetric && selectedMetric.version ? (
                          <div className="bg-slate-50/50 border rounded-2xl p-4 space-y-4 text-xs">
                            <h4 className="font-bold text-slate-800">Workflow Review Action</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">Document: <strong>{selectedMetric.title}</strong></p>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Your review Stage</label>
                                <select
                                  value={reviewForm.stage}
                                  onChange={(e) => setReviewForm({ ...reviewForm, stage: e.target.value })}
                                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs"
                                >
                                  <option value="HOD">HOD (Departmental Review)</option>
                                  <option value="IQAC">IQAC Coordinator (Compliance check)</option>
                                  <option value="Dean">Dean Academics (Validation)</option>
                                  <option value="Principal">Principal (Final Sign-off)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Verdict</label>
                                <select
                                  value={reviewForm.status}
                                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs"
                                >
                                  <option value="Approved">Approve Document</option>
                                  <option value="Rejected">Reject &amp; Cancel</option>
                                  <option value="Sent_Back">Send Back for Revisions</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Remarks &amp; Feedback</label>
                                <textarea
                                  placeholder="Provide quality remarks or corrections here..."
                                  value={reviewForm.remarks}
                                  onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
                                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none min-h-[80px]"
                                />
                              </div>

                              <button
                                onClick={() => handleWorkflowSubmission(selectedMetric.id)}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition text-center"
                              >
                                Submit Quality Verdict
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border rounded-2xl p-6 text-center text-[11px] text-slate-400">
                            Select a document from the queue to run review workflows.
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: COMMITTEES & ATR */}
              {activeSection === 'committees' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Card className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">IQAC &amp; NAAC steering committee meetings</h3>
                        <p className="text-[10px] text-slate-500">Record minutes, review Action Taken Reports (ATRs).</p>
                      </div>
                      <button
                        onClick={() => setShowScheduleMeetingModal(true)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Schedule Meeting
                      </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Meetings list */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Meetings history</span>
                        <div className="space-y-3">
                          {meetings.map((m) => (
                            <div key={m.id} className="p-3 border rounded-xl bg-white space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-800 leading-snug">{m.title}</h4>
                                <Badge tone={m.status === 'Completed' ? 'success' : 'warn'}>{m.status}</Badge>
                              </div>
                              <p className="text-[11px] text-slate-500">{m.agenda}</p>
                              
                              {m.minutes && (
                                <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 italic">
                                  Minutes: {m.minutes}
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5">
                                <span>{m.date} at {m.time} | Venue: {m.venue}</span>
                                <button
                                  onClick={() => {
                                    setSelectedMeetingForATR(m);
                                    setShowCreateATRModal(true);
                                  }}
                                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                                >
                                  Assign ATR Action
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Taken Reports (ATR) */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Action Taken Reports (ATR)</span>
                        <div className="space-y-3">
                          {actionItems.map((a) => (
                            <div key={a.id} className="p-3 border rounded-xl bg-white space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-800 leading-snug">{a.description}</span>
                                <Badge tone={a.status === 'Completed' ? 'success' : 'warn'}>{a.status}</Badge>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                                <span>Owner: <strong>{a.assignedTo || a.assigned_to}</strong></span>
                                <span>Due: <strong>{a.dueDate || a.due_date}</strong></span>
                              </div>
                              {a.status !== 'Completed' && (
                                <button
                                  onClick={() => handleActionItemClose(a.id)}
                                  className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition text-center"
                                >
                                  Mark as Completed
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: DEPARTMENT VIEW (CSE) */}
              {activeSection === 'department' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">CSE Department NAAC Compliance Hub</h3>
                      <p className="text-[10px] text-slate-500">CSE isolation dashboard monitoring local progress and coordinator contributions.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-2xl bg-indigo-50/50 space-y-1 text-xs">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">CSE metrics assigned</span>
                        <span className="text-2xl font-bold text-indigo-700">4 Metrics</span>
                      </div>
                      <div className="p-4 border rounded-2xl bg-indigo-50/50 space-y-1 text-xs">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">CSE completeness percentage</span>
                        <span className="text-2xl font-bold text-indigo-700">93.5% Complied</span>
                      </div>
                      <div className="p-4 border rounded-2xl bg-indigo-50/50 space-y-1 text-xs">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">CSE documents uploaded</span>
                        <span className="text-2xl font-bold text-indigo-700">2 Files</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Assigned metrics checklist</span>
                      {metrics.filter(m => m.department === 'CSE').map((m) => (
                        <div key={m.id} className="p-3 border rounded-xl bg-white flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-indigo-700 font-mono mr-2">{m.code}</span>
                            <span className="font-medium text-slate-800">{m.name}</span>
                          </div>
                          <Badge tone={m.status === 'Completed' ? 'success' : 'warn'}>{m.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: REPORTS BUILDER */}
              {activeSection === 'reports' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">NAAC SSR &amp; AQAR Compiler</h3>
                      <p className="text-[10px] text-slate-500">Generate, formatting, and downloading compiled Self-Study Reports (SSR) chapters.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="p-4 border rounded-2xl space-y-3 text-xs">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><FileText className="size-4 text-indigo-600" /> Self-Study Report (SSR) Builder</h4>
                        <p className="text-[11px] text-slate-500 leading-normal">Download a compiled document combining all criteria logs, metrics weightage tables, and approved evidence indexes into an accreditation package.</p>
                        
                        <div className="space-y-1.5">
                          {[1, 2, 3, 4, 5, 6, 7].map(num => (
                            <button
                              key={num}
                              onClick={() => handleGenerateSSR(num)}
                              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 rounded-lg text-[10px] font-bold text-left px-3 transition cursor-pointer flex justify-between items-center"
                            >
                              <span>Compile Criterion {num} Chapter</span>
                              <Download className="size-3 text-slate-400" />
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => handleGenerateSSR('all')}
                          className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <Download className="size-4" /> Generate Complete SSR Report
                        </button>
                      </div>

                      {/* AQAR report compiles */}
                      <div className="p-4 border rounded-2xl space-y-3 text-xs flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 flex items-center gap-1.5"><FileCheck className="size-4 text-emerald-600" /> Annual Quality Assurance (AQAR) Reports</h4>
                          <p className="text-[11px] text-slate-500 leading-normal mb-4">Export annual compliance reviews for previous academic years.</p>
                          
                          <div className="space-y-2">
                            <div className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-800">AQAR Academic Year 2024-25</span>
                                <span className="block text-[10px] text-slate-400">Submitted on June 20, 2025</span>
                              </div>
                              <Badge tone="success">Submitted</Badge>
                            </div>
                            <div className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-800">AQAR Academic Year 2025-26</span>
                                <span className="block text-[10px] text-slate-400">Draft version (Due Dec 2026)</span>
                              </div>
                              <Badge tone="warn">Drafting</Badge>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            toast.success('Starting AQAR export compiler pipeline...');
                          }}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <Download className="size-4" /> Export Latest AQAR Report
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: SYSTEM NOTIFICATIONS */}
              {activeSection === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Quality Compliance Alerts</h3>
                      <p className="text-[10px] text-slate-500">Live notifications for document expiry, due dates, and audit results.</p>
                    </div>

                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-3.5 border rounded-2xl bg-white flex justify-between items-start text-xs hover:border-slate-300 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{n.type} Alert</span>
                              {n.unread && <span className="size-2 rounded-full bg-rose-500" />}
                            </div>
                            <p className="text-slate-600 leading-normal">{n.message || n.title}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{n.createdAt || n.time || 'Just now'}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: SYSTEM AUDIT TRAIL */}
              {activeSection === 'audit' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">System Operations Audit Trail</h3>
                      <p className="text-[10px] text-slate-500">Log entries capturing evidence uploads, meeting schedules, and workflow transitions.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-slate-400">
                            <th className="text-left pb-2">User</th>
                            <th className="text-left pb-2">Action</th>
                            <th className="text-left pb-2">Entity Updated</th>
                            <th className="text-center pb-2">IP Address</th>
                            <th className="text-right pb-2">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                              <td className="py-3">
                                <span className="font-bold text-slate-800 block">{log.userName || log.user_name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{log.role}</span>
                              </td>
                              <td className="py-3 font-semibold text-slate-700">{log.action}</td>
                              <td className="py-3 font-mono text-[10px] text-slate-500">{log.entity} ({log.entityId || log.entity_id})</td>
                              <td className="py-3 text-center font-mono text-[10px] text-slate-500">{log.ip}</td>
                              <td className="py-3 text-right font-medium text-slate-400">{log.createdAt || log.created_at}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* MODAL: CREATE METRIC */}
      {showCreateMetricModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-lg overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Add New Criteria Metric Mapping</h3>
              <button onClick={() => setShowCreateMetricModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateMetricSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Criterion</label>
                  <select
                    value={newMetric.criteriaId}
                    onChange={(e) => setNewMetric({ ...newMetric, criteriaId: e.target.value })}
                    className="w-full border rounded-xl p-2 bg-white"
                  >
                    {criteria.map((c) => (
                      <option key={c.id} value={c.id}>Criterion {c.number} - {c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Metric ID Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.1.3"
                    value={newMetric.code}
                    onChange={(e) => setNewMetric({ ...newMetric, code: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Metric Label Name</label>
                <input
                  type="text"
                  placeholder="e.g. Syllabus revision documentation"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Metric detailed description</label>
                <textarea
                  placeholder="Provide NAAC requirements details..."
                  value={newMetric.description}
                  onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Weightage Score</label>
                  <input
                    type="number"
                    value={newMetric.weightage}
                    onChange={(e) => setNewMetric({ ...newMetric, weightage: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Target Date</label>
                  <input
                    type="date"
                    value={newMetric.targetDate}
                    onChange={(e) => setNewMetric({ ...newMetric, targetDate: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Save Metric Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD EVIDENCE */}
      {showUploadEvidenceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-md overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Upload Supporting Evidence Document</h3>
              <button onClick={() => setShowUploadEvidenceModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleUploadEvidenceSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-[11px] text-slate-500 leading-normal">Uploading file proof for metric: <strong>{selectedMetric?.code} - {selectedMetric?.name}</strong></p>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Document Description</label>
                <input
                  type="text"
                  placeholder="e.g. Board of Studies Rev 2 Syllabus"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">File Type</label>
                  <select
                    value={newEvidence.fileType}
                    onChange={(e) => setNewEvidence({ ...newEvidence, fileType: e.target.value })}
                    className="w-full border rounded-xl p-2 bg-white"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word Document (DOCX)</option>
                    <option value="XLSX">Excel Spreadsheet</option>
                    <option value="ZIP">ZIP Archive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Mock File Name</label>
                  <input
                    type="text"
                    value={newEvidence.fileUrl}
                    onChange={(e) => setNewEvidence({ ...newEvidence, fileUrl: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Upload File Metadata
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MEETING */}
      {showScheduleMeetingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-lg overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Schedule QA Audit Meeting</h3>
              <button onClick={() => setShowScheduleMeetingModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleScheduleMeetingSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Committee</label>
                <select
                  value={newMeeting.committeeId}
                  onChange={(e) => setNewMeeting({ ...newMeeting, committeeId: e.target.value })}
                  className="w-full border rounded-xl p-2 bg-white"
                >
                  <option value="COM001">Internal Quality Assurance Cell (IQAC)</option>
                  <option value="COM002">NAAC Steering Committee</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Criteria 2 Teaching-Learning Review"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Agenda Items</label>
                <textarea
                  placeholder="Review of student feedback channels, PO mapping..."
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:00 AM"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Venue</label>
                  <input
                    type="text"
                    placeholder="Board Room"
                    value={newMeeting.venue}
                    onChange={(e) => setNewMeeting({ ...newMeeting, venue: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Participants (comma separated names)</label>
                <input
                  type="text"
                  placeholder="Dr. John Smith, Mrs. Ananya Sen"
                  value={newMeeting.participants}
                  onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Schedule Meeting &amp; Notify Members
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN ATR */}
      {showCreateATRModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-md overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Log Action Taken Report (ATR) Task</h3>
              <button onClick={() => setShowCreateATRModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateATRSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-[11px] text-slate-500 leading-normal">Assigning follow-up task mapped to meeting: <strong>{selectedMeetingForATR?.title}</strong></p>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Task Action Description</label>
                <input
                  type="text"
                  placeholder="e.g. Audit Mechanical Lab computing inventory"
                  value={newATR.description}
                  onChange={(e) => setNewATR({ ...newATR, description: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Assigned Coordinator</label>
                  <input
                    type="text"
                    value={newATR.assignedTo}
                    onChange={(e) => setNewATR({ ...newATR, assignedTo: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Due Date</label>
                  <input
                    type="date"
                    value={newATR.dueDate}
                    onChange={(e) => setNewATR({ ...newATR, dueDate: e.target.value })}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Log ATR Action Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAccreditation;
