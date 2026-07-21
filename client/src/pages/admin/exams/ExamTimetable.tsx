import { useState } from "react";
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
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [slotsList, setSlotsList] = useState<any[]>([]);

  // 1. Fetch Exams List
  const { data: examsList = [], isLoading: isExamsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data || [];
    }
  });

  // 2. Fetch Slots for Selected Exam
  const { isLoading: isSlotsLoading, refetch } = useQuery<any[]>({
    queryKey: ["exams", selectedExamId, "timetable"],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const { data } = await api.get<{ success: boolean; data: any[] }>(
        `/api/exams/${selectedExamId}/timetable`
      );
      const list = data.data || [];
      setSlotsList(list);
      return list;
    },
    enabled: !!selectedExamId
  });

  // 3. Save Timetable Slots Mutation
  const saveTimetableMutation = useMutation({
    mutationFn: async ({ id, slots }: { id: string; slots: any[] }) => {
      await api.post(`/api/exams/${id}/timetable`, { slots });
    },
    onSuccess: () => {
      refetch();
      toast.success("Exam timetable published successfully!");
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
        time_slot: "10:00 AM - 01:00 PM"
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
    saveTimetableMutation.mutate({ id: selectedExamId, slots: slotsList });
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
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Exam Schedule</label>
            {isExamsLoading ? (
              <div className="text-xs py-2 text-muted-foreground animate-pulse">Loading exams...</div>
            ) : (
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setSlotsList([]);
                }}
                className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">-- Choose Exam --</option>
                {examsList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department} - Sem {e.semester})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </Card>

      {selectedExamId && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-5 text-indigo-600" />
              <h3 className="font-semibold text-xs text-slate-800">Subject Exam Timings</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddSlot}
                className="px-3 py-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
              >
                <Plus className="size-3 inline mr-1" /> Add Exam Slot
              </button>
              <button
                onClick={handleSave}
                disabled={saveTimetableMutation.isPending}
                className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="size-3 inline mr-1" /> Save Timetable
              </button>
            </div>
          </div>

          {isSlotsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Retrieving scheduled sessions...</span>
            </div>
          ) : slotsList.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No exam slots scheduled yet. Click 'Add Exam Slot' to structure the sessions.
            </div>
          ) : (
            <div className="space-y-3">
              {slotsList.map((slot, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-muted/30 p-3 rounded-xl border border-dashed">
                  <div className="flex-1 grid md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Subject Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CS501"
                        value={slot.subject_code}
                        onChange={(e) => handleSlotChange(idx, "subject_code", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Database Management Systems"
                        value={slot.subject_name}
                        onChange={(e) => handleSlotChange(idx, "subject_name", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Exam Date</label>
                      <input
                        type="date"
                        value={slot.date ? slot.date.split("T")[0] : ""}
                        onChange={(e) => handleSlotChange(idx, "date", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Session Slot</label>
                      <select
                        value={slot.time_slot}
                        onChange={(e) => handleSlotChange(idx, "time_slot", e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 outline-none text-xs focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
                        <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveSlot(idx)}
                    className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold transition cursor-pointer"
                  >
                    Delete Slot
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
