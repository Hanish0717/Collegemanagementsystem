import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BookOpen, 
  CheckCircle, 
  Info, 
  Loader2, 
  Bookmark,
  FileText
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  course_type: string;
  department: string;
  year: number;
  semester: number;
  mentor?: { id: string; full_name: string };
}

interface Registration {
  id: string;
  student_id: string;
  course_id: string;
  semester: number;
  year: number;
  status: string;
  courses?: Course;
  credits?: number;
}

export function StudentCourseRegistration() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"course" | "exam">("course");
  
  // Student Profile Query
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ["student-dashboard-profile"],
    queryFn: async () => {
      const { data } = await api.get("/api/student-module/dashboard");
      return data.data?.profile;
    }
  });

  const studentProfile = profileRes;

  // Selected year and semester filter states
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Initialize filters once student profile is loaded
  useEffect(() => {
    if (studentProfile) {
      setSelectedYear(String(studentProfile.year || "3"));
      setSelectedSemester(String(studentProfile.semester || "5"));
    }
  }, [studentProfile]);

  // Fetch offered courses matching criteria
  const { data: courses = [], isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["offered-courses", studentProfile?.department, selectedYear, selectedSemester],
    queryFn: async () => {
      if (!studentProfile?.department || !selectedYear || !selectedSemester) return [];
      const { data } = await api.get(
        `/api/exams/courses?department=${studentProfile.department}&year=${selectedYear}&semester=${selectedSemester}`
      );
      return data.data || [];
    },
    enabled: !!studentProfile?.department && !!selectedYear && !!selectedSemester
  });

  // Fetch student's own registrations
  const { data: myRegistrations = [], isLoading: isRegsLoading } = useQuery<Registration[]>({
    queryKey: ["my-registrations"],
    queryFn: async () => {
      const { data } = await api.get("/api/exams/courses/my-registrations");
      return data.data || [];
    }
  });

  // Fetch student's own exam registrations
  const { data: myExamRegistrations = [], isLoading: isExamRegsLoading } = useQuery<any[]>({
    queryKey: ["my-exam-registrations"],
    queryFn: async () => {
      const { data } = await api.get("/api/exams/courses/my-exam-registrations");
      return data.data || [];
    }
  });

  // Fetch student academic results history (to calculate earned credits)
  const { data: results = [], isLoading: isResultsLoading } = useQuery<any[]>({
    queryKey: ["student-results"],
    queryFn: async () => {
      const { data } = await api.get("/api/student-module/results");
      return data.data || [];
    }
  });

  // Register course mutation
  const registerMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await api.post("/api/exams/courses/register", { courseId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["course-analytics"] });
      toast.success("Successfully registered for course!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to register.");
    }
  });

  // Register exam mutation
  const registerExamMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await api.post("/api/exams/courses/register-exam", { courseId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-exam-registrations"] });
      toast.success("Successfully registered for exam!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to register for exam.");
    }
  });

  // Register supplementary mutation
  const registerSupplementaryMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await api.post("/api/exams/supplementary/register", { courseId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-exam-registrations"] });
      toast.success("Successfully registered for supplementary exam!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to register for supplementary exam.");
    }
  });

  // Year to Semester map
  const getSemestersForYear = (yr: string) => {
    switch (yr) {
      case "1": return [1, 2];
      case "2": return [3, 4];
      case "3": return [5, 6];
      case "4": return [7, 8];
      default: return [];
    }
  };

  const handleYearChange = (yr: string) => {
    setSelectedYear(yr);
    const sems = getSemestersForYear(yr);
    if (sems.length > 0) {
      setSelectedSemester(String(sems[0]));
    }
  };

  const handleRegister = (courseId: string) => {
    registerMutation.mutate(courseId);
  };

  const handleRegisterExam = (courseId: string) => {
    registerExamMutation.mutate(courseId);
  };

  const isRegistered = (courseId: string) => {
    return myRegistrations.some(r => r.course_id === courseId);
  };

  const isExamRegistered = (courseId: string) => {
    return myExamRegistrations.some(r => r.course_id === courseId);
  };

  const handleRegisterSupplementary = (courseId: string) => {
    registerSupplementaryMutation.mutate(courseId);
  };

  const hasBacklog = (courseName: string) => {
    return results.some((r: any) => r.subject === courseName && r.grade === "F");
  };

  const activeRegistrationsCount = myRegistrations.filter(
    r => String(r.semester) === selectedSemester
  ).length;

  const totalCreditsRegistered = myRegistrations
    .filter(r => String(r.semester) === selectedSemester)
    .reduce((sum, r) => sum + Number(r.courses?.credits || r.credits || 0), 0);

  // Dynamic max limit matches offered courses credits sum
  const maxSemesterCredits = courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);

  // Earned credits filter out F grade
  const earnedCredits = results
    .filter((res: any) => res.grade && res.grade.toUpperCase() !== "F")
    .reduce((sum: number, res: any) => sum + Number(res.credits || 0), 0);

  if (isProfileLoading || isResultsLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-indigo-600 size-8" />
        <span className="ml-2 text-sm text-muted-foreground">Loading student profile...</span>
      </div>
    );
  }

  // Registered courses matching current filter to display in exam registration tab
  const registeredCoursesForSem = myRegistrations.filter(
    r => String(r.semester) === selectedSemester
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course & Exam Registration"
        desc="Enroll in academic subjects and register for course examinations. View registration statuses and credit limits."
      />

      {/* Credit Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs text-muted-foreground">Your Branch / Department</div>
          <div className="text-2xl font-bold mt-2 text-indigo-600">
            {studentProfile?.department || "Unassigned"}
          </div>
          <Badge tone="info" className="mt-3">Department Profile</Badge>
        </Card>

        <Card>
          <div className="text-xs text-muted-foreground">Total Earned Credits</div>
          <div className="text-2xl font-bold mt-2 text-emerald-600">{earnedCredits} Credits</div>
          <Badge tone="success" className="mt-3">From declared results</Badge>
        </Card>

        <Card>
          <div className="text-xs text-muted-foreground">Registered Courses (Current Sem)</div>
          <div className="text-2xl font-bold mt-2">{activeRegistrationsCount}</div>
          <Badge tone="info" className="mt-3">Completed Enrolment</Badge>
        </Card>

        <Card>
          <div className="text-xs text-muted-foreground">Total Registered Credits (Current Sem)</div>
          <div className="text-2xl font-bold mt-2">{totalCreditsRegistered} Credits</div>
          <Badge tone="warn" className="mt-3">
            Max Limit: {maxSemesterCredits > 0 ? maxSemesterCredits : 28} Credits
          </Badge>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "course"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("course")}
        >
          <BookOpen className="size-4" />
          Course Registration
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "exam"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("exam")}
        >
          <FileText className="size-4" />
          Exam Registration
        </button>
      </div>

      {/* Filters & Information Banner */}
      <div className="grid md:grid-cols-4 gap-6">
        
        {/* Filters Menu */}
        <div className="md:col-span-1">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Academic Filters</h3>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Select Year</label>
              <select
                className="w-full text-sm border rounded-lg p-2 bg-background focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Select Semester</label>
              <select
                className="w-full text-sm border rounded-lg p-2 bg-background focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {getSemestersForYear(selectedYear).map(s => (
                  <option key={s} value={String(s)}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-lg text-xs text-indigo-800 space-y-1.5">
              <div className="font-semibold flex items-center gap-1">
                <Info className="size-3.5" /> Note
              </div>
              {activeTab === "course" ? (
                <p>Courses are offered by the Exam Cell Office. Please verify subject names and codes before clicking register.</p>
              ) : (
                <p>Registering for an exam requires you to be registered for the course first. Hall tickets are generated based on registered exams.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Offered Course Catalog or Exam Registration */}
        <div className="md:col-span-3">
          {activeTab === "course" ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Bookmark className="size-5 text-indigo-600" />
                  <h3 className="font-semibold text-base">Offered Courses Catalog</h3>
                </div>
                <Badge tone="info">
                  {studentProfile?.department} - Sem {selectedSemester}
                </Badge>
              </div>

              {isCoursesLoading || isRegsLoading ? (
                <div className="flex flex-col justify-center items-center py-12 text-muted-foreground text-sm">
                  <Loader2 className="animate-spin text-indigo-600 size-6 mb-2" />
                  <span>Loading available course offerings...</span>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No courses offered by the Exam Cell Office for the selected Year & Semester.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.map((course) => {
                    const registered = isRegistered(course.id);
                    return (
                      <div 
                        key={course.id} 
                        className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                          registered 
                            ? "bg-emerald-50/30 border-emerald-200" 
                            : "bg-card hover:shadow-md hover:border-indigo-200"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                              {course.course_code}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {course.course_type}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-foreground line-clamp-1">
                            {course.course_name}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div>Credits: <span className="font-semibold text-foreground">{course.credits}</span></div>
                            <div>•</div>
                            <div>Semester: <span className="font-semibold text-foreground">{course.semester}</span></div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Mentor: <span className="font-semibold text-indigo-600">{course.mentor?.full_name || "N/A"}</span>
                          </div>
                        </div>

                        {registered ? (
                          <div className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1.5 cursor-default">
                            <CheckCircle className="size-3.5" /> Registered
                          </div>
                        ) : Number(selectedYear) < studentProfile.year ? (
                          <button
                            disabled
                            className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-muted text-muted-foreground cursor-not-allowed border"
                          >
                            Registration Closed (Past Semester)
                          </button>
                        ) : Number(selectedYear) > studentProfile.year ? (
                          <button
                            disabled
                            className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-muted text-muted-foreground cursor-not-allowed border"
                          >
                            Registration Not Open
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(course.id)}
                            disabled={registerMutation.isPending}
                            className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                          >
                            Register Course
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-indigo-600" />
                  <h3 className="font-semibold text-base">Course Exam Registration</h3>
                </div>
                <Badge tone="success">
                  Sem {selectedSemester} Exams
                </Badge>
              </div>

              {isCoursesLoading || isExamRegsLoading ? (
                <div className="flex flex-col justify-center items-center py-12 text-muted-foreground text-sm">
                  <Loader2 className="animate-spin text-indigo-600 size-6 mb-2" />
                  <span>Loading offered courses...</span>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No offered courses found for this semester.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.map((course) => {
                    const examReg = isExamRegistered(course.id);
                    return (
                      <div 
                        key={course.id} 
                        className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                          examReg 
                            ? "bg-emerald-50/30 border-emerald-200" 
                            : "bg-card hover:shadow-md hover:border-indigo-200"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                              {course.course_code}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {course.course_type}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-foreground line-clamp-1">
                            {course.course_name}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div>Credits: <span className="font-semibold text-foreground">{course.credits}</span></div>
                            <div>•</div>
                            <div>Semester: <span className="font-semibold text-foreground">{course.semester}</span></div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Mentor: <span className="font-semibold text-indigo-600">{course.mentor?.full_name || "N/A"}</span>
                          </div>
                        </div>

                        {examReg ? (
                          <div className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1.5 cursor-default">
                            <CheckCircle className="size-3.5" /> Exam Registered
                          </div>
                        ) : hasBacklog(course.course_name) ? (
                          <button
                            onClick={() => handleRegisterSupplementary(course.id)}
                            disabled={registerSupplementaryMutation.isPending}
                            className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-amber-600 text-white hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {registerSupplementaryMutation.isPending ? "Registering..." : "Register Supplementary Exam"}
                          </button>
                        ) : Number(selectedYear) < studentProfile.year ? (
                          <button
                            disabled
                            className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-muted text-muted-foreground cursor-not-allowed border"
                          >
                            Exam Registration Closed
                          </button>
                        ) : Number(selectedYear) > studentProfile.year ? (
                          <button
                            disabled
                            className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-muted text-muted-foreground cursor-not-allowed border"
                          >
                            Exam Registration Not Open
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterExam(course.id)}
                            disabled={registerExamMutation.isPending}
                            className="w-full mt-4 py-2 px-3 rounded-lg font-semibold text-xs bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {registerExamMutation.isPending ? "Registering..." : "Register for Exam"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

