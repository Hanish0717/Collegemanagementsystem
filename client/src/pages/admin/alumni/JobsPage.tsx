import React, { useState, useMemo } from "react";
import { useAlumni } from "../AdminAlumni";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { FormGroup, StyledInput, FileUploadZone } from "./components/FormElements";
import { Briefcase, Search, Filter, Bookmark, MapPin, Building2, ChevronDown, CheckCircle2, X, FileText, Send, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAlumniJob, applyForJob } from "@/services/alumniService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function JobsPage() {
  const { jobList, jobsLoading } = useAlumni();
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const queryClient = useQueryClient();

  // Sidebar Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  // Dialog / Modals states
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isSavedJobsOpen, setIsSavedJobsOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  // Form states
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    type: "Full-time",
    location: "",
    experience: "3-5 years",
    salary: "₹12,00,000 - ₹18,00,000",
    deadline: "",
    description: ""
  });

  const [applyForm, setApplyForm] = useState({
    resumeName: "",
    resumeSize: 0,
    alumniName: ""
  });

  // Mutations
  const postJobMutation = useMutation({
    mutationFn: (payload: any) => postAlumniJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success("Job opportunity posted successfully!");
      setIsPostJobOpen(false);
      setJobForm({
        title: "",
        company: "",
        type: "Full-time",
        location: "",
        experience: "3-5 years",
        salary: "₹12,00,000 - ₹18,00,000",
        deadline: "",
        description: ""
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post job listing.");
    }
  });

  const applyJobMutation = useMutation({
    mutationFn: ({ jobId, resumeUrl }: { jobId: string; resumeUrl: string }) => 
      applyForJob(jobId, "alm-current-user", resumeUrl),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setIsApplyModalOpen(false);
      setApplyForm({ resumeName: "", resumeSize: 0, alumniName: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit job application.");
    }
  });

  if (jobsLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 h-96 bg-muted rounded-3xl" />
          <div className="lg:col-span-3 h-96 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  // Base mock jobs
  const baseJobs = (jobList || []).map((j: any) => ({
    id: j.id,
    title: j.title || "Job Opportunity",
    company: j.company || "Enterprise Corp",
    type: j.type || "Full-time",
    location: j.location || "Bengaluru, India",
    experience: j.experience || "2-5 years",
    salary: j.salary ? (j.salary.startsWith("$") ? j.salary : j.salary) : "₹8,00,000 - ₹12,00,000",
    deadline: j.deadline || "2026-08-30",
    description: j.description || ""
  }));

  const mockJobs = baseJobs.length > 0 ? baseJobs : [
    { id: 1, title: "Senior Frontend Developer", company: "Google", type: "Full-time", location: "Bengaluru, Karnataka", experience: "5-7 years", salary: "₹35,00,000 - ₹45,00,000", deadline: "2026-08-30", description: "Vite, React, TypeScript stack." },
    { id: 2, title: "Backend Engineer", company: "Stripe", type: "Remote", location: "Remote", experience: "3-5 years", salary: "₹24,00,000 - ₹30,00,000", deadline: "2026-08-25", description: "Ruby on Rails, PostgreSQL, AWS infrastructure." },
    { id: 3, title: "Product Manager", company: "Microsoft", type: "Full-time", location: "Hyderabad, Telangana", experience: "4-6 years", salary: "₹28,00,000 - ₹35,00,000", deadline: "2026-09-15", description: "Define product specifications for Cloud services." }
  ];

  // Filtering logic
  const filteredJobs = mockJobs.filter((j: any) => {
    const matchesSearch = 
      j.title.toLowerCase().includes(search.toLowerCase()) || 
      j.company.toLowerCase().includes(search.toLowerCase());
    
    const matchesLoc = 
      !locationSearch || 
      j.location.toLowerCase().includes(locationSearch.toLowerCase());

    const matchesType = 
      selectedTypes.length === 0 || 
      selectedTypes.includes(j.type);

    const matchesLevel = 
      selectedLevels.length === 0 || 
      (selectedLevels.includes("Senior") && j.title.toLowerCase().includes("senior")) ||
      (selectedLevels.includes("Mid Level") && !j.title.toLowerCase().includes("senior") && !j.title.toLowerCase().includes("director")) ||
      (selectedLevels.includes("Director") && j.title.toLowerCase().includes("director"));

    return matchesSearch && matchesLoc && matchesType && matchesLevel;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location) {
      toast.error("Please enter a title, company name, and location.");
      return;
    }
    postJobMutation.mutate(jobForm);
  };

  const handleApplyClick = (job: any) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.resumeName) {
      toast.error("Please drag or upload your resume.");
      return;
    }
    applyJobMutation.mutate({
      jobId: String(selectedJob?.id),
      resumeUrl: applyForm.resumeName
    });
  };

  const handleToggleSaveJob = (id: number) => {
    if (savedJobs.includes(id)) {
      setSavedJobs(prev => prev.filter(jId => jId !== id));
      toast.success("Job listing removed from saved list.");
    } else {
      setSavedJobs(prev => [...prev, id]);
      toast.success("Job listing added to saved bookmarks.");
    }
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedLevels([]);
    setSearch("");
    setLocationSearch("");
    toast.success("Job portal filters reset.");
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Job Portal" 
        description="Discover career opportunities, apply to top companies, and track your applications."
        icon={Briefcase}
        color="from-purple-600 to-indigo-600"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsSavedJobsOpen(true)} className="rounded-xl border-white/20 text-white bg-transparent hover:bg-white/10">
            <Bookmark className="w-4 h-4 mr-2" /> Saved Jobs ({savedJobs.length})
          </Button>
          <Button onClick={() => setIsPostJobOpen(true)} className="rounded-xl bg-white text-indigo-600 hover:bg-white/90">
            Post a Job
          </Button>
        </div>
      </GradientHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Filter className="w-5 h-5" /> Filters</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Job Type</label>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Remote'].map(type => {
                    const isChecked = selectedTypes.includes(type);
                    return (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => setSelectedTypes(prev => isChecked ? prev.filter(t => t !== type) : [...prev, type])}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-muted"
                        />
                        <span className="text-sm font-medium text-foreground">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Experience Level</label>
                <div className="space-y-2">
                  {['Entry Level', 'Mid Level', 'Senior', 'Director'].map(level => {
                    const isChecked = selectedLevels.includes(level);
                    return (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => setSelectedLevels(prev => isChecked ? prev.filter(l => l !== level) : [...prev, level])}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-muted"
                        />
                        <span className="text-sm font-medium text-foreground">{level}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button variant="outline" onClick={handleClearFilters} className="w-full rounded-xl">Clear All</Button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-indigo-500/20">
            <h3 className="font-bold text-lg mb-2">Application Tracker</h3>
            <p className="text-sm text-muted-foreground mb-4">Track interview stages and response timelines.</p>
            <Button onClick={() => setIsTrackerOpen(true)} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700">View Tracker</Button>
          </GlassCard>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search job title, company, or keywords..." 
                className="pl-12 py-6 rounded-2xl bg-card border-none shadow-sm text-base focus:ring-2 focus:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="City, state, or 'Remote'" 
                className="pl-12 py-6 rounded-2xl bg-card border-none shadow-sm text-base focus:ring-2 focus:ring-indigo-500"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Job Listings list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Opportunities Feed ({filteredJobs.length})</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                Sort by: <span className="font-semibold text-foreground px-1">Most Recent</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredJobs.length > 0 ? filteredJobs.map((job: any) => (
                <GlassCard key={job.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center font-bold text-xl shrink-0 border shadow-sm">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{job.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center text-foreground font-semibold"><Building2 className="w-4 h-4 mr-1.5 text-muted-foreground"/> {job.company}</span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5"/> {job.location}</span>
                        <span className="flex items-center text-indigo-600 font-semibold">{job.salary}</span>
                        <span className="text-xs text-muted-foreground">Deadline: {job.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleToggleSaveJob(job.id)}
                      className={cn("rounded-xl shrink-0", savedJobs.includes(job.id) && "bg-indigo-50 border-indigo-200 text-indigo-600")}
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleApplyClick(job)} className="rounded-xl flex-1 md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90">
                      Apply Now
                    </Button>
                  </div>
                </GlassCard>
              )) : (
                <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/10">
                  No jobs found matching your criteria. Try adjusting your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Post a Job ── */}
      {isPostJobOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsPostJobOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-600"><Briefcase className="w-5 h-5"/> Post Career Opportunity</h3>
            <p className="text-xs text-muted-foreground mb-6">List a new job, internship or referral placement option on the alumni job portal.</p>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Job Title *">
                  <Input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="e.g. Lead Product Engineer" required />
                </FormGroup>
                <FormGroup label="Company *">
                  <Input value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} placeholder="e.g. Google India" required />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Location *">
                  <Input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="e.g. Bengaluru, Remote" required />
                </FormGroup>
                <FormGroup label="Salary Range">
                  <Input value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="e.g. ₹15,00,000 - ₹25,00,000" />
                </FormGroup>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Job Type</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-indigo-500" value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Experience Level</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-indigo-500" value={jobForm.experience} onChange={e => setJobForm({...jobForm, experience: e.target.value})}>
                    <option value="Entry Level">Entry Level (0-2 yrs)</option>
                    <option value="Mid Level">Mid Level (3-5 yrs)</option>
                    <option value="Senior">Senior (5-8 yrs)</option>
                    <option value="Director">Director (8+ yrs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Application Deadline</label>
                  <Input type="date" value={jobForm.deadline} onChange={e => setJobForm({...jobForm, deadline: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Job Description</label>
                <Input value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Provide short details about the role, tech stack, and referral guidelines..." />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsPostJobOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={postJobMutation.isPending} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">Post Opportunity</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Apply for Job ── */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsApplyModalOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-600"><Send className="w-5 h-5"/> Apply for position</h3>
            <p className="text-xs text-muted-foreground mb-4">Position: <span className="font-semibold text-foreground">{selectedJob.title}</span> at <span className="font-semibold text-foreground">{selectedJob.company}</span></p>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <FormGroup label="Applicant Full Name *">
                <Input value={applyForm.alumniName} onChange={e => setApplyForm({...applyForm, alumniName: e.target.value})} placeholder="Enter your full name" required />
              </FormGroup>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Upload Resume (Word or PDF format only) *</label>
                <FileUploadZone 
                  value={applyForm.resumeName ? { name: applyForm.resumeName, size: applyForm.resumeSize } : null}
                  onChange={(file) => setApplyForm({ ...applyForm, resumeName: file ? file.name : "", resumeSize: file ? file.size : 0 })}
                />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={applyJobMutation.isPending} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">Submit Application</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Application Tracker ── */}
      {isTrackerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsTrackerOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-600"><CheckCircle2 className="w-5 h-5"/> Career Application Tracker</h3>
            <p className="text-xs text-muted-foreground mb-6">Review status updates for your submitted career opportunities and job applications.</p>
            
            <div className="space-y-4">
              {[
                { title: "Senior Frontend Developer", company: "Google", stage: "Resume Review", date: "July 18, 2026", status: "In Progress", color: "text-amber-500 bg-amber-50" },
                { title: "Backend Engineer", company: "Stripe", stage: "Technical Interview", date: "July 15, 2026", status: "Scheduled", color: "text-indigo-500 bg-indigo-50" },
                { title: "Product Manager", company: "Microsoft", stage: "HR Round", date: "July 10, 2026", status: "Offer Extended", color: "text-emerald-500 bg-emerald-50" }
              ].map((app, idx) => (
                <div key={idx} className="p-4 border rounded-2xl flex justify-between items-center bg-muted/10">
                  <div className="text-xs">
                    <p className="font-bold text-sm text-foreground">{app.title}</p>
                    <p className="text-muted-foreground mt-0.5">{app.company} • Applied on {app.date}</p>
                    <p className="text-indigo-600 font-semibold mt-1">Current Stage: {app.stage}</p>
                  </div>
                  <Badge className={cn("px-2.5 py-1 text-[10px] rounded-lg", app.color)}>{app.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Saved Jobs Bookmarks ── */}
      {isSavedJobsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsSavedJobsOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-600"><Bookmark className="w-5 h-5"/> Saved Career Bookmarks</h3>
            <p className="text-xs text-muted-foreground mb-6">Review job opportunities that you have flagged or bookmarked for later submission.</p>
            
            <div className="space-y-3">
              {savedJobs.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed rounded-2xl">
                  No saved jobs found. Click the bookmark icon on any job card to save.
                </div>
              ) : (
                mockJobs.filter(j => savedJobs.includes(j.id)).map(job => (
                  <div key={job.id} className="p-4 border rounded-2xl flex justify-between items-center">
                    <div className="text-xs">
                      <p className="font-bold text-sm text-foreground">{job.title}</p>
                      <p className="text-muted-foreground mt-0.5">{job.company} • {job.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleSaveJob(job.id)} className="text-rose-600 hover:bg-rose-50 rounded-xl h-8 text-xs">Remove</Button>
                      <Button onClick={() => { setIsSavedJobsOpen(false); handleApplyClick(job); }} className="rounded-xl h-8 bg-indigo-600 text-white text-xs">Apply Now</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
