import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Bed, DollarSign, Users, AlertTriangle, Bell, CheckCircle, Clock, Home, Utensils, UserCheck } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { hostelStats, roomOccupancyData, feeCollectionData, complaintStatusData, hostelActivities, hostelNotifications } from "@/mock/hostelData";



export function HostelDashboard() {
  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Management"
        desc="Manage hostel rooms, occupancy, fees, complaints, mess, and visitors."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {hostelStats.map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Room Occupancy Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={roomOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="occupied" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="available" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold">Complaint Status</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={complaintStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {complaintStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {complaintStatusData.map((item, index) => (
              <div key={item.status} className="flex items-center gap-2 text-xs">
                <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-muted-foreground">{item.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold">Fee Collection Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="collected" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Recent Activities</h3>
          </div>
          <div className="space-y-2">
            {hostelActivities.map(activity => (
              <div key={activity.time} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {activity.type[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{activity.actor}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="space-y-2">
            {hostelNotifications.map(notification => (
              <div key={notification.id} className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${notification.unread ? "bg-blue-50 border-blue-200" : ""}`}>
                <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center">
                  <Bell className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{notification.title}</span>
                    {notification.unread && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{notification.type} • {notification.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Bed, label: "Room Allocation", color: "bg-gradient-primary" },
              { icon: Users, label: "Student List", color: "bg-gradient-violet" },
              { icon: DollarSign, label: "Fee Collection", color: "bg-gradient-cyan" },
              { icon: Utensils, label: "Mess Menu", color: "bg-gradient-primary" },
              { icon: UserCheck, label: "Visitor Log", color: "bg-gradient-violet" },
              { icon: AlertTriangle, label: "Complaints", color: "bg-gradient-cyan" },
            ].map(action => (
              <button key={action.label} className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition flex flex-col items-center gap-2">
                <div className={`size-10 rounded-lg ${action.color} text-white grid place-items-center`}>
                  <action.icon className="size-5" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
