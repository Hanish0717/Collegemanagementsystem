import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Server, Database, Activity, AlertTriangle, Lock, RefreshCw, Download, Bell } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { getStoredUser } from '@/services/authService';

export function SuperAdminHome() {
  const user = getStoredUser();
  const [loading, setLoading] = useState(false);

  const userGrowthData = [
    { month: 'Feb', students: 4200, faculty: 280 },
    { month: 'Mar', students: 4400, faculty: 290 },
    { month: 'Apr', students: 4600, faculty: 300 },
    { month: 'May', students: 4800, faculty: 310 },
    { month: 'Jun', students: 5100, faculty: 325 },
    { month: 'Jul', students: 5240, faculty: 342 },
  ];

  const auditLogs = [
    { id: 'AUD-001', user: 'admin@college.com', action: 'Role Modified', target: 'HOD CSE', time: '14:32', severity: 'medium' },
    { id: 'AUD-002', user: 'dean@college.com', action: 'Student Deleted', target: 'CS2026101', time: '13:15', severity: 'high' },
    { id: 'AUD-003', user: 'faculty@college.com', action: 'Marks Uploaded', target: 'B.Tech 3rd Year CSE', time: '12:40', severity: 'low' },
    { id: 'AUD-004', user: 'admin@college.com', action: 'Fee Structure Updated', target: '2026-27 Batch', time: '11:20', severity: 'medium' },
    { id: 'AUD-005', user: 'superadmin@college.com', action: 'DB Backup Triggered', target: 'Production DB', time: '10:00', severity: 'low' },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', msg: 'DB storage at 78% capacity — recommend archival' },
    { id: 2, type: 'info', msg: 'SSL certificate expires in 14 days — auto-renewal pending' },
    { id: 3, type: 'success', msg: 'Automated backup completed successfully (2.4 GB)' },
  ];

  const handleBackupDB = () => {
    toast.loading('Initiating full database backup...', { duration: 2000 });
    setTimeout(() => toast.success('Database backup completed (2.6 GB)'), 2200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Control Panel"
        desc="Complete system oversight: user management, security, database health, audit logs and server monitoring."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total System Users" value="5,940" change="All roles combined" icon={Users} />
        <StatCard label="Server Uptime" value="99.96%" change="Last 30 days" icon={Server} />
        <StatCard label="DB Size" value="14.2 GB" change="78% capacity used" icon={Database} />
        <StatCard label="Active Sessions" value="284" change="Right now" icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">System User Growth</h3>
              <p className="text-xs text-muted-foreground">Monthly enrollment across all roles</p>
            </div>
            <Badge tone="info">Last 6 Months</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="sa-students" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" />
                <Tooltip />
                <Area type="monotone" dataKey="students" name="Students" stroke="#1d4ed8" fill="url(#sa-students)" strokeWidth={2} />
                <Area type="monotone" dataKey="faculty" name="Faculty" stroke="#10B981" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">System Alerts</h3>
            <Badge tone="warn">{systemAlerts.length} Active</Badge>
          </div>
          <div className="space-y-3">
            {systemAlerts.map((a) => (
              <div key={a.id} className={`p-3 rounded-xl text-xs border ${
                a.type === 'warning' ? 'border-amber-200 bg-amber-50/50' : a.type === 'success' ? 'border-emerald-200 bg-emerald-50/50' : 'border-blue-200 bg-blue-50/50'
              }`}>
                <p className="font-medium">{a.msg}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Recent Audit Logs</h3>
              <p className="text-xs text-muted-foreground">All user activity tracked in real-time</p>
            </div>
            <Badge tone="info">Today</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">ID</th>
                  <th className="text-left pb-2">User</th>
                  <th className="text-left pb-2">Action</th>
                  <th className="text-left pb-2">Target</th>
                  <th className="text-center pb-2">Severity</th>
                  <th className="text-right pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 font-mono text-[10px] text-slate-400">{log.id}</td>
                    <td className="py-2 font-medium">{log.user}</td>
                    <td className="py-2">{log.action}</td>
                    <td className="py-2 text-slate-500">{log.target}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        log.severity === 'high' ? 'bg-rose-100 text-rose-700' : log.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{log.severity}</span>
                    </td>
                    <td className="py-2 text-right text-slate-400 font-mono">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 text-sm">System Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={handleBackupDB} className="w-full py-2.5 rounded-xl bg-blue-600 text-white flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-blue-700 transition cursor-pointer">
              <Database className="size-4" /> Backup Database
            </button>
            <button onClick={() => toast.success('Application cache flushed. Redis cleared.')} className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <RefreshCw className="size-4 text-slate-500" /> Flush Cache & CDN
            </button>
            <button onClick={() => toast.success('Security audit triggered for all sessions.')} className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <Lock className="size-4 text-violet-500" /> Run Security Audit
            </button>
            <button onClick={() => toast.success('System health report exported as PDF.')} className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <Download className="size-4 text-emerald-500" /> Export System Report
            </button>
            <button onClick={() => toast.success('All users notified with broadcast alert.')} className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-rose-50 transition cursor-pointer">
              <AlertTriangle className="size-4" /> Broadcast System Alert
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
