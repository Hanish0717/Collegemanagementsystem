import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { HODSubModulePage } from '@/modules/hod/pages/HODSubModulePage';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { ShieldAlert, Activity, Users, Lock } from 'lucide-react';

function HODAuditLogsComponent() {
  const { departmentInfo } = useHODDepartment();
  const code = (departmentInfo.shortName || 'AIML').toUpperCase();

  const auditLogsConfig = {
    slug: 'audit-logs',
    title: `${departmentInfo.shortName} Department Security Audit Logs`,
    subtitle: `Track all HOD and faculty administrative actions, mark changes, leave signoffs, and record modifications for ${departmentInfo.name}.`,
    icon: ShieldAlert,
    stats: [
      { label: 'Logged Audit Events', value: 148, subtitle: 'Last 30 Days', icon: Activity, color: 'blue' },
      { label: 'Security Status', value: '100% Secure', subtitle: 'Zero Unauth Access', icon: Lock, color: 'emerald' },
      { label: 'Active Dept Admins', value: 2, subtitle: 'HOD + Assistant HOD', icon: Users, color: 'purple' },
    ],
    sampleData: [
      { id: 'LOG-1001', time: '2026-07-20 04:30 PM', action: `Approved Faculty Leave Request`, user: `HOD (${departmentInfo.shortName})`, role: 'Head of Department', ip: '192.168.1.45', status: 'Success' },
      { id: 'LOG-1002', time: '2026-07-20 02:15 PM', action: `Signed Off Mid-Term 1 Marksheet (${code}501)`, user: `HOD (${departmentInfo.shortName})`, role: 'Head of Department', ip: '192.168.1.45', status: 'Success' },
      { id: 'LOG-1003', time: '2026-07-19 11:20 AM', action: 'Dispatched Attendance Shortage Warnings (<75%)', user: `HOD (${departmentInfo.shortName})`, role: 'Head of Department', ip: '192.168.1.45', status: 'Success' },
    ],
    columns: [
      { key: 'id', header: 'Audit Ref', render: (i: any) => <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{i.id}</span> },
      { key: 'time', header: 'Timestamp', render: (i: any) => <span className="font-mono text-xs text-slate-500">{i.time}</span> },
      { key: 'action', header: 'Action Performed', render: (i: any) => <span className="font-extrabold text-slate-900 dark:text-white">{i.action}</span> },
      { key: 'user', header: 'Performed By', render: (i: any) => <div><p className="font-bold text-slate-800 dark:text-slate-200">{i.user}</p><p className="text-[10px] text-slate-400">{i.role}</p></div> },
      { key: 'ip', header: 'IP Address', render: (i: any) => <span className="font-mono text-xs text-slate-500">{i.ip}</span> },
      { key: 'status', header: 'Result', render: (i: any) => <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">{i.status}</span> },
    ],
  };

  return <HODSubModulePage config={auditLogsConfig} />;
}

export const Route = createFileRoute('/hod/audit-logs')({
  component: HODAuditLogsComponent,
});
