import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Utensils, Plus, Search, Calendar, Clock, Star, MessageSquare } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { messMenu, messAttendanceData } from "@/lib/hostel-data";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/hostel/mess")({
  component: MessManagement,
});

function MessManagement() {
  const [activeTab, setActiveTab] = useState<"breakfast" | "lunch" | "dinner">("breakfast");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Management"
        desc="Manage daily mess menu, meal attendance, payments, and food schedule."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Menu Item
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "396", tone: "info" as const },
          { label: "Breakfast Attendance", value: "94%", tone: "success" as const },
          { label: "Lunch Attendance", value: "95%", tone: "success" as const },
          { label: "Dinner Attendance", value: "93%", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Today</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search menu items..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["This Week", "Next Week", "This Month"].map(w => <option key={w}>{w}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Daily Mess Menu</h3>
          <div className="flex gap-2 mb-4">
            {[
              { key: "breakfast" as const, label: "Breakfast" },
              { key: "lunch" as const, label: "Lunch" },
              { key: "dinner" as const, label: "Dinner" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-gradient-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {messMenu[activeTab].map(item => (
              <div key={item.item} className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.item}</span>
                  <Badge tone="info">{item.calories}</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Clock className="size-3" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-indigo" />
            <h3 className="font-semibold">Food Schedule</h3>
          </div>
          <div className="space-y-2">
            {[
              { day: "Monday", special: "Special: Chole Bhature" },
              { day: "Tuesday", special: "Special: Veg Biryani" },
              { day: "Wednesday", special: "Special: Paneer Tikka" },
              { day: "Thursday", special: "Special: Dal Makhani" },
              { day: "Friday", special: "Special: South Indian Thali" },
              { day: "Saturday", special: "Weekend: Pizza Day" },
              { day: "Sunday", special: "Weekend: Ice Cream" },
            ].map(schedule => (
              <div key={schedule.day} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
                <span className="text-sm font-medium">{schedule.day}</span>
                <span className="text-xs text-muted-foreground">{schedule.special}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="size-5 text-indigo" />
            <h3 className="font-semibold">Meal Attendance Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={messAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="breakfast" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="lunch" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="dinner" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Star className="size-5 text-indigo" />
            <h3 className="font-semibold">Mess Feedback</h3>
          </div>
          <div className="space-y-2">
            {[
              { student: "Rahul Sharma", rating: 5, comment: "Excellent food quality" },
              { student: "Priya Patel", rating: 4, comment: "Good variety, needs more options" },
              { student: "Amit Kumar", rating: 4, comment: "Timely service" },
              { student: "Sneha Reddy", rating: 5, comment: "Love the weekend specials" },
            ].map(feedback => (
              <div key={feedback.student} className="p-3 rounded-xl border bg-gradient-soft">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{feedback.student}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${i < feedback.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{feedback.comment}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="size-5 text-indigo" />
          <h3 className="font-semibold">Special Meal Requests</h3>
        </div>
        <div className="space-y-2">
          {[
            { student: "Rahul Sharma", request: "Gluten-free meals", status: "Approved" },
            { student: "Priya Patel", request: "Vegan options", status: "Pending" },
            { student: "Amit Kumar", request: "No spicy food", status: "Approved" },
          ].map(request => (
            <div key={request.student} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
              <div>
                <div className="text-sm font-medium">{request.student}</div>
                <div className="text-xs text-muted-foreground">{request.request}</div>
              </div>
              <Badge tone={request.status === "Approved" ? "success" : "warn"}>{request.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
