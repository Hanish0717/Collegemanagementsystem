import { useState, useEffect } from "react";
import { Plus, BookOpen, Brain, Users, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { trainingPrograms as mockTrainingPrograms } from "@/mock/mockData";

interface TrainingProgramItem {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  enrolledStudents: number;
  completed: number;
  passPercentage: number;
}

export function PlacementTraining() {
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgramItem[]>(mockTrainingPrograms);
  const [loading, setLoading] = useState(true);

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
            <span className="text-sm font-medium">{program.duration} min</span>
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
          <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
            View Details
          </button>
          <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
            Edit
          </button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Assessments"
        desc="Manage aptitude tests, mock interviews and training programs."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
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
                    <td className="py-3 px-4 text-center">{program.duration} min</td>
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
        <h3 className="font-semibold mb-4">Schedule New Training Program</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-gradient-soft">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Program Name</label>
              <input
                placeholder="Enter program name"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Program Type</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option>Assessment</option>
                <option>Training</option>
                <option>Mock Interview</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Date</label>
              <input
                type="date"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Time</label>
              <input
                type="time"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Duration (minutes)</label>
              <input
                type="number"
                placeholder="120"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Capacity</label>
              <input
                type="number"
                placeholder="300"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <textarea
              placeholder="Program description and instructions"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
            Schedule Program
          </button>
        </div>
      </Card>

      {/* Quick Stats */}
      {!loading && (
        <Card>
          <h3 className="font-semibold mb-4">Summary Statistics</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-muted-foreground">Average Pass Rate</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">81.5%</div>
              <div className="text-xs text-muted-foreground mt-2">↑ 5% from last month</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-xs text-muted-foreground">Total Participation</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">1,245</div>
              <div className="text-xs text-muted-foreground mt-2">Across all programs</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xs text-muted-foreground">Avg Completion</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">87.3%</div>
              <div className="text-xs text-muted-foreground mt-2">Students completing programs</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
