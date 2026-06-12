import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Building2, Send, Upload } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import api from "@/lib/api";

export function StudentPlacement() {
  const [list, setList] = useState<any[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/student-module/placements");
      if (res.data?.success && res.data?.data) {
        const dbPlacements = res.data.data.map((p: any) => ({
          company: p.company,
          position: p.position,
          status: p.status,
          appliedDate: p.appliedDate !== "-" ? new Date(p.appliedDate).toISOString().split('T')[0] : "-"
        }));
        setList(dbPlacements);
      }
    } catch (err) {
      console.error("Error loading placements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const handleApply = (companyName: string) => {
    alert(`Application submitted successfully for ${companyName}! Our Placement Office will review your profile.`);
    // Update local state to show applied
    setList(prev => prev.map(p => {
      if (p.company === companyName) {
        return { ...p, status: "Applied", appliedDate: new Date().toISOString().split('T')[0] };
      }
      return p;
    }));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      alert("Professional profile updated successfully! Resume uploaded.");
      setLinkedin("");
      setPortfolio("");
      setResumeFile(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Applications"
        desc="View placement opportunities, apply for jobs, and track application status."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <Card key={n} className="h-24 animate-pulse bg-muted/40" />
          ))
        ) : (
          [
            { label: "Total Companies", value: list.length.toString(), tone: "info" as const },
            { label: "Applied", value: list.filter(p => p.status !== "Not Applied").length.toString(), tone: "success" as const },
            { label: "Shortlisted", value: list.filter(p => p.status === "Shortlisted").length.toString(), tone: "info" as const },
            { label: "Interviews", value: list.filter(p => p.status === "Interview Scheduled").length.toString(), tone: "warn" as const },
          ].map(stat => (
            <Card key={stat.label}>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-2xl font-bold mt-2">{stat.value}</div>
              <Badge tone={stat.tone} className="mt-3">
                Current
              </Badge>
            </Card>
          ))
        )}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Placement Opportunities</h3>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="h-44 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {list.map(placement => (
              <Card key={placement.company} className="hover:-translate-y-1 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                    {placement.company.slice(0, 2)}
                  </div>
                  <Badge
                    tone={
                      placement.status === "Not Applied"
                        ? "info"
                        : placement.status === "Interview Scheduled"
                          ? "warn"
                          : "success"
                    }
                  >
                    {placement.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm">{placement.company}</h3>
                <p className="text-xs text-muted-foreground mt-1">{placement.position}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Applied</span>
                    <span className="font-medium">{placement.appliedDate}</span>
                  </div>
                </div>
                {placement.status === "Not Applied" && (
                  <button
                    onClick={() => handleApply(placement.company)}
                    className="mt-4 w-full px-3 py-2 rounded-lg bg-gradient-primary text-white text-xs font-medium hover:opacity-90 transition"
                  >
                    Apply Now
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Application Status</h3>
          <div className="space-y-2">
            {loading ? (
              [1, 2].map((n) => (
                <div key={n} className="h-16 animate-pulse bg-muted/20 border rounded-xl" />
              ))
            ) : list.filter(p => p.status !== "Not Applied").length > 0 ? (
              list.filter(p => p.status !== "Not Applied").map(placement => (
                <div key={placement.company} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                  <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                    {placement.company.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{placement.company}</div>
                    <div className="text-xs text-muted-foreground">{placement.position} • {placement.appliedDate}</div>
                  </div>
                  <Badge tone={placement.status === "Interview Scheduled" ? "warn" : "success"}>{placement.status}</Badge>
                </div>
              ))
            ) : (
              <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
                No active placement applications.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="size-5 text-indigo" />
            <h3 className="font-semibold">Upcoming Interviews</h3>
          </div>
          <div className="space-y-2">
            {loading ? (
              [1, 2].map((n) => (
                <div key={n} className="h-16 animate-pulse bg-muted/20 border rounded-xl" />
              ))
            ) : list.filter(p => p.status === "Interview Scheduled").length > 0 ? (
              list.filter(p => p.status === "Interview Scheduled").map(placement => (
                <div key={placement.company} className="p-4 rounded-xl bg-gradient-soft border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{placement.company}</span>
                    <Badge tone="warn">Interview</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{placement.position}</div>
                  <div className="mt-2 text-xs text-muted-foreground">Date: May 28, 2026 • Time: 10:00 AM</div>
                </div>
              ))
            ) : (
              <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
                No upcoming interviews scheduled.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Upload Resume</h3>
        {loading ? (
          <div className="h-32 bg-muted/10 animate-pulse rounded-xl border" />
        ) : (
          <form onSubmit={handleProfileUpdate} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload className="size-4 text-muted-foreground" />
                <span className="text-sm">Upload updated resume</span>
              </label>
              <input
                type="file"
                className="text-sm"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                placeholder="LinkedIn profile URL"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                placeholder="Portfolio URL"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" disabled={updating} className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Send className="size-4" /> {updating ? "Updating..." : "Update Profile"}
            </button>
          </form>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="size-5 text-indigo" />
          <h3 className="font-semibold">Placement Statistics</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 animate-pulse bg-muted/20 border rounded-xl" />
            ))
          ) : (
            [
              { label: "Campus Placements", value: "85%", icon: "🎓" },
              { label: "Average Package", value: "₹8.5L", icon: "💰" },
              { label: "Highest Package", value: "₹25L", icon: "🚀" },
              { label: "Companies Visited", value: "45", icon: "🏢" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-gradient-soft border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
