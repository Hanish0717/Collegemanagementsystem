import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { events } from "@/lib/mock-data";
import { Calendar, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/events")({ component: EventsPage });

function EventsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Events" desc="Plan, promote and manage campus events." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map(e=>(
          <Card key={e.title} className="overflow-hidden p-0">
            <div className={`bg-gradient-to-br ${e.color} p-6 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="relative">
                <div className="text-xs opacity-80">{e.category}</div>
                <div className="font-bold text-lg mt-1">{e.title}</div>
                <div className="mt-4 text-3xl font-bold">{e.date}</div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="size-3.5" /> {e.attendees} going</div>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-gradient-primary text-white glow-primary">Register</button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Gallery</h3>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_,i)=>(
              <div key={i} className={`aspect-square rounded-xl ${["bg-gradient-primary","bg-gradient-violet","bg-gradient-cyan"][i%3]} opacity-${80 - (i%3)*10}`} />
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">Calendar</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} className="font-medium text-muted-foreground py-2">{d}</div>)}
            {[...Array(30)].map((_,i)=>{
              const has = [3,8,14,22,27].includes(i);
              return <div key={i} className={`aspect-square rounded-lg grid place-items-center text-xs ${has ? "bg-gradient-primary text-white font-bold" : "hover:bg-muted"}`}>{i+1}</div>;
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
