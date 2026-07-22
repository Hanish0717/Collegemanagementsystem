import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, Send } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import api from '@/lib/api';

export function StudentComplaints() {
  const [history, setHistory] = useState<any[]>([]);
  const [category, setCategory] = useState('Infrastructure');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/api/student-module/complaints');
      if (res.data?.success && res.data?.data) {
        const dbComplaints = res.data.data.map((c: any) => ({
          id: c._id || c.id,
          category: c.category,
          subject: c.subject,
          date: new Date(c.date || c.createdAt || Date.now()).toISOString().split('T')[0],
          status: c.status,
        }));
        setHistory(dbComplaints);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      alert('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/student-module/complaints', {
        category,
        subject,
        description,
      });
      if (res.data?.success) {
        alert('Complaint filed successfully!');
        setSubject('');
        setDescription('');
        fetchComplaints();
      }
    } catch (err: any) {
      console.error('Error submitting complaint:', err);
      alert(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaint Submission"
        desc="Submit complaints, track complaint status, and view resolution history."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Complaints', value: history.length.toString(), tone: 'info' as const },
          {
            label: 'Pending',
            value: history.filter((c) => c.status === 'Pending').length.toString(),
            tone: 'warn' as const,
          },
          {
            label: 'Resolved',
            value: history.filter((c) => c.status === 'Resolved').length.toString(),
            tone: 'success' as const,
          },
          {
            label: 'In Progress',
            value: history.filter((c) => c.status === 'In Progress').length.toString(),
            tone: 'info' as const,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Submit Complaint</h3>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
          >
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {['Infrastructure', 'Academic', 'Hostel', 'Canteen', 'Other'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
              <input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Detail Description</label>
              <textarea
                placeholder="Describe your complaint in detail..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              <Send className="size-4" /> {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-indigo" />
            <h3 className="font-semibold">Complaint Categories</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                category: 'Infrastructure',
                description: 'Lab equipment, classroom facilities, etc.',
              },
              { category: 'Academic', description: 'Grades, faculty issues, curriculum, etc.' },
              { category: 'Hostel', description: 'Room maintenance, facilities, etc.' },
              { category: 'Canteen', description: 'Food quality, hygiene, etc.' },
              { category: 'Other', description: 'Any other issues not listed above.' },
            ].map((item) => (
              <div
                key={item.category}
                onClick={() => setCategory(item.category)}
                className="p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
              >
                <div className="text-sm font-medium">{item.category}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Complaint History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {['Category', 'Subject', 'Date', 'Status'].map((column) => (
                  <th
                    key={column}
                    className="text-left py-3 px-4 font-semibold text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((complaint, index) => (
                <tr key={complaint.id || index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{complaint.category}</td>
                  <td className="py-3 px-4">{complaint.subject}</td>
                  <td className="py-3 px-4">{complaint.date}</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        complaint.status === 'Resolved'
                          ? 'success'
                          : complaint.status === 'In Progress'
                            ? 'info'
                            : 'warn'
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
