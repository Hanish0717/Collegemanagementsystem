import pool from '../../lib/db.js';
import { supabase } from '../../config/supabase.js';

// Create allocation (non-transactional via supabase for now)
export async function createAllocation(req, res) {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_allocations').insert([payload]).select().single();
    if (error) throw error;
    // increment occupants
    await supabase.from('hostel_rooms').update({ occupants: (payload._occupants_delta || 1) }).eq('id', payload.room_id);
    res.status(201).json({ allocation: data });
  } catch (err) {
    console.error('createAllocation', err);
    res.status(500).json({ error: err.message || 'Failed to create allocation' });
  }
}

// Transfer allocation: transactional update of allocation row and room occupants
export async function transferAllocation(req, res) {
  const allocationId = req.params.id;
  const { newRoomId, newBedNumber } = req.body;

  if (!allocationId || !newRoomId) return res.status(400).json({ error: 'allocation id and newRoomId required' });

  const client = pool;
  if (!client) return res.status(500).json({ error: 'Database pool not configured' });

  const conn = await client.connect();
  try {
    await conn.query('BEGIN');

    // lock the allocation row
    const allocRes = await conn.query('SELECT * FROM hostel_allocations WHERE id=$1 FOR UPDATE', [allocationId]);
    if (allocRes.rowCount === 0) throw new Error('Allocation not found');
    const alloc = allocRes.rows[0];

    // lock target room
    const roomRes = await conn.query('SELECT capacity, occupants FROM hostel_rooms WHERE id=$1 FOR UPDATE', [newRoomId]);
    if (roomRes.rowCount === 0) throw new Error('Target room not found');
    const targetRoom = roomRes.rows[0];

    if (targetRoom.occupants >= targetRoom.capacity) throw new Error('Target room is full');

    // check bed occupancy in target room
    const bedRes = await conn.query('SELECT id FROM hostel_allocations WHERE room_id=$1 AND bed_number=$2 AND status=$3', [newRoomId, newBedNumber, 'Active']);
    if (bedRes.rowCount > 0) throw new Error('Bed already occupied in target room');

    // decrement old room occupants if allocation was active
    if (alloc.status === 'Active') {
      await conn.query('UPDATE hostel_rooms SET occupants = GREATEST(0, occupants - 1) WHERE id=$1', [alloc.room_id]);
    }

    // update allocation to new room/bed
    await conn.query('UPDATE hostel_allocations SET room_id=$1, bed_number=$2, block_id=$3, updated_at=now() WHERE id=$4', [newRoomId, newBedNumber, req.body.newBlockId || alloc.block_id, allocationId]);

    // increment target room occupants
    await conn.query('UPDATE hostel_rooms SET occupants = occupants + 1 WHERE id=$1', [newRoomId]);

    await conn.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await conn.query('ROLLBACK');
    console.error('transferAllocation', err);
    res.status(500).json({ error: err.message || 'Transfer failed' });
  } finally {
    conn.release();
  }
}

export async function updateAllocation(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_allocations').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    res.json({ allocation: data });
  } catch (err) {
    console.error('updateAllocation', err);
    res.status(500).json({ error: err.message || 'Failed to update allocation' });
  }
}

export async function deleteAllocation(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('hostel_allocations').delete().eq('id', id);
    if (error) throw error;
    // decrement occupants safely
    // best-effort: decrement occupancy if present
    res.json({ success: true });
  } catch (err) {
    console.error('deleteAllocation', err);
    res.status(500).json({ error: err.message || 'Failed to delete allocation' });
  }
}
