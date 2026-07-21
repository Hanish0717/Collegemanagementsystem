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
  RefreshCw,
  FileCheck,
  FolderOpen
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminAccreditation() {
  const [activeTab, setActiveTab] = useState<"dash" | "aqar" | "ssr">("dash");

  const [aqarReports, setAqarReports] = useState([
    { id: "AQAR-2024-25", academicYear: "2024-25", compiledBy: "Dr. Srinivas Rao", status: "Submitted", submissionDate: "2025-06-20" },
    { id: "AQAR-2025-26", academicYear: "2025-26", compiledBy: "Mrs. Ananya Sen", status: "Drafting", submissionDate: "Pending (Due Dec 2026)" }
  ]);

  const [ssrDocs, setSsrDocs] = useState([
    { id: "SSR-DOC-001", criteria: "Criteria 1.1.3", title: "Syllabus revision documents & board minutes", file: "BoardMinutes_2025.pdf", status: "Approved" },
    { id: "SSR-DOC-002", criteria: "Criteria 2.2.1", title: "Student-computer ratio verification statement", file: "ComputerInventory_2026.pdf", status: "Awaiting Review" }
  ]);
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
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto mb-4">
        {[
          { id: "dash", label: "Accreditation Dash", icon: Award },
          { id: "aqar", label: "AQAR Annual Report", icon: FileCheck },
          { id: "ssr", label: "SSR Verification Docs", icon: FolderOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "dash" && (
        <>
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
        </>
      )}

      {/* AQAR ANNUAL REPORT */}
      {activeTab === "aqar" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Annual Quality Assurance Report (AQAR) Submissions</h3>
            <button
              onClick={() => {
                toast.loading("Generating full AQAR compilation...", { duration: 1000 });
                setTimeout(() => {
                  const newReport = {
                    id: `AQAR-2026-27`,
                    academicYear: "2026-27",
                    compiledBy: "Dr. Srinivas Rao",
                    status: "Drafting",
                    submissionDate: "Awaiting Review"
                  };
                  setAqarReports([newReport, ...aqarReports]);
                  toast.success("AQAR 2026-27 compiled to draft!");
                }, 1100);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Compile AQAR
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Report ID</th>
                  <th className="text-left pb-2">Academic Year</th>
                  <th className="text-left pb-2">Coordinator / Compiler</th>
                  <th className="text-center pb-2">Status</th>
                  <th className="text-right pb-2">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aqarReports.map(report => (
                  <tr key={report.id}>
                    <td className="py-3 font-mono font-bold text-rose-600">{report.id}</td>
                    <td className="py-3 font-bold text-slate-800">{report.academicYear}</td>
                    <td className="py-3 font-semibold text-slate-600">{report.compiledBy}</td>
                    <td className="py-3 text-center">
                      <Badge tone={report.status === "Submitted" ? "success" : "warn"}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500 font-semibold">{report.submissionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SSR VERIFICATION DOCUMENTS */}
      {activeTab === "ssr" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Self-Study Report (SSR) Supporting Data Vault</h3>
            <Badge tone="success">Ready for Peer Team Visit</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Doc ID</th>
                  <th className="text-left pb-2">Criteria / Metric</th>
                  <th className="text-left pb-2">Document Description</th>
                  <th className="text-left pb-2">File Name</th>
                  <th className="text-right pb-2">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ssrDocs.map(doc => (
                  <tr key={doc.id}>
                    <td className="py-3 font-mono font-bold text-slate-400">{doc.id}</td>
                    <td className="py-3 font-bold text-indigo-700">{doc.criteria}</td>
                    <td className="py-3 text-slate-600 font-semibold">{doc.title}</td>
                    <td className="py-3 font-mono text-slate-500 font-semibold">{doc.file}</td>
                    <td className="py-3 text-right">
                      {doc.status === "Approved" ? (
                        <Badge tone="success">Verified &amp; Approved</Badge>
                      ) : (
                        <button
                          onClick={() => {
                            setSsrDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "Approved" } : d));
                            toast.success(`Document ${doc.id} approved for SSR!`);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition"
                        >
                          Approve Doc
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
    </div>
  );
}
export default AdminAccreditation;
