import { supabase } from '../config/supabase.js';
import { dispatchNotification } from '../services/notificationService.js';

const sendPlacementStatusNotification = async (studentId, company, role, status, customMsg) => {
  try {
    const { data: student } = await supabase
      .from('students')
      .select('full_name, email, parent_email, user_id')
      .eq('id', studentId)
      .maybeSingle();

    if (student) {
      let title = `Placement Update: ${company}`;
      let message = customMsg || `Dear ${student.full_name}, your application status for ${company} (${role}) has been updated to "${status}".`;

      if (status === 'Applied') {
        title = `Applied Successfully: ${company}`;
        message = `Dear ${student.full_name}, you have successfully applied for the drive "${role}" at ${company}.`;
      } else if (status === 'Shortlisted') {
        title = `Shortlisted for Interview: ${company}`;
        message = `Congratulations ${student.full_name}! You have been shortlisted for the next round of interviews at ${company} for the "${role}" role.`;
      } else if (status === 'Selected') {
        title = `Selected at ${company}!`;
        message = `Outstanding news ${student.full_name}! You have been selected for the role of "${role}" at ${company}! Please check your portal for the offer details.`;
      } else if (status === 'Rejected') {
        title = `Application Status Update: ${company}`;
        message = `Dear ${student.full_name}, thank you for your participation in the ${company} recruitment drive for "${role}". Unfortunately, your application was not selected to move forward at this time.`;
      } else if (status === 'Offer Released') {
        title = `Offer Released: ${company}`;
        message = `Congratulations ${student.full_name}! ${company} has released your official offer letter for the "${role}" position. Please review and respond in your portal.`;
      }

      dispatchNotification({
        userId: student.user_id,
        studentId: studentId,
        email: student.email,
        parentEmail: student.parent_email,
        type: 'Placement',
        title,
        message,
        priority: status === 'Selected' || status === 'Offer Released' ? 'High' : 'Medium'
      });
    }
  } catch (err) {
    console.error('Failed to send placement status notification:', err);
  }
};

// Base mock datasets to fall back to if tables are missing or query fails
const fallbackCompanies = [
  { id: "COM001", name: "Google India", industry: "Technology", hrContact: "Anjali Sharma", email: "careers-india@google.com", phone: "9876543210", package: "22.5 LPA", hiringStatus: "Active", previousYearHires: 12 },
  { id: "COM002", name: "Microsoft India", industry: "Technology", hrContact: "Rohit Mehta", email: "careers@microsoft.com", phone: "9876543210", package: "20.0 LPA", hiringStatus: "Active", previousYearHires: 15 },
  { id: "COM003", name: "Amazon India", industry: "E-commerce", hrContact: "Sanjay Sen", email: "careers@amazon.in", phone: "9876543210", package: "18.5 LPA", hiringStatus: "Active", previousYearHires: 18 },
  { id: "COM004", name: "Goldman Sachs", industry: "Investment Banking", hrContact: "Sneha Rao", email: "careers@gs.com", phone: "9876543210", package: "16.0 LPA", hiringStatus: "Active", previousYearHires: 8 },
  { id: "COM005", name: "Accenture", industry: "Consulting", hrContact: "Rahul Verma", email: "careers@accenture.com", phone: "9876543210", package: "11.0 LPA", hiringStatus: "Active", previousYearHires: 22 },
  { id: "COM006", name: "TCS", industry: "Consulting", hrContact: "Komal Gupta", email: "careers@tcs.com", phone: "9876543210", package: "12.0 LPA", hiringStatus: "Active", previousYearHires: 20 },
  { id: "COM007", name: "Infosys", industry: "IT Services", hrContact: "Deepa Nair", email: "careers@infosys.com", phone: "9876543210", package: "10.5 LPA", hiringStatus: "Active", previousYearHires: 18 },
  { id: "COM008", name: "Oracle", industry: "Technology", hrContact: "Siddharth Sen", email: "careers@oracle.com", phone: "9876543210", package: "16.5 LPA", hiringStatus: "Active", previousYearHires: 14 },
  { id: "COM009", name: "Capgemini India", industry: "Consulting", hrContact: "Anisha Reddy", email: "hr-recruiting@capgemini.com", phone: "9876543218", package: "9.5 LPA", hiringStatus: "Active", previousYearHires: 25 }
];

const fallbackDrives = [
  { id: "DRV001", company: "Google India", role: "Software Engineer", date: "2026-06-15", venue: "Main Auditorium", applicationDeadline: "2026-06-10", status: "Upcoming", studentCount: 324, rounds: 3 },
  { id: "DRV002", company: "Microsoft India", role: "SDE-II", date: "2026-06-20", venue: "Conference Hall A", applicationDeadline: "2026-06-15", status: "Upcoming", studentCount: 198, rounds: 2 },
  { id: "DRV003", company: "Amazon India", role: "Associate", date: "2026-06-08", venue: "Main Auditorium", applicationDeadline: "2026-06-03", status: "Ongoing", studentCount: 287, rounds: 2 },
  { id: "DRV004", company: "Goldman Sachs", role: "Analyst", date: "2026-06-22", venue: "Finance Center", applicationDeadline: "2026-06-18", status: "Upcoming", studentCount: 89, rounds: 4 },
  { id: "DRV005", company: "Accenture", role: "Consulting", date: "2026-01-15", venue: "Seminar Hall 1", applicationDeadline: "2026-01-10", status: "Completed", studentCount: 212, rounds: 3 },
  { id: "DRV006", company: "TCS", role: "Consulting", date: "2026-02-12", venue: "Campus Placement Block", applicationDeadline: "2026-02-08", status: "Completed", studentCount: 154, rounds: 2 },
  { id: "DRV007", company: "Infosys", role: "IT Services", date: "2026-03-10", venue: "Placement Block", applicationDeadline: "2026-03-05", status: "Completed", studentCount: 382, rounds: 2 }
];

const fallbackInterviews = [
  { id: "INT001", studentName: "Aarav Sharma", company: "Google India", round: 2, date: "2026-06-18", time: "10:00 AM", mode: "Online", venue: "Video Call", panelists: ["Dr. Rajesh Verma"], status: "Scheduled" },
  { id: "INT002", studentName: "Priya Patel", company: "Microsoft India", round: 1, date: "2026-06-20", time: "02:00 PM", mode: "In-Person", venue: "Conference Hall A", panelists: ["Amit Kumar"], status: "Scheduled" },
  { id: "INT003", studentName: "Ethan Walker", company: "Amazon India", round: 3, date: "2026-06-25", time: "11:00 AM", mode: "Online", venue: "Video Call", panelists: ["Deepak Singh"], status: "Pending" },
  { id: "INT004", studentName: "Sofia Rodriguez", company: "Infosys", round: 1, date: "2026-06-12", time: "09:00 AM", mode: "In-Person", venue: "Tech Lab", panelists: ["Vikram Patel"], status: "Completed" }
];

const fallbackNotifications = [
  { id: "PN001", title: "New drive: Goldman Sachs Analyst", time: "2h ago", type: "Drive", unread: true },
  { id: "PN002", title: "Interview scheduled: Aarav Sharma - Google", time: "5h ago", type: "Interview", unread: true },
  { id: "PN003", title: "Offer received: Sofia Rodriguez - Infosys", time: "1d ago", type: "Offer", unread: false },
  { id: "PN004", title: "Application deadline tomorrow: Microsoft India", time: "2d ago", type: "Deadline", unread: false },
  { id: "PN005", title: "Resume verification required", time: "3d ago", type: "Resume", unread: false }
];

export const getPlacementDashboard = async (req, res, next) => {
  try {
    // 1. Fetch data from Supabase
    const [companiesRes, drivesRes, interviewsRes, notificationsRes] = await Promise.all([
      supabase.from('placement_companies').select('*'),
      supabase.from('placements').select('*'),
      supabase.from('placement_interviews').select('*'),
      supabase.from('placement_notifications').select('*')
    ]);

    const hasDBError = companiesRes.error || drivesRes.error || interviewsRes.error || notificationsRes.error;

    let companies = [];
    let drives = [];
    let interviews = [];
    let placementNotifications = [];

    if (hasDBError) {
      console.warn("⚠️ Supabase Placement tables missing or queried with errors. Falling back to structured mock data.");
      
      companies = fallbackCompanies;
      drives = fallbackDrives;
      interviews = fallbackInterviews;
      placementNotifications = fallbackNotifications;
    } else {
      // Mapping Companies
      companies = (companiesRes.data || []).map(c => ({
        id: c.id,
        name: c.name,
        industry: c.industry || "Technology",
        hrContact: c.hr_contact || "HR Manager",
        email: c.email || "hr@company.com",
        phone: c.phone || "9876543210",
        package: c.package_amount || "8.0 LPA",
        hiringStatus: c.is_active ? "Active" : "Inactive",
        previousYearHires: c.previous_hires || 0
      }));

      // Mapping Drives
      drives = (drivesRes.data || []).map(d => {
        let count = 0;
        try {
          const arr = typeof d.applied_students === 'string' ? JSON.parse(d.applied_students) : (d.applied_students || []);
          count = Array.isArray(arr) ? arr.length : 0;
        } catch (e) {
          count = 0;
        }
        return {
          id: d.id,
          company: d.company,
          role: d.position,
          date: d.drive_date ? new Date(d.drive_date).toISOString().split('T')[0] : "TBD",
          venue: d.venue || "Virtual",
          applicationDeadline: d.deadline ? new Date(d.deadline).toISOString().split('T')[0] : "Closed",
          status: d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Upcoming",
          studentCount: count || 120 + Math.floor(Math.random() * 80),
          rounds: 3
        };
      });

      // Mapping Interviews
      interviews = (interviewsRes.data || []).map(i => ({
        id: i.id,
        studentName: i.student_name,
        company: i.company_name,
        round: parseInt(i.round.replace(/[^0-9]/g, '')) || 1,
        date: i.date ? new Date(i.date).toISOString().split('T')[0] : "TBD",
        time: i.time,
        mode: i.mode || "Online",
        venue: i.mode === "Online" ? "Video Call" : "Conference Hall A",
        panelists: ["HR Manager"],
        status: i.status || "Scheduled"
      }));

      // Mapping Notifications
      placementNotifications = (notificationsRes.data || []).map(n => ({
        id: n.id,
        title: n.title,
        time: n.time,
        type: n.type,
        unread: n.unread
      }));
    }

    // 2. Generate dynamic lists (Applications and Offers) from drive applications data
    const applications = [];
    const offers = [];

    // Base seeded applications if database is empty/mock
    const baseApplications = [
      { id: "APP001", studentName: "Aarav Sharma", studentId: "STU001", company: "Google India", role: "Software Engineer", appliedDate: "2026-06-05", status: "Shortlisted", score: 92, round: 2 },
      { id: "APP002", studentName: "Priya Patel", studentId: "STU002", company: "Microsoft India", role: "SDE-II", appliedDate: "2026-06-07", status: "Interview Scheduled", score: 88, round: 1 },
      { id: "APP003", studentName: "Ethan Walker", studentId: "STU003", company: "Amazon India", role: "Associate", appliedDate: "2026-06-01", status: "Selected", score: 95, round: 3 },
      { id: "APP004", studentName: "Sofia Rodriguez", studentId: "STU004", company: "Infosys", role: "Trainee", appliedDate: "2026-05-22", status: "Offer Released", score: 87, round: 1 },
      { id: "APP005", studentName: "Liam Chen", studentId: "STU005", company: "Goldman Sachs", role: "Analyst", appliedDate: "2026-06-10", status: "Applied", score: 0, round: 0 }
    ];

    const baseOffers = [
      { id: "OFF001", studentName: "Sofia Rodriguez", company: "Infosys", role: "Trainee", package: "10.5 LPA", joiningDate: "2026-07-15", status: "Accepted", offerDate: "2026-06-05" },
      { id: "OFF002", studentName: "Ethan Walker", company: "Amazon India", role: "Associate", package: "18.5 LPA", joiningDate: "2026-08-01", status: "Accepted", offerDate: "2026-06-10" },
      { id: "OFF003", studentName: "Aarav Sharma", company: "Google India", role: "Software Engineer", package: "22.5 LPA", joiningDate: "2026-07-20", status: "Pending", offerDate: "2026-06-12" },
      { id: "OFF004", studentName: "Priya Patel", company: "Microsoft India", role: "SDE-II", package: "20.0 LPA", joiningDate: "2026-08-15", status: "Accepted", offerDate: "2026-06-08" }
    ];

    if (!hasDBError && drivesRes.data && drivesRes.data.length > 0) {
      drivesRes.data.forEach(d => {
        let appliedList = [];
        try {
          appliedList = typeof d.applied_students === 'string' ? JSON.parse(d.applied_students) : (d.applied_students || []);
        } catch (e) {
          appliedList = [];
        }

        if (Array.isArray(appliedList)) {
          appliedList.forEach((app, index) => {
            const appId = `APP_${d.id}_${index}`;
            applications.push({
              id: appId,
              studentName: app.student_name,
              studentId: app.student_id || `STU_D_${index}`,
              company: d.company,
              role: d.position,
              appliedDate: app.applied_date || "2026-06-01",
              status: app.status || "Applied",
              score: (app.score !== undefined && app.score !== null) ? app.score : (app.status === 'Selected' ? 95 : 85),
              round: (app.round !== undefined && app.round !== null) ? app.round : (app.status === 'Selected' ? 3 : 1)
            });

            if (app.status === 'Selected' || app.status === 'Offer Released') {
              offers.push({
                id: `OFF_${d.id}_${index}`,
                studentName: app.student_name,
                company: d.company,
                role: d.position,
                package: app.package ? `${app.package} LPA` : `${d.package_max || 8.0} LPA`,
                joiningDate: app.joining_date || "2026-07-15",
                status: app.offer_status || (app.status === 'Offer Released' ? 'Pending' : 'Accepted'),
                offerDate: app.applied_date || "2026-06-01"
              });
            }
          });
        }
      });
    }

    // Fall back to base lists if no database selections exist
    const finalApplications = applications.length > 0 ? applications : baseApplications;
    const finalOffers = offers.length > 0 ? offers : baseOffers;

    // 3. Compute Stats
    let totalCompaniesVal = companies.length;
    let activeDrivesVal = drives.filter(d => d.status === "Upcoming" || d.status === "Ongoing").length;
    let placedCountVal = finalOffers.filter(o => o.status === "Accepted" || o.status === "Pending").length;
    let highestPackageVal = 24.5;
    let avgPackageVal = 8.2;

    const offerPackages = finalOffers.map(o => parseFloat(o.package.replace(/[^0-9.]/g, ''))).filter(p => !isNaN(p));
    if (offerPackages.length > 0) {
      highestPackageVal = Math.max(...offerPackages);
      const sum = offerPackages.reduce((acc, curr) => acc + curr, 0);
      avgPackageVal = sum / offerPackages.length;
    }

    const stats = [
      { label: "Total Companies", value: totalCompaniesVal.toString(), change: "+12.5%", icon: "Briefcase" },
      { label: "Active Drives", value: activeDrivesVal.toString(), change: "+4.2%", icon: "Sparkles" },
      { label: "Students Placed", value: placedCountVal.toString(), change: "+18.3%", icon: "Users" },
      { label: "Highest Package", value: `${highestPackageVal.toFixed(1)} LPA`, change: "+8.2%", icon: "TrendingUp" },
      { label: "Average Package", value: `${avgPackageVal.toFixed(1)} LPA`, change: "+3.5%", icon: "BarChart3" },
      { label: "Pending Interviews", value: interviews.filter(i => i.status === "Scheduled").length.toString(), change: "-2.1%", icon: "Calendar" }
    ];

    // 4. Compute Placement Trend Data
    // Aggregate by month
    const trendMap = {
      Jan: { month: "Jan", placed: 28, applied: 85, shortlisted: 52, offers: 24 },
      Feb: { month: "Feb", placed: 35, applied: 92, shortlisted: 58, offers: 31 },
      Mar: { month: "Mar", placed: 42, applied: 108, shortlisted: 72, offers: 38 },
      Apr: { month: "Apr", placed: 55, applied: 125, shortlisted: 85, offers: 48 },
      May: { month: "May", placed: 68, applied: 142, shortlisted: 98, offers: 62 },
      Jun: { month: "Jun", placed: 0, applied: 0, shortlisted: 0, offers: 0 }
    };

    // Distribute actual applications into trendMap
    finalApplications.forEach(app => {
      const date = new Date(app.appliedDate);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mName = monthNames[date.getMonth()];
      if (trendMap[mName]) {
        trendMap[mName].applied += 1;
        if (app.status === "Shortlisted") trendMap[mName].shortlisted += 1;
        if (app.status === "Selected" || app.status === "Offer Released") {
          trendMap[mName].placed += 1;
          trendMap[mName].offers += 1;
        }
      }
    });

    const placementTrendData = Object.values(trendMap);

    // 5. Compute Department-wise Placements
    const deptMap = {
      "Computer Science": { name: "Computer Science", value: 92, color: "#4F46E5" },
      "Electronics": { name: "Electronics", value: 78, color: "#9333EA" },
      "Mechanical": { name: "Mechanical", value: 65, color: "#06B6D4" },
      "Business": { name: "Business", value: 52, color: "#2563EB" }
    };

    // If live drives are populated, increment the department placements
    if (!hasDBError && drivesRes.data && drivesRes.data.length > 0) {
      // Initialize to base counts to keep the visualization filled
      finalOffers.forEach(o => {
        // Find department of student if possible or default CS
        // In our seed, Aarav = CSE, Priya = CSE, Ethan = ECE, Sofia = MECH, Student Demo = CSE
        let dept = "Computer Science";
        if (o.studentName === "Ethan Walker") dept = "Electronics"; // ECE maps to Electronics
        if (o.studentName === "Sofia Rodriguez") dept = "Mechanical";
        
        if (deptMap[dept]) {
          deptMap[dept].value += 1;
        }
      });
    }

    const departmentPlacementData = Object.values(deptMap);

    // 6. Compute Package Distribution
    const packageBins = {
      "6-8 LPA": { range: "6-8 LPA", count: 45, color: "#4F46E5" },
      "8-10 LPA": { range: "8-10 LPA", count: 78, color: "#9333EA" },
      "10-15 LPA": { range: "10-15 LPA", count: 92, color: "#06B6D4" },
      "15-20 LPA": { range: "15-20 LPA", count: 58, color: "#2563EB" },
      "20+ LPA": { range: "20+ LPA", count: 14, color: "#7C3AED" }
    };

    finalOffers.forEach(o => {
      const pVal = parseFloat(o.package.replace(/[^0-9.]/g, ''));
      if (pVal >= 6.0 && pVal < 8.0) packageBins["6-8 LPA"].count += 1;
      else if (pVal >= 8.0 && pVal < 10.0) packageBins["8-10 LPA"].count += 1;
      else if (pVal >= 10.0 && pVal < 15.0) packageBins["10-15 LPA"].count += 1;
      else if (pVal >= 15.0 && pVal < 20.0) packageBins["15-20 LPA"].count += 1;
      else if (pVal >= 20.0) packageBins["20+ LPA"].count += 1;
    });

    const packageAnalyticsData = Object.values(packageBins);

    res.status(200).json({
      success: true,
      data: {
        stats,
        drives,
        companies,
        placementTrendData,
        departmentPlacementData,
        packageAnalyticsData,
        applications: finalApplications,
        offers: finalOffers,
        interviews,
        placementNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const { name, industry, hrContact, email, phone, package: packageAmount, previousYearHires, hiringStatus } = req.body;

    if (!name || !name.trim()) {
      const error = new Error('Company name is required');
      error.statusCode = 400;
      return next(error);
    }

    const { data: existing } = await supabase
      .from('placement_companies')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle();

    if (existing) {
      const error = new Error(`Company "${name.trim()}" already exists`);
      error.statusCode = 409;
      return next(error);
    }

    const { data, error } = await supabase
      .from('placement_companies')
      .insert([{
        name: name.trim(),
        industry: industry || 'Technology',
        hr_contact: hrContact || 'HR Manager',
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@company.com`,
        phone: phone || '9876543210',
        package_amount: packageAmount || '8.0 LPA',
        previous_hires: parseInt(previousYearHires) || 0,
        is_active: hiringStatus === 'Inactive' ? false : true
      }])
      .select()
      .single();

    if (error) throw error;

    const formatted = {
      id: data.id,
      name: data.name,
      industry: data.industry,
      hrContact: data.hr_contact,
      email: data.email,
      phone: data.phone,
      package: data.package_amount,
      hiringStatus: data.is_active ? 'Active' : 'Inactive',
      previousYearHires: data.previous_hires
    };

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, industry, hrContact, email, phone, package: packageAmount, previousYearHires, hiringStatus } = req.body;

    const { data: exists, error: checkErr } = await supabase
      .from('placement_companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (!exists) {
      const error = new Error('Company not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (hrContact !== undefined) updateData.hr_contact = hrContact;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (packageAmount !== undefined) updateData.package_amount = packageAmount;
    if (previousYearHires !== undefined) updateData.previous_hires = parseInt(previousYearHires) || 0;
    if (hiringStatus !== undefined) updateData.is_active = hiringStatus === 'Inactive' ? false : true;

    const { data, error } = await supabase
      .from('placement_companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const formatted = {
      id: data.id,
      name: data.name,
      industry: data.industry,
      hrContact: data.hr_contact,
      email: data.email,
      phone: data.phone,
      package: data.package_amount,
      hiringStatus: data.is_active ? 'Active' : 'Inactive',
      previousYearHires: data.previous_hires
    };

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check fallback list first
    const fallbackIdx = fallbackCompanies.findIndex(c => c.id === id);
    if (fallbackIdx !== -1) {
      fallbackCompanies.splice(fallbackIdx, 1);
      return res.status(200).json({
        success: true,
        message: 'Company deleted successfully from fallback list'
      });
    }

    const { data: exists, error: checkErr } = await supabase
      .from('placement_companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkErr) throw checkErr;
    
    // If not found in DB but exists is null, it's already deleted or not found
    if (exists) {
      const { error } = await supabase
        .from('placement_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export function calculateStudentEligibility(student, criteria = {}) {
  const reasons = [];

  const batch = criteria.batch || criteria.eligibility_batch || 'All';
  let branches = [];
  try {
    branches = criteria.branches ? (Array.isArray(criteria.branches) ? criteria.branches : [criteria.branches]) : (criteria.eligibility_departments ? (typeof criteria.eligibility_departments === 'string' ? JSON.parse(criteria.eligibility_departments) : criteria.eligibility_departments) : []);
  } catch (e) {
    branches = [];
  }

  const minCgpa = criteria.minCgpa !== undefined ? parseFloat(criteria.minCgpa) : (criteria.eligibility_min_cgpa !== undefined ? parseFloat(criteria.eligibility_min_cgpa) : 0);
  const maxBacklogs = criteria.maxBacklogs !== undefined ? parseInt(criteria.maxBacklogs) : (criteria.eligibility_max_backlogs !== undefined ? parseInt(criteria.eligibility_max_backlogs) : 100);
  const gender = criteria.gender || criteria.eligibility_gender || 'All';
  let skills = [];
  try {
    skills = Array.isArray(criteria.skills) ? criteria.skills : (criteria.eligibility_skills ? (typeof criteria.eligibility_skills === 'string' ? JSON.parse(criteria.eligibility_skills) : criteria.eligibility_skills) : []);
  } catch (e) {
    skills = [];
  }

  const graduationYear = criteria.graduationYear ? Number(criteria.graduationYear) : (criteria.eligibility_graduation_year ? Number(criteria.eligibility_graduation_year) : null);

  const studentBatch = student.batch || '2026';
  const studentBranch = student.department || student.branch || 'CSE';
  const studentCgpa = parseFloat(student.cgpa) || 8.0;
  const studentBacklogs = parseInt(student.backlogs) || 0;
  const studentGender = student.gender || 'Male';
  const studentYear = student.graduationYear ? Number(student.graduationYear) : 2026;
  const studentSkills = Array.isArray(student.skills) ? student.skills.map(s => String(s).toLowerCase()) : ['python', 'sql', 'react'];

  if (batch && batch !== 'All' && studentBatch !== batch) {
    reasons.push(`Batch ${batch} required (Your Batch: ${studentBatch})`);
  }

  if (graduationYear && studentYear !== graduationYear) {
    reasons.push(`Graduation Year ${graduationYear} required (Your Year: ${studentYear})`);
  }

  if (branches && Array.isArray(branches) && branches.length > 0 && !branches.includes('All')) {
    if (!branches.some(b => String(b).trim().toLowerCase() === String(studentBranch).trim().toLowerCase())) {
      reasons.push(`Branch ${branches.join(', ')} required (Your Branch: ${studentBranch})`);
    }
  }

  if (minCgpa > 0 && studentCgpa < minCgpa) {
    reasons.push(`Min CGPA ${minCgpa} required (Your CGPA: ${studentCgpa.toFixed(2)})`);
  }

  if (maxBacklogs < 100 && studentBacklogs > maxBacklogs) {
    reasons.push(`Active Backlogs must be <= ${maxBacklogs} (Your Active Backlogs: ${studentBacklogs})`);
  }

  if (gender && gender !== 'All' && studentGender.toLowerCase() !== gender.toLowerCase()) {
    reasons.push(`Gender requirement: ${gender} (Your Gender: ${studentGender})`);
  }

  if (skills && Array.isArray(skills) && skills.length > 0) {
    const missing = skills.filter(reqSkill => !studentSkills.includes(String(reqSkill).toLowerCase()));
    if (missing.length > 0) {
      reasons.push(`Required Skills missing: ${missing.join(', ')}`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
}

export const createDrive = async (req, res, next) => {
  try {
    const {
      company,
      role,
      date,
      venue,
      applicationDeadline,
      status,
      packageMin,
      packageMax,
      eligibilityMinCgpa,
      eligibilityDepartments,
      eligibilityBatch,
      eligibilityMaxBacklogs,
      eligibilityGender,
      eligibilitySkills,
      eligibilityGraduationYear
    } = req.body;

    if (!company || !role) {
      const error = new Error('Company name and role are required');
      error.statusCode = 400;
      return next(error);
    }

    const { data: existingDrive } = await supabase
      .from('placements')
      .select('id')
      .ilike('company', company.trim())
      .ilike('position', role.trim())
      .maybeSingle();

    if (existingDrive) {
      const error = new Error(`A placement drive for ${company.trim()} (${role.trim()}) already exists`);
      error.statusCode = 409;
      return next(error);
    }

    // Attempt to find company_id from name matching
    const { data: comp } = await supabase
      .from('placement_companies')
      .select('id')
      .eq('name', company)
      .maybeSingle();

    const companyId = comp ? comp.id : null;

    const { data, error } = await supabase
      .from('placements')
      .insert([{
        company,
        position: role,
        company_id: companyId,
        drive_date: date || new Date().toISOString().split('T')[0],
        venue: venue || 'Virtual',
        deadline: applicationDeadline || new Date().toISOString().split('T')[0],
        status: (status || 'upcoming').toLowerCase(),
        package_min: parseFloat(packageMin) || 6.0,
        package_max: parseFloat(packageMax) || 8.0,
        eligibility_min_cgpa: parseFloat(eligibilityMinCgpa) || 7.0,
        eligibility_departments: JSON.stringify(eligibilityDepartments || ['CSE', 'ECE']),
        eligibility_batch: eligibilityBatch || '2026',
        eligibility_max_backlogs: eligibilityMaxBacklogs !== undefined ? parseInt(eligibilityMaxBacklogs) : 0,
        eligibility_gender: eligibilityGender || 'All',
        eligibility_skills: JSON.stringify(eligibilitySkills || []),
        eligibility_graduation_year: eligibilityGraduationYear || 2026,
        applied_students: JSON.stringify([])
      }])
      .select()
      .single();

    if (error) throw error;

    // Send multi-channel notifications to ONLY eligible students in the background
    (async () => {
      try {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('is_active', true);

        if (students && students.length > 0) {
          const { generatePlacementDriveTemplate } = await import('../utils/emailTemplates.js');
          const { default: sendEmail } = await import('../utils/sendEmail.js');

          let eligibleCount = 0;

          for (const student of students) {
            const eligibility = calculateStudentEligibility(student, data);
            
            // STRICT RULE: DO NOT NOTIFY INELIGIBLE STUDENTS
            if (!eligibility.isEligible) continue;

            eligibleCount++;
            const notifId = `SN-PLACEMENT-${data.id}-${student.id}`;
            
            // 1. In-App Notification
            await supabase
              .from('student_notifications')
              .insert([{
                id: notifId,
                student_id: student.id,
                title: `New Placement Drive: ${data.company}`,
                message: `${data.company} is hiring for ${data.position}. Deadline: ${data.deadline ? new Date(data.deadline).toLocaleDateString() : 'Open'}.`,
                type: 'Placement',
                priority: 'High',
                time: 'Just now',
                unread: true
              }]);

            // 2. Email & Outlook Calendar Attachment Notification
            if (student.email) {
              const emailHtml = generatePlacementDriveTemplate(
                student.full_name || 'Student',
                data.company,
                data.position,
                data.drive_date,
                data.deadline
              );

              sendEmail({
                to: student.email,
                subject: `Placement Drive: ${data.company} (${data.position}) - Outlook & College Email Alert`,
                html: emailHtml
              }).catch(err => console.error(`Error emailing student ${student.email}:`, err));
            }
          }

          // 3. Record Notification History Audit Log
          try {
            await supabase
              .from('placement_notification_history')
              .insert([{
                id: `PNH_${data.id}_${Date.now()}`,
                drive_id: data.id,
                company: data.company,
                role: data.position,
                title: `Recruitment Announcement: ${data.company}`,
                channels: JSON.stringify(['In-App', 'College Email', 'Outlook']),
                eligible_count: eligibleCount,
                total_students: students.length,
                created_at: new Date().toISOString()
              }]);
          } catch (histErr) {
            console.warn('Notification history log:', histErr.message);
          }
        }
      } catch (err) {
        console.error('Error dispatching recruitment drive notifications:', err);
      }
    })();

    let count = 0;
    try {
      const arr = typeof data.applied_students === 'string' ? JSON.parse(data.applied_students) : (data.applied_students || []);
      count = Array.isArray(arr) ? arr.length : 0;
    } catch (e) {
      count = 0;
    }

    const formatted = {
      id: data.id,
      company: data.company,
      role: data.position,
      date: data.drive_date ? new Date(data.drive_date).toISOString().split('T')[0] : "TBD",
      venue: data.venue || "Virtual",
      applicationDeadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "Closed",
      status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : "Upcoming",
      studentCount: count,
      rounds: 3
    };

    res.status(201).json({
      success: true,
      message: 'Drive created successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const updateDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, role, date, venue, applicationDeadline, status, packageMin, packageMax, eligibilityMinCgpa, eligibilityDepartments } = req.body;

    const { data: exists, error: checkErr } = await supabase
      .from('placements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (!exists) {
      const error = new Error('Drive not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData = {};
    if (company !== undefined) {
      updateData.company = company;
      const { data: comp } = await supabase
        .from('placement_companies')
        .select('id')
        .eq('name', company)
        .maybeSingle();
      if (comp) updateData.company_id = comp.id;
    }
    if (role !== undefined) updateData.position = role;
    if (date !== undefined) updateData.drive_date = date;
    if (venue !== undefined) updateData.venue = venue;
    if (applicationDeadline !== undefined) updateData.deadline = applicationDeadline;
    if (status !== undefined) updateData.status = status.toLowerCase();
    if (packageMin !== undefined) updateData.package_min = parseFloat(packageMin) || 6.0;
    if (packageMax !== undefined) updateData.package_max = parseFloat(packageMax) || 8.0;
    if (eligibilityMinCgpa !== undefined) updateData.eligibility_min_cgpa = parseFloat(eligibilityMinCgpa) || 7.0;
    if (eligibilityDepartments !== undefined) updateData.eligibility_departments = JSON.stringify(eligibilityDepartments);

    const { data, error } = await supabase
      .from('placements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    let count = 0;
    try {
      const arr = typeof data.applied_students === 'string' ? JSON.parse(data.applied_students) : (data.applied_students || []);
      count = Array.isArray(arr) ? arr.length : 0;
    } catch (e) {
      count = 0;
    }

    const formatted = {
      id: data.id,
      company: data.company,
      role: data.position,
      date: data.drive_date ? new Date(data.drive_date).toISOString().split('T')[0] : "TBD",
      venue: data.venue || "Virtual",
      applicationDeadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "Closed",
      status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : "Upcoming",
      studentCount: count,
      rounds: 3
    };

    res.status(200).json({
      success: true,
      message: 'Drive updated successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const {
      studentName,
      studentId,
      company,
      role,
      appliedDate,
      status,
      score,
      round,
      package: pkg,
      joiningDate,
      resumeUrl,
      coverNote,
      phone,
      linkedinUrl,
      portfolioUrl
    } = req.body;

    if (!studentName || !studentId || !company || !role) {
      const error = new Error('Student Name, Student ID, Company, and Role are required');
      error.statusCode = 400;
      return next(error);
    }

    // Valid statuses: Draft, Submitted, Verified, Rejected, Withdrawn
    const validStatuses = ['Draft', 'Submitted', 'Verified', 'Rejected', 'Withdrawn', 'Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Released'];
    const appStatus = status && validStatuses.includes(status) ? status : 'Submitted';

    // Find matching drive
    const { data: drive } = await supabase
      .from('placements')
      .select('*')
      .eq('company', company)
      .eq('position', role)
      .maybeSingle();

    // STRICT ELIGIBILITY GUARD: Fetch student profile & calculate eligibility
    let studentProfile = {
      id: studentId,
      full_name: studentName,
      department: req.body.department || 'CSE',
      cgpa: req.body.cgpa !== undefined ? parseFloat(req.body.cgpa) : 8.0,
      backlogs: req.body.backlogs !== undefined ? parseInt(req.body.backlogs) : 0,
      batch: req.body.batch || '2026',
      gender: req.body.gender || 'Male',
      graduationYear: req.body.graduationYear || 2026,
      skills: req.body.skills || ['python', 'sql', 'react']
    };

    if (studentId) {
      const { data: dbStu } = await supabase
        .from('students')
        .select('*')
        .or(`id.eq.${studentId},roll_number.eq.${studentId}`)
        .maybeSingle();

      if (dbStu) {
        studentProfile = { ...studentProfile, ...dbStu };
      }
    }

    if (drive) {
      const eligibility = calculateStudentEligibility(studentProfile, drive);
      if (!eligibility.isEligible) {
        const error = new Error(`Ineligible to apply for ${company} (${role}). Reason(s): ${eligibility.reasons.join('; ')}`);
        error.statusCode = 403;
        return next(error);
      }
    }

    if (!drive) {
      // Find company_id if exists
      const { data: comp } = await supabase
        .from('placement_companies')
        .select('id')
        .eq('name', company)
        .maybeSingle();

      const newApp = {
        student_name: studentName,
        student_id: studentId,
        applied_date: appliedDate || new Date().toISOString().split('T')[0],
        status: appStatus,
        score: parseInt(score) || 0,
        round: parseInt(round) || 1,
        package: pkg || null,
        joining_date: joiningDate || null,
        resume_url: resumeUrl || null,
        cover_note: coverNote || null,
        phone: phone || null,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        created_at: new Date().toISOString()
      };

      const { data: newDrive, error: createErr } = await supabase
        .from('placements')
        .insert([{
          company,
          position: role,
          company_id: comp ? comp.id : null,
          drive_date: new Date().toISOString(),
          venue: 'Virtual',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          applied_students: JSON.stringify([newApp])
        }])
        .select()
        .single();

      if (createErr) throw createErr;

      sendPlacementStatusNotification(studentId, company, role, appStatus);

      return res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: newApp
      });
    }

    // Drive exists -> Check deadline locking
    const isDeadlinePassed = drive.deadline ? new Date() > new Date(drive.deadline) : false;

    let appliedList = [];
    try {
      appliedList = typeof drive.applied_students === 'string' ? JSON.parse(drive.applied_students) : (drive.applied_students || []);
    } catch (e) {
      appliedList = [];
    }

    // STRICT UNIQUE CHECK: Find existing application for this student
    const existingIdx = appliedList.findIndex(a => 
      (a.student_id && a.student_id.toLowerCase() === studentId.toLowerCase()) ||
      (a.student_name && a.student_name.toLowerCase() === studentName.toLowerCase())
    );

    if (existingIdx !== -1) {
      // Existing application found!
      if (isDeadlinePassed) {
        const error = new Error('Application is locked because the drive deadline has passed. Modifying application is not allowed.');
        error.statusCode = 403;
        return next(error);
      }

      // UPDATE existing application record (NEVER INSERT SECOND RECORD)
      appliedList[existingIdx] = {
        ...appliedList[existingIdx],
        status: appStatus,
        score: score !== undefined ? parseInt(score) : appliedList[existingIdx].score,
        round: round !== undefined ? parseInt(round) : appliedList[existingIdx].round,
        package: pkg || appliedList[existingIdx].package,
        joining_date: joiningDate || appliedList[existingIdx].joining_date,
        resume_url: resumeUrl !== undefined ? resumeUrl : appliedList[existingIdx].resume_url,
        cover_note: coverNote !== undefined ? coverNote : appliedList[existingIdx].cover_note,
        phone: phone !== undefined ? phone : appliedList[existingIdx].phone,
        linkedin_url: linkedinUrl !== undefined ? linkedinUrl : appliedList[existingIdx].linkedin_url,
        portfolio_url: portfolioUrl !== undefined ? portfolioUrl : appliedList[existingIdx].portfolio_url,
        updated_at: new Date().toISOString()
      };

      const { error: updateErr } = await supabase
        .from('placements')
        .update({ applied_students: JSON.stringify(appliedList) })
        .eq('id', drive.id);

      if (updateErr) throw updateErr;

      sendPlacementStatusNotification(studentId, company, role, appStatus);

      return res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: appliedList[existingIdx]
      });
    }

    // No existing application -> Check deadline before inserting new
    if (isDeadlinePassed) {
      const error = new Error('Application deadline has passed. New applications cannot be submitted.');
      error.statusCode = 403;
      return next(error);
    }

    // Insert NEW application record into appliedList
    const newApp = {
      student_name: studentName,
      student_id: studentId,
      applied_date: appliedDate || new Date().toISOString().split('T')[0],
      status: appStatus,
      score: parseInt(score) || 0,
      round: parseInt(round) || 1,
      package: pkg || null,
      joining_date: joiningDate || null,
      resume_url: resumeUrl || null,
      cover_note: coverNote || null,
      phone: phone || null,
      linkedin_url: linkedinUrl || null,
      portfolio_url: portfolioUrl || null,
      created_at: new Date().toISOString()
    };

    appliedList.push(newApp);

    const { error: updateErr } = await supabase
      .from('placements')
      .update({ applied_students: JSON.stringify(appliedList) })
      .eq('id', drive.id);

    if (updateErr) throw updateErr;

    sendPlacementStatusNotification(studentId, company, role, appStatus);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApp
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, role, studentId, status, score, round, package: pkg, joiningDate } = req.body;

    let targetCompany = company;
    let targetRole = role;
    let targetStudentId = studentId || id;

    if (id && id.includes('_')) {
      const parts = id.split('_');
      const driveId = parts[1];
      const { data: d } = await supabase
        .from('placements')
        .select('*')
        .eq('id', driveId)
        .maybeSingle();
      if (d) {
        targetCompany = d.company;
        targetRole = d.position;
      }
    }

    if (!targetCompany || !targetRole) {
      const error = new Error('Company and Role are required to locate the application');
      error.statusCode = 400;
      return next(error);
    }

    const { data: drive } = await supabase
      .from('placements')
      .select('*')
      .eq('company', targetCompany)
      .eq('position', targetRole)
      .maybeSingle();

    if (!drive) {
      const error = new Error('Application drive not found');
      error.statusCode = 404;
      return next(error);
    }

    let appliedList = [];
    try {
      appliedList = typeof drive.applied_students === 'string' ? JSON.parse(drive.applied_students) : (drive.applied_students || []);
    } catch (e) {
      appliedList = [];
    }

    const idx = appliedList.findIndex(a => 
      (a.student_id && targetStudentId && a.student_id.toLowerCase() === targetStudentId.toLowerCase()) ||
      (a.student_name && targetStudentId && a.student_name.toLowerCase() === targetStudentId.toLowerCase())
    );

    if (idx === -1) {
      const error = new Error(`Student ${targetStudentId} not found in the applied list of drive ${targetCompany}`);
      error.statusCode = 404;
      return next(error);
    }

    if (status !== undefined) appliedList[idx].status = status;
    if (score !== undefined) appliedList[idx].score = parseInt(score);
    if (round !== undefined) appliedList[idx].round = parseInt(round);
    if (pkg !== undefined) appliedList[idx].package = pkg;
    if (joiningDate !== undefined) appliedList[idx].joining_date = joiningDate;

    const { error: updateErr } = await supabase
      .from('placements')
      .update({ applied_students: JSON.stringify(appliedList) })
      .eq('id', drive.id);

    if (updateErr) throw updateErr;

    // Trigger notification
    const studentNotifyId = appliedList[idx].student_id || targetStudentId;
    if (studentNotifyId && status) {
      sendPlacementStatusNotification(studentNotifyId, targetCompany, targetRole, status);
    }

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: appliedList[idx]
    });
  } catch (error) {
    next(error);
  }
};

export const createInterview = async (req, res, next) => {
  try {
    const { studentName, company, round, date, time, mode, venue, status } = req.body;

    if (!studentName || !company) {
      const error = new Error('Student name and Company are required');
      error.statusCode = 400;
      return next(error);
    }

    const { data: stu } = await supabase
      .from('students')
      .select('id, user_id, email, parent_email')
      .ilike('full_name', studentName)
      .maybeSingle();

    const { data: drive } = await supabase
      .from('placements')
      .select('id')
      .eq('company', company)
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from('placement_interviews')
      .insert([{
        student: stu ? stu.id : null,
        student_name: studentName,
        company_name: company,
        drive_id: drive ? drive.id : null,
        round: round ? round.toString() : '1',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '10:00 AM',
        mode: mode || 'Online',
        venue: venue || 'Video Call',
        status: status || 'Scheduled'
      }])
      .select()
      .single();

    if (error) throw error;

    if (stu) {
      dispatchNotification({
        userId: stu.user_id,
        studentId: stu.id,
        email: stu.email,
        parentEmail: stu.parent_email,
        type: 'Placement',
        title: `Interview Scheduled: ${company}`,
        message: `Dear ${studentName}, your interview for ${company} (Round ${round || 1}) has been scheduled for ${date || new Date().toISOString().split('T')[0]} at ${time || '10:00 AM'}. Mode: ${mode || 'Online'}. Venue/Link: ${venue || 'Video Call'}.`,
        priority: 'High'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: {
        id: data.id,
        studentName: data.student_name,
        company: data.company_name,
        round: parseInt(data.round) || 1,
        date: data.date,
        time: data.time,
        mode: data.mode,
        venue: data.venue,
        panelists: ["Dr. Rajesh Verma", "Priya Sharma"],
        status: data.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentName, company, round, date, time, mode, venue, status, feedbackComments, feedbackRating } = req.body;

    const { data: exists, error: checkErr } = await supabase
      .from('placement_interviews')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (!exists) {
      const error = new Error('Interview not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData = {};
    if (studentName !== undefined) updateData.student_name = studentName;
    if (company !== undefined) updateData.company_name = company;
    if (round !== undefined) updateData.round = round.toString();
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (mode !== undefined) updateData.mode = mode;
    if (venue !== undefined) updateData.venue = venue;
    if (status !== undefined) updateData.status = status;
    if (feedbackComments !== undefined) updateData.feedback_comments = feedbackComments;
    if (feedbackRating !== undefined) updateData.feedback_rating = parseInt(feedbackRating);

    const { data, error } = await supabase
      .from('placement_interviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (status === 'Completed' || status === 'Cancelled' || feedbackComments) {
      const { data: drive } = await supabase
        .from('placements')
        .select('*')
        .eq('company', data.company_name)
        .limit(1)
        .maybeSingle();

      if (drive) {
        let appliedList = [];
        try {
          appliedList = typeof drive.applied_students === 'string' ? JSON.parse(drive.applied_students) : (drive.applied_students || []);
        } catch (e) {
          appliedList = [];
        }

        const idx = appliedList.findIndex(a => a.student_name.toLowerCase() === data.student_name.toLowerCase());
        if (idx !== -1) {
          if (status === 'Completed') {
            appliedList[idx].status = 'Shortlisted';
          }
          if (feedbackComments) {
            appliedList[idx].score = parseInt(feedbackRating) * 20 || appliedList[idx].score;
          }
          await supabase
            .from('placements')
            .update({ applied_students: JSON.stringify(appliedList) })
            .eq('id', drive.id);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: {
        id: data.id,
        studentName: data.student_name,
        company: data.company_name,
        round: parseInt(data.round) || 1,
        date: data.date,
        time: data.time,
        mode: data.mode,
        venue: data.venue,
        panelists: ["Dr. Rajesh Verma", "Priya Sharma"],
        status: data.status,
        feedbackComments: data.feedback_comments,
        feedbackRating: data.feedback_rating
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainingPrograms = async (req, res, next) => {
  try {
    let { data, error } = await supabase
      .from('placement_training')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Seed default programs if none exist
    if (!data || data.length === 0) {
      const defaults = [
        { name: "Full Stack Web Development Boot Camp", type: "Training", date: "2026-06-10", time: "09:00 AM", duration: "120 min", enrolled_students: 150, completed: 140, pass_percentage: 95 },
        { name: "Advanced Data Structures & Algorithms", type: "Training", date: "2026-06-15", time: "02:00 PM", duration: "90 min", enrolled_students: 200, completed: 180, pass_percentage: 90 },
        { name: "SDE Mock Assessment - Coding Round", type: "Assessment", date: "2026-06-20", time: "10:00 AM", duration: "60 min", enrolled_students: 250, completed: 240, pass_percentage: 85 },
        { name: "Technical Mock Interview Rounds", type: "Mock", date: "2026-06-25", time: "11:00 AM", duration: "45 min", enrolled_students: 120, completed: 110, pass_percentage: 92 }
      ];
      
      const { data: inserted, error: seedErr } = await supabase
        .from('placement_training')
        .insert(defaults)
        .select();

      if (seedErr) throw seedErr;
      data = inserted;
    }

    const formatted = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
      time: p.time,
      duration: p.duration,
      enrolledStudents: p.enrolled_students || 0,
      completed: p.completed || 0,
      passPercentage: p.pass_percentage || 0
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const createTrainingProgram = async (req, res, next) => {
  try {
    const { name, type, date, time, duration, enrolledStudents, completed, passPercentage } = req.body;

    if (!name || !date || !time) {
      const error = new Error('Name, Date, and Time are required');
      error.statusCode = 400;
      return next(error);
    }

    const { data, error } = await supabase
      .from('placement_training')
      .insert([{
        name,
        type: type || 'Training',
        date,
        time,
        duration: duration || '60 min',
        enrolled_students: parseInt(enrolledStudents) || 120,
        completed: parseInt(completed) || 0,
        pass_percentage: parseInt(passPercentage) || 0
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Training program scheduled successfully',
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        time: data.time,
        duration: data.duration,
        enrolledStudents: data.enrolled_students || 0,
        completed: data.completed || 0,
        passPercentage: data.pass_percentage || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrainingProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, date, time, duration, enrolledStudents, completed, passPercentage } = req.body;

    const { data: exists, error: checkErr } = await supabase
      .from('placement_training')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (checkErr) throw checkErr;
    if (!exists) {
      const error = new Error('Training program not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (duration !== undefined) updateData.duration = duration;
    if (enrolledStudents !== undefined) updateData.enrolled_students = parseInt(enrolledStudents);
    if (completed !== undefined) updateData.completed = parseInt(completed);
    if (passPercentage !== undefined) updateData.pass_percentage = parseInt(passPercentage);

    const { data, error } = await supabase
      .from('placement_training')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        time: data.time,
        duration: data.duration,
        enrolledStudents: data.enrolled_students || 0,
        completed: data.completed || 0,
        passPercentage: data.pass_percentage || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPlacementCalendar = async (req, res, next) => {
  try {
    const [drivesRes, interviewsRes] = await Promise.all([
      supabase.from('placements').select('*'),
      supabase.from('placement_interviews').select('*')
    ]);

    const events = [];

    if (drivesRes.data) {
      drivesRes.data.forEach((d) => {
        if (d.drive_date) {
          events.push({
            id: `CAL_DRV_${d.id}`,
            title: `${d.company} Drive (${d.position})`,
            date: new Date(d.drive_date).toISOString().split('T')[0],
            type: 'Drive',
            company: d.company,
            venue: d.venue || 'Virtual',
            details: `Recruitment drive for ${d.position}. Deadline: ${d.deadline ? new Date(d.deadline).toISOString().split('T')[0] : 'N/A'}`
          });
        }
        if (d.deadline) {
          events.push({
            id: `CAL_DL_${d.id}`,
            title: `Deadline: ${d.company}`,
            date: new Date(d.deadline).toISOString().split('T')[0],
            type: 'Deadline',
            company: d.company,
            venue: 'Online Portal',
            details: `Application deadline for ${d.company} (${d.position})`
          });
        }
      });
    }

    if (interviewsRes.data) {
      interviewsRes.data.forEach((i) => {
        if (i.date) {
          events.push({
            id: `CAL_INT_${i.id}`,
            title: `Interview: ${i.student_name} (${i.company_name})`,
            date: new Date(i.date).toISOString().split('T')[0],
            type: 'Interview',
            company: i.company_name,
            venue: i.venue || 'Online',
            details: `Round ${i.round} interview at ${i.time || '10:00 AM'}`
          });
        }
      });
    }

    // Default seeded fallback events if list is empty
    if (events.length === 0) {
      events.push(
        { id: "CAL_01", title: "Google India Drive", date: "2026-06-15", type: "Drive", company: "Google India", venue: "Main Auditorium", details: "Software Engineer hiring drive" },
        { id: "CAL_02", title: "Microsoft Deadline", date: "2026-06-15", type: "Deadline", company: "Microsoft India", venue: "Online Portal", details: "Last date to apply for SDE-II" },
        { id: "CAL_03", title: "Interview: Aarav Sharma", date: "2026-06-18", type: "Interview", company: "Google India", venue: "Video Call", details: "Round 2 Technical Interview" },
        { id: "CAL_04", title: "Amazon India Drive", date: "2026-06-08", type: "Drive", company: "Amazon India", venue: "Conference Hall A", details: "SDE Associate hiring drive" },
        { id: "CAL_05", title: "Goldman Sachs Analyst Drive", date: "2026-06-22", type: "Drive", company: "Goldman Sachs", venue: "Finance Center", details: "Analyst profile recruitment" }
      );
    }

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const getPlacementNotifications = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('placement_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const fallbackNotifs = [
        { id: "PN001", title: "New recruitment drive created: Goldman Sachs Analyst", time: "2h ago", type: "Drive", unread: true },
        { id: "PN002", title: "Interview scheduled: Aarav Sharma with Google India", time: "5h ago", type: "Interview", unread: true },
        { id: "PN003", title: "Offer letter released: Sofia Rodriguez - Infosys", time: "1d ago", type: "Offer", unread: false },
        { id: "PN004", title: "Application deadline tomorrow: Microsoft India", time: "2d ago", type: "Deadline", unread: false },
        { id: "PN005", title: "Resume verification pending for 12 applicants", time: "3d ago", type: "Resume", unread: false }
      ];
      return res.status(200).json({ success: true, data: fallbackNotifs });
    }

    const formatted = data.map(n => ({
      id: n.id,
      title: n.title,
      time: n.time || "Just now",
      type: n.type || "Placement",
      unread: Boolean(n.unread)
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await supabase.from('placement_notifications').update({ unread: false }).neq('id', '');
    } else {
      await supabase.from('placement_notifications').update({ unread: false }).eq('id', id);
    }

    res.status(200).json({
      success: true,
      message: 'Notification(s) marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export const sendDriveReminder = async (req, res, next) => {
  try {
    const { driveId, reminderType, customMessage, target } = req.body;

    const { data: drive, error } = await supabase
      .from('placements')
      .select('*')
      .eq('id', driveId)
      .maybeSingle();

    if (error || !drive) {
      const err = new Error('Placement drive not found');
      err.statusCode = 404;
      return next(err);
    }

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    let appliedList = [];
    try {
      appliedList = typeof drive.applied_students === 'string' ? JSON.parse(drive.applied_students) : (drive.applied_students || []);
    } catch (e) {
      appliedList = [];
    }

    let notifiedCount = 0;
    const allStudents = students || [];

    const { generatePlacementDriveTemplate } = await import('../utils/emailTemplates.js');
    const { default: sendEmail } = await import('../utils/sendEmail.js');

    for (const student of allStudents) {
      const eligibility = calculateStudentEligibility(student, drive);
      if (!eligibility.isEligible) continue; // STRICTLY SKIP INELIGIBLE

      const hasApplied = appliedList.some(a => 
        (a.student_id && a.student_id.toLowerCase() === student.id.toLowerCase()) ||
        (a.student_name && student.full_name && a.student_name.toLowerCase() === student.full_name.toLowerCase())
      );

      if (target === 'unapplied' && hasApplied) continue;

      notifiedCount++;
      const notifId = `REM-${drive.id}-${student.id}-${Date.now()}`;
      const title = reminderType === 'Deadline'
        ? `⚠️ Application Deadline Warning: ${drive.company}`
        : `Reminder: ${drive.company} Recruitment Drive`;

      const msg = customMessage || `${drive.company} application deadline is ${drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'approaching'}. Complete your application now.`;

      // 1. In-App Notification
      await supabase.from('student_notifications').insert([{
        id: notifId,
        student_id: student.id,
        title,
        message: msg,
        type: 'Placement',
        priority: 'High',
        time: 'Just now',
        unread: true
      }]);

      // 2. Email & Outlook Alert
      if (student.email) {
        const emailHtml = generatePlacementDriveTemplate(
          student.full_name || 'Student',
          drive.company,
          drive.position,
          drive.drive_date,
          drive.deadline
        );

        sendEmail({
          to: student.email,
          subject: `${title} - College Email & Outlook Alert`,
          html: emailHtml
        }).catch(err => console.error(`Error emailing student ${student.email}:`, err));
      }
    }

    // Record Notification History Audit Entry
    try {
      await supabase.from('placement_notification_history').insert([{
        id: `PNH_REM_${drive.id}_${Date.now()}`,
        drive_id: drive.id,
        company: drive.company,
        role: drive.position,
        title: `${reminderType || 'General'} Reminder: ${drive.company}`,
        channels: JSON.stringify(['In-App', 'College Email', 'Outlook']),
        eligible_count: notifiedCount,
        total_students: allStudents.length,
        created_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.warn('History log error:', e.message);
    }

    res.status(200).json({
      success: true,
      message: `Reminder sent to ${notifiedCount} eligible candidates.`,
      notifiedCount
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationHistory = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('placement_notification_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const fallbackHistory = [
        {
          id: "PNH_001",
          company: "Google India",
          role: "Software Engineer",
          title: "Drive Announcement: Google India",
          channels: ["In-App", "College Email", "Outlook"],
          eligible_count: 142,
          total_students: 217,
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        },
        {
          id: "PNH_002",
          company: "Microsoft India",
          role: "SDE-II",
          title: "⚠️ Application Deadline Warning: Microsoft India",
          channels: ["In-App", "College Email", "Outlook"],
          eligible_count: 98,
          total_students: 217,
          created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        },
        {
          id: "PNH_003",
          company: "Amazon India",
          role: "SDE Associate",
          title: "Drive Announcement: Amazon India",
          channels: ["In-App", "College Email"],
          eligible_count: 180,
          total_students: 217,
          created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
        }
      ];
      return res.status(200).json({ success: true, data: fallbackHistory });
    }

    const formatted = data.map(h => ({
      id: h.id,
      company: h.company,
      role: h.role,
      title: h.title,
      channels: typeof h.channels === 'string' ? JSON.parse(h.channels) : (h.channels || ['In-App']),
      eligible_count: h.eligible_count,
      total_students: h.total_students,
      created_at: h.created_at
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentApplications = async (req, res, next) => {
  try {
    const studentId = req.query.studentId || req.user?.id || 'CS100001';

    const { data: drives, error } = await supabase
      .from('placements')
      .select('*');

    if (error) throw error;

    const studentApps = [];

    (drives || []).forEach(drive => {
      let appliedList = [];
      try {
        appliedList = typeof drive.applied_students === 'string' ? JSON.parse(drive.applied_students) : (drive.applied_students || []);
      } catch (e) {
        appliedList = [];
      }

      const match = appliedList.find(a => 
        (a.student_id && a.student_id.toLowerCase() === studentId.toLowerCase()) ||
        (a.student_name && a.student_name.toLowerCase() === studentId.toLowerCase())
      );

      const isDeadlinePassed = drive.deadline ? new Date() > new Date(drive.deadline) : false;

      if (match) {
        studentApps.push({
          id: `APP_${drive.id}_${studentId}`,
          driveId: drive.id,
          company: drive.company,
          role: drive.position,
          driveDate: drive.drive_date ? new Date(drive.drive_date).toISOString().split('T')[0] : 'TBD',
          deadline: drive.deadline ? new Date(drive.deadline).toISOString().split('T')[0] : 'Open',
          isDeadlinePassed,
          studentId: match.student_id || studentId,
          studentName: match.student_name || 'Student',
          appliedDate: match.applied_date || new Date().toISOString().split('T')[0],
          status: match.status || 'Submitted',
          score: match.score || 0,
          round: match.round || 1,
          resumeUrl: match.resume_url || null,
          coverNote: match.cover_note || null,
          phone: match.phone || null,
          linkedinUrl: match.linkedin_url || null,
          portfolioUrl: match.portfolio_url || null,
        });
      }
    });

    res.status(200).json({
      success: true,
      data: studentApps
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawStudentApplication = async (req, res, next) => {
  try {
    const { driveId, studentId } = req.body;

    if (!driveId || !studentId) {
      const error = new Error('driveId and studentId are required');
      error.statusCode = 400;
      return next(error);
    }

    const { data: drive } = await supabase
      .from('placements')
      .select('*')
      .eq('id', driveId)
      .maybeSingle();

    if (!drive) {
      const error = new Error('Placement drive not found');
      error.statusCode = 404;
      return next(error);
    }

    const isDeadlinePassed = drive.deadline ? new Date() > new Date(drive.deadline) : false;
    if (isDeadlinePassed) {
      const error = new Error('Application is locked because drive deadline has passed. Cannot withdraw.');
      error.statusCode = 403;
      return next(error);
    }

    let appliedList = [];
    try {
      appliedList = typeof drive.applied_students === 'string' ? JSON.parse(drive.applied_students) : (drive.applied_students || []);
    } catch (e) {
      appliedList = [];
    }

    const idx = appliedList.findIndex(a => 
      (a.student_id && a.student_id.toLowerCase() === studentId.toLowerCase()) ||
      (a.student_name && a.student_name.toLowerCase() === studentId.toLowerCase())
    );

    if (idx === -1) {
      const error = new Error('Application record not found');
      error.statusCode = 404;
      return next(error);
    }

    appliedList[idx].status = 'Withdrawn';
    appliedList[idx].updated_at = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from('placements')
      .update({ applied_students: JSON.stringify(appliedList) })
      .eq('id', drive.id);

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: appliedList[idx]
    });
  } catch (error) {
    next(error);
  }
};

export const getBatchAnalytics = async (req, res, next) => {
  try {
    const selectedBatch = req.query.batch || '2026';

    // Fetch live drives & companies
    const { data: drives } = await supabase.from('placements').select('*');
    const { data: companies } = await supabase.from('placement_companies').select('*');

    // Aggregate metrics based on selected batch
    const isCurrentBatch = selectedBatch === '2026';
    const isPreviousBatch = selectedBatch === '2025';

    const totalStudents = isCurrentBatch ? 380 : (isPreviousBatch ? 350 : 320);
    const placementTarget = Math.round(totalStudents * 0.95);
    const activePlacementTarget = Math.round(totalStudents * 0.85);
    const campusPlaced = isCurrentBatch ? 245 : (isPreviousBatch ? 230 : 210);
    const alumniPlacement = isCurrentBatch ? 18 : (isPreviousBatch ? 15 : 12);
    const offCampusPlacement = isCurrentBatch ? 22 : (isPreviousBatch ? 20 : 18);
    const totalPlaced = campusPlaced + alumniPlacement + offCampusPlacement;

    const seekingEmployment = activePlacementTarget - totalPlaced > 0 ? activePlacementTarget - totalPlaced : 15;
    const higherStudies = isCurrentBatch ? 42 : (isPreviousBatch ? 38 : 35);
    const entrepreneurship = isCurrentBatch ? 14 : (isPreviousBatch ? 12 : 10);
    const governmentExams = isCurrentBatch ? 9 : (isPreviousBatch ? 8 : 7);
    const medicalLeave = isCurrentBatch ? 2 : 1;
    const remainingStudents = totalStudents - (totalPlaced + higherStudies + entrepreneurship + governmentExams + medicalLeave);

    const placementPercentage = parseFloat(((totalPlaced / activePlacementTarget) * 100).toFixed(1));

    const highestPackage = isCurrentBatch ? 48.0 : (isPreviousBatch ? 44.5 : 38.0);
    const averagePackage = isCurrentBatch ? 10.2 : (isPreviousBatch ? 9.4 : 8.6);
    const medianPackage = isCurrentBatch ? 8.8 : (isPreviousBatch ? 8.0 : 7.5);
    const lowestPackage = isCurrentBatch ? 4.8 : (isPreviousBatch ? 4.2 : 3.8);

    const companiesVisited = isCurrentBatch ? (companies?.length || 52) : (isPreviousBatch ? 46 : 40);
    const totalOffers = isCurrentBatch ? 320 : (isPreviousBatch ? 295 : 265);
    const dreamOffers = isCurrentBatch ? 94 : (isPreviousBatch ? 82 : 70); // 10-20 LPA
    const superDreamOffers = isCurrentBatch ? 28 : (isPreviousBatch ? 22 : 16); // > 20 LPA

    const departmentWise = [
      { department: 'Computer Science & Engineering (CSE)', totalStudents: isCurrentBatch ? 120 : 110, placed: isCurrentBatch ? 112 : 102, placementPct: 93.3, avgPackage: 12.5, highestPackage: 48.0 },
      { department: 'Electronics & Communication (ECE)', totalStudents: isCurrentBatch ? 90 : 85, placed: isCurrentBatch ? 78 : 72, placementPct: 86.7, avgPackage: 9.8, highestPackage: 28.0 },
      { department: 'Information Technology (IT)', totalStudents: isCurrentBatch ? 70 : 65, placed: isCurrentBatch ? 63 : 58, placementPct: 90.0, avgPackage: 10.8, highestPackage: 36.0 },
      { department: 'Electrical & Electronics (EEE)', totalStudents: isCurrentBatch ? 40 : 38, placed: isCurrentBatch ? 32 : 29, placementPct: 80.0, avgPackage: 8.2, highestPackage: 18.0 },
      { department: 'Mechanical Engineering (MECH)', totalStudents: isCurrentBatch ? 35 : 32, placed: isCurrentBatch ? 26 : 23, placementPct: 74.3, avgPackage: 7.5, highestPackage: 14.0 },
      { department: 'Civil Engineering (CIVIL)', totalStudents: isCurrentBatch ? 25 : 20, placed: isCurrentBatch ? 17 : 14, placementPct: 68.0, avgPackage: 6.8, highestPackage: 12.0 },
    ];

    const companyWise = [
      { company: 'Google India', category: 'Software & Cloud', offers: 12, highestPackage: 48.0, avgPackage: 32.5 },
      { company: 'Microsoft India', category: 'Product & Systems', offers: 18, highestPackage: 44.5, avgPackage: 28.0 },
      { company: 'Amazon Development', category: 'E-Commerce & Tech', offers: 24, highestPackage: 36.0, avgPackage: 24.2 },
      { company: 'Goldman Sachs', category: 'FinTech & Banking', offers: 14, highestPackage: 30.0, avgPackage: 22.0 },
      { company: 'Infosys Limited', category: 'IT Services', offers: 65, highestPackage: 9.5, avgPackage: 6.2 },
      { company: 'TCS Digital / Ninja', category: 'IT Services', offers: 78, highestPackage: 11.0, avgPackage: 7.0 },
      { company: 'Accenture India', category: 'Consulting & Tech', offers: 52, highestPackage: 12.0, avgPackage: 6.8 },
      { company: 'Bosch Engineering', category: 'Core & Embedded', offers: 16, highestPackage: 14.0, avgPackage: 8.5 }
    ];

    const packageDistribution = [
      { range: '< 5.0 LPA', count: isCurrentBatch ? 35 : 42, color: '#64748B' },
      { range: '5.0 - 10.0 LPA', count: isCurrentBatch ? 148 : 140, color: '#3B82F6' },
      { range: '10.0 - 20.0 LPA (Dream)', count: dreamOffers, color: '#8B5CF6' },
      { range: '> 20.0 LPA (Super Dream)', count: superDreamOffers, color: '#10B981' }
    ];

    const monthlyTrend = [
      { month: 'Sep', placed: 32, offers: 38, avgPackage: 14.2 },
      { month: 'Oct', placed: 54, offers: 68, avgPackage: 12.8 },
      { month: 'Nov', placed: 48, offers: 56, avgPackage: 10.5 },
      { month: 'Dec', placed: 36, offers: 42, avgPackage: 9.2 },
      { month: 'Jan', placed: 45, offers: 52, avgPackage: 8.8 },
      { month: 'Feb', placed: 38, offers: 44, avgPackage: 8.2 },
      { month: 'Mar', placed: 22, offers: 25, avgPackage: 7.6 }
    ];

    const batchComparison = [
      { batch: '2024 (Historical)', totalStudents: 320, campusPlaced: 240, placementPct: 83.3, avgPackage: 8.6, highestPackage: 38.0 },
      { batch: '2025 (Previous)', totalStudents: 350, campusPlaced: 265, placementPct: 89.0, avgPackage: 9.4, highestPackage: 44.5 },
      { batch: '2026 (Current)', totalStudents: 380, campusPlaced: 285, placementPct: 91.2, avgPackage: 10.2, highestPackage: 48.0 }
    ];

    res.status(200).json({
      success: true,
      data: {
        batchYear: selectedBatch,
        totalStudents,
        placementTarget,
        activePlacementTarget,
        campusPlaced,
        alumniPlacement,
        offCampusPlacement,
        seekingEmployment,
        higherStudies,
        entrepreneurship,
        governmentExams,
        medicalLeave,
        remainingStudents: remainingStudents > 0 ? remainingStudents : 12,
        placementPercentage,
        highestPackage,
        averagePackage,
        medianPackage,
        lowestPackage,
        companiesVisited,
        totalOffers,
        dreamOffers,
        superDreamOffers,
        departmentWise,
        companyWise,
        packageDistribution,
        monthlyTrend,
        batchComparison
      }
    });
  } catch (error) {
    next(error);
  }
};

let inMemoryExemptions = [
  {
    id: "EXM_001",
    studentId: "CS100005",
    studentName: "Aarav Sharma",
    department: "CSE",
    exemptionType: "Higher Studies",
    reason: "Admitted to MS in CS at Carnegie Mellon University (CMU Fall 2026)",
    documentUrl: "https://college.edu/proofs/cmu_admission.pdf",
    status: "Pending",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: "EXM_002",
    studentId: "EC100012",
    studentName: "Priya Patel",
    department: "ECE",
    exemptionType: "Entrepreneurship",
    reason: "Co-founded IoT Startup 'NexusRobotics Tech' (Incorporated Jan 2026)",
    documentUrl: "https://college.edu/proofs/incorporation_cert.pdf",
    status: "Approved",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "EXM_003",
    studentId: "IT100008",
    studentName: "Rohan Verma",
    department: "IT",
    exemptionType: "Government Exams",
    reason: "Selected for GATE 2026 PSU Fast-Track Interview",
    documentUrl: "https://college.edu/proofs/gate_scorecard.pdf",
    status: "Approved",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: "EXM_004",
    studentId: "ME100015",
    studentName: "Ananya Iyer",
    department: "MECH",
    exemptionType: "Medical Leave",
    reason: "Undergoing surgery and medical rehabilitation for 6 months",
    documentUrl: "https://college.edu/proofs/medical_certificate.pdf",
    status: "Approved",
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  }
];

let inMemoryTargetAuditLog = [
  {
    id: "TAL_001",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    action: "Exemption Approved",
    studentName: "Priya Patel",
    exemptionType: "Entrepreneurship",
    prevActiveTarget: 320,
    newActiveTarget: 319,
    officerName: "Placement Director",
    notes: "Approved startup incorporation certificate proof."
  },
  {
    id: "TAL_002",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    action: "Exemption Approved",
    studentName: "Rohan Verma",
    exemptionType: "Government Exams",
    prevActiveTarget: 321,
    newActiveTarget: 320,
    officerName: "Placement Officer",
    notes: "GATE exam scorecard verified."
  }
];

export const getPlacementTargets = async (req, res, next) => {
  try {
    const totalStudents = 380;
    const originalTarget = Math.round(totalStudents * 0.95); // 361

    // Fetch live exemption requests if stored in DB
    const { data: dbExemptions } = await supabase.from('placement_exemption_requests').select('*');
    const exemptionsList = dbExemptions && dbExemptions.length > 0 ? dbExemptions : inMemoryExemptions;

    const approvedList = exemptionsList.filter(e => e.status === 'Approved');

    const approvedHigherStudies = approvedList.filter(e => e.exemptionType === 'Higher Studies').length + 24;
    const approvedEntrepreneurship = approvedList.filter(e => e.exemptionType === 'Entrepreneurship').length + 10;
    const approvedGovtExams = approvedList.filter(e => e.exemptionType === 'Government Exams').length + 6;
    const approvedMedicalLeave = approvedList.filter(e => e.exemptionType === 'Medical Leave').length + 2;

    const totalApprovedExemptions = approvedHigherStudies + approvedEntrepreneurship + approvedGovtExams + approvedMedicalLeave;
    const activePlacementTarget = originalTarget - totalApprovedExemptions;

    const campusPlaced = 245;
    const placementPercentage = parseFloat(((campusPlaced / activePlacementTarget) * 100).toFixed(1));

    // Audit logs
    const { data: dbLogs } = await supabase.from('placement_target_audit_log').select('*').order('timestamp', { ascending: false });
    const auditLogs = dbLogs && dbLogs.length > 0 ? dbLogs : inMemoryTargetAuditLog;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        originalTarget,
        totalApprovedExemptions,
        activePlacementTarget,
        campusPlaced,
        placementPercentage,
        exemptionsBreakdown: {
          higherStudies: approvedHigherStudies,
          entrepreneurship: approvedEntrepreneurship,
          governmentExams: approvedGovtExams,
          medicalLeave: approvedMedicalLeave
        },
        exemptionRequests: exemptionsList,
        auditLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateExemptionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, studentName, exemptionType } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      const error = new Error('Invalid status. Must be Approved or Rejected.');
      error.statusCode = 400;
      return next(error);
    }

    let item = inMemoryExemptions.find(e => e.id === id);
    if (item) {
      item.status = status;
      item.reviewNotes = reviewNotes || '';
      item.updatedAt = new Date().toISOString();
    } else {
      await supabase
        .from('placement_exemption_requests')
        .update({ status, review_notes: reviewNotes, updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    // Recalculate Target & Log Audit Entry
    const totalStudents = 380;
    const originalTarget = 361;
    const currentApprovedCount = inMemoryExemptions.filter(e => e.status === 'Approved').length + 42;
    const prevTarget = originalTarget - (status === 'Approved' ? currentApprovedCount - 1 : currentApprovedCount);
    const newTarget = originalTarget - currentApprovedCount;

    const newLog = {
      id: `TAL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Exemption ${status}`,
      studentName: studentName || item?.studentName || 'Student Candidate',
      exemptionType: exemptionType || item?.exemptionType || 'General Exemption',
      prevActiveTarget: prevTarget,
      newActiveTarget: newTarget,
      officerName: req.user?.full_name || 'Placement Officer',
      notes: reviewNotes || `Exemption ${status.toLowerCase()} by placement officer.`
    };

    inMemoryTargetAuditLog.unshift(newLog);

    try {
      await supabase.from('placement_target_audit_log').insert([newLog]);
    } catch (e) {
      console.warn('Audit log insert warning:', e.message);
    }

    res.status(200).json({
      success: true,
      message: `Exemption request ${status.toLowerCase()} successfully. Active target updated to ${newTarget}.`,
      data: item || { id, status },
      newActiveTarget: newTarget,
      auditLog: newLog
    });
  } catch (error) {
    next(error);
  }
};

export const createExemptionRequest = async (req, res, next) => {
  try {
    const { studentId, studentName, department, exemptionType, reason, documentUrl } = req.body;

    if (!studentName || !exemptionType || !reason) {
      const error = new Error('Student name, exemption type, and reason are required.');
      error.statusCode = 400;
      return next(error);
    }

    const newReq = {
      id: `EXM_${Date.now()}`,
      studentId: studentId || 'CS100001',
      studentName,
      department: department || 'CSE',
      exemptionType,
      reason,
      documentUrl: documentUrl || 'https://college.edu/proofs/sample_exemption.pdf',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    inMemoryExemptions.unshift(newReq);

    try {
      await supabase.from('placement_exemption_requests').insert([newReq]);
    } catch (e) {
      console.warn('Exemption DB insert warning:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Exemption request submitted successfully.',
      data: newReq
    });
  } catch (error) {
    next(error);
  }
};

let inMemoryCareerDeclarations = [
  {
    id: "DEC_CS100001",
    studentId: "CS100001",
    studentName: "Student Demo",
    department: "CSE",
    category: "Higher Studies",
    reason: "Accepted into MS in Computer Science at Columbia University (Fall 2026)",
    pdfUrl: "https://college.edu/documents/columbia_admission_letter.pdf",
    letterUrl: "https://college.edu/documents/formal_declaration_letter.pdf",
    proofUrl: "https://college.edu/documents/gre_toefl_scorecards.pdf",
    status: "Submitted",
    parentStatus: "Pending Parent Consent",
    officerNotes: "",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    timeline: [
      { id: "TL1", title: "Declaration Submitted", timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), description: "Student submitted Higher Studies declaration with 3 attached documents." }
    ]
  },
  {
    id: "DEC_EC100012",
    studentId: "EC100012",
    studentName: "Priya Patel",
    department: "ECE",
    category: "Entrepreneurship",
    reason: "Incorporated IoT Hardware Venture 'NexusRobotics Tech' (DPIIT Recognized)",
    pdfUrl: "https://college.edu/documents/dpiit_certificate.pdf",
    letterUrl: "https://college.edu/documents/placement_optout_letter.pdf",
    proofUrl: "https://college.edu/documents/incorporation_deed.pdf",
    status: "Approved",
    parentStatus: "Parent Verified",
    officerNotes: "Approved upon verifying incorporation certificate and pitch deck.",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    timeline: [
      { id: "TL1", title: "Declaration Submitted", timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), description: "Submitted Entrepreneurship opt-out request." },
      { id: "TL2", title: "Parent Verified", timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), description: "Parent confirmed consent for startup option." },
      { id: "TL3", title: "Officer Approved", timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), description: "Officer approved declaration. Active target updated." }
    ]
  }
];

export const getCareerDeclarations = async (req, res, next) => {
  try {
    const studentId = req.query.studentId;
    let list = inMemoryCareerDeclarations;

    if (studentId) {
      list = list.filter(d => d.studentId.toLowerCase() === studentId.toLowerCase());
    }

    res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

export const submitCareerDeclaration = async (req, res, next) => {
  try {
    const { studentId, studentName, department, category, reason, pdfUrl, letterUrl, proofUrl } = req.body;

    const sId = studentId || 'CS100001';
    const sName = studentName || 'Student Candidate';

    if (!category || !reason) {
      const error = new Error('Category and reason justification are required.');
      error.statusCode = 400;
      return next(error);
    }

    // STRICT SINGLE DECLARATION DEDUPLICATION GUARD
    const existingIndex = inMemoryCareerDeclarations.findIndex(d => d.studentId.toLowerCase() === sId.toLowerCase());

    if (existingIndex !== -1) {
      const existing = inMemoryCareerDeclarations[existingIndex];
      if (existing.status === 'Approved') {
        const error = new Error('Career declaration has already been APPROVED for this student. Duplicate declarations are not allowed.');
        error.statusCode = 400;
        return next(error);
      }

      // UPDATE EXISTING DECLARATION (NEVER INSERT SECOND ROW)
      existing.category = category;
      existing.reason = reason;
      existing.pdfUrl = pdfUrl || existing.pdfUrl || 'https://college.edu/documents/sample_admission.pdf';
      existing.letterUrl = letterUrl || existing.letterUrl || 'https://college.edu/documents/sample_letter.pdf';
      existing.proofUrl = proofUrl || existing.proofUrl || 'https://college.edu/documents/sample_proof.pdf';
      existing.status = 'Submitted';
      existing.updatedAt = new Date().toISOString();
      existing.timeline.push({
        id: `TL_${Date.now()}`,
        title: 'Declaration Updated',
        timestamp: new Date().toISOString(),
        description: `Student re-submitted updated ${category} documents for review.`
      });

      return res.status(200).json({
        success: true,
        message: 'Existing career declaration updated successfully (No duplicate inserted).',
        data: existing
      });
    }

    // CREATE NEW SINGLE DECLARATION
    const newDecl = {
      id: `DEC_${sId}`,
      studentId: sId,
      studentName: sName,
      department: department || 'CSE',
      category,
      reason,
      pdfUrl: pdfUrl || 'https://college.edu/documents/sample_admission.pdf',
      letterUrl: letterUrl || 'https://college.edu/documents/sample_letter.pdf',
      proofUrl: proofUrl || 'https://college.edu/documents/sample_proof.pdf',
      status: 'Submitted',
      parentStatus: 'Pending Parent Consent',
      officerNotes: '',
      createdAt: new Date().toISOString(),
      timeline: [
        {
          id: `TL_${Date.now()}`,
          title: 'Declaration Submitted',
          timestamp: new Date().toISOString(),
          description: `Student submitted ${category} declaration with uploaded PDF, letter, and proof documents.`
        }
      ]
    };

    inMemoryCareerDeclarations.unshift(newDecl);

    res.status(201).json({
      success: true,
      message: 'Career declaration submitted successfully.',
      data: newDecl
    });
  } catch (error) {
    next(error);
  }
};

export const processCareerDeclarationAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, officerNotes } = req.body; // action: Approve | Reject | Request Clarification

    if (!['Approve', 'Reject', 'Request Clarification'].includes(action)) {
      const error = new Error('Invalid officer action. Must be Approve, Reject, or Request Clarification.');
      error.statusCode = 400;
      return next(error);
    }

    const item = inMemoryCareerDeclarations.find(d => d.id === id);
    if (!item) {
      const error = new Error('Career declaration record not found');
      error.statusCode = 404;
      return next(error);
    }

    let newStatus = 'Submitted';
    let timelineTitle = '';

    if (action === 'Approve') {
      newStatus = 'Approved';
      timelineTitle = 'Officer Approved';
      item.parentStatus = 'Parent Verified';
    } else if (action === 'Reject') {
      newStatus = 'Rejected';
      timelineTitle = 'Officer Rejected';
    } else if (action === 'Request Clarification') {
      newStatus = 'Clarification Requested';
      timelineTitle = 'Clarification Requested';
    }

    item.status = newStatus;
    item.officerNotes = officerNotes || `Officer ${action.toLowerCase()}ed declaration.`;
    item.updatedAt = new Date().toISOString();

    item.timeline.push({
      id: `TL_${Date.now()}`,
      title: timelineTitle,
      timestamp: new Date().toISOString(),
      description: officerNotes ? `Officer note: ${officerNotes}` : `Officer performed action: ${action}`
    });

    res.status(200).json({
      success: true,
      message: `Career declaration ${newStatus.toLowerCase()} successfully. ${action === 'Approve' ? 'Active target reduced.' : ''}`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const verifyParentDeclaration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parentConsent } = req.body;

    const item = inMemoryCareerDeclarations.find(d => d.id === id);
    if (!item) {
      const error = new Error('Career declaration record not found');
      error.statusCode = 404;
      return next(error);
    }

    item.parentStatus = parentConsent ? 'Parent Verified' : 'Parent Disapproved';
    item.timeline.push({
      id: `TL_${Date.now()}`,
      title: parentConsent ? 'Parent Verified' : 'Parent Disapproved',
      timestamp: new Date().toISOString(),
      description: parentConsent ? 'Parent confirmed digital consent.' : 'Parent recorded disapproval.'
    });

    res.status(200).json({
      success: true,
      message: `Parent verification status updated to ${item.parentStatus}.`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

let inMemoryAlumniOpportunities = [
  {
    id: "ALM_001",
    alumniName: "Vikramaditya Rao",
    alumniBatch: "2020",
    alumniCompany: "Microsoft India",
    alumniRole: "Senior SDE",
    alumniEmail: "vikram.rao@microsoft.com",
    opportunityType: "Referral",
    company: "Microsoft India",
    role: "Software Development Engineer - I",
    package: "28.5 LPA",
    vacancies: 8,
    eligibilityMinCgpa: 8.0,
    eligibilityDepartments: ["CSE", "IT", "ECE"],
    description: "Exclusive alumni referral drive for 2026 graduating batch. High performance in Data Structures & Systems required.",
    status: "Approved",
    appliedCount: 42,
    referredCount: 18,
    selectedCount: 4,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: "ALM_002",
    alumniName: "Meera Krishnan",
    alumniBatch: "2021",
    alumniCompany: "Google India",
    alumniRole: "Tech Lead",
    alumniEmail: "meera.k@google.com",
    opportunityType: "Internship",
    company: "Google India",
    role: "SWE Summer Intern 2026",
    package: "1.2 Lakh/mo",
    vacancies: 5,
    eligibilityMinCgpa: 8.5,
    eligibilityDepartments: ["CSE", "IT"],
    description: "6-month summer research and engineering internship with PPO conversion opportunity.",
    status: "Approved",
    appliedCount: 65,
    referredCount: 22,
    selectedCount: 5,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  },
  {
    id: "ALM_003",
    alumniName: "Siddharth Verma",
    alumniBatch: "2019",
    alumniCompany: "Goldman Sachs",
    alumniRole: "Vice President",
    alumniEmail: "siddharth.v@gs.com",
    opportunityType: "PPO",
    company: "Goldman Sachs",
    role: "Quant Analyst Associate",
    package: "32.0 LPA",
    vacancies: 3,
    eligibilityMinCgpa: 8.2,
    eligibilityDepartments: ["CSE", "ECE", "EEE"],
    description: "PPO fast-track track for top performing quantitative finance candidates.",
    status: "Pending",
    appliedCount: 0,
    referredCount: 0,
    selectedCount: 0,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

let inMemoryTopAlumni = [
  { rank: 1, name: "Vikramaditya Rao", batch: "2020", company: "Microsoft India", design: "Senior SDE", totalPosts: 5, totalReferred: 38, totalSelected: 12, avatarTone: "info" },
  { rank: 2, name: "Meera Krishnan", batch: "2021", company: "Google India", design: "Tech Lead", totalPosts: 4, totalReferred: 32, totalSelected: 9, avatarTone: "success" },
  { rank: 3, name: "Siddharth Verma", batch: "2019", company: "Goldman Sachs", design: "Vice President", totalPosts: 3, totalReferred: 24, totalSelected: 7, avatarTone: "warn" },
  { rank: 4, name: "Neha Deshmukh", batch: "2022", company: "Amazon India", design: "SDE-II", totalPosts: 3, totalReferred: 19, totalSelected: 5, avatarTone: "info" }
];

export const getAlumniOpportunities = async (req, res, next) => {
  try {
    const { data: dbData } = await supabase.from('alumni_opportunities').select('*').order('created_at', { ascending: false });
    const list = dbData && dbData.length > 0 ? dbData : inMemoryAlumniOpportunities;

    const totalOpportunities = list.length;
    const approvedCount = list.filter(o => o.status === 'Approved').length;
    const totalApplied = list.reduce((sum, o) => sum + (o.appliedCount || 0), 0);
    const totalReferred = list.reduce((sum, o) => sum + (o.referredCount || 0), 0);
    const totalSelected = list.reduce((sum, o) => sum + (o.selectedCount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOpportunities,
          approvedCount,
          totalApplied,
          totalReferred,
          totalSelected,
          activeAlumniRecruiters: inMemoryTopAlumni.length + 8
        },
        opportunities: list,
        topContributors: inMemoryTopAlumni
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitAlumniOpportunity = async (req, res, next) => {
  try {
    const {
      alumniName,
      alumniBatch,
      alumniCompany,
      alumniRole,
      alumniEmail,
      opportunityType,
      company,
      role,
      package: pkg,
      vacancies,
      eligibilityMinCgpa,
      eligibilityDepartments,
      description
    } = req.body;

    if (!alumniName || !company || !role) {
      const error = new Error('Alumni name, company, and role are required.');
      error.statusCode = 400;
      return next(error);
    }

    const newOpp = {
      id: `ALM_${Date.now()}`,
      alumniName,
      alumniBatch: alumniBatch || '2021',
      alumniCompany: alumniCompany || company,
      alumniRole: alumniRole || 'Alumni Recruiter',
      alumniEmail: alumniEmail || 'alumni@college.edu',
      opportunityType: opportunityType || 'Referral',
      company,
      role,
      package: pkg || '12.0 LPA',
      vacancies: parseInt(vacancies) || 3,
      eligibilityMinCgpa: parseFloat(eligibilityMinCgpa) || 7.5,
      eligibilityDepartments: Array.isArray(eligibilityDepartments) ? eligibilityDepartments : ['CSE', 'ECE', 'IT'],
      description: description || `Alumni referral posted by ${alumniName}.`,
      status: 'Pending',
      appliedCount: 0,
      referredCount: 0,
      selectedCount: 0,
      createdAt: new Date().toISOString()
    };

    inMemoryAlumniOpportunities.unshift(newOpp);

    try {
      await supabase.from('alumni_opportunities').insert([newOpp]);
    } catch (e) {
      console.warn('Alumni opportunity insert warning:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Alumni opportunity submitted successfully for officer review.',
      data: newOpp
    });
  } catch (error) {
    next(error);
  }
};

export const processAlumniOpportunityAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, officerNotes } = req.body;

    if (!['Approve', 'Reject'].includes(action)) {
      const error = new Error('Invalid action. Must be Approve or Reject.');
      error.statusCode = 400;
      return next(error);
    }

    const opp = inMemoryAlumniOpportunities.find(o => o.id === id);
    if (!opp) {
      const error = new Error('Alumni opportunity record not found');
      error.statusCode = 404;
      return next(error);
    }

    opp.status = action === 'Approve' ? 'Approved' : 'Rejected';
    opp.officerNotes = officerNotes || `Officer ${action.toLowerCase()}ed posting.`;
    opp.updatedAt = new Date().toISOString();

    // IF APPROVED: AUTOMATICALLY DISPATCH NOTIFICATIONS TO ELIGIBLE STUDENTS
    let notifiedStudentsCount = 0;
    if (action === 'Approve') {
      (async () => {
        try {
          const { data: students } = await supabase.from('students').select('*').eq('is_active', true);
          const allStudents = students || [];

          for (const student of allStudents) {
            const eligibility = calculateStudentEligibility(student, {
              minCgpa: opp.eligibilityMinCgpa,
              branches: opp.eligibilityDepartments
            });

            if (!eligibility.isEligible) continue; // SKIP INELIGIBLE

            notifiedStudentsCount++;
            const notifId = `SN-ALUMNI-${opp.id}-${student.id}`;

            await supabase.from('student_notifications').insert([{
              id: notifId,
              student_id: student.id,
              title: `Alumni Referral Open: ${opp.company} (${opp.role})`,
              message: `Alumni ${opp.alumniName} (${opp.alumniBatch}) posted a ${opp.opportunityType} for ${opp.company} (${opp.package}). Apply now!`,
              type: 'Placement',
              priority: 'High',
              time: 'Just now',
              unread: true
            }]);
          }

          // Record History Log
          await supabase.from('placement_notification_history').insert([{
            id: `PNH_ALM_${opp.id}_${Date.now()}`,
            drive_id: opp.id,
            company: opp.company,
            role: opp.role,
            title: `Alumni Opportunity Dispatch: ${opp.company}`,
            channels: JSON.stringify(['In-App', 'College Email', 'Outlook']),
            eligible_count: notifiedStudentsCount,
            total_students: allStudents.length,
            created_at: new Date().toISOString()
          }]);
        } catch (err) {
          console.error('Error sending alumni drive notifications:', err);
        }
      })();
    }

    res.status(200).json({
      success: true,
      message: `Alumni opportunity ${opp.status.toLowerCase()} successfully. ${action === 'Approve' ? 'Automated notifications dispatched to eligible students.' : ''}`,
      data: opp
    });
  } catch (error) {
    next(error);
  }
};

let inMemoryStudentHistories = [
  {
    studentId: "CS100001",
    studentName: "Student Demo",
    department: "CSE",
    cgpa: 8.9,
    email: "student.demo@college.edu",
    phone: "+91 98765 43210",
    careerStatus: "Placed (Super Dream)",
    currentPlacement: {
      company: "Google India",
      role: "Software Engineer - Full Time",
      package: "38.5 LPA",
      joiningDate: "2026-07-15",
      offerLetterUrl: "https://college.edu/documents/google_offer_letter.pdf",
      resumeUrl: "https://college.edu/documents/student_demo_resume.pdf"
    },
    applicationHistory: [
      { id: "APP_101", company: "Google India", role: "Software Engineer", appliedDate: "2026-03-10", status: "Selected", ctc: "38.5 LPA" },
      { id: "APP_102", company: "Microsoft India", role: "SDE - I", appliedDate: "2026-02-15", status: "Offer Released", ctc: "28.0 LPA" },
      { id: "APP_103", company: "Amazon India", role: "SDE Candidate", appliedDate: "2026-01-20", status: "Shortlisted", ctc: "26.0 LPA" },
      { id: "APP_104", company: "Goldman Sachs", role: "Quant Tech Associate", appliedDate: "2025-11-05", status: "Rejected", ctc: "24.0 LPA" }
    ],
    interviewHistory: [
      { id: "INT_101", company: "Google India", roundName: "System Design & Algorithms", interviewDate: "2026-03-25", interviewer: "Principal Tech Lead", score: "9.5/10", outcome: "Passed", feedback: "Exceptional mastery of dynamic programming and distributed systems." },
      { id: "INT_102", company: "Google India", roundName: "Behavioral & Googliness", interviewDate: "2026-03-28", interviewer: "Engineering Director", score: "9.0/10", outcome: "Passed", feedback: "Strong leadership qualities and alignment with culture." },
      { id: "INT_103", company: "Microsoft India", roundName: "Technical Round 1", interviewDate: "2026-02-22", interviewer: "Senior Software Engineer", score: "8.8/10", outcome: "Passed", feedback: "Clean code style and effective problem solving." }
    ],
    offerHistory: [
      { id: "OFF_101", company: "Google India", role: "Software Engineer", package: "38.5 LPA", joiningDate: "2026-07-15", status: "Accepted", offerLetterUrl: "https://college.edu/documents/google_offer_letter.pdf" },
      { id: "OFF_102", company: "Microsoft India", role: "SDE - I", package: "28.0 LPA", joiningDate: "2026-07-01", status: "Declined", offerLetterUrl: "https://college.edu/documents/microsoft_offer_letter.pdf" }
    ],
    timeline: [
      { id: "TL_1", title: "Registered for Campus Placements", timestamp: "2025-08-01T10:00:00Z", description: "Verified profile CGPA 8.9 and uploaded Resume v2.4." },
      { id: "TL_2", title: "Applied for Amazon Drive", timestamp: "2026-01-20T14:30:00Z", description: "Applied for SDE role with cut-off 8.0 CGPA." },
      { id: "TL_3", title: "Received Microsoft Offer", timestamp: "2026-03-01T09:00:00Z", description: "Released offer letter for 28.0 LPA." },
      { id: "TL_4", title: "Accepted Google Super Dream Offer", timestamp: "2026-04-05T16:20:00Z", description: "Finalized 38.5 LPA Super Dream offer. Placement completed." }
    ]
  },
  {
    studentId: "EC100012",
    studentName: "Priya Patel",
    department: "ECE",
    cgpa: 8.6,
    email: "priya.patel@college.edu",
    phone: "+91 98765 12345",
    careerStatus: "Placed (Dream)",
    currentPlacement: {
      company: "Qualcomm India",
      role: "Hardware Engineer",
      package: "22.0 LPA",
      joiningDate: "2026-08-01",
      offerLetterUrl: "https://college.edu/documents/qualcomm_offer.pdf",
      resumeUrl: "https://college.edu/documents/priya_resume.pdf"
    },
    applicationHistory: [
      { id: "APP_201", company: "Qualcomm India", role: "Hardware Engineer", appliedDate: "2026-02-10", status: "Selected", ctc: "22.0 LPA" },
      { id: "APP_202", company: "Texas Instruments", role: "VLSI Design Engineer", appliedDate: "2026-01-15", status: "Shortlisted", ctc: "20.0 LPA" }
    ],
    interviewHistory: [
      { id: "INT_201", company: "Qualcomm India", roundName: "VLSI & Embedded Systems", interviewDate: "2026-02-28", interviewer: "Hardware Tech Architect", score: "9.0/10", outcome: "Passed", feedback: "Excellent grasp of Verilog and FPGA prototyping." }
    ],
    offerHistory: [
      { id: "OFF_201", company: "Qualcomm India", role: "Hardware Engineer", package: "22.0 LPA", joiningDate: "2026-08-01", status: "Accepted", offerLetterUrl: "https://college.edu/documents/qualcomm_offer.pdf" }
    ],
    timeline: [
      { id: "TL_201", title: "Applied for Qualcomm Drive", timestamp: "2026-02-10T11:00:00Z", description: "Submitted application for Hardware Engineer role." },
      { id: "TL_202", title: "Accepted Qualcomm Offer", timestamp: "2026-03-15T15:00:00Z", description: "Accepted 22.0 LPA Dream offer letter." }
    ]
  }
];

export const getStudentPlacementHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    let record = inMemoryStudentHistories.find(s => s.studentId.toLowerCase() === studentId.toLowerCase());

    if (!record) {
      record = inMemoryStudentHistories[0];
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPlacementHistories = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: inMemoryStudentHistories
    });
  } catch (error) {
    next(error);
  }
};

export const getPlacementReportsData = async (req, res, next) => {
  try {
    const { reportType = 'Batch Report' } = req.query;

    const reports = {
      'Batch Report': {
        type: 'Batch Report',
        title: 'Multi-Batch Comparative Placement Analytics',
        summary: 'Comparative evaluation across 2026, 2025, and 2024 graduating batches.',
        tableHeaders: ['Batch Year', 'Total Students', 'Campus Placed', 'Placement %', 'Average Package (LPA)', 'Highest Package (LPA)'],
        rows: [
          { col0: '2026 (Current Batch)', col1: 380, col2: 347, col3: '91.3%', col4: '10.2 LPA', col5: '48.0 LPA' },
          { col0: '2025 (Previous Batch)', col1: 350, col2: 312, col3: '89.1%', col4: '9.4 LPA', col5: '44.5 LPA' },
          { col0: '2024 (Historical Batch)', col1: 320, col2: 266, col3: '83.1%', col4: '8.6 LPA', col5: '38.0 LPA' }
        ],
        chartData: [
          { name: '2024', PlacementPct: 83.1, AvgPackage: 8.6, HighestPackage: 38.0 },
          { name: '2025', PlacementPct: 89.1, AvgPackage: 9.4, HighestPackage: 44.5 },
          { name: '2026', PlacementPct: 91.3, AvgPackage: 10.2, HighestPackage: 48.0 }
        ]
      },

      'Company Report': {
        type: 'Company Report',
        title: 'Recruiting Partner & Tier Breakdown Report',
        summary: 'Detailed offer and salary distribution by corporate recruiting partner.',
        tableHeaders: ['Company Name', 'Category / Tier', 'Offers Released', 'Average Package (LPA)', 'Highest Package (LPA)'],
        rows: [
          { col0: 'Google India', col1: 'Super Dream (Tier 1)', col2: 12, col3: '38.5 LPA', col4: '48.0 LPA' },
          { col0: 'Microsoft India', col1: 'Super Dream (Tier 1)', col2: 18, col3: '28.0 LPA', col4: '34.0 LPA' },
          { col0: 'Amazon India', col1: 'Dream (Tier 2)', col2: 25, col3: '26.0 LPA', col4: '28.5 LPA' },
          { col0: 'Goldman Sachs', col1: 'Dream (Tier 2)', col2: 15, col3: '24.0 LPA', col4: '26.0 LPA' },
          { col0: 'Qualcomm India', col1: 'Core Tech (Tier 2)', col2: 14, col3: '22.0 LPA', col4: '24.0 LPA' },
          { col0: 'TCS Digital', col1: 'Mass Recruiter', col2: 45, col3: '7.5 LPA', col4: '9.0 LPA' }
        ],
        chartData: [
          { name: 'Google', Offers: 12, AvgPackage: 38.5 },
          { name: 'Microsoft', Offers: 18, AvgPackage: 28.0 },
          { name: 'Amazon', Offers: 25, AvgPackage: 26.0 },
          { name: 'Goldman Sachs', Offers: 15, AvgPackage: 24.0 },
          { name: 'Qualcomm', Offers: 14, AvgPackage: 22.0 },
          { name: 'TCS Digital', Offers: 45, AvgPackage: 7.5 }
        ]
      },

      'Department Report': {
        type: 'Department Report',
        title: 'Department-Wise Placement Performance Report',
        summary: 'Comparative placement percentages and CTC metrics grouped by academic branch.',
        tableHeaders: ['Department', 'Total Students', 'Students Placed', 'Placement %', 'Avg Package (LPA)', 'Max Package (LPA)'],
        rows: [
          { col0: 'Computer Science (CSE)', col1: 120, col2: 115, col3: '95.8%', col4: '14.5 LPA', col5: '48.0 LPA' },
          { col0: 'Information Tech (IT)', col1: 80, col2: 75, col3: '93.7%', col4: '12.8 LPA', col5: '38.0 LPA' },
          { col0: 'Electronics (ECE)', col1: 90, col2: 82, col3: '91.1%', col4: '10.5 LPA', col5: '28.5 LPA' },
          { col0: 'Electrical (EEE)', col1: 50, col2: 43, col3: '86.0%', col4: '8.4 LPA', col5: '18.0 LPA' },
          { col0: 'Mechanical (MECH)', col1: 40, col2: 32, col3: '80.0%', col4: '7.2 LPA', col5: '14.0 LPA' }
        ],
        chartData: [
          { name: 'CSE', PlacementPct: 95.8, AvgPackage: 14.5 },
          { name: 'IT', PlacementPct: 93.7, AvgPackage: 12.8 },
          { name: 'ECE', PlacementPct: 91.1, AvgPackage: 10.5 },
          { name: 'EEE', PlacementPct: 86.0, AvgPackage: 8.4 },
          { name: 'MECH', PlacementPct: 80.0, AvgPackage: 7.2 }
        ]
      },

      'Package Report': {
        type: 'Package Report',
        title: 'CTC Package Salary Distribution Histogram Report',
        summary: 'Classification of student offers by salary slab brackets.',
        tableHeaders: ['Salary Bracket CTC', 'Number of Offers', 'Percentage of Total Offers', 'Top Recruiters in Bracket'],
        rows: [
          { col0: 'Super Dream (>20 LPA)', col1: 45, col2: '14.6%', col3: 'Google, Microsoft, Goldman Sachs, Directi' },
          { col0: 'Dream (10 - 20 LPA)', col1: 110, col2: '35.6%', col3: 'Amazon, Qualcomm, Cisco, Oracle' },
          { col0: 'Regular (5 - 10 LPA)', col1: 125, col2: '40.4%', col3: 'TCS Digital, Cognizant, Wipro, Accenture' },
          { col0: 'Base (<5 LPA)', col1: 29, col2: '9.4%', col3: 'Regional Industry Partners' }
        ],
        chartData: [
          { name: '>20 LPA (Super Dream)', Count: 45 },
          { name: '10-20 LPA (Dream)', Count: 110 },
          { name: '5-10 LPA (Regular)', Count: 125 },
          { name: '<5 LPA (Base)', Count: 29 }
        ]
      },

      'Placement Report': {
        type: 'Placement Report',
        title: 'Campus Recruitment Drives & Offer Summary Report',
        summary: 'Overall statistics on recruitment drives held, offers generated, and student participation.',
        tableHeaders: ['Metric Description', 'Value', 'Growth vs Last Batch', 'Status'],
        rows: [
          { col0: 'Total Companies Visited', col1: 78, col2: '+12%', col3: 'Verified' },
          { col0: 'Total Job Offers Released', col1: 309, col2: '+15%', col3: 'Verified' },
          { col0: 'Unique Students Placed', col1: 285, col2: '+8.2%', col3: 'Verified' },
          { col0: 'Dream & Super Dream Offers', col1: 155, col2: '+18.5%', col3: 'Verified' },
          { col0: 'Average Salary CTC', col1: '10.2 LPA', col2: '+8.5%', col3: 'Verified' }
        ],
        chartData: [
          { name: 'Total Offers', Count: 309 },
          { name: 'Unique Placed', Count: 285 },
          { name: 'Dream Offers', Count: 155 },
          { name: 'Super Dream', Count: 45 }
        ]
      },

      'Career Outcome Report': {
        type: 'Career Outcome Report',
        title: 'Graduating Class Full Career Outcome Report',
        summary: 'Comprehensive breakdown of all 380 batch graduates across placement, higher studies, and startups.',
        tableHeaders: ['Career Pathway', 'Number of Graduates', 'Percentage of Batch', 'Primary Destinations / Remarks'],
        rows: [
          { col0: 'Campus Placement Hires', col1: 285, col2: '75.0%', col3: 'Google, Microsoft, Amazon, TCS' },
          { col0: 'Higher Studies (MS/MBA)', col1: 24, col2: '6.3%', col3: 'CMU, Columbia, IISc, IIM Ahmedabad' },
          { col0: 'Entrepreneurship / Startups', col1: 10, col2: '2.6%', col3: 'NexusRobotics, DPIIT Registered' },
          { col0: 'Government Exams (GATE/UPSC)', col1: 6, col2: '1.6%', col3: 'GATE 2026 Fast-Track Interview' },
          { col0: 'Medical Leave Grounds', col1: 2, col2: '0.5%', col3: 'Certified Medical Exemption' },
          { col0: 'Seeking Employment', col1: 53, col2: '13.9%', col3: 'Active in ongoing drives' }
        ],
        chartData: [
          { name: 'Campus Placed', Count: 285 },
          { name: 'Higher Studies', Count: 24 },
          { name: 'Entrepreneurship', Count: 10 },
          { name: 'Govt Exams', Count: 6 },
          { name: 'Seeking Employment', Count: 53 }
        ]
      },

      'Target Report': {
        type: 'Target Report',
        title: 'Placement Target & Approved Exemption Audit Report',
        summary: 'Target recalculation pipeline audit: Original Target - Approved Exemptions = Active Target.',
        tableHeaders: ['Target Metric / Pipeline Step', 'Student Count', 'Percentage', 'Recalculation Impact'],
        rows: [
          { col0: 'Total Batch Strength', col1: 380, col2: '100.0%', col3: 'Base Cohort' },
          { col0: 'Original Placement Target (95%)', col1: 361, col2: '95.0%', col3: 'Initial Target' },
          { col0: 'Approved Higher Studies Exemptions', col1: 24, col2: '6.3%', col3: '-24 Target' },
          { col0: 'Approved Startup Exemptions', col1: 10, col2: '2.6%', col3: '-10 Target' },
          { col0: 'Approved Govt Exam Exemptions', col1: 6, col2: '1.6%', col3: '-6 Target' },
          { col0: 'Approved Medical Exemptions', col1: 2, col2: '0.5%', col3: '-2 Target' },
          { col0: 'Active Placement Target', col1: 319, col2: '84.0%', col3: 'Final Active Target' }
        ],
        chartData: [
          { name: 'Original Target', Count: 361 },
          { name: 'Approved Exemptions', Count: 42 },
          { name: 'Active Target', Count: 319 },
          { name: 'Campus Placed', Count: 245 }
        ]
      },

      'Referral Report': {
        type: 'Referral Report',
        title: 'Alumni Hiring & Referral Conversion Report',
        summary: 'Performance metrics for alumni referral drives and recruiter network.',
        tableHeaders: ['Alumni Recruiter', 'Batch', 'Company', 'Referrals Posted', 'Students Referred', 'Final Hires'],
        rows: [
          { col0: 'Vikramaditya Rao', col1: '2020', col2: 'Microsoft India', col3: 5, col4: 38, col5: 12 },
          { col0: 'Meera Krishnan', col1: '2021', col2: 'Google India', col3: 4, col4: 32, col5: 9 },
          { col0: 'Siddharth Verma', col1: '2019', col2: 'Goldman Sachs', col3: 3, col4: 24, col5: 7 },
          { col0: 'Neha Deshmukh', col1: '2022', col2: 'Amazon India', col3: 3, col4: 19, col5: 5 }
        ],
        chartData: [
          { name: 'Vikramaditya (MSFT)', Referred: 38, Hires: 12 },
          { name: 'Meera (Google)', Referred: 32, Hires: 9 },
          { name: 'Siddharth (GS)', Referred: 24, Hires: 7 },
          { name: 'Neha (Amazon)', Referred: 19, Hires: 5 }
        ]
      },

      'Student Report': {
        type: 'Student Report',
        title: 'Student Placement Dossier Audit Summary Report',
        summary: 'Roster view of individual student placement statuses and verified CTC offers.',
        tableHeaders: ['Student Name & ID', 'Department', 'CGPA', 'Placement Status', 'Placed Company', 'Package CTC'],
        rows: [
          { col0: 'Student Demo (CS100001)', col1: 'CSE', col2: 8.9, col3: 'Placed (Super Dream)', col4: 'Google India', col5: '38.5 LPA' },
          { col0: 'Priya Patel (EC100012)', col1: 'ECE', col2: 8.6, col3: 'Placed (Dream)', col4: 'Qualcomm India', col5: '22.0 LPA' },
          { col0: 'Aarav Sharma (CS100005)', col1: 'CSE', col2: 9.1, col3: 'Higher Studies', col4: 'Carnegie Mellon University', col5: 'Opted Out' },
          { col0: 'Rohan Verma (IT100008)', col1: 'IT', col2: 8.4, col3: 'Placed (Dream)', col4: 'Amazon India', col5: '26.0 LPA' }
        ],
        chartData: [
          { name: 'Placed (Super Dream)', Count: 45 },
          { name: 'Placed (Dream)', Count: 110 },
          { name: 'Higher Studies / Opt-out', Count: 42 },
          { name: 'Seeking Placement', Count: 53 }
        ]
      }
    };

    const selectedReport = reports[reportType] || reports['Batch Report'];

    res.status(200).json({
      success: true,
      data: selectedReport
    });
  } catch (error) {
    next(error);
  }
};

export const getPlacementPredictionsAndInsights = async (req, res, next) => {
  try {
    const studentPredictions = [
      {
        studentId: "CS100001",
        studentName: "Student Demo",
        department: "CSE",
        cgpa: 8.9,
        backlogs: 0,
        placementProbability: 94.5,
        riskTier: "High Readiness",
        resumeScore: 92,
        skillMatchScore: 95,
        recommendedAction: "Eligible for Super Dream Tier-1 Referral Drives"
      },
      {
        studentId: "EC100012",
        studentName: "Priya Patel",
        department: "ECE",
        cgpa: 8.6,
        backlogs: 0,
        placementProbability: 88.0,
        riskTier: "High Readiness",
        resumeScore: 88,
        skillMatchScore: 86,
        recommendedAction: "Focus on VLSI & Embedded Systems Technical Mock Rounds"
      },
      {
        studentId: "IT100008",
        studentName: "Rohan Verma",
        department: "IT",
        cgpa: 8.4,
        backlogs: 0,
        placementProbability: 82.4,
        riskTier: "High Readiness",
        resumeScore: 84,
        skillMatchScore: 82,
        recommendedAction: "Review System Design & Cloud Architecture"
      },
      {
        studentId: "EE100022",
        studentName: "Karan Johar",
        department: "EEE",
        cgpa: 6.8,
        backlogs: 1,
        placementProbability: 54.0,
        riskTier: "At Risk",
        resumeScore: 62,
        skillMatchScore: 58,
        recommendedAction: "Enroll in Intensive DSA Bootcamp & Resume Overhaul"
      },
      {
        studentId: "ME100030",
        studentName: "Vikram Malhotra",
        department: "MECH",
        cgpa: 6.5,
        backlogs: 2,
        placementProbability: 48.5,
        riskTier: "At Risk",
        resumeScore: 55,
        skillMatchScore: 50,
        recommendedAction: "Clear active backlog & attend Core CAD/CAM Training"
      }
    ];

    const skillGapAnalysis = [
      { skill: "Data Structures & DSA", industryDemand: 90, batchProficiency: 78, gap: 12 },
      { skill: "System Design & Architecture", industryDemand: 85, batchProficiency: 62, gap: 23 },
      { skill: "Web & Full-Stack (React/Node)", industryDemand: 88, batchProficiency: 82, gap: 6 },
      { skill: "Database Systems & SQL", industryDemand: 82, batchProficiency: 76, gap: 6 },
      { skill: "DevOps & Cloud (Docker/AWS)", industryDemand: 78, batchProficiency: 48, gap: 30 }
    ];

    const riskStudents = studentPredictions.filter(s => s.placementProbability < 60 || s.backlogs > 0);

    const departmentPerformance = [
      { department: "CSE", avgProbability: 92.5, totalStudents: 120, placedPct: 95.8 },
      { department: "IT", avgProbability: 89.0, totalStudents: 80, placedPct: 93.7 },
      { department: "ECE", avgProbability: 86.4, totalStudents: 90, placedPct: 91.1 },
      { department: "EEE", avgProbability: 76.2, totalStudents: 50, placedPct: 86.0 },
      { department: "MECH", avgProbability: 72.0, totalStudents: 40, placedPct: 80.0 }
    ];

    const companyTrends = [
      { company: "Google India", hires2024: 8, hires2025: 10, hires2026: 12, growthPct: "+20%" },
      { company: "Microsoft India", hires2024: 12, hires2025: 15, hires2026: 18, growthPct: "+20%" },
      { company: "Amazon India", hires2024: 18, hires2025: 22, hires2026: 25, growthPct: "+13.6%" },
      { company: "Qualcomm India", hires2024: 10, hires2025: 12, hires2026: 14, growthPct: "+16.6%" }
    ];

    const aiInsights = [
      "⚡ High Placement Velocity: 94.5% of candidates with CGPA > 8.0 and LeetCode > 150 score Super Dream placement offers.",
      "🚨 Critical Skill Bottleneck: Cloud & DevOps (Docker/AWS) shows a 30% gap between corporate demand and student proficiency.",
      "🎯 At-Risk Intervention: 2 students in EEE/MECH have active backlogs and <60% placement probability. DSA bootcamp recommended."
    ];

    res.status(200).json({
      success: true,
      data: {
        summary: {
          overallBatchProbability: 86.8,
          totalEvaluated: 380,
          highReadinessCount: 285,
          moderateReadinessCount: 75,
          atRiskCount: riskStudents.length,
          avgResumeScore: 82.5
        },
        studentPredictions,
        skillGapAnalysis,
        riskStudents,
        departmentPerformance,
        companyTrends,
        aiInsights
      }
    });
  } catch (error) {
    next(error);
  }
};

