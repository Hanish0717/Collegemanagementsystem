import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';

// Helper: Recalculate student overall attendance percentage and save it
const updateStudentAttendancePercentage = async (studentId) => {
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
  }
};

// @desc    Mark attendance for a student
// @route   POST /api/attendance/mark
// @access  Private (faculty, admin, super-admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { student, subject, date, status, department, semester, section, remarks } = req.body;

    // Validate fields
    if (!student || !subject || !date || !status || !department || !semester || !section) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    // Verify student exists
    const studentRecord = await Student.findOne({ _id: student, isActive: true });
    if (!studentRecord) {
      const error = new Error('Student not found or inactive');
      error.statusCode = 404;
      return next(error);
    }

    // Normalize date
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Prevent duplicate attendance
    const duplicate = await Attendance.findOne({
      student,
      date: normalizedDate,
      subject,
    });

    if (duplicate) {
      const error = new Error('Attendance already marked for this student, subject, and date');
      error.statusCode = 400;
      return next(error);
    }

    // Create record
    const record = await Attendance.create({
      student,
      faculty: req.user._id,
      subject,
      department,
      semester,
      section,
      date: normalizedDate,
      status,
      remarks,
    });

    // Recalculate percentage
    await updateStudentAttendancePercentage(student);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: record,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const err = new Error(Object.values(error.errors).map((val) => val.message).join(', '));
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Get student attendance statistics (overall, subject-wise, monthly)
// @route   GET /api/attendance/student/:studentId
// @access  Private (student, parent, faculty, admin, super-admin)
export const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      const error = new Error('Invalid student ID format');
      error.statusCode = 400;
      return next(error);
    }

    const studentRecord = await Student.findOne({ _id: studentId, isActive: true });
    if (!studentRecord) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    // Fetch all records
    const records = await Attendance.find({ student: studentId })
      .populate('faculty', 'fullName')
      .sort({ date: -1 });

    const total = records.length;
    const presentCount = records.filter((r) => r.status === 'present').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;

    const overallPercentage = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100 * 10) / 10 : 100;

    // Subject-wise calculation
    const subjects = [...new Set(records.map((r) => r.subject))];
    const subjectWise = subjects.map((subj) => {
      const subjRecords = records.filter((r) => r.subject === subj);
      const sTotal = subjRecords.length;
      const sAttended = subjRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
      return {
        subject: subj,
        total: sTotal,
        present: subjRecords.filter((r) => r.status === 'present').length,
        late: subjRecords.filter((r) => r.status === 'late').length,
        absent: subjRecords.filter((r) => r.status === 'absent').length,
        percentage: sTotal > 0 ? Math.round((sAttended / sTotal) * 100 * 10) / 10 : 100,
      };
    });

    // Monthly calculation
    const monthlyStats = {};
    records.forEach((record) => {
      const monthYear = record.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyStats[monthYear]) {
        monthlyStats[monthYear] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      monthlyStats[monthYear][record.status]++;
      monthlyStats[monthYear].total++;
    });

    const monthly = Object.keys(monthlyStats).map((month) => ({
      month,
      ...monthlyStats[month],
      percentage: Math.round(((monthlyStats[month].present + monthlyStats[month].late) / monthlyStats[month].total) * 100 * 10) / 10,
    })).sort((a, b) => b.month.localeCompare(a.month));

    const response = {
      success: true,
      message: 'Student attendance stats retrieved successfully',
      data: {
        overallPercentage,
        totals: { total, present: presentCount, absent: absentCount, late: lateCount },
        subjectWise,
        monthly,
        records,
      },
    };

    // Flag low attendance Warning
    if (overallPercentage < 75) {
      response.lowAttendance = true;
      response.warning = 'Attendance below 75%';
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get class attendance list
// @route   GET /api/attendance/class
// @access  Private (faculty, admin, super-admin)
export const getClassAttendance = async (req, res, next) => {
  try {
    const { department, semester, section, subject, date } = req.query;

    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (section) query.section = section;
    if (subject) query.subject = subject;

    if (date) {
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      query.date = normalizedDate;
    }

    const records = await Attendance.find(query)
      .populate('student', 'fullName rollNumber')
      .populate('faculty', 'fullName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: 'Class attendance records retrieved successfully',
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (faculty, admin, super-admin)
export const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const record = await Attendance.findById(req.params.id);
    if (!record) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      return next(error);
    }

    if (status) record.status = status;
    if (remarks !== undefined) record.remarks = remarks;

    const updatedRecord = await record.save();

    // Recalculate percentage for the student
    await updateStudentAttendancePercentage(record.student);

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid attendance ID format');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (faculty, admin, super-admin)
export const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      return next(error);
    }

    await Attendance.deleteOne({ _id: req.params.id });

    // Recalculate percentage for the student
    await updateStudentAttendancePercentage(record.student);

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: null,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid attendance ID format');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Generate general attendance report and flag low attendance
// @route   GET /api/attendance/report
// @access  Private (admin, super-admin)
export const getAttendanceReport = async (req, res, next) => {
  try {
    const { department, semester, section, subject, startDate, endDate } = req.query;

    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (section) query.section = section;
    if (subject) query.subject = subject;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0));
      if (endDate) query.date.$lte = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
    }

    const records = await Attendance.find(query);

    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;

    const overallPercentage = total > 0 ? Math.round(((present + late) / total) * 100 * 10) / 10 : 100;

    // Get low attendance students (attendance < 75%)
    const studentQuery = { isActive: true };
    if (department) studentQuery.department = department;
    if (semester) studentQuery.semester = Number(semester);
    if (section) studentQuery.section = section;

    const allStudents = await Student.find(studentQuery);
    const lowAttendanceStudents = allStudents.filter((s) => s.attendancePercentage < 75);

    res.status(200).json({
      success: true,
      message: 'Attendance report generated successfully',
      data: {
        totals: { total, present, absent, late },
        overallPercentage,
        lowAttendanceStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};
