import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Search, Trash, Edit } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  fetchDepartments,
  Course,
} from '@/services/superAdminService';
import { Skeleton } from '@/components/ui/skeleton';

export function SuperAdminCourses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [credits, setCredits] = useState(3);
  const [statusVal, setStatusVal] = useState('Active');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['superAdminCourses'],
    queryFn: fetchCourses,
  });

  const { data: departmentsData = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: ['superAdminDepartments'],
    queryFn: fetchDepartments,
  });

  // Initialize department dropdown selection if empty
  useEffect(() => {
    if (departmentsData.length > 0 && !selectedDept) {
      setSelectedDept(departmentsData[0].id);
    }
  }, [departmentsData, selectedDept]);

  const addMutation = useMutation({
    mutationFn: addCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminCourses'] });
      toast.success('Course added successfully');
      // Reset Form
      setCode('');
      setName('');
      setSemester('Semester 1');
      setCredits(3);
      setStatusVal('Active');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to add course');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, course }: { code: string; course: Partial<Course> }) =>
      updateCourse(code, course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminCourses'] });
      toast.success('Course updated successfully');
      setEditingCourse(null);
      // Reset Form
      setCode('');
      setName('');
      setSemester('Semester 1');
      setCredits(3);
      setStatusVal('Active');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminCourses'] });
      toast.success('Course deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete course');
    },
  });

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    if (departmentsData.length > 0) {
      setSelectedDept(departmentsData[0].id);
    }
    setSemester('Semester 1');
    setCredits(3);
    setStatusVal('Active');

    formRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => codeInputRef.current?.focus(), 500);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setCode(course.code);
    setName(course.name);
    setSelectedDept(course.department);
    setSemester(course.semester);
    setCredits(course.credits);
    setStatusVal(course.status);

    formRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => codeInputRef.current?.focus(), 500);
  };

  const handleDelete = (courseCode: string) => {
    if (confirm(`Are you sure you want to delete course ${courseCode}?`)) {
      deleteMutation.mutate(courseCode);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast.error('Please fill in course code and name');
      return;
    }

    if (editingCourse) {
      updateMutation.mutate({
        code: editingCourse.code,
        course: {
          name,
          department: selectedDept,
          semester,
          credits: Number(credits),
          status: statusVal,
        },
      });
    } else {
      if (courses.some((c) => c.code.toUpperCase() === code.toUpperCase())) {
        toast.error('A course with this code already exists');
        return;
      }
      const newCourse: Course = {
        code: code.toUpperCase(),
        name,
        department: selectedDept,
        semester,
        credits: Number(credits),
        status: statusVal,
      };
      addMutation.mutate(newCourse);
    }
  };

  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          (department === 'All' || course.department === department) &&
          [course.code, course.name, course.department].some((value) =>
            value.toLowerCase().includes(search.toLowerCase()),
          ),
      ),
    [courses, department, search],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        desc="Manage course catalog, department mapping, semester allocation, credits and course status."
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer"
          >
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
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departmentsData.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          {isLoadingCourses ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {[
                    'Course Code',
                    'Course Name',
                    'Department',
                    'Semester',
                    'Credits',
                    'Status',
                    'Actions',
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No courses found. Click "Add Course" or use the form below to register a new
                      course.
                    </td>
                  </tr>
                ) : (
                  filtered.map((course) => (
                    <tr key={course.code} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-semibold text-xs text-primary">
                        {course.code}
                      </td>
                      <td className="py-3 px-4 font-medium">{course.name}</td>
                      <td className="py-3 px-4">
                        <Badge tone="info">{course.department}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{course.semester}</td>
                      <td className="py-3 px-4 font-medium">{course.credits}</td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            course.status === 'Active'
                              ? 'success'
                              : course.status === 'Review'
                                ? 'warn'
                                : 'danger'
                          }
                        >
                          {course.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(course)}
                            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
                            title="Edit Course"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(course.code)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card>
        <div ref={formRef} className="flex items-center gap-2 mb-4">
          <BookOpen className="size-5 text-indigo" />
          <h3 className="font-semibold">
            {editingCourse ? 'Edit Course Details' : 'Add Course Details'}
          </h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              ref={codeInputRef}
              placeholder="Course code (e.g. CS501)"
              required
              disabled={!!editingCourse}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary outline-none disabled:opacity-60"
            />
            <input
              placeholder="Course name (e.g. Operating Systems)"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
            />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer focus:border-primary outline-none"
            >
              {isLoadingDepts ? (
                <option>Loading...</option>
              ) : (
                departmentsData.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))
              )}
            </select>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer focus:border-primary outline-none"
            >
              {[
                'Semester 1',
                'Semester 2',
                'Semester 3',
                'Semester 4',
                'Semester 5',
                'Semester 6',
                'Semester 7',
                'Semester 8',
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              placeholder="Credits"
              type="number"
              required
              min={1}
              max={6}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
            />
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer focus:border-primary outline-none"
            >
              {['Active', 'Review', 'Inactive'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {editingCourse && (
              <button
                type="button"
                onClick={() => {
                  setEditingCourse(null);
                  setCode('');
                  setName('');
                  setSemester('Semester 1');
                  setCredits(3);
                  setStatusVal('Active');
                }}
                className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={addMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium hover:opacity-95 transition cursor-pointer disabled:opacity-60"
            >
              {editingCourse ? 'Update Course' : 'Save Course'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
