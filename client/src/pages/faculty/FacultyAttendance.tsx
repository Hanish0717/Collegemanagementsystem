import { useState, useEffect } from "react";
import { Calendar, Save, Search, PieChart as PieChartIcon, Trash2, Edit, X, RefreshCw } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";
import api from "@/lib/api";

export function FacultyAttendance() {
  const [activeTab, setActiveTab] = useState<"mark" | "history">("mark");

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

  // Student specific history search state
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentHistoryRecords, setStudentHistoryRecords] = useState<any[]>([]);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<any | null>(null);

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
            remarks: r.remarks || "",
            attendancePercentage: r.student?.attendancePercentage !== undefined ? r.student.attendancePercentage : 100
          }));
          setStudents(mapped);
        } else {
          setStudents([]);
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

  const fetchStudentHistory = async (studentIdOrRoll: string) => {
    if (!studentIdOrRoll.trim()) return;
    setSearchingStudent(true);
    try {
      const studentRes = await api.get("/api/students", {
        params: { search: studentIdOrRoll }
      });
      const resolvedStudent = studentRes.data?.data?.students?.[0];
      if (resolvedStudent) {
        setSelectedStudentForHistory(resolvedStudent);
        const res = await api.get(`/api/attendance/student/${resolvedStudent._id || resolvedStudent.id}`);
        if (res.data?.success && res.data?.data) {
          const sorted = (res.data.data.records || []).map((r: any) => ({
            ...r,
            formattedDate: new Date(r.date).toISOString().split('T')[0],
            statusDisplay: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "Present"
          })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setStudentHistoryRecords(sorted);
        } else {
          setStudentHistoryRecords([]);
        }
      } else {
        alert("Student not found.");
        setStudentHistoryRecords([]);
        setSelectedStudentForHistory(null);
      }
    } catch (err) {
      console.error("Error fetching student history:", err);
      alert("Failed to load student history.");
    } finally {
      setSearchingStudent(false);
    }
  };

  const handleDeleteRecord = async (recordId: string, studentIdForReload?: string) => {
    if (!window.confirm("Are you sure you want to delete this attendance record? This will recalculate the student's attendance percentage.")) return;
    try {
      const res = await api.delete(`/api/attendance/${recordId}`);
      if (res.data?.success) {
        alert("Record deleted successfully!");
        if (studentIdForReload) {
          fetchStudentHistory(studentIdForReload);
        }
        fetchAttendance();
      }
    } catch (err: any) {
      console.error("Error deleting record:", err);
      alert(err.response?.data?.message || "Failed to delete record.");
    }
  };

  const handleUpdateRecordStatus = async (recordId: string, newStatus: string, remarks: string, studentIdForReload?: string) => {
    try {
      const res = await api.put(`/api/attendance/${recordId}`, {
        status: newStatus.toLowerCase(),
        remarks
      });
      if (res.data?.success) {
        alert("Attendance record updated successfully!");
        if (studentIdForReload) {
          fetchStudentHistory(studentIdForReload);
        }
        fetchAttendance();
      }
    } catch (err: any) {
      console.error("Error updating record:", err);
      alert(err.response?.data?.message || "Failed to update record.");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = students.filter(s => s.status === "Present").length;
  const absentCount = students.filter(s => s.status === "Absent").length;
  const lateCount = students.filter(s => s.status === "Late").length;
  const excusedCount = students.filter(s => s.status === "Excused").length;

  const hasChartData = presentCount > 0 || absentCount > 0 || lateCount > 0 || excusedCount > 0;
  const chartData = hasChartData 
    ? [
        { name: "Present", value: presentCount, color: "#10B981" },
        { name: "Absent", value: absentCount, color: "#EF4444" },
        { name: "Late", value: lateCount, color: "#F59E0B" },
        { name: "Excused", value: excusedCount, color: "#06B6D4" }
      ].filter(item => item.value > 0)
    : [{ name: "No marked students", value: 1, color: "#94A3B8" }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        desc="Mark daily slot attendance, query complete student logs, manage dynamic statuses and view trends."
      />

      {/* Tabs Layout */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab("mark")}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "mark"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Attendance History & Reports
        </button>
      </div>

      {activeTab === "mark" ? (
        /* MARK ATTENDANCE VIEW */
        <>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: students.length.toString(), tone: "info" as const },
              { label: "Present Today", value: presentCount.toString(), tone: "success" as const },
              { label: "Absent Today", value: absentCount.toString(), tone: "danger" as const },
              { label: "Excused Today", value: excusedCount.toString(), tone: "warn" as const },
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
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none" 
              />
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base">Attendance Marking Grid</h3>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{selectedSubject}</Badge>
                  <Badge tone="success">Period {selectedPeriod}</Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {["Roll Number", "Student Name", "Overall %", "Attendance Status", "Remarks"].map(
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
                      filteredStudents.map(student => {
                        const shortage = student.attendancePercentage < 75;
                        return (
                          <tr key={student.id} className={`hover:bg-accent/50 transition ${shortage ? "bg-red-50/30" : ""}`}>
                            <td className="py-3 px-4 font-medium text-xs">
                              <button
                                onClick={() => {
                                  setActiveTab("history");
                                  setStudentSearchQuery(student.id);
                                  fetchStudentHistory(student.id);
                                }}
                                title="Click to view full history"
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition text-left focus:outline-none"
                              >
                                {student.id}
                              </button>
                            </td>
                            <td className="py-3 px-4 font-medium">{student.name}</td>
                            <td className="py-3 px-4">
                              <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${shortage ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {student.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select 
                                value={student.status} 
                                onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                className="rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none"
                              >
                                {["Present", "Absent", "Late", "Excused"].map(s => <option key={s} value={s}>{s}</option>)}
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
                        );
                      })
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 glow-primary disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="size-4" /> {loading ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
              )}
            </Card>

            {/* Attendance Chart Summary */}
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
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span> Excused
                  </span>
                  <span className="font-bold">{excusedCount}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        /* ATTENDANCE HISTORY VIEW & QUERY */
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Lookup Attendance History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Search a student by name/roll number to pull their individual log, or edit slot details below.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Enter Student Roll Number or Name (e.g. 26CSE04)..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <button
                onClick={() => fetchStudentHistory(studentSearchQuery)}
                disabled={searchingStudent || !studentSearchQuery.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
              >
                {searchingStudent ? "Searching..." : "Fetch Student Log"}
              </button>
              {selectedStudentForHistory && (
                <button
                  onClick={() => {
                    setSelectedStudentForHistory(null);
                    setStudentHistoryRecords([]);
                    setStudentSearchQuery("");
                  }}
                  className="px-3 py-2.5 border rounded-xl hover:bg-accent text-sm font-semibold text-muted-foreground cursor-pointer transition"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </Card>

          {selectedStudentForHistory ? (
            /* Student specific log display */
            <Card>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-lg text-foreground">{selectedStudentForHistory.fullName}</h4>
                  <p className="text-xs text-muted-foreground">{selectedStudentForHistory.rollNumber} | {selectedStudentForHistory.department} | Semester {selectedStudentForHistory.semester}</p>
                </div>
                <div className="text-right">
                  <Badge tone={selectedStudentForHistory.attendancePercentage >= 75 ? "success" : "danger"} className="text-sm px-3 py-1 font-bold">
                    {selectedStudentForHistory.attendancePercentage}% Overall
                  </Badge>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {selectedStudentForHistory.attendancePercentage >= 75 ? "Eligible" : "Attendance Shortage"}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {["Date", "Subject", "Status", "Remarks", "Actions"].map((col) => (
                        <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {studentHistoryRecords.length > 0 ? (
                      studentHistoryRecords.map((rec) => (
                        <tr key={rec._id || rec.id} className="hover:bg-accent/50 transition">
                          <td className="py-3 px-4 font-mono text-xs">{rec.formattedDate}</td>
                          <td className="py-3 px-4 font-medium">{rec.subject}</td>
                          <td className="py-3 px-4">
                            <select
                              value={rec.statusDisplay}
                              onChange={(e) => handleUpdateRecordStatus(rec._id || rec.id, e.target.value, rec.remarks || "", selectedStudentForHistory.rollNumber)}
                              className="rounded-lg border bg-background px-2.5 py-1 text-xs focus:outline-none"
                            >
                              {["Present", "Absent", "Late", "Excused"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              defaultValue={rec.remarks || ""}
                              onBlur={(e) => {
                                if (e.target.value !== (rec.remarks || "")) {
                                  handleUpdateRecordStatus(rec._id || rec.id, rec.statusDisplay, e.target.value, selectedStudentForHistory.rollNumber);
                                }
                              }}
                              placeholder="Add remarks (tab out to save)"
                              className="rounded-lg border bg-background px-2 py-1 text-xs w-full focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteRecord(rec._id || rec.id, selectedStudentForHistory.rollNumber)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                              title="Delete record"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                          No historical attendance records found for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* CLASS SLOT HISTORY GRID */
            <Card>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-base text-foreground">Class Slot Attendance Log</h4>
                  <p className="text-xs text-muted-foreground">Modify recorded slots for {selectedSubject} on {selectedDate} below.</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone="info">{selectedDepartment} Sem {selectedSemester} - {selectedSection}</Badge>
                  <Badge tone="success">Period {selectedPeriod}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 p-4 border rounded-xl bg-gradient-soft">
                {/* Re-use slot selector within history tab for clean filtering */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)} 
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {["CSE", "ECE", "MECH", "CIVIL", "IT", "EEE"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Semester</label>
                  <select 
                    value={selectedSemester} 
                    onChange={(e) => setSelectedSemester(e.target.value)} 
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Section</label>
                  <select 
                    value={selectedSection} 
                    onChange={(e) => setSelectedSection(e.target.value)} 
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {["A", "B", "C"].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                  <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)} 
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {subjectsList.length > 0 ? (
                      subjectsList.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)
                    ) : (
                      ["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s} value={s}>{s}</option>)
                    )}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Period</label>
                  <select 
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(e.target.value)} 
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={String(p)}>Period {p}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Time</label>
                  <select 
                    value={selectedTime} 
                    onChange={(e) => setSelectedTime(e.target.value)} 
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {["Roll Number", "Student Name", "Overall %", "Current Logged Status", "Remarks", "Actions"].map((col) => (
                        <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.length > 0 ? (
                      students.map((student) => {
                        const hasRecord = !!student.dbId;
                        const shortage = student.attendancePercentage < 75;
                        return (
                          <tr key={student.id} className={`hover:bg-accent/50 transition ${shortage ? "bg-red-50/30" : ""}`}>
                            <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                            <td className="py-3 px-4 font-medium">{student.name}</td>
                            <td className="py-3 px-4">
                              <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${shortage ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {student.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                !hasRecord 
                                  ? "bg-slate-100 text-slate-600" 
                                  : student.status === "Present"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : student.status === "Absent"
                                      ? "bg-red-100 text-red-800"
                                      : student.status === "Late"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-cyan-100 text-cyan-800"
                              }`}>
                                {hasRecord ? student.status : "Not Logged"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">{student.remarks || "-"}</td>
                            <td className="py-3 px-4 flex items-center gap-2">
                              {hasRecord ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const promptStatus = window.prompt("Enter new status (Present, Absent, Late, Excused):", student.status);
                                      if (promptStatus) {
                                        const clean = promptStatus.trim();
                                        if (["Present", "Absent", "Late", "Excused"].includes(clean)) {
                                          handleUpdateRecordStatus(student.dbId, clean, student.remarks);
                                        } else {
                                          alert("Invalid status entered. Must be Present, Absent, Late, or Excused.");
                                        }
                                      }
                                    }}
                                    className="p-1 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded transition"
                                    title="Edit status inline"
                                  >
                                    <Edit className="size-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecord(student.dbId)}
                                    className="p-1 hover:bg-red-50 text-red-600 hover:text-red-800 rounded transition"
                                    title="Delete record"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">No action</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground font-medium">
                          No students enrolled in the selected class cohort.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Cell component for Recharts
function Cell(props: any) {
  const { fill, ...rest } = props;
  return <path fill={fill} {...rest} />;
}
