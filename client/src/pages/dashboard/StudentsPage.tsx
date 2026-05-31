import { useState, useEffect } from "react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { students as mockStudents } from "@/mock/mockData";
import { Search, Filter, Plus, Mail, Phone, X, User, GraduationCap, Award, Calendar, Percent, AlertCircle } from "lucide-react";
import { fetchStudents, createStudent, StudentItem } from "@/services/adminService";

export function StudentsPage() {
  const [studentsList, setStudentsList] = useState<any[]>(mockStudents);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form Values
  const [formData, setFormData] = useState({
    rollNumber: "",
    fullName: "",
    email: "",
    department: "Computer Science",
    year: 3,
    semester: 5,
    section: "A",
    cgpa: 8.5,
    attendancePercentage: 92,
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    password: "password123"
  });

  // Load students from database with mock fallback
  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetchStudents();
      if (res && res.students && res.students.length > 0) {
        // Map backend StudentItem format to the local rendering format
        const formatted = res.students.map((s: any) => ({
          id: s.rollNumber || s._id,
          name: s.fullName,
          dept: typeof s.department === "object" ? s.department.name : s.department,
          year: s.year,
          attendance: s.attendancePercentage || 90,
          cgpa: s.cgpa || 8.0,
          status: s.isActive !== false ? "Active" : "Inactive"
        }));
        setStudentsList(formatted);
        setDbConnected(true);
      } else {
        // Fall back to original mock data
        setStudentsList(mockStudents);
      }
    } catch (err) {
      console.warn("Could not fetch students from API, using premium mock fallback:", err);
      setStudentsList(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      rollNumber: "",
      fullName: "",
      email: "",
      department: "Computer Science",
      year: 3,
      semester: 5,
      section: "A",
      cgpa: 8.5,
      attendancePercentage: 92,
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      password: "password123"
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (!formData.fullName || !formData.rollNumber || !formData.email) {
        throw new Error("Full Name, Roll Number, and Email are required fields.");
      }

      // Pre-fill parent info if empty so it compiles with backend constraints
      const finalParentName = formData.parentName || `Parent of ${formData.fullName}`;
      const finalParentPhone = formData.parentPhone || "9876543210";
      const finalParentEmail = formData.parentEmail || `parent.${formData.rollNumber.toLowerCase()}@college.edu`;

      const payload = {
        ...formData,
        parentName: finalParentName,
        parentPhone: finalParentPhone,
        parentEmail: finalParentEmail,
      };

      await createStudent(payload);
      
      setIsModalOpen(false);
      loadStudents(); // Refresh student directory
    } catch (err: any) {
      console.error("Failed to add student:", err);
      setFormError(err.response?.data?.message || err.message || "An error occurred while writing to the database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Students"
        desc="Manage student profiles, attendance and academic records."
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm bg-background/60">
              <Filter className="size-4" /> Filter
            </button>
            <button 
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm glow-primary transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="size-4" /> Add Student
            </button>
          </>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {studentsList.slice(0, 4).map((s) => (
          <Card key={s.id} className="text-center relative overflow-hidden">
            <div className="mx-auto size-16 rounded-2xl bg-gradient-primary grid place-items-center text-white text-xl font-bold">
              {s.name
                .split(" ")
                .map((x: string) => x[0])
                .join("")}
            </div>
            <div className="mt-3 font-semibold text-slate-800">{s.name}</div>
            <div className="text-xs text-muted-foreground">
              {s.dept} · Year {s.year}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/60 p-2">
                <div className="font-bold text-slate-700">{s.attendance}%</div>
                <div className="text-muted-foreground text-[10px]">Attendance</div>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <div className="font-bold text-slate-700">{s.cgpa}</div>
                <div className="text-muted-foreground text-[10px]">CGPA</div>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-1.5">
              <button className="size-8 rounded-lg border grid place-items-center hover:bg-accent text-slate-500">
                <Mail className="size-3.5" />
              </button>
              <button className="size-8 rounded-lg border grid place-items-center hover:bg-accent text-slate-500">
                <Phone className="size-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className="p-5 flex items-center justify-between border-b">
          <h3 className="font-semibold text-slate-800 text-sm">All Students</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search…"
              className="rounded-xl border bg-background/60 pl-9 pr-3 py-1.5 text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-slate-700 text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                {["ID", "Name", "Department", "Year", "Attendance", "CGPA", "Status", ""].map(
                  (h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {studentsList.map((s) => (
                <tr key={s.id} className="border-t hover:bg-slate-50/40">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900">{s.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-bold">
                        {s.name
                          .split(" ")
                          .map((x: string) => x[0])
                          .join("")}
                      </div>
                      <span className="font-semibold text-slate-850">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-medium">{s.dept}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                      Year {s.year}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary rounded-full"
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-bold">{s.cgpa}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={s.status === "Active" ? "success" : "warn"}>{s.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-indigo text-xs font-semibold hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex items-center justify-between text-xs text-muted-foreground border-t">
          <span>
            Showing 1–{studentsList.length} of {studentsList.length}
          </span>
          <div className="flex gap-1">
            <button className="px-2.5 py-1 rounded-md border bg-background">Prev</button>
            <button className="px-2.5 py-1 rounded-md bg-gradient-primary text-white">1</button>
            <button className="px-2.5 py-1 rounded-md border bg-background">2</button>
            <button className="px-2.5 py-1 rounded-md border bg-background">Next</button>
          </div>
        </div>
      </Card>

      {/* GORGEOUS ADD STUDENT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          {/* Dismiss backdrop */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Add New Student</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Register student details securely directly into the database.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-xl hover:bg-slate-100 grid place-items-center text-slate-400 transition-colors"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex gap-2 items-start">
                  <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Roll Number */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Roll Number / ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      required
                      placeholder="e.g. STU009"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="e.g. aarav@college.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Temp Password */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Temporary Password</label>
                <input
                  required
                  type="password"
                  placeholder="Set temporary password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Department</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Biotech">Biotech</option>
                    <option value="Business">Business</option>
                    <option value="Physics">Physics</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Year */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* Semester */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>

                {/* Section */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
                  >
                    {["A", "B", "C", "D"].map(sec => <option key={sec} value={sec}>Sec {sec}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* CGPA */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">CGPA (0 - 10)</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 8.5"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Attendance */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Attendance %</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 95"
                      value={formData.attendancePercentage}
                      onChange={(e) => setFormData({ ...formData, attendancePercentage: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5"
                >
                  {submitting && <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
