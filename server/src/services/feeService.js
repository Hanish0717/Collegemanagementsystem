import { supabase } from '../config/supabase.js';

export const getFeeById = async (id) => {
  const { data } = await supabase.from('fees').select('*').eq('id', id).maybeSingle();
  return data;
};
