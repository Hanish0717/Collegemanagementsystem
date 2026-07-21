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

  return (
    <div className="space-y-6">
      <PageHeader title="Examinations" desc="Schedules, hall tickets, results and performance." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold">Upcoming Exam Schedule</h3>
            <Badge tone="info">Active Timetable</Badge>
          </div>
          {exams.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  {['Exam Name', 'Type', 'Department', 'Semester', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3 font-semibold">{e.name}</td>
                    <td className="px-5 py-3 font-medium">{e.type}</td>
                    <td className="px-5 py-3 font-mono text-xs">{e.department}</td>
                    <td className="px-5 py-3 text-center">{e.semester}</td>
                    <td className="px-5 py-3 text-xs">
                      {new Date(e.start_date).toLocaleDateString()} &ndash;{' '}
                      {new Date(e.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          e.status === 'Upcoming'
                            ? 'info'
                            : e.status === 'Ongoing'
                              ? 'warn'
                              : 'success'
                        }
                      >
                        {e.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No upcoming examination schedule published.
            </div>
          )}
        </Card>

        <Card>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Hall Ticket
          </div>
          {hallTicket ? (
            <div className="rounded-2xl bg-gradient-primary p-5 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] opacity-80 uppercase tracking-wider">CAMPUSLY UNIVERSITY</div>
                  <div className="font-bold text-base mt-0.5 truncate max-w-[170px]">{hallTicket.exam?.name || "Semester Examination"}</div>
                </div>
                <Calendar className="size-5 opacity-80 animate-pulse" />
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/10">
                <div>
                  <div className="opacity-70 text-[9px] uppercase font-semibold">Student</div>
                  <div className="font-semibold truncate max-w-[120px]">{user?.fullName || "Student User"}</div>
                </div>
                <div>
                  <div className="opacity-70 text-[9px] uppercase font-semibold">Seat Number</div>
                  <div className="font-bold text-amber-300 truncate max-w-[120px] font-mono">{hallTicket.seat_number}</div>
                </div>
                <div>
                  <div className="opacity-70 text-[9px] uppercase font-semibold">Branch</div>
                  <div className="font-semibold truncate max-w-[120px]">{user?.department || "CSE"}</div>
                </div>
                <div>
                  <div className="opacity-70 text-[9px] uppercase font-semibold">Status</div>
                  <div className="font-bold text-emerald-300 truncate max-w-[120px]">APPROVED</div>
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
                onClick={() => alert(`Downloading Hall Ticket PDF for ${hallTicket.exam?.name}. Seat: ${hallTicket.seat_number}`)}
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
              <YAxis fontSize={12} stroke="#64748B" domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="score" fill="#9333EA" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
