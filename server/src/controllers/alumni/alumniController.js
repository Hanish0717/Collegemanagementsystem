import { supabase } from '../../config/supabase.js';

// Helper: check if we are in mock mode
const isMockMode = process.env.DATABASE_MOCK_MODE === 'true';

// ── 1. DASHBOARD STATS ───────────────────────────────────
export async function getAlumniDashboardStats(req, res) {
  try {
    let alumni, events, jobs, donations, registrations, requests;

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : {
        alumni_profiles: [], alumni_events: [], alumni_jobs: [], alumni_donations: [], alumni_event_registrations: [], alumni_mentorship_requests: []
      });
      alumni = mockDb.alumni_profiles || [];
      events = mockDb.alumni_events || [];
      jobs = mockDb.alumni_jobs || [];
      donations = mockDb.alumni_donations || [];
      registrations = mockDb.alumni_event_registrations || [];
      requests = mockDb.alumni_mentorship_requests || [];
    } else {
      const { data: a } = await supabase.from('alumni_profiles').select('*');
      const { data: e } = await supabase.from('alumni_events').select('*');
      const { data: j } = await supabase.from('alumni_jobs').select('*');
      const { data: d } = await supabase.from('alumni_donations').select('*');
      const { data: r } = await supabase.from('alumni_event_registrations').select('*');
      const { data: m } = await supabase.from('alumni_mentorship_requests').select('*');
      alumni = a || [];
      events = e || [];
      jobs = j || [];
      donations = d || [];
      registrations = r || [];
      requests = m || [];
    }

    const totalAlumni = alumni.length;
    const activeAlumni = alumni.filter(a => a.status === 'Approved').length;
    const pendingAlumni = alumni.filter(a => a.status === 'Pending').length;
    const upcomingEventsCount = events.filter(e => new Date(e.date) >= new Date()).length;
    const totalDonationsAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const jobOpportunitiesCount = jobs.filter(j => j.is_active).length;
    const mentorshipRequestsCount = requests.filter(r => r.status === 'Pending').length;
    const eventRegistrationsCount = registrations.length;

    // Charts data: Alumni by graduation year
    const graduationYearMap = {};
    alumni.forEach(a => {
      graduationYearMap[a.graduation_year] = (graduationYearMap[a.graduation_year] || 0) + 1;
    });
    const byGraduationYear = Object.keys(graduationYearMap).map(year => ({
      year: Number(year),
      count: graduationYearMap[year]
    })).sort((a, b) => a.year - b.year);

    // Alumni by Department
    const deptMap = {};
    alumni.forEach(a => {
      deptMap[a.department] = (deptMap[a.department] || 0) + 1;
    });
    const byDepartment = Object.keys(deptMap).map(dept => ({
      name: dept,
      count: deptMap[dept]
    }));

    // Alumni Employment Status
    const employedCount = alumni.filter(a => a.current_company).length;
    const higherStudiesCount = alumni.filter(a => a.higher_studies && a.higher_studies !== 'N/A' && a.higher_studies !== '').length;
    const byEmploymentStatus = [
      { name: 'Employed', count: employedCount },
      { name: 'Higher Studies', count: higherStudiesCount },
      { name: 'Others', count: Math.max(0, totalAlumni - employedCount - higherStudiesCount) }
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          totalAlumni,
          activeAlumni,
          newRegistrations: pendingAlumni,
          upcomingEvents: upcomingEventsCount,
          totalDonations: totalDonationsAmount,
          jobOpportunities: jobOpportunitiesCount,
          mentorshipRequests: mentorshipRequestsCount,
          eventRegistrations: eventRegistrationsCount
        },
        charts: {
          byGraduationYear,
          byDepartment,
          byEmploymentStatus
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 2. ALUMNI DIRECTORY ──────────────────────────────────
export async function listAlumniDirectory(req, res) {
  try {
    const { search, department, graduationYear, company, location, skills, status = 'Approved' } = req.query;

    let alumniList = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_profiles: [] });
      alumniList = mockDb.alumni_profiles || [];
    } else {
      const { data, error } = await supabase.from('alumni_profiles').select('*');
      if (error) throw error;
      alumniList = data || [];
    }

    // Apply filtering
    let filtered = alumniList.filter(a => a.status === status);

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.full_name.toLowerCase().includes(s) || 
        a.email.toLowerCase().includes(s) || 
        (a.designation && a.designation.toLowerCase().includes(s)) ||
        (a.current_company && a.current_company.toLowerCase().includes(s))
      );
    }

    if (department && department !== 'All Departments') {
      filtered = filtered.filter(a => a.department === department);
    }

    if (graduationYear && graduationYear !== 'All Years') {
      filtered = filtered.filter(a => String(a.graduation_year) === String(graduationYear));
    }

    if (company) {
      filtered = filtered.filter(a => a.current_company && a.current_company.toLowerCase().includes(company.toLowerCase()));
    }

    if (location) {
      filtered = filtered.filter(a => a.location && a.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (skills) {
      const targetSkill = skills.toLowerCase();
      filtered = filtered.filter(a => a.skills && a.skills.some(s => s.toLowerCase().includes(targetSkill)));
    }

    res.json({ success: true, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 3. ALUMNI REGISTRATION ───────────────────────────────
export async function registerAlumni(req, res) {
  try {
    const payload = req.body;

    // Check duplicate email
    let existing;
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_profiles: [] });
      existing = mockDb.alumni_profiles.find(a => a.email === payload.email || (payload.student_id && a.student_id === payload.student_id));
    } else {
      const { data } = await supabase
        .from('alumni_profiles')
        .select('id')
        .or(`email.eq.${payload.email},student_id.eq.${payload.student_id}`)
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      return res.status(400).json({ success: false, error: "Alumni profile already exists with this Email or Student ID." });
    }

    const newAlumni = {
      id: isMockMode ? `alm-${Date.now()}` : undefined,
      ...payload,
      status: payload.status || 'Pending',
      profile_completion: 70,
      skills: Array.isArray(payload.skills) ? payload.skills : (payload.skills ? payload.skills.split(',').map(s => s.trim()) : []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_profiles: [] });
      mockDb.alumni_profiles.push(newAlumni);
    } else {
      const { error } = await supabase.from('alumni_profiles').insert([newAlumni]);
      if (error) throw error;
    }

    res.status(201).json({ success: true, data: newAlumni });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 4. PROFILE APPROVALS & RETRIEVAL ─────────────────────
export async function getPendingAlumni(req, res) {
  try {
    let pending = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_profiles: [] });
      pending = mockDb.alumni_profiles.filter(a => a.status === 'Pending');
    } else {
      const { data, error } = await supabase.from('alumni_profiles').select('*').eq('status', 'Pending');
      if (error) throw error;
      pending = data || [];
    }
    res.json({ success: true, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function approveAlumniProfile(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_profiles: [] });
      const idx = mockDb.alumni_profiles.findIndex(a => a.id === id);
      if (idx !== -1) {
        mockDb.alumni_profiles[idx].status = status;
        mockDb.alumni_profiles[idx].updated_at = new Date().toISOString();
      }
    } else {
      const { error } = await supabase.from('alumni_profiles').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    }

    res.json({ success: true, message: `Profile has been ${status.toLowerCase()} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAlumniProfile(req, res) {
  try {
    const { id } = req.params;
    let profile, employment, education;

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_profiles: [], alumni_employment: [], alumni_education: [] });
      profile = mockDb.alumni_profiles.find(a => a.id === id);
      employment = mockDb.alumni_employment.filter(e => e.alumni_id === id);
      education = mockDb.alumni_education.filter(e => e.alumni_id === id);
    } else {
      const { data: p, error } = await supabase.from('alumni_profiles').select('*').eq('id', id).single();
      if (error) throw error;
      profile = p;
      const { data: emp } = await supabase.from('alumni_employment').select('*').eq('alumni_id', id);
      const { data: edu } = await supabase.from('alumni_education').select('*').eq('alumni_id', id);
      employment = emp || [];
      education = edu || [];
    }

    if (!profile) return res.status(404).json({ success: false, error: "Profile not found" });

    res.json({
      success: true,
      data: {
        ...profile,
        employment,
        education
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateAlumniProfile(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_profiles: [] });
      const idx = mockDb.alumni_profiles.findIndex(a => a.id === id);
      if (idx !== -1) {
        mockDb.alumni_profiles[idx] = {
          ...mockDb.alumni_profiles[idx],
          ...payload,
          updated_at: new Date().toISOString()
        };
      }
    } else {
      const { error } = await supabase.from('alumni_profiles').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    }

    res.json({ success: true, message: "Profile updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 5. EVENTS MANAGEMENT ─────────────────────────────────
export async function getAlumniEvents(req, res) {
  try {
    let list = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_events: [] });
      list = mockDb.alumni_events || [];
    } else {
      const { data, error } = await supabase.from('alumni_events').select('*').order('date', { ascending: true });
      if (error) throw error;
      list = data || [];
    }
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createAlumniEvent(req, res) {
  try {
    const payload = req.body;
    const newEvent = {
      id: isMockMode ? `evt-${Date.now()}` : undefined,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_events: [] });
      mockDb.alumni_events.push(newEvent);
    } else {
      const { error } = await supabase.from('alumni_events').insert([newEvent]);
      if (error) throw error;
    }

    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function registerAlumniEvent(req, res) {
  try {
    const { id: eventId } = req.params;
    const { alumniId } = req.body;

    const registration = {
      id: isMockMode ? `reg-${Date.now()}` : undefined,
      event_id: eventId,
      alumni_id: alumniId,
      registered_at: new Date().toISOString(),
      attended: false
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_event_registrations: [] });
      mockDb.alumni_event_registrations.push(registration);
    } else {
      const { error } = await supabase.from('alumni_event_registrations').insert([registration]);
      if (error) throw error;
    }

    res.json({ success: true, message: "Registered for event successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 6. JOB PORTAL ────────────────────────────────────────
export async function getAlumniJobs(req, res) {
  try {
    let list = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_jobs: [] });
      list = mockDb.alumni_jobs || [];
    } else {
      const { data, error } = await supabase.from('alumni_jobs').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      list = data || [];
    }
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function postAlumniJob(req, res) {
  try {
    const payload = req.body;
    const newJob = {
      id: isMockMode ? `job-${Date.now()}` : undefined,
      ...payload,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_jobs: [] });
      mockDb.alumni_jobs.push(newJob);
    } else {
      const { error } = await supabase.from('alumni_jobs').insert([newJob]);
      if (error) throw error;
    }

    res.status(201).json({ success: true, data: newJob });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function applyAlumniJob(req, res) {
  try {
    const { id: jobId } = req.params;
    const { alumniId, resumeUrl } = req.body;

    const application = {
      id: isMockMode ? `app-${Date.now()}` : undefined,
      job_id: jobId,
      alumni_id: alumniId,
      applied_at: new Date().toISOString(),
      status: 'Applied',
      resume_url: resumeUrl
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_job_applications: [] });
      mockDb.alumni_job_applications.push(application);
    } else {
      const { error } = await supabase.from('alumni_job_applications').insert([application]);
      if (error) throw error;
    }

    res.json({ success: true, message: "Applied for job successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 7. MENTORSHIP ────────────────────────────────────────
export async function getMentorshipRequests(req, res) {
  try {
    let requests = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_mentorship_requests: [], alumni_profiles: [], students: [] });
      const raw = mockDb.alumni_mentorship_requests || [];
      requests = raw.map(r => {
        const mentor = mockDb.alumni_profiles.find(a => a.id === r.mentor_id) || {};
        const student = mockDb.users.find(u => u.id === r.student_id) || {}; // Stitched mapping
        return {
          ...r,
          mentorName: mentor.full_name,
          studentName: student.full_name || student.name || "Student Demo"
        };
      });
    } else {
      const { data, error } = await supabase
        .from('alumni_mentorship_requests')
        .select('*, alumni_profiles(full_name), students(full_name)');
      if (error) throw error;
      requests = (data || []).map((r) => ({
        ...r,
        mentorName: r.alumni_profiles?.full_name || 'Unknown Mentor',
        studentName: r.students?.full_name || 'Unknown Student'
      }));
    }
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function matchMentorship(req, res) {
  try {
    const { id } = req.body; // Request ID to approve/match
    const { status, sessionSchedule } = req.body;

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_mentorship_requests: [] });
      const idx = mockDb.alumni_mentorship_requests.findIndex(r => r.id === id);
      if (idx !== -1) {
        mockDb.alumni_mentorship_requests[idx].status = status;
        if (sessionSchedule) mockDb.alumni_mentorship_requests[idx].session_schedule = sessionSchedule;
        mockDb.alumni_mentorship_requests[idx].updated_at = new Date().toISOString();
      }
    } else {
      const { error } = await supabase
        .from('alumni_mentorship_requests')
        .update({ status, session_schedule: sessionSchedule, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }

    res.json({ success: true, message: `Mentorship request status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 8. DONATIONS ─────────────────────────────────────────
export async function createDonation(req, res) {
  try {
    const payload = req.body;
    const newDonation = {
      id: isMockMode ? `don-${Date.now()}` : undefined,
      ...payload,
      payment_status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_donations: [] });
      mockDb.alumni_donations.push(newDonation);
    } else {
      const { error } = await supabase.from('alumni_donations').insert([newDonation]);
      if (error) throw error;
    }

    res.status(201).json({ success: true, data: newDonation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDonationLeaderboard(req, res) {
  try {
    let leaderboard = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_donations: [], alumni_profiles: [] });
      const raw = mockDb.alumni_donations || [];
      const profileMap = {};
      raw.forEach(d => {
        profileMap[d.alumni_id] = (profileMap[d.alumni_id] || 0) + Number(d.amount);
      });
      leaderboard = Object.keys(profileMap).map(id => {
        const prof = mockDb.alumni_profiles.find(a => a.id === id) || {};
        return {
          id,
          name: prof.full_name || 'Anonymous Donor',
          graduationYear: prof.graduation_year || 2020,
          totalDonated: profileMap[id]
        };
      }).sort((a, b) => b.totalDonated - a.totalDonated);
    } else {
      const { data, error } = await supabase
        .from('alumni_donations')
        .select('amount, alumni_profiles(id, full_name, graduation_year)');
      if (error) throw error;

      const profileMap = {};
      (data || []).forEach((d) => {
        if (d.alumni_profiles) {
          const id = d.alumni_profiles.id;
          if (!profileMap[id]) {
            profileMap[id] = {
              id,
              name: d.alumni_profiles.full_name,
              graduationYear: d.alumni_profiles.graduation_year,
              totalDonated: 0
            };
          }
          profileMap[id].totalDonated += Number(d.amount);
        }
      });
      leaderboard = Object.values(profileMap).sort((a, b) => b.totalDonated - a.totalDonated);
    }

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 9. SUCCESS STORIES ───────────────────────────────────
export async function getSuccessStories(req, res) {
  try {
    let stories = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_success_stories: [], alumni_profiles: [] });
      const raw = mockDb.alumni_success_stories || [];
      stories = raw.map(s => {
        const prof = mockDb.alumni_profiles.find(a => a.id === s.alumni_id) || {};
        return {
          ...s,
          alumniName: prof.full_name || 'Featured Grad',
          designation: prof.designation || 'Alumni',
          company: prof.current_company || ''
        };
      });
    } else {
      const { data, error } = await supabase
        .from('alumni_success_stories')
        .select('*, alumni_profiles(full_name, designation, current_company)')
        .order('published_at', { ascending: false });
      if (error) throw error;
      stories = (data || []).map((s) => ({
        ...s,
        alumniName: s.alumni_profiles?.full_name || 'Featured Grad',
        designation: s.alumni_profiles?.designation || 'Alumni',
        company: s.alumni_profiles?.current_company || ''
      }));
    }
    res.json({ success: true, data: stories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createSuccessStory(req, res) {
  try {
    const payload = req.body;
    const newStory = {
      id: isMockMode ? `story-${Date.now()}` : undefined,
      ...payload,
      likes_count: 0,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_success_stories: [] });
      mockDb.alumni_success_stories.push(newStory);
    } else {
      const { error } = await supabase.from('alumni_success_stories').insert([newStory]);
      if (error) throw error;
    }

    res.status(201).json({ success: true, data: newStory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 10. COMMUNICATION LOGS ───────────────────────────────
export async function sendAnnouncement(req, res) {
  try {
    const { type, recipient, subject, message, sentBy } = req.body;

    const log = {
      id: isMockMode ? `log-${Date.now()}` : undefined,
      type,
      recipient,
      subject,
      message,
      sent_by: sentBy,
      sent_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_communication_logs: [] });
      mockDb.alumni_communication_logs.push(log);
    } else {
      const { error } = await supabase.from('alumni_communication_logs').insert([log]);
      if (error) throw error;
    }

    res.json({ success: true, message: `Announcement broadcast successfully via ${type}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAnnouncementLogs(req, res) {
  try {
    let logs = [];

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_communication_logs: [] });
      logs = mockDb.alumni_communication_logs || [];
    } else {
      const { data, error } = await supabase
        .from('alumni_communication_logs')
        .select('*')
        .order('sent_at', { ascending: false });
      if (error) throw error;
      logs = data || [];
    }

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 11. CONNECTIONS NETWORKING ──────────────────────────
export async function getAlumniConnections(req, res) {
  try {
    const { alumniId } = req.query;
    let connections = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_connections: [], alumni_profiles: [] });
      const raw = mockDb.alumni_connections || [];
      connections = raw.filter(c => c.sender_id === alumniId || c.receiver_id === alumniId).map(c => {
        const targetId = c.sender_id === alumniId ? c.receiver_id : c.sender_id;
        const prof = mockDb.alumni_profiles.find(p => p.id === targetId) || {};
        return {
          ...c,
          targetName: prof.full_name || 'Alumni Member',
          targetDesignation: prof.designation || 'Graduate',
          targetCompany: prof.current_company || '',
          targetLocation: prof.location || 'Bangalore'
        };
      });
    } else {
      const { data, error } = await supabase
        .from('alumni_connections')
        .select('*, sender:alumni_profiles!sender_id(*), receiver:alumni_profiles!receiver_id(*)')
        .or(`sender_id.eq.${alumniId},receiver_id.eq.${alumniId}`);
      if (error) throw error;
      connections = (data || []).map(c => {
        const isSender = c.sender_id === alumniId;
        const target = isSender ? c.receiver : c.sender;
        return {
          ...c,
          targetName: target?.full_name || 'Alumni Member',
          targetDesignation: target?.designation || 'Graduate',
          targetCompany: target?.current_company || '',
          targetLocation: target?.location || 'Bangalore'
        };
      });
    }
    res.json({ success: true, data: connections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function sendConnectionRequest(req, res) {
  try {
    const { senderId, receiverId } = req.body;
    const request = {
      id: isMockMode ? `con-${Date.now()}` : undefined,
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_connections: [] });
      mockDb.alumni_connections.push(request);
    } else {
      const { error } = await supabase.from('alumni_connections').insert([request]);
      if (error) throw error;
    }
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function respondToConnectionRequest(req, res) {
  try {
    const { id, status } = req.body; // status: 'Accepted' or 'Rejected'
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_connections: [] });
      const idx = mockDb.alumni_connections.findIndex(c => c.id === id);
      if (idx !== -1) {
        mockDb.alumni_connections[idx].status = status;
        mockDb.alumni_connections[idx].updated_at = new Date().toISOString();
      }
    } else {
      const { error } = await supabase
        .from('alumni_connections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }
    res.json({ success: true, message: `Request updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 12. COMMUNITY FEED ──────────────────────────────────
export async function getAlumniFeed(req, res) {
  try {
    let posts = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_posts: [], alumni_profiles: [], alumni_post_comments: [] });
      const raw = mockDb.alumni_posts || [];
      posts = raw.map(p => {
        const author = mockDb.alumni_profiles.find(a => a.id === p.author_id) || {};
        const comments = mockDb.alumni_post_comments.filter(c => c.post_id === p.id).map(c => {
          const cAuthor = mockDb.alumni_profiles.find(a => a.id === c.author_id) || {};
          return {
            ...c,
            authorName: cAuthor.full_name || 'Graduate'
          };
        });
        return {
          ...p,
          authorName: author.full_name || 'Graduate',
          authorDesignation: author.designation || 'Alumni',
          authorCompany: author.current_company || '',
          comments
        };
      });
    } else {
      const { data, error } = await supabase
        .from('alumni_posts')
        .select('*, author:alumni_profiles(*), comments:alumni_post_comments(*, author:alumni_profiles(full_name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      posts = (data || []).map(p => ({
        ...p,
        authorName: p.author?.full_name || 'Graduate',
        authorDesignation: p.author?.designation || 'Alumni',
        authorCompany: p.author?.current_company || '',
        comments: (p.comments || []).map(c => ({
          ...c,
          authorName: c.author?.full_name || 'Graduate'
        }))
      }));
    }
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createAlumniPost(req, res) {
  try {
    const { authorId, content, imageUrl } = req.body;
    const post = {
      id: isMockMode ? `post-${Date.now()}` : undefined,
      author_id: authorId,
      content,
      image_url: imageUrl || '',
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_posts: [] });
      mockDb.alumni_posts.push(post);
    } else {
      const { error } = await supabase.from('alumni_posts').insert([post]);
      if (error) throw error;
    }
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function likeAlumniPost(req, res) {
  try {
    const { id } = req.params; // Post ID
    const { alumniId } = req.body;

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_posts: [], alumni_post_likes: [] });
      const post = mockDb.alumni_posts.find(p => p.id === id);
      if (post) {
        const likeIdx = mockDb.alumni_post_likes.findIndex(l => l.post_id === id && l.alumni_id === alumniId);
        if (likeIdx === -1) {
          mockDb.alumni_post_likes.push({ id: `like-${Date.now()}`, post_id: id, alumni_id: alumniId, created_at: new Date().toISOString() });
          post.likes_count += 1;
        } else {
          mockDb.alumni_post_likes.splice(likeIdx, 1);
          post.likes_count = Math.max(0, post.likes_count - 1);
        }
      }
    } else {
      // Toggle logic for database: insert or delete
      const { data: existing } = await supabase.from('alumni_post_likes').select('id').eq('post_id', id).eq('alumni_id', alumniId).maybeSingle();
      if (existing) {
        await supabase.from('alumni_post_likes').delete().eq('id', existing.id);
        await supabase.rpc('decrement_likes', { post_id_val: id });
      } else {
        await supabase.from('alumni_post_likes').insert([{ post_id: id, alumni_id: alumniId }]);
        await supabase.rpc('increment_likes', { post_id_val: id });
      }
    }
    res.json({ success: true, message: "Liked toggled successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function commentAlumniPost(req, res) {
  try {
    const { id } = req.params; // Post ID
    const { authorId, content } = req.body;

    const comment = {
      id: isMockMode ? `comm-${Date.now()}` : undefined,
      post_id: id,
      author_id: authorId,
      content,
      created_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_posts: [], alumni_post_comments: [] });
      mockDb.alumni_post_comments.push(comment);
      const post = mockDb.alumni_posts.find(p => p.id === id);
      if (post) post.comments_count += 1;
    } else {
      await supabase.from('alumni_post_comments').insert([comment]);
      await supabase.rpc('increment_comments', { post_id_val: id });
    }
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 13. REALTIME MESSAGING ──────────────────────────────
export async function getAlumniMessages(req, res) {
  try {
    const { senderId, receiverId } = req.query;
    let messages = [];
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_messages: [] });
      const raw = mockDb.alumni_messages || [];
      messages = raw.filter(m => 
        (m.sender_id === senderId && m.receiver_id === receiverId) ||
        (m.sender_id === receiverId && m.receiver_id === senderId)
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      const { data, error } = await supabase
        .from('alumni_messages')
        .select('*')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      messages = data || [];
    }
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function sendAlumniMessage(req, res) {
  try {
    const { senderId, receiverId, content, fileUrl } = req.body;
    const message = {
      id: isMockMode ? `msg-${Date.now()}` : undefined,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      file_url: fileUrl || '',
      is_seen: false,
      created_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { alumni_messages: [] });
      mockDb.alumni_messages.push(message);
    } else {
      const { error } = await supabase.from('alumni_messages').insert([message]);
      if (error) throw error;
    }
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 14. MENTORSHIP SESSION BOOKING ──────────────────────
export async function bookMentorshipSession(req, res) {
  try {
    const { requestId, mentorId, studentId, date, startTime, endTime } = req.body;
    const session = {
      id: isMockMode ? `ses-${Date.now()}` : undefined,
      request_id: requestId,
      mentor_id: mentorId,
      student_id: studentId,
      date,
      start_time: startTime,
      end_time: endTime,
      status: 'Scheduled',
      created_at: new Date().toISOString()
    };

    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { mentorship_sessions: [] });
      mockDb.mentorship_sessions.push(session);
    } else {
      const { error } = await supabase.from('mentorship_sessions').insert([session]);
      if (error) throw error;
    }
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function cancelMentorshipSession(req, res) {
  try {
    const { id } = req.params;
    if (isMockMode) {
      const mockDb = await import('../../config/supabase.js').then(m => m.getMockDb ? m.getMockDb() : { mentorship_sessions: [] });
      const idx = mockDb.mentorship_sessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        mockDb.mentorship_sessions[idx].status = 'Cancelled';
      }
    } else {
      const { error } = await supabase.from('mentorship_sessions').update({ status: 'Cancelled' }).eq('id', id);
      if (error) throw error;
    }
    res.json({ success: true, message: "Session cancelled successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── 15. MOCK AI ANALYTICS RECOMMENDATIONS ────────────────
export async function simulateAIResumeReview(req, res) {
  try {
    const { resumeText } = req.body;
    // Simulated LLM parser checks
    const score = Math.floor(Math.random() * 30 + 65); // score between 65-95
    const feedback = [
      "Improve bullet points with action verbs.",
      "Add quantifiable impacts for engineering projects.",
      "Highlight cloud deployment experience more prominently."
    ];
    res.json({
      success: true,
      data: {
        score,
        feedback,
        analysisDate: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAIRecommendations(req, res) {
  try {
    const { alumniId } = req.query;
    // Mock recommendations based on profile skills
    const matchingJobs = [
      { id: "job-001", matchScore: 92, title: "Software Engineer - Google Cloud Platform" },
      { id: "job-002", matchScore: 78, title: "Machine Learning Intern" }
    ];
    const skillGaps = [
      "Kubernetes infrastructure setup",
      "Rust language systems optimization"
    ];
    res.json({
      success: true,
      data: {
        matchingJobs,
        skillGaps,
        recommendedMentorIds: ["alm-002", "alm-003"]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
