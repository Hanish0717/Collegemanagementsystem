import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Briefcase,
  Sparkles,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { fetchPlacementData, type PlacementDashboardData } from '@/services/placementService';

const statIcons = [Briefcase, Sparkles, Users, TrendingUp, BarChart3, Calendar];
const statGradients = [
  'bg-gradient-primary',
  'bg-gradient-violet',
  'bg-gradient-cyan',
  'bg-gradient-primary',
  'bg-gradient-violet',
  'bg-gradient-cyan',
];

export function PlacementDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [data, setData] = useState<PlacementDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (path === '/dashboard/placement') {
      fetchPlacementData()
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('Failed to load live placement dashboard data:', err);
          setLoading(false);
        });
    }
  }, [path]);

  if (path !== '/dashboard/placement') {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="size-8 text-primary animate-spin border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-sm text-muted-foreground">Loading Placement Dashboard...</span>
      </div>
    );
  }

  const stats = data?.stats || [];
  const drives = data?.drives || [];
  const companies = data?.companies || [];
  const trendData = data?.placementTrendData || [];
  const deptData = data?.departmentPlacementData || [];
  const pkgData = data?.packageAnalyticsData || [];
  const appList = data?.applications || [];
  const offerList = data?.offers || [];
  const interviewList = data?.interviews || [];
  const notifList = data?.placementNotifications || [];

  const placementStatus = [
    {
      label: 'Applied',
      count: appList.filter((a) => a.status === 'Applied').length,
      tone: 'info' as const,
    },
    {
      label: 'Shortlisted',
      count: appList.filter((a) => a.status === 'Shortlisted').length,
      tone: 'warn' as const,
    },
    {
      label: 'Interview Scheduled',
      count: appList.filter((a) => a.status === 'Interview Scheduled').length,
      tone: 'info' as const,
    },
    {
      label: 'Selected',
      count: appList.filter((a) => a.status === 'Selected').length,
      tone: 'success' as const,
    },
    {
      label: 'Offer Released',
      count: appList.filter((a) => a.status === 'Offer Released').length,
      tone: 'success' as const,
    },
    {
      label: 'Rejected',
      count: appList.filter((a) => a.status === 'Rejected').length,
      tone: 'danger' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Overview 🎯"
        desc={
          loading
            ? 'Synchronizing placement statistics...'
            : 'Campus recruitment analytics, drive tracking and student placements (Live Database Connected).'
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.slice(0, 3).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <StatCard
              label={s.label}
              value={s.value}
              change={s.change}
              icon={statIcons[i % statIcons.length]}
              gradient={statGradients[i % statGradients.length]}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Placement Trends</h3>
              <p className="text-xs text-muted-foreground">Monthly applications and placements</p>
            </div>
            <Badge tone="info">This Year</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <defs>
                  <linearGradient id="grad-placed" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-applied" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="placed"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  name="Placed"
                />
                <Line
                  type="monotone"
                  dataKey="applied"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  name="Applied"
                />
                <Line
                  type="monotone"
                  dataKey="offers"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Offers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Department-wise Placement</h3>
            <Badge>Live</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Package Analytics */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Package Distribution</h3>
              <p className="text-xs text-muted-foreground">Students by salary range</p>
            </div>
            <Badge tone="success">↑ 12%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={pkgData}>
                <defs>
                  <linearGradient id="grad-pkg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="range" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="url(#grad-pkg)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div>
                <div className="text-xs text-muted-foreground">Placement %</div>
                <div className="font-bold text-lg">52%</div>
              </div>
              <Badge tone="success">↑ 8%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div>
                <div className="text-xs text-muted-foreground">Avg Package</div>
                <div className="font-bold text-lg">8.2 LPA</div>
              </div>
              <Badge tone="info">↑ 3.5%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200">
              <div>
                <div className="text-xs text-muted-foreground">Top Package</div>
                <div className="font-bold text-lg">24.5 LPA</div>
              </div>
              <Badge tone="success">↑ 8%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div>
                <div className="text-xs text-muted-foreground">Active Companies</div>
                <div className="font-bold text-lg">48</div>
              </div>
              <Badge tone="warn">New: 3</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Sections row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Upcoming Drives */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Drives</h3>
            <Badge>Next 7 days</Badge>
          </div>
          <div className="space-y-2">
            {drives
              .filter((d) => d.status !== 'Completed')
              .slice(0, 4)
              .map((drive) => (
                <div
                  key={drive.id}
                  className="flex items-start gap-3 p-3 rounded-xl border hover:bg-accent transition"
                >
                  <div className="size-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 text-white grid place-items-center font-bold text-sm shrink-0">
                    {drive.company
                      .split(' ')
                      .map((x) => x[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{drive.company}</div>
                    <div className="text-xs text-muted-foreground">{drive.role}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(drive.date).toLocaleDateString()} • {drive.venue}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {drive.studentCount}
                    <Users className="size-3" />
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Recent Offers */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Offers</h3>
            <Badge tone="success">+4 this week</Badge>
          </div>
          <div className="space-y-2">
            {offerList.slice(0, 4).map((offer) => (
              <div
                key={offer.id}
                className="flex items-start gap-3 p-3 rounded-xl border hover:bg-accent transition"
              >
                <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white grid place-items-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{offer.studentName}</div>
                  <div className="text-xs text-muted-foreground">{offer.company}</div>
                  <div className="text-xs font-semibold text-emerald-600 mt-1">{offer.package}</div>
                </div>
                <Badge tone={offer.status === 'Accepted' ? 'success' : 'info'}>
                  {offer.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom sections */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Interview Schedules */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Interview Schedules</h3>
            <Badge>{interviewList.filter((i) => i.status === 'Scheduled').length} Scheduled</Badge>
          </div>
          <div className="space-y-2">
            {interviewList.slice(0, 5).map((interview) => (
              <div
                key={interview.id}
                className="flex items-start gap-3 p-3 rounded-xl border hover:bg-accent transition"
              >
                <div className="size-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 text-white grid place-items-center font-bold text-sm shrink-0">
                  {interview.round}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{interview.studentName}</div>
                  <div className="text-xs text-muted-foreground">{interview.company}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {interview.date} • {interview.time}
                  </div>
                </div>
                <Badge tone="info" className="text-[10px]">
                  {interview.mode}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Placement Alerts</h3>
            <Badge>{notifList.filter((n) => n.unread).length} New</Badge>
          </div>
          <div className="space-y-2">
            {notifList.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition ${notif.unread ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <div className="size-2 rounded-full bg-gradient-primary shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{notif.title}</div>
                  <div className="text-xs text-muted-foreground">{notif.time}</div>
                </div>
                <Badge tone={notif.type === 'Offer' ? 'success' : 'info'} className="text-[10px]">
                  {notif.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Recruiters</h3>
            <Badge tone="success">Campus partners</Badge>
          </div>
          <div className="space-y-2">
            {[...companies]
              .sort((a, b) => b.previousYearHires - a.previousYearHires)
              .slice(0, 5)
              .map((company, idx) => (
                <div
                  key={company.id}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
                >
                  <div className="size-9 rounded-lg bg-gradient-primary text-white grid place-items-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{company.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {company.industry} • {company.previousYearHires} previous hires
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-600">{company.package}</div>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Student Placement Status</h3>
            <Badge>{appList.length} tracked</Badge>
          </div>
          <div className="space-y-3">
            {placementStatus.map((status) => {
              const width =
                appList.length > 0
                  ? Math.max(12, Math.round((status.count / appList.length) * 100))
                  : 0;
              return (
                <div key={status.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{status.label}</span>
                    <Badge tone={status.tone}>{status.count}</Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-primary"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Workflow Automation */}
      <Card>
        <h3 className="font-semibold mb-6">Placement Workflow Automation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-soft border">
            <div className="size-12 rounded-xl bg-blue-100 text-blue-600 grid place-items-center mb-3 font-bold text-lg">
              1
            </div>
            <div className="font-medium text-sm mb-2">New Drive Added</div>
            <div className="text-xs text-muted-foreground">Create placement drive in system</div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="size-6 text-muted-foreground mb-2 rotate-90 sm:rotate-0" />
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-soft border">
            <div className="size-12 rounded-xl bg-purple-100 text-purple-600 grid place-items-center mb-3 font-bold text-lg">
              2
            </div>
            <div className="font-medium text-sm mb-2">Notify Eligible Students</div>
            <div className="text-xs text-muted-foreground">
              Send drive details to qualifying students
            </div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="size-6 text-muted-foreground mb-2 rotate-90 sm:rotate-0" />
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-soft border">
            <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 grid place-items-center mb-3 font-bold text-lg">
              3
            </div>
            <div className="font-medium text-sm mb-2">Applications Received</div>
            <div className="text-xs text-muted-foreground">
              Collect and verify student applications
            </div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="size-6 text-muted-foreground mb-2 rotate-90 sm:rotate-0" />
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-soft border">
            <div className="size-12 rounded-xl bg-amber-100 text-amber-600 grid place-items-center mb-3 font-bold text-lg">
              4
            </div>
            <div className="font-medium text-sm mb-2">Interview Scheduled</div>
            <div className="text-xs text-muted-foreground">Shortlist and schedule interviews</div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="size-6 text-muted-foreground mb-2 rotate-90 sm:rotate-0" />
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-soft border">
            <div className="size-12 rounded-xl bg-cyan-100 text-cyan-600 grid place-items-center mb-3 font-bold text-lg">
              5
            </div>
            <div className="font-medium text-sm mb-2">Offers Released</div>
            <div className="text-xs text-muted-foreground">
              Issue offer letters to selected students
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
