import { supabase } from '../config/supabase.js';

export const getBookById = async (id) => {
  const { data } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
  return data;
};
