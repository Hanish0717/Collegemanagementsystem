import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentSettingsFull } from '../services/hodFinalService';
import { PageContainer } from '../components/shared/PageContainer';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { Save, Building2, Users, Eye, Bell, Table2, Globe } from 'lucide-react';

const SETTING_TABS = [
  { id: 'department', label: 'Department Info', icon: Building2 },
  { id: 'coordinators', label: 'Coordinators', icon: Users },
  { id: 'customization', label: 'Customization', icon: Eye },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
] as const;

export function HODSettingsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'department' | 'coordinators' | 'customization' | 'notifications'>('department');
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartmentSettingsFull(departmentCode).then(res => setSettings((res as any).settings));
  }, [departmentCode]);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      NotificationToast.success('Settings Saved', 'Department settings updated successfully.');
    }, 1200);
  };

  if (!settings) return (
    <PageContainer title="Department Settings" subtitle="Loading settings..." breadcrumbItems={[{ label: 'Settings' }]}>
      <GlassCard className="p-8 text-center text-xs text-slate-500">Loading department settings...</GlassCard>
    </PageContainer>
  );

  return (
    <PageContainer
      title="Department Settings"
      subtitle={`Configure ${departmentInfo.name} information, coordinators, and personalization preferences`}
      breadcrumbItems={[{ label: 'Settings' }]}
      actions={
        <Button variant="primary" size="sm" iconLeft={Save} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        {SETTING_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}>
              <Icon className="size-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Department Info */}
      {activeTab === 'department' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5 space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Basic Information</h4>
            <Field label="Department Name" value={settings.departmentName} />
            <Field label="Short Name / Code" value={settings.shortName} />
            <Field label="Academic Year" value={settings.academicYear} />
            <Field label="Current Semester" value={settings.currentSemester} />
            <Field label="HOD Name" value={settings.hodName} />
            <Field label="HOD Email" value={settings.hodEmail} />
          </GlassCard>
          <GlassCard className="p-5 space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Office Information</h4>
            <Field label="Office Phone" value={settings.officePhone} />
            <Field label="Office Location" value={settings.officeLocation} />
            <Field label="Working Hours" value={settings.workingHours} />
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Department Vision</label>
              <textarea rows={3} defaultValue={settings.vision}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold resize-none" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Department Mission</label>
              <textarea rows={3} defaultValue={settings.mission}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold resize-none" />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Coordinators */}
      {activeTab === 'coordinators' && (
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Department Coordinators</h4>
            <Button variant="outline" size="sm" onClick={() => NotificationToast.info('Add Coordinator', 'Coordinator assignment form ready.')}>
              + Add Coordinator
            </Button>
          </div>
          <div className="space-y-3">
            {(settings.coordinators || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-slate-500 font-medium mt-0.5">{c.role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => NotificationToast.info('Edit Coordinator', `Editing ${c.name}`)}>Edit</Button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Customization */}
      {activeTab === 'customization' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5 space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Display Preferences</h4>
            <SelectField label="Theme" options={['System Default', 'Dark Mode', 'Light Mode']} />
            <SelectField label="Table Density" options={['Compact', 'Normal', 'Comfortable']} />
            <SelectField label="Date Format" options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} />
            <SelectField label="Language" options={['English', 'Telugu', 'Hindi']} />
          </GlassCard>
          <GlassCard className="p-5 space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Default Dashboard Widgets</h4>
            {['Attendance KPIs', 'Pending Approvals', 'Recent Notifications', 'Research Metrics', 'Event Calendar', 'Faculty Workload'].map(w => (
              <label key={w} className="flex items-center gap-3 text-xs font-semibold cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-slate-700 dark:text-slate-300">{w}</span>
              </label>
            ))}
          </GlassCard>
        </div>
      )}

      {/* Notification Preferences */}
      {activeTab === 'notifications' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Notification Preferences</h4>
          {[
            { label: 'Attendance Shortage Alerts (<75%)', checked: true },
            { label: 'Pending Leave & OD Approvals', checked: true },
            { label: 'Research Submission Deadlines', checked: true },
            { label: 'Upcoming Events & Seminars', checked: true },
            { label: 'Mentoring Session Reminders', checked: false },
            { label: 'System Announcements (NAAC / NBA)', checked: true },
            { label: 'Daily Attendance Summary (8 AM)', checked: false },
            { label: 'Weekly Performance Report (Monday)', checked: true },
          ].map(item => (
            <label key={item.label} className="flex items-center gap-3 text-xs font-semibold cursor-pointer">
              <input type="checkbox" defaultChecked={item.checked} className="rounded" />
              <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
            </label>
          ))}
        </GlassCard>
      )}
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input defaultValue={value}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold" />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <select className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
