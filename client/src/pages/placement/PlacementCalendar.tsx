import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementCalendar, CalendarEventItem } from "@/services/placementService";

export function PlacementCalendar() {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Drive" | "Deadline" | "Interview">("All");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; items: CalendarEventItem[] } | null>(null);

  useEffect(() => {
    fetchPlacementCalendar()
      .then((res) => {
        setEvents(res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to load placement calendar events:", err);
        setLoading(false);
      });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  const firstDayIndexRaw = new Date(year, month, 1).getDay();
  const firstDayIndex = firstDayIndexRaw === 0 ? 6 : firstDayIndexRaw - 1; // Align Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const filteredEvents = events.filter((e) => selectedFilter === "All" || e.type === selectedFilter);

  const getEventsForDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return filteredEvents.filter((e) => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Recruitment Calendar 📅"
        desc="Interactive timeline for upcoming recruitment drives, application deadlines, and interview schedules."
        actions={
          <div className="flex items-center gap-2 border rounded-xl p-1 bg-background">
            {(["All", "Drive", "Deadline", "Interview"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedFilter === filter
                    ? "bg-gradient-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        }
      />

      <Card>
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-primary text-white grid place-items-center font-bold">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{monthName} {year}</h3>
              <p className="text-xs text-muted-foreground">{filteredEvents.length} scheduled events</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl border hover:bg-accent transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-accent transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl border hover:bg-accent transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading recruitment calendar...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-2 bg-muted/30 rounded-xl">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {paddingArray.map((_, idx) => (
                <div key={`pad-${idx}`} className="h-28 rounded-xl border border-dashed border-muted/50 bg-muted/10 opacity-40" />
              ))}

              {daysArray.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <div
                    key={day}
                    onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ date: `${monthName} ${day}, ${year}`, items: dayEvents })}
                    className={`h-28 p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer hover:shadow-md ${
                      isToday ? "border-primary bg-primary/5 font-bold" : "bg-background hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isToday ? "size-6 rounded-full bg-gradient-primary text-white grid place-items-center" : "text-muted-foreground"}`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          className={`text-[10px] p-1 rounded-md font-medium truncate ${
                            evt.type === "Drive"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200"
                              : evt.type === "Deadline"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200"
                          }`}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-muted-foreground text-center font-semibold">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Day Events Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">{selectedDayEvents.date} Events</h3>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedDayEvents.items.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border bg-gradient-soft space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{item.title}</span>
                    <Badge tone={item.type === "Drive" ? "success" : item.type === "Deadline" ? "warn" : "info"}>
                      {item.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="size-3 text-primary shrink-0" />
                    <span>{item.venue}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1 border-t border-muted/40">
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
