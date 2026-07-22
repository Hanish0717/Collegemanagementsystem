import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchBlocks, createBlock, updateBlock, deleteBlock } from '@/services/hostelBlockService';
import { PageHeader } from '@/components/dashboard/ui';

export default function BlocksPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const { data: blocks = [], isLoading } = useQuery({ queryKey: ['hostel-blocks'], queryFn: fetchBlocks });

  const createMut = useMutation({ mutationFn: (p: any) => createBlock(p), onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-blocks'] }) });
  const updateMut = useMutation({ mutationFn: ({ id, p }: any) => updateBlock(id, p), onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-blocks'] }) });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteBlock(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['hostel-blocks'] }) });

  return (
    <div className="space-y-6">
      <PageHeader title="Hostel Blocks" desc="Manage hostel blocks and their rooms." />

      <div className="p-4 bg-background rounded-xl border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Blocks</h3>
          <button onClick={() => setEditing({})} className="px-3 py-2 rounded bg-indigo text-white">Add Block</button>
        </div>
        {isLoading ? <div>Loading...</div> : (
          <div className="space-y-2">
            {blocks.map((b: any) => (
              <div key={b.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.description}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(b)} className="px-2 py-1 border rounded">Edit</button>
                  <button onClick={() => deleteMut.mutate(b.id)} className="px-2 py-1 rounded bg-rose-500 text-white">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple editor modal */}
      {editing && (
        <div className="fixed inset-0 grid place-items-center bg-black/40 p-4">
          <div className="bg-background p-6 rounded-xl border max-w-md w-full">
            <h4 className="font-semibold mb-3">{editing.id ? 'Edit Block' : 'Create Block'}</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as any;
              const payload = { name: form.name.value, code: form.code.value, description: form.description.value, capacity: Number(form.capacity.value || 0) };
              if (editing.id) updateMut.mutate({ id: editing.id, p: payload }, { onSuccess: () => setEditing(null) });
              else createMut.mutate(payload, { onSuccess: () => setEditing(null) });
            }}>
              <div className="space-y-2">
                <input name="name" defaultValue={editing.name} placeholder="Block name" className="w-full rounded border px-3 py-2" />
                <input name="code" defaultValue={editing.code} placeholder="Code (optional)" className="w-full rounded border px-3 py-2" />
                <input name="capacity" defaultValue={editing.capacity} placeholder="Capacity" type="number" className="w-full rounded border px-3 py-2" />
                <textarea name="description" defaultValue={editing.description} placeholder="Description" className="w-full rounded border px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-primary text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
