import { useState, useEffect } from "react";
import { Plus, Sliders, Check, X, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import api from "@/lib/api";
import { students as mockStudents } from "@/mock/mockData";
import { toast } from "sonner";

interface StudentItem {
  id: string;
  name: string;
  dept: string;
  year: number;
  cgpa: number;
  attendance: number;
}

interface CriteriaTemplate {
  id: string;
  name: string;
  minCgpa: number;
  maxBacklogs: number;
  dept: string | null;
  year: number | null;
  skill: string | null;
}

export function PlacementEligibility() {
  const [students, setStudents] = useState<StudentItem[]>(mockStudents);
  const [loading, setLoading] = useState(true);
  const [cgpaFilter, setCgpaFilter] = useState(6.0);
  const [backlogFilter, setBacklogFilter] = useState(0);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const [appliedCgpaFilter, setAppliedCgpaFilter] = useState(6.0);
  const [appliedBacklogFilter, setAppliedBacklogFilter] = useState(0);
  const [appliedSelectedDept, setAppliedSelectedDept] = useState<string | null>(null);
  const [appliedSelectedYear, setAppliedSelectedYear] = useState<number | null>(null);
  const [appliedSelectedSkill, setAppliedSelectedSkill] = useState<string | null>(null);

  const handleApplyChanges = () => {
    setAppliedCgpaFilter(cgpaFilter);
    setAppliedBacklogFilter(backlogFilter);
    setAppliedSelectedDept(selectedDept);
    setAppliedSelectedYear(selectedYear);
    setAppliedSelectedSkill(selectedSkill);
    toast.success("Current eligibility criteria successfully applied to student registers!");
  };

  // Criteria Template States
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [criteriaName, setCriteriaName] = useState("");
  const [newMinCgpa, setNewMinCgpa] = useState(7.0);
  const [newMaxBacklogs, setNewMaxBacklogs] = useState(0);
  const [newDept, setNewDept] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const [savedTemplates, setSavedTemplates] = useState<CriteriaTemplate[]>([
    { id: "CRIT_1", name: "Google SDE Role", minCgpa: 8.0, maxBacklogs: 0, dept: "Computer Science", year: 4, skill: "React" },
    { id: "CRIT_2", name: "Goldman Sachs Analyst", minCgpa: 7.5, maxBacklogs: 0, dept: "Business", year: 4, skill: "Data Analysis" },
    { id: "CRIT_3", name: "Infosys Trainee", minCgpa: 6.0, maxBacklogs: 2, dept: null, year: null, skill: "SQL" }
  ]);

  const applyTemplate = (template: CriteriaTemplate) => {
    setCgpaFilter(template.minCgpa);
    setBacklogFilter(template.maxBacklogs);
    setSelectedDept(template.dept);
    setSelectedYear(template.year);
    setSelectedSkill(template.skill);

    setAppliedCgpaFilter(template.minCgpa);
    setAppliedBacklogFilter(template.maxBacklogs);
    setAppliedSelectedDept(template.dept);
    setAppliedSelectedYear(template.year);
    setAppliedSelectedSkill(template.skill);

    toast.success(`Applied '${template.name}' eligibility criteria template!`);
  };

  const handleCreateCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteriaName.trim()) {
      toast.error("Template name is required!");
      return;
    }
    const newTemplate: CriteriaTemplate = {
      id: `CRIT_${Date.now()}`,
      name: criteriaName,
      minCgpa: newMinCgpa,
      maxBacklogs: newMaxBacklogs,
      dept: newDept || null,
      year: newYear ? parseInt(newYear) : null,
      skill: newSkill || null
    };
    setSavedTemplates(prev => [newTemplate, ...prev]);
    applyTemplate(newTemplate);
    setIsCriteriaModalOpen(false);
    // Reset form
    setCriteriaName("");
    setNewMinCgpa(7.0);
    setNewMaxBacklogs(0);
    setNewDept("");
    setNewYear("");
    setNewSkill("");
  };

  useEffect(() => {
    api.get("/api/students?limit=1000")
      .then((res) => {
        if (res.data && res.data.success && res.data.data && Array.isArray(res.data.data.students)) {
          const mapped = res.data.data.students.map((s: any) => ({
            id: s.rollNumber || s.roll_number || s.id,
            name: s.fullName || s.full_name || s.name,
            dept: s.department || "Computer Science",
            year: s.year || 4,
            cgpa: parseFloat(s.cgpa) || 8.0,
            attendance: parseFloat(s.attendancePercentage || s.attendance_percentage) || 90
          }));
          if (mapped.length > 0) setStudents(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Could not query live students, falling back to mock:", err);
        setLoading(false);
      });
  }, []);

  const departments = [
    "Computer Science & Engineering",
    "Artificial Intelligence & Machine Learning",
    "Artificial Intelligence & Data Science",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Business",
    "Design",
    "Physics",
    "Biotech",
  ];
  const years = [1, 2, 3, 4];
  const skills = ["Java", "React", "Python", "SQL", "Communication", "Data Analysis"];
  
  const getStudentSkills = (studentId: string) => {
    const studentSkillsMock: Record<string, string[]> = {
      STU001: ["Java", "React", "SQL"],
      STU002: ["Python", "Data Analysis", "Communication"],
      STU003: ["Java", "Python"],
      STU004: ["Communication", "Data Analysis"],
      STU005: ["React", "SQL"],
      STU006: ["Communication", "React"],
      STU007: ["Python", "Data Analysis"],
      STU008: ["SQL", "Communication"],
    };
    if (studentSkillsMock[studentId]) return studentSkillsMock[studentId];
    
    // Deterministic skills based on roll number / ID
    const allSkills = ["Java", "React", "Python", "SQL", "Communication", "Data Analysis"];
    const charSum = studentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const count = 2 + (charSum % 2); // 2 or 3 skills
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (charSum + i * 7) % allSkills.length;
      const skill = allSkills[idx];
      if (!selected.includes(skill)) selected.push(skill);
    }
    if (selected.length < 2) {
      selected.push(allSkills[(charSum + 1) % allSkills.length]);
    }
    return selected;
  };

  const getStudentBacklogs = (studentId: string) => {
    const studentBacklogsMock: Record<string, number> = {
      STU001: 0,
      STU002: 0,
      STU003: 1,
      STU004: 0,
      STU005: 2,
      STU006: 0,
      STU007: 1,
      STU008: 0,
    };
    if (studentBacklogsMock[studentId] !== undefined) return studentBacklogsMock[studentId];
    
    // Deterministic backlogs: 85% chance of 0, 10% chance of 1, 5% chance of 2
    const charSum = studentId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const mod = charSum % 100;
    if (mod < 85) return 0;
    if (mod < 95) return 1;
    return 2;
  };

  const cohortStudents = students.filter((s) => {
    const meetsDept = !appliedSelectedDept || s.dept.toLowerCase().includes(appliedSelectedDept.toLowerCase());
    const meetsYear = !appliedSelectedYear || s.year === appliedSelectedYear;
    return meetsDept && meetsYear;
  });

  const eligibleStudents = cohortStudents.filter((s) => {
    const meetsGPA = s.cgpa >= appliedCgpaFilter;
    const meetsBacklog = getStudentBacklogs(s.id) <= appliedBacklogFilter;
    const meetsSkill = !appliedSelectedSkill || getStudentSkills(s.id).includes(appliedSelectedSkill);
    return meetsGPA && meetsBacklog && meetsSkill;
  });

  const ineligibleStudents = cohortStudents.filter((s) => !eligibleStudents.find((e) => e.id === s.id));

  const eligibilityStats = [
    { label: "Total Students", value: cohortStudents.length.toString(), gradient: "bg-gradient-cyan" },
    {
      label: "Eligible",
      value: eligibleStudents.length.toString(),
      gradient: "bg-gradient-primary",
    },
    {
      label: "Ineligible",
      value: ineligibleStudents.length.toString(),
      gradient: "bg-gradient-violet",
    },
    {
      label: "Eligibility Rate",
      value: `${cohortStudents.length > 0 ? Math.round((eligibleStudents.length / cohortStudents.length) * 100) : 0}%`,
      gradient: "bg-gradient-emerald",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eligibility System"
        desc="Set eligibility criteria and manage student qualifications."
        actions={
          <button 
            onClick={() => setIsCriteriaModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> New Criteria
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {eligibilityStats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div
              className={`size-12 rounded-xl ${stat.gradient} text-white grid place-items-center mx-auto mb-3 font-bold text-lg`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="size-5" />
          <h3 className="font-semibold">Eligibility Filters</h3>
        </div>

        {/* Saved Templates Quick-Apply */}
        <div className="mb-6 pb-4 border-b border-dashed border-slate-100">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">Quick Apply Saved Criteria Templates</label>
          <div className="flex flex-wrap gap-2">
            {savedTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold bg-background hover:bg-indigo-50/20 hover:border-indigo-200 hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* CGPA Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum CGPA</label>
            <div className="space-y-2">
              <input
                type="range"
                min="5"
                max="10"
                step="0.1"
                value={cgpaFilter}
                onChange={(e) => setCgpaFilter(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">5.0</span>
                <span className="font-semibold">{cgpaFilter.toFixed(1)}</span>
                <span className="text-muted-foreground">10.0</span>
              </div>
            </div>
          </div>

          {/* Backlog Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Backlogs</label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={backlogFilter}
                onChange={(e) => setBacklogFilter(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">0</span>
                <span className="font-semibold">{backlogFilter}</span>
                <span className="text-muted-foreground">5+</span>
              </div>
            </div>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <select
              value={selectedDept || ""}
              onChange={(e) => setSelectedDept(e.target.value || null)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Academic Year</label>
            <select
              value={selectedYear || ""}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Required Skill</label>
            <select
              value={selectedSkill || ""}
              onChange={(e) => setSelectedSkill(e.target.value || null)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All Skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={handleApplyChanges}
          className="mt-4 w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:shadow-lg transition cursor-pointer"
        >
          Apply Eligibility
        </button>
      </Card>

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Evaluating student eligibility records...</span>
          </div>
        </Card>
      )}

      {/* Eligible Students */}
      {!loading && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className="size-5 text-emerald-600" />
              <h3 className="font-semibold">Eligible Students</h3>
            </div>
            <Badge tone="success">{eligibleStudents.length} Students</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Student ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Department
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Year</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">CGPA</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Backlogs
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Skills</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Attendance
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {eligibleStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{student.dept}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge tone="info">Year {student.year}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-600">
                      {student.cgpa}
                    </td>
                    <td className="py-3 px-4 text-center">{getStudentBacklogs(student.id)}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {getStudentSkills(student.id).slice(0, 2).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm">{student.attendance}%</td>
                    <td className="py-3 px-4 text-center">
                      <Badge tone="success">✓ Eligible</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ineligible Students */}
      {!loading && ineligibleStudents.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <X className="size-5 text-rose-600" />
              <h3 className="font-semibold">Ineligible Students</h3>
            </div>
            <Badge tone="danger">{ineligibleStudents.length} Students</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Student ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Department
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    CGPA
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ineligibleStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{student.dept}</td>
                    <td className="py-3 px-4 text-center font-semibold">{student.cgpa}</td>
                    <td className="py-3 px-4 text-sm">
                      {student.cgpa < appliedCgpaFilter ? (
                        <Badge tone="danger">CGPA below {appliedCgpaFilter.toFixed(1)}</Badge>
                      ) : getStudentBacklogs(student.id) > appliedBacklogFilter ? (
                        <Badge tone="danger">{getStudentBacklogs(student.id)} backlogs</Badge>
                      ) : appliedSelectedSkill && !getStudentSkills(student.id).includes(appliedSelectedSkill) ? (
                        <Badge tone="warn">Missing {appliedSelectedSkill}</Badge>
                      ) : (
                        <Badge tone="warn">Does not meet criteria</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Eligibility Rules */}
      <Card>
        <h3 className="font-semibold mb-4">Eligibility Criteria Rules</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-gradient-soft">
            <div className="font-medium text-sm mb-2">✓ Standard Criteria</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Minimum CGPA: {appliedCgpaFilter.toFixed(1)}</li>
              <li>• Maximum Backlogs: {appliedBacklogFilter}</li>
              <li>• Required skill: {appliedSelectedSkill || "Any"}</li>
              <li>• No active academic probation</li>
              <li>• All fees paid</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-gradient-soft">
            <div className="font-medium text-sm mb-2">⚠ Special Cases</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Final year priority</li>
              <li>• Department waiver available</li>
              <li>• CEO approval for exceptions</li>
              <li>• Case-by-case review</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Add Criteria Modal */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Create Eligibility Criteria</h3>
              <button
                onClick={() => setIsCriteriaModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCriteria} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Criteria Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon AWS Specialist"
                  value={criteriaName}
                  onChange={(e) => setCriteriaName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Minimum CGPA *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    max="10.0"
                    required
                    value={newMinCgpa}
                    onChange={(e) => setNewMinCgpa(parseFloat(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Max Allowed Backlogs *</label>
                  <select
                    value={newMaxBacklogs}
                    onChange={(e) => setNewMaxBacklogs(parseInt(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="0">0 (No backlogs)</option>
                    <option value="1">1 backlog</option>
                    <option value="2">2 backlogs</option>
                    <option value="3">3 backlogs</option>
                    <option value="4">4 backlogs</option>
                    <option value="5">5+ backlogs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Department Limit</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Academic Year Limit</label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year.toString()}>Year {year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Required Core Skill</label>
                <select
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="">Any Skill</option>
                  {skills.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCriteriaModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Create & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
