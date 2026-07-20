import React from 'react';
import { GlassCard } from './CardElements';
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  ExternalLink,
  ArrowRight,
  Clock,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assuming shadcn UI button exists
import { Badge } from '@/components/ui/badge';

export function JobCard({ job, onApply }: { job: any; onApply?: () => void }) {
  return (
    <GlassCard className="p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
            {job.company.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-muted-foreground text-sm">{job.company}</p>
          </div>
        </div>
        <Badge variant={job.type === 'Full-time' ? 'default' : 'secondary'}>{job.type}</Badge>
      </div>

      <div className="space-y-2 mb-6 flex-1">
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <MapPin className="w-4 h-4" /> {job.location}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Briefcase className="w-4 h-4" /> {job.experience} experience
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <DollarSign className="w-4 h-4" /> {job.salary}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <Clock className="w-4 h-4" /> Deadline: {new Date(job.deadline).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <Button variant="outline" size="sm" className="rounded-xl">
          View Details
        </Button>
        <Button
          size="sm"
          onClick={onApply}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-opacity"
        >
          Apply Now
        </Button>
      </div>
    </GlassCard>
  );
}

export function MentorCard({ mentor, onRequest }: { mentor: any; onRequest?: () => void }) {
  return (
    <div className="group rounded-3xl border bg-card p-6 flex flex-col h-full hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={mentor.image || `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`}
          alt={mentor.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
        />
        <div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
            {mentor.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mentor.designation} at {mentor.company}
          </p>
          <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" />
            {mentor.rating || 4.8} ({mentor.reviews || 24} reviews)
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Expertise</h4>
        <div className="flex flex-wrap gap-1.5">
          {mentor.skills?.slice(0, 3).map((skill: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-[10px] py-0">
              {skill}
            </Badge>
          ))}
          {(mentor.skills?.length || 0) > 3 && (
            <Badge variant="outline" className="text-[10px] py-0">
              +{mentor.skills.length - 3}
            </Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
        {mentor.bio ||
          'Passionate about helping the next generation of engineers build great products.'}
      </p>

      <div className="flex items-center gap-2 mt-auto">
        <Button variant="outline" className="flex-1 rounded-xl">
          View Profile
        </Button>
        <Button
          onClick={onRequest}
          className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600"
        >
          Connect
        </Button>
      </div>
    </div>
  );
}

export function EventCard({ event, onRegister }: { event: any; onRegister?: () => void }) {
  const isPast = new Date(event.date) < new Date();

  return (
    <div
      className={cn(
        'group rounded-3xl border overflow-hidden flex flex-col h-full transition-all duration-300',
        isPast ? 'opacity-70 bg-muted/30' : 'bg-card hover:shadow-xl',
      )}
    >
      <div className="relative h-48 overflow-hidden">
        <div
          className={cn('absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10')}
        />
        <img
          src={
            event.image ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'
          }
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-20">
          <Badge
            className={cn(
              'backdrop-blur-md',
              isPast ? 'bg-black/50 text-white' : 'bg-primary/90 text-primary-foreground',
            )}
          >
            {isPast ? 'Completed' : 'Upcoming'}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 z-20 text-white">
          <h3 className="font-bold text-xl mb-1 line-clamp-1">{event.title}</h3>
          <p className="text-xs text-white/80 font-medium flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />{' '}
            {new Date(event.date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <MapPin className="w-4 h-4 shrink-0" />{' '}
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Users className="w-4 h-4 shrink-0" /> <span>{event.attendees || 0} Attending</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <div className="font-semibold text-sm">
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </div>
          <Button
            disabled={isPast}
            onClick={onRegister}
            size="sm"
            className={cn(
              'rounded-xl',
              !isPast &&
                'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600',
            )}
          >
            {isPast ? 'View Details' : 'Register Now'} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
