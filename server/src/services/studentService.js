import { supabase } from '../config/supabase.js';

export const getStudentById = async (id) => {
  const { data } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
  return data;
};
