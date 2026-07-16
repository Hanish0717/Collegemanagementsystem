import { supabase } from '../config/supabase.js';

/**
 * Recalculates and updates the overall attendance percentage for a faculty member.
 * Attended status counts: Present, Late, Excused.
 */
export const updateFacultyAttendancePercentage = async (facultyId) => {
  try {
    const { count: total } = await supabase
      .from('faculty_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('faculty', facultyId);

    const { count: attended } = await supabase
      .from('faculty_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('faculty', facultyId)
      .in('status', ['Present', 'present', 'Late', 'late', 'Excused', 'excused']);

    const percentage = (total && total > 0) 
      ? Math.round(((attended || 0) / total) * 100 * 10) / 10 
      : 100;

    await supabase
      .from('faculty')
      .update({ attendance_percentage: percentage })
      .eq('id', facultyId);

    return percentage;
  } catch (error) {
    console.error(`Error updating attendance percentage for faculty ${facultyId}:`, error);
    throw error;
  }
};
