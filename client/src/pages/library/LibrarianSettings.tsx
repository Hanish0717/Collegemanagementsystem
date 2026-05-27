import { useState } from "react";
import { Save, Lock, Bell, Palette, User, Shield } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function LibrarianSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form States
  const [fullName, setFullName] = useState("Mrs. Anjali Sharma");
  const [email, setEmail] = useState("anjali.sharma@college.edu");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [location, setLocation] = useState("Central Library, 2nd Floor");
  const [bio, setBio] = useState(
    "Experienced librarian with 8 years of service. Specializing in digital library management and cataloging.",
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState([
    {
      id: "due",
      title: "Due Date Reminders",
      desc: "Get alerts for books due within 3 days",
      enabled: true,
    },
    {
      id: "overdue",
      title: "Overdue Notifications",
      desc: "Critical alerts for overdue books",
      enabled: true,
    },
    {
      id: "newMember",
      title: "New Member Requests",
      desc: "Alerts when new members register",
      enabled: true,
    },
    {
      id: "fines",
      title: "Fine Payment Reminders",
      desc: "Notify when fines are collected",
      enabled: false,
    },
    {
      id: "system",
      title: "System Notifications",
      desc: "Maintenance and system updates",
      enabled: false,
    },
    {
      id: "daily",
      title: "Daily Digest",
      desc: "Morning summary of library activities",
      enabled: true,
    },
  ]);
  const [deliveryChannel, setDeliveryChannel] = useState("both");

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Appearance States
  const [selectedTheme, setSelectedTheme] = useState("Light");
  const [sidebarWidth, setSidebarWidth] = useState("default");
  const [compactMode, setCompactMode] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);

  // Profile submit
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Required profile fields cannot be empty.");
      return;
    }
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Librarian profile updated successfully!");
    }, 800);
  };

  const handleResetProfile = () => {
    setFullName("Mrs. Anjali Sharma");
    setEmail("anjali.sharma@college.edu");
    setPhone("+91 98765 43210");
    setLocation("Central Library, 2nd Floor");
    setBio(
      "Experienced librarian with 8 years of service. Specializing in digital library management and cataloging.",
    );
    toast.info("Profile fields reset to defaults.");
  };

  // Notification submit
  const handleToggleNotif = (idx: number) => {
    const updated = [...notifPreferences];
    updated[idx].enabled = !updated[idx].enabled;
    setNotifPreferences(updated);
  };

  const handleSaveNotifPrefs = () => {
    toast.success("Notification delivery preferences stored successfully!");
  };

  // Password change submit
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all the password fields.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Confirmation password does not match the new password.");
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Librarian account password updated successfully!");
    }, 1000);
  };

  // Enable 2FA toggle
  const handleToggle2FA = () => {
    const nextState = !is2FAEnabled;
    setIs2FAEnabled(nextState);
    if (nextState) {
      toast.success("Two-Factor Authentication (2FA) enabled successfully!");
    } else {
      toast.warning("Two-Factor Authentication disabled.");
    }
  };

  // Save Display Settings
  const handleSaveDisplay = () => {
    toast.success(
      `Display configurations saved! (Theme: ${selectedTheme}, Layout: ${sidebarWidth})`,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" desc="Manage librarian profile, preferences and security." />

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Security", icon: Lock },
          { id: "appearance", label: "Appearance", icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-b-violet-600 text-violet-600"
                : "border-b-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="size-4" />
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Card>
            <h3 className="font-semibold mb-4 text-gradient">Librarian Profile Details</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Employee ID</label>
                  <input
                    type="text"
                    value="LIB-0001"
                    disabled
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background/40 text-sm opacity-60 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Bio / About</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50 transition text-sm"
                >
                  <Save className="size-4" />
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="px-5 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer text-sm"
                >
                  Reset Defaults
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Permissions & Role</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-gradient-soft border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-muted-foreground">Assigned Role</div>
                  <div className="font-bold text-sm mt-0.5">Library System Administrator</div>
                </div>
                <Badge tone="success">Active</Badge>
              </div>

              <div className="p-3 rounded-lg bg-gradient-soft border">
                <div className="font-semibold text-xs text-muted-foreground mb-2">
                  Access Privileges Enabled
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div>✅ Catalog Modifications</div>
                  <div>✅ Issue & Return Registers</div>
                  <div>✅ Fine Penalties & Waivers</div>
                  <div>✅ Student Registry Directory</div>
                  <div>✅ Circulation Performance Metrics</div>
                  <div>✅ System Core Configurations</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card className="animate-in fade-in duration-200">
          <h3 className="font-semibold mb-4 text-gradient">Notification System Preferences</h3>
          <div className="space-y-4">
            {notifPreferences.map((notif, idx) => (
              <div
                key={notif.id}
                className="flex items-center justify-between p-3 border rounded-xl hover:bg-gradient-soft transition"
              >
                <div className="pr-2">
                  <div className="font-semibold text-sm">{notif.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{notif.desc}</div>
                </div>
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notif.enabled}
                    onChange={() => handleToggleNotif(idx)}
                    className="rounded accent-violet-600 size-4 cursor-pointer"
                  />
                </label>
              </div>
            ))}

            <div className="p-4 rounded-xl border bg-gradient-soft mt-4 text-sm">
              <div className="font-semibold mb-2">Notice Delivery Channels</div>
              <div className="space-y-2">
                {[
                  { id: "inapp", label: "In-app notifications dashboard" },
                  { id: "email", label: "Registered email address alerts" },
                  { id: "both", label: "Both In-app alerts & Email delivery" },
                ].map((channel) => (
                  <label
                    key={channel.id}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="deliveryChannel"
                      checked={deliveryChannel === channel.id}
                      onChange={() => setDeliveryChannel(channel.id)}
                      className="accent-violet-600 size-4 cursor-pointer"
                    />
                    <span>{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveNotifPrefs}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary mt-4 cursor-pointer hover:opacity-90 transition text-sm"
            >
              Save Delivery Preferences
            </button>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Card>
            <h3 className="font-semibold mb-4 text-gradient">Modify Account Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Current Account Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  New Strong Password *
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  placeholder="Match new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary mt-4 cursor-pointer hover:opacity-90 disabled:opacity-50 transition text-sm"
              >
                {isUpdatingPassword ? "Updating Password..." : "Update Credentials"}
              </button>
            </form>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="size-4" /> Two-Factor Authentication
            </h3>
            <div className="p-4 rounded-xl bg-gradient-soft border mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge tone={is2FAEnabled ? "success" : "danger"}>
                  {is2FAEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Add an extra layer of security to your admin account by requiring verification
                codes.
              </p>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`px-4 py-2.5 rounded-xl border font-medium transition cursor-pointer text-sm ${
                is2FAEnabled
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "hover:bg-gradient-soft text-muted-foreground"
              }`}
            >
              {is2FAEnabled ? "Disable 2FA Protection" : "Enable 2FA Protection"}
            </button>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Active System Sessions</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border bg-gradient-soft flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-muted-foreground">
                    Current Session Device
                  </div>
                  <div className="text-sm font-semibold mt-0.5">
                    Chrome on Windows • 192.168.1.100
                  </div>
                </div>
                <Badge tone="success">Active Now</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Card>
            <h3 className="font-semibold mb-4 text-gradient">Application Theme Mode</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { name: "Light", icon: "☀️" },
                { name: "Dark", icon: "🌙" },
                { name: "Auto", icon: "🔄" },
              ].map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    setSelectedTheme(theme.name);
                    toast.success(`Theme mode switched to ${theme.name}!`);
                  }}
                  className={`p-4 rounded-xl border-2 text-center font-medium transition cursor-pointer ${
                    selectedTheme === theme.name
                      ? "border-violet-600 bg-gradient-soft"
                      : "border-border hover:border-violet-600"
                  }`}
                >
                  <div className="text-2xl mb-2">{theme.icon}</div>
                  <div className="text-sm font-bold">{theme.name}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Sidebar Layout Style</h3>
            <div className="space-y-3 text-sm">
              {[
                { id: "default", label: "Default expanded view width" },
                { id: "compact", label: "Compact icons only view" },
                { id: "collapsed", label: "Collapsed sidebar menu layout" },
              ].map((layout) => (
                <label
                  key={layout.id}
                  className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gradient-soft transition cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="sidebarWidth"
                    checked={sidebarWidth === layout.id}
                    onChange={() => setSidebarWidth(layout.id)}
                    className="accent-violet-600 size-4 cursor-pointer"
                  />
                  <span>{layout.label}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Display Toggles</h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between p-3 border rounded-xl hover:bg-gradient-soft transition cursor-pointer select-none">
                <span className="font-medium">Compact Mode layout spacing</span>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="rounded accent-violet-600 size-4 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-3 border rounded-xl hover:bg-gradient-soft transition cursor-pointer select-none">
                <span className="font-medium">Render visual transition animations</span>
                <input
                  type="checkbox"
                  checked={showAnimations}
                  onChange={(e) => setShowAnimations(e.target.checked)}
                  className="rounded accent-violet-600 size-4 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between p-3 border rounded-xl hover:bg-gradient-soft transition cursor-pointer select-none">
                <span className="font-medium">Render hover system tooltips</span>
                <input
                  type="checkbox"
                  checked={showTooltips}
                  onChange={(e) => setShowTooltips(e.target.checked)}
                  className="rounded accent-violet-600 size-4 cursor-pointer"
                />
              </label>
            </div>
          </Card>

          <button
            onClick={handleSaveDisplay}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-sm"
          >
            Save Display Settings
          </button>
        </div>
      )}
    </div>
  );
}
