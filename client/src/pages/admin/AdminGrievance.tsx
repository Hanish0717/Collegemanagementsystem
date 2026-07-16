import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  HelpCircle,
  Users,
  CheckCircle,
  FileText,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Send
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminGrievance() {
  const [grievances, setGrievances] = useState([
    { id: "GRV-301", student: "Hanish Senapati", category: "Hostel Wi-Fi Outage", detail: "Wi-Fi connectivity has been broken in Block A 3rd floor for 3 days.", urgency: "High", status: "Pending" },
    { id: "GRV-302", student: "Anisha Das", category: "Library Book Shortage", detail: "Need more copies of standard Machine Learning books.", urgency: "Low", status: "In-Progress" },
    { id: "GRV-303", student: "Rohan Varma", category: "Mess Food Sanitation", detail: "Request cleaner inspection of Mess block 2 dishwashers.", urgency: "Medium", status: "Pending" }
  ]);

  const [raggingComplaints, setRaggingComplaints] = useState<any[]>([]);

  const handleResolve = (id: string, category: string) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: "Resolved" } : g));
    toast.success(`Complaint Resolved successfully: ${category}`);
  };

  const handleConveneCommittee = () => {
    toast.success("Anti-Ragging Committee meeting successfully convened! Auto-invitations dispatched to deans & HODs.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grievance Redressal Center"
        desc="Audit student complaints, track Women's Protection Cell cases, monitor Anti-Ragging committee logs, and record suggested improvements."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Grievances Logged"
          value={String(grievances.length)}
          change="3 active tickets"
          icon={ShieldAlert}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Anti-Ragging Case Files"
          value={String(raggingComplaints.length)}
          change="0 complaints logged (Complied)"
          icon={AlertTriangle}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Women Cell Cases"
          value="0 active"
          change="Full compliance audits complete"
          icon={Users}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Resolution Rate"
          value="84%"
          change="Average closure: 36 hours"
          icon={CheckCircle}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Grievance List */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Active Student Grievance Log</h3>
          <div className="space-y-3.5">
            {grievances.map(row => (
              <div key={row.id} className="p-3 border rounded-xl flex items-start justify-between gap-3 text-xs bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700">{row.id}</span>
                    <span className="font-bold text-slate-800">{row.category}</span>
                    <Badge tone={row.urgency === "High" ? "danger" : "info"} className="text-[9px] px-1.5 py-0">{row.urgency}</Badge>
                  </div>
                  <p className="text-slate-600 font-medium">{row.detail}</p>
                  <div className="text-[10px] text-slate-400 font-semibold">Reported by candidate: {row.student}</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge tone={row.status === "Resolved" ? "success" : "warn"}>{row.status}</Badge>
                  {row.status !== "Resolved" && (
                    <button
                      onClick={() => handleResolve(row.id, row.category)}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-[10px] cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Suggestion box & Committee convenor */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-2.5">Accreditation Safety Cells</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify compliance reports, publish anti-ragging banners, and schedule inspection cell briefings.
            </p>
          </div>
          <div className="space-y-2 mt-6">
            <button
              onClick={handleConveneCommittee}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="size-4 text-emerald-400" />
              <span>Convene Anti-Ragging Committee</span>
            </button>
            <button
              onClick={() => {
                toast.success("Women's Cell inspection schedule broadcasted to coordinators.");
              }}
              className="w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Schedule Women's Cell Briefing
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default AdminGrievance;
