import api from '@/lib/api';

export async function fetchBlocks() {
  const resp = await api.get('/api/hostel/blocks');
  return resp.data.blocks || [];
}

export async function createBlock(payload: any) {
  const resp = await api.post('/api/hostel/blocks', payload);
  return resp.data.block;
}

export async function updateBlock(id: string, payload: any) {
  const resp = await api.put(`/api/hostel/blocks/${id}`, payload);
  return resp.data.block;
}

export async function deleteBlock(id: string) {
  const resp = await api.delete(`/api/hostel/blocks/${id}`);
  return resp.data;
}

export default {
  fetchBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
};
