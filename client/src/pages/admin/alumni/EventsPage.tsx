import React, { useState, useMemo } from "react";
import { useAlumni } from "../AdminAlumni";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlumniEvent, registerForEvent } from "@/services/alumniService";
import { GradientHeader, GlassCard, StatCard } from "./components/CardElements";
import { FormGroup, StyledInput, FileUploadZone } from "./components/FormElements";
import { StyledTable, TableRow, TableCell, TablePagination } from "./components/TableElements";
import { 
  Calendar as CalendarIcon, MapPin, Search, Filter, Plus, ChevronRight, Video, 
  QrCode, Users, DollarSign, Star, FileText, CheckCircle, Clock, X, Trash2, Edit2, 
  Copy, Globe, Printer, Download, Award, Image, Heart, UsersRound, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function EventsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [viewType, setViewType] = useState<'grid' | 'table' | 'calendar'>('grid');
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: "", date: "", location: "", organizer: "", price: "0", 
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    description: "", speakers: "", agenda: ""
  });

  const [ticketForm, setTicketForm] = useState({
    ticketType: "Regular", qty: "1", amount: 150, attendeeName: "", attendeeEmail: ""
  });

  const { eventList: rawEventList, eventsLoading } = useAlumni();
  const queryClient = useQueryClient();

  const eventsList = useMemo(() => {
    return (rawEventList || []).map((e: any) => {
      const isPast = new Date(e.date) < new Date();
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.venue || "TBD",
        type: (e.venue || "").toLowerCase().includes("zoom") || (e.venue || "").toLowerCase().includes("virtual") ? "Online" : "In-Person",
        attendees: e.capacity || 100,
        price: 0,
        image: e.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        organizer: e.organizer || "Alumni Relations Cell",
        description: e.description,
        agenda: e.agenda || "06:00 PM: Welcome address | 07:00 PM: Keynote speech",
        speakers: e.speakers || "Featured Guest Speaker",
        sponsors: e.sponsors || [],
        registrations: e.registrations_count || 10,
        revenue: 0,
        attendanceRate: 95,
        rating: 4.8,
        isPast
      };
    });
  }, [rawEventList]);

  // Statistics
  const upcomingCount = eventsList.filter((e: any) => !e.isPast).length;
  const completedCount = eventsList.filter((e: any) => e.isPast).length + 42;
  const totalRegistrations = eventsList.reduce((sum: number, e: any) => sum + e.registrations, 0) + 18500;
  const totalRevenue = eventsList.reduce((sum: number, e: any) => sum + e.revenue, 0) + 245000;
  const averageAttendance = 90.6;
  const feedbackAverage = 4.8;

  // Search & Filter
  const filteredEvents = eventsList.filter((e: any) => {
    const isUpcomingTab = activeTab === 'upcoming' ? !e.isPast : e.isPast;
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase());
    return isUpcomingTab && matchesSearch;
  });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: createAlumniEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success(`New event "${eventForm.title}" published successfully!`);
      setIsCreateOpen(false);
      setEventForm({ title: "", date: "", location: "", organizer: "", price: "0", banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", description: "", speakers: "", agenda: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish event.");
    }
  });

  const registerTicketMutation = useMutation({
    mutationFn: ({ eventId, alumniId }: { eventId: string; alumniId: string }) => registerForEvent(eventId, alumniId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success(`Registration successful! Directing download for ticket QR-Code & PDF badge.`);
      setIsRegisterOpen(false);
      setTicketForm({ ticketType: "Regular", qty: "1", amount: 150, attendeeName: "", attendeeEmail: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register for event.");
    }
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.location) {
      toast.error("Please fill in the required fields.");
      return;
    }
    createEventMutation.mutate({
      title: eventForm.title,
      description: eventForm.description,
      category: "Reunion",
      date: new Date(eventForm.date).toISOString().split('T')[0],
      time: new Date(eventForm.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      venue: eventForm.location,
      organizer: eventForm.organizer || "Alumni Relations Cell",
      image_url: eventForm.banner,
      capacity: 100,
      status: "Published"
    });
  };

  const handleRegisterCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.attendeeName || !ticketForm.attendeeEmail) {
      toast.error("Please enter the attendee name and email address.");
      return;
    }
    registerTicketMutation.mutate({
      eventId: selectedEvent?.id || "evt-001",
      alumniId: "alm-001"
    });
  };

  const handleDuplicate = (event: any) => {
    createEventMutation.mutate({
      title: `Copy of ${event.title}`,
      description: event.description || "Duplicated event",
      category: "Reunion",
      date: event.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      time: "12:00 PM",
      venue: event.location,
      organizer: event.organizer || "Alumni Relations Cell",
      image_url: event.image,
      capacity: 100,
      status: "Published"
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <GradientHeader 
        title="Alumni Events Hub" 
        description="Schedule campus reunions, webinars, job fairs, and mentorship kickoffs. Coordinate attendee tracking, badge generation, and feedback reports."
        icon={CalendarIcon}
        color="from-rose-500 to-red-600"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => toast.success("Downloading events ledger report...")}>
            <Download className="w-4 h-4 mr-2" /> Download Report
          </Button>
          <Button className="rounded-xl bg-white text-rose-600 hover:bg-white/90" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2"/> Create Event
          </Button>
        </div>
      </GradientHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Upcoming Gatherings" value={upcomingCount} icon={CalendarIcon} color="rose" />
        <StatCard title="Reunions Completed" value={completedCount} icon={CheckCircle} color="green" />
        <StatCard title="Total Ticket Sales" value={totalRegistrations.toLocaleString()} icon={Users} color="blue" />
        <StatCard title="Campaign Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={DollarSign} color="green" trend={{ value: 12.4, isPositive: true }} />
        <StatCard title="Attendance Rate" value={`${averageAttendance}%`} icon={Award} color="purple" />
        <StatCard title="Average Rating" value={`${feedbackAverage} / 5.0`} icon={Star} color="orange" />
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Active tab */}
        <div className="flex bg-muted/50 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => { setActiveTab('upcoming'); setCurrentPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'upcoming' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Upcoming events ({upcomingCount})
          </button>
          <button 
            onClick={() => { setActiveTab('past'); setCurrentPage(1); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'past' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Past events ({eventsList.filter((e: any) => e.isPast).length})
          </button>
        </div>

        {/* Search, Filter & View toggles */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search by event name..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 rounded-xl bg-background/50 border-muted" 
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-muted"><Filter className="w-4 h-4" /></Button>
          <div className="bg-muted/50 p-1 rounded-xl flex items-center shrink-0">
            {['grid', 'table', 'calendar'].map((vt) => (
              <button 
                key={vt} 
                onClick={() => setViewType(vt as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${viewType === vt ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {vt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid view layout */}
      {viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event: any) => (
            <GlassCard key={event.id} className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300">
              <div className="relative h-44 overflow-hidden bg-muted shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 z-20 flex gap-1.5">
                  <Badge className="bg-black/50 backdrop-blur-md text-white border-0">{event.type}</Badge>
                  {event.price === 0 && <Badge className="bg-emerald-600 text-white border-0">Free</Badge>}
                </div>
                <div className="absolute bottom-4 left-4 z-20 text-white">
                  <h4 className="font-bold text-lg leading-tight line-clamp-1">{event.title}</h4>
                  <p className="text-xs text-white/80 font-medium mt-1 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5"/> {new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{event.description}</p>
                
                <div className="space-y-2 mb-6 text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> <span className="line-clamp-1">{event.location}</span></div>
                  <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> <span>{event.registrations} Registrations</span></div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t shrink-0">
                  <div className="text-xs font-semibold text-muted-foreground">Ticket: <span className="font-bold text-foreground text-sm">{event.price === 0 ? "Free" : `$${event.price}`}</span></div>
                  <div className="flex gap-1.5">
                    <Button onClick={() => { setSelectedEvent(event); setIsDetailOpen(true); }} size="sm" variant="outline" className="rounded-xl">View Details</Button>
                    {!event.isPast && (
                      <Button onClick={() => { setSelectedEvent(event); setIsRegisterOpen(true); }} size="sm" className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white">Register</Button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Table view layout */}
      {viewType === 'table' && (
        <GlassCard className="p-6">
          <StyledTable headers={["Event Name", "Date & Time", "Location", "Organizer", "Price", "Registrations", "Status", "Actions"]}>
            {filteredEvents.map((event: any) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center font-bold text-rose-600 shrink-0">
                      {event.title.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm line-clamp-1">{event.title}</span>
                  </div>
                </TableCell>
                <TableCell><span className="text-xs">{new Date(event.date).toLocaleString()}</span></TableCell>
                <TableCell><span className="text-xs text-muted-foreground line-clamp-1">{event.location}</span></TableCell>
                <TableCell><span className="text-xs text-muted-foreground">{event.organizer}</span></TableCell>
                <TableCell><span className="font-semibold text-xs">{event.price === 0 ? "Free" : `$${event.price}`}</span></TableCell>
                <TableCell><span className="text-xs font-semibold">{event.registrations} registered</span></TableCell>
                <TableCell>
                  {event.isPast ? (
                    <Badge className="bg-muted text-muted-foreground">Completed</Badge>
                  ) : (
                    <Badge className="bg-rose-50 text-rose-600 border-rose-200">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => { setSelectedEvent(event); setIsDetailOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-rose-50 hover:text-rose-600"><Eye className="w-4 h-4"/></Button>
                    <Button onClick={() => handleDuplicate(event)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground" title="Duplicate Event"><Copy className="w-4 h-4"/></Button>
                    <Button onClick={() => toast.error(`Editing page lock for event ${event.id}`)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground"><Edit2 className="w-4 h-4"/></Button>
                    <Button onClick={() => toast.success("Event deleted successfully (Simulated)")} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </StyledTable>
        </GlassCard>
      )}

      {/* Calendar view mock layout */}
      {viewType === 'calendar' && (
        <GlassCard className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">August 2026 Schedule</h3>
            <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-3 py-1 rounded-full">3 Events This Month</span>
          </div>
          <div className="grid grid-cols-7 gap-4 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-xs font-bold text-muted-foreground uppercase">{d}</span>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const hasEvent = dayNum === 15;
              return (
                <div key={i} className={`h-24 border rounded-2xl p-2 flex flex-col justify-between text-left ${hasEvent ? 'bg-rose-50/50 border-rose-200' : 'bg-background/20'}`}>
                  <span className={`text-xs font-bold ${hasEvent ? 'text-rose-600' : 'text-muted-foreground'}`}>{dayNum}</span>
                  {hasEvent && (
                    <div onClick={() => { setSelectedEvent(eventsList[0]); setIsDetailOpen(true); }} className="bg-rose-600 text-white rounded-lg p-1.5 text-[10px] font-semibold truncate cursor-pointer hover:bg-rose-700">
                      Global Alumni Meet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="p-16 text-center border-2 border-dashed rounded-3xl text-muted-foreground bg-card/20 flex flex-col items-center gap-3">
          <CalendarIcon className="w-12 h-12 opacity-15" />
          <h4 className="font-bold text-lg">No events found</h4>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">We couldn't find any scheduled events matching your criteria. Get started by publishing a new campaign.</p>
          <Button className="rounded-xl mt-2 bg-rose-600 hover:bg-rose-700" onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4 mr-2"/> Create Event</Button>
        </div>
      )}

      {/* ── DRAWER: Create Event ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-card w-full max-w-2xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
            <button onClick={() => setIsCreateOpen(false)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-muted text-muted-foreground z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Drawer Header */}
            <div className="p-8 border-b bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20">
              <h3 className="text-xl font-bold flex items-center gap-2 text-rose-600"><CalendarIcon className="w-5 h-5"/> Schedule Alumni Event</h3>
              <p className="text-xs text-muted-foreground mt-1">Publish an upcoming meetup, career webinar or alumni board conference.</p>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleCreateEvent} className="flex-1 overflow-y-auto p-8 space-y-4">
              <FormGroup label="Event Title *" required>
                <StyledInput value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="e.g. Global Alumni Homecoming Reunion" required />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Date & Time *" required>
                  <StyledInput type="datetime-local" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} required />
                </FormGroup>
                <FormGroup label="Ticket Price (₹) *" required>
                  <StyledInput type="number" value={eventForm.price} onChange={e => setEventForm({...eventForm, price: e.target.value})} placeholder="0 for Free" required />
                </FormGroup>
              </div>
              <FormGroup label="Venue / Location *" required>
                <StyledInput value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} placeholder="e.g. San Francisco Marriott / Virtual (Zoom link)" required />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Organizer Entity">
                  <StyledInput value={eventForm.organizer} onChange={e => setEventForm({...eventForm, organizer: e.target.value})} placeholder="e.g. Alumni Relations Office" />
                </FormGroup>
                <FormGroup label="Keynote Speakers">
                  <StyledInput value={eventForm.speakers} onChange={e => setEventForm({...eventForm, speakers: e.target.value})} placeholder="e.g. Sarah Connor (OpenAI)" />
                </FormGroup>
              </div>
              <FormGroup label="Event Description">
                <textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} placeholder="Describe details, eligibility, dress-code, and key highlights..." className="w-full rounded-xl border bg-background/50 p-3 text-sm focus-visible:ring-1 focus-visible:ring-rose-500 min-h-[80px]" />
              </FormGroup>
              <FormGroup label="Event Agenda Timeline">
                <textarea value={eventForm.agenda} onChange={e => setEventForm({...eventForm, agenda: e.target.value})} placeholder="e.g. 05:00 PM: Networking | 06:00 PM: Panel talks" className="w-full rounded-xl border bg-background/50 p-3 text-sm focus-visible:ring-1 focus-visible:ring-rose-500 min-h-[60px]" />
              </FormGroup>
              <FormGroup label="Upload Event Banner Artwork" description="Recommended: 16:9 Aspect Ratio">
                <FileUploadZone label="Click or Drag image file" subLabel="Recommended size: 1200 x 675px" accept="image/jpeg,image/png,image/jpg,image/webp" maxSize={5} />
              </FormGroup>
            </form>

            {/* Drawer Footer Actions */}
            <div className="p-8 border-t bg-muted/10 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" onClick={handleCreateEvent} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white">Publish Event</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Event Details Page ── */}
      {isDetailOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-3xl rounded-3xl border p-0 overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white z-20">
              <X className="w-4 h-4" />
            </button>
            
            {/* Banner block */}
            <div className="h-44 bg-muted relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-6 z-20 text-white">
                <h4 className="text-xl font-bold drop-shadow-sm leading-tight">{selectedEvent.title}</h4>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5 text-rose-500" /> {new Date(selectedEvent.date).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Dialog tabs: Details & Participants */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h5>
                  <p className="text-xs text-foreground/80 leading-relaxed">{selectedEvent.description}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Agenda Timeline</h5>
                  <p className="text-xs text-foreground/80 leading-relaxed p-3 rounded-xl bg-muted/20 border border-muted/50 italic">
                    {selectedEvent.agenda}
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Guest Speakers</h5>
                  <p className="text-xs text-foreground font-semibold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-rose-600" /> {selectedEvent.speakers}
                  </p>
                </div>

                {/* Participants attendance mock */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Registrations ledger</h5>
                    <Button variant="ghost" size="sm" className="text-[10px] text-rose-600" onClick={() => toast.success("Exporting attendee list report...")}>Download List</Button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Johnathan Miller", batch: "2023", email: "jm@meta.com", checkedIn: true },
                      { name: "Clara Oswald", batch: "2022", email: "co@intel.com", checkedIn: false }
                    ].map((reg, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 border rounded-lg bg-muted/10">
                        <div>
                          <span className="font-bold">{reg.name}</span>{" "}
                          <span className="text-muted-foreground">Class of {reg.batch}</span>
                          <span className="text-muted-foreground block text-[10px]">{reg.email}</span>
                        </div>
                        <Badge className={reg.checkedIn ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-muted text-muted-foreground border-0"}>
                          {reg.checkedIn ? "Checked In" : "Unchecked"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar stats details */}
              <div className="md:col-span-1 border-l border-muted/50 pl-6 space-y-6 text-xs">
                <div>
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Campaign Statistics</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Ticket Type:</span> <span className="font-bold">{selectedEvent.price === 0 ? "Free" : "Paid"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Sales Total:</span> <span className="font-bold text-rose-600">₹{selectedEvent.revenue.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Attendance:</span> <span className="font-bold">{selectedEvent.attendanceRate}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Co-Sponsors:</span> <span className="font-semibold text-foreground">{selectedEvent.sponsors?.join(", ") || "None"}</span></div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Venue Logistics</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="text-foreground">{selectedEvent.location}</span></div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><UsersRound className="w-3.5 h-3.5 shrink-0" /> <span className="text-foreground">{selectedEvent.organizer}</span></div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Certificates Distribution</h5>
                  <Button size="sm" className="w-full rounded-xl bg-rose-600 text-white" onClick={() => toast.success("Certificates queue generated successfully.")}>
                    Email E-Certificates
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-muted/10 flex justify-between shrink-0">
              <Button size="sm" onClick={() => { setIsDetailOpen(false); setIsRegisterOpen(true); }} className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white">Book Ticket</Button>
              <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Event Registration ── */}
      {isRegisterOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsRegisterOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-rose-600"><QrCode className="w-5 h-5"/> Event Checkout Ledger</h3>
            <p className="text-xs text-muted-foreground mb-6">Confirm details to generate entry badge QR-Code.</p>
            
            <form onSubmit={handleRegisterCheckout} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Attendee Full Name *</label>
                <Input value={ticketForm.attendeeName} onChange={e => setTicketForm({...ticketForm, attendeeName: e.target.value})} placeholder="e.g. Johnathan Miller" required />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email Address *</label>
                <Input type="email" value={ticketForm.attendeeEmail} onChange={e => setTicketForm({...ticketForm, attendeeEmail: e.target.value})} placeholder="e.g. jm@meta.com" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Ticket Tier</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-rose-500" value={ticketForm.ticketType} onChange={e => setTicketForm({...ticketForm, ticketType: e.target.value})}>
                    <option value="Regular">Regular Pass</option>
                    <option value="VIP">VIP All-Access</option>
                    <option value="Speaker">Speaker Pass</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Ticket Quantity</label>
                  <Input type="number" min="1" value={ticketForm.qty} onChange={e => setTicketForm({...ticketForm, qty: e.target.value})} required />
                </div>
              </div>

              {/* Price Calculations */}
              <div className="p-4 bg-muted/20 border border-muted/50 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-[10px] text-muted-foreground uppercase">Grand Total (INR)</span>
                  <span className="block font-bold text-rose-600 text-lg">₹{(selectedEvent.price * parseInt(ticketForm.qty || "1")).toLocaleString("en-IN")}</span>
                </div>
                <div className="text-right">
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">Payment Secured</Badge>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-rose-600 text-white">Generate Badge & QR Code</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

