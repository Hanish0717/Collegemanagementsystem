import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Building2, Plus, Search, Users, Edit, Trash, X, Loader2 } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { Department } from '../../services/superAdminService';
import { useDepartments } from '@/hooks/useDepartments';

export function SuperAdminDepartments() {
  const [academicTab, setAcademicTab] = useState('Departments');

  const {
    data: departments = [],
    isLoading: loading,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [head, setHead] = useState('');
  const [faculty, setFaculty] = useState(0);
  const [students, setStudents] = useState(0);
  const [budget, setBudget] = useState('');
  const [deptStatus, setDeptStatus] = useState('Active');

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setHead('');
    setFaculty(0);
    setStudents(0);
    setBudget('₹1.0Cr');
    setDeptStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.id);
    setHead(dept.head);
    setFaculty(dept.faculty);
    setStudents(dept.students);
    setBudget(dept.budget);
    setDeptStatus(dept.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
      } catch (err: any) {
        console.error('Error deleting department:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !head) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingDept) {
        const payload = {
          name,
          head,
          faculty: Number(faculty),
          students: Number(students),
          budget,
          status: deptStatus,
        };
        await updateDepartment({ code: editingDept.id, payload });
      } else {
        if (departments.some((d) => d.id.toUpperCase() === code.toUpperCase())) {
          toast.error('A department with this code already exists');
          return;
        }
        const payload = {
          id: code.toUpperCase(),
          name,
          head,
          faculty: Number(faculty),
          students: Number(students),
          budget,
          status: deptStatus,
        };
        await addDepartment(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving department:', err);
    }
  };

  const filtered = useMemo(
    () =>
      departments.filter(
        (dept) =>
          (status === 'All' || dept.status === status) &&
          [dept.name, dept.head, dept.id].some((value) =>
            value.toLowerCase().includes(search.toLowerCase()),
          ),
      ),
    [departments, search, status],
  );

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Structure & Department Governance"
        desc="Manage departments, degree programs, course offerings, curriculum frameworks, semesters, and academic years."
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer"
          >
            <Plus className="size-4" /> Add Department
          </button>
        }
      />

      {/* Academic Structure Sub-Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-accent/20 border rounded-xl overflow-x-auto">
        {[
          'Departments',
          'Programs',
          'Courses',
          'Curriculum',
          'Semesters',
          'Academic Years',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setAcademicTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              academicTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
          >
            {['All', 'Active', 'Review', 'Inactive'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => (
          <Card key={dept.id} className="hover:-translate-y-1 transition relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center">
                <Building2 className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    dept.status === 'Active'
                      ? 'success'
                      : dept.status === 'Review'
                        ? 'warn'
                        : 'danger'
                  }
                >
                  {dept.status}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-lg border bg-background hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Edit Department"
                  >
                    <Edit className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-1.5 rounded-lg border bg-background hover:bg-rose-50 text-rose-600 cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <h3 className="font-semibold">{dept.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">Head: {dept.head}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 rounded-xl bg-gradient-soft border text-center">
                <div className="text-xs text-muted-foreground">Faculty</div>
                <div className="text-xl font-bold">{dept.faculty}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-soft border text-center">
                <div className="text-xs text-muted-foreground">Students</div>
                <div className="text-xl font-bold">{dept.students}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 p-3 rounded-xl border">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="text-sm font-semibold text-emerald-600">{dept.budget}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Department Analytics</h3>
              <p className="text-xs text-muted-foreground">
                Faculty and student count by department
              </p>
            </div>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="id" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="faculty" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Faculty" />
                <Bar dataKey="students" fill="#06B6D4" radius={[8, 8, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-5 text-indigo" />
            <h3 className="font-semibold">Department Statistics</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                label: 'Total Faculty',
                value: departments.reduce((sum, dept) => sum + dept.faculty, 0),
              },
              {
                label: 'Total Students',
                value: departments.reduce((sum, dept) => sum + dept.students, 0),
              },
              {
                label: 'Active Departments',
                value: departments.filter((dept) => dept.status === 'Active').length,
              },
              {
                label: 'Review Required',
                value: departments.filter((dept) => dept.status === 'Review').length,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
              >
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">
                {editingDept ? 'Edit Department Details' : 'Add New Department'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science and Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Department Code / ID *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingDept}
                    placeholder="e.g. CSE"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Head of Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Faculty Strength
                  </label>
                  <input
                    type="number"
                    value={faculty}
                    onChange={(e) => setFaculty(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Student Count
                  </label>
                  <input
                    type="number"
                    value={students}
                    onChange={(e) => setStudents(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Annual Budget
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1.2Cr"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <select
                    value={deptStatus}
                    onChange={(e) => setDeptStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Review">Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs cursor-pointer"
                >
                  {editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
