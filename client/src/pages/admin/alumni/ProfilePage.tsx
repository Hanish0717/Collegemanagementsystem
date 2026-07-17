import React, { useState } from "react";
import { GlassCard } from "./components/CardElements";
import { useAlumni } from "../AdminAlumni";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Briefcase, GraduationCap, Edit, ShieldCheck, Download, UserPlus, FileText, Share2, Award, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProfilePage() {
  const { directoryList } = useAlumni();
  // Using a mock selected profile for demonstration
  const profile = directoryList?.[0] || {
    name: "Alex Johnson",
    email: "alex.j@example.com",
    phone: "+1 555-010-0199",
    location: "San Francisco, CA",
    company: "Google",
    designation: "Senior Software Engineer",
    department: "Computer Science",
    batch: "2019",
    skills: ["React", "TypeScript", "Node.js", "System Design", "GraphQL", "AWS"],
    bio: "Passionate engineer with 5 years of experience building scalable web applications. Open to mentorship and networking opportunities.",
    status: "Verified",
    connections: 342,
    completionScore: 85
  };

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      {/* Profile Header Card */}
      <GlassCard className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <Button variant="secondary" size="sm" className="absolute top-4 right-4 rounded-xl bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md">
            <Edit className="w-4 h-4 mr-2" /> Edit Cover
          </Button>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
            <div className="relative">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-background bg-muted object-cover"
              />
              {profile.status === 'Verified' && (
                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-background" title="Verified Alumni">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-lg text-muted-foreground font-medium">{profile.designation} at {profile.company}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Class of {profile.batch} ({profile.department})</span>
                <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> {profile.connections} Connections</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600"><UserPlus className="w-4 h-4 mr-2"/> Connect</Button>
              <Button variant="outline" className="rounded-xl"><Share2 className="w-4 h-4"/></Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.skills.map((skill: string, i: number) => (
              <Badge key={i} variant="secondary" className="px-3 py-1 rounded-lg bg-muted/50 text-foreground">{skill}</Badge>
            ))}
          </div>

          <p className="text-foreground/80 leading-relaxed max-w-4xl">{profile.bio}</p>
        </div>
      </GlassCard>

      {/* Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b">
            {['Overview', 'Experience', 'Education', 'Portfolio', 'Activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap ${
                  activeTab === tab.toLowerCase() 
                    ? 'text-primary border-b-2 border-primary bg-primary/5' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Timeline / Experience Section */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary"/> Employment History</h3>
              <Button variant="ghost" size="sm" className="rounded-xl text-primary"><Edit className="w-4 h-4 mr-2"/> Edit</Button>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-card/50 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                    <h4 className="font-bold text-foreground">Senior Software Engineer</h4>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">2021 - Present</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Google • San Francisco, CA</p>
                  <p className="text-xs text-muted-foreground">Leading the frontend architecture for Google Cloud console. Mentoring junior developers.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-card/50 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                    <h4 className="font-bold text-foreground">Software Engineer</h4>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">2019 - 2021</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Amazon • Seattle, WA</p>
                  <p className="text-xs text-muted-foreground">Developed full-stack features for AWS Lambda console using React and Node.js.</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Education Section */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary"/> Education</h3>
            </div>
            
            <div className="flex gap-4 p-4 rounded-2xl border bg-background/50 hover:bg-muted/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                CU
              </div>
              <div>
                <h4 className="font-bold text-foreground">B.Tech in Computer Science</h4>
                <p className="text-sm text-muted-foreground">Campus University</p>
                <p className="text-xs text-muted-foreground mt-1">Class of 2019 • GPA: 3.8/4.0</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          {/* Profile Completion Widget */}
          <GlassCard className="p-6 bg-gradient-to-br from-card to-card/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Profile Completion</h3>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${profile.completionScore}%` }} />
              </div>
              <span className="font-bold text-emerald-500">{profile.completionScore}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Add your Portfolio link to reach 100%</p>
          </GlassCard>

          {/* Contact Details Widget */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Mail className="w-4 h-4"/></div>
                <div className="text-sm font-medium">{profile.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Phone className="w-4 h-4"/></div>
                <div className="text-sm font-medium">{profile.phone}</div>
              </div>
            </div>
          </GlassCard>

          {/* Documents Widget */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Documents</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start rounded-xl group hover:border-primary/50 hover:bg-primary/5">
                <FileText className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                <span className="flex-1 text-left">Resume.pdf</span>
                <Download className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-xl group hover:border-primary/50 hover:bg-primary/5">
                <Award className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                <span className="flex-1 text-left">Degree_Certificate.pdf</span>
                <Download className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
