import api from '@/lib/api';

export async function fetchRooms() {
  const resp = await api.get('/api/hostel/rooms');
  return resp.data.rooms || [];
}

export async function createRoom(payload: any) {
  const resp = await api.post('/api/hostel/rooms', payload);
  return resp.data.room;
}

export async function updateRoom(id: string, payload: any) {
  const resp = await api.put(`/api/hostel/rooms/${id}`, payload);
  return resp.data.room;
}

export async function deleteRoom(id: string) {
  const resp = await api.delete(`/api/hostel/rooms/${id}`);
  return resp.data;
}

export default { fetchRooms, createRoom, updateRoom, deleteRoom };
