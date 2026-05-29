import { supabase } from '../config/supabase.js';

export const updateStudentAttendancePercentage = async (studentId) => {
  try {
    const { count: total } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student', studentId);

    const { count: attended } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student', studentId)
      .in('status', ['Present', 'present', 'Late', 'late']);

    const percentage = (total && total > 0) ? Math.round(((attended || 0) / total) * 100 * 10) / 10 : 100;
    
    await supabase
      .from('students')
      .update({ attendance_percentage: percentage })
      .eq('id', studentId);

    return percentage;
  } catch (error) {
    console.error(`Error updating attendance percentage for student ${studentId}:`, error);
    throw error;
  }
};
