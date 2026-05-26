import { createFileRoute } from "@tanstack/react-router";
import { Bell, Search, Check, AlertTriangle, DollarSign, MessageSquare, Shield } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { hostelNotificationsList } from "@/mock/hostelData";



export function HostelNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        desc="Manage hostel announcements, fee reminders, and alerts."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Notifications", value: "25", tone: "info" as const },
          { label: "Unread", value: "8", tone: "warn" as const },
          { label: "High Priority", value: "3", tone: "danger" as const },
          { label: "This Week", value: "15", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search notifications..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Types", "Fee", "Complaint", "Policy", "Mess", "Emergency"].map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Priority", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Unread", "Read"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">All Notifications</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground transition">Mark all as read</button>
          </div>
          <div className="space-y-2">
            {hostelNotificationsList.map(notification => (
              <div key={notification.id} className={`flex items-center gap-3 p-4 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${notification.read ? "" : "bg-blue-50 border-blue-200"}`}>
                <div className={`size-10 rounded-lg ${notification.priority === "High" ? "bg-gradient-primary" : notification.priority === "Medium" ? "bg-gradient-violet" : "bg-gradient-cyan"} text-white grid place-items-center`}>
                  {notification.type === "Fee" && <DollarSign className="size-4" />}
                  {notification.type === "Complaint" && <MessageSquare className="size-4" />}
                  {notification.type === "Policy" && <Shield className="size-4" />}
                  {notification.type === "Mess" && <Bell className="size-4" />}
                  {notification.type === "Emergency" && <AlertTriangle className="size-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{notification.title}</span>
                    <Badge tone={notification.priority === "High" ? "danger" : notification.priority === "Medium" ? "warn" : "success"}>
                      {notification.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{notification.type} • {notification.time}</div>
                </div>
                {!notification.read && <div className="size-2 rounded-full bg-primary" />}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notification Filters</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Fee Reminders", count: 8, icon: DollarSign },
              { label: "Complaint Updates", count: 6, icon: MessageSquare },
              { label: "Policy Changes", count: 4, icon: Shield },
              { label: "Mess Alerts", count: 5, icon: Bell },
              { label: "Emergency", count: 2, icon: AlertTriangle },
            ].map(filter => (
              <button key={filter.label} className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-center gap-2">
                  <filter.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm">{filter.label}</span>
                </div>
                <Badge tone="info">{filter.count}</Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold">Fee Reminders</h3>
          </div>
          <div className="space-y-2">
            {[
              { student: "Priya Patel", amount: "$8,000", dueDate: "Jun 1, 2026", daysLeft: 7 },
              { student: "Vikram Singh", amount: "$8,000", dueDate: "May 30, 2026", daysLeft: 5 },
              { student: "Amit Kumar", amount: "$8,000", dueDate: "May 25, 2026", daysLeft: 0 },
            ].map(reminder => (
              <div key={reminder.student} className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{reminder.student}</div>
                    <div className="text-xs text-muted-foreground">Due: {reminder.dueDate}</div>
                  </div>
                  <Badge tone={reminder.daysLeft === 0 ? "danger" : "warn"}>{reminder.daysLeft} days left</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Amount: {reminder.amount}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-indigo" />
            <h3 className="font-semibold">Emergency Notifications</h3>
          </div>
          <div className="space-y-2">
            {[
              { title: "Emergency drill scheduled", date: "May 28, 2026", time: "10:00 AM", type: "Drill" },
              { title: "Fire safety inspection", date: "May 30, 2026", time: "09:00 AM", type: "Inspection" },
              { title: "Power maintenance alert", date: "Jun 2, 2026", time: "02:00 PM", type: "Maintenance" },
            ].map(emergency => (
              <div key={emergency.title} className="p-3 rounded-xl border bg-rose-50 border-rose-200 hover:bg-accent/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{emergency.title}</div>
                    <div className="text-xs text-muted-foreground">{emergency.date} • {emergency.time}</div>
                  </div>
                  <Badge tone="danger">{emergency.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="size-5 text-indigo" />
          <h3 className="font-semibold">Hostel Announcements</h3>
        </div>
        <div className="space-y-2">
          {[
            { title: "Room cleaning schedule updated", date: "May 24, 2026", type: "Maintenance" },
            { title: "New visitor policy effective from Monday", date: "May 23, 2026", type: "Policy" },
            { title: "Mess menu changes for next week", date: "May 22, 2026", type: "Mess" },
            { title: "Fee payment deadline reminder", date: "May 21, 2026", type: "Fee" },
          ].map(announcement => (
            <div key={announcement.title} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center">
                <Bell className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{announcement.title}</div>
                <div className="text-xs text-muted-foreground">{announcement.type} • {announcement.date}</div>
              </div>
              <Badge tone="info">{announcement.type}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
