import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/dashboard/ui";

interface SubjectResult {
  code: string;
  name: string;
  credits: number;
  internal: number;
  midSem: number;
  endSem: number;
  total: number;
  grade: string;
}

export function StudentResults() {
  const [examType, setExamType] = useState("");
  const [viewType, setViewType] = useState("All Semesters");
  const [showResults, setShowResults] = useState(false);

  // Realistic subject results data for Semester 6
  const subjectResults: SubjectResult[] = [
    { code: "R23MSCST015", name: "Web Technologies", credits: 3, internal: 28, midSem: 27, endSem: 42, total: 97, grade: "A+" },
    { code: "R23MSCST016", name: "OOAD and Design Patterns", credits: 3, internal: 26, midSem: 25, endSem: 38, total: 89, grade: "A" },
    { code: "R23MSCST017", name: "Microprocessors and Interfacing", credits: 3, internal: 29, midSem: 28, endSem: 41, total: 98, grade: "A+" },
    { code: "R23MBMCT006", name: "Business Analysis", credits: 3, internal: 25, midSem: 24, endSem: 36, total: 85, grade: "A" },
    { code: "R23MSCST020", name: "Statistical and Predictive Analytics", credits: 3, internal: 30, midSem: 29, endSem: 43, total: 102, grade: "O" },
    { code: "R23MSCSL008", name: "Web Technologies Lab", credits: 1.5, internal: 27, midSem: 26, endSem: 39, total: 92, grade: "A+" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examType) return;
    setShowResults(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Centered Exam Results Select Card */}
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md">
        {/* Navy Blue Styled Header Bar */}
        <div className="bg-[#1e3a8a] text-white px-6 py-4 text-center font-bold text-base tracking-wide">
          Exam Results
        </div>

        <form onSubmit={handleSearch} className="p-6 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold">
              Select Exam Type <span className="text-red-500">*</span>
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-950 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">Select Exam Type</option>
              <option value="Regular">Regular End-Sem Exams</option>
              <option value="Supplementary">Supplementary Exams</option>
              <option value="Revaluation">Revaluation Exams</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold">View Type</label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-950 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All Semesters">All Semesters</option>
              <option value="Single Semester">Single Semester</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-[#1e3a8a] text-white hover:bg-blue-900 rounded-xl text-xs font-extrabold shadow transition active:scale-95"
          >
            Get Results
          </button>
        </form>
      </div>

      {/* Table Shown After Select & Search */}
      {showResults && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Exam Results Details: {examType} ({viewType})
            </h3>
            <Badge tone="success">CGPA: 8.13</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Subject Code</th>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Internal</th>
                  <th className="p-3">Mid-Sem</th>
                  <th className="p-3">End-Sem</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjectResults.map((result, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono font-bold text-indigo-650">{result.code}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{result.name}</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{result.credits}</td>
                    <td className="p-3 font-mono text-slate-500">{result.internal}</td>
                    <td className="p-3 font-mono text-slate-500">{result.midSem}</td>
                    <td className="p-3 font-mono text-slate-500">{result.endSem}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{result.total}</td>
                    <td className="p-3">
                      <span className="bg-[#e2f0d9] text-[#385723] font-bold px-2.5 py-0.5 rounded text-[10px] tracking-wide select-none">
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
