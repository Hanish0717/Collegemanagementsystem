import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Sparkles,
  Award,
  CheckCircle,
  AlertTriangle,
  FileText,
  CalendarCheck,
  Download,
  Send,
  PlusCircle,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Clock,
  Filter,
} from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { fetchFaculty } from '@/services/adminService';

export function DeanDashboard() {
  const navigate = useNavigate();

  // Interactive State Management for Dean Overview
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(14);
  const [activeTab, setActiveTab] = useState<'all' | 'faculty' | 'student' | 'exam' | 'research'>('all');
  const [facultySearch, setFacultySearch] = useState('');

  const { data: facultyList = [] } = useQuery({
    queryKey: ['faculty'],
    queryFn: fetchFaculty,
  });

  const [approvalItems, setApprovalItems] = useState([
    { id: 'APP-101', type: 'Faculty Leave', title: 'Dr. Srinivas Rao (CSE) — 3 Days Medical Leave', dept: 'CSE', date: 'Today, 10:30 AM', urgency: 'high', category: 'faculty' },
    { id: 'APP-102', type: 'Research Grant', title: 'AICTE Smart Agriculture R&D Grant (₹15.0 Lakhs)', dept: 'ECE', date: 'Today, 09:15 AM', urgency: 'medium', category: 'research' },
    { id: 'APP-103', type: 'Exam Schedule', title: 'End-Semester CS302 Question Paper Release', dept: 'Exam Cell', date: 'Yesterday', urgency: 'high', category: 'exam' },
    { id: 'APP-104', type: 'Merit Scholarship', title: 'Ananya Sharma (Roll CS202604) Fee Concession', dept: 'CSE', date: 'Yesterday', urgency: 'low', category: 'student' },
    { id: 'APP-105', type: 'Course Syllabus', title: 'CBCS Curriculum Revision 2026 Approval', dept: 'Academic', date: '2 days ago', urgency: 'medium', category: 'academic' },
  ]);

  const handleApproveItem = (id: string, title: string) => {
    setApprovalItems((prev) => prev.filter((item) => item.id !== id));
    setPendingApprovalsCount((prev) => Math.max(0, prev - 1));
    toast.success(`[Dean Executive Sign-off] Approved: ${title}`);
  };

  const handleBatchApproveAll = () => {
    if (approvalItems.length === 0) {
      toast.info('No pending executive items in Dean queue.');
      return;
    }
    const count = approvalItems.length;
    setApprovalItems([]);
    setPendingApprovalsCount((prev) => Math.max(0, prev - count));
    toast.success(`Batch approved all ${count} pending Dean executive requests!`);
  };

  const handleQuickAction = (actionName: string) => {
    switch (actionName) {
      case 'Approve Requests':
        navigate({ to: '/dean/approvals' });
        break;
      case 'Generate Reports':
      case 'Export Reports':
        navigate({ to: '/dean/reports' });
        break;
      case 'Send Notifications':
        toast.success('Opening Dean Executive Notification Dispatch Console...');
        break;
      case 'Department Analytics':
        navigate({ to: '/dean/academic' });
        break;
      case 'Meeting Scheduler':
        toast.info('Initiating Dean & HOD Academic Council Meeting Scheduler...');
        break;
      case 'Circular Management':
        toast.success('Opening Institutional Circular Dispatch Portal...');
        break;
      default:
        toast.info(`Triggered Quick Action: ${actionName}`);
    }
  };

  const defaultFaculty = [
    { id: '1', fullName: 'Dr. Srinivas Rao', designation: 'Professor', department: { name: 'Computer Science & Engineering' }, employeeId: 'FAC-101' },
    { id: '2', fullName: 'Mrs. Ananya Sen', designation: 'Assistant Professor', department: { name: 'Computer Science & Engineering' }, employeeId: 'FAC-102' },
    { id: '3', fullName: 'Dr. K. V. Sharma', designation: 'Professor & HOD', department: { name: 'Electronics & Communication' }, employeeId: 'FAC-103' },
    { id: '4', fullName: 'Dr. Ramesh Kumar', designation: 'Associate Professor', department: { name: 'Mechanical Engineering' }, employeeId: 'FAC-104' },
    { id: '5', fullName: 'Dr. Meena Iyer', designation: 'Professor', department: { name: 'Electrical & Electronics' }, employeeId: 'FAC-105' },
    { id: '6', fullName: 'Dr. A. P. Singh', designation: 'Professor', department: { name: 'Civil Engineering' }, employeeId: 'FAC-106' },
  ];

  const rawFacultyList = Array.isArray(facultyList) && facultyList.length > 0 ? facultyList : defaultFaculty;

  const filteredFaculty = rawFacultyList.filter((f: any) => {
    const name = f?.fullName || f?.name || '';
    const dept = typeof f?.department === 'object' ? f?.department?.name : (f?.department || '');
    const desig = f?.designation || '';
    const q = facultySearch.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      dept.toLowerCase().includes(q) ||
      desig.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Dean Executive Cockpit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge tone="info" className="bg-white/20 text-white border-white/30 backdrop-blur-md flex items-center gap-1 text-xs">
              <GraduationCap className="size-4 text-blue-200" /> Executive Academic Leadership Cockpit
            </Badge>
            <Badge tone="success" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">Role: Dean</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Dean Administrative & Academic Command Center
          </h1>
          <p className="text-xs md:text-sm text-blue-100/90 mt-1 max-w-3xl">
            Institutional oversight across Student Administration, Faculty Management, Examinations, Academic Structure, IMA R&D, and IQAC Quality Assurance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigate({ to: '/dean/approvals' })}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle className="size-4" /> Executive Approvals ({pendingApprovalsCount})
          </button>
          <button
            onClick={() => navigate({ to: '/dean/reports' })}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="size-4" /> Institutional Reports
          </button>
        </div>
      </div>

      {/* 11 Executive Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Students"
          value="2,450"
          change="12 Depts Enrolled"
          icon={Users}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Total Faculty"
          value="142"
          change="86 PhD Holders"
          icon={GraduationCap}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Departments"
          value="12"
          change="Active Engineering & Science"
          icon={Building2}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Pending Approvals"
          value={String(pendingApprovalsCount)}
          change="Requires Dean Sign-off"
          icon={Clock}
          gradient="bg-gradient-amber"
        />
        <StatCard
          label="Attendance Alerts"
          value="28"
          change="<75% Defaulters"
          icon={AlertTriangle}
          gradient="bg-gradient-rose"
        />
        <StatCard
          label="Research Grants"
          value="14 Grants"
          change="₹1.45 Cr Sanctioned"
          icon={Sparkles}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Upcoming Exams"
          value="18 Schedules"
          change="End-Semester 2026"
          icon={BookOpen}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Academic Calendar"
          value="AY 2026-27"
          change="Active & Published"
          icon={CalendarCheck}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Circulars"
          value="8 Active"
          change="Institutional Orders"
          icon={FileText}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Complaints"
          value="5 Open"
          change="Grievance Cell"
          icon={MessageSquare}
          gradient="bg-gradient-rose"
        />
        <StatCard
          label="Placement Rate"
          value="92.4%"
          change="Highest: ₹44 LPA"
          icon={Briefcase}
          gradient="bg-gradient-emerald"
        />
      </div>

      {/* Main Grid: Pending Approvals & Department Monitoring */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Executive Approvals Queue (2 Cols) */}
        <Card className="lg:col-span-2 border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-foreground">Executive Pending Approvals Queue</h3>
                <Badge tone="warn" className="text-xs font-bold">{approvalItems.length} Pending Sign-off</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized Dean decision portal for staff leaves, grants, examination papers, and student concessions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchApproveAll}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="size-3.5" /> Batch Approve All
              </button>
              <button
                onClick={() => navigate({ to: '/dean/approvals' })}
                className="px-3 py-1.5 rounded-xl border bg-background text-xs font-bold hover:bg-accent flex items-center gap-1 transition"
              >
                View Hub <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5 mt-4">
            {approvalItems.length === 0 ? (
              <div className="text-center py-10 border rounded-2xl bg-muted/20">
                <ShieldCheck className="size-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm">Dean Approvals Queue Cleared</h4>
                <p className="text-xs text-muted-foreground">All pending institutional requests have been reviewed and sanctioned.</p>
              </div>
            ) : (
              approvalItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border bg-background hover:border-primary/40 hover:bg-accent/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge tone={item.urgency === 'high' ? 'warn' : 'info'} className="text-[10px] uppercase font-bold">
                        {item.type}
                      </Badge>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Dept: <strong className="text-foreground">{item.dept}</strong></span>
                      <span>•</span>
                      <span>Submitted: {item.date}</span>
                      <span>•</span>
                      <span className="font-mono">{item.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveItem(item.id, item.title)}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="size-3.5" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions & Department Navigation (1 Col) */}
        <div className="space-y-6">
          <Card className="border-primary/20">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Dean Executive Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { title: 'Approve Requests', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
                { title: 'Generate Reports', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
                { title: 'Export Reports', icon: Download, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
                { title: 'Send Notifications', icon: Send, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
                { title: 'Department Analytics', icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
                { title: 'Meeting Scheduler', icon: CalendarCheck, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30' },
                { title: 'Circular Management', icon: FileText, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
              ].map((act) => (
                <button
                  key={act.title}
                  onClick={() => handleQuickAction(act.title)}
                  className="p-3 rounded-xl border bg-background hover:border-primary/40 hover:shadow-xs transition text-left cursor-pointer flex flex-col justify-between gap-2"
                >
                  <div className={`p-2 rounded-lg w-fit ${act.color}`}>
                    <act.icon className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">{act.title}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Dean Domain Direct Access Cards */}
          <Card className="bg-gradient-to-br from-slate-900 to-blue-950 text-white">
            <h3 className="font-bold text-sm mb-1 text-white flex items-center gap-2">
              <GraduationCap className="size-4 text-blue-400" /> Dean Administrative Domains
            </h3>
            <p className="text-[11px] text-slate-300 mb-3">Direct leadership portals for each core domain.</p>

            <div className="space-y-1.5">
              {[
                { title: 'Student Administration', to: '/dean/student', icon: Users },
                { title: 'Examination Administration', to: '/dean/examination', icon: BookOpen },
                { title: 'Academic Administration', to: '/dean/academic', icon: Building2 },
                { title: 'IMA Administration (R&D)', to: '/dean/ima', icon: Sparkles },
                { title: 'IQAC Quality Assurance', to: '/dean/iqac', icon: Award },
              ].map((dom) => (
                <button
                  key={dom.title}
                  onClick={() => navigate({ to: dom.to })}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-left flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <dom.icon className="size-3.5 text-blue-400" />
                    <span>{dom.title}</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* PERMANENT SECTION: Faculty Management (ALWAYS VISIBLE) */}
      <Card className="border-primary/40 bg-gradient-to-r from-primary/5 via-background to-accent/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary text-white shadow-md">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">Faculty Management & Workload Oversight</h3>
                <Badge tone="success" className="text-[10px]">Permanent Dean Control Section</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Faculty teaching workloads, departmental staff rosters, research publications, and attendance reviews.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin/faculty"
              className="px-3 py-1.5 rounded-xl border bg-background text-xs font-bold hover:bg-accent flex items-center gap-1.5 transition"
            >
              Full Roster <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Faculty Search & Preview Roster */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={facultySearch}
              onChange={(e) => setFacultySearch(e.target.value)}
              placeholder="Filter faculty roster by name, department, or designation..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredFaculty.slice(0, 8).map((fac: any, idx: number) => {
              const name = fac?.fullName || fac?.name || `Faculty Member #${idx + 1}`;
              const deptName = typeof fac?.department === 'object' ? fac?.department?.name : (fac?.department || 'CSE');
              return (
                <div key={fac.id || fac._id || idx} className="p-3 rounded-xl border bg-background hover:bg-accent/40 transition flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs">{name}</div>
                    <div className="text-[10px] text-muted-foreground">{fac.designation || 'Faculty'} • {deptName}</div>
                  </div>
                  <Badge tone="info" className="text-[10px]">{fac.employeeId || 'FAC-101'}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
