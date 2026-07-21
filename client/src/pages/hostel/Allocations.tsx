import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchAllocations, transferAllocation, deleteAllocation } from '@/services/hostelAllocationService';
import { fetchHostelRooms } from '@/services/hostelService';
import { PageHeader } from '@/components/dashboard/ui';

export default function AllocationsPage() {
  const qc = useQueryClient();
  const [transferTarget, setTransferTarget] = useState<any>(null);
  const { data: allocations = [], isLoading } = useQuery({ queryKey: ['hostel-allocations'], queryFn: fetchAllocations });
  const { data: rooms = [] } = useQuery({ queryKey: ['hostel-rooms'], queryFn: () => fetchHostelRooms() });

  const transferMut = useMutation({ mutationFn: ({ id, payload }: any) => transferAllocation(id, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ['hostel-allocations'] }); qc.invalidateQueries({ queryKey: ['hostel-rooms'] }); setTransferTarget(null); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteAllocation(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-allocations'] }) });

  return (
    <div className="space-y-6">
      <PageHeader title="Allocations" desc="Manage student room allocations and transfers." />

      <div className="p-4 bg-background rounded-xl border">
        <h3 className="font-semibold mb-4">Active Allocations</h3>
        {isLoading ? <div>Loading...</div> : (
          <div className="space-y-2">
            {allocations.map((a: any) => (
              <div key={a.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{a.students?.full_name || a.student_name} — {a.hostel_rooms?.room_number || a.room_number}</div>
                  <div className="text-xs text-muted-foreground">Bed: {a.bed_number} • {a.academic_year}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTransferTarget(a)} className="px-2 py-1 border rounded">Transfer</button>
                  <button onClick={() => deleteMut.mutate(a.id)} className="px-2 py-1 rounded bg-rose-500 text-white">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {transferTarget && (
        <div className="fixed inset-0 grid place-items-center bg-black/40 p-4">
          <div className="bg-background p-6 rounded-xl border max-w-md w-full">
            <h4 className="font-semibold mb-3">Transfer {transferTarget.students?.full_name || transferTarget.student_name}</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as any;
              const payload = { newRoomId: form.room_id.value, newBedNumber: Number(form.bed_number.value || 1), newBlockId: form.block_id?.value };
              transferMut.mutate({ id: transferTarget.id, payload });
            }}>
              <div className="space-y-2">
                <select name="room_id" className="w-full rounded border px-3 py-2">
                  {(rooms || []).map((r: any) => <option key={r.id} value={r.id}>{r.room_number} — {r.hostel_blocks?.name || r.blockName}</option>)}
                </select>
                <input name="bed_number" placeholder="Bed number" className="w-full rounded border px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setTransferTarget(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-primary text-white rounded">Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
