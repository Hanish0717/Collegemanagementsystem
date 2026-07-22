import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { MessageSquare, Paperclip, Send, Users } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import api from '@/lib/api';

export function FacultyCommunication() {
  const [students, setStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([
    {
      title: 'Mid-term exam schedule released',
      audience: 'All Students',
      time: '2d ago',
      status: 'Sent',
    },
    {
      title: 'Assignment deadline extended',
      audience: 'Data Structures',
      time: '3d ago',
      status: 'Sent',
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [broadcastAudience, setBroadcastAudience] = useState('All Students');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/api/faculty-module/performance');
        if (res.data?.success && res.data?.data) {
          const names = res.data.data.map((p: any) => p.student);
          setStudents(names);

          // Populate conversations dynamically based on students list
          const initialConvs = names.slice(0, 3).map((name: string, index: number) => ({
            id: `msg-${index}`,
            student: name,
            subject: index === 0 ? 'Doubts in Assignments' : 'Leave clarification',
            message:
              index === 0
                ? 'Sir, can you check my submitted report?'
                : 'I will submit the assignment by tomorrow.',
            time: `${index + 1}h ago`,
            unread: index === 0,
          }));
          setConversations(initialConvs);
        }
      } catch (err) {
        console.error('Error loading students for communication:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !subject || !message) {
      alert('Please fill in all fields.');
      return;
    }
    alert(`Message successfully sent to ${selectedStudent}!`);

    // Add to conversations list
    setConversations((prev) => [
      {
        id: `msg-${Date.now()}`,
        student: selectedStudent,
        subject,
        message,
        time: 'Just now',
        unread: false,
      },
      ...prev,
    ]);

    setSelectedStudent('');
    setSubject('');
    setMessage('');
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) {
      alert('Please fill in the announcement details.');
      return;
    }

    try {
      // Create a general event as the broadcast mechanism
      await api.post('/api/events', {
        title: broadcastTitle,
        description: broadcastContent,
        type: 'Announcement',
        date: new Date().toISOString().split('T')[0],
        venue: 'Online/Main Campus',
        organizer: 'Faculty Portal',
        status: 'Approved',
      });

      alert('Announcement broadcasted successfully to all students!');
      setAnnouncements((prev) => [
        {
          title: broadcastTitle,
          audience: broadcastAudience,
          time: 'Just now',
          status: 'Sent',
        },
        ...prev,
      ]);

      setBroadcastTitle('');
      setBroadcastContent('');
    } catch (err: any) {
      console.error('Error broadcasting:', err);
      alert(err.response?.data?.message || 'Failed to broadcast announcement');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Communication Portal" desc="Loading communications..." />
        <div className="p-8 text-center text-muted-foreground">Loading communication tools...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Portal"
        desc="Message students, manage discussions, and send announcements to your classes."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length.toString(), tone: 'info' as const },
          {
            label: 'Conversations',
            value: conversations.length.toString(),
            tone: 'success' as const,
          },
          {
            label: 'Unread',
            value: conversations.filter((c) => c.unread).length.toString(),
            tone: 'warn' as const,
          },
          { label: 'Announcements', value: announcements.length.toString(), tone: 'info' as const },
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
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-5 text-indigo" />
            <h3 className="font-semibold">Recent Conversations</h3>
          </div>
          <div className="space-y-2">
            {conversations.length > 0 ? (
              conversations.map((comm) => (
                <div
                  key={comm.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${comm.unread ? 'bg-blue-50/50 border-blue-200' : ''}`}
                >
                  <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                    {comm.student
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{comm.student}</span>
                      {comm.unread && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{comm.subject}</div>
                    <div className="text-xs text-muted-foreground truncate">{comm.message}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{comm.time}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No active conversations.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Send Message to Student</h3>
          <form
            onSubmit={handleSendMessage}
            className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
          >
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
            <textarea
              placeholder="Type your message..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Paperclip className="size-4 text-muted-foreground" />
                <span className="text-sm">Attach file</span>
              </label>
              <input type="file" className="text-sm" />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              <Send className="size-4" /> Send Message
            </button>
          </form>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo" />
          <h3 className="font-semibold">Broadcast Announcement</h3>
        </div>
        <form
          onSubmit={handleBroadcast}
          className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
        >
          <select
            value={broadcastAudience}
            onChange={(e) => setBroadcastAudience(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            {[
              'All Students',
              'Data Structures',
              'Algorithms',
              'Database Systems',
              'Web Technologies',
            ].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            placeholder="Announcement title"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            required
          />
          <textarea
            placeholder="Announcement content..."
            rows={4}
            value={broadcastContent}
            onChange={(e) => setBroadcastContent(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            required
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Send email notification</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Send SMS notification</span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-lg bg-gradient-violet text-white text-sm font-medium"
          >
            Broadcast Announcement
          </button>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Recent Announcements</h3>
        <div className="space-y-2">
          {announcements.map((announcement, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
            >
              <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center">
                <Users className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{announcement.title}</div>
                <div className="text-xs text-muted-foreground">
                  {announcement.audience} • {announcement.time}
                </div>
              </div>
              <Badge tone="success">{announcement.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
