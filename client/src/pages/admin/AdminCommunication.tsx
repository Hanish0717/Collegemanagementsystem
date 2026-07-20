import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  Send,
  Bell,
  Smartphone,
  CheckCircle,
  Clock,
  Plus,
  BarChart2,
  Trash2,
  FileText,
  FileCheck,
  Settings,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Upload,
  BookOpen,
  Calendar,
  XCircle,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  Link2
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { getStoredUser } from '@/services/authService';
import * as service from '@/services/communicationService';

export function AdminCommunication() {
  const currentUser = getStoredUser() || { name: 'System Admin', role: 'admin', department: 'CSE' };
  
  // Section Navigation control
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'announcements' | 'templates' | 'workflow' | 'polls' | 'surveys' | 'gateways' | 'reports' | 'logs'
  >('dashboard');

  // Datasets
  const [kpis, setKpis] = useState<any>({
    totalAnnouncements: 3,
    activeAnnouncements: 2,
    draftsCount: 0,
    scheduledCount: 1,
    archivedCount: 0,
    emailSent: 342,
    smsSent: 34,
    whatsappSent: 240,
    pushSent: 850,
    failedCount: 8,
    successRate: 98,
    readRate: 45,
    activeSurveys: 1,
    activePolls: 1,
    pendingApprovals: 0
  });

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [logs, setLogs] = useState<any>({ logs: [], queue: [], reads: [] });
  const [gateways, setGateways] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  // Forms state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [showCreateSurveyModal, setShowCreateSurveyModal] = useState(false);

  // Form Fields
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    subject: '',
    content: '',
    category: 'Academic',
    priority: 'Medium',
    channel: 'Portal',
    audienceRoles: ['student'],
    targetDepartments: ['all'],
    status: 'Draft',
    publishDate: '',
    expiryDate: ''
  });

  const [newTemplate, setNewTemplate] = useState({
    title: '',
    subject: '',
    contentTemplate: '',
    category: 'General'
  });

  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    deadline: ''
  });

  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    deadline: '',
    isAnonymous: false,
    isMandatory: false,
    questions: [{ text: '', type: 'Text' }]
  });

  const [workflowForm, setWorkflowForm] = useState({
    stage: 'HOD',
    status: 'Approved',
    remarks: ''
  });

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const dash = await service.fetchDashboardData();
      if (dash) {
        setKpis(dash.kpis);
        setAnnouncements(dash.announcements || []);
        setSurveys(dash.surveys || []);
        setPolls(dash.polls || []);
        setGateways(dash.gateways || []);
      }
      
      const temps = await service.fetchTemplates();
      if (temps) setTemplates(temps);

      const journal = await service.fetchLogs();
      if (journal) setLogs(journal);

      setLoading(false);
    } catch (err) {
      toast.error('Failed to load communication datasets.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.subject || !newAnnouncement.content) {
      toast.error('Please fill in title, subject, and message content.');
      return;
    }
    try {
      await service.createAnnouncement(newAnnouncement);
      toast.success('Announcement composed and registered.');
      setShowComposeModal(false);
      setNewAnnouncement({
        title: '',
        subject: '',
        content: '',
        category: 'Academic',
        priority: 'Medium',
        channel: 'Portal',
        audienceRoles: ['student'],
        targetDepartments: ['all'],
        status: 'Draft',
        publishDate: '',
        expiryDate: ''
      });
      loadData();
    } catch (err) {
      toast.error('Failed to save announcement.');
    }
  };

  const handleCreateTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.contentTemplate) {
      toast.error('Please enter template title and body.');
      return;
    }
    try {
      await service.createTemplate(newTemplate);
      toast.success('Template saved successfully.');
      setShowCreateTemplateModal(false);
      setNewTemplate({
        title: '',
        subject: '',
        contentTemplate: '',
        category: 'General'
      });
      loadData();
    } catch (err) {
      toast.error('Failed to save template.');
    }
  };

  const handleCreatePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoll.question || newPoll.options.some(o => !o.trim())) {
      toast.error('Please enter question and all option labels.');
      return;
    }
    try {
      await service.createPoll(newPoll);
      toast.success('Live poll published.');
      setShowCreatePollModal(false);
      setNewPoll({ question: '', options: ['', ''], deadline: '' });
      loadData();
    } catch (err) {
      toast.error('Failed to publish poll.');
    }
  };

  const handleCreateSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurvey.title || newSurvey.questions.some(q => !q.text.trim())) {
      toast.error('Please fill in survey title and question text.');
      return;
    }
    try {
      await service.createSurvey(newSurvey);
      toast.success('Survey successfully published.');
      setShowCreateSurveyModal(false);
      setNewSurvey({
        title: '',
        description: '',
        deadline: '',
        isAnonymous: false,
        isMandatory: false,
        questions: [{ text: '', type: 'Text' }]
      });
      loadData();
    } catch (err) {
      toast.error('Failed to publish survey.');
    }
  };

  const handleWorkflowSubmission = async (announcementId: string) => {
    try {
      await service.submitCircularWorkflow(announcementId, workflowForm);
      toast.success(`Circular status updated: ${workflowForm.status}`);
      setSelectedAnnouncement(null);
      loadData();
    } catch (err) {
      toast.error('Failed to submit workflow update.');
    }
  };

  const handlePollVote = async (pollId: string, optionText: string) => {
    try {
      await service.submitVote(pollId, optionText);
      toast.success('Thank you for voting!');
      loadData();
    } catch (err) {
      toast.error('Failed to cast vote.');
    }
  };

  const handleAnnouncementDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement circular?')) return;
    try {
      await service.deleteAnnouncement(id);
      toast.success('Announcement deleted.');
      loadData();
    } catch (err) {
      toast.error('Failed to delete announcement.');
    }
  };

  const handleApplyTemplate = (temp: any) => {
    setNewAnnouncement({
      ...newAnnouncement,
      title: temp.title,
      subject: temp.subject || '',
      content: temp.contentTemplate
    });
    setShowComposeModal(true);
    toast.success('Template loaded into composer.');
  };

  // Filters
  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = searchQuery === '' || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'all' || a.category === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === 'all' || a.status === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Communication Hub"
        desc="Compose rich Announcements, target student/faculty segments, monitor gateway status, and analyze feedback polls & surveys."
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-55"
          >
            <RefreshCw className={`size-4.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Systems</span>
          </button>
        }
      />

      {/* Grid Portal layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Submenu Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview Dashboard', icon: BarChart2 },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'templates', label: 'Message Templates', icon: FileText },
            { id: 'workflow', label: 'Approvals Workflow', icon: Shield },
            { id: 'polls', label: 'Quick Polls', icon: MessageSquare },
            { id: 'surveys', label: 'Student Surveys', icon: FileCheck },
            { id: 'gateways', label: 'Gateways Settings', icon: Settings },
            { id: 'reports', label: 'Read Receipts & Logs', icon: Clock }
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

        {/* Right Canvas */}
        <div className="lg:col-span-4 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <RefreshCw className="size-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-muted-foreground">Synchronizing delivery queues and active polls...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* SECTION: DASHBOARD */}
              {activeSection === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Delivery success rate"
                      value={`${kpis.successRate}% Sent`}
                      change={`${kpis.failedCount} failed deliveries`}
                      icon={CheckCircle2}
                      gradient="bg-gradient-primary"
                    />
                    <StatCard
                      label="Active Announcements"
                      value={kpis.activeAnnouncements}
                      change={`${kpis.scheduledCount} scheduled notices`}
                      icon={Bell}
                      gradient="bg-gradient-violet"
                    />
                    <StatCard
                      label="Active Polls & Surveys"
                      value={kpis.activePolls + kpis.activeSurveys}
                      change="Collecting feedback responses"
                      icon={MessageSquare}
                      gradient="bg-gradient-cyan"
                    />
                    <StatCard
                      label="Average read rate"
                      value={`${kpis.readRate}% Read`}
                      change="Read receipts compiled"
                      icon={Clock}
                      gradient="bg-gradient-primary"
                    />
                  </div>

                  {/* Channel details & gate status */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Dispatched Volume by Channel</h3>
                        <p className="text-[10px] text-slate-500">Breakdown of communication counts across all external APIs.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <div className="p-3 border rounded-xl bg-slate-50 text-center">
                          <Mail className="size-5 mx-auto text-indigo-600 mb-1" />
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Email</span>
                          <span className="text-sm font-bold text-slate-800">{kpis.emailSent} sent</span>
                        </div>
                        <div className="p-3 border rounded-xl bg-slate-50 text-center">
                          <Smartphone className="size-5 mx-auto text-violet-600 mb-1" />
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">SMS</span>
                          <span className="text-sm font-bold text-slate-800">{kpis.smsSent} sent</span>
                        </div>
                        <div className="p-3 border rounded-xl bg-slate-50 text-center">
                          <MessageSquare className="size-5 mx-auto text-emerald-600 mb-1" />
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">WhatsApp</span>
                          <span className="text-sm font-bold text-slate-800">{kpis.whatsappSent} sent</span>
                        </div>
                        <div className="p-3 border rounded-xl bg-slate-50 text-center">
                          <Bell className="size-5 mx-auto text-cyan-600 mb-1" />
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Push</span>
                          <span className="text-sm font-bold text-slate-800">{kpis.pushSent} sent</span>
                        </div>
                      </div>
                    </Card>

                    {/* Gateway Panel */}
                    <Card className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Gateway Services Status</h3>
                        <p className="text-[10px] text-slate-500">Live indicators of external dispatcher endpoints.</p>
                      </div>
                      <div className="space-y-3">
                        {gateways.map((g) => (
                          <div key={g.id} className="flex justify-between items-center text-xs p-2.5 border rounded-xl bg-white">
                            <span className="font-bold text-slate-700">{g.channel} API</span>
                            <Badge tone={g.is_active ? 'success' : 'danger'}>
                              {g.is_active ? 'Online' : 'Offline'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* SECTION: ANNOUNCEMENTS */}
              {activeSection === 'announcements' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border rounded-2xl">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-800 text-sm">Announcements Directives</h3>
                      <button
                        onClick={() => setShowComposeModal(true)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Compose Notice
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search headlines..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                        />
                      </div>
                      
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="border border-slate-200 rounded-xl text-xs p-1.5 focus:outline-none bg-white"
                      >
                        <option value="all">All Categories</option>
                        <option value="Exam">Exams</option>
                        <option value="Holiday">Holidays</option>
                        <option value="Placement">Placements</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredAnnouncements.length === 0 ? (
                      <div className="bg-white border rounded-2xl p-12 text-center text-xs text-muted-foreground">
                        No announcements matched your filter search.
                      </div>
                    ) : (
                      filteredAnnouncements.map((a) => (
                        <div key={a.id} className="bg-white border rounded-2xl p-5 space-y-3 hover:border-indigo-300 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge tone={a.priority === 'High' ? 'danger' : 'warn'}>
                                  {a.priority} Priority
                                </Badge>
                                <span className="text-[10px] text-indigo-700 font-mono font-bold">{a.category} Circular</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm leading-snug">{a.title}</h4>
                              <span className="text-[11px] font-semibold text-slate-500">{a.subject}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge tone={a.status === 'Published' ? 'success' : 'warn'}>{a.status}</Badge>
                              <button
                                onClick={() => handleAnnouncementDelete(a.id)}
                                className="p-1 hover:bg-rose-50 rounded-lg text-rose-500 transition cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          <div 
                            className="text-xs text-slate-600 leading-normal bg-slate-50 p-3.5 rounded-xl border border-slate-100"
                            dangerouslySetInnerHTML={{ __html: a.content }}
                          />

                          <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 font-semibold pt-2 border-t">
                            <span>Audience: <strong className="text-slate-600">{Array.isArray(a.audience_roles) ? a.audience_roles.join(', ') : 'All'}</strong></span>
                            <span>Published on: <strong className="text-slate-600">{a.publish_date || 'Send Now'}</strong></span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* SECTION: TEMPLATES */}
              {activeSection === 'templates' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Circular &amp; Notice Templates</h3>
                        <p className="text-[10px] text-slate-500">Pick ready-made email/SMS outline formats to dispatch quickly.</p>
                      </div>
                      <button
                        onClick={() => setShowCreateTemplateModal(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Add Template
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {templates.map((temp) => (
                        <div key={temp.id} className="p-4 border rounded-2xl bg-white space-y-3 hover:border-indigo-200 transition text-xs flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-800 leading-snug">{temp.title}</h4>
                              <Badge tone="default">{temp.category}</Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed italic p-2 bg-slate-50 rounded-lg">
                              {temp.contentTemplate || temp.content_template}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleApplyTemplate(temp)}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition text-center"
                          >
                            Load Template in Composer
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: WORKFLOW APPROVALS */}
              {activeSection === 'workflow' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Circulars Approvals Portal</h3>
                      <p className="text-[10px] text-slate-500">Approve or audit scheduled official directives before dispatching: Faculty ➔ HOD ➔ Dean ➔ Principal ➔ Published.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Approvals Queue */}
                      <div className="lg:col-span-2 space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Circulars in Review</span>
                        
                        {announcements.filter(a => a.status === 'Awaiting_Approval' || a.status === 'Draft').length === 0 ? (
                          <div className="bg-white border rounded-2xl p-6 text-center text-xs text-slate-400">
                            No notices are currently in the review workflow queue.
                          </div>
                        ) : (
                          announcements.filter(a => a.status === 'Awaiting_Approval' || a.status === 'Draft').map((a) => (
                            <div
                              key={a.id}
                              onClick={() => setSelectedAnnouncement(a)}
                              className={`p-4 border rounded-2xl cursor-pointer transition text-xs space-y-2 ${
                                selectedAnnouncement?.id === a.id ? 'border-indigo-600 bg-indigo-50/20' : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-800">{a.title}</span>
                                <Badge tone="warn">{a.status}</Badge>
                              </div>
                              <p className="text-[10px] text-slate-500">{a.subject}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Verdict Action */}
                      <div className="lg:col-span-1">
                        {selectedAnnouncement ? (
                          <div className="bg-slate-50/50 border rounded-2xl p-4 space-y-4 text-xs">
                            <h4 className="font-bold text-slate-800">Workflow Approval Verdict</h4>
                            <p className="text-[11px] text-slate-500">Circular: <strong>{selectedAnnouncement.title}</strong></p>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Your Role Stage</label>
                                <select
                                  value={workflowForm.stage}
                                  onChange={(e) => setWorkflowForm({ ...workflowForm, stage: e.target.value })}
                                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs"
                                >
                                  <option value="HOD">HOD (Departmental review)</option>
                                  <option value="Dean">Dean Academics (Validation)</option>
                                  <option value="Principal">Principal (Final Sign-off)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Workflow Status Verdict</label>
                                <select
                                  value={workflowForm.status}
                                  onChange={(e) => setWorkflowForm({ ...workflowForm, status: e.target.value })}
                                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs"
                                >
                                  <option value="Approved">Approve &amp; Dispatch</option>
                                  <option value="Rejected">Reject</option>
                                  <option value="Sent_Back">Send Back for corrections</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Remarks &amp; comments</label>
                                <textarea
                                  placeholder="Type approval review remarks..."
                                  value={workflowForm.remarks}
                                  onChange={(e) => setWorkflowForm({ ...workflowForm, remarks: e.target.value })}
                                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs focus:outline-none min-h-[80px]"
                                />
                              </div>

                              <button
                                onClick={() => handleWorkflowSubmission(selectedAnnouncement.id)}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition text-center"
                              >
                                Submit Verdict
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border rounded-2xl p-6 text-center text-[11px] text-slate-400">
                            Select a circular from the left queue to perform approval actions.
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: POLLS */}
              {activeSection === 'polls' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Quick Student Polls</h3>
                        <p className="text-[10px] text-slate-500">Collect quick yes/no or multiple choice opinions from the college community.</p>
                      </div>
                      <button
                        onClick={() => setShowCreatePollModal(true)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Launch Poll
                      </button>
                    </div>

                    <div className="space-y-4">
                      {polls.map((p) => (
                        <div key={p.id} className="p-4 border rounded-2xl bg-white space-y-3 text-xs">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-800 leading-snug">{p.question}</h4>
                            <Badge tone={p.status === 'Active' ? 'success' : 'default'}>{p.status}</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {p.votes ? (
                              p.votes.map((v: any, index: number) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                                    <span>{v.option}</span>
                                    <span>{v.count} votes</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-600"
                                      style={{ width: `${v.count > 0 ? (v.count / 250) * 100 : 0}%` }}
                                    />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex gap-2">
                                {p.options.map((opt: string, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() => handlePollVote(p.id, opt)}
                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold cursor-pointer transition"
                                  >
                                    Vote: {opt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 font-semibold pt-1">
                            Deadline: {p.deadline || 'No expiry'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: SURVEYS */}
              {activeSection === 'surveys' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Institutional Feedback Surveys</h3>
                        <p className="text-[10px] text-slate-500">Deploy full-length feedback questionnaires to students or parents.</p>
                      </div>
                      <button
                        onClick={() => setShowCreateSurveyModal(true)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Deploy Survey
                      </button>
                    </div>

                    <div className="space-y-3">
                      {surveys.map((s) => (
                        <div key={s.id} className="p-4 border rounded-2xl bg-white flex justify-between items-center text-xs hover:border-indigo-200 transition">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800">{s.title}</h4>
                            <p className="text-slate-500">{s.description}</p>
                            <div className="flex gap-4 text-[10px] text-slate-400 font-semibold pt-1">
                              <span>Questions: <strong>{s.questionsCount || 4}</strong></span>
                              <span>Responses: <strong>{s.responsesCount || 156}</strong></span>
                              <span>Deadline: <strong>{s.deadline}</strong></span>
                            </div>
                          </div>

                          <Badge tone={s.status === 'Active' ? 'success' : 'default'}>{s.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: GATEWAYS */}
              {activeSection === 'gateways' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4 text-xs">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">APIs &amp; Gateways configuration</h3>
                      <p className="text-[10px] text-slate-500">Configure credentials and tokens for your institution's broadcast relays.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {gateways.map((g) => (
                        <div key={g.id} className="p-4 border rounded-2xl bg-slate-50/50 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-xs">{g.channel} Gateway settings</span>
                            <Badge tone={g.is_active ? 'success' : 'danger'}>{g.is_active ? 'Active' : 'Disabled'}</Badge>
                          </div>
                          
                          <div className="p-3 bg-white border rounded-xl space-y-1.5 font-mono text-[10px] text-slate-600">
                            <div>Provider Status: <strong className="text-slate-800">{g.config_json?.gateway || g.config_json?.provider || 'SMTP Local'}</strong></div>
                            <div>Success Rate: <strong className="text-emerald-600">{g.success_rate}%</strong></div>
                            <div>Last Sync: <strong className="text-slate-800">{g.last_sync || 'Never'}</strong></div>
                          </div>

                          <button
                            onClick={() => {
                              toast.info(`Configured details for ${g.channel} gateway connection saved.`);
                            }}
                            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition text-center cursor-pointer"
                          >
                            Update Gateway configs
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* SECTION: REPORTS & LOGS */}
              {activeSection === 'reports' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Communication Delivery Journal</h3>
                      <p className="text-[10px] text-slate-500">Audit logs trace, queue, and read receipts receipts for all users.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-slate-400">
                            <th className="text-left pb-2">Headline subject</th>
                            <th className="text-center pb-2">Channel</th>
                            <th className="text-center pb-2">Recipients</th>
                            <th className="text-center pb-2">Success count</th>
                            <th className="text-right pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {logs.logs && logs.logs.map((row: any) => (
                            <tr key={row.id}>
                              <td className="py-2.5">
                                <span className="font-bold text-slate-800 block">{row.title}</span>
                                <span className="text-[10px] text-slate-400">Sent by: {row.sent_by}</span>
                              </td>
                              <td className="py-2.5 text-center font-semibold">{row.channel}</td>
                              <td className="py-2.5 text-center font-mono font-bold">{row.recipients_count}</td>
                              <td className="py-2.5 text-center font-mono text-emerald-600 font-bold">{row.delivered_count}</td>
                              <td className="py-2.5 text-right">
                                <Badge tone="success">{row.status}</Badge>
                              </td>
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

      {/* MODAL: COMPOSE ANNOUNCEMENT */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-lg overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Compose Institutional Broadcast</h3>
              <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleComposeSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Category</label>
                  <select
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                    className="w-full border rounded-xl p-2 bg-white"
                  >
                    <option value="Academic">Academic Notice</option>
                    <option value="Holiday">Holiday circular</option>
                    <option value="Placement">Placement alerts</option>
                    <option value="Exam">Exams notifications</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Priority</label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                    className="w-full border rounded-xl p-2 bg-white"
                  >
                    <option value="Low">Low priority</option>
                    <option value="Medium">Medium priority</option>
                    <option value="High">High priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Headline Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule for odd term semester end exams"
                  value={newAnnouncement.subject}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, subject: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Title Label</label>
                <input
                  type="text"
                  placeholder="e.g. Exam cell announcement"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Message Body Content (HTML support)</label>
                <textarea
                  placeholder="Type the broadcast message..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Target Audience roles</label>
                  <select
                    multiple
                    value={newAnnouncement.audienceRoles}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions, o => o.value);
                      setNewAnnouncement({ ...newAnnouncement, audienceRoles: opts });
                    }}
                    className="w-full border rounded-xl p-2 bg-white min-h-[60px]"
                  >
                    <option value="student">Students</option>
                    <option value="faculty">Faculty members</option>
                    <option value="parent">Parents</option>
                    <option value="alumni">Alumni network</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Dispatch Channel</label>
                  <select
                    value={newAnnouncement.channel}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, channel: e.target.value })}
                    className="w-full border rounded-xl p-2 bg-white"
                  >
                    <option value="Portal">Portal Circular posting</option>
                    <option value="Email">Email broadcast notification</option>
                    <option value="SMS">SMS Gateway alert</option>
                    <option value="WhatsApp">WhatsApp Message Hook</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Send Broadcast Notification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TEMPLATE */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-md overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Create Circular Template</h3>
              <button onClick={() => setShowCreateTemplateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateTemplateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Template title</label>
                <input
                  type="text"
                  placeholder="e.g. Lab fee dues notice"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Default Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Dues notice: [Student Name]"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Template content (placeholders support)</label>
                <textarea
                  placeholder="e.g. Dear [Name], please clear dues of $[Amount]..."
                  value={newTemplate.contentTemplate}
                  onChange={(e) => setNewTemplate({ ...newTemplate, contentTemplate: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none min-h-[100px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Save Template format
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE POLL */}
      {showCreatePollModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-md overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Launch Live Feedback Poll</h3>
              <button onClick={() => setShowCreatePollModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreatePollSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Poll Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. Do you prefer canteen lunch over cafeteria?"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-500 uppercase text-[10px]">Options</label>
                {newPoll.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...newPoll.options];
                      newOpts[idx] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOpts });
                    }}
                    className="w-full border rounded-xl p-2 focus:outline-none"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer block pt-1"
                >
                  + Add Option Choice
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Closing Expiry date</label>
                <input
                  type="date"
                  value={newPoll.deadline}
                  onChange={(e) => setNewPoll({ ...newPoll, deadline: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Publish Live Poll
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SURVEY */}
      {showCreateSurveyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-lg overflow-hidden border">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Deploy Student Survey</h3>
              <button onClick={() => setShowCreateSurveyModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateSurveySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Survey Questionnaire title</label>
                <input
                  type="text"
                  placeholder="e.g. Transportation Bus comfort survey 2026"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">Short Description details</label>
                <textarea
                  placeholder="Provide scope guidelines of feedback collection..."
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                  className="w-full border rounded-xl p-2 focus:outline-none min-h-[60px]"
                />
              </div>

              <div className="space-y-3">
                <label className="block font-bold text-slate-500 uppercase text-[10px]">Question List</label>
                {newSurvey.questions.map((q, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Question ${idx + 1} text`}
                      value={q.text}
                      onChange={(e) => {
                        const newQ = [...newSurvey.questions];
                        newQ[idx].text = e.target.value;
                        setNewSurvey({ ...newSurvey, questions: newQ });
                      }}
                      className="w-full border rounded-xl p-2 focus:outline-none"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const newQ = [...newSurvey.questions];
                        newQ[idx].type = e.target.value;
                        setNewSurvey({ ...newSurvey, questions: newQ });
                      }}
                      className="border rounded-xl p-2 bg-white"
                    >
                      <option value="Text">Short Text</option>
                      <option value="Paragraph">Paragraph</option>
                      <option value="Radio">Radio Single Choice</option>
                    </select>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewSurvey({ ...newSurvey, questions: [...newSurvey.questions, { text: '', type: 'Text' }] })}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer block pt-1"
                >
                  + Add Question Row
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    checked={newSurvey.isAnonymous}
                    onChange={(e) => setNewSurvey({ ...newSurvey, isAnonymous: e.target.checked })}
                    className="size-4"
                  />
                  <label className="font-bold text-slate-700">Anonymous Responses</label>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    checked={newSurvey.isMandatory}
                    onChange={(e) => setNewSurvey({ ...newSurvey, isMandatory: e.target.checked })}
                    className="size-4"
                  />
                  <label className="font-bold text-slate-700">Mandatory for Students</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center cursor-pointer"
              >
                Deploy Survey to Portals
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCommunication;
