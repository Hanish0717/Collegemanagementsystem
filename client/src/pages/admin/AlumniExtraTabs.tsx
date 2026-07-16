import { useState } from "react";
import { Plus, Search, MapPin, DollarSign, Calendar, CheckCircle, Award, Briefcase, HelpCircle, Mail, Phone, Image } from "lucide-react";
import { Card, StatCard } from "@/components/dashboard/ui";

// ── EVENT GALLERY TAB ─────────────────────────────────────
export function EventGalleryTab({ eventList }: any) {
  const placeholders = [
    "Grand Alumni Reunion 2024", "Silver Jubilee Dinner", "Annual Tech Talk", "Batch 2010 Get-Together",
    "Homecoming Weekend", "Industry Networking Night", "Campus Walk 25th Anniversary", "Cultural Evening 2023",
  ];
  const colors = [
    "from-indigo-500 to-violet-600", "from-pink-500 to-rose-600", "from-cyan-500 to-blue-600",
    "from-amber-500 to-orange-600", "from-emerald-500 to-teal-600", "from-purple-500 to-violet-600",
    "from-red-500 to-pink-600", "from-sky-500 to-indigo-600",
  ];
  const gallery = (eventList?.length ?? 0) > 0
    ? eventList.map((ev: any, i: number) => ({ title: ev.title, date: ev.date, color: colors[i % colors.length] }))
    : placeholders.map((title, i) => ({ title, date: `2024-0${(i % 9) + 1}-15`, color: colors[i % colors.length] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Event Gallery</h2>
          <p className="text-sm text-muted-foreground">Visual memories from alumni events and reunions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition">
          <Plus className="size-4" /> Upload Photos
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((item: any, i: number) => (
          <div
            key={i}
            className={`rounded-2xl bg-gradient-to-br ${item.color} aspect-square flex flex-col items-center justify-center p-4 text-white text-center cursor-pointer hover:scale-105 transition-transform shadow-soft`}
          >
            <Image className="size-8 mb-2 opacity-60" />
            <div className="font-semibold text-sm leading-tight">{item.title}</div>
            <div className="text-[11px] opacity-70 mt-1">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── INTERNSHIPS TAB ───────────────────────────────────────
export function InternshipsTab({ alumniList }: any) {
  const [search, setSearch] = useState("");
  const internships = [
    { id: 1, title: "Software Engineering Intern", company: "Google India", location: "Hyderabad", duration: "6 months", stipend: "₹60,000/month", skills: ["Python", "ML", "APIs"], batch: 2018, deadline: "2024-09-30", type: "Tech" },
    { id: 2, title: "Data Science Intern", company: "Microsoft", location: "Bengaluru", duration: "3 months", stipend: "₹45,000/month", skills: ["Python", "SQL", "Power BI"], batch: 2019, deadline: "2024-08-15", type: "Data" },
    { id: 3, title: "Product Management Intern", company: "Flipkart", location: "Bengaluru", duration: "4 months", stipend: "₹35,000/month", skills: ["Product", "Analytics", "Agile"], batch: 2020, deadline: "2024-10-01", type: "Management" },
    { id: 4, title: "Cloud Infrastructure Intern", company: "Amazon Web Services", location: "Pune", duration: "6 months", stipend: "₹55,000/month", skills: ["AWS", "Linux", "Docker"], batch: 2017, deadline: "2024-09-15", type: "Cloud" },
    { id: 5, title: "UI/UX Design Intern", company: "Swiggy", location: "Bengaluru", duration: "3 months", stipend: "₹30,000/month", skills: ["Figma", "Design", "Research"], batch: 2021, deadline: "2024-08-31", type: "Design" },
    { id: 6, title: "Finance & Strategy Intern", company: "Goldman Sachs", location: "Mumbai", duration: "2 months", stipend: "₹70,000/month", skills: ["Finance", "Excel", "Strategy"], batch: 2016, deadline: "2024-07-31", type: "Finance" },
  ];
  const filtered = internships.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) || i.company.toLowerCase().includes(search.toLowerCase())
  );
  const typeColors: Record<string, string> = {
    Tech: "bg-indigo-100 text-indigo-700", Data: "bg-cyan-100 text-cyan-700",
    Management: "bg-amber-100 text-amber-700", Cloud: "bg-sky-100 text-sky-700",
    Design: "bg-pink-100 text-pink-700", Finance: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Internship Opportunities</h2>
          <p className="text-sm text-muted-foreground">Internships shared by alumni from top companies</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search internships…"
              className="pl-9 pr-3 py-2 border rounded-xl text-sm bg-background outline-none w-full sm:w-56"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition shrink-0">
            <Plus className="size-4" /> Post Internship
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <Card key={item.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-sm">{item.title}</div>
                <div className="text-xs text-indigo-600 font-semibold">{item.company}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${typeColors[item.type] ?? "bg-gray-100 text-gray-700"}`}>{item.type}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.skills.map(s => <span key={s} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-medium">{s}</span>)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5"><MapPin className="size-3" />{item.location} · {item.duration}</div>
              <div className="flex items-center gap-1.5"><DollarSign className="size-3" />{item.stipend}</div>
              <div className="flex items-center gap-1.5"><Calendar className="size-3" />Deadline: {item.deadline}</div>
            </div>
            <div className="pt-2 border-t flex items-center justify-between">
              <div className="text-[10px] text-muted-foreground">Batch {item.batch}</div>
              <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition">Apply Now</button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground text-sm">No internships found.</div>}
      </div>
    </div>
  );
}

// ── PLACEMENT PORTAL TAB ──────────────────────────────────
export function PlacementPortalTab({ alumniList, stats }: any) {
  const batchStats = [
    { batch: "2024", eligible: 420, placed: 390, rate: 93, avgPkg: "₹8.4 LPA", topPkg: "₹32 LPA", recruiter: "Microsoft" },
    { batch: "2023", eligible: 398, placed: 371, rate: 93, avgPkg: "₹7.8 LPA", topPkg: "₹28 LPA", recruiter: "Google" },
    { batch: "2022", eligible: 410, placed: 390, rate: 95, avgPkg: "₹7.2 LPA", topPkg: "₹24 LPA", recruiter: "Amazon" },
    { batch: "2021", eligible: 385, placed: 350, rate: 91, avgPkg: "₹6.5 LPA", topPkg: "₹20 LPA", recruiter: "Infosys" },
  ];
  const recruiters = ["Google", "Microsoft", "Amazon", "Flipkart", "TCS", "Wipro", "Infosys", "Cognizant", "Goldman Sachs", "Deloitte"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Placement Portal</h2>
        <p className="text-sm text-muted-foreground">Batch-wise placement statistics and top recruiters</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Avg Placement Rate" value="93%" change="Last 4 batches" icon={CheckCircle} gradient="from-emerald-500 to-teal-600" />
        <StatCard label="Avg Package" value="₹7.5 LPA" change="All branches" icon={DollarSign} gradient="from-indigo-500 to-violet-600" />
        <StatCard label="Top Package" value="₹32 LPA" change="Batch 2024" icon={Award} gradient="from-amber-500 to-orange-600" />
        <StatCard label="Active Recruiters" value={`${recruiters.length}+`} change="This cycle" icon={Briefcase} gradient="from-rose-500 to-pink-600" />
      </div>
      <Card>
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">Batch-wise Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                {["Batch", "Eligible", "Placed", "Rate", "Avg Package", "Top Package", "Top Recruiter"].map(h => (
                  <th key={h} className="py-2 px-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batchStats.map(row => (
                <tr key={row.batch} className="border-b hover:bg-muted/30 transition">
                  <td className="py-3 px-3 font-bold">{row.batch}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.eligible}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-600">{row.placed}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{row.rate}%</span>
                  </td>
                  <td className="py-3 px-3 font-semibold">{row.avgPkg}</td>
                  <td className="py-3 px-3 font-bold text-indigo-600">{row.topPkg}</td>
                  <td className="py-3 px-3">{row.recruiter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">Top Recruiters</h3>
        <div className="flex flex-wrap gap-3">
          {recruiters.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-muted/30 hover:bg-muted/60 transition cursor-pointer">
              <div className="size-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">{r[0]}</div>
              <span className="text-sm font-semibold">{r}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── HELP TAB ──────────────────────────────────────────────
export function HelpTab() {
  const faqs = [
    { q: "How do I register as an alumni?", a: "Go to Alumni Management → Alumni Registration and fill in your graduation details. Your profile will be reviewed and approved by the coordinator." },
    { q: "How can I post a job for current students?", a: "Navigate to Career → Job Portal and click 'Post New Job'. Fill in the job details and it will be visible to all registered students." },
    { q: "How do I donate to the alumni fund?", a: "Visit Contributions → Donations, choose your preferred donation amount and payment method. All donations are tax-deductible under Section 80G." },
    { q: "How does the mentorship program work?", a: "Register in Community → Mentorship as a mentor. Students and juniors can request sessions. You can approve or decline and schedule via the calendar." },
    { q: "How do I update my profile?", a: "Go to Alumni Management → Alumni Profiles. Select your profile and click Edit to update your current job, location, skills, and social links." },
    { q: "Can I see who else is in my batch?", a: "Yes! In Alumni Management → Alumni Directory, use the Graduation Year filter to see all members of your batch." },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="size-6" />
          <div className="text-xl font-bold">Help & Support</div>
        </div>
        <p className="text-white/80 text-sm">Find answers to common questions or contact the alumni team for assistance.</p>
      </div>
      <Card>
        <h3 className="font-semibold text-sm mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-xl p-4 hover:bg-muted/30 transition">
              <div className="font-semibold text-sm mb-1.5 flex items-start gap-2">
                <span className="size-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {faq.q}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-sm mb-4">Contact Alumni Team</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Email Support", value: "alumni@college.edu", icon: Mail, cls: "bg-indigo-100 text-indigo-700" },
            { label: "Phone", value: "+91 98765 43210", icon: Phone, cls: "bg-emerald-100 text-emerald-700" },
            { label: "Office Hours", value: "Mon–Fri 9AM–5PM", icon: Calendar, cls: "bg-amber-100 text-amber-700" },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-3 p-3 border rounded-xl">
              <div className={`p-2 rounded-lg ${c.cls}`}><c.icon className="size-4" /></div>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{c.label}</div>
                <div className="text-sm font-semibold">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
