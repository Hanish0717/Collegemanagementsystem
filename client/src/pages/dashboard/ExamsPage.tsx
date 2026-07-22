import { useState, useEffect } from 'react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import { Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getStoredUser } from '@/services/authService';
import api from '@/lib/api';

export function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [hallTicket, setHallTicket] = useState<any>(null);
  const [examRegistrations, setExamRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser() as any;

  useEffect(() => {
    const fetchExamsAndResults = async () => {
      try {
        const [examRes, resultsRes] = await Promise.all([
          api.get('/api/exams'),
          api
            .get('/api/student-module/results')
            .catch(() => ({ data: { success: true, data: [] } })),
        ]);

        if (examRes.data?.success && examRes.data?.data) {
          setExams(examRes.data.data);
        }
        if (resultsRes.data?.success && resultsRes.data?.data) {
          setResults(resultsRes.data.data);
        }

        // Fetch any approved hall ticket via backend API
        const ticketRes = await api.get("/api/student-module/hall-ticket").catch(() => null);
        if (ticketRes?.data?.success && ticketRes.data?.data) {
          setHallTicket(ticketRes.data.data);
        }

        // Fetch student's exam registrations
        const regsRes = await api.get("/api/exams/courses/my-exam-registrations").catch(() => null);
        if (regsRes?.data?.success && regsRes.data?.data) {
          setExamRegistrations(regsRes.data.data);
        }
      } catch (err) {
        console.error('Error loading exams & results details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamsAndResults();
  }, [user?.id]);

  const handleDownloadHallTicket = () => {
    if (!hallTicket) return;
    const ticketWindow = window.open("", "_blank");
    if (!ticketWindow) return;

    const studentName = user?.fullName || "Nandamuri Kalyan";
    const rollNo = user?.rollNumber || "21311A0501";
    const dept = user?.department || "CSE";
    const examName = hallTicket.exam?.name || "Semester End Examinations";
    const seatNumber = hallTicket.seat_number || "S-587";
    const sem = hallTicket.exam?.semester || 1;

    const subjectsHtml = (examRegistrations.length > 0 ? examRegistrations : [
      { courses: { course_code: "CS501", course_name: "Data Structures & Algorithms" } },
      { courses: { course_code: "CS502", course_name: "Database Management Systems" } },
      { courses: { course_code: "CS503", course_name: "Operating Systems" } },
      { courses: { course_code: "CS504", course_name: "Computer Networks" } },
    ]).map((reg, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: center;">
        <td style="padding: 8px;">${idx + 1}</td>
        <td style="padding: 8px; font-weight: bold; font-family: monospace;">${reg.courses?.course_code || 'CS501'}</td>
        <td style="padding: 8px; text-align: left; font-weight: 600;">${reg.courses?.course_name || 'Subject'}</td>
        <td style="padding: 8px;">10:00 AM - 01:00 PM</td>
        <td style="padding: 8px; font-weight: bold; color: #1e3a8a;">HALL-${101 + idx}</td>
        <td style="padding: 8px; min-width: 90px; border-bottom: 1px italic #cbd5e1;">&nbsp;</td>
      </tr>
    `).join("");

    ticketWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hall_Ticket_${rollNo}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #0f172a; max-width: 800px; margin: auto; }
            .header { text-align: center; border-bottom: 3px double #1e293b; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; color: #1e3a8a; text-transform: uppercase; }
            .header p { margin: 3px 0; font-size: 11px; color: #475569; font-weight: 600; }
            .title-banner { background: #1e293b; color: white; text-align: center; padding: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px; margin-bottom: 20px; border-radius: 6px; }
            .info-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 15px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 15px; margin-bottom: 20px; font-size: 12px; }
            .details-col div { margin-bottom: 6px; }
            .photo-box { border: 2px border-dashed #94a3b8; height: 110px; display: flex; align-items: center; justify-content: center; text-align: center; background: #f1f5f9; border-radius: 8px; font-size: 10px; color: #64748b; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
            th { background: #f1f5f9; color: #1e293b; padding: 8px; font-weight: bold; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 10px; }
            .instructions { background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px; font-size: 10px; color: #92400e; margin-bottom: 35px; }
            .instructions h4 { margin: 0 0 4px 0; font-size: 11px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; font-weight: bold; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Autonomous College of Engineering & Technology</h1>
            <p>Approved by AICTE & Affiliated to University | Accredited by NAAC Grade 'A+'</p>
          </div>

          <div class="title-banner">OFFICIAL EXAMINATION HALL TICKET - SEMESTER ${sem}</div>

          <div class="info-grid">
            <div class="details-col">
              <div><strong>Exam Name:</strong> ${examName}</div>
              <div><strong>Student Name:</strong> ${studentName}</div>
              <div><strong>Roll Number:</strong> <span style="font-family: monospace; font-size: 13px; font-weight: bold; color: #1d4ed8;">${rollNo}</span></div>
              <div><strong>Branch / Department:</strong> ${dept}</div>
              <div><strong>Allocated Seat Number:</strong> <span style="font-family: monospace; font-size: 13px; font-weight: bold; color: #15803d;">${seatNumber}</span></div>
              <div><strong>Verification Status:</strong> APPROVED & VERIFIED</div>
            </div>
            <div class="photo-box">
              AFFIX<br/>PASSPORT<br/>PHOTO
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Course Code</th>
                <th style="text-align: left;">Course / Subject Name</th>
                <th>Time Slot</th>
                <th>Hall No.</th>
                <th>Invigilator Sign</th>
              </tr>
            </thead>
            <tbody>
              ${subjectsHtml}
            </tbody>
          </table>

          <div class="instructions">
            <h4>IMPORTANT INSTRUCTIONS TO CANDIDATES:</h4>
            1. Candidate must produce this Hall Ticket along with valid College ID Card at the Examination Hall.<br/>
            2. Candidates should be present in the examination hall at least 15 minutes before scheduled start time.<br/>
            3. Mobile phones, smart watches, programmable calculators, or any unauthorized materials are strictly prohibited.
          </div>

          <div class="signatures">
            <div>
              <br/><br/>
              ____________________________<br/>
              Candidate Signature
            </div>
            <div>
              <br/><br/>
              ____________________________<br/>
              Controller of Examinations
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    ticketWindow.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Examinations" desc="Loading examination schedule..." />
        <div className="p-8 text-center text-muted-foreground">
          Synchronizing exam timetables...
        </div>
      </div>
    );
  }

  // Format results for chart
  const performanceChartData = results.map((r) => ({
    month: r.subject || 'Subject',
    score: r.marks || 0,
  }));

  // Fallback to static subjects if student has no results yet
  const displayChartData =
    performanceChartData.length > 0
      ? performanceChartData
      : [
          { month: 'Mathematics', score: 85 },
          { month: 'Physics', score: 78 },
          { month: 'Chemistry', score: 92 },
          { month: 'Computer Science', score: 88 },
        ];

  const activeExams = exams.filter((e) => e.status === 'Published' || e.status === 'Scheduled');

  return (
    <div className="space-y-6">
      <PageHeader title="Examinations" desc="Schedules, hall tickets, results and performance." />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Exam Schedule</h3>
            <Badge tone="info">Active Timetable</Badge>
          </div>
          {activeExams.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">No active exam schedules published.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2">Exam Name</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Department</th>
                    <th className="py-2">Semester</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeExams.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-slate-50">
                      <td className="py-2.5 font-medium">{e.name}</td>
                      <td className="py-2.5">{e.type}</td>
                      <td className="py-2.5">{e.department}</td>
                      <td className="py-2.5">{e.semester}</td>
                      <td className="py-2.5">{e.start_date} - {e.end_date}</td>
                      <td className="py-2.5">
                        <Badge tone={e.status === 'Published' ? 'success' : 'info'}>{e.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Hall Ticket</div>
          {hallTicket ? (
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] opacity-75 uppercase tracking-wider font-bold">Campusly University</div>
                  <div className="font-extrabold text-base">{hallTicket.exam?.name || 'Semester Exam'}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/10">
                  <Calendar className="size-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white/10 p-3 rounded-xl border border-white/5">
                <div>
                  <div className="opacity-75 text-[10px] uppercase font-bold">Student</div>
                  <div className="font-bold truncate">{user?.fullName || 'Student'}</div>
                </div>
                <div>
                  <div className="opacity-75 text-[10px] uppercase font-bold">Seat Number</div>
                  <div className="font-mono font-bold text-amber-300">{hallTicket.seat_number}</div>
                </div>
                <div>
                  <div className="opacity-75 text-[10px] uppercase font-bold">Branch</div>
                  <div className="font-bold">{user?.department || 'General'}</div>
                </div>
                <div>
                  <div className="opacity-75 text-[10px] uppercase font-bold">Status</div>
                  <div className="font-bold text-emerald-300 uppercase">{hallTicket.status || 'APPROVED'}</div>
                </div>
              </div>

              {/* Registered Subject Listing */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[9px] uppercase opacity-75 font-bold tracking-wider">Registered Subjects</div>
                {examRegistrations.length === 0 ? (
                  <div className="text-xs italic opacity-80 py-1">No exam subjects registered yet.</div>
                ) : (
                  <div className="space-y-1 max-h-[110px] overflow-y-auto pr-0.5 custom-scrollbar">
                    {examRegistrations.map((reg) => (
                      <div key={reg.id} className="flex justify-between items-center text-[10px] bg-white/10 hover:bg-white/15 transition px-2 py-1 rounded border border-white/5">
                        <span className="font-mono font-semibold">{reg.courses?.course_code}</span>
                        <span className="truncate max-w-[130px] font-medium opacity-90">{reg.courses?.course_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleDownloadHallTicket}
                className="w-full rounded-xl bg-white text-foreground text-sm font-semibold py-2.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition active:scale-95 shadow"
              >
                <Download className="size-4" /> Download Ticket
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-muted-foreground flex flex-col justify-center items-center gap-2 h-[260px] bg-slate-50/50">
              <Calendar className="size-8 text-slate-400" />
              <div className="font-semibold text-slate-700">No Approved Hall Ticket Available</div>
              <p className="max-w-[200px] leading-relaxed">Ensure you have registered for exams, maintain &ge; 75% attendance, and clear all fee dues.</p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Performance Analytics (Subject wise Marks)</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={displayChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={10} stroke="#64748B" />
              <YAxis fontSize={10} stroke="#64748B" />
              <Tooltip />
              <Bar dataKey="score" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
