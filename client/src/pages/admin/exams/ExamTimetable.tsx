import { useState } from 'react';
import { Plus, Search, Calendar, RefreshCw, Trash2 } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function ExamTimetable() {
  const [timetable, setTimetable] = useState([
    {
      id: 'T001',
      subject: 'Data Structures',
      date: '2026-07-14',
      time: '09:00 AM - 12:00 PM',
      room: 'LH-101',
      supervisor: 'Dr. John Smith',
    },
    {
      id: 'T002',
      subject: 'Database Systems',
      date: '2026-07-15',
      time: '09:00 AM - 12:00 PM',
      room: 'LH-102',
      supervisor: 'Dr. Rajesh Kumar',
    },
    {
      id: 'T003',
      subject: 'Operating Systems',
      date: '2026-07-16',
      time: '01:00 PM - 04:00 PM',
      room: 'LH-101',
      supervisor: 'Prof. Sarah Lin',
    },
  ]);

  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM - 12:00 PM');
  const [newRoom, setNewRoom] = useState('LH-101');
  const [newSupervisor, setNewSupervisor] = useState('Dr. John Smith');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDate) {
      toast.error('Please fill in the subject name and date.');
      return;
    }

    const item = {
      id: `T${String(timetable.length + 1).padStart(3, '0')}`,
      subject: newSubject,
      date: newDate,
      time: newTime,
      room: newRoom,
      supervisor: newSupervisor,
    };

    setTimetable((prev) => [...prev, item]);
    toast.success('Exam timetable slot added successfully!');
    setNewSubject('');
    setNewDate('');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this timetable slot?')) return;
    setTimetable((prev) => prev.filter((t) => t.id !== id));
    toast.success('Timetable slot removed.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Builder"
        desc="Schedule subject exam slots, map test venues (lecture halls), and assign supervisory staff."
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-4">
          <h3 className="font-semibold text-base">Active Exam Slots</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {[
                    'Subject Name',
                    'Date & Time',
                    'Location Venue',
                    'Supervisor Assigned',
                    'Actions',
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {timetable.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/40 transition">
                    <td className="py-4 px-4 font-semibold">{t.subject}</td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-mono">{t.date}</div>
                      <div className="text-xs text-muted-foreground">{t.time}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold">{t.room}</td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">{t.supervisor}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Plus className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-base">Map Timetable Slot</h3>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject Name</label>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Theory of Computation"
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Exam Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Time Slot</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM (Afternoon)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Lecture Hall / Room
              </label>
              <select
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                {['LH-101', 'LH-102', 'LH-201', 'LH-202', 'AUDI-A'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Invigilator Supervisor
              </label>
              <select
                value={newSupervisor}
                onChange={(e) => setNewSupervisor(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                {['Dr. John Smith', 'Dr. Rajesh Kumar', 'Dr. Vikram Rao', 'Prof. Sarah Lin'].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <Plus className="size-4" /> Add Slot
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
