import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, Bell, ShieldAlert, Send, Calendar, FileText, CheckCircle2, UserCheck, AlertOctagon } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { NotificationToast } from '../shared/NotificationToast';
import { Modal } from '../shared/Modal';
import { hodStore } from '../../services/hodStore';

interface LowAttentionAlertItem {
  id: string;
  title: string;
  category: string;
  metric: string;
  priority: string;
  action: string;
}

interface HODLowAttentionAlertsProps {
  alerts: LowAttentionAlertItem[];
}

export function HODLowAttentionAlerts({ alerts: initialAlerts }: HODLowAttentionAlertsProps) {
  const [alertsList, setAlertsList] = useState<LowAttentionAlertItem[]>(initialAlerts);
  const [activeAlert, setActiveAlert] = useState<LowAttentionAlertItem | null>(null);

  // Form states inside modals
  const [warningLevel, setWarningLevel] = useState('Final Attendance Warning Notice');
  const [customNote, setCustomNote] = useState('Attendance has dropped below 75%. Immediate counseling session required with HOD.');
  const [selectedMentor, setSelectedMentor] = useState('Dr. Ramesh Kumar');
  const [sessionAgenda, setSessionAgenda] = useState('Academic performance review & attendance recovery plan');
  const [sessionTime, setSessionTime] = useState('2026-07-24 10:00 AM');
  const [reminderDeadline, setReminderDeadline] = useState('Today at 05:00 PM');

  const handleOpenAlertModal = (alert: LowAttentionAlertItem) => {
    setActiveAlert(alert);
  };

  const handleExecuteAction = () => {
    if (!activeAlert) return;

    if (activeAlert.action.includes('Warning')) {
      NotificationToast.success(
        'Warning Notice Dispatched',
        `Official ${warningLevel} sent to ${activeAlert.title} & parent email/SMS.`
      );
    } else if (activeAlert.action.includes('Mentor')) {
      NotificationToast.success(
        'Mentoring Advisory Scheduled',
        `Scheduled counseling with ${selectedMentor} for ${activeAlert.title} on ${sessionTime}.`
      );
    } else if (activeAlert.action.includes('Faculty')) {
      NotificationToast.success(
        'Lesson Plan Reminder Sent',
        `High-priority reminder sent to course incharge for ${activeAlert.title}.`
      );
    } else if (activeAlert.action.includes('Accreditation')) {
      NotificationToast.success(
        'Accreditation Vault Updated',
        `Criterion 5 proof bundle signed and submitted to NBA Portal.`
      );
    }

    // Mark alert as resolved by updating state
    setAlertsList((prev) => prev.filter((a) => a.id !== activeAlert.id));
    setActiveAlert(null);

    // Notify global event store
    window.dispatchEvent(new CustomEvent('hod_store_updated'));
  };

  return (
    <>
      <GlassCard className="border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-lg">
        <div className="flex items-center justify-between border-b border-rose-200/80 dark:border-rose-900/50 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20 shadow-xs">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                Low Attention Critical Alerts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Department bottlenecks & attendance warnings requiring HOD intervention
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md shadow-rose-500/25">
            {alertsList.length} Critical Issues
          </span>
        </div>

        {alertsList.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="size-6 mx-auto mb-1 text-emerald-500" />
            All critical department alerts have been resolved dynamically!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertsList.map((alert) => (
              <motion.div
                key={alert.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xs hover:border-rose-400 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {alert.category}
                    </span>
                    <span className="font-black text-rose-600 dark:text-rose-400 text-xs">{alert.metric}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">{alert.title}</h4>
                </div>

                <button
                  onClick={() => handleOpenAlertModal(alert)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-rose-600 dark:hover:bg-rose-600 text-white dark:text-slate-900 hover:text-white text-xs font-extrabold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <span>{alert.action}</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Dynamic Action Modals for All 4 Alert Types */}
      {activeAlert && (
        <Modal
          isOpen={Boolean(activeAlert)}
          onClose={() => setActiveAlert(null)}
          title={
            activeAlert.action.includes('Warning')
              ? 'Issue HOD Attendance Warning Notice'
              : activeAlert.action.includes('Mentor')
              ? 'Schedule Mandatory Mentor Advisory'
              : activeAlert.action.includes('Faculty')
              ? 'Send Faculty Lesson Plan Reminder'
              : 'NBA Accreditation Proof Vault'
          }
          subtitle={`Target: ${activeAlert.title}`}
          variant={activeAlert.action.includes('Warning') ? 'warning' : 'info'}
          confirmLabel={
            activeAlert.action.includes('Warning')
              ? 'Dispatch Official Notice'
              : activeAlert.action.includes('Mentor')
              ? 'Confirm Advisory Schedule'
              : activeAlert.action.includes('Faculty')
              ? 'Send High Priority Alert'
              : 'Sign & Submit Proof Vault'
          }
          onConfirm={handleExecuteAction}
        >
          {/* Form Content 1: Issue HOD Warning Notice */}
          {activeAlert.action.includes('Warning') && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 flex items-start gap-2 text-amber-800 dark:text-amber-300">
                <AlertOctagon className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">Attendance Deficit Warning</p>
                  <p className="text-[11px] opacity-90">
                    Student attendance has dropped to {activeAlert.metric}. Official warning will be logged in student file and emailed to parent.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Notice Type</label>
                <select
                  value={warningLevel}
                  onChange={(e) => setWarningLevel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="First Formal Attendance Warning">First Formal Attendance Warning</option>
                  <option value="Final Attendance Warning Notice">Final Attendance Warning Notice</option>
                  <option value="Exam De-barment Show Cause Notice">Exam De-barment Show Cause Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Custom Directive to Parent & Student</label>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>
            </div>
          )}

          {/* Form Content 2: Schedule Mentor Advisory */}
          {activeAlert.action.includes('Mentor') && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Assign Faculty Mentor</label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="Dr. Ramesh Kumar">Dr. Ramesh Kumar (Professor & Head)</option>
                  <option value="Prof. Sneha Verma">Prof. Sneha Verma (Associate Professor)</option>
                  <option value="Prof. Vikram Rathore">Prof. Vikram Rathore (Assistant Professor)</option>
                  <option value="Dr. Ananya Roy">Dr. Ananya Roy (Assistant Professor)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Proposed Session Date & Time</label>
                <input
                  type="text"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Mentoring Advisory Focus</label>
                <input
                  type="text"
                  value={sessionAgenda}
                  onChange={(e) => setSessionAgenda(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>
            </div>
          )}

          {/* Form Content 3: Notify Faculty Incharge */}
          {activeAlert.action.includes('Faculty') && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 font-medium">
                <p className="font-bold text-xs mb-1">Lesson Plan Compliance Reminder</p>
                <p className="text-[11px]">
                  Course <strong>{activeAlert.title}</strong> requires lesson plan signoff. Direct push notification will be sent to the course coordinator.
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Submission Target Deadline</label>
                <input
                  type="text"
                  value={reminderDeadline}
                  onChange={(e) => setReminderDeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold text-rose-600"
                />
              </div>
            </div>
          )}

          {/* Form Content 4: Open Accreditation Vault */}
          {activeAlert.action.includes('Accreditation') && (
            <div className="space-y-3">
              <p className="font-bold text-slate-700 dark:text-slate-300">Criterion 5 Audit Proof Checklist:</p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">5.1 Faculty Publications & IEEE Grants</span>
                  <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-full">VERIFIED</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">5.2 Student Advisory & Counseling Records</span>
                  <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-full">VERIFIED</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-rose-700 dark:text-rose-300 font-bold">
                  <span>5.3 Course Outcome (CO-PO) Attainment Proofs</span>
                  <span className="px-2 py-0.5 text-[10px] font-black bg-rose-100 text-rose-800 rounded-full">PENDING HOD SIGNOFF</span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
