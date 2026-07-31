import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet,
  Building2,
  Award,
  Search,
  Filter,
  FileText,
  Lock,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { toast } from "sonner";

export interface ApprovalItem {
  id: string;
  title: string;
  category: string;
  requestedBy: string;
  amount: string;
  date: string;
  urgency: "High" | "Medium" | "Low";
  status: "Pending Executive Seal" | "Approved" | "Declined";
  details: string;
}

export function AdminApprovals() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: "PR-801",
      title: "Institutional Budget Allocation Q3 (2026-2027)",
      category: "Capital Expenditure",
      requestedBy: "Finance & Accounts Department",
      amount: "₹42.5 Lakhs",
      date: "Jul 21, 2026",
      urgency: "High",
      status: "Pending Executive Seal",
      details: "Q3 operating budget for lab equipment maintenance, cloud servers & library subscriptions.",
    },
    {
      id: "PR-802",
      title: "Campus Expansion Block B Architectural Blueprint",
      category: "Infrastructure",
      requestedBy: "Campus Infrastructure Committee",
      amount: "₹1.2 Crores",
      date: "Jul 20, 2026",
      urgency: "High",
      status: "Pending Executive Seal",
      details: "Phase 2 extension blueprint for 6 new high-tech AI research labs and smart seminar hall.",
    },
    {
      id: "PR-803",
      title: "International Research & Academic Collaboration MOU",
      category: "Global Collaborations",
      requestedBy: "Office of Research (R&D)",
      amount: "N/A",
      date: "Jul 19, 2026",
      urgency: "Medium",
      status: "Pending Executive Seal",
      details: "Bilateral student exchange program and joint publication treaty with MIT CSAIL.",
    },
    {
      id: "PR-804",
      title: "Special Leave Sanction for International Symposium",
      category: "Faculty HR",
      requestedBy: "Dr. K. Harish (HOD CSE)",
      amount: "₹75,000",
      date: "Jul 18, 2026",
      urgency: "Low",
      status: "Approved",
      details: "Travel grant and duty leave for presenting paper at IEEE AI Conference in Tokyo.",
    },
    {
      id: "PR-805",
      title: "Campus Wi-Fi 6 Infrastructure Upgrade Proposal",
      category: "IT Infrastructure",
      requestedBy: "IT System Administrator",
      amount: "₹18.0 Lakhs",
      date: "Jul 15, 2026",
      urgency: "High",
      status: "Approved",
      details: "Deployment of 120 Wi-Fi 6 access points across hostels and academic blocks.",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingList = approvals.filter((a) => a.status === "Pending Executive Seal");
  const historyList = approvals.filter((a) => a.status !== "Pending Executive Seal");

  const displayedList = (activeTab === "pending" ? pendingList : historyList).filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplySeal = (id: string, title: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Approved" } : a))
    );
    toast.success(`Executive Digital Seal Applied! Approved sanction "${id}: ${title}"`);
  };

  const handleDecline = (id: string, title: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Declined" } : a))
    );
    toast.error(`Sanction "${id}: ${title}" declined by Executive Authority.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Approvals & Digital Seal Registry"
        desc="Executive sanctioning portal: apply digital seal authorizations, audit high-value budgets, and inspect approval history."
      />

      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Executive Seals"
          value={pendingList.length}
          change="Requires Principal Authorization"
          icon={Lock}
        />
        <StatCard
          label="Approved Sanctions"
          value={approvals.filter((a) => a.status === "Approved").length}
          change="Executed This Month"
          icon={CheckCircle2}
        />
        <StatCard
          label="Declined Requests"
          value={approvals.filter((a) => a.status === "Declined").length}
          change="Audit Logged"
          icon={XCircle}
        />
        <StatCard
          label="Total Approvals Registry"
          value={approvals.length}
          change="100% Digital Audit Trail"
          icon={ShieldCheck}
        />
      </div>

      {/* Main Approvals Console */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "pending"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Pending Sanctions ({pendingList.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "history"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Approval History & Audit Logs ({historyList.length})
            </button>
          </div>

          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Title or Requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List of Approval Items */}
        <div className="space-y-3">
          {displayedList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No approval records found under this section.
            </div>
          ) : (
            displayedList.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-blue-800 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md">
                      {a.id}
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white">{a.title}</span>
                    <Badge tone={a.urgency === "High" ? "danger" : "info"}>{a.category}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{a.details}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium pt-1">
                    <span>
                      Requested by: <strong className="text-slate-700 dark:text-slate-300">{a.requestedBy}</strong>
                    </span>
                    <span>
                      Sanction Value: <strong className="text-blue-600 dark:text-blue-400">{a.amount}</strong>
                    </span>
                    <span>Submitted: {a.date}</span>
                  </div>
                </div>

                {/* Actions or Status */}
                <div className="shrink-0 flex items-center gap-2">
                  {a.status === "Pending Executive Seal" ? (
                    <>
                      <button
                        onClick={() => handleDecline(a.id, a.title)}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApplySeal(a.id, a.title)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md cursor-pointer transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="size-4" /> Apply Seal & Approve
                      </button>
                    </>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        a.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900"
                      }`}
                    >
                      {a.status === "Approved" ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      {a.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
