import api from '@/lib/api';

export async function fetchAllocations() {
  const resp = await api.get('/api/hostel/allocations');
  return resp.data.allocations || [];
}

export async function createAllocation(payload: any) {
  const resp = await api.post('/api/hostel/allocations', payload);
  return resp.data.allocation;
}

export async function updateAllocation(id: string, payload: any) {
  const resp = await api.put(`/api/hostel/allocations/${id}`, payload);
  return resp.data.allocation;
}

export async function deleteAllocation(id: string) {
  const resp = await api.delete(`/api/hostel/allocations/${id}`);
  return resp.data;
}

export async function transferAllocation(
  id: string,
  payload: { newRoomId: string; newBedNumber: number; newBlockId?: string },
) {
  const resp = await api.post(`/api/hostel/allocations/${id}/transfer`, payload);
  return resp.data;
}

export default {
  fetchAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  transferAllocation,
};
