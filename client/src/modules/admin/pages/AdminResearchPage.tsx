import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  FileText,
  DollarSign,
  Plus,
  Bookmark,
  CheckCircle,
  HelpCircle,
  FileSignature
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminResearch() {
  const [activeTab, setActiveTab] = useState<"projects" | "patents" | "fellowships">("projects");

  // Research Projects State
  const [projects, setProjects] = useState([
    {
      id: "PRJ-101",
      title: "AI-Powered Smart Grid Energy Optimization",
      agency: "DST (Dept of Science & Tech)",
      investigator: "Dr. Srinivas Rao",
      amount: 4500000,
      seedMoney: 200000,
      status: "Ongoing"
    },
    {
      id: "PRJ-102",
      title: "IoT Systems for Precision Agriculture",
      agency: "AICTE Research Promotion Scheme",
      investigator: "Dr. Rajesh Kumar",
      amount: 1800000,
      seedMoney: 150000,
      status: "Approved"
    },
    {
      id: "PRJ-103",
      title: "VLSI Design Architectures for Cryptography",
      agency: "UGC Seed Grant",
      investigator: "Prof. Ramana Murthy",
      amount: 1200000,
      seedMoney: 100000,
      status: "Submitted"
    }
  ]);

  // Patents State
  const [patents, setPatents] = useState([
    {
      id: "PAT-001",
      title: "Real-time Vehicle Collision Prevention System",
      inventor: "Dr. Rajesh Kumar",
      status: "Published",
      index: "Scopus",
      journal: "IEEE Transactions on Intelligent Vehicles"
    },
    {
      id: "PAT-002",
      title: "Decentralized Medical Record Storage System",
      inventor: "Dr. Srinivas Rao",
      status: "Filed",
      index: "Scopus",
      journal: "Elsevier Journal of Systems Medicine"
    }
  ]);

  // PhD Fellowships State
  const [fellowships, setFellowships] = useState([
    {
      id: "FEL-501",
      candidate: "Aman Sharma",
      guide: "Dr. Srinivas Rao",
      topic: "Deep Learning in Healthcare Diagnostics",
      stipend: 35000,
      status: "Disbursed"
    },
    {
      id: "FEL-502",
      candidate: "Nisha Patel",
      guide: "Dr. Rajesh Kumar",
      topic: "IoT-Enabled Waste Management Optimization",
      stipend: 35000,
      status: "Pending"
    }
  ]);

  // Form States
  const [newTitle, setNewTitle] = useState("");
  const [newAgency, setNewAgency] = useState("");
  const [newInvestigator, setNewInvestigator] = useState("");
  const [newAmount, setNewAmount] = useState(0);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAgency.trim() || !newInvestigator.trim() || newAmount <= 0) {
      toast.error("Please fill in all research project details!");
      return;
    }
    const newPrj = {
      id: `PRJ-${Math.floor(104 + Math.random() * 900)}`,
      title: newTitle,
      agency: newAgency,
      investigator: newInvestigator,
      amount: newAmount,
      seedMoney: Math.round(newAmount * 0.1),
      status: "Submitted"
    };
    setProjects([newPrj, ...projects]);
    toast.success("Research Grant proposal registered successfully!");
    setNewTitle("");
    setNewAgency("");
    setNewInvestigator("");
    setNewAmount(0);
  };

  const handleDisburseStipend = (id: string, candidate: string) => {
    setFellowships(prev => prev.map(f => f.id === id ? { ...f, status: "Disbursed" } : f));
    toast.success(`PhD stipend disbursed to ${candidate}!`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research, Development &amp; Innovation Cell (R&amp;D)"
        desc="Administer sponsored research projects, track patents &amp; journal publications, and manage PhD research fellowships."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total R&amp;D Funding"
          value="₹75.0 Lakhs"
          change="3 Active External Grants"
          icon={DollarSign}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Publications (Scopus/WoS)"
          value="18 Journals"
          change="+4 published this semester"
          icon={BookOpen}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Patents Filed / Granted"
          value="6 Patents"
          change="2 filed, 4 published"
          icon={Award}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="PhD Scholars Registrations"
          value="12 Scholars"
          change="Full stipend fellowship support"
          icon={FileSignature}
          gradient="bg-gradient-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "projects", label: "Research Grants & Projects", icon: DollarSign },
          { id: "patents", label: "Patents & Publications", icon: Award },
          { id: "fellowships", label: "PhD Fellowships", icon: FileSignature }
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
        {/* PROJECTS */}
        {activeTab === "projects" && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Roster */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Sponsored Research Projects</h3>
              <div className="space-y-3.5">
                {projects.map(prj => (
                  <div key={prj.id} className="p-4 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">{prj.id}</span>
                        <span className="font-bold text-slate-800 leading-tight">{prj.title}</span>
                      </div>
                      <div className="text-slate-500 font-semibold">
                        Investigator: {prj.investigator} | Agency: {prj.agency}
                      </div>
                      <div className="flex gap-4 text-[10px] text-slate-400 font-bold pt-1">
                        <span>Grant Amount: ₹{prj.amount.toLocaleString()}</span>
                        <span>Seed Money: ₹{prj.seedMoney.toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge tone={prj.status === "Ongoing" ? "success" : prj.status === "Approved" ? "info" : "warn"}>
                      {prj.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Add Proposal Form */}
            <Card>
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Register Grant Proposal</h3>
              <form onSubmit={handleAddProject} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart City IoT Grid"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Funding Agency</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DST / AICTE"
                    value={newAgency}
                    onChange={(e) => setNewAgency(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Investigator</label>
                    <input
                      type="text"
                      required
                      placeholder="Principal PI"
                      value={newInvestigator}
                      onChange={(e) => setNewInvestigator(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Budget (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Total funding"
                      value={newAmount || ""}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Submit Grant Proposal
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* PATENTS & PUBLICATIONS */}
        {activeTab === "patents" && (
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-slate-800 text-sm mb-3">IPR &amp; Patents Filed</h3>
              <div className="space-y-3.5">
                {patents.map(pat => (
                  <div key={pat.id} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 leading-tight">{pat.title}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Inventor: {pat.inventor}</div>
                    </div>
                    <Badge tone={pat.status === "Published" ? "success" : "info"}>{pat.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Journal Publications Indexing</h3>
              <div className="space-y-3.5">
                {patents.map(pat => (
                  <div key={pat.id + "pub"} className="p-3 border rounded-xl bg-slate-50/50 space-y-1 text-xs">
                    <div className="font-bold text-slate-800 leading-tight">{pat.journal}</div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold pt-1">
                      <span>Indexed: {pat.index}</span>
                      <Badge tone="success">Peer Reviewed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* FELLOWSHIPS */}
        {activeTab === "fellowships" && (
          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">PhD Research Fellowship Disbursements</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Scholar ID</th>
                    <th className="text-left pb-2">Scholar Name</th>
                    <th className="text-left pb-2">Supervisor (Guide)</th>
                    <th className="text-left pb-2">Research Area Topic</th>
                    <th className="text-center pb-2">Stipend Amount</th>
                    <th className="text-right pb-2">Disbursement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fellowships.map(fel => (
                    <tr key={fel.id}>
                      <td className="py-3 font-mono font-bold text-indigo-700">{fel.id}</td>
                      <td className="py-3 font-bold text-slate-800">{fel.candidate}</td>
                      <td className="py-3 font-semibold">{fel.guide}</td>
                      <td className="py-3 text-slate-500 font-semibold">{fel.topic}</td>
                      <td className="py-3 text-center font-bold text-slate-700">₹{fel.stipend.toLocaleString()}/mo</td>
                      <td className="py-3 text-right">
                        {fel.status === "Disbursed" ? (
                          <Badge tone="success">Disbursed</Badge>
                        ) : (
                          <button
                            onClick={() => handleDisburseStipend(fel.id, fel.candidate)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition"
                          >
                            Disburse
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
      </motion.div>
    </div>
  );
}
export default AdminResearch;
