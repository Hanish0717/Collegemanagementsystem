import { supabase } from '../../config/supabase.js';

export async function listRooms(req, res) {
  try {
    const { blockId, hostelId } = req.query;
    let query = supabase.from('hostel_rooms').select('*, hostel_blocks(name, code)');
    
    if (blockId) query = query.eq('block_id', blockId);
    if (hostelId) query = query.eq('hostel_id', hostelId);

    const { data, error } = await query.order('room_number', { ascending: true });
    if (error) throw error;
    res.json({ rooms: data });
  } catch (err) {
    console.error('listRooms', err);
    res.status(500).json({ error: err.message || 'Failed to list rooms' });
  }
}

export async function createRoom(req, res) {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_rooms').insert([payload]).select().single();
    if (error) throw error;
    res.status(201).json({ room: data });
  } catch (err) {
    console.error('createRoom', err);
    res.status(500).json({ error: err.message || 'Failed to create room' });
  }
}

export async function getRoom(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('hostel_rooms').select('*, hostel_blocks(name, code)').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Room not found' });
    res.json({ room: data });
  } catch (err) {
    console.error('getRoom', err);
    res.status(500).json({ error: err.message || 'Failed to load room' });
  }
}

export async function updateRoom(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_rooms').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    res.json({ room: data });
  } catch (err) {
    console.error('updateRoom', err);
    res.status(500).json({ error: err.message || 'Failed to update room' });
  }
}

export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('hostel_rooms').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('deleteRoom', err);
    res.status(500).json({ error: err.message || 'Failed to delete room' });
  }
}
