import React, { useState } from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { 
  Megaphone, Pin, Clock, MoreHorizontal, FileText, X, Plus, 
  Send, AlertCircle, Info, CheckCircle, Bell, Eye, Trash2, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INITIAL_ANNOUNCEMENTS = [
  { 
    id: 1, 
    title: "Annual General Meeting 2024", 
    date: "Today, 10:00 AM", 
    priority: "high", 
    pinned: true, 
    category: "Governance",
    audience: "All Alumni",
    content: "The Annual General Meeting for the Alumni Association will be held virtually on July 25th. All verified members are invited to attend and vote on upcoming initiatives. The meeting will cover the annual budget review, election of new board members, and discussion of strategic goals for the next academic year. Please register your attendance using the alumni portal by July 20th.",
    author: "Alumni Relations Office"
  },
  { 
    id: 2, 
    title: "New Mentorship Program Launch", 
    date: "Yesterday, 2:30 PM", 
    priority: "normal", 
    pinned: false, 
    category: "Programs",
    audience: "All Alumni",
    content: "We are excited to announce the launch of our new Mentorship Hub. Verified alumni can now register as mentors or request guidance from industry leaders. The platform connects recent graduates with experienced professionals across all departments. Sign up through the Mentorship section in your alumni dashboard to get started today.",
    author: "Career Development Cell"
  },
  { 
    id: 3, 
    title: "Alumni Scholarship Fund — Application Open", 
    date: "2 days ago", 
    priority: "normal", 
    pinned: false, 
    category: "Scholarships",
    audience: "Recent Graduates",
    content: "Applications for the 2024-25 Alumni Scholarship Fund are now open. This year we have 15 scholarships worth ₹50,000 each available for meritorious students from economically weaker sections. Alumni who wish to contribute to the scholarship fund can do so via the Contributions portal. Deadline for student applications: August 15, 2024.",
    author: "Scholarship Committee"
  }
];

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("All");

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    category: "General",
    audience: "All Alumni",
    pinned: false
  });

  const priorityConfig: Record<string, { label: string; color: string; icon: any; badge: string }> = {
    high:   { label: "High Priority",   color: "bg-rose-50 border-rose-200",    icon: AlertCircle, badge: "bg-rose-100 text-rose-700 border-rose-200" },
    normal: { label: "Normal Priority", color: "bg-card",                       icon: Info,        badge: "bg-blue-50 text-blue-700 border-blue-200" },
    low:    { label: "Low Priority",    color: "bg-muted/20",                   icon: CheckCircle, badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    const now = new Date();
    const newAnn = {
      id: Date.now(),
      title: form.title,
      content: form.content,
      priority: form.priority,
      category: form.category,
      audience: form.audience,
      pinned: form.pinned,
      date: `Today, ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
      author: "Alumni Coordinator"
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setIsNewOpen(false);
    setForm({ title: "", content: "", priority: "normal", category: "General", audience: "All Alumni", pinned: false });
    toast.success(`Announcement "${newAnn.title}" published successfully!`);
  };

  const handleDelete = (id: number) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    setIsDetailOpen(false);
    toast.success("Announcement deleted.");
  };

  const handleTogglePin = (id: number) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
    toast.success("Pin status updated.");
  };

  const filtered = filterPriority === "All" 
    ? announcements 
    : announcements.filter(a => a.priority === filterPriority.toLowerCase());

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      <GradientHeader 
        title="Announcements" 
        description="Broadcast important updates, newsletters, and official communications to the alumni network."
        icon={Megaphone}
        color="from-blue-600 to-indigo-600"
      >
        <Button 
          className="rounded-xl bg-white text-blue-600 hover:bg-white/90 font-semibold shadow" 
          onClick={() => setIsNewOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </Button>
      </GradientHeader>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        {["All", "High", "Normal", "Low"].map(f => (
          <button
            key={f}
            onClick={() => setFilterPriority(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
              filterPriority === f 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-card border-muted text-muted-foreground hover:border-blue-400"
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} announcement{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Announcements List */}
      <div className="space-y-5">
        {filtered.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-3xl text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No announcements found</p>
            <p className="text-xs mt-1">Click "New Announcement" to publish one.</p>
          </div>
        )}

        {filtered.map(ann => {
          const cfg = priorityConfig[ann.priority] || priorityConfig.normal;
          const Icon = cfg.icon;
          return (
            <GlassCard key={ann.id} className={cn("p-6 relative overflow-hidden group transition-all hover:shadow-md", cfg.color)}>
              {/* Pinned ribbon */}
              {ann.pinned && <div className="absolute top-0 right-0 border-[28px] border-transparent border-t-amber-500 border-r-amber-500 z-0" />}
              {ann.pinned && <Pin className="absolute top-2 right-2 w-4 h-4 text-white z-10 rotate-45" />}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("rounded-lg text-[10px] uppercase tracking-wider border", cfg.badge)}>
                    <Icon className="w-3 h-3 mr-1" />
                    {cfg.label}
                  </Badge>
                  <Badge variant="outline" className="rounded-lg text-[10px]">{ann.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ann.date}
                  </span>
                </div>
                {/* Actions menu */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                    onClick={() => handleTogglePin(ann.id)}
                    title={ann.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(ann.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2">{ann.title}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 mb-4">{ann.content}</p>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">
                  By <span className="font-semibold text-foreground">{ann.author}</span> · To: {ann.audience}
                </span>
                <Button 
                  variant="outline" size="sm" className="rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                  onClick={() => { setSelectedAnn(ann); setIsDetailOpen(true); }}
                >
                  <Eye className="w-4 h-4 mr-2" /> Read More
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── DRAWER: New Announcement ── */}
      {isNewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-card w-full max-w-xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
            <button 
              onClick={() => setIsNewOpen(false)} 
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-muted text-muted-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Drawer Header */}
            <div className="p-8 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                <Megaphone className="w-5 h-5" /> New Announcement
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Publish an update to the alumni network instantly.</p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Announcement Title *</label>
                <Input 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  placeholder="e.g. Alumni Meet 2024 – Registration Open" 
                  required 
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5">Priority Level</label>
                  <select 
                    className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-blue-500"
                    value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="normal">🔵 Normal Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5">Category</label>
                  <select 
                    className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-blue-500"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Governance">Governance</option>
                    <option value="Programs">Programs</option>
                    <option value="Scholarships">Scholarships</option>
                    <option value="Events">Events</option>
                    <option value="Career">Career</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5">Target Audience</label>
                <select 
                  className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-blue-500"
                  value={form.audience}
                  onChange={e => setForm({...form, audience: e.target.value})}
                >
                  <option value="All Alumni">All Alumni</option>
                  <option value="Recent Graduates">Recent Graduates (Last 5 years)</option>
                  <option value="Batch 2020-2024">Batch 2020–2024</option>
                  <option value="Mentors">Registered Mentors</option>
                  <option value="Donors">Donors & Contributors</option>
                  <option value="Board Members">Board Members</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5">Full Announcement Content *</label>
                <textarea 
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  placeholder="Write the complete announcement body here. Include all important details, dates, links, and instructions for the alumni..."
                  className="w-full rounded-xl border bg-background/50 p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[140px] resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <input 
                  type="checkbox" 
                  id="pinned" 
                  checked={form.pinned}
                  onChange={e => setForm({...form, pinned: e.target.checked})}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <label htmlFor="pinned" className="text-sm font-medium cursor-pointer">
                  📌 Pin this announcement to the top
                </label>
              </div>
            </form>

            {/* Footer */}
            <div className="p-8 border-t bg-muted/10 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Send className="w-4 h-4" /> Publish Announcement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Announcement Detail ── */}
      {isDetailOpen && selectedAnn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsDetailOpen(false)} 
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header band */}
            <div className={cn(
              "p-8 border-b rounded-t-3xl",
              selectedAnn.priority === "high" ? "bg-rose-50 dark:bg-rose-950/20" : "bg-blue-50 dark:bg-blue-950/20"
            )}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={cn("rounded-lg text-[10px] uppercase tracking-wider border", priorityConfig[selectedAnn.priority]?.badge)}>
                  {priorityConfig[selectedAnn.priority]?.label}
                </Badge>
                <Badge variant="outline" className="rounded-lg text-[10px]">{selectedAnn.category}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {selectedAnn.date}
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight">{selectedAnn.title}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Published by <span className="font-semibold text-foreground">{selectedAnn.author}</span> · Audience: <span className="font-semibold text-foreground">{selectedAnn.audience}</span>
              </p>
            </div>

            {/* Body */}
            <div className="p-8">
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{selectedAnn.content}</p>
            </div>

            {/* Footer Actions */}
            <div className="px-8 pb-8 pt-4 border-t flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" size="sm" className="rounded-xl hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                  onClick={() => { handleTogglePin(selectedAnn.id); setIsDetailOpen(false); }}
                >
                  <Pin className="w-4 h-4 mr-1.5" /> {selectedAnn.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button 
                  variant="outline" size="sm" className="rounded-xl hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                  onClick={() => handleDelete(selectedAnn.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                </Button>
              </div>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
