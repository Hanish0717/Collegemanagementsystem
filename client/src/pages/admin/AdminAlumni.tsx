import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Award,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  MessageSquare,
  Bookmark,
  Gift
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminAlumni() {
  const [activeTab, setActiveTab] = useState<"alumni" | "mentorship" | "awards">("alumni");

  const [awards, setAwards] = useState([
    { id: "AWD-01", nominee: "Anish Senapati", classOf: 2021, awardName: "Young Alumnus Achievement Award", category: "Technology Innovation", year: 2025 },
    { id: "AWD-02", nominee: "Sahil Varma", classOf: 2019, awardName: "Distinguished Service Award", category: "Institutional Philanthropy", year: 2026 }
  ]);

  const [alumni, setAlumni] = useState([
    { id: "ALM-801", name: "Anish Senapati", classOf: 2021, company: "Google", role: "Software Engineer L4", email: "anish.s@alumni.com" },
    { id: "ALM-802", name: "Sahil Varma", classOf: 2019, company: "Amazon", role: "Solutions Architect", email: "sahil.v@alumni.com" },
    { id: "ALM-803", name: "Ritika Roy", classOf: 2022, company: "Microsoft", role: "Data Scientist", email: "ritika.r@alumni.com" }
  ]);

  const [donations, setDonations] = useState([
    { id: "DON-01", donor: "Sahil Varma", amount: 150000, cause: "AIML Lab Supercomputing Fund", date: "June 12" },
    { id: "DON-02", donor: "Anish Senapati", amount: 50000, cause: "Library E-Books Subscription", date: "July 01" }
  ]);

  const [mentorMatches, setMentorMatches] = useState([
    { id: "MNT-01", mentor: "Ritika Roy", student: "Priya Sharma (CSE)", status: "Active" }
  ]);

  const [donationAmount, setDonationAmount] = useState("");
  const [donationDonor, setDonationDonor] = useState("Anish Senapati");
  const [donationCause, setDonationCause] = useState("AIML Lab Supercomputing Fund");

  const handleMatchMentor = () => {
    toast.success("New Mentorship assignment scheduled! Invitation sent to Mentor Ritika Roy & Student Amit Verma.");
  };

  const handleRecordDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationAmount.trim()) {
      toast.error("Please enter a donation amount!");
      return;
    }
    const newDon = {
      id: `DON-${String(donations.length + 1).padStart(2, "0")}`,
      donor: donationDonor,
      amount: Number(donationAmount),
      cause: donationCause,
      date: "Just now"
    };
    setDonations([newDon, ...donations]);
    toast.success(`Donation of ₹${Number(donationAmount).toLocaleString()} registered successfully!`);
    setDonationAmount("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumni &amp; Mentorship Portal"
        desc="Maintain institutional alumni directories, track charitable donor endowments, and coordinate industry student mentorship partnerships."
      />
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto mb-4">
        {[
          { id: "alumni", label: "Alumni & Endowments", icon: Users },
          { id: "mentorship", label: "Mentorship Directory", icon: Bookmark },
          { id: "awards", label: "Distinguished Awards", icon: Gift }
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

      {activeTab === "alumni" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Alumni"
          value="8,420 grads"
          change="Across 14 graduation classes"
          icon={Users}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Total Endowments"
          value="₹28.5 Lakhs"
          change="12 capital contributions"
          icon={DollarSign}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Mentorship Matches"
          value="142 active pairs"
          change="Weekly check-ins checked"
          icon={Award}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Reunions Scheduled"
          value="1 reunion"
          change="December Silver Jubilee event"
          icon={Calendar}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Alumni list */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Alumni Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Alumni ID</th>
                  <th className="text-left pb-2">Grad Name</th>
                  <th className="text-left pb-2">Class Of</th>
                  <th className="text-left pb-2">Current Organization &amp; Role</th>
                  <th className="text-right pb-2">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumni.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-slate-400">{row.id}</td>
                    <td className="py-2.5 font-bold text-slate-800">{row.name}</td>
                    <td className="py-2.5 text-slate-500 font-bold">B.Tech {row.classOf}</td>
                    <td className="py-2.5 font-medium">{row.role} at <span className="font-bold text-indigo-700">{row.company}</span></td>
                    <td className="py-2.5 text-right text-slate-400 font-medium">{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Record Donation */}
        <Card>
          <h3 className="font-semibold mb-2">Record Alumni Gift</h3>
          <p className="text-xs text-muted-foreground mb-4">Log tax-exempt monetary endowments or facility donations.</p>
          <form onSubmit={handleRecordDonation} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Select Donor</label>
              <select
                value={donationDonor}
                onChange={(e) => setDonationDonor(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              >
                {alumni.map(a => (
                  <option key={a.id} value={a.name}>{a.name} (Class of {a.classOf})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Contribution Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 50000"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Project Cause</label>
              <select
                value={donationCause}
                onChange={(e) => setDonationCause(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
              >
                <option value="AIML Lab Supercomputing Fund">AIML Lab Supercomputing Fund</option>
                <option value="Library E-Books Subscription">Library E-Books Subscription</option>
                <option value="Hostel Common Room Recreation">Hostel Common Room Recreation</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Record Donation Receipt
            </button>
          </form>
        </Card>


        {/* Donations Log */}
        <Card className="lg:col-span-3">
          <h3 className="font-semibold mb-3">Endowment Logs Journal</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Receipt</th>
                  <th className="text-left pb-2">Donor Name</th>
                  <th className="text-left pb-2">Capital Amount</th>
                  <th className="text-left pb-2">Target Cause</th>
                  <th className="text-right pb-2">Date Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map(row => (
                  <tr key={row.id}>
                    <td className="py-2.5 font-mono font-bold text-slate-400">{row.id}</td>
                    <td className="py-2.5 font-bold text-slate-800">{row.donor}</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-600">₹{row.amount.toLocaleString()}</td>
                    <td className="py-2.5 font-medium">{row.cause}</td>
                    <td className="py-2.5 text-right text-slate-400 font-semibold">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
        </>
      )}

      {/* MENTORSHIP DIRECTORY */}
      {activeTab === "mentorship" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Industry Student Mentorship Registry</h3>
            <div className="space-y-3">
              {mentorMatches.map(row => (
                <div key={row.id} className="p-3.5 border rounded-xl flex items-center justify-between text-xs bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">{row.id}</span>
                      <span className="font-bold text-slate-800">{row.mentor} (Mentor)</span>
                    </div>
                    <div className="text-slate-500 font-semibold">Assigned Candidate: {row.student}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="success">{row.status}</Badge>
                    <button
                      onClick={() => {
                        setMentorMatches(prev => prev.filter(m => m.id !== row.id));
                        toast.info("Mentorship mapping archived.");
                      }}
                      className="p-1 hover:bg-rose-50 text-rose-600 rounded transition cursor-pointer"
                      title="Deactivate Match"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-1.5">Pair New Mentor</h3>
            <p className="text-xs text-muted-foreground mb-4">Assign industry mentors to guide current students.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const mentorName = (form.elements.namedItem("mentorName") as HTMLInputElement).value;
                const studentName = (form.elements.namedItem("studentName") as HTMLInputElement).value;

                if (!mentorName.trim() || !studentName.trim()) {
                  toast.error("Please fill in both names!");
                  return;
                }

                const newMatch = {
                  id: `MNT-0${mentorMatches.length + 1}`,
                  mentor: mentorName,
                  student: studentName + " (CSE)",
                  status: "Active"
                };
                setMentorMatches([...mentorMatches, newMatch]);
                toast.success(`Mentorship pair assigned: ${mentorName} -> ${studentName}`);
                form.reset();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mentor Name</label>
                <input
                  name="mentorName"
                  type="text"
                  required
                  placeholder="e.g. Sahil Varma"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Student Name</label>
                <input
                  name="studentName"
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Create Pair Match
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* DISTINGUISHED ALUMNI AWARDS */}
      {activeTab === "awards" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Distinguished Alumni Awards Registry</h3>
            <Badge tone="success">Accreditation Verified</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Award ID</th>
                  <th className="text-left pb-2">Nominee Name</th>
                  <th className="text-left pb-2">Graduation Class</th>
                  <th className="text-left pb-2">Award Title</th>
                  <th className="text-left pb-2">Nomination Category</th>
                  <th className="text-right pb-2">Year Awarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {awards.map(award => (
                  <tr key={award.id}>
                    <td className="py-3 font-mono font-bold text-slate-400">{award.id}</td>
                    <td className="py-3 font-bold text-slate-800">{award.nominee}</td>
                    <td className="py-3 font-mono text-slate-500 font-semibold">B.Tech {award.classOf}</td>
                    <td className="py-3 font-bold text-indigo-700">{award.awardName}</td>
                    <td className="py-3 font-medium text-slate-600">{award.category}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">{award.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
export default AdminAlumni;
