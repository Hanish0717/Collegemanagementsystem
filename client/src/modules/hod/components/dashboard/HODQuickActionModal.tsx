import React, { useState } from 'react';
import { X, Send, Plus, Sparkles } from 'lucide-react';
import { NotificationToast } from '../shared/NotificationToast';

interface HODQuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'announcement' | 'report' | 'event' | 'student' | 'faculty' | string;
}

export function HODQuickActionModal({ isOpen, onClose, actionType }: HODQuickActionModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    NotificationToast.success('Action Executed Successfully', `Submitted ${actionType}: "${title || 'New Entry'}"`);
    onClose();
  };

  const titles: Record<string, string> = {
    announcement: 'Create Department Circular / Announcement',
    report: 'Generate Custom Department Academic Report',
    event: 'Schedule New Department Seminar or Workshop',
    student: 'Quick Enroll Student to Department',
    faculty: 'Assign Faculty Workload',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="size-5" />
        </button>

        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="size-5 text-blue-600" />
          {titles[actionType] || 'Quick Action Workbench'}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">Actions performed here apply strictly to your assigned department.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title / Subject</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Details</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter details..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Send className="size-3.5" /> Submit Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
