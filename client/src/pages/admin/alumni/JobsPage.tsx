import React, { useState } from "react";
import { useAlumni } from "../AdminAlumni";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { JobCard } from "./components/SpecificCards";
import { Briefcase, Search, Filter, Bookmark, MapPin, Building2, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function JobsPage() {
  const { jobList, jobsLoading } = useAlumni();
  const [search, setSearch] = useState("");

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

  // Generate some realistic mock data if none exists
  const mockJobs = jobList?.length > 0 ? jobList : [
    { id: 1, title: "Senior Frontend Developer", company: "Google", type: "Full-time", location: "San Francisco, CA", experience: "5-7 years", salary: "$140k - $180k", deadline: "2024-05-30" },
    { id: 2, title: "Backend Engineer", company: "Stripe", type: "Remote", location: "Anywhere", experience: "3-5 years", salary: "$120k - $160k", deadline: "2024-05-25" },
    { id: 3, title: "Product Manager", company: "Microsoft", type: "Full-time", location: "Seattle, WA", experience: "4-6 years", salary: "$135k - $170k", deadline: "2024-06-15" }
  ];

  const filteredJobs = mockJobs.filter((j: any) => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Job Portal" 
        description="Discover career opportunities, apply to top companies, and track your applications."
        icon={Briefcase}
        color="from-purple-600 to-indigo-600"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10"><Bookmark className="w-4 h-4 mr-2" /> Saved Jobs</Button>
          <Button className="rounded-xl bg-white text-indigo-600 hover:bg-white/90">Post a Job</Button>
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
                  {['Full-time', 'Part-time', 'Contract', 'Remote'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded border border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-colors">
                        <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-primary/50" />
                      </div>
                      <span className="text-sm font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Experience Level</label>
                <div className="space-y-2">
                  {['Entry Level', 'Mid Level', 'Senior', 'Director', 'Executive'].map(level => (
                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded border border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-colors" />
                      <span className="text-sm font-medium">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full rounded-xl">Clear All</Button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-indigo-500/20">
            <h3 className="font-bold text-lg mb-2">Application Tracker</h3>
            <p className="text-sm text-muted-foreground mb-4">You have 3 active applications in progress.</p>
            <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700">View Tracker</Button>
          </GlassCard>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search job title, company, or keywords..." 
                className="pl-12 py-6 rounded-2xl bg-card border-none shadow-sm text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="City, state, or 'Remote'" 
                className="pl-12 py-6 rounded-2xl bg-card border-none shadow-sm text-base"
              />
            </div>
            <Button className="py-6 px-8 rounded-2xl bg-foreground text-background hover:bg-foreground/90">Search</Button>
          </div>

          {/* Featured Jobs Row */}
          {!search && (
            <div className="mb-8">
              <h3 className="font-bold text-xl mb-4">Featured Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockJobs.slice(0, 2).map((job: any) => (
                  <GlassCard key={job.id} glow className="border-indigo-500/30">
                    <div className="absolute top-0 right-0 p-1.5 px-3 bg-indigo-500 rounded-bl-xl text-xs font-bold text-white tracking-widest uppercase">Featured</div>
                    <JobCard job={job} onApply={() => console.log('Apply to', job.title)} />
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Job Listings List View */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Recent Jobs</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Sort by: <Button variant="ghost" size="sm" className="font-semibold text-foreground px-2">Most Recent <ChevronDown className="w-4 h-4 ml-1"/></Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredJobs.length > 0 ? filteredJobs.map((job: any) => (
                <GlassCard key={job.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center font-bold text-xl shrink-0 border shadow-sm">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold hover:text-primary cursor-pointer transition-colors">{job.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center text-foreground font-medium"><Building2 className="w-4 h-4 mr-1.5 text-muted-foreground"/> {job.company}</span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5"/> {job.location}</span>
                        <span className="flex items-center">{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" size="icon" className="rounded-xl shrink-0"><Bookmark className="w-4 h-4" /></Button>
                    <Button className="rounded-xl flex-1 md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90">Apply Now</Button>
                  </div>
                </GlassCard>
              )) : (
                <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
                  No jobs found matching your criteria. Try adjusting your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
