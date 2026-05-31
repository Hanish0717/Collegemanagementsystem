import { useState, useEffect } from "react";
import { Plus, BookOpen, Brain, Users, Loader2, X, Calendar, Clock } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { trainingPrograms as mockTrainingPrograms } from "@/mock/mockData";
import { toast } from "sonner";

interface TrainingProgramItem {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  duration: string | number;
  enrolledStudents: number;
  completed: number;
  passPercentage: number;
}

export function PlacementTraining() {
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgramItem[]>(mockTrainingPrograms);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgramItem | null>(null);

  // Form Fields States
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("Training");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("10:00 AM");
  const [formDuration, setFormDuration] = useState("120");
  const [formCapacity, setFormCapacity] = useState("300");
  const [formDescription, setFormDescription] = useState("");

  // Bottom Card Form States
  const [bottomName, setBottomName] = useState("");
  const [bottomType, setBottomType] = useState("Training");
  const [bottomDate, setBottomDate] = useState("");
  const [bottomTime, setBottomTime] = useState("");
  const [bottomDuration, setBottomDuration] = useState("");
  const [bottomCapacity, setBottomCapacity] = useState("");
  const [bottomDescription, setBottomDescription] = useState("");

  const handleScheduleProgram = (
    name: string,
    type: string,
    date: string,
    time: string,
    duration: string,
    capacity: string,
    description: string,
    isModal: boolean
  ) => {
    if (!name.trim() || !date.trim() || !time.trim() || !duration.trim()) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const newProgram: TrainingProgramItem = {
      id: `TRN_${Date.now()}`,
      name: name.trim(),
      type,
      date,
      time,
      duration: duration.toString().includes("min") ? duration : `${duration} min`,
      enrolledStudents: Math.floor(50 + Math.random() * 200),
      completed: 0,
      passPercentage: 0
    };

    setTrainingPrograms(prev => [newProgram, ...prev]);
    toast.success(`Successfully scheduled program: ${newProgram.name}!`);

    if (isModal) {
      setIsScheduleModalOpen(false);
      setFormName("");
      setFormType("Training");
      setFormDate("");
      setFormTime("10:00 AM");
      setFormDuration("120");
      setFormCapacity("300");
      setFormDescription("");
    } else {
      setBottomName("");
      setBottomType("Training");
      setBottomDate("");
      setBottomTime("");
      setBottomDuration("");
      setBottomCapacity("");
      setBottomDescription("");
    }
  };

  const handleUpdateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    if (!formName.trim() || !formDate.trim() || !formTime.trim() || !formDuration.trim()) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setTrainingPrograms(prev => prev.map(item => item.id === selectedProgram.id ? {
      ...item,
      name: formName.trim(),
      type: formType,
      date: formDate,
      time: formTime,
      duration: formDuration.toString().includes("min") ? formDuration : `${formDuration} min`
    } : item));

    setIsEditModalOpen(false);
    toast.success(`Successfully updated details for ${formName}!`);
  };

  const openEditModal = (program: TrainingProgramItem) => {
    setSelectedProgram(program);
    setFormName(program.name);
    setFormType(program.type);
    setFormDate(program.date);
    setFormTime(program.time);
    setFormDuration(program.duration.toString().replace(/[^0-9]/g, ''));
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    // Simulate API fetch delay for training dataset
    const timer = setTimeout(() => {
      setTrainingPrograms(mockTrainingPrograms);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const assessments = trainingPrograms.filter((t) => t.type === "Assessment");
  const trainings = trainingPrograms.filter((t) => t.type === "Training");
  const mocks = trainingPrograms.filter((t) => t.type === "Mock");

  const stats = [
    { label: "Total Programs", value: trainingPrograms.length, color: "bg-blue-500" },
    { label: "Trainings", value: trainings.length, color: "bg-purple-500" },
    { label: "Assessments", value: assessments.length, color: "bg-amber-500" },
    { label: "Mock Interviews", value: mocks.length, color: "bg-cyan-500" },
  ];

  const TrainingCard = ({ program }: { program: TrainingProgramItem }) => {
    const completionRate = Math.round((program.completed / program.enrolledStudents) * 100);

    return (
      <Card className="hover:-translate-y-1 transition flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">{program.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{program.date}</p>
          </div>
          <Badge
            tone={
              program.type === "Assessment"
                ? "info"
                : program.type === "Training"
                  ? "success"
                  : "warn"
            }
          >
            {program.type}
          </Badge>
        </div>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between p-2 bg-gradient-soft rounded-lg">
            <span className="text-xs text-muted-foreground">Duration</span>
            <span className="text-sm font-medium">
              {program.duration.toString().includes("min") ? program.duration : `${program.duration} min`}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gradient-soft rounded-lg">
            <span className="text-xs text-muted-foreground">Enrolled</span>
            <span className="text-sm font-medium">{program.enrolledStudents} students</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-bold text-emerald-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-gradient-soft rounded-lg">
            <span className="text-xs text-muted-foreground">Pass Rate</span>
            <span className="text-sm font-semibold text-blue-600">{program.passPercentage}%</span>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <button 
            onClick={() => {
              setSelectedProgram(program);
              setIsViewModalOpen(true);
            }}
            className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent cursor-pointer transition"
          >
            View Details
          </button>
          <button 
            onClick={() => openEditModal(program)}
            className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent cursor-pointer transition"
          >
            Edit
          </button>
        </div>
      </Card>
    );
  };

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        title="Training & Assessments"
        desc="Manage aptitude tests, mock interviews and training programs."
        actions={
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Schedule New Program
          </button>
        }
      />

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading training and assessment records...</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <div
                className={`size-12 rounded-xl ${stat.color} text-white grid place-items-center mx-auto mb-2 font-bold`}
              >
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* All Programs */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingPrograms.map((program) => (
            <TrainingCard key={program.id} program={program} />
          ))}
        </div>
      )}

      {/* Programs Table */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-4">All Programs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Program Name
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Type</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Date & Time
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Enrolled
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Completed
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Pass %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {trainingPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{program.name}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        tone={
                          program.type === "Assessment"
                            ? "info"
                            : program.type === "Training"
                              ? "success"
                              : "warn"
                        }
                      >
                        {program.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      {program.date} {program.time}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {program.duration.toString().includes("min") ? program.duration : `${program.duration} min`}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{program.enrolledStudents}</td>
                    <td className="py-3 px-4 text-center font-medium">{program.completed}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold ${program.passPercentage >= 80 ? "text-emerald-600" : "text-amber-600"}`}
                      >
                        {program.passPercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Programs by Type */}
      {!loading && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Assessments */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="size-5 text-blue-600" />
              <h3 className="font-semibold">Assessments</h3>
            </div>
            <div className="space-y-2">
              {assessments.map((program) => {
                const completionRate = Math.round(
                  (program.completed / program.enrolledStudents) * 100,
                );
                return (
                  <div
                    key={program.id}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition"
                  >
                    <div className="font-medium text-sm">{program.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{program.date}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Completion: {completionRate}%</span>
                        <span className="font-bold">
                          {program.completed}/{program.enrolledStudents}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Trainings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="size-5 text-purple-600" />
              <h3 className="font-semibold">Training Programs</h3>
            </div>
            <div className="space-y-2">
              {trainings.map((program) => {
                const completionRate = Math.round(
                  (program.completed / program.enrolledStudents) * 100,
                );
                return (
                  <div
                    key={program.id}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition"
                  >
                    <div className="font-medium text-sm">{program.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{program.date}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Completion: {completionRate}%</span>
                        <span className="font-bold">
                          {program.completed}/{program.enrolledStudents}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Mock Interviews */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Users className="size-5 text-amber-600" />
              <h3 className="font-semibold">Mock Interviews</h3>
            </div>
            <div className="space-y-2">
              {mocks.map((program) => {
                const completionRate = Math.round(
                  (program.completed / program.enrolledStudents) * 100,
                );
                return (
                  <div
                    key={program.id}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition"
                  >
                    <div className="font-medium text-sm">{program.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{program.date}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Completion: {completionRate}%</span>
                        <span className="font-bold">
                          {program.completed}/{program.enrolledStudents}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Performance Analytics */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-4">Student Performance</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { category: "Excellent (80%+)", count: 156, color: "bg-emerald-500" },
              { category: "Good (70-79%)", count: 87, color: "bg-blue-500" },
              { category: "Average (60-69%)", count: 42, color: "bg-amber-500" },
              { category: "Below Average (<60%)", count: 15, color: "bg-rose-500" },
            ].map((perf) => (
              <div key={perf.category} className="p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-2">{perf.category}</div>
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${perf.color}`} />
                  <div className="text-lg font-bold">{perf.count}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Schedule New Program */}
      <Card>
        <h3 className="font-semibold mb-4 text-left">Schedule New Training Program</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleScheduleProgram(bottomName, bottomType, bottomDate, bottomTime, bottomDuration, bottomCapacity, bottomDescription, false);
        }} className="space-y-4 p-4 border rounded-xl bg-gradient-soft text-left">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Program Name *</label>
              <input
                required
                placeholder="Enter program name"
                value={bottomName}
                onChange={(e) => setBottomName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Program Type *</label>
              <select 
                value={bottomType}
                onChange={(e) => setBottomType(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-indigo-500"
              >
                <option value="Assessment">Assessment</option>
                <option value="Training">Training</option>
                <option value="Mock">Mock Interview</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Date *</label>
              <input
                required
                type="date"
                value={bottomDate}
                onChange={(e) => setBottomDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Time *</label>
              <input
                required
                type="time"
                value={bottomTime}
                onChange={(e) => setBottomTime(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Duration (minutes) *</label>
              <input
                required
                type="number"
                placeholder="120"
                value={bottomDuration}
                onChange={(e) => setBottomDuration(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Capacity</label>
              <input
                type="number"
                placeholder="300"
                value={bottomCapacity}
                onChange={(e) => setBottomCapacity(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <textarea
              placeholder="Program description and instructions"
              value={bottomDescription}
              onChange={(e) => setBottomDescription(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500"
              rows={3}
            />
          </div>
          <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium cursor-pointer hover:opacity-95 transition">
            Schedule Program
          </button>
        </form>
      </Card>

      {/* Quick Stats */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-4 text-left">Summary Statistics</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-left">
              <div className="text-xs text-muted-foreground">Average Pass Rate</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">81.5%</div>
              <div className="text-xs text-muted-foreground mt-2">↑ 5% from last month</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-left">
              <div className="text-xs text-muted-foreground">Total Participation</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">1,245</div>
              <div className="text-xs text-muted-foreground mt-2">Across all programs</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-left">
              <div className="text-xs text-muted-foreground">Avg Completion</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">87.3%</div>
              <div className="text-xs text-muted-foreground mt-2">Students completing programs</div>
            </div>
          </div>
        </Card>
      )}
    </div>

    {/* Schedule New Program Modal */}
    {isScheduleModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative text-left">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Schedule Training Program</h3>
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleScheduleProgram(formName, formType, formDate, formTime, formDuration, formCapacity, formDescription, true);
          }} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Program Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. System Design Mock Bootcamp"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Program Type *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Assessment">Assessment Test</option>
                  <option value="Training">Training Program</option>
                  <option value="Mock">Mock Interview</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 120"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Start Time *</label>
                <input
                  type="time"
                  required
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Batch Capacity</label>
                <input
                  type="number"
                  placeholder="300"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Description & Instructions</label>
              <textarea
                placeholder="Enter details..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Schedule Program
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View Program Details Modal */}
    {isViewModalOpen && selectedProgram && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative text-left">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Program Details Brief</h3>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{selectedProgram.name}</h4>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Program ID: {selectedProgram.id}</p>
              </div>
              <Badge tone={selectedProgram.type === "Assessment" ? "info" : selectedProgram.type === "Training" ? "success" : "warn"}>
                {selectedProgram.type}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center shrink-0">
                  <Calendar className="size-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Scheduled Date</span>
                  <span className="font-bold text-slate-700">{selectedProgram.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center shrink-0">
                  <Clock className="size-4" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Start Time</span>
                  <span className="font-bold text-slate-700">{selectedProgram.time || "10:00 AM"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center shrink-0 font-bold text-xs">
                  MIN
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Session Duration</span>
                  <span className="font-bold text-slate-700">{selectedProgram.duration}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                <span className="text-[10px] text-muted-foreground block">Enrolled Students</span>
                <span className="font-extrabold text-base text-indigo-600">{selectedProgram.enrolledStudents}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                <span className="text-[10px] text-muted-foreground block">Completed</span>
                <span className="font-extrabold text-base text-emerald-600">{selectedProgram.completed}</span>
              </div>
            </div>

            {/* Completion Rates */}
            <div className="p-4 rounded-xl border border-slate-100 bg-gradient-soft space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Expected Completion Rate</span>
                <span className="text-indigo-600">{selectedProgram.enrolledStudents > 0 ? Math.round((selectedProgram.completed / selectedProgram.enrolledStudents) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${selectedProgram.enrolledStudents > 0 ? Math.round((selectedProgram.completed / selectedProgram.enrolledStudents) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(selectedProgram);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                Edit Program details
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Edit Program Modal */}
    {isEditModalOpen && selectedProgram && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150 relative text-left">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Edit Training Details</h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleUpdateProgram} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Program Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aptitude Workshop"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Program Type *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Assessment">Assessment</option>
                  <option value="Training">Training</option>
                  <option value="Mock">Mock</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 120"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Start Time *</label>
                <input
                  type="time"
                  required
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
