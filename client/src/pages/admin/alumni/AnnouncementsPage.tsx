import React from 'react';
import { GradientHeader, GlassCard } from './components/CardElements';
import { Megaphone, Pin, Clock, MoreHorizontal, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AnnouncementsPage() {
  const announcements = [
    {
      id: 1,
      title: 'Annual General Meeting 2024',
      date: 'Today, 10:00 AM',
      priority: 'high',
      pinned: true,
      content:
        'The Annual General Meeting for the Alumni Association will be held virtually on July 25th. All verified members are invited to attend and vote on upcoming initiatives.',
    },
    {
      id: 2,
      title: 'New Mentorship Program Launch',
      date: 'Yesterday, 2:30 PM',
      priority: 'normal',
      pinned: false,
      content:
        'We are excited to announce the launch of our new Mentorship Hub. Verified alumni can now register as mentors or request guidance.',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      <GradientHeader
        title="Announcements"
        description="Broadcast important updates, newsletters, and official communications."
        icon={Megaphone}
        color="from-blue-600 to-indigo-600"
      >
        <Button className="rounded-xl bg-white text-blue-600 hover:bg-white/90">
          New Announcement
        </Button>
      </GradientHeader>

      <div className="space-y-6">
        {announcements.map((ann) => (
          <GlassCard key={ann.id} className="p-6 relative overflow-hidden group">
            {ann.pinned && (
              <div className="absolute top-0 right-0 border-[24px] border-transparent border-t-amber-500 border-r-amber-500 z-0" />
            )}
            {ann.pinned && <Pin className="absolute top-2 right-2 w-4 h-4 text-white z-10" />}

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={ann.priority === 'high' ? 'destructive' : 'secondary'}
                    className="rounded-lg text-[10px] uppercase tracking-wider"
                  >
                    {ann.priority} Priority
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {ann.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{ann.title}</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-foreground/90 leading-relaxed mb-6">{ann.content}</p>

            <div className="flex items-center gap-2 border-t pt-4">
              <Button variant="outline" size="sm" className="rounded-xl">
                <FileText className="w-4 h-4 mr-2" /> Read More
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
