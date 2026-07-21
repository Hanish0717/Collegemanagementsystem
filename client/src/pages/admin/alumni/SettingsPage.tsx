import React, { useState } from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { FormGroup, StyledInput } from "./components/FormElements";
import { StyledTable, TableRow, TableCell } from "./components/TableElements";
import { 
  Settings, Shield, Bell, User, Key, MonitorSmartphone, Globe, 
  Mail, MessageSquare, Database, FileText, Lock, ShieldCheck, 
  Clock, Download, RefreshCw, Play, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('email');
  const [templateText, setTemplateText] = useState(`Dear {{alumni_name}},\n\nWe are excited to invite you to our upcoming {{event_title}} scheduled on {{event_date}} at {{event_location}}.\n\nLooking forward to seeing you there!\n\nBest Regards,\nAlumni Relations Office`);

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'templates', label: 'Communication Templates', icon: FileText },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Logs', icon: Clock },
    { id: 'backup', label: 'System Backups', icon: Database },
  ];

  // Audit Logs mock data
  const auditLogs = [
    { id: 1, timestamp: "2026-07-18T10:12:00Z", user: "Alumni Coordinator", action: "Matched Mentorship pairing MNT-904", ip: "192.168.1.45" },
    { id: 2, timestamp: "2026-07-18T09:45:00Z", user: "Alumni Coordinator", action: "Recorded Donation DON-9435", ip: "192.168.1.45" },
    { id: 3, timestamp: "2026-07-17T18:00:00Z", user: "Alumni Coordinator", action: "Published Event Global Alumni Meet", ip: "192.168.1.45" },
    { id: 4, timestamp: "2026-07-16T14:22:00Z", user: "System Cron", action: "Automated database backup generated", ip: "127.0.0.1" }
  ];

  // Backups mock data
  const [backups, setBackups] = useState([
    { id: "backup-20260716", filename: "backup_prod_db_20260716.sql", size: "48.2 MB", date: "2026-07-16T14:22:00Z", status: "Successful" },
    { id: "backup-20260709", filename: "backup_prod_db_20260709.sql", size: "47.9 MB", date: "2026-07-09T14:20:00Z", status: "Successful" }
  ]);

  const handleSaveTemplate = () => {
    toast.success(`Communication template for ${selectedTemplateCategory.toUpperCase()} saved successfully.`);
  };

  const handleRunBackup = () => {
    toast.info("Starting manual database backup sequence...");
    setTimeout(() => {
      const newBackup = {
        id: `backup-${Date.now()}`,
        filename: `backup_prod_db_${new Date().toISOString().slice(0,10).replace(/-/g,"")}.sql`,
        size: "48.5 MB",
        date: new Date().toISOString(),
        status: "Successful"
      };
      setBackups([newBackup, ...backups]);
      toast.success("Database backup completed and encrypted in cold storage.");
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      <GradientHeader 
        title="Settings & System Preferences" 
        description="Configure mail templates, manage push-channel settings, edit role rules, check security audit logs, and coordinate system database backups."
        icon={Settings}
        color="from-slate-600 to-slate-800"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          <GlassCard className="p-8 min-h-[480px] flex flex-col justify-between">
            {/* General Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold border-b pb-4">Profile & Organization Profile</h3>
                <div className="flex items-center gap-6 mb-6">
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=Me" className="w-20 h-20 rounded-full bg-muted border" />
                  <div>
                    <Button variant="outline" size="sm" className="mb-2">Change Headshot Avatar</Button>
                    <p className="text-[10px] text-muted-foreground">JPG or PNG. Maximum file size: 800 KB</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <FormGroup label="Warden Full Name">
                    <Input placeholder="Warden Anjali" defaultValue="Anjali Sharma" />
                  </FormGroup>
                  <FormGroup label="System Email Address">
                    <Input placeholder="anjali@college.edu" defaultValue="anjali.s@college.edu" />
                  </FormGroup>
                  <FormGroup label="System Role">
                    <Input defaultValue="Alumni Coordinator Admin" disabled />
                  </FormGroup>
                  <FormGroup label="Access Signature Key">
                    <Input type="password" value="••••••••••••••••" disabled />
                  </FormGroup>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => toast.success("Coordinator profile changes saved.")} className="rounded-xl">Save Profiles</Button>
                </div>
              </div>
            )}

            {/* Communication Templates */}
            {activeTab === 'templates' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold border-b pb-4">Transactional Templates Editor</h3>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-muted-foreground uppercase">Template Category:</span>
                  <select 
                    className="h-9 rounded-xl bg-background border px-3 text-xs focus:ring-1 focus:ring-primary"
                    value={selectedTemplateCategory}
                    onChange={e => setSelectedTemplateCategory(e.target.value)}
                  >
                    <option value="email">Email Broadcast Invitation</option>
                    <option value="donation">Donation Voucher Template</option>
                    <option value="event">Event Registration Confirmation</option>
                    <option value="mentorship">Mentorship Match Announcement</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold block">Template Body (HTML / Markdown supported)</label>
                  <textarea 
                    value={templateText} 
                    onChange={e => setTemplateText(e.target.value)}
                    className="w-full font-mono rounded-xl border bg-background/50 p-4 text-xs focus-visible:ring-1 min-h-[160px]" 
                  />
                  <div className="p-3 bg-muted/40 rounded-xl border text-[10px] text-muted-foreground space-y-1">
                    <p className="font-bold uppercase tracking-wider">Available Variables:</p>
                    <p>Use variables to auto-inject payload details: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{"{{alumni_name}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{"{{event_title}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{"{{donation_amount}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{"{{mentor_name}}"}</code></p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={() => setTemplateText("")} variant="outline" className="rounded-xl">Clear</Button>
                  <Button onClick={handleSaveTemplate} className="rounded-xl bg-primary text-primary-foreground">Save Template</Button>
                </div>
              </div>
            )}

            {/* Notification Preferences */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold border-b pb-4">Global Notification Channels</h3>
                <p className="text-xs text-muted-foreground">Select active routing channels for automated workflow notices.</p>
                
                <div className="space-y-4">
                  {[
                    { title: "Direct Email Notifications", desc: "For announcements, ticket confirmation, and receipt PDF mailings.", icon: Mail, checked: true },
                    { title: "Push Notifications", desc: "For chat alerts and pending mentor matches.", icon: MonitorSmartphone, checked: true },
                    { title: "WhatsApp Broadcast API", desc: "For urgent event registration reminders and donation confirmations.", icon: MessageSquare, checked: false },
                    { title: "SMS Direct Integration", desc: "Fallback channel when data networks are unavailable.", icon: Key, checked: false }
                  ].map((chan, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-2xl bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-background border text-primary shrink-0"><chan.icon className="w-4 h-4"/></div>
                        <div className="text-xs">
                          <h4 className="font-bold">{chan.title}</h4>
                          <p className="text-muted-foreground mt-0.5">{chan.desc}</p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked={chan.checked} onChange={() => toast.success(`${chan.title} preference toggled.`)} className="rounded text-primary h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roles & Permissions */}
            {activeTab === 'roles' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold border-b pb-4">Workspace Roles & Permissions</h3>
                <p className="text-xs text-muted-foreground">Manage active permission scopes allowed for the system roles.</p>
                
                <div className="space-y-4 text-xs">
                  <div className="border rounded-2xl overflow-hidden">
                    <div className="bg-muted/40 p-3 font-semibold border-b">Alumni Role Scope</div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-primary" /> <span>Can search directories and request connection logs</span></div>
                      <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-primary" /> <span>Can submit matching request sheets for mentorship</span></div>
                      <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-primary" /> <span>Can register for upcoming events and self-submit donations</span></div>
                    </div>
                  </div>
                  
                  <div className="border rounded-2xl overflow-hidden">
                    <div className="bg-muted/40 p-3 font-semibold border-b">Alumni Coordinator Role Scope</div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-primary" /> <span>Can approve profile self-registrations</span></div>
                      <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-primary" /> <span>Can publish campus event details and manage donation ledgers</span></div>
                      <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-primary" /> <span>Can run AI match pairing system and manual back up scripts</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Logs */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold border-b pb-4">Security Audit Ledger</h3>
                
                <StyledTable headers={["Timestamp", "Actor User", "System Operation Action", "IP Address"]}>
                  {auditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell><span className="text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleString()}</span></TableCell>
                      <TableCell><span className="font-semibold text-xs text-primary">{log.user}</span></TableCell>
                      <TableCell><span className="text-xs font-medium text-foreground">{log.action}</span></TableCell>
                      <TableCell><span className="text-xs text-muted-foreground font-mono">{log.ip}</span></TableCell>
                    </TableRow>
                  ))}
                </StyledTable>
              </div>
            )}

            {/* System Backups */}
            {activeTab === 'backup' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-lg font-bold">SQL Database Backup Manager</h3>
                  <Button onClick={handleRunBackup} size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8">
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Manual Backup
                  </Button>
                </div>

                <StyledTable headers={["Backup SQL File", "Size", "Creation Timestamp", "Security", "Operations"]}>
                  {backups.map(bac => (
                    <TableRow key={bac.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-mono text-xs text-foreground font-semibold">{bac.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-xs">{bac.size}</span></TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{new Date(bac.date).toLocaleString()}</span></TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Encrypted</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button onClick={() => toast.success(`Downloading backup file: ${bac.filename}`)} size="sm" variant="outline" className="h-7 gap-1 rounded-lg">
                            <Download className="w-3.5 h-3.5" /> Download
                          </Button>
                          <Button onClick={() => toast.success(`Restoring database to checkpoint: ${bac.filename}`)} size="sm" variant="outline" className="h-7 gap-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg">
                            <RefreshCw className="w-3.5 h-3.5" /> Restore
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </StyledTable>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
