import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '@/services/hostelRoomService';
import { fetchBlocks } from '@/services/hostelBlockService';
import { PageHeader } from '@/components/dashboard/ui';

export default function RoomsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data: blocks = [] } = useQuery({ queryKey: ['hostel-blocks'], queryFn: fetchBlocks });
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['hostel-rooms'],
    queryFn: fetchRooms,
  });

  const createMut = useMutation({
    mutationFn: (p: any) => createRoom(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-rooms'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, p }: any) => updateRoom(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-rooms'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-rooms'] }),
  });

  const blockMap = useMemo(() => {
    const m: Record<string, any> = {};
    (blocks || []).forEach((b: any) => (m[b.id] = b));
    return m;
  }, [blocks]);

  return (
    <div className="space-y-6">
      <PageHeader title="Hostel Rooms" desc="Manage rooms and occupancy." />

      <div className="p-4 bg-background rounded-xl border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Rooms</h3>
          <button onClick={() => setEditing({})} className="px-3 py-2 rounded bg-indigo text-white">
            Add Room
          </button>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-2">
            {rooms.map((r: any) => (
              <div key={r.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">
                    {r.room_number} — {blockMap[r.block_id]?.name || r.hostel_blocks?.name || '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Capacity: {r.capacity} • Occupancy: {r.current_occupancy}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(r)} className="px-2 py-1 border rounded">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMut.mutate(r.id)}
                    className="px-2 py-1 rounded bg-rose-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 grid place-items-center bg-black/40 p-4">
          <div className="bg-background p-6 rounded-xl border max-w-md w-full">
            <h4 className="font-semibold mb-3">{editing.id ? 'Edit Room' : 'Create Room'}</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const payload = {
                  block_id: form.block_id.value || null,
                  room_number: form.room_number.value,
                  capacity: Number(form.capacity.value || 1),
                  gender: form.gender.value || 'unassigned',
                };
                if (editing.id)
                  updateMut.mutate(
                    { id: editing.id, p: payload },
                    { onSuccess: () => setEditing(null) },
                  );
                else createMut.mutate(payload, { onSuccess: () => setEditing(null) });
              }}
            >
              <div className="space-y-2">
                <select
                  name="block_id"
                  defaultValue={editing.block_id}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">Select block</option>
                  {(blocks || []).map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <input
                  name="room_number"
                  defaultValue={editing.room_number}
                  placeholder="Room number"
                  className="w-full rounded border px-3 py-2"
                />
                <input
                  name="capacity"
                  defaultValue={editing.capacity || 1}
                  placeholder="Capacity"
                  type="number"
                  className="w-full rounded border px-3 py-2"
                />
                <select
                  name="gender"
                  defaultValue={editing.gender || 'unassigned'}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gradient-primary text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
