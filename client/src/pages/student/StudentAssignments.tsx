import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { FileText, Upload } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import api from '@/lib/api';

export function StudentAssignments() {
  const [list, setList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/student-module/assignments');
      if (res.data?.success && res.data?.data) {
        const dbAssignments = res.data.data.map((a: any) => ({
          id: a._id || a.id,
          title: a.title,
          subject: a.subject,
          dueDate: new Date(a.dueDate).toISOString().split('T')[0],
          status: a.status,
          submitted: a.submitted,
          description: a.description,
        }));
        setList(dbAssignments);
        const firstPending = dbAssignments.find((a: any) => !a.submitted);
        if (firstPending) {
          setSelectedId(firstPending.id);
        }
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      alert('Please select an assignment to submit.');
      return;
    }
    const finalUrl = fileUrl || 'https://example.com/submissions/assignment-' + selectedId + '.pdf';
    try {
      const res = await api.post(`/api/student-module/assignments/submit/${selectedId}`, {
        fileUrl: finalUrl,
        notes,
      });
      if (res.data?.success) {
        alert('Assignment submitted successfully!');
        setFileUrl('');
        setNotes('');
        fetchAssignments();
      }
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      alert(err.response?.data?.message || 'Failed to submit assignment');
    }
  };

  const pendingList = list.filter((a) => !a.submitted);
  const submittedList = list.filter((a) => a.submitted);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment Submission"
        desc="View pending assignments, submit your work, and track submission status."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((n) => (
              <Card key={n} className="h-24 animate-pulse bg-muted/40">
                <div />
              </Card>
            ))
          : [
              { label: 'Total Assignments', value: list.length.toString(), tone: 'info' as const },
              { label: 'Pending', value: pendingList.length.toString(), tone: 'warn' as const },
              {
                label: 'Submitted',
                value: submittedList.length.toString(),
                tone: 'success' as const,
              },
              {
                label: 'Overdue',
                value: list
                  .filter((a) => !a.submitted && new Date(a.dueDate) < new Date())
                  .length.toString(),
                tone: 'danger' as const,
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

      <Card>
        <h3 className="font-semibold mb-4">Assignment Cards</h3>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="h-44 animate-pulse bg-muted/20">
                <div />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {list.map((assignment) => (
              <Card key={assignment.id} className="hover:-translate-y-1 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                    <FileText className="size-5" />
                  </div>
                  <Badge
                    tone={
                      assignment.status === 'Submitted' || assignment.status === 'Graded'
                        ? 'success'
                        : 'warn'
                    }
                  >
                    {assignment.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm">{assignment.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{assignment.subject}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">{assignment.dueDate}</span>
                  </div>
                </div>
                {!assignment.submitted && (
                  <button
                    onClick={() => setSelectedId(assignment.id)}
                    className="mt-4 w-full px-3 py-2 rounded-lg bg-gradient-primary text-white text-xs font-medium hover:opacity-90 transition"
                  >
                    Submit Now
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Submit Assignment</h3>
        {loading ? (
          <div className="h-56 bg-muted/10 animate-pulse rounded-xl border" />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
          >
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Select Assignment
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Choose Assignment --</option>
                {pendingList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.subject})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Submission File Link / URL
              </label>
              <input
                type="text"
                placeholder="https://example.com/your-submission-file.pdf"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Submission Notes (Optional)
              </label>
              <textarea
                placeholder="Assignment description or notes..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium"
            >
              Submit Assignment
            </button>
          </form>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Submission History</h3>
        <div className="space-y-2">
          {loading ? (
            [1, 2].map((n) => (
              <div key={n} className="h-16 animate-pulse bg-muted/20 border rounded-xl" />
            ))
          ) : submittedList.length > 0 ? (
            submittedList.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                  {(assignment.subject || 'AS').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{assignment.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {assignment.subject} • Status: {assignment.status}
                  </div>
                </div>
                <Badge tone="success">{assignment.status}</Badge>
              </div>
            ))
          ) : (
            <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
              No submissions found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
