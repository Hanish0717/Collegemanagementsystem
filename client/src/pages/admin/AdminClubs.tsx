import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Award,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  Send
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminClubs() {
  const [activeTab, setActiveTab] = useState<"directory" | "bookings" | "certificates">("directory");

  // Clubs list state
  const [clubs, setClubs] = useState([
    { id: "CLB-01", name: "IEEE Student Branch", coordinator: "Dr. Srinivas Rao", members: 142, budget: 45000, status: "Active" },
    { id: "CLB-02", name: "ACM Student Chapter", coordinator: "Dr. Rajesh Kumar", members: 98, budget: 35000, status: "Active" },
    { id: "CLB-03", name: "National Service Scheme (NSS)", coordinator: "Prof. Ramana Murthy", members: 210, budget: 15000, status: "Active" },
    { id: "CLB-04", name: "Cultural Arts Association", coordinator: "Dr. Laxmi Prasanna", members: 64, budget: 20000, status: "Pending Approval" }
  ]);

  // Event Bookings & venue requests state
  const [bookings, setBookings] = useState([
    {
      id: "EVT-801",
      club: "IEEE Student Branch",
      eventName: "National Hackathon 2026",
      venue: "Main Auditorium",
      date: "2026-08-12",
      sponsors: "Google & Intel",
      status: "Approved"
    },
    {
      id: "EVT-802",
      club: "ACM Student Chapter",
      eventName: "CyberSecurity Workshop",
      venue: "Seminar Hall A",
      date: "2026-08-19",
      sponsors: "Local IT Firms",
      status: "Pending"
    }
  ]);

  // Cert Form States
  const [certTemplate, setCertTemplate] = useState("Participation");
  const [certRecipient, setCertRecipient] = useState("");
  const [certEventName, setCertEventName] = useState("");

  const handleApproveClub = (id: string, name: string) => {
    setClubs(prev => prev.map(c => c.id === id ? { ...c, status: "Active" } : c));
    toast.success(`Club '${name}' registration request has been approved!`);
  };

  const handleApproveBooking = (id: string, name: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Approved" } : b));
    toast.success(`Venue booking for '${name}' approved successfully!`);
  };

  const handleSendCertificates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certRecipient.trim() || !certEventName.trim()) {
      toast.error("Please fill in certificate distribution details!");
      return;
    }
    toast.loading("Compiling certificate design & delivering email attachments...", { duration: 1500 });
    setTimeout(() => {
      toast.success(`Digital ${certTemplate} Certificates successfully delivered to ${certRecipient}!`);
      setCertRecipient("");
      setCertEventName("");
    }, 1600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Clubs &amp; Events Management"
        desc="Register and monitor extra-curricular student clubs, allocate budgets, approve venue bookings, and issue digital completion certificates."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Clubs"
          value="4 Active Clubs"
          change="3 academic, 1 cultural"
          icon={Users}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Total Club Members"
          value="514 Students"
          change="~38% campus participation rate"
          icon={Sparkles}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Event Bookings Pending"
          value="1 Request"
          change="Auditorium venue requests check"
          icon={Calendar}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Certificates Distributed"
          value="452 Sent"
          change="Delivered directly via email attachments"
          icon={Award}
          gradient="bg-gradient-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "directory", label: "Clubs Directory", icon: Users },
          { id: "bookings", label: "Venue Bookings & Budgets", icon: Calendar },
          { id: "certificates", label: "Certificates Issuer", icon: Award }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* DIRECTORY */}
        {activeTab === "directory" && (
          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Extra-Curricular Clubs Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Club ID</th>
                    <th className="text-left pb-2">Club Name</th>
                    <th className="text-left pb-2">Faculty Advisor Coordinator</th>
                    <th className="text-center pb-2">Active Members</th>
                    <th className="text-center pb-2">Annual Budget</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clubs.map(c => (
                    <tr key={c.id}>
                      <td className="py-3 font-mono font-bold text-indigo-700">{c.id}</td>
                      <td className="py-3 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3 font-semibold">{c.coordinator}</td>
                      <td className="py-3 text-center font-bold text-slate-600">{c.members}</td>
                      <td className="py-3 text-center font-bold text-slate-700">₹{c.budget.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        {c.status === "Active" ? (
                          <Badge tone="success">Active</Badge>
                        ) : (
                          <button
                            onClick={() => handleApproveClub(c.id, c.name)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* BOOKINGS */}
        {activeTab === "bookings" && (
          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Venue Bookings &amp; Sponsorship Approvals</h3>
            <div className="space-y-4">
              {bookings.map(row => (
                <div key={row.id} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">{row.id}</span>
                      <span className="font-bold text-slate-800">{row.eventName}</span>
                      <Badge tone="info" className="text-[9px]">{row.club}</Badge>
                    </div>
                    <div className="text-slate-500 font-semibold flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1"><MapPin className="size-3 text-indigo-500" /> {row.venue}</span>
                      <span>Scheduled: {row.date}</span>
                      <span>Sponsors: {row.sponsors}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {row.status === "Approved" ? (
                      <Badge tone="success">Approved</Badge>
                    ) : (
                      <button
                        onClick={() => handleApproveBooking(row.id, row.eventName)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                      >
                        <CheckCircle className="size-3" /> Approve Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1.5">Distribute Digital Certificates</h3>
                <p className="text-[10px] text-slate-500 mb-4">Deliver credentials automatically to student participants via email.</p>

                <form onSubmit={handleSendCertificates} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Certificate Template Type</label>
                    <select
                      value={certTemplate}
                      onChange={(e) => setCertTemplate(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="Participation">Certificate of Participation</option>
                      <option value="Merit">Certificate of Merit (Winner)</option>
                      <option value="Coordination">Certificate of Organizing (Coordinator)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Event Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. National Hackathon 2026"
                      value={certEventName}
                      onChange={(e) => setCertEventName(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Recipient List (Email / Group)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. hackathon-winners@college.com"
                      value={certRecipient}
                      onChange={(e) => setCertRecipient(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="size-3.5" /> Send Digital Certificates
                  </button>
                </form>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Distributions Logs</h3>
              <div className="space-y-3.5">
                {[
                  { event: "National Hackathon 2026", count: 124, type: "Participation", date: "2026-07-10" },
                  { event: "Smart Agriculture Bootcamp", count: 15, type: "Merit (Winners)", date: "2026-06-25" }
                ].map((row, idx) => (
                  <div key={idx} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800">{row.event}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Type: {row.type} | Sent Date: {row.date}</div>
                    </div>
                    <Badge tone="success">{row.count} Certificates Sent</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}
export default AdminClubs;
