import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle,
  Plus,
  Trash2,
  FileSpreadsheet,
  Layers
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminFinance() {
  const [scholarships, setScholarships] = useState([
    { id: "SCH-101", studentName: "Priya Sharma", type: "Academic Merit Scholarship", waiver: "50% Tuition", status: "Approved" },
    { id: "SCH-102", studentName: "Varun Verma", type: "Sports Excellence Waiver", waiver: "100% Sports Fee", status: "Approved" },
    { id: "SCH-103", studentName: "Nikita Reddy", type: "Need-based Financial Aid", waiver: "30% Tuition", status: "Approved" }
  ]);

  const [feeCategories, setFeeCategories] = useState([
    { name: "Academic Tuition Fees", rate: 75000, collected: 24500000, pending: 1500000 },
    { name: "Hostel Lodging Fees", rate: 45000, collected: 3200000, pending: 250000 },
    { name: "Transport Fleet Pass", rate: 18000, collected: 720000, pending: 120000 }
  ]);

  const [studentWaiverName, setStudentWaiverName] = useState("");
  const [waiverType, setWaiverType] = useState("Academic Merit Scholarship");
  const [waiverVal, setWaiverVal] = useState("50% Tuition");

  const handleRecordWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentWaiverName.trim()) {
      toast.error("Please enter Student Name!");
      return;
    }
    const newSch = {
      id: `SCH-${100 + scholarships.length + 1}`,
      studentName: studentWaiverName,
      type: waiverType,
      waiver: waiverVal,
      status: "Approved"
    };
    setScholarships([...scholarships, newSch]);
    toast.success(`Scholarship Waiver of ${waiverVal} allocated to ${studentWaiverName}!`);
    setStudentWaiverName("");
  };

  const handleRevokeWaiver = (id: string, name: string) => {
    setScholarships(prev => prev.filter(s => s.id !== id));
    toast.warning(`Scholarship waiver revoked for ${name}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tuition Fees &amp; Finance ledger"
        desc="Administer fee structures, register scholarship waivers, disburse vendor liabilities, and verify tax/GST statement logs."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gross Revenue Received"
          value="₹2.84 Cr"
          change="93.6% collection target"
          icon={Wallet}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Waivers / Scholarships"
          value="₹12.5 Lakhs"
          change="84 students benefited"
          icon={Award}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="GST Quarterly Filing"
          value="18% Tax slab"
          change="Calculated Ledger online"
          icon={FileSpreadsheet}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Vendor Disbursals"
          value="₹3.70 Lakhs"
          change="All bank transactions cleared"
          icon={DollarSign}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Fee Categories */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Institutional Fee Structure Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Fee Category Name</th>
                  <th className="text-left pb-2">Annual Rate / Student</th>
                  <th className="text-center pb-2">Total Collected</th>
                  <th className="text-right pb-2">Outstanding Dues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeCategories.map(row => (
                  <tr key={row.name}>
                    <td className="py-2.5 font-bold text-slate-800">{row.name}</td>
                    <td className="py-2.5 font-mono text-slate-500">₹{row.rate.toLocaleString()}</td>
                    <td className="py-2.5 text-center font-mono font-bold text-emerald-600">₹{row.collected.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-rose-600">₹{row.pending.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Allocate scholarship waiver */}
        <Card>
          <h3 className="font-semibold mb-2">Allocate Scholarship Waiver</h3>
          <p className="text-xs text-muted-foreground mb-4">Waive tuition or lab fees for merit/sports students.</p>
          <form onSubmit={handleRecordWaiver} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hanish Senapati"
                value={studentWaiverName}
                onChange={(e) => setStudentWaiverName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Waiver Type</label>
              <select
                value={waiverType}
                onChange={(e) => setWaiverType(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              >
                <option value="Academic Merit Scholarship">Academic Merit Scholarship</option>
                <option value="Sports Excellence Waiver">Sports Excellence Waiver</option>
                <option value="Need-based Financial Aid">Need-based Financial Aid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Scholarship Value</label>
              <select
                value={waiverVal}
                onChange={(e) => setWaiverVal(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              >
                <option value="100% Tuition">100% Tuition Waiver</option>
                <option value="50% Tuition">50% Tuition Waiver</option>
                <option value="30% Tuition">30% Tuition Waiver</option>
                <option value="100% Sports Fee">100% Sports Fee Waiver</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Allocate Waiver Receipt
            </button>
          </form>
        </Card>
      </div>

      {/* Scholarship log */}
      <Card>
        <h3 className="font-semibold mb-3">Scholarships &amp; Waivers Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-slate-400">
                <th className="text-left pb-2">Waiver ID</th>
                <th className="text-left pb-2">Student Name</th>
                <th className="text-left pb-2">Scholarship Category</th>
                <th className="text-center pb-2">Waiver Allocation</th>
                <th className="text-center pb-2">Status</th>
                <th className="text-right pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scholarships.map(row => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono font-bold text-slate-400">{row.id}</td>
                  <td className="py-2.5 font-bold text-slate-800">{row.studentName}</td>
                  <td className="py-2.5 font-medium">{row.type}</td>
                  <td className="py-2.5 text-center font-bold text-indigo-700">{row.waiver}</td>
                  <td className="py-2.5 text-center">
                    <Badge tone="success">{row.status}</Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => handleRevokeWaiver(row.id, row.studentName)}
                      className="p-1 hover:bg-rose-50 text-rose-600 rounded transition cursor-pointer"
                      title="Revoke Waiver"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
export default AdminFinance;
