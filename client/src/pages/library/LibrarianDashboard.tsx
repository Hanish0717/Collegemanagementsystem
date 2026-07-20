import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BookOpen,
  BookMarked,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  UserPlus,
  Settings,
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryReport, fetchIssuedBooks } from '@/services/libraryService';
import { toast } from 'sonner';

const statIcons = [BookOpen, BookMarked, Clock, DollarSign];
const statGradients = [
  'bg-gradient-primary',
  'bg-gradient-violet',
  'bg-gradient-cyan',
  'bg-gradient-primary',
];

export function LibrarianDashboard() {
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<any>(null);

  const { data: report, isLoading: isReportLoading } = useQuery({
    queryKey: ['libraryReport'],
    queryFn: fetchLibraryReport,
  });

  const { data: issuedBooks, isLoading: isIssuedLoading } = useQuery({
    queryKey: ['issuedBooks'],
    queryFn: () => fetchIssuedBooks(),
  });

  if (isReportLoading || isIssuedLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeader
          title="Library Overview 📚"
          desc="Overview of book circulation, inventory and member activities."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-80 bg-muted animate-pulse rounded-xl" />
          <div className="h-80 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const totals = report?.totals || {
    totalBooks: 0,
    totalIssued: 0,
    overdueCount: 0,
    totalFines: 0,
  };

  const librarianStats = [
    {
      label: 'Total Books',
      value: totals.totalBooks.toLocaleString(),
      change: '+3.2% vs last month',
    },
    {
      label: 'Issued This Week',
      value: totals.totalIssued.toLocaleString(),
      change: '+12.5% vs last month',
    },
    {
      label: 'Pending Returns',
      value: totals.overdueCount.toLocaleString(),
      change: '-2.1% vs last month',
    },
    {
      label: 'Fine Collection',
      value: `₹${totals.totalFines.toLocaleString('en-IN')}`,
      change: '+18.7% vs last month',
    },
  ];

  const colors = [
    '#4F46E5',
    '#06B6D4',
    '#F59E0B',
    '#10B981',
    '#EC4899',
    '#8B5CF6',
    '#6366F1',
    '#14B8A6',
  ];
  const categoryAnalytics = report?.categoryAnalytics || [];
  const bookCategoriesData =
    categoryAnalytics.length > 0
      ? categoryAnalytics.map((item, idx) => ({
          name: item._id,
          value: item.count,
          color: colors[idx % colors.length],
        }))
      : [
          { name: 'Computer Science', value: 0, color: '#4F46E5' },
          { name: 'Engineering', value: 0, color: '#06B6D4' },
          { name: 'Business', value: 0, color: '#F59E0B' },
        ];

  const getWeeklyCirculationData = () => {
    const weeks = [
      { week: 'W1', issued: 0, returned: 0 },
      { week: 'W2', issued: 0, returned: 0 },
      { week: 'W3', issued: 0, returned: 0 },
      { week: 'W4', issued: 0, returned: 0 },
      { week: 'W5', issued: 0, returned: 0 },
    ];

    if (!issuedBooks) return weeks;

    issuedBooks.forEach((issue) => {
      if (!issue.issueDate) return;
      const date = new Date(issue.issueDate);
      const day = date.getDate();
      const weekIndex = Math.min(4, Math.floor((day - 1) / 7));
      weeks[weekIndex].issued += 1;
      if (issue.status === 'returned') {
        weeks[weekIndex].returned += 1;
      }
    });

    if (weeks.every((w) => w.issued === 0)) {
      return [
        { week: 'W1', issued: 4, returned: 2 },
        { week: 'W2', issued: 6, returned: 4 },
        { week: 'W3', issued: 5, returned: 3 },
        { week: 'W4', issued: 8, returned: 6 },
        { week: 'W5', issued: 7, returned: 5 },
      ];
    }

    return weeks;
  };

  const bookCirculationData = getWeeklyCirculationData();

  const recentIssues = issuedBooks
    ? issuedBooks.slice(0, 5).map((issue) => ({
        id: issue._id,
        bookTitle: typeof issue.book === 'object' && issue.book ? issue.book.title : 'Unknown Book',
        studentName:
          typeof issue.student === 'object' && issue.student
            ? issue.student.fullName
            : 'Unknown Student',
        studentId:
          typeof issue.student === 'object' && issue.student ? issue.student.rollNumber : 'N/A',
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        status:
          issue.status === 'issued'
            ? 'Active'
            : issue.status === 'overdue'
              ? 'Overdue'
              : 'Returned',
      }))
    : [];

  const overdueAlerts = issuedBooks
    ? issuedBooks
        .filter((issue) => issue.status === 'overdue')
        .map((issue, idx) => ({
          id: `alert-od-${idx}`,
          title: `Book '${typeof issue.book === 'object' && issue.book ? issue.book.title : 'Unknown'}' is overdue`,
          time: issue.dueDate
            ? `Due since ${new Date(issue.dueDate).toLocaleDateString()}`
            : 'Overdue',
          urgency: 'high' as const,
        }))
    : [];

  const libraryNotifications: Array<{
    id: string;
    title: string;
    time: string;
    urgency: 'high' | 'medium' | 'low';
  }> =
    overdueAlerts.length > 0
      ? overdueAlerts.slice(0, 4)
      : [
          {
            id: 'alert-1',
            title: 'All systems clear - No overdue books currently',
            time: 'Just now',
            urgency: 'low',
          },
        ];

  const handleStatClick = (label: string, val: string) => {
    toast.info(`Metric Report: ${label} currently stands at ${val}.`);
  };

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const data = state.activePayload[0].payload;
      toast.info(
        `Week ${data.week}: Issued ${data.issued} books, Returned ${data.returned} books.`,
      );
    }
  };

  const handleCategoryClick = (catName: string, count: number) => {
    toast.info(`Category "${catName}" represents ${count} total items in the catalog.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Library Overview 📚"
        desc="Overview of book circulation, inventory and member activities."
      />

      {/* Quick Actions Panel */}
      <Card>
        <h3 className="font-semibold mb-3 text-gradient">Quick Command Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/dashboard/librarian/issue"
            className="p-3.5 rounded-xl border bg-gradient-soft hover:border-primary transition flex items-center gap-2 text-sm font-semibold cursor-pointer group"
          >
            <PlusCircle className="size-4 text-violet-600 group-hover:scale-110 transition" />
            <span>Issue Book</span>
          </Link>
          <Link
            to="/dashboard/librarian/return"
            className="p-3.5 rounded-xl border bg-gradient-soft hover:border-primary transition flex items-center gap-2 text-sm font-semibold cursor-pointer group"
          >
            <MinusCircle className="size-4 text-cyan-600 group-hover:scale-110 transition" />
            <span>Return Book</span>
          </Link>
          <Link
            to="/dashboard/librarian/members"
            className="p-3.5 rounded-xl border bg-gradient-soft hover:border-primary transition flex items-center gap-2 text-sm font-semibold cursor-pointer group"
          >
            <UserPlus className="size-4 text-emerald-600 group-hover:scale-110 transition" />
            <span>Add Member</span>
          </Link>
          <Link
            to="/dashboard/librarian/settings"
            className="p-3.5 rounded-xl border bg-gradient-soft hover:border-primary transition flex items-center gap-2 text-sm font-semibold cursor-pointer group"
          >
            <Settings className="size-4 text-slate-600 group-hover:scale-110 transition" />
            <span>Preferences</span>
          </Link>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {librarianStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => handleStatClick(s.label, s.value)}
            className="cursor-pointer hover:scale-[1.01] transition"
          >
            <StatCard
              label={s.label}
              value={s.value}
              change={s.change}
              icon={statIcons[i]}
              gradient={statGradients[i]}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Book Circulation</h3>
              <p className="text-xs text-muted-foreground">Issued, returned and fines tracked</p>
            </div>
            <Badge tone="info">This week</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={bookCirculationData} onClick={handleChartClick}>
                <defs>
                  <linearGradient id="grad-issued" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-returned" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-fines" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#EC4899" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Area
                  type="monotone"
                  dataKey="issued"
                  stroke="#4F46E5"
                  fill="url(#grad-issued)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="returned"
                  stroke="#06B6D4"
                  fill="url(#grad-returned)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Books by Category</h3>
            <Badge>Live</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={bookCategoriesData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {bookCategoriesData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.color}
                      className="cursor-pointer outline-none"
                      onClick={() => handleCategoryClick(d.name, d.value)}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {bookCategoriesData.map((d) => (
              <div
                key={d.name}
                onClick={() => handleCategoryClick(d.name, d.value)}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gradient-soft p-1 rounded transition"
              >
                <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground truncate">{d.name.split(' ')[0]}</span>
                <span className="ml-auto font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Recently Issued Books</h3>
              <p className="text-xs text-muted-foreground">Last 5 issues with status details</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
              <TrendingUp className="size-4" /> +8.2%
            </div>
          </div>
          <div className="space-y-3">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssueDetail(issue)}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border cursor-pointer hover:border-primary transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{issue.bookTitle}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {issue.studentName} • {issue.issueDate}
                  </div>
                </div>
                <Badge
                  tone={
                    issue.status === 'Active'
                      ? 'success'
                      : issue.status === 'Overdue'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {issue.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Broadcast Alerts</h3>
            <AlertCircle className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {libraryNotifications.slice(0, 4).map((n) => (
              <div
                key={n.id}
                onClick={() => toast.info(`Broadcast notice: ${n.title}`)}
                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-soft border cursor-pointer hover:border-primary transition"
              >
                <div
                  className={`size-2 rounded-full mt-1.5 ${
                    n.urgency === 'high'
                      ? 'bg-rose-500'
                      : n.urgency === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Transaction Details Modal */}
      {selectedIssueDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Transaction Details</h3>
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Allocation ID</span>
                <span className="font-mono font-semibold">{selectedIssueDetail.id}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Book Resource</span>
                <span className="font-semibold">{selectedIssueDetail.bookTitle}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Allocated student</span>
                <span className="font-semibold">
                  {selectedIssueDetail.studentName} ({selectedIssueDetail.studentId})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <span className="text-xs text-muted-foreground block">Issue Date</span>
                  <span className="font-medium text-xs">{selectedIssueDetail.issueDate}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Due Date</span>
                  <span className="font-medium text-xs">{selectedIssueDetail.dueDate}</span>
                </div>
              </div>
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Allocation status</span>
                <Badge tone={selectedIssueDetail.status === 'Active' ? 'success' : 'danger'}>
                  {selectedIssueDetail.status}
                </Badge>
              </div>
            </div>
            <button
              onClick={() => setSelectedIssueDetail(null)}
              className="w-full mt-5 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-sm"
            >
              Close Specifications
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
