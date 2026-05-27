import Attendance from '../models/attendance/Attendance.js';
import Student from '../models/student/Student.js';

export const updateStudentAttendancePercentage = async (studentId) => {
  try {
    const total = await Attendance.countDocuments({ student: studentId });
    const attended = await Attendance.countDocuments({
      student: studentId,
      status: { $in: ['present', 'late'] },
    });

    const percentage = total > 0 ? Math.round((attended / total) * 100 * 10) / 10 : 100;
    await Student.findByIdAndUpdate(studentId, { attendancePercentage: percentage });
    return percentage;
  } catch (error) {
    console.error(`Error updating attendance percentage for student ${studentId}:`, error);
    throw error;
  }
};
