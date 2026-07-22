import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  FileText,
  Plus,
  RefreshCw,
  Sliders
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function DeanDashboard() {
  const [electives, setElectives] = useState([
    { code: "CSE-E81", name: "Cloud Native Systems", registered: 412, capacity: 450, status: "Active" },
    { code: "CSE-E82", name: "Deep Learning Foundations", registered: 385, capacity: 400, status: "Active" },
    { code: "CSE-E83", name: "Blockchain & Smart Contracts", registered: 198, capacity: 200, status: "Full" },
    { code: "ECE-E84", name: "VLSI System Design", registered: 215, capacity: 300, status: "Active" },
    { code: "AIML-E85", name: "Reinforcement Learning", registered: 310, capacity: 310, status: "Full" }
  ]);

  const [semesters, setSemesters] = useState([
    { id: "SEM-5", name: "B.Tech Sem 5 (Odd)", syllabusCovered: "82%", status: "In-Progress" },
    { id: "SEM-7", name: "B.Tech Sem 7 (Odd)", syllabusCovered: "91%", status: "In-Progress" },
    { id: "SEM-3", name: "B.Tech Sem 3 (Odd)", syllabusCovered: "65%", status: "In-Progress" }
  ]);

  const handleComputeResults = () => {
    toast.loading("Processing grade matrices & computing CGPA variables...", { duration: 1500 });
    setTimeout(() => toast.success("SGPA/CGPA computations compiled successfully for all active departments!"), 1600);
  };

  const handleCreateSemester = () => {
    toast.success("New Academic Semester (Even Term 2026-27) created successfully! R23 guidelines loaded.");
  };

  const electiveData = electives.map(e => ({
    name: e.code,
    registered: e.registered,
    available: e.capacity - e.registered
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dean's Academic Console"
        desc="Manage active semester definitions, student elective selections, curriculum frameworks, and exam registers."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Course Registrations"
          value="98.7%"
          change="5,178 students completed"
          icon={BookOpen}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Active Curricula"
          value="3 Schemas"
          change="R20, R23, & New R26 Draft"
          icon={Sliders}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Timetable Roster Slots"
          value="1,420"
          change="99.2% classes scheduled"
          icon={Calendar}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Grade Books Approved"
          value="84 / 96"
          change="12 sections pending upload"
          icon={Award}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Elective Popularity Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Elective Selections Load</h3>
              <p className="text-[10px] text-slate-500">Student enrollment counts per elective course code.</p>
            </div>
            <Badge tone="info">This Semester</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={electiveData} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar dataKey="registered" name="Enrolled Students" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="available" name="Available Capacity" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Semester Progress */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Active Semesters</h3>
            <button
              onClick={handleCreateSemester}
              className="p-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> New
            </button>
          </div>
          <div className="space-y-3">
            {semesters.map(sem => (
              <div key={sem.id} className="p-3 border rounded-xl space-y-2 text-xs bg-slate-50/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{sem.name}</span>
                  <Badge tone="success">{sem.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Syllabus Covered:</span>
                  <span className="font-bold text-indigo-700">{sem.syllabusCovered}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: sem.syllabusCovered }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom section: Grade Auditing & Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Electives Table */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Professional Electives Roster</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Code</th>
                  <th className="text-left pb-2">Course Name</th>
                  <th className="text-center pb-2">Registrations</th>
                  <th className="text-center pb-2">Capacity</th>
                  <th className="text-right pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {electives.map(e => (
                  <tr key={e.code} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-indigo-700">{e.code}</td>
                    <td className="py-2.5 font-medium">{e.name}</td>
                    <td className="py-2.5 text-center font-bold">{e.registered}</td>
                    <td className="py-2.5 text-center text-slate-400">{e.capacity}</td>
                    <td className="py-2.5 text-right">
                      <Badge tone={e.status === "Full" ? "warn" : "success"}>{e.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Grade Management & CGPA processing */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-2">Grading Cell liaison</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify final external/internal marking weightages. Perform automated grade point averaging (SGPA/CGPA) calculations across current student cohorts.
            </p>
          </div>
          <div className="space-y-2 mt-4">
            <button
              onClick={handleComputeResults}
              className="w-full py-2.5 rounded-xl bg-gradient-primary text-white flex items-center gap-2.5 justify-center text-xs font-bold shadow-soft cursor-pointer"
            >
              <RefreshCw className="size-4 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Compute Results &amp; CGPA</span>
            </button>
            <button
              onClick={() => {
                toast.success("Semester Timetable Audit log generated! 0 conflicts found.");
              }}
              className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <FileText className="size-4 text-slate-500" />
              <span>Audit Timetable Conflicts</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
