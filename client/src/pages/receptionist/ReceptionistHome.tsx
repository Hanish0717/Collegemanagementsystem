import { useState } from 'react';
import { Users, Phone, CalendarCheck, MessageSquare, Key, Clock, Plus, ClipboardList, CheckCircle } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function ReceptionistHome() {
  const [visitors, setVisitors] = useState([
    { id: 'V-001', name: 'Rajesh Kumar', purpose: 'Meeting — Principal', checkIn: '09:15', status: 'Inside', host: 'Dr. Sinha' },
    { id: 'V-002', name: 'Meera Patel', purpose: 'Admission Enquiry', checkIn: '10:30', status: 'Inside', host: 'Admin Office' },
    { id: 'V-003', name: 'Suresh Verma', purpose: 'Fee Payment', checkIn: '11:00', status: 'Inside', host: 'Accounts' },
    { id: 'V-004', name: 'Anjali Mehta', purpose: 'Library Document', checkIn: '11:45', status: 'Left', host: 'Librarian' },
  ]);

  const [appointments, setAppointments] = useState([
    { id: 'APT-01', name: 'Mr. D. Sharma', time: '14:00', with: 'Principal', purpose: 'Placement MOU Signing', status: 'Confirmed' },
    { id: 'APT-02', name: 'Mrs. R. Nair', time: '15:30', with: 'HOD CSE', purpose: 'Student Transfer', status: 'Pending' },
    { id: 'APT-03', name: 'Dr. K. Prasad', time: '16:00', with: 'Dean', purpose: 'Research Collaboration', status: 'Confirmed' },
  ]);

  const [enquiries, setEnquiries] = useState([
    { id: 'ENQ-501', name: 'Arjun Sharma', contact: '+91 98765 43210', course: 'B.Tech CSE', type: 'Admission', status: 'Open' },
    { id: 'ENQ-502', name: 'Pooja Singh', contact: '+91 87654 32109', course: 'MBA', type: 'Hostel', status: 'Open' },
    { id: 'ENQ-503', name: 'Ravi Reddy', contact: '+91 76543 21098', course: 'B.Tech ECE', type: 'Fee', status: 'Resolved' },
  ]);

  const handleCheckOut = (id: string, name: string) => {
    setVisitors(p => p.map(v => v.id === id ? { ...v, status: 'Left' } : v));
    toast.success(`${name} checked out.`);
  };

  const handleConfirmAppt = (id: string, name: string) => {
    setAppointments(p => p.map(a => a.id === id ? { ...a, status: 'Confirmed' } : a));
    toast.success(`Appointment confirmed for ${name}`);
  };

  const handleResolveEnquiry = (id: string) => {
    setEnquiries(p => p.map(e => e.id === id ? { ...e, status: 'Resolved' } : e));
    toast.success('Enquiry marked as resolved.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Front Office — Reception Dashboard"
        desc="Manage visitors, enquiries, appointments, gate passes and phone call logs for the college front office."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Visitors Today" value={String(visitors.filter(v => v.status === 'Inside').length)} change="Currently inside campus" icon={Users} />
        <StatCard label="Open Enquiries" value={String(enquiries.filter(e => e.status === 'Open').length)} change="Awaiting response" icon={MessageSquare} />
        <StatCard label="Today's Appointments" value={String(appointments.length)} change="Scheduled meetings" icon={CalendarCheck} />
        <StatCard label="Gate Passes Issued" value="12" change="Today" icon={Key} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Visitor Log — Today</h3>
              <p className="text-xs text-muted-foreground">Check-in / check-out records</p>
            </div>
            <button onClick={() => toast.success('New visitor registered!')} className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:text-blue-800 cursor-pointer">
              <Plus className="size-3.5" /> Register Visitor
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">ID</th>
                  <th className="text-left pb-2">Name</th>
                  <th className="text-left pb-2">Purpose</th>
                  <th className="text-left pb-2">Host</th>
                  <th className="text-center pb-2">Check-In</th>
                  <th className="text-center pb-2">Status</th>
                  <th className="text-right pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2 font-mono text-[10px] text-slate-400">{v.id}</td>
                    <td className="py-2 font-semibold">{v.name}</td>
                    <td className="py-2 text-slate-500">{v.purpose}</td>
                    <td className="py-2 text-slate-500">{v.host}</td>
                    <td className="py-2 text-center font-mono">{v.checkIn}</td>
                    <td className="py-2 text-center">
                      <Badge tone={v.status === 'Inside' ? 'success' : 'default'} className="text-[9px]">{v.status}</Badge>
                    </td>
                    <td className="py-2 text-right">
                      {v.status === 'Inside' && (
                        <button onClick={() => handleCheckOut(v.id, v.name)} className="px-2.5 py-0.5 rounded border text-slate-600 hover:bg-slate-100 text-[10px] font-bold">
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

        <Card>
          <h3 className="font-semibold mb-4 text-sm">Reception Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Register New Visitor', icon: Users, color: 'text-blue-600' },
              { label: 'Log New Enquiry', icon: MessageSquare, color: 'text-violet-600' },
              { label: 'Schedule Appointment', icon: CalendarCheck, color: 'text-emerald-600' },
              { label: 'Issue Gate Pass', icon: Key, color: 'text-amber-600' },
              { label: 'Log Phone Call', icon: Phone, color: 'text-slate-600' },
            ].map(({ label, icon: Icon, color }) => (
              <button key={label} onClick={() => toast.success(`${label} initiated!`)} className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
                <Icon className={`size-4 ${color}`} /> {label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Today's Appointments</h3>
              <p className="text-xs text-muted-foreground">Scheduled meetings & visits</p>
            </div>
            <Badge tone="info">{appointments.length} Scheduled</Badge>
          </div>
          <div className="space-y-3">
            {appointments.map(a => (
              <div key={a.id} className="p-3 border rounded-xl flex items-center justify-between text-xs hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-blue-500" />
                    <span className="font-mono font-bold">{a.time}</span>
                    <span className="font-semibold">{a.name}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">With {a.with} — {a.purpose}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={a.status === 'Confirmed' ? 'success' : 'warn'} className="text-[9px]">{a.status}</Badge>
                  {a.status === 'Pending' && (
                    <button onClick={() => handleConfirmAppt(a.id, a.name)} className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">Confirm</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Admission Enquiries</h3>
              <p className="text-xs text-muted-foreground">Prospective student enquiries</p>
            </div>
            <Badge tone="warn">{enquiries.filter(e => e.status === 'Open').length} Open</Badge>
          </div>
          <div className="space-y-3">
            {enquiries.map(e => (
              <div key={e.id} className="p-3 border rounded-xl text-xs hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{e.name}</span>
                    <Badge tone="info" className="text-[9px]">{e.type}</Badge>
                  </div>
                  <Badge tone={e.status === 'Resolved' ? 'success' : 'warn'} className="text-[9px]">{e.status}</Badge>
                </div>
                <p className="text-slate-500">Course: {e.course} • {e.contact}</p>
                {e.status === 'Open' && (
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => toast.success('Follow-up call logged!')} className="px-2 py-0.5 rounded border text-blue-600 hover:bg-blue-50 text-[10px] font-bold">Call</button>
                    <button onClick={() => handleResolveEnquiry(e.id)} className="px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold">Resolve</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
