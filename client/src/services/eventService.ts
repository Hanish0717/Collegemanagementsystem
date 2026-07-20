import api from '../lib/api';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  type: string; // 'Exam' | 'Event' | 'Meeting' | 'Lecture'
  date: string;
  time?: string;
  venue: string;
  organizer?: string;
  status: string; // 'Pending Approval' | 'Approved' | 'Rejected'
  created_at: string;
  updated_at: string;
}

export interface EventStats {
  pendingCount: number;
  approvedCount: number;
  upcomingCount: number;
  totalEvents: number;
  thisMonthCount: number;
  thisSemesterCount: number;
  approvalRate: string;
  avgProcessingTime: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  type: string;
  date: string;
  time?: string;
  venue: string;
  organizer?: string;
  status?: string;
}

export async function fetchEvents(params?: {
  search?: string;
  status?: string;
  type?: string;
}): Promise<EventItem[]> {
  const { data } = await api.get<{ success: boolean; data: EventItem[] }>('/api/events', {
    params,
  });
  return data.data;
}

export async function fetchEventStats(): Promise<EventStats> {
  const { data } = await api.get<{ success: boolean; data: EventStats }>('/api/events/stats');
  return data.data;
}

export async function createEvent(payload: CreateEventPayload): Promise<EventItem> {
  const { data } = await api.post<{ success: boolean; data: EventItem }>('/api/events', payload);
  return data.data;
}

export async function updateEventStatus(id: string, status: string): Promise<EventItem> {
  const { data } = await api.put<{ success: boolean; data: EventItem }>(
    `/api/events/${id}/status`,
    { status },
  );
  return data.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/api/events/${id}`);
}
