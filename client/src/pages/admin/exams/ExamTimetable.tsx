import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Plus, Save, Loader2, X } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";
import { DEPARTMENTS_LIST, getFacultyByDepartment } from "@/services/facultyProfileService";

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
          // Split by comma to extract halls array
          const rawHall = s.hall || s.halls || "Block A - Room 101";
          const hallsArray = typeof rawHall === "string" 
            ? rawHall.split(",").map((h: string) => h.trim()).filter(Boolean)
            : Array.isArray(rawHall) ? rawHall : ["Block A - Room 101"];

          return {
            subject_code: match ? match[2] : s.subject,
            subject_name: match ? match[1] : s.subject,
            date: s.date ? s.date.split("T")[0] : "",
            time_slot: s.time || "10:00 AM - 01:00 PM",
            halls: hallsArray.length > 0 ? hallsArray : ["Block A - Room 101"],
            duration: s.duration || "3 Hours",
            invigilator_branch: s.invigilator_branch || s.invigilatorBranch || "",
            invigilator_name: s.invigilator_name || s.invigilatorName || ""
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
          halls: ["Block A - Room 101"],
          duration: "3 Hours",
          invigilator_branch: "",
          invigilator_name: ""
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
        halls: ["Block A - Room 101"],
        duration: "3 Hours",
        invigilator_branch: "",
        invigilator_name: ""
      }
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlotsList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSlotChange = (index: number, field: string, val: any) => {
    const updated = [...slotsList];
    updated[index][field] = val;
    setSlotsList(updated);
  };

  const handleAddHall = (slotIndex: number) => {
    const updated = [...slotsList];
    updated[slotIndex].halls = [...updated[slotIndex].halls, ""];
    setSlotsList(updated);
  };

  const handleRemoveHall = (slotIndex: number, hallIndex: number) => {
    const updated = [...slotsList];
    updated[slotIndex].halls = updated[slotIndex].halls.filter((_, idx: number) => idx !== hallIndex);
    if (updated[slotIndex].halls.length === 0) {
      updated[slotIndex].halls = [""];
    }
    setSlotsList(updated);
  };

  const handleHallChange = (slotIndex: number, hallIndex: number, val: string) => {
    const updated = [...slotsList];
    updated[slotIndex].halls[hallIndex] = val;
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
      // Join halls array back by comma for DB storage
      hall: s.halls.filter((h: string) => h.trim().length > 0).join(", ") || "Block A - Room 101",
      duration: s.duration || "3 Hours",
      invigilator_branch: s.invigilator_branch || "",
      invigilator_name: s.invigilator_name || ""
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
            <div className="space-y-4">
              {slotsList.map((slot, idx) => (
                <div key={idx} className="relative bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4 hover:shadow-md transition duration-200">
                  {/* Header row with Delete button */}
                  <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-700 pb-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg dark:bg-indigo-950/40 dark:text-indigo-400">
                      Exam Slot #{idx + 1}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSlot(idx)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold transition cursor-pointer active:scale-95 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                      >
                        Delete Slot
                      </button>
                    )}
                  </div>

                  {/* Row 1: Subject Code, Subject Name, Exam Date */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Subject Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CS501"
                        value={slot.subject_code}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "subject_code", e.target.value)}
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 font-mono disabled:opacity-75 disabled:bg-slate-100"
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
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Exam Date</label>
                      <input
                        type="date"
                        value={slot.date ? slot.date.split("T")[0] : ""}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "date", e.target.value)}
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  {/* Row 2: Session Slot, Exam Hall, Duration */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Session Slot</label>
                      <select
                        value={slot.time_slot}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "time_slot", e.target.value)}
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 cursor-pointer disabled:opacity-75 disabled:bg-slate-100"
                      >
                        <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
                        <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Exam Halls</label>
                      <div className="space-y-2">
                        {(slot.halls || ["Block A - Room 101"]).map((hall: string, hallIdx: number) => (
                          <div key={hallIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="e.g. Block A - Room 101"
                              value={hall}
                              disabled={!isEditing}
                              onChange={(e) => handleHallChange(idx, hallIdx, e.target.value)}
                              className="w-full rounded-xl border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 disabled:opacity-75 disabled:bg-slate-100"
                            />
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleRemoveHall(idx, hallIdx)}
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                                title="Remove Hall"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleAddHall(idx)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/50 text-[10px] font-bold transition cursor-pointer dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
                          >
                            <Plus className="size-3" /> Add Hall
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 Hours"
                        value={slot.duration || ""}
                        disabled={!isEditing}
                        onChange={(e) => handleSlotChange(idx, "duration", e.target.value)}
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 font-mono disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  {/* Row 3: Branch Field, Faculty Selector (Invigilation Purpose) */}
                  <div className="grid md:grid-cols-2 gap-4 border-t border-dashed border-slate-200 dark:border-slate-700 pt-3">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Invigilator Branch</label>
                      <select
                        value={slot.invigilator_branch || ""}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const br = e.target.value;
                          handleSlotChange(idx, "invigilator_branch", br);
                          handleSlotChange(idx, "invigilator_name", ""); // reset selected faculty
                        }}
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 cursor-pointer disabled:opacity-75 disabled:bg-slate-100"
                      >
                        <option value="">-- Select Invigilator Branch --</option>
                        {DEPARTMENTS_LIST.map((d) => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Invigilator Staff Member</label>
                      <select
                        value={slot.invigilator_name || ""}
                        disabled={!isEditing || !slot.invigilator_branch}
                        onChange={(e) => handleSlotChange(idx, "invigilator_name", e.target.value)}
                        className="w-full rounded-xl border bg-background px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 cursor-pointer disabled:opacity-75 disabled:bg-slate-100"
                      >
                        <option value="">
                          {!slot.invigilator_branch ? "Choose branch first" : "-- Select Invigilator --"}
                        </option>
                        {slot.invigilator_branch &&
                          getFacultyByDepartment(slot.invigilator_branch).map((f) => (
                            <option key={f.employeeId} value={f.name}>
                              {f.name} ({f.employeeId})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
