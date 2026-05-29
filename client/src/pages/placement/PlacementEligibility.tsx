import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Sliders, Users, Check, X } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { students } from "@/mock/mockData";

export function PlacementEligibility() {
  const [cgpaFilter, setCgpaFilter] = useState(6.0);
  const [backlogFilter, setBacklogFilter] = useState(0);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const departments = [
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
  const studentSkills: Record<string, string[]> = {
    STU001: ["Java", "React", "SQL"],
    STU002: ["Python", "Data Analysis", "Communication"],
    STU003: ["Java", "Python"],
    STU004: ["Communication", "Data Analysis"],
    STU005: ["React", "SQL"],
    STU006: ["Communication", "React"],
    STU007: ["Python", "Data Analysis"],
    STU008: ["SQL", "Communication"],
  };
  const studentBacklogs: Record<string, number> = {
    STU001: 0,
    STU002: 0,
    STU003: 1,
    STU004: 0,
    STU005: 2,
    STU006: 0,
    STU007: 1,
    STU008: 0,
  };

  const eligibleStudents = students.filter((s) => {
    const meetsGPA = s.cgpa >= cgpaFilter;
    const meetsBacklog = studentBacklogs[s.id] <= backlogFilter;
    const meetsDept = !selectedDept || s.dept === selectedDept;
    const meetsYear = !selectedYear || s.year === selectedYear;
    const meetsSkill = !selectedSkill || studentSkills[s.id]?.includes(selectedSkill);
    return meetsGPA && meetsBacklog && meetsDept && meetsYear && meetsSkill;
  });

  const ineligibleStudents = students.filter((s) => !eligibleStudents.find((e) => e.id === s.id));

  const eligibilityStats = [
    { label: "Total Students", value: students.length.toString(), gradient: "bg-gradient-cyan" },
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
      value: `${Math.round((eligibleStudents.length / students.length) * 100)}%`,
      gradient: "bg-gradient-emerald",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eligibility System"
        desc="Set eligibility criteria and manage student qualifications."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
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

        <button className="mt-4 w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:shadow-lg transition">
          Apply Eligibility
        </button>
      </Card>

      {/* Eligible Students */}
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
                  <td className="py-3 px-4 text-center">{studentBacklogs[student.id]}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {studentSkills[student.id].slice(0, 2).map((skill) => (
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

      {/* Ineligible Students */}
      {ineligibleStudents.length > 0 && (
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
                      {student.cgpa < cgpaFilter ? (
                        <Badge tone="danger">CGPA below {cgpaFilter.toFixed(1)}</Badge>
                      ) : studentBacklogs[student.id] > backlogFilter ? (
                        <Badge tone="danger">{studentBacklogs[student.id]} backlogs</Badge>
                      ) : selectedSkill && !studentSkills[student.id]?.includes(selectedSkill) ? (
                        <Badge tone="warn">Missing {selectedSkill}</Badge>
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
              <li>• Minimum CGPA: {cgpaFilter.toFixed(1)}</li>
              <li>• Maximum Backlogs: {backlogFilter}</li>
              <li>• Required skill: {selectedSkill || "Any"}</li>
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
    </div>
  );
}
