import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, User, Loader2, Trash2, Calendar, FileText, CheckCircle, MessageSquare } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchDepartments,
  fetchTimetableSlots,
  createTimetableSlot,
  deleteTimetableSlot,
  TimetableSlot,
} from "@/services/adminService";

export function AdminTimetable() {
  const queryClient = useQueryClient();
  const subjectInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"schedule" | "syllabus" | "feedback">("schedule");

  // Syllabus Compliance Tracker State
  const [syllabusCompliance, setSyllabusCompliance] = useState([
    { id: "SYL-01", subject: "Operating Systems", faculty: "Dr. Kumar Swamy", totalWeeks: 16, weeksCompleted: 10, status: "On Track" },
    { id: "SYL-02", subject: "Database Management Systems", faculty: "Prof. Anitha Rao", totalWeeks: 16, weeksCompleted: 6, status: "Delayed" },
    { id: "SYL-03", subject: "Computer Networks", faculty: "Dr. Srinivas Rao", totalWeeks: 16, weeksCompleted: 11, status: "On Track" }
  ]);

  // Faculty Feedback Scores State
  const [feedbackScores, setFeedbackScores] = useState([
    { name: "Dr. Kumar Swamy", subject: "Operating Systems", rating: 4.8, count: 54 },
    { name: "Prof. Anitha Rao", subject: "Database Management Systems", rating: 3.9, count: 48 },
    { name: "Dr. Srinivas Rao", subject: "Computer Networks", rating: 4.6, count: 62 }
  ]);

  // Constants
  const timeSlots = ["09:00 AM", "11:00 AM", "02:00 PM"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Filter States
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedYear, setSelectedYear] = useState(3);
  const [selectedSemester, setSelectedSemester] = useState(5);
  const [selectedSection, setSelectedSection] = useState("A");

  // Form States
  const [formDay, setFormDay] = useState("Monday");
  const [formTime, setFormTime] = useState("09:00 AM");
  const [formSubject, setFormSubject] = useState("");
  const [formFacultyName, setFormFacultyName] = useState("");
  const [formRoom, setFormRoom] = useState("");

  // Queries
  const { data: deptList = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["timetable", selectedDept, selectedYear, selectedSemester, selectedSection],
    queryFn: () =>
      fetchTimetableSlots({
        department: selectedDept,
        year: selectedYear,
        semester: selectedSemester,
        section: selectedSection,
      }),
  });

  // Mutations
  const addSlotMutation = useMutation({
    mutationFn: createTimetableSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      toast.success("Slot added to weekly timetable!");
      setFormSubject("");
      setFormFacultyName("");
      setFormRoom("");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to add timetable slot");
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: deleteTimetableSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      toast.success("Timetable slot removed successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete slot");
    },
  });

  const handleAddClick = (day: string, time: string) => {
    setFormDay(day);
    setFormTime(time);
    subjectInputRef.current?.focus();
    subjectInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formFacultyName.trim() || !formRoom.trim()) {
      toast.error("Please fill in all slot details (Subject, Faculty, Room)");
      return;
    }

    addSlotMutation.mutate({
      day: formDay,
      time: formTime,
      subject: formSubject.trim(),
      facultyName: formFacultyName.trim(),
      room: formRoom.trim(),
      department: selectedDept,
      year: selectedYear,
      semester: selectedSemester,
      section: selectedSection,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Scheduling"
        desc="Manage weekly timetables, faculty allocation, classroom assignment and subject scheduling."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto mb-4">
        {[
          { id: "schedule", label: "Weekly Schedule", icon: Calendar },
          { id: "syllabus", label: "Syllabus Compliance", icon: FileText },
          { id: "feedback", label: "Faculty Feedback", icon: MessageSquare }
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

      {activeTab === "schedule" && (
        <>
          {/* Cohort Filters Card */}
          <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              {deptList.map((dept) => (
                <option key={dept._id} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Section</label>
            <input
              type="text"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value.toUpperCase())}
              placeholder="e.g. A"
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary uppercase"
            />
          </div>
        </div>
      </Card>

      {/* Grid Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gradient flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            Weekly Timetable
          </h3>
          <Badge tone="info">
            {selectedDept} - Year {selectedYear} / Sem {selectedSemester} (Sec {selectedSection})
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading weekly schedule...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Time</th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="text-center py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="py-3 px-4 font-semibold text-xs bg-gradient-soft">{time}</td>
                    {days.map((day) => {
                      const slot = slots.find(
                        (s) =>
                          s.day === day &&
                          (s.start_time === time || s.time === time)
                      );
                      return (
                        <td key={day} className="py-2 px-2 text-center min-w-[140px]">
                          {slot ? (
                            <div className="p-2.5 rounded-xl bg-gradient-soft border hover:bg-accent/40 transition cursor-pointer relative group">
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this slot?")) {
                                    deleteSlotMutation.mutate(slot._id || slot.id || "");
                                  }
                                }}
                                className="absolute top-1 right-1 p-0.5 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Remove Slot"
                              >
                                <Trash2 className="size-3" />
                              </button>
                              <div className="text-xs font-bold text-foreground line-clamp-1">
                                {slot.subject}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {slot.faculty_name || slot.faculty}
                              </div>
                              <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-1 truncate">
                                <MapPin className="size-2.5 shrink-0 text-indigo-500" />{" "}
                                {slot.room}
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddClick(day, time)}
                              className="w-full p-2 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition text-xs font-medium cursor-pointer"
                            >
                              + Add
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Dynamic Faculty Allocations */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo-500" />
            <h3 className="font-semibold text-gradient">Faculty Allocation</h3>
          </div>
          <div className="space-y-3">
            {slots.length === 0 ? (
              <div className="text-xs text-muted-foreground py-6 text-center">
                No active faculty allocations scheduled.
              </div>
            ) : (
              slots.slice(0, 5).map((slot) => (
                <div
                  key={slot._id || slot.id}
                  className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/40 transition bg-gradient-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold shrink-0 shadow-soft">
                      {slot.day.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {slot.faculty_name || slot.faculty}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{slot.subject}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone="info">{slot.start_time || slot.time}</Badge>
                    <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-md">
                      Room {slot.room}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Add Slot Form */}
        <Card>
          <h3 className="font-semibold mb-4 text-gradient">Add Schedule Slot</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4 p-4 border rounded-2xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Day</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Time Slot</label>
                <select
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Subject *</label>
                <input
                  ref={subjectInputRef}
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kumar Swamy"
                  value={formFacultyName}
                  onChange={(e) => setFormFacultyName(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 105"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addSlotMutation.isPending}
              className="w-full mt-2 px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-xs font-semibold shadow-soft hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {addSlotMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Plus className="size-4" /> Add Slot to Schedule
                </>
              )}
            </button>
          </form>
        </Card>
      </div>
        </>
      )}


      {/* SYLLABUS COMPLIANCE TRACKER */}
      {activeTab === "syllabus" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Syllabus Coverage &amp; Academic Audit</h3>
            <Badge tone="info">Accreditation Compliant</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Subject Code</th>
                  <th className="text-left pb-2">Subject</th>
                  <th className="text-left pb-2">Assigned Faculty</th>
                  <th className="text-center pb-2">Completed / Total Weeks</th>
                  <th className="text-center pb-2">Coverage %</th>
                  <th className="text-right pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syllabusCompliance.map(row => {
                  const pct = Math.round((row.weeksCompleted / row.totalWeeks) * 100);
                  return (
                    <tr key={row.id}>
                      <td className="py-3 font-mono font-bold text-indigo-700">{row.id}</td>
                      <td className="py-3 font-bold text-slate-800">{row.subject}</td>
                      <td className="py-3 font-semibold">{row.faculty}</td>
                      <td className="py-3 text-center font-bold text-slate-700">{row.weeksCompleted} / {row.totalWeeks} Weeks</td>
                      <td className="py-3 text-center font-mono font-bold text-emerald-600">{pct}%</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            if (row.weeksCompleted >= row.totalWeeks) {
                              toast.info("Syllabus is already 100% completed!");
                              return;
                            }
                            setSyllabusCompliance(prev => prev.map(s => s.id === row.id ? { ...s, weeksCompleted: s.weeksCompleted + 1 } : s));
                            toast.success(`Incremented syllabus coverage for ${row.subject}!`);
                          }}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                        >
                          + Log Week Completed
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* FACULTY FEEDBACK PORTAL */}
      {activeTab === "feedback" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Faculty Performance Feedback &amp; Review</h3>
            <button
              onClick={() => {
                toast.loading("Broadcasting feedback form reminders to student portals...", { duration: 1500 });
                setTimeout(() => {
                  toast.success("Feedback collection reminder emails sent successfully!");
                }, 1600);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Request Student Responses
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Faculty Name</th>
                  <th className="text-left pb-2">Subject Course</th>
                  <th className="text-center pb-2">Total Feedbacks Received</th>
                  <th className="text-right pb-2">Average Student Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackScores.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold text-slate-800">{row.name}</td>
                    <td className="py-3 font-semibold text-slate-600">{row.subject}</td>
                    <td className="py-3 text-center font-bold text-slate-700">{row.count} Responses</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        row.rating >= 4.5 ? "bg-emerald-100 text-emerald-800" : row.rating >= 4.0 ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        ★ {row.rating} / 5.0
                      </span>
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
