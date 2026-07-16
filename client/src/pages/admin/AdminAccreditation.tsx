import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  FileText,
  Shield,
  Download,
  CheckCircle,
  Clock,
  Sliders,
  RefreshCw
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminAccreditation() {
  const [naacCriteria, setNaacCriteria] = useState([
    { id: "CRT-1", name: "Curricular Aspects", score: "3.90/4.00", progress: 95 },
    { id: "CRT-2", name: "Teaching-Learning & Evaluation", score: "3.85/4.00", progress: 92 },
    { id: "CRT-3", name: "Research, Innovations & Extension", score: "3.60/4.00", progress: 78 },
    { id: "CRT-4", name: "Infrastructure & Learning Resources", score: "3.95/4.00", progress: 98 },
    { id: "CRT-5", name: "Student Support & Progression", score: "3.75/4.00", progress: 85 },
    { id: "CRT-6", name: "Governance, Leadership & Management", score: "3.80/4.00", progress: 88 }
  ]);

  const [nbaStatus, setNbaStatus] = useState([
    { course: "B.Tech Computer Science & Eng", status: "Accredited (Tier-1)", validity: "Until 2028" },
    { course: "B.Tech Electronics & Comm Eng", status: "Accredited (Tier-1)", validity: "Until 2027" },
    { course: "B.Tech Electrical & Electronics Eng", status: "Re-evaluation Pending", validity: "Expired Nov 2025" }
  ]);

  const handleGenerateSSR = () => {
    toast.loading("Compiling self-study report indices and verification documents...", { duration: 1500 });
    setTimeout(() => {
      toast.success("NAAC Self-Study Report (SSR) Draft successfully generated! 14 chapters compiled.");
    }, 1600);
  };

  const handleOBESync = () => {
    toast.success("Outcome-Based Education (OBE) Course Outcomes (CO) mapping verified against Program Outcomes (PO) successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accreditation &amp; Standards Compliance"
        desc="Audit institutional quality benchmarks, monitor NAAC Criteria compliance scores, and review NBA Outcome-Based Education (OBE) portfolios."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="NAAC Cumulative Grade"
          value="A++ (3.82 CGPA)"
          change="Highest quality rating"
          icon={Award}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="NBA Tier-1 Courses"
          value="2 Accredited"
          change="1 department pending review"
          icon={BookOpen}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="NIRF Ranking Band"
          value="Top 150"
          change="Ranked #134 engineering college"
          icon={Sliders}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="AICTE Roster Status"
          value="Active Approval"
          change="Extension of approval (EOA) locked"
          icon={Shield}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* NAAC Criteria */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">NAAC Criteria Progress Checklist</h3>
              <p className="text-[10px] text-slate-500">Quality score compliance breakdown across 6 Criteria modules.</p>
            </div>
            <button
              onClick={handleGenerateSSR}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="size-3.5" /> Compile NAAC SSR Report
            </button>
          </div>
          <div className="space-y-3.5">
            {naacCriteria.map(row => (
              <div key={row.id} className="text-xs space-y-1.5 p-3 border rounded-xl bg-slate-50/50">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{row.id}: {row.name}</span>
                  <span className="font-mono text-indigo-700 font-bold">{row.score} (Complied: {row.progress}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${row.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* NBA OBE and CO-PO mappings */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">NBA OBE Department Status</h3>
            <div className="space-y-3">
              {nbaStatus.map(row => (
                <div key={row.course} className="p-3 border rounded-xl space-y-1 text-xs hover:bg-slate-50 transition">
                  <div className="font-bold text-slate-800 leading-tight">{row.course}</div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span className="font-semibold">{row.status}</span>
                    <span>{row.validity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 mt-6">
            <button
              onClick={handleOBESync}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 justify-center cursor-pointer"
            >
              <RefreshCw className="size-4" />
              <span>Verify CO-PO OBE Mappings</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default AdminAccreditation;
