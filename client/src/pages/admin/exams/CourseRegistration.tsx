import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BookOpen, 
  PlusCircle, 
  BarChart2, 
  Award, 
  FileSpreadsheet, 
  Filter, 
  CheckCircle,
  Building,
  GraduationCap,
  Users,
  Loader2,
  Trash2
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  course_type: string;
  department: string;
  year: number;
  semester: number;
  registration_count?: number;
  mentor?: { id: string; full_name: string };
}

interface AnalyticsData {
  courses: Course[];
  departmentBreakdown: { department: string; count: number }[];
  semesterBreakdown: { semester: string; count: number }[];
  examStats?: {
    totalExamRegistrations: number;
    deptExamBreakdown: { department: string; registeredCount: number; totalStudents: number }[];
  };
}

export function CourseRegistration() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"courses" | "exams">("courses");
  const [selectedDept, setSelectedDept] = useState<string>("CSE");
  const [selectedYear, setSelectedYear] = useState<string>("3");
  const [selectedSem, setSelectedSem] = useState<string>("5");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("3.0");
  const [courseType, setCourseType] = useState("Normal Subject");
  const [mentorId, setMentorId] = useState("");

  // Fetch faculty list for the selected department
  const { data: facultyList = [] } = useQuery({
    queryKey: ["exams-faculty", selectedDept],
    queryFn: async () => {
      const { data } = await api.get(`/api/exams/faculty?department=${selectedDept}`);
      return data.data || [];
    },
    enabled: !!selectedDept
  });

  // Auto-set the first mentor when faculty list changes
  useEffect(() => {
    if (facultyList.length > 0) {
      setMentorId(facultyList[0].id);
    } else {
      setMentorId("");
    }
  }, [facultyList]);

  // Fetch course analytics and listings
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["course-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/api/exams/courses/analytics");
      return data.data;
    }
  });

  // Fetch cohort offered courses
  const { data: cohortCoursesList = [], isLoading: isCohortLoading, refetch: refetchCohort } = useQuery<Course[]>({
    queryKey: ["offered-courses-cohort", selectedDept, selectedYear, selectedSem],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Course[] }>(
        `/api/exams/courses?department=${selectedDept}&year=${selectedYear}&semester=${selectedSem}`
      );
      return data.data || [];
    }
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/api/exams/courses", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["offered-courses-cohort", selectedDept, selectedYear, selectedSem] });
      toast.success("New course offered successfully!");
      setCourseCode("");
      setCourseName("");
      setShowAddForm(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to offer course.");
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await api.delete(`/api/exams/courses/${courseId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["offered-courses-cohort", selectedDept, selectedYear, selectedSem] });
      toast.success("Subject deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete subject.");
    }
  });

  const handleDeleteCourse = (courseId: string, courseCode: string) => {
    if (window.confirm(`Are you sure you want to remove subject ${courseCode}? This will also delete any related student registrations!`)) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const getSemestersForYear = (yr: string) => {
    switch (yr) {
      case "1": return [1, 2];
      case "2": return [3, 4];
      case "3": return [5, 6];
      case "4": return [7, 8];
      default: return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName) {
      toast.error("Please fill in course code and name.");
      return;
    }

    createCourseMutation.mutate({
      course_code: courseCode.trim().toUpperCase(),
      course_name: courseName.trim(),
      credits: parseFloat(credits),
      course_type: courseType,
      department: selectedDept,
      year: parseInt(selectedYear),
      semester: parseInt(selectedSem),
      mentor_id: mentorId || null
    });
  };

  // Helper lists
  const DEPARTMENTS = ["CSE", "AIML", "AIDS", "ECE", "EEE", "MECH", "CIVIL", "IT"];
  const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

  const totalEnrollments = analytics?.courses?.reduce((acc, curr) => acc + (curr.registration_count || 0), 0) || 0;

  // Chart data formatting - Department-wise comparison for course registrations
  const courseChartData = DEPARTMENTS.map(dName => {
    const registered = analytics?.departmentBreakdown?.find(b => b.department === dName)?.count || 0;
    const offeredCount = analytics?.courses?.filter(c => c.department === dName).length || 0;
    return {
      name: dName,
      "Enrolled": registered,
      "Offered Courses": offeredCount
    };
  });

  // Chart data formatting - Department-wise comparison for exams
  const examChartData = analytics?.examStats?.deptExamBreakdown?.map(d => ({
    name: d.department,
    "Enrolled": d.registeredCount,
    "Total Students": d.totalStudents
  })) || [];

  const totalStudentsCount = analytics?.examStats?.deptExamBreakdown?.reduce((acc, curr) => acc + curr.totalStudents, 0) || 0;
  const totalExamRegs = analytics?.examStats?.totalExamRegistrations || 0;
  const avgExamRate = totalStudentsCount > 0 ? ((totalExamRegs / totalStudentsCount) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Course & Exam Enroll"
        desc="Offer new courses, manage academic semesters, assign mentors, and review student registration statistics."
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "courses"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          <BookOpen className="size-4" />
          Course Offerings & Enrollments
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "exams"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("exams")}
        >
          <Award className="size-4" />
          Exam Registration Analytics
        </button>
      </div>

      {activeTab === "courses" ? (
        <div className="space-y-8">
          {/* Analytics Stats */}
          <div className="grid md:grid-cols-4 gap-6 animate-fade-in">
            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Total Courses Offered</div>
                  <div className="text-2xl font-bold mt-2 text-indigo-650">{analytics?.courses?.length || 0}</div>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen className="size-5" />
                </div>
              </div>
              <Badge tone="info" className="mt-3">Offered Subjects</Badge>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Total Student Enrollments</div>
                  <div className="text-2xl font-bold mt-2 text-emerald-650">{totalEnrollments}</div>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="size-5" />
                </div>
              </div>
              <Badge tone="success" className="mt-3">Active registrations</Badge>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Offered Departments</div>
                  <div className="text-2xl font-bold mt-2 text-amber-650">{DEPARTMENTS.length}</div>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Building className="size-5" />
                </div>
              </div>
              <Badge tone="warn" className="mt-3">All Branches</Badge>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Active Semesters</div>
                  <div className="text-2xl font-bold mt-2 text-pink-650">{SEMESTERS.length}</div>
                </div>
                <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                  <GraduationCap className="size-5" />
                </div>
              </div>
              <Badge tone="danger" className="mt-3">Sem 1 to Sem 8</Badge>
            </Card>
          </div>

          {/* Visual Charts */}
          {courseChartData.length > 0 && (
            <Card className="p-6 border border-slate-100 bg-white shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart2 className="size-5 text-indigo-600" />
                  <h3 className="font-semibold text-base text-slate-800">Department wise Course Offerings & Enrollments Comparison</h3>
                </div>
                <Badge tone="info">Branch Comparison</Badge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Enrolled" name="Students Enrolled" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Offered Courses" name="Offered Course Count" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Main Cohort Selectors at the Top */}
          <Card className="p-4 bg-slate-50/50 border border-slate-200">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Branch / Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
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
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer"
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
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {getSemestersForYear(selectedYear).map(s => (
                    <option key={s} value={String(s)}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Main Split Grid */}
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in items-start">
            
            {/* Offered Courses Catalog */}
            <div className={showAddForm ? "lg:col-span-2" : "lg:col-span-3"}>
              <Card className="p-6 border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-5 text-indigo-600" />
                    <h3 className="font-semibold text-base text-slate-800">
                      Offered Subjects ({selectedDept} - Sem {selectedSem})
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowAddForm(prev => !prev)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow"
                  >
                    <PlusCircle className="size-4" /> {showAddForm ? "Hide Form" : "Add Subject"}
                  </button>
                </div>

                {isCohortLoading ? (
                  <div className="text-center py-12 text-muted-foreground text-sm flex flex-col justify-center items-center gap-2">
                    <Loader2 className="animate-spin text-indigo-600 size-6" />
                    <span>Loading offered subjects...</span>
                  </div>
                ) : cohortCoursesList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                    <BookOpen className="size-8 text-slate-400" />
                    <p className="font-semibold text-slate-700">No subjects offered for Sem {selectedSem} yet</p>
                    <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                      Click the <strong>"Add Subject"</strong> button on the top right to define and offer subjects for this cohort.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="bg-slate-50 text-slate-650 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-4 py-3 text-left">Code</th>
                          <th className="px-4 py-3 text-left">Course Name</th>
                          <th className="px-4 py-3 text-left">Mentor</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-center">Credits</th>
                          <th className="px-4 py-3 text-center">Registrations</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        {cohortCoursesList.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3 font-semibold text-indigo-650">{c.course_code}</td>
                            <td className="px-4 py-3 max-w-[200px] truncate font-medium" title={c.course_name}>{c.course_name}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 font-medium">{c.mentor?.full_name || "N/A"}</td>
                            <td className="px-4 py-3 text-xs text-slate-400 font-semibold">{c.course_type}</td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800">{c.credits}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-850 border border-emerald-100">
                                {c.registration_count || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteCourse(c.id, c.course_code)}
                                disabled={deleteCourseMutation.isPending}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center active:scale-90"
                                title="Delete Subject"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Offer New Course Form */}
            {showAddForm && (
              <div className="lg:col-span-1">
                <Card className="p-6 border border-slate-100 bg-white shadow-sm space-y-5">
                  <div className="flex items-center gap-1.5 border-b pb-2">
                    <PlusCircle className="size-4.5 text-indigo-600" />
                    <h3 className="font-semibold text-sm text-slate-800">Add Subject</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Branch</label>
                        <input
                          type="text"
                          value={selectedDept}
                          disabled
                          className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-slate-100 text-muted-foreground outline-none cursor-not-allowed font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Semester</label>
                        <input
                          type="text"
                          value={`Sem ${selectedSem}`}
                          disabled
                          className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-slate-100 text-muted-foreground outline-none cursor-not-allowed font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Subject Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CS302"
                        className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-background focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none font-mono"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Theory of Computation"
                        className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-background focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Credits</label>
                        <select
                          className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-background focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none cursor-pointer font-medium"
                          value={credits}
                          onChange={(e) => setCredits(e.target.value)}
                        >
                          <option value="1.5">Lab (1.5)</option>
                          <option value="3.0">Normal (3.0)</option>
                          <option value="4.0">Integrated (4.0)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Course Type</label>
                        <select
                          className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-background focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none cursor-pointer font-medium"
                          value={courseType}
                          onChange={(e) => setCourseType(e.target.value)}
                        >
                          <option value="Normal Subject">Theory</option>
                          <option value="Integrated Subject">Integrated</option>
                          <option value="Lab">Lab</option>
                          <option value="Open Elective">Open Elective</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Course Mentor</label>
                      <select
                        className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-background focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 focus:outline-none cursor-pointer font-medium text-slate-700"
                        value={mentorId}
                        onChange={(e) => setMentorId(e.target.value)}
                      >
                        {facultyList.length === 0 ? (
                          <option value="">No faculty found in this department</option>
                        ) : (
                          facultyList.map((f: any) => (
                            <option key={f.id} value={f.id}>{f.full_name}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={createCourseMutation.isPending}
                      className="w-full mt-4 bg-gradient-primary text-white rounded-xl py-3 font-bold text-xs hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-md glow-primary"
                    >
                      {createCourseMutation.isPending ? "Adding Subject..." : "Offer Subject"}
                    </button>
                  </form>
                </Card>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Exam Analytics Stats */}
          <div className="grid md:grid-cols-4 gap-6 animate-fade-in">
            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Total Exam Registrations</div>
                  <div className="text-2xl font-bold mt-2 text-indigo-650">{totalExamRegs}</div>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <CheckCircle className="size-5" />
                </div>
              </div>
              <Badge tone="info" className="mt-3">Student Exam Entries</Badge>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Total Student Strength</div>
                  <div className="text-2xl font-bold mt-2 text-slate-800">{totalStudentsCount}</div>
                </div>
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                  <Users className="size-5" />
                </div>
              </div>
              <Badge tone="success" className="mt-3">Across 9 Departments</Badge>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Exam Registration Rate</div>
                  <div className="text-2xl font-bold mt-2 text-emerald-650">{avgExamRate}%</div>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Award className="size-5" />
                </div>
              </div>
              <Badge tone="success" className="mt-3">Average progress</Badge>
            </Card>

            <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Subject Syllabus Base</div>
                  <div className="text-2xl font-bold mt-2 text-amber-650">{analytics?.courses?.length || 0}</div>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <BookOpen className="size-5" />
                </div>
              </div>
              <Badge tone="warn" className="mt-3">Offered Courses</Badge>
            </Card>
          </div>

          {/* Department dual-bar chart */}
          {examChartData.length > 0 && (
            <Card className="p-6 border border-slate-100 bg-white shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart2 className="size-5 text-indigo-600" />
                  <h3 className="font-semibold text-base text-slate-800">Department Branch Wise Exam Registration Comparison</h3>
                </div>
                <Badge tone="info">Dual Bar Metric</Badge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Enrolled" name="Registered for Exam" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Total Students" name="Total Strength" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Branch-wise Detailed Analytics Table */}
          <Card className="p-6 border border-slate-100 bg-white shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <FileSpreadsheet className="size-5 text-indigo-600" />
              <h3 className="font-semibold text-base text-slate-800">Branch wise Statistics Overview</h3>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Loading database statistics...
              </div>
            ) : examChartData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No statistics found in database.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-slate-650 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3 text-left">Branch / Department Name</th>
                      <th className="px-6 py-3 text-center">Exam Enrolled Students</th>
                      <th className="px-6 py-3 text-center">Total Strength</th>
                      <th className="px-6 py-3 text-center">Enrollment Progress Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {examChartData.map((d) => {
                      const rate = d["Total Students"] > 0 ? ((d["Enrolled"] / d["Total Students"]) * 100).toFixed(0) : "0";
                      return (
                        <tr key={d.name} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-3 font-semibold text-slate-800">{d.name}</td>
                          <td className="px-6 py-3 text-center font-semibold text-indigo-650">{d["Enrolled"]}</td>
                          <td className="px-6 py-3 text-center text-slate-500 font-medium">{d["Total Students"]}</td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full rounded-full transition-all" 
                                  style={{ width: `${rate}%` }} 
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
