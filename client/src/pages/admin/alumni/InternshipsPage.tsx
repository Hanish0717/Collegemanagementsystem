import React, { useState } from 'react';
import { GradientHeader, GlassCard } from './components/CardElements';
import {
  BookOpen,
  GraduationCap,
  MapPin,
  Clock,
  DollarSign,
  Search,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function InternshipsPage() {
  const [search, setSearch] = useState('');

  const internships = [
    {
      id: 1,
      title: 'Software Engineering Intern',
      company: 'Tesla',
      stipend: '$8,000/mo',
      duration: '12 Weeks',
      mode: 'On-site',
      location: 'Austin, TX',
      skills: ['C++', 'Python', 'Robotics'],
      deadline: '2024-04-15',
      match: 92,
    },
    {
      id: 2,
      title: 'Product Design Intern',
      company: 'Airbnb',
      stipend: '$7,500/mo',
      duration: '10 Weeks',
      mode: 'Remote',
      location: 'Anywhere',
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      deadline: '2024-04-20',
      match: 85,
    },
    {
      id: 3,
      title: 'Data Science Intern',
      company: 'Spotify',
      stipend: '$8,200/mo',
      duration: '14 Weeks',
      mode: 'Hybrid',
      location: 'New York, NY',
      skills: ['SQL', 'Python', 'Machine Learning'],
      deadline: '2024-04-10',
      match: 78,
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader
        title="Internship Portal"
        description="Launch your career with top-tier internships tailored for recent graduates."
        icon={BookOpen}
        color="from-rose-500 to-pink-600"
      >
        <Button className="rounded-xl bg-white text-rose-600 hover:bg-white/90">
          Upload Resume
        </Button>
      </GradientHeader>

      {/* Progress Tracker Widget */}
      <GlassCard className="p-6">
        <h3 className="font-bold text-lg mb-6">Application Timeline</h3>
        <div className="flex flex-col md:flex-row gap-4 justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 hidden md:block" />
          {[
            { label: 'Profile Complete', status: 'done' },
            { label: 'Resume Uploaded', status: 'done' },
            { label: 'Applications Sent (3)', status: 'current' },
            { label: 'Interviews', status: 'pending' },
            { label: 'Offers', status: 'pending' },
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center gap-2 bg-card px-4 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.status === 'done'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : step.status === 'current'
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-muted border-muted text-muted-foreground'
                }`}
              >
                {step.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-semibold ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}
              >
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
        {internships.map((internship) => (
          <GlassCard
            key={internship.id}
            className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-transparent hover:border-rose-500/30"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                  {internship.company.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant="outline"
                    className="text-emerald-600 bg-emerald-50 border-emerald-200"
                  >
                    {internship.match}% Match
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Ends{' '}
                    {new Date(internship.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1 line-clamp-1">{internship.title}</h3>
              <p className="text-muted-foreground text-sm font-medium mb-6">{internship.company}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Stipend
                  </span>
                  <p className="text-sm font-medium flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />{' '}
                    {internship.stipend}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Duration
                  </span>
                  <p className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-muted-foreground" /> {internship.duration}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Mode
                  </span>
                  <p className="text-sm font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-muted-foreground" /> {internship.mode}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Eligibility
                  </span>
                  <p className="text-sm font-medium flex items-center">
                    <GraduationCap className="w-4 h-4 mr-1 text-muted-foreground" /> Batch '24/'25
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Required Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-muted text-xs font-medium">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
              <Button variant="ghost" className="rounded-xl">
                Details
              </Button>
              <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                Apply Now <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
