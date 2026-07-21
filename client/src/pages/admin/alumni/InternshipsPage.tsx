import React, { useState, useMemo } from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { FormGroup, FileUploadZone } from "./components/FormElements";
import { BookOpen, GraduationCap, MapPin, Clock, Search, ChevronRight, CheckCircle2, X, FileText, Send, HelpCircle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function InternshipsPage() {
  const [search, setSearch] = useState("");
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [resumeUploaded, setResumeUploaded] = useState(true);
  const [uploadedResumeFile, setUploadedResumeFile] = useState<any>({ name: "Alumni_Resume_Core.pdf", size: 1048576 });

  // Dialog / Popup states
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);

  // Form states
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    batch: "2024",
    resumeName: "Alumni_Resume_Core.pdf"
  });

  const [uploadForm, setUploadForm] = useState<any>(null);

  const internships = [
    { 
      id: 1, 
      title: "Software Engineering Intern", 
      company: "Tesla", 
      stipend: 80000, // INR: 80,000 per month
      duration: "12 Weeks", 
      mode: "On-site", 
      location: "Austin, TX", 
      skills: ["C++", "Python", "Robotics"], 
      deadline: "2026-08-15", 
      match: 92,
      description: "Work on Tesla's Autopilot and robotics simulation software pipeline.",
      requirements: "Proficient in C++ and Python. Familiarity with ROS is a plus.",
      responsibilities: "Write high-quality, real-time safety critical code; optimize perception networks; run hardware-in-the-loop tests."
    },
    { 
      id: 2, 
      title: "Product Design Intern", 
      company: "Airbnb", 
      stipend: 75000, // INR: 75,000 per month
      duration: "10 Weeks", 
      mode: "Remote", 
      location: "Anywhere", 
      skills: ["Figma", "UI/UX", "Prototyping"], 
      deadline: "2026-08-20", 
      match: 85,
      description: "Design the future of hosted travel experiences and premium guest interfaces.",
      requirements: "A portfolio showcasing responsive web and mobile designs. Fluency in Figma and design systems.",
      responsibilities: "Collaborate with product managers and engineers; wireframe user journeys; conduct user feedback iterations."
    },
    { 
      id: 3, 
      title: "Data Science Intern", 
      company: "Spotify", 
      stipend: 82000, // INR: 82,000 per month
      duration: "14 Weeks", 
      mode: "Hybrid", 
      location: "New York, NY", 
      skills: ["SQL", "Python", "Machine Learning"], 
      deadline: "2026-08-10", 
      match: 78,
      description: "Build audio recommendation networks and personalization features.",
      requirements: "Strong background in statistical modeling, SQL, and PyTorch/TensorFlow.",
      responsibilities: "Analyze user listening trends; design predictive recommendation features; deploy experimental A/B test splits."
    }
  ];

  // Search filtering
  const filteredInternships = useMemo(() => {
    return internships.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.company.toLowerCase().includes(search.toLowerCase()) || 
      item.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  // Actions
  const handleResumeUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm) {
      toast.error("Please upload or drag a resume file first.");
      return;
    }
    setUploadedResumeFile(uploadForm);
    setResumeUploaded(true);
    setApplyForm(prev => ({ ...prev, resumeName: uploadForm.name }));
    toast.success("Resume updated and synced successfully!");
    setIsResumeModalOpen(false);
  };

  const handleApplyClick = (internship: any) => {
    setSelectedInternship(internship);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.fullName || !applyForm.email) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setAppliedIds(prev => [...prev, selectedInternship.id]);
    toast.success(`Application to ${selectedInternship.company} for ${selectedInternship.title} submitted successfully!`);
    setIsApplyModalOpen(false);
  };

  const handleDetailsClick = (internship: any) => {
    setSelectedInternship(internship);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Internship Portal" 
        description="Launch your career with top-tier internships tailored for recent graduates."
        icon={BookOpen}
        color="from-rose-500 to-pink-600"
      >
        <Button onClick={() => setIsResumeModalOpen(true)} className="rounded-xl bg-white text-rose-600 hover:bg-white/90">
          Upload Resume
        </Button>
      </GradientHeader>

      {/* Progress Tracker Widget */}
      <GlassCard className="p-6">
        <h3 className="font-bold text-lg mb-6">Application Timeline</h3>
        <div className="flex flex-col md:flex-row gap-4 justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 hidden md:block" />
          {[
            { label: "Profile Complete", status: "done" },
            { label: "Resume Uploaded", status: resumeUploaded ? "done" : "pending" },
            { label: `Applications Sent (${appliedIds.length})`, status: appliedIds.length > 0 ? "done" : "pending" },
            { label: "Interviews", status: "pending" },
            { label: "Offers", status: "pending" }
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center gap-2 bg-card px-4 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                'bg-muted border-muted text-muted-foreground'
              }`}>
                {step.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-xs font-semibold", 
                step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search internships..." 
            className="pl-9 rounded-xl border-muted bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInternships.map(internship => {
          const isApplied = appliedIds.includes(internship.id);
          return (
            <GlassCard key={internship.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-transparent hover:border-rose-500/30">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {internship.company.charAt(0)}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="text-emerald-600 bg-emerald-50 border-emerald-200">{internship.match}% Match</Badge>
                    <span className="text-xs font-medium text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1"/> Ends {new Date(internship.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{internship.title}</h3>
                <p className="text-muted-foreground text-sm font-medium mb-6">{internship.company}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Stipend</span>
                    <p className="text-sm font-medium flex items-center">
                      <span className="font-bold text-foreground mr-1">₹</span>
                      {internship.stipend.toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Duration</span>
                    <p className="text-sm font-medium flex items-center"><Clock className="w-4 h-4 mr-1 text-muted-foreground"/> {internship.duration}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Mode</span>
                    <p className="text-sm font-medium flex items-center"><MapPin className="w-4 h-4 mr-1 text-muted-foreground"/> {internship.mode}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Eligibility</span>
                    <p className="text-sm font-medium flex items-center"><GraduationCap className="w-4 h-4 mr-1 text-muted-foreground"/> Batch '24/'25</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Required Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-muted text-xs font-medium">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
                <Button variant="ghost" onClick={() => handleDetailsClick(internship)} className="rounded-xl">Details</Button>
                <Button 
                  onClick={() => handleApplyClick(internship)} 
                  disabled={isApplied}
                  className={cn(
                    "rounded-xl gap-1", 
                    isApplied 
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-50" 
                      : "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Applied
                    </>
                  ) : (
                    <>
                      Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── MODAL: Upload Resume ── */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsResumeModalOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-rose-600"><FileText className="w-5 h-5"/> Upload Current Resume</h3>
            <p className="text-xs text-muted-foreground mb-6">Upload your latest PDF resume to update your application timeline and qualifications profile.</p>
            <form onSubmit={handleResumeUploadSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Select Resume File (Word or PDF format only) *</label>
                <FileUploadZone 
                  onFileSelect={(file: File) => setUploadForm(file)}
                  accept=".pdf,.doc,.docx"
                  label="Click or drag resume to upload"
                  subLabel="PDF, DOC or DOCX (max. 5MB)"
                />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsResumeModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white">Save Resume</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Apply Now ── */}
      {isApplyModalOpen && selectedInternship && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsApplyModalOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-rose-600"><Send className="w-5 h-5"/> Submit Internship Application</h3>
            <p className="text-xs text-muted-foreground mb-4">Role: <span className="font-semibold text-foreground">{selectedInternship.title}</span> at <span className="font-semibold text-foreground">{selectedInternship.company}</span></p>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <FormGroup label="Applicant Full Name *">
                <Input value={applyForm.fullName} onChange={e => setApplyForm({...applyForm, fullName: e.target.value})} placeholder="e.g. John Doe" required />
              </FormGroup>
              <FormGroup label="Email Address *">
                <Input type="email" value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} placeholder="e.g. johndoe@gmail.com" required />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Graduation Year Batch *">
                  <Input value={applyForm.batch} onChange={e => setApplyForm({...applyForm, batch: e.target.value})} required />
                </FormGroup>
                <FormGroup label="Resume Attached">
                  <Input value={applyForm.resumeName} disabled className="bg-muted text-muted-foreground" />
                </FormGroup>
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white">Submit Application</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Details ── */}
      {isDetailsModalOpen && selectedInternship && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsDetailsModalOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                {selectedInternship.company.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedInternship.title}</h3>
                <p className="text-muted-foreground font-semibold">{selectedInternship.company} • {selectedInternship.location}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Role Overview</h4>
                <p className="text-sm leading-relaxed text-foreground/80">{selectedInternship.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Responsibilities</h4>
                <p className="text-sm leading-relaxed text-foreground/80">{selectedInternship.responsibilities}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Candidate Requirements</h4>
                <p className="text-sm leading-relaxed text-foreground/80">{selectedInternship.requirements}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t pt-4 text-xs">
                <div>
                  <span className="font-bold text-muted-foreground block">STIPEND</span>
                  <span className="font-semibold text-foreground text-sm">₹{selectedInternship.stipend.toLocaleString("en-IN")}/mo</span>
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block">DURATION</span>
                  <span className="font-semibold text-foreground text-sm">{selectedInternship.duration}</span>
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block">MODE</span>
                  <span className="font-semibold text-foreground text-sm">{selectedInternship.mode}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="rounded-xl">Close</Button>
              <Button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleApplyClick(selectedInternship);
                }} 
                disabled={appliedIds.includes(selectedInternship.id)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                {appliedIds.includes(selectedInternship.id) ? "Applied" : "Apply Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
