import React, { useState } from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { MentorCard } from "./components/SpecificCards";
import { Calendar as CalendarIcon, Star, Filter, Search, Clock, Video, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function MentorshipPage() {
  const [search, setSearch] = useState("");

  const mentors = [
    { id: 1, name: "Sarah Connor", company: "OpenAI", designation: "AI Researcher", rating: 4.9, reviews: 42, skills: ["Machine Learning", "Python", "Ethics"], image: "https://api.dicebear.com/7.x/initials/svg?seed=SC" },
    { id: 2, name: "David Chen", company: "Stripe", designation: "Engineering Manager", rating: 4.8, reviews: 28, skills: ["Leadership", "System Design", "Fintech"], image: "https://api.dicebear.com/7.x/initials/svg?seed=DC" },
    { id: 3, name: "Emily Watson", company: "Figma", designation: "Lead Product Designer", rating: 5.0, reviews: 15, skills: ["UI/UX", "Design Systems", "Prototyping"], image: "https://api.dicebear.com/7.x/initials/svg?seed=EW" }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Mentorship Hub" 
        description="Connect with industry experts, book 1-on-1 sessions, and accelerate your career growth."
        icon={Star}
        color="from-amber-500 to-orange-500"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10">Become a Mentor</Button>
          <Button className="rounded-xl bg-white text-orange-600 hover:bg-white/90">My Sessions</Button>
        </div>
      </GradientHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column - Upcoming & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-orange-500/20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-orange-600" /> Next Session</h3>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-2xl border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Today, 2:00 PM</Badge>
                  <Video className="w-4 h-4 text-muted-foreground" />
                </div>
                <h4 className="font-bold text-sm">System Design Interview Prep</h4>
                <p className="text-xs text-muted-foreground mt-1">with David Chen</p>
                <div className="mt-4 pt-4 border-t">
                  <Button size="sm" className="w-full rounded-xl bg-orange-600 hover:bg-orange-700">Join Meeting</Button>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sessions Completed</span>
                <span className="font-bold text-foreground">12</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Mentors Connected</span>
                <span className="font-bold text-foreground">4</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Average Rating Given</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">4.9 <Star className="w-3 h-3 fill-current"/></span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Mentor Discovery */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search by role, company, or skills..." 
                className="pl-12 py-6 rounded-2xl bg-card border-none shadow-sm text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="py-6 px-6 rounded-2xl bg-card border-none shadow-sm text-foreground">
              <Filter className="w-5 h-5 mr-2" /> Filters
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['All', 'Engineering', 'Product', 'Design', 'Data Science', 'Marketing'].map(cat => (
              <Badge key={cat} variant={cat === 'All' ? 'default' : 'secondary'} className="px-4 py-1.5 rounded-lg text-sm cursor-pointer whitespace-nowrap hover:bg-primary/90 hover:text-primary-foreground transition-colors">
                {cat}
              </Badge>
            ))}
          </div>

          {/* Featured Mentors Grid */}
          <div>
            <h3 className="font-bold text-xl mb-4">Recommended Mentors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mentors.map(mentor => (
                <MentorCard key={mentor.id} mentor={mentor} onRequest={() => console.log('Book session with', mentor.name)} />
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" className="rounded-xl px-8">Load More Mentors</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
