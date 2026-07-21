import { useState } from 'react';
import {
  Wrench, AlertTriangle, CheckCircle, Clock, Plus, Filter, Search,
  Download, Printer, UserCheck, ShieldAlert, Cpu, Building2, Flame,
  FileText, ArrowRight, Check, X, Shield, RefreshCw
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { exportToCSV, printReport } from '@/lib/exportUtils';
import { toast } from 'sonner';

export type TicketStatus = 'Open' | 'Assigned' | 'In Progress' | 'Waiting for Parts' | 'Completed' | 'User Verification' | 'Closed' | 'Rejected';

export interface MaintenanceTicket {
  id: string;
  category: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  raisedBy: string;
  role: string;
  date: string;
  status: TicketStatus;
  technician?: string;
  partsUsed?: string;
  verificationRating?: number;
}

export function ImaMaintenanceModule() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    { id: 'IMA-901', category: 'Computer Lab', location: 'Lab 3 (Room 304)', priority: 'high', description: 'PC-14 and PC-18 boot failure — RAM error code', raisedBy: 'Dr. Srinivas Rao', role: 'Faculty', date: 'Jul 21', status: 'Open' },
    { id: 'IMA-902', category: 'Projector & Smart Board', location: 'LH-101 (Block B)', priority: 'critical', description: 'Projector bulb expired during CSE-401 lecture', raisedBy: 'Mrs. Ananya Sen', role: 'Faculty', date: 'Jul 21', status: 'Assigned', technician: 'Ramesh (IT Tech)' },
    { id: 'IMA-903', category: 'Electrical & AC', location: 'Seminar Hall A', priority: 'medium', description: 'AC Unit #2 compressor trip sound', raisedBy: 'Prof. V. Sharma', role: 'HOD', date: 'Jul 20', status: 'In Progress', technician: 'Suresh (HVAC Tech)', partsUsed: 'Compressor Relay' },
    { id: 'IMA-904', category: 'Plumbing & Water', location: '3rd Floor Restroom', priority: 'high', description: 'Flush valve leaking water continuously', raisedBy: 'Kabir Verma', role: 'Student', date: 'Jul 20', status: 'Completed', technician: 'Mohan (Plumber)' },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  // New Ticket Form State
  const [newCategory, setNewCategory] = useState('Computer Lab');
  const [newLocation, setNewLocation] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newDescription, setNewDescription] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation || !newDescription) {
      toast.error('Please fill in location and description.');
      return;
    }

    const newTicket: MaintenanceTicket = {
      id: `IMA-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCategory,
      location: newLocation,
      priority: newPriority,
      description: newDescription,
      raisedBy: 'Active User',
      role: 'Staff',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: 'Open',
    };

    setTickets([newTicket, ...tickets]);
    setIsRaiseModalOpen(false);
    setNewLocation('');
    setNewDescription('');
    toast.success(`Complaint Ticket ${newTicket.id} raised successfully!`);
  };

  const handleUpdateStatus = (id: string, nextStatus: TicketStatus, techName?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: nextStatus,
          technician: techName || t.technician || 'Technician Assigned',
        };
      }
      return t;
    }));
    toast.success(`Ticket ${id} status updated to "${nextStatus}"`);
  };

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  const handleExportCSV = () => {
    exportToCSV('IMA_Campus_Maintenance_Tickets', [
      { header: 'Ticket ID', key: 'id' },
      { header: 'Category', key: 'category' },
      { header: 'Location', key: 'location' },
      { header: 'Priority', key: 'priority' },
      { header: 'Description', key: 'description' },
      { header: 'Raised By', key: 'raisedBy' },
      { header: 'Date', key: 'date' },
      { header: 'Status', key: 'status' },
      { header: 'Technician', key: 'technician' },
    ], tickets);
    toast.success('IMA Complaints Ledger exported to CSV!');
  };

  const handlePrint = () => {
    printReport(
      'Institution Maintenance & Administration (IMA) Audit',
      'Campus Infrastructure Complaints & Asset Maintenance Log',
      [
        { header: 'Ticket ID', key: 'id' },
        { header: 'Category', key: 'category' },
        { header: 'Location', key: 'location' },
        { header: 'Priority', key: 'priority' },
        { header: 'Description', key: 'description' },
        { header: 'Status', key: 'status' },
        { header: 'Technician', key: 'technician' },
      ],
      tickets
    );
  };

  return (
    <div className="space-y-6">
      {/* IMA Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                IMA CAMPUS INFRASTRUCTURE & MAINTENANCE
              </span>
              <span className="text-xs text-slate-400 font-mono">Workflow v2.4</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Wrench className="size-7 text-blue-400" /> Infrastructure & Complaints Suite
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              End-to-end maintenance ticketing: Computer labs, electrical, plumbing, projectors, ACs, generators & vendor AMC tracking.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleExportCSV} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Download className="size-4 text-blue-400" /> Export CSV
            </button>
            <button onClick={handlePrint} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Printer className="size-4 text-blue-400" /> Print Audit
            </button>
            <button onClick={() => setIsRaiseModalOpen(true)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 cursor-pointer">
              <Plus className="size-4" /> Raise Maintenance Ticket
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Open Tickets" value={String(tickets.filter(t => t.status === 'Open').length)} change="Pending technician assignment" icon={AlertTriangle} />
        <StatCard label="In Progress Repairs" value={String(tickets.filter(t => t.status === 'In Progress' || t.status === 'Assigned').length)} change="Technicians on-site" icon={Wrench} />
        <StatCard label="Repairs Completed" value={String(tickets.filter(t => t.status === 'Completed' || t.status === 'Closed').length)} change="Verified & operational" icon={CheckCircle} />
        <StatCard label="Active AMC Contracts" value="18" change="Generators, UPS, ACs, Elevator" icon={Building2} />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Open', 'Assigned', 'In Progress', 'Completed', 'Closed'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
              filterStatus === st
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            {st} Tickets
          </button>
        ))}
      </div>

      {/* Complaints Ticket Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Maintenance Ticket Lifecycle Log</h3>
            <div className="space-y-3">
              {filteredTickets.map(t => (
                <div key={t.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{t.id}</span>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{t.category}</span>
                      <Badge tone={t.priority === 'critical' || t.priority === 'high' ? 'danger' : 'warn'} className="text-[9px] uppercase">
                        {t.priority}
                      </Badge>
                    </div>
                    <Badge tone={t.status === 'Completed' || t.status === 'Closed' ? 'success' : t.status === 'In Progress' ? 'info' : 'default'} className="text-[9px]">
                      {t.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-2">{t.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2">
                    <div>Location: <strong className="text-slate-800 dark:text-slate-200">{t.location}</strong> • Raised by: {t.raisedBy}</div>
                    {t.technician && <div className="text-blue-600 font-bold">Tech: {t.technician}</div>}
                  </div>

                  {/* Workflow Action Buttons */}
                  <div className="flex items-center gap-2 justify-end mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    {t.status === 'Open' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'Assigned', 'Rajesh (Staff Tech)')} className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700">
                        Assign Technician
                      </button>
                    )}
                    {t.status === 'Assigned' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'In Progress')} className="px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer hover:bg-amber-600">
                        Start Repair
                      </button>
                    )}
                    {t.status === 'In Progress' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'Completed')} className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700">
                        Mark Repair Completed
                      </button>
                    )}
                    {t.status === 'Completed' && (
                      <button onClick={() => handleUpdateStatus(t.id, 'Closed')} className="px-3 py-1 rounded-xl border border-emerald-500 text-emerald-600 text-xs font-bold cursor-pointer hover:bg-emerald-50">
                        Verify & Close Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Infrastructure Asset Categories */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Campus Infrastructure Assets</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Computer Labs (240 PCs)', icon: Cpu, status: '98% Operational' },
                { name: 'Smart Class Projectors (42 Units)', icon: Building2, status: '40 Active' },
                { name: 'High-Cap Diesel Generator (250 KVA)', icon: Flame, status: 'Healthy' },
                { name: 'UPS Backup Battery Bank', icon: Wrench, status: 'Next Service: Aug 15' },
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-blue-600" />
                      <span className="font-extrabold text-slate-900 dark:text-white">{a.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">{a.status}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Raise Maintenance Ticket</h3>
              <button onClick={() => setIsRaiseModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="size-5" /></button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Issue Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full p-2.5 rounded-xl border dark:bg-slate-950">
                  <option value="Computer Lab">Computer Lab / PC Issue</option>
                  <option value="Projector & Smart Board">Projector / Smart Board Issue</option>
                  <option value="Electrical & AC">Electrical / AC / Fan Issue</option>
                  <option value="Plumbing & Water">Plumbing / Water Supply Issue</option>
                  <option value="Furniture & Fixtures">Furniture / Bench / Chair Broken</option>
                  <option value="Internet & WiFi">Internet / WiFi Connection Issue</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location / Room Number</label>
                <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="e.g. LH-201, CSE Lab 3, Library 2nd Floor" className="w-full p-2.5 rounded-xl border dark:bg-slate-950" />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority Level</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)} className="w-full p-2.5 rounded-xl border dark:bg-slate-950">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Emergency</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Detailed Description</label>
                <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Describe the fault or malfunction..." className="w-full p-2.5 rounded-xl border dark:bg-slate-950 min-h-[80px]" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg cursor-pointer">
                Submit Maintenance Complaint
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
