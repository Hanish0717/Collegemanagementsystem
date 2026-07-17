import React, { useState } from 'react';
import { GradientHeader, GlassCard, StatCard } from './components/CardElements';
import { GradientAreaChart, StyledBarChart, DonutChart } from './components/ChartElements';
import {
  PieChart,
  LineChart,
  Download,
  Printer,
  Filter,
  Calendar,
  CheckCircle,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('Last 6 Months');

  const registrationData = [
    { name: 'Jan', count: 120 },
    { name: 'Feb', count: 180 },
    { name: 'Mar', count: 250 },
    { name: 'Apr', count: 190 },
    { name: 'May', count: 320 },
    { name: 'Jun', count: 410 },
  ];

  const employmentData = [
    { name: 'IT & Tech', count: 45 },
    { name: 'Finance', count: 20 },
    { name: 'Healthcare', count: 15 },
    { name: 'Education', count: 10 },
    { name: 'Other', count: 10 },
  ];

  const donationData = [
    { name: 'Jan', amount: 15000 },
    { name: 'Feb', amount: 22000 },
    { name: 'Mar', amount: 18000 },
    { name: 'Apr', amount: 35000 },
    { name: 'May', amount: 28000 },
    { name: 'Jun', amount: 45000 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader
        title="Reports & Analytics"
        description="Comprehensive insights into alumni engagement, placements, and contributions."
        icon={LineChart}
        color="from-indigo-600 to-purple-700"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button className="rounded-xl bg-white text-indigo-600 hover:bg-white/90">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </GradientHeader>

      {/* Filters Bar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl bg-background/50 border-muted">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            {dateRange}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl bg-background/50 border-muted"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {['Overview', 'Registrations', 'Placements', 'Donations'].map((tab) => (
            <Button
              key={tab}
              variant={tab === 'Overview' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-lg shrink-0"
            >
              {tab}
            </Button>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered"
          value="24,500"
          icon={PieChart}
          color="indigo"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Overall Placement Rate"
          value="94%"
          icon={CheckCircle}
          color="green"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Pending Mentorships"
          value="45"
          icon={Users}
          color="orange"
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          title="Total Donations"
          value="$2.4M"
          icon={PieChart}
          color="rose"
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GradientAreaChart
          title="Alumni Registration Growth"
          data={registrationData}
          dataKey="count"
          xKey="name"
          color="green"
        />
        <DonutChart
          title="Employment by Sector"
          data={employmentData}
          dataKey="count"
          nameKey="name"
          colors={['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#64748b']}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StyledBarChart
            title="Donation Revenue Trend"
            data={donationData}
            dataKey="amount"
            xKey="name"
            color="#10b981"
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-6">Quick Reports</h3>
            <div className="flex-1 space-y-3">
              {[
                'Monthly Registration Summary',
                'Q3 Placement Statistics',
                'Annual Fundraising Report',
                'Mentorship Engagement Analytics',
              ].map((report, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {report}
                  </span>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 rounded-xl" variant="outline">
              Generate Custom Report
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
