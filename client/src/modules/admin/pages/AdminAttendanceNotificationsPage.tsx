import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Mail,
  Search,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  BookOpen,
  User,
  MailWarning,
  ListFilter,
  CheckCircle2,
  XCircle,
  Activity,
  UserCheck
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import {
  fetchNotificationDashboard,
  fetchNotificationHistory,
  triggerManualNotifications,
  AttendanceNotificationLog,
  DashboardStats
} from '@/services/attendanceNotificationService';
import {
  fetchWorkflowHistory,
  AttendanceNotificationRequest
} from '@/services/attendanceApprovalService';

export function AdminAttendanceNotifications() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'requests' | 'approvals' | 'delivery'>('analytics');
  
  // Stats & Delivery logs state
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    warning: 0,
    critical: 0,
    detention: 0,
    failed: 0
  });
  
  const [logs, setLogs] = useState<AttendanceNotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSlab, setSelectedSlab] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Workflow Requests states
  const [workflowRequests, setWorkflowRequests] = useState<AttendanceNotificationRequest[]>([]);
  
  // Pagination for delivery logs
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);

  // Detail Modals
  const [selectedLog, setSelectedLog] = useState<AttendanceNotificationLog | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AttendanceNotificationRequest | null>(null);

  // Load Dashboard Stats
  const loadDashboardStats = async () => {
    try {
      const data = await fetchNotificationDashboard();
      if (data && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  };

  // Load all HOD approval requests for Admins
  const loadWorkflowRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchWorkflowHistory();
      setWorkflowRequests(data || []);
    } catch (err) {
      console.error('Error fetching workflow requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load SMTP Notification Delivery History Logs
  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchNotificationHistory({
        page,
        limit,
        search,
        slab: selectedSlab,
        status: selectedStatus
      });
      if (data) {
        setLogs(data.logs);
        setTotalLogs(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      toast.error('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'requests' || activeTab === 'approvals') {
      loadWorkflowRequests();
    } else if (activeTab === 'delivery') {
      loadHistory();
    }
  }, [activeTab, page, selectedSlab, selectedStatus]);

  // Debounced/Triggered Search for Delivery Logs
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  // Trigger Manual Calculations & Warnings
  const handleTriggerRun = async () => {
    if (triggering) return;
    try {
      setTriggering(true);
      toast.loading('Initializing Monthly Attendance calculation...', { id: 'trigger-run' });
      
      const res = await triggerManualNotifications();
      if (res.success) {
        toast.success(res.message || 'Notification cycle triggered successfully in background.', { id: 'trigger-run' });
        setTimeout(() => {
          loadDashboardStats();
          loadWorkflowRequests();
          if (activeTab === 'delivery') loadHistory();
        }, 1500);
      } else {
        toast.error('Failed to trigger notification cycle', { id: 'trigger-run' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error executing notifications', { id: 'trigger-run' });
    } finally {
      setTriggering(false);
    }
  };

  // Warning Level styling utilities
  const getSlabBadgeColor = (type: string) => {
    switch (type) {
      case 'Warning': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Critical Warning': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'Detention Alert': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default: return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending HOD Approval': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Sent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const totalPages = Math.ceil(totalLogs / limit) || 1;

  // Filter requests based on search query
  const filteredRequests = workflowRequests.filter(req => 
    req.student_name.toLowerCase().includes(search.toLowerCase()) ||
    req.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    req.teacher_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Attendance Alerts"
        desc="Admin dashboard to calculate monthly attendance alerts, track HOD request approval workflows, and check SMTP email delivery logs."
        actions={
          <button
            onClick={handleTriggerRun}
            disabled={triggering}
            className="relative overflow-hidden px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed group animate-fade-in"
          >
            {triggering ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5 group-hover:animate-pulse" />
            )}
            <span>{triggering ? 'Running Calculations...' : 'Run Monthly Audit'}</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Alerts Dispatch List"
          value={stats.total}
          icon={Bell}
          gradient="bg-blue-600"
        />
        <StatCard
          label="Pending Approvals"
          value={workflowRequests.filter(r => r.status === 'Pending HOD Approval').length}
          icon={AlertCircle}
          gradient="bg-blue-600"
        />
        <StatCard
          label="Approved Requests"
          value={workflowRequests.filter(r => r.status === 'Approved').length}
          icon={UserCheck}
          gradient="bg-blue-600"
        />
        <StatCard
          label="Sent Warning Notices"
          value={workflowRequests.filter(r => r.status === 'Sent').length}
          icon={CheckCircle2}
          gradient="bg-blue-600"
        />
        <StatCard
          label="Rejected / Revision Required"
          value={workflowRequests.filter(r => r.status === 'Rejected').length}
          icon={XCircle}
          gradient="bg-blue-600"
        />
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-muted">
        {[
          { id: 'analytics', label: 'Analytics Dashboard', icon: Activity },
          { id: 'requests', label: 'All Requests & Workflow', icon: ListFilter },
          { id: 'approvals', label: 'HOD Approval Ledger', icon: UserCheck },
          { id: 'delivery', label: 'Email Delivery Logs', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearch(''); }}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-slate-800 text-sm mb-3">Workflow Status Split</h3>
            <div className="space-y-3.5">
              {[
                { label: 'Pending HOD Approval', count: workflowRequests.filter(r => r.status === 'Pending HOD Approval').length, color: 'bg-amber-500' },
                { label: 'Approved & Pending Send', count: workflowRequests.filter(r => r.status === 'Approved').length, color: 'bg-indigo-500' },
                { label: 'Sent Warning Emails', count: workflowRequests.filter(r => r.status === 'Sent').length, color: 'bg-emerald-500' },
                { label: 'Rejected / Needs Revision', count: workflowRequests.filter(r => r.status === 'Rejected').length, color: 'bg-rose-500' }
              ].map((item, idx) => {
                const total = workflowRequests.length || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-slate-800 text-sm mb-3">Alert Volume By Department</h3>
            <div className="space-y-3">
              {['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE'].map((dept) => {
                const count = workflowRequests.filter(r => r.department === dept).length;
                return (
                  <div key={dept} className="flex items-center justify-between text-xs py-1 border-b">
                    <span className="font-bold text-slate-700">{dept} Department</span>
                    <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                      {count} alerts
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'requests' && (
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b pb-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <ListFilter className="size-4 text-indigo-500" />
              <span>Full Workflow Registry</span>
            </h3>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search student or teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-background text-xs outline-none focus:border-indigo-500"
              />
              <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400 text-left font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Student</th>
                  <th className="pb-3">Roll Number</th>
                  <th className="pb-3">Class/Dept</th>
                  <th className="pb-3">Overall %</th>
                  <th className="pb-3">Teacher</th>
                  <th className="pb-3">Warning Slab</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date Created</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-slate-800">{req.student_name}</td>
                      <td className="py-3.5 font-mono text-slate-600 font-semibold">{req.roll_number}</td>
                      <td className="py-3.5 text-slate-600 font-semibold">{req.department}</td>
                      <td className="py-3.5 font-bold text-red-500">{req.attendance_percentage}%</td>
                      <td className="py-3.5 font-semibold text-slate-700">{req.teacher_name || 'Teacher'}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSlabBadgeColor(req.message_type)}`}>
                          {req.message_type}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 font-semibold">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                          title="Inspect request"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      No matching requests in registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'approvals' && (
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b pb-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <UserCheck className="size-4 text-indigo-500" />
              <span>HOD Signoffs Ledger</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400 text-left font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Student</th>
                  <th className="pb-3">Overall %</th>
                  <th className="pb-3">Teacher</th>
                  <th className="pb-3">Approved/Rejected By</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Signoff Date</th>
                  <th className="pb-3">Remarks / Change Reasons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workflowRequests.filter(r => r.status !== 'Pending HOD Approval').length > 0 ? (
                  workflowRequests
                    .filter(r => r.status !== 'Pending HOD Approval')
                    .map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pl-2 font-bold text-slate-800">
                          {req.student_name}
                          <span className="text-[10px] text-slate-400 block font-normal">{req.roll_number} ({req.department})</span>
                        </td>
                        <td className="py-3.5 font-bold text-red-500">{req.attendance_percentage}%</td>
                        <td className="py-3.5 font-semibold text-slate-700">{req.teacher_name}</td>
                        <td className="py-3.5 font-bold text-indigo-900">{req.approved_by || 'HOD'}</td>
                        <td className="py-3.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeColor(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 font-semibold">
                          {req.approved_at ? new Date(req.approved_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3.5 text-slate-600 font-medium max-w-xs truncate" title={req.remarks || ''}>
                          {req.remarks || 'No issues found'}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No signoff records logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'delivery' && (
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b pb-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-indigo-500" />
              <span>Email Delivery Logs</span>
            </h3>

            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search Student/Roll No..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-background text-xs outline-none focus:border-indigo-500"
                />
                <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedSlab}
                onChange={(e) => { setSelectedSlab(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-xl border bg-background text-xs outline-none cursor-pointer focus:border-indigo-500"
              >
                <option value="">All Warning Levels</option>
                <option value="Warning">Warning (75% - 80%)</option>
                <option value="Critical Warning">Critical (65% - 75%)</option>
                <option value="Detention Alert">Detention (&lt; 65%)</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-xl border bg-background text-xs outline-none cursor-pointer focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="Sent">Sent Successfully</option>
                <option value="Failed">Failed Dispatches</option>
              </select>

              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Apply
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCw className="size-7 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Fetching dispatch history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Mail className="size-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No SMTP delivery logs match query</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 text-left font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Date &amp; Time</th>
                    <th className="pb-3">Student Details</th>
                    <th className="pb-3">Roll Number</th>
                    <th className="pb-3">Overall Att.</th>
                    <th className="pb-3">Warning Slab</th>
                    <th className="pb-3">Recipient</th>
                    <th className="pb-3">Delivery Email</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 text-slate-500 font-semibold">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3.5 text-indigo-500" />
                          <div>
                            <span>{log.student_name}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5 font-medium">({log.department})</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-slate-600 font-semibold">{log.roll_number}</td>
                      <td className="py-3.5 font-bold text-slate-800">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                          log.attendance_percentage < 65 
                            ? 'bg-rose-100 text-rose-700' 
                            : log.attendance_percentage < 75 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {log.attendance_percentage}%
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSlabBadgeColor(log.notification_type)}`}>
                          {log.notification_type}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-slate-600">{log.recipient_role}</td>
                      <td className="py-3.5 font-mono text-slate-500 truncate max-w-[150px]">{log.recipient_email}</td>
                      <td className="py-3.5">
                        {log.status === 'Sent' ? (
                          <Badge tone="success">Sent</Badge>
                        ) : (
                          <Badge tone="danger">Failed</Badge>
                        )}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {logs.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4 text-xs">
              <span className="text-slate-500 font-medium">
                Showing page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalLogs} records)
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* SMTP Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden text-xs"
            >
              <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50/50">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Mail className="size-4 text-indigo-500" />
                  <span>Alert Audit Record</span>
                </h4>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer">&times;</button>
              </div>

              <div className="p-5 space-y-4">
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                  selectedLog.notification_type === 'Warning'
                    ? 'bg-amber-500/10 text-amber-900 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-950 border border-rose-500/20'
                }`}>
                  <AlertCircle className="size-6 text-rose-500 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{selectedLog.notification_type} Level Activated</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Overall Calculated Attendance: <strong>{selectedLog.attendance_percentage}%</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Student Name</div>
                    <div className="font-bold text-slate-800">{selectedLog.student_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Roll Number</div>
                    <div className="font-mono font-bold text-slate-700">{selectedLog.roll_number}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Destination Email</div>
                    <div className="font-mono text-slate-600">{selectedLog.recipient_email}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Time Triggered</div>
                    <div className="font-semibold text-slate-600">{new Date(selectedLog.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t bg-slate-50/50 flex justify-end">
                <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workflow Request inspect Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden text-xs"
            >
              <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50/50">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ListFilter className="size-4 text-indigo-500" />
                  <span>Request Workflow Details</span>
                </h4>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer">&times;</button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Student Name</div>
                    <div className="font-bold text-slate-800">{selectedRequest.student_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Roll Number</div>
                    <div className="font-mono font-bold text-slate-700">{selectedRequest.roll_number}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Department</div>
                    <div className="font-semibold text-slate-700">{selectedRequest.department}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Overall Attendance</div>
                    <div className="font-bold text-red-600">{selectedRequest.attendance_percentage}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Initiated By</div>
                    <div className="font-semibold text-slate-700">{selectedRequest.teacher_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Creation Date</div>
                    <div className="font-semibold text-slate-600">{new Date(selectedRequest.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-slate-400 font-semibold">Workflow Status</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  {selectedRequest.approved_by && (
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-slate-400 font-semibold">HOD Signoff By</span>
                      <span className="font-bold text-slate-800">{selectedRequest.approved_by}</span>
                    </div>
                  )}
                  {selectedRequest.approved_at && (
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-slate-400 font-semibold">Approval Date</span>
                      <span className="font-semibold text-slate-600">{new Date(selectedRequest.approved_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedRequest.remarks && (
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-2">
                      <span className="font-bold text-amber-800 block mb-0.5">Remarks / Reason Logged:</span>
                      <p className="text-slate-700 leading-normal">{selectedRequest.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 border-t bg-slate-50/50 flex justify-end">
                <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminAttendanceNotifications;
