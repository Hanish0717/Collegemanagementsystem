import React, { useState } from "react";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { Settings, Shield, Bell, User, Key, MonitorSmartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'devices', label: 'Devices', icon: MonitorSmartphone },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto pb-24">
      <GradientHeader 
        title="Settings & Preferences" 
        description="Manage your account, privacy, and system preferences."
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          <GlassCard className="p-8 min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-xl font-bold border-b pb-4 mb-6">Profile Settings</h3>
                <div className="flex items-center gap-6 mb-8">
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=Me" className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-sm" />
                  <div>
                    <Button variant="outline" className="mb-2">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl">
                  Form fields prepared for backend integration.
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-xl font-bold border-b pb-4 mb-6 flex items-center gap-2"><Key className="w-5 h-5"/> Security & Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-background/50">
                    <div>
                      <h4 className="font-semibold text-sm">Two-Factor Authentication</h4>
                      <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50">Enable 2FA</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-background/50">
                    <div>
                      <h4 className="font-semibold text-sm">Change Password</h4>
                      <p className="text-xs text-muted-foreground mt-1">Update your password regularly to keep your account secure.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl">Update</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'profile' && activeTab !== 'security' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground animate-in fade-in">
                <Settings className="w-12 h-12 opacity-20 mb-4" />
                <p>This settings panel is ready for integration.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
