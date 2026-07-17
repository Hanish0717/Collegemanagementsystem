import React from 'react';
import { GradientHeader, GlassCard, StatCard } from './components/CardElements';
import { StyledBarChart } from './components/ChartElements';
import { StyledTable, TableRow, TableCell } from './components/TableElements';
import { Heart, TrendingUp, Users, DollarSign, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DonationsPage() {
  const donationData = [
    { name: 'Jan', amount: 15000 },
    { name: 'Feb', amount: 22000 },
    { name: 'Mar', amount: 18000 },
    { name: 'Apr', amount: 35000 },
    { name: 'May', amount: 28000 },
    { name: 'Jun', amount: 45000 },
  ];

  const topDonors = [
    {
      id: 1,
      name: 'Alexander Pierce',
      batch: '1995',
      amount: '$50,000',
      campaign: 'New Library Fund',
    },
    {
      id: 2,
      name: 'Sarah Connor',
      batch: '2001',
      amount: '$25,000',
      campaign: 'Scholarship Program',
    },
    {
      id: 3,
      name: 'Tech Innovators Corp',
      batch: 'Corporate',
      amount: '$100,000',
      campaign: 'Research Lab',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader
        title="Donations & Campaigns"
        description="Manage fundraising campaigns, track donations, and recognize top contributors."
        icon={Heart}
        color="from-green-500 to-teal-600"
      >
        <Button className="rounded-xl bg-white text-green-600 hover:bg-white/90">
          New Campaign
        </Button>
      </GradientHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Raised (YTD)"
          value="$245,000"
          icon={DollarSign}
          color="green"
          trend={{ value: 24.5, isPositive: true }}
        />
        <StatCard title="Active Campaigns" value="4" icon={TrendingUp} color="blue" />
        <StatCard
          title="Total Donors"
          value="1,245"
          icon={Users}
          color="purple"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard title="Avg. Donation" value="$196" icon={Heart} color="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-6">Funding Trend</h3>
            <div className="h-72">
              <StyledBarChart data={donationData} dataKey="amount" xKey="name" color="#10b981" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Top Donors</h3>
              <Button variant="ghost" size="sm" className="rounded-xl text-emerald-600">
                View All
              </Button>
            </div>
            <StyledTable headers={['Donor', 'Batch', 'Amount', 'Campaign', 'Recognition']}>
              {topDonors.map((donor) => (
                <TableRow key={donor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        {donor.name.charAt(0)}
                      </div>
                      <span className="font-semibold">{donor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{donor.batch}</TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600">{donor.amount}</span>
                  </TableCell>
                  <TableCell>{donor.campaign}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-600 border-amber-200"
                    >
                      <Award className="w-3 h-3 mr-1" /> Gold
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </StyledTable>
          </GlassCard>
        </div>

        <div className="xl:col-span-1 space-y-8">
          <GlassCard className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <h3 className="font-bold text-lg mb-4 text-emerald-950">Active Campaign</h3>
            <div className="space-y-4">
              <div className="w-full h-40 bg-muted rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80"
                  alt="Library"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="font-bold text-lg">New Campus Library</h4>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium text-emerald-900">
                  <span>$450,000 raised</span>
                  <span>Goal: $1,000,000</span>
                </div>
                <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                Manage Campaign
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
