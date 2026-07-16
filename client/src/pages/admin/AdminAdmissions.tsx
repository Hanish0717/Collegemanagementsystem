import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  FileCheck,
  CreditCard,
  UserPlus,
  Search,
  BadgeAlert,
  Building,
  Check,
  X
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminAdmissions() {
  const [registrations, setRegistrations] = useState([
    { id: "REG-001", name: "Amit Verma", quota: "Entrance (EAPCET)", rank: 4521, docStatus: "Pending", paymentStatus: "Paid", allotted: false },
    { id: "REG-002", name: "Siddharth Roy", quota: "Management Quota", rank: 25412, docStatus: "Verified", paymentStatus: "Unpaid", allotted: false },
    { id: "REG-003", name: "Priya Sharma", quota: "Entrance (EAPCET)", rank: 1205, docStatus: "Verified", paymentStatus: "Paid", allotted: false },
    { id: "REG-004", name: "Kunal Kapoor", quota: "Management Quota", rank: 18451, docStatus: "Pending", paymentStatus: "Unpaid", allotted: false }
  ]);

  const [department, setDepartment] = useState("CSE");
  const [section, setSection] = useState("A");
  const [selectedReg, setSelectedReg] = useState<string>("REG-001");
  const [allotmentHistory, setAllotmentHistory] = useState<any[]>([
    { regId: "REG-003", name: "Priya Sharma", roll: "CS2026101", dept: "CSE", sec: "A" }
  ]);

  const handleVerifyDocs = (id: string, name: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, docStatus: "Verified" } : r));
    toast.success(`Documents verified for ${name}!`);
  };

  const handleMarkPaid = (id: string, name: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: "Paid" } : r));
    toast.success(`Fee Payment confirmed for ${name}!`);
  };

  const handleAllotSeat = (regId: string) => {
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return;

    if (reg.docStatus !== "Verified") {
      toast.error("Cannot allot seat. Documents must be Verified first!");
      return;
    }
    if (reg.paymentStatus !== "Paid") {
      toast.error("Cannot allot seat. Fees must be Paid first!");
      return;
    }

    const yearSuffix = new Date().getFullYear().toString().slice(-2);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedRoll = `${department}${yearSuffix}${randomSuffix}`;

    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, allotted: true } : r));
    const newAllotment = {
      regId,
      name: reg.name,
      roll: generatedRoll,
      dept: department,
      sec: section
    };
    setAllotmentHistory([newAllotment, ...allotmentHistory]);
    toast.success(`Seat allotted! ${reg.name} registered under Roll: ${generatedRoll} in CSE Section ${section}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Management Desk"
        desc="Administer online candidate registrations, verify certificates, track fees clearance, and allocate department sections."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Online Registrations"
          value="1,482"
          change="35 pending review"
          icon={Users}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Documents Checked"
          value="1,447"
          change="97.6% verification rate"
          icon={FileCheck}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Admission Fee Cleared"
          value="1,412"
          change="₹1.41 Cr collected"
          icon={CreditCard}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Seats Allotted"
          value="1,385"
          change="CSE fully occupied"
          icon={UserPlus}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Applicant Registry */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Online Registration Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Reg ID</th>
                  <th className="text-left pb-2">Applicant</th>
                  <th className="text-left pb-2">Quota Type</th>
                  <th className="text-center pb-2">Docs Status</th>
                  <th className="text-center pb-2">Admission Fees</th>
                  <th className="text-right pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-indigo-700">{r.id}</td>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-800">{r.name}</div>
                      <div className="text-[9px] text-slate-400">Rank: #{r.rank.toLocaleString()}</div>
                    </td>
                    <td className="py-2.5 font-medium">{r.quota}</td>
                    <td className="py-2.5 text-center">
                      <Badge tone={r.docStatus === "Verified" ? "success" : "warn"}>
                        {r.docStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-center">
                      <Badge tone={r.paymentStatus === "Paid" ? "success" : "danger"}>
                        {r.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right space-x-1">
                      {r.docStatus === "Pending" && (
                        <button
                          onClick={() => handleVerifyDocs(r.id, r.name)}
                          className="px-2 py-0.5 rounded border text-indigo-600 hover:bg-indigo-50 font-bold transition text-[10px]"
                        >
                          Verify Docs
                        </button>
                      )}
                      {r.paymentStatus === "Unpaid" && (
                        <button
                          onClick={() => handleMarkPaid(r.id, r.name)}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold transition text-[10px]"
                        >
                          Collect Fee
                        </button>
                      )}
                      {r.docStatus === "Verified" && r.paymentStatus === "Paid" && !r.allotted && (
                        <span className="text-[10px] text-emerald-600 font-bold">Ready to Allot</span>
                      )}
                      {r.allotted && (
                        <span className="text-[10px] text-slate-400 font-bold">Seat Allotted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Seat Allocation Form */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-2">Manual Seat Allocation</h3>
            <p className="text-xs text-muted-foreground mb-4">Choose verification-cleared candidates, select departments and sections, and generate roll numbers.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Candidate</label>
                <select
                  value={selectedReg}
                  onChange={(e) => setSelectedReg(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                >
                  {registrations.filter(r => !r.allotted).map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id}: {r.name} ({r.docStatus === "Verified" && r.paymentStatus === "Paid" ? "Cleared" : "Requirements Pending"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Allocate Dept</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="ECE">ECE (Electronics)</option>
                    <option value="EEE">EEE (Electrical)</option>
                    <option value="MECH">MECH (Mechanical)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
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
            onClick={() => handleAllotSeat(selectedReg)}
            className="w-full mt-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Allot Seat &amp; Generate Roll No
          </button>
        </Card>
      </div>

      {/* Seat Allocation History */}
      <Card>
        <h3 className="font-semibold mb-3">Allotted Seats &amp; ID Generation Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-slate-400">
                <th className="text-left pb-2">Reg ID</th>
                <th className="text-left pb-2">Candidate Name</th>
                <th className="text-left pb-2">Assigned Department</th>
                <th className="text-center pb-2">Section</th>
                <th className="text-right pb-2">Generated Student Roll No</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allotmentHistory.map(row => (
                <tr key={row.roll}>
                  <td className="py-2 font-mono font-bold text-slate-400">{row.regId}</td>
                  <td className="py-2 font-bold text-slate-800">{row.name}</td>
                  <td className="py-2 font-medium">{row.dept}</td>
                  <td className="py-2 text-center font-bold text-indigo-600">{row.sec}</td>
                  <td className="py-2 text-right font-mono font-bold text-emerald-600">{row.roll}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
export default AdminAdmissions;
