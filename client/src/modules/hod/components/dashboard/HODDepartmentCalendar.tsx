import React from 'react';
import { GlassCard } from '../shared/GlassCard';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export function HODDepartmentCalendar() {
  const events = [
    { id: '1', title: 'Department Faculty Meeting', time: '11:00 AM - 12:00 PM', location: 'Conference Hall B', type: 'Meeting' },
    { id: '2', title: 'Board of Studies (BOS) Syllabus Review', time: '02:30 PM - 04:00 PM', location: 'HOD Chamber', type: 'BOS' },
    { id: '3', title: 'Smart India Hackathon Internal Pitching', time: '04:30 PM - 06:00 PM', location: 'AI Research Lab 1', type: 'Event' },
  ];

  return (
    <GlassCard>
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            <Calendar className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Today's Schedule & Events</h3>
            <p className="text-xs text-slate-500 font-medium">Department meetings, labs, & pitch sessions</p>
          </div>
        </div>
        <span className="text-xs font-bold text-blue-600 font-mono">July 20, 2026</span>
      </div>

      <div className="space-y-3">
        {events.map((evt) => (
          <div key={evt.id} className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {evt.type}
              </span>
              <h4 className="font-black text-slate-900 dark:text-white text-xs">{evt.title}</h4>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Clock className="size-3 text-blue-500" /> {evt.time}</span>
                <span className="flex items-center gap-1"><MapPin className="size-3 text-purple-500" /> {evt.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
