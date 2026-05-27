import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { coursesManaged, departmentsManaged } from "@/mock/superAdminData";

export function SuperAdminCourses() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const departments = ["All", ...departmentsManaged.map((dept) => dept.name)];
  const filtered = useMemo(
    () =>
      coursesManaged.filter(
        (course) =>
          (department === "All" || course.department === department) &&
          [course.code, course.name, course.department].some((value) =>
            value.toLowerCase().includes(search.toLowerCase()),
          ),
      ),
    [department, search],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        desc="Manage course catalog, department mapping, semester allocation, credits and course status."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Course
          </button>
        }
      />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm"
          >
            {departments.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  "Course Code",
                  "Course Name",
                  "Department",
                  "Semester",
                  "Credits",
                  "Status",
                  "Actions",
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
              {filtered.map((course) => (
                <tr key={course.code} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-semibold text-xs">{course.code}</td>
                  <td className="py-3 px-4 font-medium">{course.name}</td>
                  <td className="py-3 px-4">
                    <Badge tone="info">{course.department}</Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{course.semester}</td>
                  <td className="py-3 px-4 font-medium">{course.credits}</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        course.status === "Active"
                          ? "success"
                          : course.status === "Review"
                            ? "warn"
                            : "danger"
                      }
                    >
                      {course.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="size-5 text-indigo" />
          <h3 className="font-semibold">Add Course Details</h3>
        </div>
        <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              placeholder="Course code"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Course name"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {departmentsManaged.map((dept) => (
                <option key={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {[
                "Semester 1",
                "Semester 2",
                "Semester 3",
                "Semester 4",
                "Semester 5",
                "Semester 6",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input
              placeholder="Credits"
              type="number"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {["Active", "Review", "Inactive"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
            Save Course
          </button>
        </div>
      </Card>
    </div>
  );
}
