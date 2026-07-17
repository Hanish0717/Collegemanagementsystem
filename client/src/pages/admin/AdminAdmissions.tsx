import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  FileCheck,
  CreditCard,
  UserPlus,
  BookOpen,
  Layers,
  Award,
  Search,
  Check,
  X,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function AdminAdmissions() {
  const [activeTab, setActiveTab] = useState<
    'registrations' | 'quota' | 'verification' | 'allotment' | 'crm' | 'merit' | 'counselling'
  >('registrations');

  // CRM Lead Management State
  const [crmLeads, setCrmLeads] = useState([
    {
      id: 'LED-801',
      name: 'Rohan Das',
      phone: '9876543210',
      email: 'rohan@gmail.com',
      source: 'Google Ads',
      notes: 'Interested in CSE. Confirmed rank 8412.',
      status: 'Contacted',
    },
    {
      id: 'LED-802',
      name: 'Sanya Sen',
      phone: '9988776655',
      email: 'sanya@yahoo.com',
      source: 'Direct Walk-in',
      notes: 'Inquired about hostel facilities and fees.',
      status: 'New Enquiry',
    },
  ]);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  // Merit Cutoffs State
  const [cutoffRank, setCutoffRank] = useState(15000);

  // Counselling Schedules State
  const [counsellingSlots, setCounsellingSlots] = useState([
    {
      id: 'CNS-01',
      name: 'Siddharth Roy',
      date: '2026-07-20',
      time: '10:00 AM',
      panel: 'Panel A (Main Block)',
      status: 'Scheduled',
    },
    {
      id: 'CNS-02',
      name: 'Amit Verma',
      date: '2026-07-20',
      time: '11:30 AM',
      panel: 'Panel B (CSE Block)',
      status: 'Completed',
    },
  ]);

  // Applicant list for Registration & Verification stages
  const [applicants, setApplicants] = useState([
    {
      id: 'REG-001',
      name: 'Amit Verma',
      quota: 'Entrance (EAPCET)',
      rank: 4521,
      docs: { marksheets: false, aadhaar: true, tc: false },
      docStatus: 'Pending',
      feesPaid: 15000,
      feeStatus: 'Paid',
      allotted: false,
    },
    {
      id: 'REG-002',
      name: 'Siddharth Roy',
      quota: 'Management Quota',
      rank: 25412,
      docs: { marksheets: true, aadhaar: true, tc: true },
      docStatus: 'Verified',
      feesPaid: 0,
      feeStatus: 'Unpaid',
      allotted: false,
    },
    {
      id: 'REG-003',
      name: 'Priya Sharma',
      quota: 'Entrance (EAPCET)',
      rank: 1205,
      docs: { marksheets: true, aadhaar: true, tc: true },
      docStatus: 'Verified',
      feesPaid: 15000,
      feeStatus: 'Paid',
      allotted: true,
      roll: 'CS2026101',
      dept: 'CSE',
      sec: 'A',
    },
    {
      id: 'REG-004',
      name: 'Kunal Kapoor',
      quota: 'Management Quota',
      rank: 18451,
      docs: { marksheets: false, aadhaar: false, tc: false },
      docStatus: 'Pending',
      feesPaid: 0,
      feeStatus: 'Unpaid',
      allotted: false,
    },
  ]);

  // Quota allocation configurations
  const [quotaStats, setQuotaStats] = useState({
    entranceAllotted: 840,
    entranceTotal: 1200,
    mgmtAllotted: 180,
    mgmtTotal: 200,
  });

  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSec, setSelectedSec] = useState('A');
  const [selectedApplicantId, setSelectedApplicantId] = useState('REG-002');

  // Verify specific document toggle
  const toggleDoc = (applicantId: string, docType: 'marksheets' | 'aadhaar' | 'tc') => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const updatedDocs = { ...app.docs, [docType]: !app.docs[docType] };
        const allVerified = updatedDocs.marksheets && updatedDocs.aadhaar && updatedDocs.tc;
        return {
          ...app,
          docs: updatedDocs,
          docStatus: allVerified ? 'Verified' : 'Pending',
        };
      }),
    );
    toast.success('Document verification checklist updated!');
  };

  // Collect Fee clearance
  const collectFee = (applicantId: string, name: string) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id === applicantId) {
          return { ...app, feeStatus: 'Paid', feesPaid: 15000 };
        }
        return app;
      }),
    );
    toast.success(`Fee Payment of ₹15,000 confirmed for ${name}!`);
  };

  // Complete seat allotment & generate ID
  const allotSeat = (applicantId: string) => {
    const app = applicants.find((a) => a.id === applicantId);
    if (!app) return;

    if (app.docStatus !== 'Verified') {
      toast.error('Cannot allot seat. Documents must be 100% verified first!');
      return;
    }
    if (app.feeStatus !== 'Paid') {
      toast.error('Cannot allot seat. Admission fee clearance is required!');
      return;
    }

    const yearSuffix = new Date().getFullYear().toString().slice(-2);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedRoll = `${selectedDept}${yearSuffix}${randomSuffix}`;

    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id === applicantId) {
          return {
            ...a,
            allotted: true,
            roll: generatedRoll,
            dept: selectedDept,
            sec: selectedSec,
          };
        }
        return a;
      }),
    );

    // Update quota stats
    setQuotaStats((prev) => {
      if (app.quota.includes('Entrance')) {
        return { ...prev, entranceAllotted: prev.entranceAllotted + 1 };
      } else {
        return { ...prev, mgmtAllotted: prev.mgmtAllotted + 1 };
      }
    });

    toast.success(
      `Seat allocated! Roll No: ${generatedRoll} assigned to CSE Section ${selectedSec}`,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Management"
        desc="Manage registrations, check quota status, verify certificates, log payments, and allot seats with roll number generation."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'registrations', label: 'Online Registration', icon: Users },
          { id: 'quota', label: 'Entrance / Management Quota', icon: Layers },
          { id: 'verification', label: 'Document & Fee Verification', icon: FileCheck },
          { id: 'allotment', label: 'Seat Allotment & ID Gen', icon: UserPlus },
          { id: 'crm', label: 'Admission CRM Leads', icon: FileText },
          { id: 'merit', label: 'Merit Cutoffs', icon: Award },
          { id: 'counselling', label: 'Counselling Schedule', icon: CheckCircle },
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

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* ONLINE REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  Online Candidate Registration List
                </h3>
                <p className="text-[10px] text-slate-500">
                  Live roster of candidates who registered via the online admissions portal.
                </p>
              </div>
              <Badge tone="info">4 Total Applications</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Reg ID</th>
                    <th className="text-left pb-2">Applicant Name</th>
                    <th className="text-left pb-2">Entrance / Quota</th>
                    <th className="text-center pb-2">Entrance Rank</th>
                    <th className="text-center pb-2">Registrar Fee</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicants.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-indigo-700">{app.id}</td>
                      <td className="py-3 font-bold text-slate-800">{app.name}</td>
                      <td className="py-3 font-semibold">{app.quota}</td>
                      <td className="py-3 text-center font-mono font-bold text-slate-600">
                        #{app.rank.toLocaleString()}
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700">
                        ₹{app.feesPaid.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <Badge tone={app.allotted ? 'success' : 'warn'}>
                          {app.allotted ? 'Admitted' : 'Awaiting Allotment'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* QUOTA STATUS */}
        {activeTab === 'quota' && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Entrance Quota */}
            <Card>
              <h3 className="font-semibold text-sm mb-1.5">Entrance Exam Quota (EAPCET)</h3>
              <p className="text-[10px] text-slate-500 mb-4">
                Admissions secured via merit rankings in State Entrance Exam.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Allotted Seats</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {quotaStats.entranceAllotted} / {quotaStats.entranceTotal}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${(quotaStats.entranceAllotted / quotaStats.entranceTotal) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Remaining capacity: {quotaStats.entranceTotal - quotaStats.entranceAllotted}{' '}
                  seats.
                </p>
              </div>
            </Card>

            {/* Management Quota */}
            <Card>
              <h3 className="font-semibold text-sm mb-1.5">Management Quota</h3>
              <p className="text-[10px] text-slate-500 mb-4">
                Direct admissions allotted under management administration sanction.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Allotted Seats</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {quotaStats.mgmtAllotted} / {quotaStats.mgmtTotal}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${(quotaStats.mgmtAllotted / quotaStats.mgmtTotal) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Remaining capacity: {quotaStats.mgmtTotal - quotaStats.mgmtAllotted} seats.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* VERIFICATION & FEES */}
        {activeTab === 'verification' && (
          <Card>
            <h3 className="font-semibold mb-3 text-sm">Document Verification &amp; Fee Payments</h3>
            <div className="space-y-4">
              {applicants.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700 text-xs">{app.id}</span>
                      <span className="font-bold text-slate-800 text-xs">{app.name}</span>
                      <Badge
                        tone={app.quota.includes('Entrance') ? 'info' : 'warn'}
                        className="text-[9px]"
                      >
                        {app.quota}
                      </Badge>
                    </div>
                    {/* Document Verification Checkboxes */}
                    <div className="flex items-center gap-4 pt-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">
                        Documents checklist:
                      </span>
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.docs.marksheets}
                          onChange={() => toggleDoc(app.id, 'marksheets')}
                          className="rounded text-indigo-600 size-3 cursor-pointer"
                        />
                        10th/12th Marksheets
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.docs.aadhaar}
                          onChange={() => toggleDoc(app.id, 'aadhaar')}
                          className="rounded text-indigo-600 size-3 cursor-pointer"
                        />
                        Aadhaar ID Card
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.docs.tc}
                          onChange={() => toggleDoc(app.id, 'tc')}
                          className="rounded text-indigo-600 size-3 cursor-pointer"
                        />
                        Transfer Certificate
                      </label>
                    </div>
                  </div>

                  {/* Document & Fee Status Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-1.5">
                        <Badge
                          tone={app.docStatus === 'Verified' ? 'success' : 'danger'}
                          className="text-[9px]"
                        >
                          Docs: {app.docStatus}
                        </Badge>
                        <Badge
                          tone={app.feeStatus === 'Paid' ? 'success' : 'danger'}
                          className="text-[9px]"
                        >
                          Fee: {app.feeStatus}
                        </Badge>
                      </div>
                    </div>
                    {app.feeStatus === 'Unpaid' && (
                      <button
                        onClick={() => collectFee(app.id, app.name)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="size-3" /> Collect Fee
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* SEAT ALLOTMENT & ID GENERATION */}
        {activeTab === 'allotment' && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Form */}
            <Card className="flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1.5">
                  Seat Allocation &amp; ID Generator
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Choose verification-cleared applicants, allocate departments, and generate student
                  IDs.
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Select Applicant
                    </label>
                    <select
                      value={selectedApplicantId}
                      onChange={(e) => setSelectedApplicantId(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none cursor-pointer"
                    >
                      {applicants
                        .filter((a) => !a.allotted)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.id}: {a.name} (
                            {a.docStatus === 'Verified' && a.feeStatus === 'Paid'
                              ? 'Cleared'
                              : 'Pending Requirements'}
                            )
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Department
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="CS">CSE (Computer Science)</option>
                        <option value="EC">ECE (Electronics)</option>
                        <option value="EE">EEE (Electrical)</option>
                        <option value="ME">MECH (Mechanical)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Section
                      </label>
                      <select
                        value={selectedSec}
                        onChange={(e) => setSelectedSec(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => allotSeat(selectedApplicantId)}
                className="w-full mt-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Allot Seat &amp; Generate Student ID
              </button>
            </Card>

            {/* History Logs */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                Allotted Seats &amp; Department Allocation History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-slate-400">
                      <th className="text-left pb-2">Reg ID</th>
                      <th className="text-left pb-2">Candidate Name</th>
                      <th className="text-left pb-2">Allotted Department</th>
                      <th className="text-center pb-2">Section</th>
                      <th className="text-right pb-2">Generated Student Roll No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicants
                      .filter((a) => a.allotted)
                      .map((row) => (
                        <tr key={row.id}>
                          <td className="py-2.5 font-mono font-bold text-slate-400">{row.id}</td>
                          <td className="py-2.5 font-bold text-slate-800">{row.name}</td>
                          <td className="py-2.5 font-semibold text-indigo-700">
                            {row.dept === 'CS'
                              ? 'CSE'
                              : row.dept === 'EC'
                                ? 'ECE'
                                : row.dept === 'EE'
                                  ? 'EEE'
                                  : 'MECH'}
                          </td>
                          <td className="py-2.5 text-center font-bold text-slate-700">{row.sec}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-emerald-600">
                            {row.roll}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ADMISSION CRM & LEADS */}
        {activeTab === 'crm' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                Admission CRM Lead Roster
              </h3>
              <div className="space-y-3">
                {crmLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">{lead.id}</span>
                        <span className="font-bold text-slate-800">{lead.name}</span>
                        <Badge tone="info" className="text-[9px]">
                          {lead.source}
                        </Badge>
                      </div>
                      <div className="text-slate-500 font-semibold">
                        Phone: {lead.phone} | Email: {lead.email}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">
                        Notes: {lead.notes}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={lead.status === 'Registered' ? 'success' : 'warn'}>
                        {lead.status}
                      </Badge>
                      {lead.status !== 'Registered' && (
                        <button
                          onClick={() => {
                            setCrmLeads((prev) =>
                              prev.map((l) =>
                                l.id === lead.id ? { ...l, status: 'Registered' } : l,
                              ),
                            );
                            toast.success(
                              `Lead '${lead.name}' successfully marked as registered candidate!`,
                            );
                          }}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-bold cursor-pointer transition"
                        >
                          Mark Registered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Add Enquiry Lead</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newLeadName.trim() || !newLeadEmail.trim()) {
                    toast.error('Please fill in lead details!');
                    return;
                  }
                  const newLd = {
                    id: `LED-${Math.floor(803 + Math.random() * 100)}`,
                    name: newLeadName,
                    phone: '98451 00214',
                    email: newLeadEmail,
                    source: 'Direct Web',
                    notes: newLeadNotes || 'No notes provided.',
                    status: 'New Enquiry',
                  };
                  setCrmLeads([...crmLeads, newLd]);
                  toast.success(`CRM Lead '${newLeadName}' added!`);
                  setNewLeadName('');
                  setNewLeadEmail('');
                  setNewLeadNotes('');
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Lead Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Candidate Name"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@gmail.com"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Notes / Chat Log
                  </label>
                  <textarea
                    placeholder="Enquiry details..."
                    value={newLeadNotes}
                    onChange={(e) => setNewLeadNotes(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none h-16 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Lead
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* MERIT CUTOFFS */}
        {activeTab === 'merit' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card>
              <h3 className="font-semibold text-slate-800 text-sm mb-1.5">
                Merit Cutoff Rank Calculator
              </h3>
              <p className="text-[10px] text-slate-500 mb-4">
                Set the maximum EAPCET rank threshold to filter qualifying candidates.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
                    EAPCET Cutoff Rank Limit
                  </label>
                  <input
                    type="number"
                    value={cutoffRank}
                    onChange={(e) => setCutoffRank(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    toast.success(`Merit Cutoff rank updated to #${cutoffRank.toLocaleString()}`);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Apply Cutoff Filter
                </button>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                Qualifying Merit Candidates List
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-slate-400">
                      <th className="text-left pb-2">Reg ID</th>
                      <th className="text-left pb-2">Candidate Name</th>
                      <th className="text-center pb-2">EAPCET Rank</th>
                      <th className="text-right pb-2">Accreditation Eligibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicants
                      .filter((app) => app.quota.includes('Entrance') && app.rank <= cutoffRank)
                      .map((row) => (
                        <tr key={row.id}>
                          <td className="py-2.5 font-mono font-bold text-slate-400">{row.id}</td>
                          <td className="py-2.5 font-bold text-slate-800">{row.name}</td>
                          <td className="py-2.5 text-center font-mono font-bold text-indigo-700">
                            #{row.rank.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right">
                            <Badge tone="success">Qualifies</Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* COUNSELLING */}
        {activeTab === 'counselling' && (
          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">
              Counselling &amp; Physical Verification Schedules
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Slot ID</th>
                    <th className="text-left pb-2">Candidate Name</th>
                    <th className="text-left pb-2">Scheduled Date</th>
                    <th className="text-left pb-2">Time Slot</th>
                    <th className="text-left pb-2">Assigned Panel Block</th>
                    <th className="text-right pb-2">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {counsellingSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="py-3 font-mono font-bold text-indigo-700">{slot.id}</td>
                      <td className="py-3 font-bold text-slate-800">{slot.name}</td>
                      <td className="py-3 font-semibold text-slate-500">{slot.date}</td>
                      <td className="py-3 font-bold text-slate-700">{slot.time}</td>
                      <td className="py-3 font-semibold">{slot.panel}</td>
                      <td className="py-3 text-right">
                        {slot.status === 'Completed' ? (
                          <Badge tone="success">Completed</Badge>
                        ) : (
                          <button
                            onClick={() => {
                              setCounsellingSlots((prev) =>
                                prev.map((s) =>
                                  s.id === slot.id ? { ...s, status: 'Completed' } : s,
                                ),
                              );
                              toast.success(`Verification checklist completed for ${slot.name}!`);
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition"
                          >
                            Mark Completed
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
      </motion.div>
    </div>
  );
}
export default AdminAdmissions;
