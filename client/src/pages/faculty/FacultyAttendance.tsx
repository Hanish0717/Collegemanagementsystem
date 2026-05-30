import { useState, useEffect } from "react";
import { Calendar, Save, Search, PieChart as PieChartIcon } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import api from "@/lib/api";

export function FacultyAttendance() {
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState("5");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedSubject, setSelectedSubject] = useState("Data Structures");
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [selectedTime, setSelectedTime] = useState("09:00 AM");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch subjects dynamically based on department & semester
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/api/academic/subjects", {
          params: { department: selectedDepartment }
        });
        if (res.data?.success && res.data?.data) {
          const dbSubjects = res.data.data;
          // Filter by semester
          const filtered = dbSubjects.filter((s: any) => s.semester === Number(selectedSemester));
          if (filtered.length > 0) {
            setSubjectsList(filtered);
            if (!filtered.some((sub: any) => sub.name === selectedSubject)) {
              setSelectedSubject(filtered[0].name);
            }
          } else {
            setSubjectsList(dbSubjects);
            if (dbSubjects.length > 0 && !dbSubjects.some((sub: any) => sub.name === selectedSubject)) {
              setSelectedSubject(dbSubjects[0].name);
            }
          }
        }
      } catch (err) {
        console.error("Error loading dynamic subjects:", err);
      }
    };
    fetchSubjects();
  }, [selectedDepartment, selectedSemester]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/api/attendance/class", {
        params: {
          department: selectedDepartment,
          semester: Number(selectedSemester),
          section: selectedSection,
          subject: selectedSubject,
          date: selectedDate,
          period: Number(selectedPeriod),
          time: selectedTime
        }
      });
      if (res.data?.success && res.data?.data) {
        const records = res.data.data;
        const hasDbStudents = records.some((r: any) => r.student && r.student._id);
        
        if (hasDbStudents) {
          const mapped = records.map((r: any) => ({
            id: r.student?.rollNumber || "Unknown",
            name: r.student?.fullName || "Unknown Student",
            department: r.student?.department || selectedDepartment,
            studentId: r.student?._id || r.student?.id,
            dbId: r.id || r._id,
            status: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "Present",
            remarks: r.remarks || ""
          }));
          setStudents(mapped);
        } else {
          setStudents([]); // No fake data fallback
        }
      }
    } catch (err) {
      console.error("Error fetching class attendance:", err);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDepartment, selectedSemester, selectedSection, selectedSubject, selectedDate, selectedPeriod, selectedTime]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleRemarksChange = (id: string, newRemarks: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, remarks: newRemarks } : s));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dbRecords = students
        .filter(s => s.studentId)
        .map(s => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks,
          attendanceId: s.dbId
        }));

      if (dbRecords.length === 0) {
        alert("No student records to save.");
        return;
      }

      const res = await api.post("/api/attendance/bulk-mark", {
        subject: selectedSubject,
        date: selectedDate,
        department: selectedDepartment,
        semester: Number(selectedSemester),
        section: selectedSection,
        period: Number(selectedPeriod),
        time: selectedTime,
        records: dbRecords
      });

      if (res.data?.success) {
        alert("Attendance saved successfully!");
        fetchAttendance();
      }
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      alert(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = students.filter(s => s.status === "Present").length;
  const absentCount = students.filter(s => s.status === "Absent").length;
  const lateCount = students.filter(s => s.status === "Late").length;

  const hasChartData = presentCount > 0 || absentCount > 0 || lateCount > 0;
  const chartData = hasChartData 
    ? [
        { name: "Present", value: presentCount, color: "#10B981" },
        { name: "Absent", value: absentCount, color: "#EF4444" },
        { name: "Late", value: lateCount, color: "#F59E0B" }
      ].filter(item => item.value > 0)
    : [{ name: "No marked students", value: 1, color: "#94A3B8" }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        desc="Record daily class attendance for students by branch, date, period, and time."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: students.length.toString(), tone: "info" as const },
          { label: "Present Today", value: presentCount.toString(), tone: "success" as const },
          { label: "Absent Today", value: absentCount.toString(), tone: "danger" as const },
          { label: "Late Today", value: lateCount.toString(), tone: "warn" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Selected Slot
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Department</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)} 
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
            >
              {["CSE", "ECE", "MECH", "CIVIL", "IT", "EEE"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Semester */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Semester</label>
            <select 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)} 
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
            </select>
          </div>

          {/* Section */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Section</label>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)} 
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
            >
              {["A", "B", "C"].map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)} 
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
            >
              {subjectsList.length > 0 ? (
                subjectsList.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)
              ) : (
                ["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s} value={s}>{s}</option>)
              )}
            </select>
          </div>

          {/* Period */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Period</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)} 
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={String(p)}>Period {p}</option>)}
            </select>
          </div>

          {/* Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Time</label>
            <select 
              value={selectedTime} 
              onChange={(e) => setSelectedTime(e.target.value)} 
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
            >
              {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            placeholder="Search students in class list..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm focus:outline-none" 
          />
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attendance List</h3>
            <div className="flex items-center gap-2">
              <Badge tone="info">{selectedSubject}</Badge>
              <Badge tone="success">Period {selectedPeriod}</Badge>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Student ID", "Student Name", "Department", "Attendance Status", "Remarks"].map(
                    (column) => (
                      <th
                        key={column}
                        className="text-left py-3 px-4 font-semibold text-muted-foreground"
                      >
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                      <td className="py-3 px-4 font-medium">{student.name}</td>
                      <td className="py-3 px-4">
                        <Badge tone="info">{student.department}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <select 
                          value={student.status} 
                          onChange={(e) => handleStatusChange(student.id, e.target.value)}
                          className="rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none"
                        >
                          {["Present", "Absent", "Late"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          value={student.remarks} 
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          placeholder="Add remarks" 
                          className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none" 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                      ⚠️ There are no students present in this branch, semester, or section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredStudents.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 glow-primary disabled:opacity-50"
              >
                <Save className="size-4" /> {loading ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          )}
        </Card>

        {/* Dynamic Split Pie Chart */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="size-5 text-indigo" />
              <h3 className="font-semibold">Attendance Split</h3>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Student(s)`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="text-xs text-muted-foreground font-semibold mb-1">Legend</div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Present
              </span>
              <span className="font-bold">{presentCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Absent
              </span>
              <span className="font-bold">{absentCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Late
              </span>
              <span className="font-bold">{lateCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
