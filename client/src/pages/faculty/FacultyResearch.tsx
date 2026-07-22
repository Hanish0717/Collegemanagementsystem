import { useState } from 'react';
import { Award, Plus, Search, Calendar, Landmark, ClipboardCheck, Trash2 } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function FacultyResearch() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [projects, setProjects] = useState([
    {
      id: 'P001',
      title: 'Autonomous Drone Navigation via Deep Reinforcement Learning',
      role: 'Principal Investigator (PI)',
      agency: 'DST-SERB, Govt of India',
      budget: '₹18.5L',
      status: 'Ongoing',
      duration: '2024 - 2026',
    },
    {
      id: 'P002',
      title: 'Decentralized Smart Grid Energy Distribution using Blockchain',
      role: 'Co-PI',
      agency: 'AICTE Research Grant',
      budget: '₹8.2L',
      status: 'Ongoing',
      duration: '2024 - 2025',
    },
    {
      id: 'P003',
      title: 'Real-time Medical Diagnostics on Edge Devices via Model Compression',
      role: 'Principal Investigator (PI)',
      agency: 'ICMR Research Fellowship',
      budget: '₹12.0L',
      status: 'Completed',
      duration: '2022 - 2024',
    },
    {
      id: 'P004',
      title: 'Energy-efficient Federated Learning for IoT Network Anomalies',
      role: 'Co-PI',
      agency: 'IEEE Seed Funding',
      budget: '₹3.5L',
      status: 'Completed',
      duration: '2023 - 2024',
    },
  ]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('Principal Investigator (PI)');
  const [newAgency, setNewAgency] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAgency || !newBudget || !newDuration) {
      toast.error('Please fill in all details.');
      return;
    }

    const newProject = {
      id: `P00${projects.length + 1}`,
      title: newTitle,
      role: newRole,
      agency: newAgency,
      budget: newBudget.startsWith('₹') ? newBudget : `₹${newBudget}`,
      status: 'Ongoing',
      duration: newDuration,
    };

    setProjects((prev) => [...prev, newProject]);
    toast.success('New research project registered successfully!');

    // Reset Form
    setNewTitle('');
    setNewAgency('');
    setNewBudget('');
    setNewDuration('');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this research record?')) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success('Research record removed.');
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.agency.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudgetVal = projects.reduce((acc, p) => {
    const numericStr = p.budget.replace(/[^0-9.]/g, '');
    return acc + parseFloat(numericStr);
  }, 0);

  const fundingChartData = [
    { name: 'DST-SERB', funding: 18.5 },
    { name: 'ICMR', funding: 12.0 },
    { name: 'AICTE', funding: 8.2 },
    { name: 'IEEE Seed', funding: 3.5 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Workspace"
        desc="Register research grants, track ongoing sponsored projects, and view funding metrics."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Projects',
            value: String(projects.filter((p) => p.status === 'Ongoing').length),
            tone: 'info' as const,
          },
          {
            label: 'Completed Projects',
            value: String(projects.filter((p) => p.status === 'Completed').length),
            tone: 'success' as const,
          },
          {
            label: 'Total Funding Secured',
            value: `₹${totalBudgetVal.toFixed(1)}L`,
            tone: 'success' as const,
          },
          { label: 'Grants & Sponsors', value: '4 Agencies', tone: 'warn' as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Research Core
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-semibold text-base">Sponsored Research Registry</h3>
            <div className="flex gap-2">
              {['All', 'Ongoing', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'border bg-background hover:bg-accent'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search projects by title, sponsor agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {[
                    'Project ID & Title',
                    'Role',
                    'Sponsor Agency',
                    'Budget',
                    'Status',
                    'Actions',
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/40 transition">
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-semibold text-xs text-indigo-600 font-mono mb-1">
                          {p.id}
                        </div>
                        <div className="font-medium text-sm leading-snug">{p.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="size-3" /> {p.duration}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium">{p.role}</td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">{p.agency}</td>
                      <td className="py-4 px-4 font-bold text-xs">{p.budget}</td>
                      <td className="py-4 px-4">
                        <Badge tone={p.status === 'Ongoing' ? 'info' : 'success'}>{p.status}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No research project matches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Add Project Form */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Plus className="size-5 text-indigo-600" />
              <h3 className="font-semibold text-base">Register New Project</h3>
            </div>
            <form onSubmit={handleAddProject} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Project Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Brain Tumor Segmentation..."
                  className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">My Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Principal Investigator (PI)">Principal Investigator (PI)</option>
                  <option value="Co-PI">Co-PI</option>
                  <option value="Research Investigator">Research Investigator</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Sponsoring Agency
                </label>
                <input
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  placeholder="e.g. DST, DRDO, AICTE..."
                  className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Budget (Lakhs)
                  </label>
                  <input
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="e.g. 10.5L"
                    className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Duration (Years)
                  </label>
                  <input
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 2024 - 2026"
                    className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <Plus className="size-4" /> Add Research Project
              </button>
            </form>
          </Card>

          {/* Funding Agency Analysis */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="size-5 text-indigo-600" />
              <h3 className="font-semibold text-base">Sponsor Breakdown (Lakhs)</h3>
            </div>
            <div className="h-44 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                  <YAxis stroke="#94A3B8" fontSize={9} />
                  <Tooltip formatter={(value) => [`₹${value}L`]} />
                  <Bar dataKey="funding" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
