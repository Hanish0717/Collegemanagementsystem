import React from 'react';
import { useAlumni } from '../AdminAlumni';
import { GradientHeader, StatCard, GlassCard } from './components/CardElements';
import { GradientAreaChart, StyledBarChart, DonutChart } from './components/ChartElements';
import { EventCard, JobCard } from './components/SpecificCards';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DollarSign,
  Briefcase,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  console.log('DashboardPage Rendered');
  const { stats, eventList, jobList, statsLoading } = useAlumni();

  if (statsLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  // Mock data for beautiful charts (since real API might not return this exact shape yet)
  const growthData = [
    { name: 'Jan', alumni: 4000 },
    { name: 'Feb', alumni: 4500 },
    { name: 'Mar', alumni: 5100 },
    { name: 'Apr', alumni: 6200 },
    { name: 'May', alumni: 7800 },
    { name: 'Jun', alumni: 8900 },
  ];

  const donationData = [
    { name: 'Jan', amount: 15000 },
    { name: 'Feb', amount: 22000 },
    { name: 'Mar', amount: 18000 },
    { name: 'Apr', amount: 35000 },
    { name: 'May', amount: 28000 },
    { name: 'Jun', amount: 45000 },
  ];

  const placementData = [
    { name: 'IT', students: 400 },
    { name: 'Finance', students: 300 },
    { name: 'Engineering', students: 500 },
    { name: 'Management', students: 200 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <GradientHeader
        title="Alumni Dashboard"
        description="Overview of your alumni network, engagements, and career placements."
        icon={LayoutDashboard}
        color="from-violet-600 to-indigo-600"
      >
        <Button
          variant="secondary"
          className="rounded-xl bg-white/20 text-white hover:bg-white/30 border-0"
        >
          Download Report
        </Button>
      </GradientHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alumni"
          value={stats?.totalAlumni || '24,500'}
          icon={Users}
          color="blue"
          trend={{ value: 12.5, isPositive: true }}
          trendLabel="vs last year"
        />
        <StatCard
          title="Active Placements"
          value={stats?.activeJobs || '1,200'}
          icon={Briefcase}
          color="purple"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Events This Month"
          value={stats?.upcomingEvents || '14'}
          icon={Calendar}
          color="rose"
          trend={{ value: 2.4, isPositive: false }}
        />
        <StatCard
          title="Donations"
          value={`$${(stats?.totalDonations || 150000).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend={{ value: 24.5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GradientAreaChart
            title="Alumni Network Growth"
            data={growthData}
            dataKey="alumni"
            xKey="name"
            color="#8b5cf6"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutChart
            title="Placements by Sector"
            data={placementData}
            dataKey="students"
            nameKey="name"
          />
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StyledBarChart
          title="Monthly Donations Overview"
          data={donationData}
          dataKey="amount"
          xKey="name"
          color="#10b981"
        />

        {/* Quick Actions / Recent Activity */}
        <GlassCard className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              { label: 'Verify Alumni', icon: GraduationCap, color: 'bg-blue-50 text-blue-600' },
              { label: 'Post a Job', icon: Briefcase, color: 'bg-purple-50 text-purple-600' },
              { label: 'Create Event', icon: Calendar, color: 'bg-rose-50 text-rose-600' },
              { label: 'New Campaign', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
            ].map((action, i) => (
              <button
                key={i}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border bg-card hover:bg-muted/50 transition-colors gap-3 group"
              >
                <div
                  className={`p-3 rounded-full ${action.color} group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Cards Row - Events & Jobs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xl tracking-tight">Upcoming Events</h3>
            <Button variant="ghost" className="text-primary rounded-xl">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {eventList?.slice(0, 2).map((event: any, idx: number) => (
              <EventCard key={idx} event={event} />
            ))}
            {(!eventList || eventList.length === 0) && (
              <div className="col-span-2 p-12 text-center rounded-3xl border border-dashed text-muted-foreground">
                No upcoming events found.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xl tracking-tight">Featured Jobs</h3>
            <Button variant="ghost" className="text-primary rounded-xl">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {jobList?.slice(0, 3).map((job: any, idx: number) => (
              <div key={idx} className="h-32">
                <JobCard job={job} />
              </div>
            ))}
            {(!jobList || jobList.length === 0) && (
              <div className="p-12 text-center rounded-3xl border border-dashed text-muted-foreground">
                No active job listings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
