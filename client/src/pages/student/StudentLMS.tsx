import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  FileText,
  Video,
  Download,
  PlayCircle,
  Clock,
  Award,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Badge, Card } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

export interface SubjectLMSItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
  progress: number;
  programName?: string;
  semNo?: number | string;
  type?: string;
  credits?: number | string;
  materials?: any[];
  assignments?: any[];
}

export function StudentLMS() {
  const [courses, setCourses] = useState<SubjectLMSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLmsData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/student-module/lms");
      if (res.data?.success && res.data?.courses) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error("Error fetching LMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLmsData();
  }, []);

  // Filter courses based on search query
  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">

        <button onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Sparkles className="size-3.5 text-indigo-500" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Subject Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f5f7] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <SlidersHorizontal className="size-3.5 text-slate-500" />
          <span>Filters</span>
        </button>
      </div>

      {/* Main LMS Courses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-20 bg-slate-50 dark:bg-slate-800/40 rounded" />
            <div className="h-20 bg-slate-50 dark:bg-slate-800/40 rounded" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Program Name</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Sem No</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Subject Name</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Type</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Faculty</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => {
                    // Fallback calculations for fields not returned directly
                    const programName = c.programName || "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)";
                    const semNo = c.semNo || "7";
                    const isLab = c.name.toLowerCase().includes("lab");
                    const type = c.type || (isLab ? "Core Lab" : "Core Theory");
                    const credits = c.credits || (isLab ? "1.5" : "3");

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                          {programName}
                        </td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                          {semNo}
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </td>
                        <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">
                          {type}
                        </td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                          {c.faculty}
                        </td>
                        <td className="p-4 font-black text-slate-900 dark:text-white">
                          {credits}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
