import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Plus, Save, Loader2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

interface Exam {
  id: string;
  name: string;
  type: string;
  department: string;
  year: number;
  semester: number;
  status: string;
}

export function ExamTimetable() {
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedYear, setSelectedYear] = useState("3");
  const [selectedSem, setSelectedSem] = useState("5");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [slotsList, setSlotsList] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch Exams List
  const { data: examsList = [], isLoading: isExamsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data || [];
    }
  });

  // Resolve active exam schedule for selected cohort
  const activeExam = examsList.find(e => 
    e.department === selectedDept && 
    Number(e.year) === Number(selectedYear) && 
    Number(e.semester) === Number(selectedSem) &&
    e.status !== "Results Published"
  );

  useEffect(() => {
    if (activeExam) {
      setSelectedExamId(activeExam.id);
    } else {
      setSelectedExamId("");
      setSlotsList([]);
    }
  }, [activeExam]);

  // Fetch subjects for this department, year, semester
  const { data: deptSubjects = [], isLoading: isSubjectsLoading } = useQuery<any[]>({
    queryKey: ["subjects", selectedDept, selectedYear, selectedSem],
    queryFn: async () => {
      if (!selectedDept || !selectedYear || !selectedSem) return [];
      const { data } = await api.get<{ success: boolean; data: any[] }>(
        `/api/exams/courses?department=${selectedDept}&year=${selectedYear}&semester=${selectedSem}`
      );
      const list = data.data || [];
      return list.map((c: any) => ({
        code: c.course_code,
        name: c.course_name,
        semester: c.semester,
        ...c
      }));
    },
    enabled: !!selectedDept && !!selectedYear && !!selectedSem
  });

  // 2. Fetch Slots for Selected Exam
  const { data: savedSlots = [], isLoading: isSlotsLoading, refetch } = useQuery<any[]>({
    queryKey: ["exams", selectedExamId, "timetable"],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const { data } = await api.get<{ success: boolean; data: any[] }>(
        `/api/exams/${selectedExamId}/timetable`
      );
      return data.data || [];
    },
    enabled: !!selectedExamId
  });

  // Keep slotsList in sync with saved slots or pre-populate if empty
  useEffect(() => {
    if (selectedExamId) {
      if (savedSlots.length > 0) {
        const formatted = savedSlots.map(s => {
          const match = s.subject.match(/^(.+?)\s*\((.+?)\)$/);
          return {
            subject_code: match ? match[2] : s.subject,
            subject_name: match ? match[1] : s.subject,
            date: s.date ? s.date.split("T")[0] : "",
            time_slot: s.time || "10:00 AM - 01:00 PM",
            hall: s.hall || "Block A - Room 101",
            duration: s.duration || "3 Hours"
          };
        });
        setSlotsList(formatted);
        setIsEditing(false); // Read-only by default if slots already exist in DB
      } else {
        const prepopulated = deptSubjects.map(s => ({
          subject_code: s.code,
          subject_name: s.name,
          date: "",
          time_slot: "10:00 AM - 01:00 PM",
          hall: "Block A - Room 101",
          duration: "3 Hours"
        }));
        setSlotsList(prepopulated);
        setIsEditing(true); // Editable by default if creating new timetable
      }
    } else {
      setSlotsList([]);
      setIsEditing(false);
    }
  }, [selectedExamId, savedSlots, deptSubjects, selectedSem]);

  // 3. Save Timetable Slots Mutation
  const saveTimetableMutation = useMutation({
    mutationFn: async ({ id, slots }: { id: string; slots: any[] }) => {
      await api.post(`/api/exams/${id}/timetable`, { slots, schedules: slots });
    },
    onSuccess: () => {
      refetch();
      setIsEditing(false);
      const isUpdate = savedSlots.length > 0;
      toast.success(isUpdate ? "Exam timetable updated and students notified successfully!" : "Exam timetable published and students notified successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save timetable slots");
    }
  });

  const handleAddSlot = () => {
    setSlotsList(prev => [
      ...prev,
      {
        subject_code: "",
        subject_name: "",
        date: "",
        time_slot: "10:00 AM - 01:00 PM",
        hall: "Block A - Room 101",
        duration: "3 Hours"
      }
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlotsList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSlotChange = (index: number, field: string, val: string) => {
    const updated = [...slotsList];
    updated[index][field] = val;
    setSlotsList(updated);
  };

  const handleSave = () => {
    if (!selectedExamId) return;
    if (slotsList.some(s => !s.subject_code || !s.subject_name || !s.date)) {
      toast.error("Please complete all subject details and dates.");
      return;
    }
    const payload = slotsList.map(s => ({
      subject: `${s.subject_name} (${s.subject_code})`,
      date: s.date,
      time: s.time_slot,
      hall: s.hall || "Block A - Room 101",
      duration: s.duration || "3 Hours"
    }));
    saveTimetableMutation.mutate({ id: selectedExamId, slots: payload });
  };

  const getSemestersForYear = (yr: string) => {
    switch (yr) {
      case "1": return [1, 2];
      case "2": return [3, 4];
      case "3": return [5, 6];
      case "4": return [7, 8];
      default: return [1, 2];
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Builder"
        desc="Schedule subject-wise theory exams, set examination sessions, and structure final timetables."
      />

      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Target Year</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                const yr = e.target.value;
                setSelectedYear(yr);
                const sems = getSemestersForYear(yr);
                if (!sems.includes(Number(selectedSem))) {
                  setSelectedSem(String(sems[0]));
                }
              }}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              {getSemestersForYear(selectedYear).map(s => (
                <option key={s} value={String(s)}>Sem {s}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {!selectedExamId ? (
        <Card className="p-8 text-center text-xs text-muted-foreground flex flex-col justify-center items-center gap-2 bg-slate-50/50 border border-dashed">
          <Calendar className="size-8 text-slate-400" />
          <div className="font-semibold text-slate-700">No Active Exam Schedule Found</div>
          <p className="max-w-[340px] leading-relaxed">
            There is no exam scheduled for {selectedDept} - Year {selectedYear}, Sem {selectedSem} yet. Please configure the exam schedule under the <strong>"Schedule Exam"</strong> console first.
          </p>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-5 text-indigo-600 animate-pulse" />
                <h3 className="font-semibold text-xs text-slate-800">Subject Exam Timings</h3>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                Active Schedule: <span className="font-semibold text-indigo-600">{activeExam?.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && savedSlots.length > 0 ? (
                <>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250 px-2.5 py-1.5 rounded-lg">
                    Timetable Published
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all cursor-pointer active:scale-95 shadow"
                  >
                    Modify Timetable
                  </button>
                </>
              ) : (
                <>
                  {savedSlots.length > 0 && (
                    <button
                      onClick={() => {
                        const formatted = savedSlots.map(s => {
                          const match = s.subject.match(/^(.+?)\s*\((.+?)\)$/);
                          return {
                            subject_code: match ? match[2] : s.subject,
                            subject_name: match ? match[1] : s.subject,
                            date: s.date ? s.date.split("T")[0] : "",
                            time_slot: s.time || "10:00 AM - 01:00 PM",
                            hall: s.hall || "Block A - Room 101",
                            duration: s.duration || "3 Hours"
                          };
                        });
                        setSlotsList(formatted);
                        setIsEditing(false);
                      }}
                      className="px-3.5 py-1.5 text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-all cursor-pointer active:scale-95 border"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleAddSlot}
                    className="px-3.5 py-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="size-3 inline mr-1" /> Add Exam Slot
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveTimetableMutation.isPending}
                    className="px-3.5 py-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow"
                  >
                    <Save className="size-3 inline mr-1" /> Save Timetable
                  </button>
                </>
              )}
            </div>
          </div>

          {isSlotsLoading || isSubjectsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Retrieving scheduled sessions...</span>
            </div>
          ) : slotsList.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No subjects or slots configured. Click 'Add Exam Slot' to structure the sessions.
            </div>
          ) : (
            <div className="space-y-3">
              {slotsList.map((slot, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-muted/30 p-3 rounded-xl border border-dashed">
                  <div className="flex-1 grid md:grid-cols-6 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Subject Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CS501"
                        value={slot.subject_code}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "subject_code", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 font-mono disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Database Management Systems"
                        value={slot.subject_name}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "subject_name", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Exam Date</label>
                      <input
                        type="date"
                        value={slot.date ? slot.date.split("T")[0] : ""}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "date", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Session Slot</label>
                      <select
                        value={slot.time_slot}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "time_slot", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 cursor-pointer disabled:opacity-75 disabled:bg-slate-100"
                      >
                        <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
                        <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Exam Hall</label>
                      <input
                        type="text"
                        placeholder="e.g. Block A - Room 101"
                        value={slot.hall || ""}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "hall", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 Hours"
                        value={slot.duration || ""}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "duration", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 font-mono disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSlot(idx)}
                      className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold transition cursor-pointer active:scale-95"
                    >
                      Delete Slot
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
