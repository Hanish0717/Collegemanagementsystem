import { supabase } from '@/lib/supabaseClient';
import { getStoredUser } from './authService';

const API_BASE = '/api/accreditation';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  const json = await res.json();
  return json.data;
}

export async function fetchCriteria() {
  const res = await fetch(`${API_BASE}/criteria`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch criteria');
  const json = await res.json();
  return json.data;
}

export async function fetchMetrics(params: { criteriaId?: string; department?: string; status?: string } = {}) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/metrics?${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch metrics');
  const json = await res.json();
  return json.data;
}

export async function createMetric(payload: any) {
  const res = await fetch(`${API_BASE}/metrics`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create metric');
  const json = await res.json();
  return json.data;
}

export async function updateMetric(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/metrics/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update metric');
  const json = await res.json();
  return json.data;
}

export async function deleteMetric(id: string) {
  const res = await fetch(`${API_BASE}/metrics/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete metric');
  return await res.json();
}

export async function fetchEvidence(params: { metricId?: string; status?: string } = {}) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/evidence?${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch evidence');
  const json = await res.json();
  return json.data;
}

export async function uploadEvidence(payload: any) {
  const res = await fetch(`${API_BASE}/evidence`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to upload evidence');
  const json = await res.json();
  return json.data;
}

export async function replaceEvidence(id: string, payload: { fileUrl: string; fileType?: string }) {
  const res = await fetch(`${API_BASE}/evidence/${id}/replace`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to replace evidence');
  const json = await res.json();
  return json.data;
}

export async function submitWorkflowState(id: string, payload: { stage: string; status: string; remarks?: string }) {
  const res = await fetch(`${API_BASE}/evidence/${id}/workflow`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update workflow state');
  const json = await res.json();
  return json.data;
}

export async function fetchCommitteesAndMeetings() {
  const res = await fetch(`${API_BASE}/committees`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch committees and meetings');
  const json = await res.json();
  return json.data;
}

export async function createMeeting(payload: any) {
  const res = await fetch(`${API_BASE}/meetings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create meeting');
  const json = await res.json();
  return json.data;
}

export async function createActionItem(payload: any) {
  const res = await fetch(`${API_BASE}/action-items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create action item');
  const json = await res.json();
  return json.data;
}

export async function updateActionItemStatus(id: string, payload: { status: string; remarks?: string }) {
  const res = await fetch(`${API_BASE}/action-items/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update action item status');
  const json = await res.json();
  return json.data;
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  const json = await res.json();
  return json.data;
}

export async function fetchRemarksHistory(documentId: string) {
  const res = await fetch(`${API_BASE}/remarks/${documentId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch remarks history');
  const json = await res.json();
  return json.data;
}
