import React from 'react';
import { GradientHeader, GlassCard } from './components/CardElements';
import { HelpCircle, Book, MessageCircle, Bug, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HelpPage() {
  const faqs = [
    {
      q: 'How do I update my employment history?',
      a: 'Navigate to your Profile page and select the Experience tab. Click the Edit button on the top right of the Employment History card.',
    },
    {
      q: 'How does the mentorship matching work?',
      a: 'Our algorithm matches you based on the skills and industry preferences set in your profile. You can also manually search for mentors.',
    },
    {
      q: 'Can I post a job opportunity for alumni?',
      a: 'Yes, verified alumni can post jobs directly from the Job Portal. All postings are reviewed by admins before going live.',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      <GradientHeader
        title="Help & Support"
        description="Find answers to common questions, read documentation, or contact support."
        icon={HelpCircle}
        color="from-zinc-600 to-zinc-800"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Documentation', icon: Book, color: 'text-blue-600', bg: 'bg-blue-50' },
          {
            title: 'Live Chat',
            icon: MessageCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          { title: 'Report Bug', icon: Bug, color: 'text-rose-600', bg: 'bg-rose-50' },
          { title: 'Policies', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, i) => (
          <GlassCard
            key={i}
            className="p-6 text-center cursor-pointer hover:-translate-y-1 transition-transform group"
          >
            <div
              className={`w-12 h-12 mx-auto rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm">{item.title}</h4>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 md:p-8">
        <h3 className="font-bold text-xl mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {faq.q}
                </h4>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center border-t pt-8">
          <p className="text-muted-foreground mb-4">
            Still need help? Our support team is here for you.
          </p>
          <Button className="rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white px-8">
            Raise Support Ticket
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
