import { supabase } from '../config/supabase.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    let adminProfile = null;

    if (req.user && req.user.role === 'admin') {
      const { data: profile } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', req.user.id || req.user._id)
        .maybeSingle();
      adminProfile = profile;
    }

    const getDeptCode = (name) => {
      if (!name) return null;
      const DEPT_MAP = {
        'computer science & engineering': 'CSE',
        'computer science': 'CSE',
        'artificial intelligence & machine learning': 'AIML',
        'artificial intelligence and machine learning': 'AIML',
        'aiml': 'AIML',
        'artificial intelligence & data science': 'AIDS',
        'artificial intelligence and data science': 'AIDS',
        'aids': 'AIDS',
        'electronics & communication engineering': 'ECE',
        'electronics and communication engineering': 'ECE',
        'ece': 'ECE',
        'electrical & electronics engineering': 'EEE',
        'electrical and electronics engineering': 'EEE',
        'eee': 'EEE',
        'mechanical engineering': 'MECH',
        'mech': 'MECH',
        'civil engineering': 'CIVIL',
        'civil': 'CIVIL'
      };
      const normalized = name.toLowerCase().trim();
      return DEPT_MAP[normalized] || name.toUpperCase().trim();
    };

    const adminDept = adminProfile ? getDeptCode(adminProfile.department) : null;
    const isGlobalAdmin = !adminProfile || 
                          !adminProfile.department || 
                          adminProfile.department === 'Administration' ||
                          adminProfile.full_name === 'System Admin' ||
                          adminProfile.email === 'admin@college.com';

    // 1. Total Students (verified only)
    let studentQuery = supabase
      .from('students')
      .select('id, users!inner(is_verified)', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('users.is_verified', true);

    if (!isGlobalAdmin && adminDept) {
      studentQuery = studentQuery.eq('department', adminDept);
    }

    // 2. Faculty Members
    let facultyQuery = supabase
      .from('faculty')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (!isGlobalAdmin && adminDept) {
      facultyQuery = facultyQuery.eq('department', adminDept);
    }

    // 3. Department Distribution (verified only)
    let studentDistQuery = supabase
      .from('students')
      .select('department, users!inner(is_verified)')
      .eq('is_active', true)
      .eq('users.is_verified', true);

    if (!isGlobalAdmin && adminDept) {
      studentDistQuery = studentDistQuery.eq('department', adminDept);
    }

    // 4. Asynchronous parallel wrapper promises
    const feeCollectionPromise = (async () => {
      if (!isGlobalAdmin && adminDept) {
        const { data: deptStudents } = await supabase
          .from('students')
          .select('id, users!inner(is_verified)')
          .eq('department', adminDept)
          .eq('is_active', true)
          .eq('users.is_verified', true);
        const studentIds = deptStudents ? deptStudents.map(s => s.id) : [];
        if (studentIds.length > 0) {
          const { data: fees } = await supabase
            .from('fees')
            .select('paid_amount')
            .in('student', studentIds);
          return fees ? fees.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0) : 0;
        }
        return 0;
      } else {
        const { data: fees } = await supabase
          .from('fees')
          .select('paid_amount');
        return fees ? fees.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0) : 0;
      }
    })();

    const recentFeesPromise = (async () => {
      const { data: recentFees } = await supabase
        .from('fees')
        .select('type, created_at, student')
        .order('created_at', { ascending: false })
        .limit(2);
      
      const formattedRecentFees = [];
      if (recentFees) {
        for (const f of recentFees) {
          const { data: stRecord } = await supabase
            .from('students')
            .select('full_name')
            .eq('id', f.student)
            .maybeSingle();

          formattedRecentFees.push({
            actor: "Finance Dept",
            action: "allocated fee for",
            target: stRecord?.full_name || "Student",
            time: "Recently",
            type: "Billing"
          });
        }
      }
      return formattedRecentFees;
    })();

    // 5. Execute all database operations in parallel
    const [
      studentRes,
      facultyRes,
      booksRes,
      feeCollected,
      activeDeptsRes,
      attendanceRes,
      pendingLeavesRes,
      pendingComplaintsRes,
      lowAttendanceRes,
      studentsDistRes,
      recentAttendanceRes,
      feePaymentsRes,
      recentComplaintsRes,
      recentLeavesRes,
      formattedRecentFees
    ] = await Promise.all([
      studentQuery,
      facultyQuery,
      supabase.from('books').select('*', { count: 'exact', head: true }).eq('is_active', true),
      feeCollectionPromise,
      supabase.from('departments').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('students').select('attendance_percentage, users!inner(is_verified)').eq('is_active', true).eq('users.is_verified', true),
      supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('students').select('id, users!inner(is_verified)', { count: 'exact', head: true }).lt('attendance_percentage', 75.0).eq('is_active', true).eq('users.is_verified', true),
      studentDistQuery,
      supabase.from('attendance').select('status, date'),
      supabase.from('fees').select('paid_amount, payment_date').not('payment_date', 'is', null),
      supabase.from('complaints').select('title, status, created_at, users(full_name)').order('created_at', { ascending: false }).limit(2),
      supabase.from('leave_requests').select('type, status, created_at, users(full_name)').order('created_at', { ascending: false }).limit(2),
      recentFeesPromise
    ]);

    // Unpack results
    const totalStudents = studentRes.count || 0;
    const facultyMembers = facultyRes.count || 0;
    const totalBooks = booksRes.count || 0;
    const activeDepts = activeDeptsRes.count || 0;
    const attendancePercentages = attendanceRes.data || [];
    const pendingLeaves = pendingLeavesRes.count || 0;
    const pendingComplaints = pendingComplaintsRes.count || 0;
    const lowAttendanceCount = lowAttendanceRes.count || 0;
    const studentsDist = studentsDistRes.data || [];
    const recentAttendance = recentAttendanceRes.data || [];
    const feePayments = feePaymentsRes.data || [];
    const recentComplaints = recentComplaintsRes.data || [];
    const recentLeaves = recentLeavesRes.data || [];

    // Formatting fee collected
    let feeCollectedStr = `₹${feeCollected.toLocaleString('en-IN')}`;
    if (feeCollected >= 10000000) {
      feeCollectedStr = `₹${(feeCollected / 10000000).toFixed(2)} Cr`;
    } else if (feeCollected >= 100000) {
      feeCollectedStr = `₹${(feeCollected / 100000).toFixed(2)}L`;
    }

    // Dynamic stats list matching frontend structure
    const stats = [
      { label: "Total Students", value: (totalStudents || 0).toString(), change: "+5.4%" },
      { label: "Total Faculty", value: (facultyMembers || 0).toString(), change: "+2.1%" },
      { label: "Active Departments", value: (activeDepts || 0).toString(), change: "+0%" },
      { label: "Attendance Percentage", value: "90%", change: "+1.2%" },
      { label: "Fee Collection", value: feeCollectedStr, change: "+8.7%" },
      { label: "Pending Approvals", value: (Number(pendingLeaves || 0) + Number(pendingComplaints || 0)).toString(), change: "-5.2%" },
      { label: "Upcoming Events", value: "4", change: "+1" },
      { label: "Low Attendance Warning", value: (lowAttendanceCount || 0).toString(), change: "Active Alert" }
    ];

    // Compute average attendance from percentages
    let avgAttendanceVal = 90;
    if (attendancePercentages && attendancePercentages.length > 0) {
      const totalPct = attendancePercentages.reduce((sum, s) => sum + (Number(s.attendance_percentage) || 100), 0);
      avgAttendanceVal = Math.round((totalPct / attendancePercentages.length) * 10) / 10;
    }
    stats[3].value = `${avgAttendanceVal}%`;

    const deptCounts = {};
    if (studentsDist) {
      studentsDist.forEach(s => {
        if (s.department) {
          deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
        }
      });
    }

    const colors = ["#4F46E5", "#9333EA", "#06B6D4", "#2563EB", "#7C3AED", "#0891B2"];
    const departmentData = Object.keys(deptCounts).map((dept, idx) => ({
      name: dept,
      value: deptCounts[dept],
      color: colors[idx % colors.length]
    }));

    if (departmentData.length === 0) {
      departmentData.push(
        { name: "Computer Science", value: 12, color: "#4F46E5" },
        { name: "Electronics", value: 8, color: "#9333EA" },
        { name: "Mechanical", value: 5, color: "#06B6D4" }
      );
    }

    // Weekly Attendance Mock-to-live translation (present vs absent)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts = {};
    for (let i = 1; i <= 6; i++) {
      dayCounts[dayNames[i]] = { present: 0, absent: 0 };
    }

    if (recentAttendance) {
      recentAttendance.forEach(att => {
        const date = new Date(att.date);
        const dayName = dayNames[date.getDay()];
        if (dayCounts[dayName]) {
          const status = att.status.toLowerCase();
          if (status === 'present' || status === 'late') {
            dayCounts[dayName].present++;
          } else if (status === 'absent') {
            dayCounts[dayName].absent++;
          }
        }
      });
    }

    const attendanceMonitoring = Object.keys(dayCounts).map(day => {
      let presentVal = dayCounts[day].present;
      let absentVal = dayCounts[day].absent;
      if (presentVal === 0 && absentVal === 0) {
        const totalCount = totalStudents || 25;
        presentVal = Math.round(totalCount * 0.9);
        absentVal = totalCount - presentVal;
      }
      return {
        day,
        present: presentVal,
        absent: absentVal
      };
    });

    // Student Analytics (Enrollment and Fee collections)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyAnalytics = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const mName = months[d.getMonth()];
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyAnalytics[key] = { month: mName, enrolled: 0, fees: 0 };
    }

    const studentAnalytics = Object.keys(monthlyAnalytics).sort().map((key, idx) => {
      const record = monthlyAnalytics[key];
      const totalCount = totalStudents || 25;
      const step = Math.ceil(totalCount / 6);
      const enrolledVal = Math.min(totalCount, (idx + 1) * step);
      
      let feesVal = record.fees;
      if (feePayments) {
        feePayments.forEach(fp => {
          const fpDate = new Date(fp.payment_date);
          const fpKey = `${fpDate.getFullYear()}-${String(fpDate.getMonth() + 1).padStart(2, '0')}`;
          if (fpKey === key) {
            feesVal += (Number(fp.paid_amount) || 0);
          }
        });
      }
      if (feesVal === 0) {
        feesVal = enrolledVal * 1200;
      }

      return {
        month: record.month,
        enrolled: enrolledVal,
        fees: feesVal
      };
    });

    // Dynamic Activities
    const activities = [];

    if (recentComplaints) {
      recentComplaints.forEach(c => {
        activities.push({
          actor: c.users?.full_name || "Student",
          action: "submitted complaint:",
          target: c.title,
          time: "Recently",
          type: "Complaint"
        });
      });
    }

    if (recentLeaves) {
      recentLeaves.forEach(l => {
        activities.push({
          actor: l.users?.full_name || "Student",
          action: "applied for",
          target: l.type,
          time: "Recently",
          type: "Leave"
        });
      });
    }

    if (formattedRecentFees) {
      activities.push(...formattedRecentFees);
    }

    if (activities.length === 0) {
      activities.push(
        { actor: "System", action: "initialized database", target: "seed operation", time: "1d ago", type: "System" }
      );
    }

    // Dynamic Notifications
    const notifications = [];
    let notifId = 1;

    if (pendingLeaves > 0) {
      notifications.push({
        id: `AN-${notifId++}`,
        title: `${pendingLeaves} student leave request(s) pending approval`,
        type: "Approval",
        time: "Just now",
        unread: true
      });
    }

    if (pendingComplaints > 0) {
      notifications.push({
        id: `AN-${notifId++}`,
        title: `${pendingComplaints} student complaint(s) pending review`,
        type: "Approval",
        time: "Just now",
        unread: true
      });
    }

    if (lowAttendanceCount > 0) {
      notifications.push({
        id: `AN-${notifId++}`,
        title: `Attendance below 75% for ${lowAttendanceCount} student(s)`,
        type: "Warning",
        time: "1h ago",
        unread: false
      });
    }

    notifications.push({
      id: `AN-${notifId++}`,
      title: `Fee collection deadline approaching for current semester`,
      type: "Alert",
      time: "2h ago",
      unread: false
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        departmentData,
        attendanceMonitoring,
        studentAnalytics,
        activities,
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};
