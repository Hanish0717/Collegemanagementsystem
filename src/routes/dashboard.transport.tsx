import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { buses } from "@/lib/mock-data";
import { Bus, MapPin, User } from "lucide-react";

export const Route = createFileRoute("/dashboard/transport")({ component: TransportPage });

function TransportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Transport" desc="Bus routes, drivers and live tracking." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buses.map(b=>(
          <Card key={b.route}>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center"><Bus className="size-5" /></div>
              <div className="flex-1">
                <div className="font-semibold">{b.route}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1"><User className="size-3" /> {b.driver}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3.5" /> {b.coverage}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs">{b.students} students</span>
              <Badge tone={b.status==="On Route"?"success":b.status==="Idle"?"info":"warn"}>{b.status}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Live Tracking</h3>
        <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-soft border">
          <div className="absolute inset-0 grid-bg opacity-50" />
          {[
            { l: "30%", t: "40%", c: "bg-gradient-primary", n: "R-01" },
            { l: "55%", t: "60%", c: "bg-gradient-violet", n: "R-03" },
            { l: "70%", t: "30%", c: "bg-gradient-cyan", n: "R-02" },
            { l: "20%", t: "70%", c: "bg-gradient-primary", n: "R-04" },
          ].map(p=>(
            <div key={p.n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.l, top: p.t }}>
              <div className={`size-10 rounded-full ${p.c} text-white grid place-items-center text-[10px] font-bold animate-pulse-glow`}>{p.n}</div>
            </div>
          ))}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <path d="M 60 120 Q 200 80 320 200 T 600 100" stroke="#4F46E5" strokeWidth="2" strokeDasharray="6 6" fill="none" />
            <path d="M 100 250 Q 300 200 500 280" stroke="#06B6D4" strokeWidth="2" strokeDasharray="6 6" fill="none" />
          </svg>
        </div>
      </Card>
    </div>
  );
}
