const API_BASE = '/api/communication';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch dashboard statistics.');
  const json = await res.json();
  return json.data;
}

export async function fetchAnnouncements(params: { status?: string; category?: string } = {}) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/announcements?${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch announcements.');
  const json = await res.json();
  return json.data;
}

export async function createAnnouncement(payload: any) {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create announcement.');
  const json = await res.json();
  return json.data;
}

export async function updateAnnouncement(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/announcements/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update announcement.');
  const json = await res.json();
  return json.data;
}

export async function deleteAnnouncement(id: string) {
  const res = await fetch(`${API_BASE}/announcements/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete announcement.');
  return await res.json();
}

export async function fetchTemplates() {
  const res = await fetch(`${API_BASE}/templates`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch templates.');
  const json = await res.json();
  return json.data;
}

export async function createTemplate(payload: any) {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create template.');
  const json = await res.json();
  return json.data;
}

export async function fetchSurveys() {
  const res = await fetch(`${API_BASE}/surveys`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch surveys.');
  const json = await res.json();
  return json.data;
}

export async function createSurvey(payload: any) {
  const res = await fetch(`${API_BASE}/surveys`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to publish survey.');
  const json = await res.json();
  return json.data;
}

export async function fetchPolls() {
  const res = await fetch(`${API_BASE}/polls`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch polls.');
  const json = await res.json();
  return json.data;
}

export async function createPoll(payload: any) {
  const res = await fetch(`${API_BASE}/polls`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create poll.');
  const json = await res.json();
  return json.data;
}

export async function submitVote(pollId: string, optionText: string) {
  const res = await fetch(`${API_BASE}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ optionText })
  });
  if (!res.ok) throw new Error('Failed to cast vote.');
  return await res.json();
}

export async function fetchLogs() {
  const res = await fetch(`${API_BASE}/logs`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch delivery logs.');
  const json = await res.json();
  return json.data;
}

export async function fetchGateways() {
  const res = await fetch(`${API_BASE}/gateways`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch gateway status.');
  const json = await res.json();
  return json.data;
}

export async function updateGatewaySettings(channel: string, payload: { configJson: any; isActive: boolean }) {
  const res = await fetch(`${API_BASE}/gateways/${channel}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update gateway settings.');
  const json = await res.json();
  return json.data;
}

export async function submitCircularWorkflow(id: string, payload: { stage: string; status: string; remarks?: string }) {
  const res = await fetch(`${API_BASE}/announcements/${id}/workflow`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit workflow transition.');
  const json = await res.json();
  return json.data;
}
