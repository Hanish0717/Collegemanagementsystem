import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle,
  Play,
  Download
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminLMS() {
  const [syllabusList, setSyllabusList] = useState([
    { code: "ML-502", subject: "Machine Learning Foundations", curriculum: "R23", semester: 5, completion: 82 },
    { code: "CD-504", subject: "Compiler Design", curriculum: "R23", semester: 5, completion: 74 },
    { code: "VL-701", subject: "VLSI System Architectures", curriculum: "R20", semester: 7, completion: 91 },
    { code: "DA-506", subject: "Design & Analysis of Algorithms", curriculum: "R23", semester: 5, completion: 85 }
  ]);

  const [resources, setResources] = useState([
    { id: "RES-101", title: "Syllabus Plan & Course Outcomes", type: "PDF Document", subject: "Machine Learning Foundations", size: "1.2 MB" },
    { id: "RES-102", title: "Introduction to Artificial Neural Networks", type: "Video Lecture", subject: "Machine Learning Foundations", size: "45 Mins" },
    { id: "RES-103", title: "Lexical Analyzer Code Templates", type: "PDF Document", subject: "Compiler Design", size: "820 KB" }
  ]);

  const [quizzes, setQuizzes] = useState([
    { id: "QZ-01", title: "Quiz 1: Neural Nets Parameters", subject: "Machine Learning Foundations", date: "July 24", questions: 15 },
    { id: "QZ-02", title: "Quiz 2: Bottom-Up Parser Trees", subject: "Compiler Design", date: "July 29", questions: 10 }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("PDF Document");
  const [newSubject, setNewSubject] = useState("Machine Learning Foundations");

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter resource title!");
      return;
    }
    const newRes = {
      id: `RES-${100 + resources.length + 1}`,
      title: newTitle,
      type: newType,
      subject: newSubject,
      size: newType === "Video Lecture" ? "30 Mins" : "1.5 MB"
    };
    setResources([newRes, ...resources]);
    toast.success(`Resource "${newTitle}" added to Course Registry!`);
    setNewTitle("");
  };

  const handleRemoveResource = (id: string, title: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    toast.warning(`Resource ${title} removed.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Management System (LMS)"
        desc="Administer curriculum schemas, upload digital syllabus documents, manage video lectures registry, and launch student quizzes."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Syllabus Subjects"
          value={String(syllabusList.length + 20)}
          change="R20 &amp; R23 curriculum schemes"
          icon={BookOpen}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Notes &amp; PDF Guides"
          value="142 resources"
          change="89% student download rate"
          icon={FileText}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Video Lectures"
          value="84 video guides"
          change="32.4 hours total content"
          icon={Video}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Quizzes Scheduled"
          value={String(quizzes.length)}
          change="Auto-graded portfolios"
          icon={HelpCircle}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Syllabus Registry */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Syllabus Completion &amp; Curricula</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Subject Code</th>
                  <th className="text-left pb-2">Subject Title</th>
                  <th className="text-center pb-2">Scheme</th>
                  <th className="text-center pb-2">Sem</th>
                  <th className="text-right pb-2">Syllabus Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syllabusList.map(row => (
                  <tr key={row.code}>
                    <td className="py-2.5 font-mono font-bold text-indigo-700">{row.code}</td>
                    <td className="py-2.5 font-bold text-slate-800">{row.subject}</td>
                    <td className="py-2.5 text-center font-bold text-slate-500">{row.curriculum}</td>
                    <td className="py-2.5 text-center font-semibold text-slate-600">Sem {row.semester}</td>
                    <td className="py-2.5 text-right w-44">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold text-slate-700">{row.completion}%</span>
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${row.completion}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add digital resource */}
        <Card>
          <h3 className="font-semibold mb-2">Upload Course Materials</h3>
          <p className="text-xs text-muted-foreground mb-4">Add new PDF guides, worksheets, or video lecture URLs.</p>
          <form onSubmit={handleAddResource} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Resource Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Unit 3: Context-Free Grammars"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Subject Course</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(newSubject)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              >
                {syllabusList.map(s => (
                  <option key={s.code} value={s.subject}>{s.subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Material Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              >
                <option value="PDF Document">PDF Document (.pdf)</option>
                <option value="Video Lecture">Video Lecture URL</option>
                <option value="Assignment Sheet">Assignment Sheet (.docx)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Publish Material Resource
            </button>
          </form>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Resources list */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Active Digital Catalog</h3>
          <div className="space-y-3">
            {resources.map(row => (
              <div key={row.id} className="p-3 border rounded-xl flex items-center justify-between text-xs bg-slate-50/50 hover:bg-slate-50 transition">
                <div>
                  <div className="font-bold text-slate-800">{row.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Course: {row.subject} • {row.type}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">{row.size}</span>
                  {row.type === "Video Lecture" ? (
                    <button
                      onClick={() => toast.info(`Playing lecture video: "${row.title}"`)}
                      className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition cursor-pointer"
                      title="Play Lecture"
                    >
                      <Play className="size-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => toast.success(`Downloaded: ${row.title}`)}
                      className="p-1 hover:bg-indigo-50 text-indigo-600 rounded transition cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveResource(row.id, row.title)}
                    className="p-1 hover:bg-rose-50 text-rose-600 rounded transition cursor-pointer"
                    title="Remove Resource"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quizzes scheduled */}
        <Card>
          <h3 className="font-semibold mb-3">Upcoming LMS Quizzes</h3>
          <div className="space-y-3">
            {quizzes.map(row => (
              <div key={row.id} className="p-3 border rounded-xl space-y-1 text-xs hover:bg-slate-50 transition">
                <div className="font-bold text-slate-800">{row.title}</div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-medium">
                  <span>Date: {row.date}</span>
                  <span>{row.questions} MCQ Questions</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default AdminLMS;
