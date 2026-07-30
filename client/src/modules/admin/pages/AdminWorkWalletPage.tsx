import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  MessageSquare,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  assignee: string;
  assignedBy: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed" | "Approval Required";
  dueDate: string;
  commentsCount: number;
  description: string;
}

export function AdminWorkWallet() {
  const [activeTab, setActiveTab] = useState<"all" | "my_tasks" | "pending" | "approvals" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for Assign Task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("Academic Administration");
  const [taskAssignee, setTaskAssignee] = useState("HOD CSE");
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [taskDueDate, setTaskDueDate] = useState("2026-08-05");
  const [taskDescription, setTaskDescription] = useState("");

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "TSK-101",
      title: "Review NAAC Criterion 3 R&D Documentation",
      category: "Accreditation",
      assignee: "Dean Academics",
      assignedBy: "Office of the Principal",
      priority: "High",
      status: "Approval Required",
      dueDate: "Jul 31, 2026",
      commentsCount: 4,
      description: "Audit research publication proof certificates for 2025-2026 faculty submissions.",
    },
    {
      id: "TSK-102",
      title: "Consolidate Mid-Semester Attendance Reports",
      category: "Academic Monitoring",
      assignee: "HOD CSE",
      assignedBy: "Admin Office",
      priority: "High",
      status: "In Progress",
      dueDate: "Aug 02, 2026",
      commentsCount: 2,
      description: "Flag all students with <75% attendance across Semester 5 sections A and B.",
    },
    {
      id: "TSK-103",
      title: "Approve Q3 Laboratory Procurement Invoice",
      category: "Inventory & Assets",
      assignee: "Finance Officer",
      assignedBy: "Admin Office",
      priority: "Medium",
      status: "Pending",
      dueDate: "Aug 04, 2026",
      commentsCount: 1,
      description: "Verify vendor GST tax invoice for 40 new Intel i7 workstations.",
    },
    {
      id: "TSK-104",
      title: "Finalize Mid-Term Examination Timetable Matrix",
      category: "Exam Cell",
      assignee: "Exam Controller",
      assignedBy: "Vice Principal",
      priority: "High",
      status: "Completed",
      dueDate: "Jul 25, 2026",
      commentsCount: 6,
      description: "Publish clash-free examination hall distribution list for August end-term.",
    },
    {
      id: "TSK-105",
      title: "Execute Alumni Guest Lecture Sponsorship MOU",
      category: "Alumni Affairs",
      assignee: "Alumni Coordinator",
      assignedBy: "Office of the Principal",
      priority: "Low",
      status: "In Progress",
      dueDate: "Aug 10, 2026",
      commentsCount: 3,
      description: "Coordinate keynote address and workshop logistics for Tech Fest 2026.",
    },
  ]);

  useEffect(() => {
    let isMounted = true;
    api.get("/api/admin/work-wallet")
      .then((res) => {
        if (isMounted && res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const fetchedTasks: TaskItem[] = res.data.data.map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            assignee: t.assignee,
            assignedBy: t.assigned_by || t.assignedBy || "Admin Office",
            priority: t.priority || "Medium",
            status: t.status || "Pending",
            dueDate: t.due_date || t.dueDate || "Aug 05, 2026",
            commentsCount: Number(t.comments_count || t.commentsCount || 0),
            description: t.description || ""
          }));
          setTasks(fetchedTasks);
        }
      })
      .catch((err) => {
        console.warn("Using offline work wallet state:", err.message);
      });
    return () => { isMounted = false; };
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || t.priority.toLowerCase() === priorityFilter.toLowerCase();
    
    if (!matchesSearch || !matchesPriority) return false;

    if (activeTab === "my_tasks") return t.assignedBy.includes("Admin") || t.assignedBy.includes("Principal");
    if (activeTab === "pending") return t.status === "Pending" || t.status === "In Progress";
    if (activeTab === "approvals") return t.status === "Approval Required";
    if (activeTab === "completed") return t.status === "Completed";
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast.error("Please enter a task title.");
      return;
    }

    const tempId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: TaskItem = {
      id: tempId,
      title: taskTitle,
      category: taskCategory,
      assignee: taskAssignee,
      assignedBy: "Admin Office",
      priority: taskPriority,
      status: "Pending",
      dueDate: new Date(taskDueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      commentsCount: 0,
      description: taskDescription || "Assigned via Admin Work Wallet task manager.",
    };

    try {
      const res = await api.post("/api/admin/work-wallet", {
        title: taskTitle,
        category: taskCategory,
        assignee: taskAssignee,
        priority: taskPriority,
        dueDate: taskDueDate,
        description: taskDescription
      });
      if (res.data?.data) {
        const created = res.data.data;
        newTask.id = created.id || tempId;
      }
    } catch (err) {
      console.warn("Persisted task in local state due to offline mode");
    }

    setTasks([newTask, ...tasks]);
    toast.success(`Task "${newTask.id}: ${newTask.title}" assigned to ${newTask.assignee}!`);
    setIsCreateModalOpen(false);
    setTaskTitle("");
    setTaskDescription("");
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskItem["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/api/admin/work-wallet/${taskId}/status`, { status: newStatus });
    } catch (err) {
      console.warn("Status updated locally");
    }

    toast.success(`Task ${taskId} status updated to "${newStatus}"`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Wallet — Task & Approval Management"
        desc="Unified institutional workflow hub: assign tasks, track deadlines, process executive approvals, and audit progress."
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={tasks.length} change="Active Workflows" icon={Clock} />
        <StatCard
          label="Pending Approvals"
          value={tasks.filter((t) => t.status === "Approval Required").length}
          change="Needs Executive Seal"
          icon={AlertCircle}
        />
        <StatCard
          label="In Progress"
          value={tasks.filter((t) => t.status === "In Progress" || t.status === "Pending").length}
          change="Ongoing Operations"
          icon={UserCheck}
        />
        <StatCard
          label="Completed Tasks"
          value={tasks.filter((t) => t.status === "Completed").length}
          change="Closed Workflows"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Wallet Control Panel */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border">
            {[
              { id: "all", label: "All Tasks" },
              { id: "pending", label: "Pending" },
              { id: "approvals", label: "Approvals Required" },
              { id: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks or assignees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
            >
              <Plus className="size-4" /> Assign New Task
            </button>
          </div>
        </div>

        {/* Task List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="pb-3 px-3">Task ID & Title</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Assignee</th>
                <th className="pb-3 px-3">Priority</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Due Date</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching tasks found in Work Wallet.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="font-mono text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {t.id}
                        </span>
                        {t.title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Tag className="size-3 text-slate-400" /> {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {t.assignee}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge
                        tone={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warn" : "info"}
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          t.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : t.status === "Approval Required"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">{t.dueDate}</td>
                    <td className="py-3.5 px-3 text-right">
                      {t.status !== "Completed" ? (
                        <button
                          onClick={() => handleStatusChange(t.id, "Completed")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(t.id, "In Progress")}
                          className="px-2.5 py-1 rounded-lg border text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-[11px] cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Task Modal Dialog */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="size-5 text-blue-600" /> Assign New Executive Task
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit NBA Accreditation Criteria 4 Metrics"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none cursor-pointer"
                  >
                    <option value="Academic Administration">Academic Administration</option>
                    <option value="Accreditation">Accreditation (NAAC/NBA)</option>
                    <option value="Inventory & Assets">Inventory & Assets</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Exam Cell">Exam Cell</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assignee Role</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none cursor-pointer"
                  >
                    <option value="HOD CSE">HOD CSE</option>
                    <option value="Dean Academics">Dean Academics</option>
                    <option value="Exam Controller">Exam Controller</option>
                    <option value="Finance Officer">Finance Officer</option>
                    <option value="Hostel Warden">Hostel Warden</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none cursor-pointer"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Task Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide specific guidelines, parameters or required deliverables..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Create & Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
