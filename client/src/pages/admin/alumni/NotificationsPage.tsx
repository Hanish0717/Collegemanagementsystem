import React from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { Bell, CheckCheck, Settings, Heart, MessageSquare, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationsPage() {
  const notifications = [
    { id: 1, type: "system", title: "Verification Approved", text: "Your alumni profile has been verified.", time: "10 mins ago", unread: true, icon: ShieldAlert, color: "text-emerald-500 bg-emerald-50" },
    { id: 2, type: "social", title: "New Connection Request", text: "David Chen sent you a connection request.", time: "2 hours ago", unread: true, icon: Heart, color: "text-rose-500 bg-rose-50" },
    { id: 3, type: "message", title: "New Message", text: "You have a new message from Sarah.", time: "Yesterday", unread: false, icon: MessageSquare, color: "text-blue-500 bg-blue-50" }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1000px] mx-auto pb-24">
      <GradientHeader 
        title="Notification Center" 
        description="Stay updated with the latest activity in your alumni network."
        icon={Bell}
        color="from-purple-600 to-pink-600"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white bg-transparent hover:bg-white/10"><CheckCheck className="w-4 h-4 mr-2" /> Mark All Read</Button>
          <Button variant="outline" size="icon" className="rounded-xl border-white/20 text-white bg-transparent hover:bg-white/10"><Settings className="w-4 h-4"/></Button>
        </div>
      </GradientHeader>

      <GlassCard className="overflow-hidden">
        <div className="divide-y divide-border/50">
          {notifications.map(n => (
            <div key={n.id} className={`p-6 flex gap-4 transition-colors hover:bg-muted/30 cursor-pointer ${n.unread ? 'bg-primary/5' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                <n.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-base ${n.unread ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>{n.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{n.text}</p>
              </div>
              {n.unread && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 shrink-0" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
