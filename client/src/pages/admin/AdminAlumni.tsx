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
  Bookmark
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminAlumni() {
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
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Donations Log */}
        <Card className="lg:col-span-2">
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

        {/* Mentorship pairing */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1.5">Mentorship Coordination</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Match industry-expert alumni with current student prospects to guide resumes, interview preparations, and job applications.
            </p>
            <div className="space-y-2.5">
              {mentorMatches.map(row => (
                <div key={row.id} className="p-3 border rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
                  <div>
                    <span className="font-bold text-slate-800">{row.mentor}</span>
                    <span className="text-slate-400 block text-[10px] mt-0.5">Assigned student: {row.student}</span>
                  </div>
                  <Badge tone="success">{row.status}</Badge>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleMatchMentor}
            className="w-full mt-4 py-2.5 rounded-xl border flex items-center gap-2 justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Assign New Mentor Match
          </button>
        </Card>
      </div>
    </div>
  );
}
export default AdminAlumni;
