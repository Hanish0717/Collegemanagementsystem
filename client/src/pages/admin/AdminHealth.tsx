import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Calendar,
  AlertOctagon,
  Plus,
  Activity,
  User,
  ShieldAlert,
  Clock,
  BriefcaseMedical,
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function AdminHealth() {
  const [activeTab, setActiveTab] = useState<'clinic' | 'counselling' | 'emergency'>('clinic');

  // Clinic logs state
  const [clinicLogs, setClinicLogs] = useState([
    {
      id: 'MED-001',
      student: 'Amit Verma',
      dept: 'CSE',
      sym: 'Seasonal Fever',
      medicine: 'Paracetamol 650mg',
      status: 'Observed & Discharged',
    },
    {
      id: 'MED-002',
      student: 'Priya Sharma',
      dept: 'ECE',
      sym: 'Ankle Sprain (Sports)',
      medicine: 'Pain Relief Spray + Bandage',
      status: 'Referred to Ortho',
    },
    {
      id: 'MED-003',
      student: 'Kunal Kapoor',
      dept: 'MECH',
      sym: 'Dehydration',
      medicine: 'ORS Fluid Drink',
      status: 'Observed & Discharged',
    },
  ]);

  // Counselling appointments state
  const [appointments, setAppointments] = useState([
    {
      id: 'CNS-101',
      student: 'Siddharth Roy',
      counselor: 'Dr. Anjali Sen (Psychologist)',
      time: '11:00 AM',
      date: '2026-07-17',
      status: 'Confirmed',
    },
    {
      id: 'CNS-102',
      student: 'Neha Gupta',
      counselor: 'Dr. Anjali Sen (Psychologist)',
      time: '02:30 PM',
      date: '2026-07-17',
      status: 'Pending Guidance',
    },
  ]);

  // Form States
  const [newStudent, setNewStudent] = useState('');
  const [newDept, setNewDept] = useState('CSE');
  const [newSym, setNewSym] = useState('');
  const [newMed, setNewMed] = useState('');

  const handleAddClinicLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.trim() || !newSym.trim() || !newMed.trim()) {
      toast.error('Please fill in clinic log details!');
      return;
    }
    const newLog = {
      id: `MED-00${clinicLogs.length + 1}`,
      student: newStudent,
      dept: newDept,
      sym: newSym,
      medicine: newMed,
      status: 'Observed & Discharged',
    };
    setClinicLogs([newLog, ...clinicLogs]);
    toast.success(`Medical room log recorded for ${newStudent}!`);
    setNewStudent('');
    setNewSym('');
    setNewMed('');
  };

  const handleConfirmCounselling = (id: string, name: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Confirmed' } : a)));
    toast.success(`Counselling session confirmed for student: ${name}!`);
  };

  const handleTriggerSOS = () => {
    toast.loading('Broadcasting medical response alerts to campus doctors & wardens...', {
      duration: 1800,
    });
    setTimeout(() => {
      toast.success('SOS Alert sent! Medical Response Team dispatched to Main Block.', {
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }, 1900);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health, Counselling &amp; Wellness Center"
        desc="Log daily campus clinic visitations, schedule mental health counselling sessions, and configure emergency SOS medical response alerts."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Daily Clinic Visits"
          value="3 Checked-in"
          change="Average 5 visitors/day"
          icon={Activity}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Counselling Sessions"
          value="2 Appointments"
          change="Mental health sessions confirmed"
          icon={User}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Medicine Stock Status"
          value="94% In-Stock"
          change="First aid &amp; common tablets ready"
          icon={BriefcaseMedical}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Active SOS Status"
          value="All Systems Green"
          change="Response teams on standby"
          icon={ShieldAlert}
          gradient="bg-gradient-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'clinic', label: 'Clinic Log & Medicine', icon: BriefcaseMedical },
          { id: 'counselling', label: 'Counselling Scheduler', icon: Calendar },
          { id: 'emergency', label: 'SOS Alerts Control', icon: ShieldAlert },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* CLINIC */}
        {activeTab === 'clinic' && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Roster */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Daily Clinic Visit Log</h3>
              <div className="space-y-3.5">
                {clinicLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">{log.id}</span>
                        <span className="font-bold text-slate-800">
                          {log.student} ({log.dept})
                        </span>
                      </div>
                      <div className="text-slate-500 font-semibold">Symptoms: {log.sym}</div>
                      <div className="text-[10px] text-slate-400 font-bold">
                        Treatment / Meds: {log.medicine}
                      </div>
                    </div>
                    <Badge tone={log.status.includes('Discharged') ? 'success' : 'warn'}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Add Log Form */}
            <Card>
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Record Clinic Visit</h3>
              <form onSubmit={handleAddClinicLog} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Sharma"
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Department
                    </label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Symptoms
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Headache"
                      value={newSym}
                      onChange={(e) => setNewSym(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Medicine Prescribed
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aspirin 100mg"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Log Entry
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* COUNSELLING */}
        {activeTab === 'counselling' && (
          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">
              Psychological &amp; Wellness Counselling Sessions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Session ID</th>
                    <th className="text-left pb-2">Student Name</th>
                    <th className="text-left pb-2">Wellness Counsellor</th>
                    <th className="text-left pb-2">Scheduled Date</th>
                    <th className="text-center pb-2">Time Slot</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 font-mono font-bold text-indigo-700">{row.id}</td>
                      <td className="py-3 font-bold text-slate-800">{row.student}</td>
                      <td className="py-3 font-semibold">{row.counselor}</td>
                      <td className="py-3 font-semibold text-slate-500">{row.date}</td>
                      <td className="py-3 text-center font-bold text-slate-700">{row.time}</td>
                      <td className="py-3 text-right">
                        {row.status === 'Confirmed' ? (
                          <Badge tone="success">Confirmed</Badge>
                        ) : (
                          <button
                            onClick={() => handleConfirmCounselling(row.id, row.student)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition"
                          >
                            Approve Slot
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* EMERGENCY */}
        {activeTab === 'emergency' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                Emergency Contact Matrix
              </h3>
              <div className="space-y-3.5">
                {[
                  {
                    name: 'Dr. B. Prasad (Campus Doctor)',
                    phone: '+91 98451 22355',
                    role: 'Primary Responder',
                  },
                  {
                    name: 'K. Mohan (Ambulance Service)',
                    phone: '+91 99015 44810',
                    role: 'Transport Desk',
                  },
                  {
                    name: 'City Trauma Center (External Hospital)',
                    phone: '+91 80 2341 8800',
                    role: 'Partner Trauma Unit',
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800">{row.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{row.role}</div>
                    </div>
                    <span className="font-mono font-bold text-indigo-700">{row.phone}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col justify-center items-center text-center p-6 border-red-100 bg-red-50/30">
              <div className="p-3 rounded-full bg-red-100 text-red-600 animate-pulse">
                <AlertOctagon className="size-10" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mt-4">Emergency Medical SOS</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                One-click broadcast trigger to all campus first responders, wardens, and medical
                vans.
              </p>
              <button
                onClick={handleTriggerSOS}
                className="w-full mt-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-200"
              >
                <AlertOctagon className="size-4 animate-bounce" /> Trigger Medical SOS Alert
              </button>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}
export default AdminHealth;
