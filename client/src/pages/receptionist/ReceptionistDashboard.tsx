import { useState } from 'react';
import {
  Users, Phone, CalendarCheck, MessageSquare, Key, Clock, Plus,
  ClipboardList, CheckCircle, Search
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function ReceptionistDashboard() {
  const [visitors, setVisitors] = useState([
    { id: 'V-101', name: 'Rajesh Kumar', purpose: 'Meeting — Principal Office', checkIn: '09:15', status: 'Inside', host: 'Dr. Sinha' },
    { id: 'V-102', name: 'Meera Patel', purpose: 'Admission Enquiry (B.Tech)', checkIn: '10:30', status: 'Inside', host: 'Admin Desk' },
    { id: 'V-103', name: 'Suresh Verma', purpose: 'Fee Payment Receipt', checkIn: '11:00', status: 'Inside', host: 'Accounts' },
    { id: 'V-104', name: 'Anjali Mehta', purpose: 'Library Book Submission', checkIn: '11:45', status: 'Left', host: 'Librarian' },
  ]);

  const [appointments] = useState([
    { id: 'APT-10', name: 'Mr. D. Sharma', time: '14:00', with: 'Principal', purpose: 'Placement MOU Signing', status: 'Confirmed' },
    { id: 'APT-11', name: 'Mrs. R. Nair', time: '15:30', with: 'HOD CSE', purpose: 'Student Transfer Request', status: 'Pending' },
  ]);

  const handleCheckOut = (id: string, name: string) => {
    setVisitors(p => p.map(v => v.id === id ? { ...v, status: 'Left' } : v));
    toast.success(`Visitor ${name} checked out.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Front Office — Reception & Visitor Desk"
        desc="Campus visitor logs, gate passes, guest appointment scheduling, and prospective admission enquiries."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Visitors Inside Campus" value={String(visitors.filter(v => v.status === 'Inside').length)} change="Currently on premises" icon={Users} />
        <StatCard label="Today's Appointments" value="8" change="4 Scheduled Meetings" icon={CalendarCheck} />
        <StatCard label="Admission Inquiries" value="14" change="Today at Desk" icon={MessageSquare} />
        <StatCard label="Gate Passes Issued" value="22" change="Digital QR Passes" icon={Key} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Active Visitors Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Campus Visitor Log</h3>
                <p className="text-xs text-slate-500">Real-time check-in/check-out tracking</p>
              </div>
              <button onClick={() => toast.success('Visitor Registration Modal opened.')} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="size-3.5" /> Register Visitor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 text-left">
                    <th className="pb-2">Pass ID</th>
                    <th className="pb-2">Visitor Name</th>
                    <th className="pb-2">Purpose</th>
                    <th className="pb-2">Host / Department</th>
                    <th className="pb-2 text-center">Check-In</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visitors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-[10px] text-blue-600 font-bold">{v.id}</td>
                      <td className="py-2.5 font-extrabold text-slate-900 dark:text-white">{v.name}</td>
                      <td className="py-2.5 text-slate-500">{v.purpose}</td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">{v.host}</td>
                      <td className="py-2.5 text-center font-mono font-bold">{v.checkIn}</td>
                      <td className="py-2.5 text-center">
                        <Badge tone={v.status === 'Inside' ? 'success' : 'default'} className="text-[9px]">
                          {v.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        {v.status === 'Inside' && (
                          <button onClick={() => handleCheckOut(v.id, v.name)} className="px-2.5 py-1 rounded-lg border text-slate-600 hover:bg-slate-100 text-[10px] font-bold cursor-pointer">
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Appointments Schedule & Quick Reception Desk */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Today's Guest Appointments</h3>
            <div className="space-y-3">
              {appointments.map(a => (
                <div key={a.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-extrabold text-blue-600">{a.time}</span>
                    <Badge tone={a.status === 'Confirmed' ? 'success' : 'warn'} className="text-[9px]">{a.status}</Badge>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{a.name}</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Meeting with {a.with} ({a.purpose})</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Front Office Quick Dock</h3>
            <div className="space-y-2">
              <button onClick={() => toast.success('Gate pass issued with QR Code.')} className="w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                <span className="flex items-center gap-2"><Key className="size-4 text-amber-600" /> Issue Digital Gate Pass</span>
              </button>
              <button onClick={() => toast.success('Admission Inquiry logged.')} className="w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                <span className="flex items-center gap-2"><MessageSquare className="size-4 text-blue-600" /> Log Admission Inquiry</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
