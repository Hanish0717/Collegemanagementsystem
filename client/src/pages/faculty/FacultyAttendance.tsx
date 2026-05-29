import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, QrCode, Save, Search } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { attendanceStudents, weeklyAttendance } from "@/mock/facultyData";
import api from "@/lib/api";

export function FacultyAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState("Data Structures");
  const [students, setStudents] = useState<any[]>(attendanceStudents);
  const [studentDbId, setStudentDbId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Find the student profile ID of CS2026101 by checking seeded attendance records
  useEffect(() => {
    const findStudentId = async () => {
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const res = await api.get("/api/attendance/class", {
          params: {
            department: "CSE",
            semester: 5,
            section: "A",
            subject: "Data Structures",
            date: yesterday
          }
        });
        if (res.data?.success && res.data?.data && res.data.data.length > 0) {
          const record = res.data.data.find((r: any) => r.student?.rollNumber === "CS2026101");
          if (record && record.student && record.student._id) {
            setStudentDbId(record.student._id);
          }
        }
      } catch (err) {
        console.error("Error finding student profile ID:", err);
      }
    };
    findStudentId();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/api/attendance/class", {
        params: {
          department: "CSE",
          semester: 5,
          section: "A",
          subject: selectedSubject,
          date: selectedDate
        }
      });
      if (res.data?.success && res.data?.data) {
        const records = res.data.data;
        if (records.length > 0) {
          const mapped = attendanceStudents.map(mockStudent => {
            const match = records.find((r: any) => r.student?.rollNumber === mockStudent.id);
            if (match) {
              return {
                ...mockStudent,
                dbId: match._id,
                studentId: match.student?._id,
                status: match.status.charAt(0).toUpperCase() + match.status.slice(1),
                remarks: match.remarks || ""
              };
            }
            return mockStudent;
          });
          setStudents(mapped);
        } else {
          setStudents(attendanceStudents.map(s => ({ ...s, dbId: undefined })));
        }
      }
    } catch (err) {
      console.error("Error fetching class attendance:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedSubject]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleRemarksChange = (id: string, newRemarks: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, remarks: newRemarks } : s));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const student of students) {
        if (student.id === "CS2026101") {
          const targetId = student.studentId || studentDbId;
          if (targetId) {
            if (student.dbId) {
              await api.put(`/api/attendance/${student.dbId}`, {
                status: student.status.toLowerCase(),
                remarks: student.remarks
              });
            } else {
              await api.post("/api/attendance/mark", {
                student: targetId,
                subject: selectedSubject,
                date: selectedDate,
                status: student.status.toLowerCase(),
                department: "CSE",
                semester: 5,
                section: "A",
                remarks: student.remarks
              });
            }
          }
        }
      }
      alert("Attendance saved successfully!");
      fetchAttendance();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        desc="Record daily attendance for students with QR scanning and status tracking."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: students.length.toString(), tone: "info" as const },
          { label: "Present", value: presentCount.toString(), tone: "success" as const },
          { label: "Absent", value: absentCount.toString(), tone: "danger" as const },
          { label: "Late", value: lateCount.toString(), tone: "warn" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Today</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" 
            />
          </div>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm" />
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attendance List</h3>
            <Badge tone="info">{selectedSubject}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Student ID", "Student Name", "Department", "Attendance Status", "Remarks"].map(column => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4"><Badge tone="info">{student.department}</Badge></td>
                    <td className="py-3 px-4">
                      <select 
                        value={student.status} 
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className="rounded-lg border bg-background px-3 py-1.5 text-xs"
                      >
                        {["Present", "Absent", "Late"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        value={student.remarks} 
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        placeholder="Add remarks" 
                        className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 glow-primary disabled:opacity-50"
            >
              <Save className="size-4" /> {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="size-5 text-indigo" />
            <h3 className="font-semibold">QR Attendance</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-white rounded-xl border-2 border-dashed border-primary flex items-center justify-center">
                <QrCode className="size-16 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">Scan to mark attendance</div>
            </div>
            <div className="text-center text-sm">
              <div className="font-medium">Class: {selectedSubject}</div>
              <div className="text-muted-foreground">Date: {selectedDate}</div>
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Generate New QR
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Attendance Analytics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyAttendance.map(day => (
            <div key={day.day} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">{day.day}</div>
              <div className="text-2xl font-bold mt-2">{day.percentage}%</div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-600">{day.present} present</span>
                <span className="text-rose-600">{day.absent} absent</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
