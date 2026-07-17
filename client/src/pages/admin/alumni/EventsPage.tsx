import React, { useState } from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { EventCard } from "./components/SpecificCards";
import { Calendar as CalendarIcon, MapPin, Search, Filter, Plus, ChevronRight, Video, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EventsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const events = [
    { id: 1, title: "Global Alumni Meet 2024", date: "2024-08-15T18:00:00", location: "San Francisco Marriott Marquis", type: "In-Person", attendees: 450, price: 150, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" },
    { id: 2, title: "Tech Leadership Summit", date: "2024-09-22T10:00:00", location: "Virtual Event", type: "Online", attendees: 1200, price: 0, image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&q=80" },
    { id: 3, title: "Startup Pitch Night", date: "2023-11-10T19:00:00", location: "Campus Main Auditorium", type: "In-Person", attendees: 300, price: 25, isPast: true, image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80" }
  ];

  const filteredEvents = events.filter(e => activeTab === 'upcoming' ? !e.isPast : e.isPast);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Events & Gatherings" 
        description="Discover, register, and manage upcoming alumni events and reunions."
        icon={CalendarIcon}
        color="from-rose-500 to-red-600"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10"><QrCode className="w-4 h-4 mr-2" /> Scanner</Button>
          <Button className="rounded-xl bg-white text-rose-600 hover:bg-white/90"><Plus className="w-4 h-4 mr-2"/> Create Event</Button>
        </div>
      </GradientHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">My Schedule</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Upcoming</span>
                  <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">2 Days Left</span>
                </div>
                <h4 className="font-bold text-sm text-rose-950 leading-tight mb-2">Tech Leadership Summit</h4>
                <div className="flex items-center gap-2 text-xs text-rose-700/80 mb-4">
                  <Video className="w-3.5 h-3.5" /> Virtual
                </div>
                <Button size="sm" className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg">Get Ticket</Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Calendar</h3>
            <div className="bg-muted/50 rounded-xl p-4 text-center text-muted-foreground border-2 border-dashed">
              [Mini Calendar Widget Placeholder]
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex bg-muted/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'upcoming' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Upcoming Events
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'past' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Past Events
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search events..." className="pl-9 rounded-xl bg-background/50 border-muted" />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl shrink-0"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed rounded-3xl text-muted-foreground">
              No events found for this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
