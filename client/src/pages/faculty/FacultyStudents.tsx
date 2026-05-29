import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, BookOpen, Users, LayoutGrid, CheckCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { fetchFacultyStudents } from "@/services/adminService";

export function FacultyStudents() {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All");

  // Query
  const { data, isLoading } = useQuery({
    queryKey: ["facultyStudents"],
    queryFn: fetchFacultyStudents,
  });

  const studentsList = data?.students || [];
  const facultyProfile = data?.facultyProfile;

  // Filter sections options from students list
  const sections = useMemo(() => {
    const list = studentsList.map((s) => s.section);
    return ["All", ...Array.from(new Set(list))];
  }, [studentsList]);

  // Filters & Search
  const filteredStudents = useMemo(() => {
    return studentsList.filter((stud) => {
      const matchesSearch = [
        stud.fullName,
        stud.rollNumber,
        stud.email,
        stud.department?.name || "",
      ].some((val) => val.toLowerCase().includes(search.toLowerCase()));

      const matchesSection = sectionFilter === "All" || stud.section === sectionFilter;

      return matchesSearch && matchesSection;
    });
  }, [studentsList, search, sectionFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students"
        desc="Roster of students assigned to you based on your teaching department, subjects, and sections."
      />

      {/* Top Realtime Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Assigned Students</div>
            <div className="text-2xl font-bold mt-2">
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : (
                facultyProfile?.studentCount || 0
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">Real-time enrolled</div>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Users className="size-6 text-primary" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Teaching Sections</div>
            <div
              className="text-lg font-bold mt-2 truncate max-w-[200px]"
              title={facultyProfile?.assignedSections?.join(", ") || "None"}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-violet-500" />
              ) : facultyProfile?.assignedSections?.length ? (
                facultyProfile.assignedSections.join(", ")
              ) : (
                "None"
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">Assigned classrooms</div>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-2xl">
            <LayoutGrid className="size-6 text-violet-500" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Assigned Subjects</div>
            <div className="text-2xl font-bold mt-2">
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-cyan-500" />
              ) : (
                facultyProfile?.assignedSubjectsCount || 0
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">Specialized topics</div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-2xl">
            <BookOpen className="size-6 text-cyan-500" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name, roll number, email..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
          >
            <option value="All">All Sections</option>
            {sections
              .filter((s) => s !== "All")
              .map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
          </select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">
              Loading assigned student roster...
            </span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No students currently assigned. Assign sections to see your roster.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {[
                    "Roll Number",
                    "Student Name",
                    "Email Address",
                    "Department & Sec",
                    "Sem & Year",
                    "CGPA",
                    "Attendance",
                    "Status",
                  ].map((column) => (
                    <th
                      key={column}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((stud) => (
                  <tr key={stud._id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-semibold text-xs text-primary">
                      {stud.rollNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{stud.fullName}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{stud.email}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{stud.department?.code}</div>
                      <div className="text-[10px] text-muted-foreground">Sec: {stud.section}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      Sem {stud.semester} • Yr {stud.year}
                    </td>
                    <td className="py-3 px-4 font-bold text-gradient">
                      {stud.cgpa?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{stud.attendancePercentage || 0}%</span>
                        <div className="w-12 h-1.5 rounded-full bg-accent overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (stud.attendancePercentage || 0) >= 75
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(stud.attendancePercentage || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={stud.status === "Active" ? "success" : "warn"}>
                        {stud.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
