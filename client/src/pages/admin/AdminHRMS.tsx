import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  FileCheck,
  DollarSign,
  UserPlus,
  Trash2,
  CheckCircle,
  Plus,
  X
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminHRMS() {
  const [employees, setEmployees] = useState([
    { id: "EMP-101", name: "Dr. Srinivas Rao", dept: "CSE", designation: "Professor", status: "Active", leaveBalance: 18 },
    { id: "EMP-102", name: "Mrs. Ananya Sen", dept: "CSE", designation: "Assistant Professor", status: "Active", leaveBalance: 12 },
    { id: "EMP-103", name: "Dr. Aisha Khan", dept: "IT", designation: "HOD IT", status: "Active", leaveBalance: 15 },
    { id: "EMP-104", name: "Mr. Ramesh Yadav", dept: "CSE", designation: "Senior Lecturer", status: "Active", leaveBalance: 14 }
  ]);

  const [recruitmentList, setRecruitmentList] = useState([
    { id: "REC-01", title: "Assistant Professor (AIML)", depts: "AIML", applicants: 24, status: "Interviewing" },
    { id: "REC-02", title: "System Administrator", depts: "IT", applicants: 15, status: "Open" },
    { id: "REC-03", title: "Lab Assistant (ECE)", depts: "ECE", applicants: 8, status: "Open" }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("CSE");
  const [newDesignation, setNewDesignation] = useState("Lecturer");

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter employee name!");
      return;
    }
    const newEmp = {
      id: `EMP-${100 + employees.length + 1}`,
      name: newName,
      dept: newDept,
      designation: newDesignation,
      status: "Active",
      leaveBalance: 15
    };
    setEmployees([...employees, newEmp]);
    toast.success(`Employee ${newName} added successfully!`);
    setShowAddModal(false);
    setNewName("");
  };

  const handleFireEmployee = (id: string, name: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.warning(`Employee record ${name} deactivated.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resource Management System (HRMS)"
        desc="Administer employee records, recruitment openings, biometric leaves checking, and staff performance indicators."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={String(employees.length + 338)}
          change="342 staff members active"
          icon={Users}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Recruitment Openings"
          value="3 Positions"
          change="47 applicants reviewable"
          icon={Briefcase}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Leave Balance average"
          value="14.2 Days"
          change="Across all departments"
          icon={FileCheck}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Current Month Payroll"
          value="₹42.5L"
          change="Disbursed July 16"
          icon={DollarSign}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Employee Directory */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Employee Directory</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3.5" /> Add Staff Member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Employee ID</th>
                  <th className="text-left pb-2">Name</th>
                  <th className="text-left pb-2">Department</th>
                  <th className="text-left pb-2">Designation</th>
                  <th className="text-center pb-2">Leave Balance</th>
                  <th className="text-right pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-slate-400">{e.id}</td>
                    <td className="py-2.5 font-bold text-slate-800">{e.name}</td>
                    <td className="py-2.5 font-medium">{e.dept}</td>
                    <td className="py-2.5 text-slate-600 font-medium">{e.designation}</td>
                    <td className="py-2.5 text-center font-bold text-indigo-700">{e.leaveBalance} Days</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleFireEmployee(e.id, e.name)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded transition cursor-pointer"
                        title="Deactivate Record"
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

        {/* Recruitment open board */}
        <Card>
          <h3 className="font-semibold mb-3">Active Recruitment Board</h3>
          <div className="space-y-3">
            {recruitmentList.map(r => (
              <div key={r.id} className="p-3 border rounded-xl space-y-1.5 text-xs hover:bg-slate-50 transition">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{r.title}</span>
                  <Badge tone={r.status === "Interviewing" ? "info" : "success"}>{r.status}</Badge>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Dept: {r.depts}</span>
                  <span>{r.applicants} Applicants</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <UserPlus className="size-5 text-indigo-600" /> New Employee File
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Srinivasa Rao"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Designation</label>
                  <select
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Prof</option>
                    <option value="Assistant Professor">Assistant Prof</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminHRMS;
