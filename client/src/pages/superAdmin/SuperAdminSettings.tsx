import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, ShieldCheck, Lock, Bell, Save } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import {
  fetchSystemSettings,
  saveProfile,
  saveSecuritySettings,
  saveNotificationPrefs,
  updatePassword,
} from '@/services/superAdminService';
import { Skeleton } from '@/components/ui/skeleton';

export function SuperAdminSettings() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['superAdminSystemSettings'],
    queryFn: fetchSystemSettings,
  });

  // Profile states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profileBio, setProfileBio] = useState('');

  // Password states
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');

  useEffect(() => {
    if (data?.profile) {
      setProfileName(data.profile.profileName || '');
      setProfileEmail(data.profile.profileEmail || '');
      setProfilePhone(data.profile.profilePhone || '');
      setProfileRole(data.profile.profileRole || '');
      setProfileBio(data.profile.profileBio || '');
    }
  }, [data]);

  const securityOpts = data?.securityOpts || [true, false, true, true];
  const notifOpts = data?.notifOpts || [true, true, true, true];

  const profileMutation = useMutation({
    mutationFn: saveProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminSystemSettings'] });
      toast.success('Profile details saved successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to save profile');
    },
  });

  const securityMutation = useMutation({
    mutationFn: saveSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminSystemSettings'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to save security settings');
    },
  });

  const notifPrefsMutation = useMutation({
    mutationFn: saveNotificationPrefs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminSystemSettings'] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to save notification preferences',
      );
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully.');
      setCurrPassword('');
      setNewPassword('');
      setConfPassword('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update password');
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate({ profileName, profileEmail, profilePhone, profileRole, profileBio });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword || !confPassword) {
      toast.error('Please fill in both new and confirm password fields');
      return;
    }
    if (newPassword !== confPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    updatePasswordMutation.mutate({ currentPassword: currPassword, newPassword });
  };

  const handleToggleSecurity = (index: number, name: string) => {
    const updated = [...securityOpts];
    updated[index] = !updated[index];
    securityMutation.mutate(updated);
    toast.success(`${name} is now ${updated[index] ? 'enabled' : 'disabled'}`);
  };

  const handleToggleNotifPref = (index: number, name: string) => {
    const updated = [...notifOpts];
    updated[index] = !updated[index];
    notifPrefsMutation.mutate(updated);
    toast.success(`${name} preferences updated`);
  };

  const securityNames = [
    'Two-factor authentication',
    'Session timeout',
    'IP monitoring',
    'Login alerts',
  ];
  const notifNames = [
    'Critical system alerts',
    'Approval requests',
    'Security warnings',
    'Weekly summaries',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Settings"
        desc="Manage profile, role permissions, password settings, security controls and notification preferences."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Super Admin Profile</h3>
          </div>
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form
              onSubmit={handleSaveProfile}
              className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Full Name
                  </label>
                  <input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Contact Number
                  </label>
                  <input
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    required
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Role Designation
                  </label>
                  <input
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    required
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Governance Mandate / Bio
                </label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition hover:opacity-95 disabled:opacity-50"
              >
                <Save className="size-4" /> Save Profile
              </button>
            </form>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Role Permissions</h3>
          </div>
          <div className="space-y-3">
            {[
              'User management',
              'System configuration',
              'Financial reports',
              'Security audit logs',
              'Backup restore access',
              'Automation controls',
            ].map((permission, index) => (
              <div
                key={permission}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <span className="text-sm font-medium">{permission}</span>
                <Badge tone={index < 5 ? 'success' : 'warn'}>
                  {index < 5 ? 'Full Access' : 'Approval'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="size-5 text-indigo" />
            <h3 className="font-semibold">Password Management</h3>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currPassword}
              onChange={(e) => setCurrPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confPassword}
              onChange={(e) => setConfPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="w-full px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-semibold cursor-pointer transition hover:opacity-95 disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Security Settings</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              securityNames.map((setting, index) => (
                <div
                  key={setting}
                  className="flex items-center justify-between p-3 rounded-xl border"
                >
                  <span className="text-sm">{setting}</span>
                  <button
                    onClick={() => handleToggleSecurity(index, setting)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${securityOpts[index] ? 'bg-emerald-500' : 'bg-muted'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${securityOpts[index] ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              notifNames.map((setting, index) => (
                <label
                  key={setting}
                  className="flex items-center gap-2.5 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={notifOpts[index]}
                    onChange={() => handleToggleNotifPref(index, setting)}
                    className="rounded border-muted-foreground text-primary focus:ring-primary cursor-pointer size-4"
                  />
                  <span className="text-sm font-medium">{setting}</span>
                </label>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
