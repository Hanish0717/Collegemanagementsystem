import { supabase } from '../../config/supabase.js';

export async function listBlocks(req, res) {
  try {
    const { data, error } = await supabase.from('hostel_blocks').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.json({ blocks: data });
  } catch (err) {
    console.error('listBlocks', err);
    res.status(500).json({ error: err.message || 'Failed to list blocks' });
  }
}

export async function createBlock(req, res) {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_blocks').insert([payload]).select().single();
    if (error) throw error;
    res.status(201).json({ block: data });
  } catch (err) {
    console.error('createBlock', err);
    res.status(500).json({ error: err.message || 'Failed to create block' });
  }
}

export async function getBlock(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('hostel_blocks').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Block not found' });
    res.json({ block: data });
  } catch (err) {
    console.error('getBlock', err);
    res.status(500).json({ error: err.message || 'Failed to load block' });
  }
}

export async function updateBlock(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_blocks').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    res.json({ block: data });
  } catch (err) {
    console.error('updateBlock', err);
    res.status(500).json({ error: err.message || 'Failed to update block' });
  }
}

export async function deleteBlock(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('hostel_blocks').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('deleteBlock', err);
    res.status(500).json({ error: err.message || 'Failed to delete block' });
  }
}
