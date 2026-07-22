import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Award, TrendingUp, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import api from "@/lib/api";

const gradePointScale: Record<string, number> = {
  "O": 10.0,
  "A+": 9.0,
  "A": 8.0,
  "B+": 7.0,
  "B": 6.0,
  "C": 5.0,
  "F": 0.0
};

export function StudentResults() {
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [cgpa, setCgpa] = useState("0.00");
  const [sgpa, setSgpa] = useState("0.00");
  const [totalCredits, setTotalCredits] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get("/api/student-module/results");
        if (res.data?.success && res.data?.data) {
          const dbResults = res.data.data || [];
          setResultsList(dbResults);
          if (res.data.student) {
            setStudentInfo(res.data.student);
          }

          // Calculate SGPA and CGPA based on 10-Point Scale
          let totalPts = 0;
          let totalCreds = 0;

          dbResults.forEach((r: any) => {
            const credits = r.credits || 4;
            const grade = r.grade || "C";
            const gp = r.grade_point !== undefined ? Number(r.grade_point) : (gradePointScale[grade] || 5.0);

            totalPts += gp * credits;
            totalCreds += credits;
          });

          const calculatedCgpa = totalCreds > 0 ? (totalPts / totalCreds).toFixed(2) : "0.00";
          setCgpa(calculatedCgpa);
          setSgpa(calculatedCgpa);
          setTotalCredits(String(totalCreds));
        }
      } catch (err) {
        console.error("Error loading student results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Generate Official Printable Grade Memo PDF Window
  const handleDownloadMemo = () => {
    const memoWindow = window.open("", "_blank");
    if (!memoWindow) return;

    const studentName = studentInfo?.full_name || "Saikiran";
    const rollNo = studentInfo?.roll_number || "21311A0501";
    const dept = studentInfo?.department || "CSE";
    const sem = studentInfo?.semester || 5;

    const rowsHtml = resultsList.map((r, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: center;">
        <td style="padding: 10px; text-align: left; font-weight: bold;">${idx + 1}. ${r.subject || 'End Semester Exam'}</td>
        <td style="padding: 10px;">${r.credits || 4}</td>
        <td style="padding: 10px;">${r.internal_marks ?? 0} / 30</td>
        <td style="padding: 10px;">${r.external_marks ?? 0} / 70</td>
        <td style="padding: 10px; font-weight: bold;">${r.total_marks ?? r.marks ?? 0} / 100</td>
        <td style="padding: 10px; font-weight: bold; color: ${r.grade === 'F' ? '#e11d48' : '#15803d'};">${r.grade || 'C'}</td>
        <td style="padding: 10px; font-weight: bold;">${r.status === 'Pass' || r.grade !== 'F' ? 'PASS' : 'FAIL'}</td>
      </tr>
    `).join("");

    memoWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grade_Memo_${rollNo}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; max-width: 850px; margin: auto; }
            .header { text-align: center; border-bottom: 3px double #1e293b; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; font-size: 24px; color: #1e3a8a; text-transform: uppercase; tracking: 1px; }
            .header p { margin: 4px 0; font-size: 12px; color: #475569; font-weight: 600; }
            .student-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px 20px; margin-bottom: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
            .student-card div { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
            th { background: #1e293b; color: white; padding: 10px; text-transform: uppercase; font-size: 11px; }
            .gpa-box { background: #eff6ff; border: 2px solid #3b82f6; padding: 15px; border-radius: 10px; text-align: center; font-weight: bold; margin-bottom: 40px; }
            .footer { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 11px; font-weight: bold; text-align: center; }
            .seal { width: 80px; height: 80px; border: 2px dashed #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 9px; font-weight: bold; margin: auto; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Autonomous College of Engineering & Technology</h1>
            <p>Approved by AICTE, Affiliated to University | Accredited by NAAC Grade 'A+'</p>
            <p style="font-weight: bold; color: #1e293b; margin-top: 8px;">OFFICIAL SEMESTER GRADE MEMORANDUM</p>
          </div>

          <div class="student-card">
            <div><strong>Student Name:</strong> ${studentName}</div>
            <div><strong>Roll Number:</strong> ${rollNo}</div>
            <div><strong>Department:</strong> ${dept}</div>
            <div><strong>Academic Semester:</strong> Semester ${sem}</div>
            <div><strong>Regulation:</strong> R23 Regulation</div>
            <div><strong>Issue Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Course Title</th>
                <th>Credits</th>
                <th>Internal (30M)</th>
                <th>External (70M)</th>
                <th>Total (100M)</th>
                <th>Letter Grade</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="gpa-box">
            <span>SEMESTER GRADE POINT AVERAGE (SGPA): <strong style="font-size: 18px; color: #1d4ed8;">${sgpa} / 10.00</strong></span>
            <span style="margin-left: 30px;">CUMULATIVE CGPA: <strong style="font-size: 18px; color: #15803d;">${cgpa} / 10.00</strong></span>
          </div>

          <div class="footer">
            <div>
              <br/><br/>
              _______________________<br/>
              Prepared By (Verification Officer)
            </div>
            <div>
              <div class="seal">EXAM CELL<br/>OFFICIAL SEAL</div>
            </div>
            <div>
              <br/><br/>
              _______________________<br/>
              Controller of Examinations
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    memoWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Results & Academic Transcript"
        desc="View semester grades, SGPA/CGPA analytics on standard 10-Point Scale, and download official Grade Memos."
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Cumulative CGPA</div>
          <div className="text-3xl font-black mt-1 text-indigo-100">{cgpa} <span className="text-sm font-normal text-indigo-300">/ 10.0</span></div>
          <div className="text-[11px] font-semibold text-indigo-400 mt-1">10-Point Scale Scale</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Semester SGPA</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{sgpa} <span className="text-sm font-normal text-slate-400">/ 10.0</span></div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="size-3.5" /> First Class with Distinction
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Earned Credits</div>
          <div className="text-3xl font-black text-indigo-600 mt-1">{totalCredits} Credits</div>
          <div className="text-[11px] font-semibold text-indigo-600 mt-1">Across Completed Semesters</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Grade Memo</div>
          <button
            onClick={handleDownloadMemo}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Download className="size-4" /> Download Grade Memo (PDF)
          </button>
        </Card>
      </div>

      {/* Grade Ledger Table */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Semester Course Performance Ledger</h3>
            <p className="text-xs text-slate-500">Internal Mid (30M) + External End-Sem Exam (70M) = Total 100M</p>
          </div>

          <Badge tone="info" className="text-xs font-bold">
            Autonomous R23 Academic Regulation
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Course / Subject Name</th>
                <th className="px-4 py-3 text-center">Credits</th>
                <th className="px-4 py-3 text-center">Internal (30M)</th>
                <th className="px-4 py-3 text-center">External (70M)</th>
                <th className="px-4 py-3 text-center">Total (100M)</th>
                <th className="px-4 py-3 text-center">Letter Grade</th>
                <th className="px-4 py-3 text-center">Grade Points</th>
                <th className="px-4 py-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">Loading grade card...</td>
                </tr>
              ) : resultsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">No published results found for this semester.</td>
                </tr>
              ) : (
                resultsList.map((r: any, i: number) => {
                  const isPass = r.status === 'Pass' || (r.grade && r.grade !== 'F');
                  const gp = r.grade_point !== undefined ? Number(r.grade_point) : (gradePointScale[r.grade] || 5.0);
                  return (
                    <tr key={r.id || i} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-bold text-slate-900">{r.subject || 'End Semester Exam'}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-600">{r.credits || 4}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{r.internal_marks ?? 0} / 30</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{r.external_marks ?? 0} / 70</td>
                      <td className="px-4 py-3 text-center font-extrabold text-sm text-indigo-900 bg-indigo-50/50">
                        {r.total_marks ?? r.marks ?? 0} / 100
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          r.grade === 'O' || r.grade === 'A+' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          r.grade === 'A' || r.grade === 'B+' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          r.grade === 'B' || r.grade === 'C' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {r.grade || 'C'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-slate-900">{gp.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center">
                        {isPass ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            ✓ PASS
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
