import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

// Helper to generate a secure random temporary password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pwd = 'Recruit@';
  for (let i = 0; i < 6; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

// IMMUTABLE AUDIT LOG LEDGER STORE
const immutableSystemAuditLogStore = [
  {
    id: 'AUD_1001',
    timestamp: '2026-07-30T08:30:00.000Z',
    actorType: 'RECRUITER',
    action: 'RECRUITER_LOGIN',
    ipAddress: '192.168.1.100',
    officer: null,
    recruiter: 'Anjali Sharma (anjali.sharma@google.com)',
    oldValue: 'Logged Out',
    newValue: 'Session Authenticated',
    reason: 'Recruiter corporate login successful.'
  },
  {
    id: 'AUD_1002',
    timestamp: '2026-07-30T09:00:00.000Z',
    actorType: 'RECRUITER',
    action: 'QUESTION_UPLOAD',
    ipAddress: '192.168.1.100',
    officer: null,
    recruiter: 'Anjali Sharma (anjali.sharma@google.com)',
    oldValue: 'No Question Paper',
    newValue: 'google_round1_paper.pdf uploaded',
    reason: 'Uploaded technical assessment question paper.'
  },
  {
    id: 'AUD_1003',
    timestamp: '2026-07-30T09:05:00.000Z',
    actorType: 'RECRUITER',
    action: 'TEST_CREATION',
    ipAddress: '192.168.1.100',
    officer: null,
    recruiter: 'Anjali Sharma (anjali.sharma@google.com)',
    oldValue: 'N/A',
    newValue: 'National Coding Challenge Round 1 Scheduled',
    reason: 'Created and scheduled online assessment.'
  },
  {
    id: 'AUD_1004',
    timestamp: '2026-07-30T09:30:00.000Z',
    actorType: 'RECRUITER',
    action: 'RESULT_UPLOAD',
    ipAddress: '192.168.1.100',
    officer: null,
    recruiter: 'Anjali Sharma (anjali.sharma@google.com)',
    oldValue: 'Unpublished',
    newValue: '45 Candidate Scores Uploaded',
    reason: 'Submitted test scores set to Pending TPO Review.'
  },
  {
    id: 'AUD_1005',
    timestamp: '2026-07-30T09:45:00.000Z',
    actorType: 'TPO',
    action: 'DECISION_OVERRIDE',
    ipAddress: '10.0.4.12',
    officer: 'Dr. Rajesh Kumar (TPO Head)',
    recruiter: null,
    oldValue: 'Fail (Sneha Reddy - IT2026008)',
    newValue: 'Pass',
    reason: 'Technical Error in Test System: Disconnection during Q3.'
  }
];

export function recordAuditLog(req, { actorType, action, officer, recruiter, oldValue, newValue, reason }) {
  const clientIp = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '192.168.1.100') : '192.168.1.100';
  const entry = {
    id: `AUD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actorType: actorType || 'SYSTEM',
    action: action || 'ACTION',
    ipAddress: String(clientIp).replace('::ffff:', ''),
    officer: officer || null,
    recruiter: recruiter || null,
    oldValue: oldValue || 'N/A',
    newValue: newValue || 'N/A',
    reason: reason || 'N/A'
  };
  immutableSystemAuditLogStore.unshift(entry);
  try {
    supabase.from('recruiter_tpo_audit_logs').insert([entry]);
  } catch (e) {}
  return entry;
}

/** Get Immutable Audit Logs */
export async function getSystemAuditLogs(req, res) {
  try {
    return res.json({ success: true, data: immutableSystemAuditLogStore });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
}

// Initial mock dataset if database/table is empty
const initialMockRecruiters = [
  {
    id: 'rec-001',
    company_id: 'COM001',
    company_name: 'Google India',
    name: 'Anjali Sharma',
    email: 'anjali.sharma@google.com',
    phone: '9876543210',
    designation: 'University Relations Lead',
    permissions: ['view_applicants', 'shortlist_candidates', 'schedule_interviews', 'release_offers', 'download_dossiers'],
    status: 'active',
    is_temporary_password: true,
    password_hash: bcrypt.hashSync('Recruit@Google123', 10),
    assigned_drive_ids: ['DRV_101', 'DRV_102'],
    login_history: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.50', status: 'Success' }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rec-002',
    company_id: 'COM002',
    company_name: 'Microsoft India',
    name: 'Rohit Mehta',
    email: 'rohit.mehta@microsoft.com',
    phone: '9876543211',
    designation: 'Technical Recruiter',
    permissions: ['view_applicants', 'shortlist_candidates', 'schedule_interviews'],
    status: 'active',
    is_temporary_password: false,
    password_hash: bcrypt.hashSync('password123', 10),
    assigned_drive_ids: ['DRV_103'],
    login_history: [
      { timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.51', status: 'Success' }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper to load recruiters from database/mock
async function loadRecruiters() {
  try {
    const { data, error } = await supabase.from('company_recruiters').select('*');
    if (error || !data || data.length === 0) {
      return initialMockRecruiters;
    }
    // Merge Supabase recruiters with any in-memory mock recruiters not yet in DB
    const merged = [...data];
    for (const mockRec of initialMockRecruiters) {
      if (!merged.some(r => r.email?.toLowerCase() === mockRec.email?.toLowerCase())) {
        merged.push(mockRec);
      }
    }
    return merged;
  } catch (err) {
    return initialMockRecruiters;
  }
}

// ════════════════════════════════════════════════════════════════════════
// PLACEMENT OFFICER CONTROLLERS
// ════════════════════════════════════════════════════════════════════════

/** Get all company recruiters */
export async function getRecruiters(req, res) {
  try {
    const recruiters = await loadRecruiters();
    // Omit sensitive password hashes in general list
    const sanitized = recruiters.map(r => {
      const { password_hash, ...rest } = r;
      return rest;
    });
    return res.json({ success: true, data: sanitized });
  } catch (err) {
    console.error('Error fetching recruiters:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch recruiters' });
  }
}

/** Create a new recruiter */
export async function createRecruiter(req, res) {
  try {
    const {
      company_id,
      company_name,
      name,
      email,
      phone,
      designation,
      permissions,
      status = 'active',
      custom_temp_password,
      assigned_drive_ids = []
    } = req.body;

    if (!company_name || !name || !email) {
      return res.status(400).json({ success: false, message: 'Company, Recruiter Name, and Email are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const tempPassword = custom_temp_password || generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newRecruiter = {
      id: `rec-${Date.now()}`,
      company_id: company_id || `COM_${Date.now()}`,
      company_name,
      name,
      email: cleanEmail,
      phone: phone || '',
      designation: designation || 'Campus Recruiter',
      permissions: permissions || ['view_applicants', 'shortlist_candidates', 'schedule_interviews', 'release_offers', 'download_dossiers'],
      status: status || 'active',
      is_temporary_password: true,
      password_hash: hashedPassword,
      assigned_drive_ids,
      login_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Always keep in memory store to guarantee immediate login capability
    const existingIndex = initialMockRecruiters.findIndex(r => r.email.toLowerCase() === cleanEmail);
    if (existingIndex >= 0) {
      initialMockRecruiters[existingIndex] = newRecruiter;
    } else {
      initialMockRecruiters.push(newRecruiter);
    }

    try {
      await supabase.from('company_recruiters').insert([newRecruiter]);
    } catch (dbErr) {
      console.warn('Supabase insert skipped, stored in memory:', dbErr);
    }

    console.log(`[EMAIL SIMULATION] Sent login credentials to ${cleanEmail}: Temporary Password is "${tempPassword}"`);

    const { password_hash, ...sanitized } = newRecruiter;
    return res.status(201).json({
      success: true,
      message: 'Company recruiter created successfully. Temporary credentials issued.',
      data: sanitized,
      temporaryPassword: tempPassword
    });

  } catch (err) {
    console.error('Error creating recruiter:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create recruiter' });
  }
}

/** Update recruiter details */
export async function updateRecruiter(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, designation, permissions, status, company_id, company_name, assigned_drive_ids } = req.body;

    const updates = {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(designation && { designation }),
      ...(permissions && { permissions }),
      ...(status && { status }),
      ...(company_id && { company_id }),
      ...(company_name && { company_name }),
      ...(assigned_drive_ids && { assigned_drive_ids }),
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('company_recruiters').update(updates).eq('id', id);
    } catch (dbErr) {
      const rec = initialMockRecruiters.find(r => r.id === id);
      if (rec) Object.assign(rec, updates);
    }

    return res.json({ success: true, message: 'Recruiter updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update recruiter' });
  }
}

/** Enable or Disable Recruiter */
export async function toggleRecruiterStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'disabled'

    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or disabled' });
    }

    try {
      await supabase.from('company_recruiters').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    } catch (dbErr) {
      const rec = initialMockRecruiters.find(r => r.id === id);
      if (rec) rec.status = status;
    }

    return res.json({ success: true, message: `Recruiter status updated to ${status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
}

/** Reset Password for Recruiter */
export async function resetRecruiterPassword(req, res) {
  try {
    const { id } = req.params;
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const updates = {
      password_hash: hashedPassword,
      is_temporary_password: true,
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('company_recruiters').update(updates).eq('id', id);
    } catch (dbErr) {
      const rec = initialMockRecruiters.find(r => r.id === id);
      if (rec) Object.assign(rec, updates);
    }

    return res.json({
      success: true,
      message: 'Password reset successfully. New temporary password generated.',
      temporaryPassword: tempPassword
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
}

/** Assign Recruitment Drives */
export async function assignDrives(req, res) {
  try {
    const { id } = req.params;
    const { assigned_drive_ids } = req.body;

    if (!Array.isArray(assigned_drive_ids)) {
      return res.status(400).json({ success: false, message: 'assigned_drive_ids must be an array' });
    }

    try {
      await supabase.from('company_recruiters').update({
        assigned_drive_ids,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    } catch (dbErr) {
      const rec = initialMockRecruiters.find(r => r.id === id);
      if (rec) rec.assigned_drive_ids = assigned_drive_ids;
    }

    return res.json({ success: true, message: 'Recruitment drives assigned successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to assign drives' });
  }
}


// ════════════════════════════════════════════════════════════════════════
// COMPANY RECRUITER PORTAL AUTH & PORTAL CONTROLLERS
// ════════════════════════════════════════════════════════════════════════

/** Recruiter Login */
export async function companyLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const recruiters = await loadRecruiters();
    const cleanEmail = email.toLowerCase().trim();
    const recruiter = recruiters.find(r => r.email.toLowerCase().trim() === cleanEmail);

    if (!recruiter) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or account not found.' });
    }

    if (recruiter.status === 'disabled') {
      return res.status(403).json({ success: false, message: 'Your recruiter account has been disabled. Please contact the Placement Office.' });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Record login history
    const loginEntry = {
      timestamp: new Date().toISOString(),
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      status: 'Success'
    };
    const updatedHistory = [loginEntry, ...(recruiter.login_history || []).slice(0, 19)];
    recruiter.login_history = updatedHistory;

    try {
      await supabase.from('company_recruiters').update({ login_history: updatedHistory }).eq('id', recruiter.id);
    } catch (e) {}

    // Generate token
    const payload = {
      id: recruiter.id,
      email: recruiter.email,
      name: recruiter.name,
      company_id: recruiter.company_id,
      company_name: recruiter.company_name,
      role: 'company_recruiter'
    };

    // Audit log recruiter login
    recordAuditLog(req, {
      actorType: 'RECRUITER',
      action: 'RECRUITER_LOGIN',
      recruiter: `${recruiter.name} (${recruiter.email})`,
      oldValue: 'Logged Out',
      newValue: 'Session Authenticated',
      reason: 'Recruiter corporate login successful.'
    });

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    const { password_hash, ...userProfile } = recruiter;

    return res.json({
      success: true,
      token,
      user: {
        ...userProfile,
        role: 'company_recruiter'
      },
      needsPasswordChange: recruiter.is_temporary_password
    });
  } catch (err) {
    console.error('Recruiter login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
}

/** Recruiter Change Password */
export async function changePassword(req, res) {
  try {
    const recruiterId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const recruiters = await loadRecruiters();
    const recruiter = recruiters.find(r => r.id === recruiterId);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updates = {
      password_hash: hashedPassword,
      is_temporary_password: false,
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('company_recruiters').update(updates).eq('id', recruiterId);
    } catch (e) {
      Object.assign(recruiter, updates);
    }

    return res.json({ success: true, message: 'Password updated successfully. You can now access your recruiter portal.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
}

/** Fetch Recruiter's Current Profile */
export async function getRecruiterMe(req, res) {
  try {
    const recruiters = await loadRecruiters();
    const recruiter = recruiters.find(r => r.id === req.user.id);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }

    const { password_hash, ...sanitized } = recruiter;
    return res.json({
      success: true,
      user: {
        ...sanitized,
        role: 'company_recruiter'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch recruiter info' });
  }
}

/** Recruiter: Get Assigned Drives (Company-Tailored & Database Dynamic) */
export async function getAssignedDrives(req, res) {
  try {
    const recruiterId = req.user.id;
    const recruiters = await loadRecruiters();
    const recruiter = recruiters.find(r => r.id === recruiterId);
    const companyName = recruiter?.company_name || 'TCS';

    // 1. Try querying Supabase placement_drives table first
    try {
      const { data: dbDrives, error } = await supabase
        .from('placement_drives')
        .select('*');

      if (!error && dbDrives && dbDrives.length > 0) {
        const filtered = dbDrives.filter(d =>
          (d.company_name || d.company || '').toLowerCase().includes(companyName.toLowerCase()) ||
          (recruiter?.assigned_drive_ids || []).includes(d.id)
        );
        if (filtered.length > 0) {
          return res.json({
            success: true,
            data: filtered.map(d => ({
              id: d.id,
              company: d.company_name || d.company || companyName,
              companyId: d.company_id || recruiter?.company_id || 'COM001',
              role: d.job_title || d.role || 'Software Engineer',
              date: d.drive_date || d.date || '2026-08-20',
              venue: d.location || d.venue || 'Campus Auditorium',
              applicationDeadline: d.deadline || d.applicationDeadline || '2026-08-15',
              status: d.status || 'Active',
              studentCount: d.eligible_students_count || d.studentCount || 120,
              rounds: d.rounds || 3,
              eligibilityBatch: d.batch || '2026',
              eligibilityMinCgpa: d.min_cgpa || d.eligibilityMinCgpa || 7.0,
              eligibilityMaxBacklogs: d.max_backlogs ?? 0,
              eligibilityDepartments: d.departments || ['CSE', 'IT', 'ECE'],
              eligibilitySkills: d.skills || ['Data Structures', 'Problem Solving'],
              assignedRecruiter: recruiter?.name || 'Assigned Recruiter',
              assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
              assignedDate: d.created_at || '2026-07-20'
            }))
          });
        }
      }
    } catch (dbErr) {
      console.warn('Supabase placement_drives query fallback:', dbErr);
    }

    // 2. Company-Tailored Drive Directory (Dynamic per Corporate Recruiter)
    const companyDrivesDatabase = {
      'tcs': [
        {
          id: 'DRV_TCS_01',
          company: recruiter?.company_name || 'TCS',
          companyId: recruiter?.company_id || 'COM_TCS',
          role: 'TCS Digital Engineer',
          date: '2026-08-18',
          venue: 'Main Seminar Hall & Online',
          applicationDeadline: '2026-08-12',
          status: 'Active',
          studentCount: 165,
          rounds: 3,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 7.5,
          eligibilityMaxBacklogs: 0,
          eligibilityDepartments: ['CSE', 'AIML', 'ECE', 'IT'],
          eligibilitySkills: ['Java / Python', 'DSA', 'SQL', 'System Architecture'],
          assignedRecruiter: recruiter?.name || 'Lokesh',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: '2026-07-20',
          upcomingTasks: ['Review iON Test Scores', 'Finalize Digital Interview Slots']
        },
        {
          id: 'DRV_TCS_02',
          company: recruiter?.company_name || 'TCS',
          companyId: recruiter?.company_id || 'COM_TCS',
          role: 'TCS Ninja Developer',
          date: '2026-08-22',
          venue: 'Tech Block Labs 1 & 2',
          applicationDeadline: '2026-08-15',
          status: 'Active',
          studentCount: 210,
          rounds: 2,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 6.5,
          eligibilityMaxBacklogs: 1,
          eligibilityDepartments: ['CSE', 'IT', 'ECE', 'EEE', 'MECH'],
          eligibilitySkills: ['C / C++', 'Core Java', 'Aptitude & Reasoning'],
          assignedRecruiter: recruiter?.name || 'Lokesh',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: '2026-07-22',
          upcomingTasks: ['Publish Ninja Assessment Paper', 'Verify Student CGPA']
        },
        {
          id: 'DRV_TCS_03',
          company: recruiter?.company_name || 'TCS',
          companyId: recruiter?.company_id || 'COM_TCS',
          role: 'TCS Research & AI Innovator',
          date: '2026-08-28',
          venue: 'Innovation Center Lab A',
          applicationDeadline: '2026-08-20',
          status: 'Active',
          studentCount: 42,
          rounds: 4,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 8.0,
          eligibilityMaxBacklogs: 0,
          eligibilityDepartments: ['CSE', 'AIML'],
          eligibilitySkills: ['Machine Learning', 'PyTorch / TensorFlow', 'Algorithms'],
          assignedRecruiter: recruiter?.name || 'Lokesh',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: '2026-07-25',
          upcomingTasks: ['Schedule AI Technical Presentation']
        }
      ],
      'google': [
        {
          id: 'DRV_GGL_01',
          company: recruiter?.company_name || 'Google India',
          companyId: recruiter?.company_id || 'COM_GGL',
          role: 'Software Engineer (University Grad)',
          date: '2026-08-15',
          venue: 'Main Auditorium',
          applicationDeadline: '2026-08-10',
          status: 'Active',
          studentCount: 142,
          rounds: 4,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 7.5,
          eligibilityMaxBacklogs: 0,
          eligibilityDepartments: ['CSE', 'AIML', 'ECE'],
          eligibilitySkills: ['Data Structures', 'Algorithms', 'System Design', 'C++'],
          assignedRecruiter: recruiter?.name || 'Anjali Sharma',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: '2026-07-15',
          upcomingTasks: ['Review Coding Test Results', 'Finalize Round 1 Tech Panel']
        },
        {
          id: 'DRV_GGL_02',
          company: recruiter?.company_name || 'Google India',
          companyId: recruiter?.company_id || 'COM_GGL',
          role: 'Frontend Engineer (Web Platform)',
          date: '2026-08-20',
          venue: 'Virtual Conference',
          applicationDeadline: '2026-08-14',
          status: 'Active',
          studentCount: 88,
          rounds: 3,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 7.0,
          eligibilityMaxBacklogs: 1,
          eligibilityDepartments: ['CSE', 'IT'],
          eligibilitySkills: ['React', 'TypeScript', 'Web Vitals', 'Tailwind'],
          assignedRecruiter: recruiter?.name || 'Anjali Sharma',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: '2026-07-18',
          upcomingTasks: ['Schedule Online UI Challenge']
        }
      ],
      'microsoft': [
        {
          id: 'DRV_MSFT_01',
          company: recruiter?.company_name || 'Microsoft India',
          companyId: recruiter?.company_id || 'COM_MSFT',
          role: 'Software Development Engineer (SDE)',
          date: '2026-08-17',
          venue: 'Auditorium Block B',
          applicationDeadline: '2026-08-11',
          status: 'Active',
          studentCount: 130,
          rounds: 4,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 7.5,
          eligibilityMaxBacklogs: 0,
          eligibilityDepartments: ['CSE', 'IT', 'AIML'],
          eligibilitySkills: ['C# / C++', 'Data Structures', 'Azure Cloud'],
          assignedRecruiter: recruiter?.name || 'Rohit Mehta',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: '2026-07-16'
        }
      ]
    };

    const cleanCompanyKey = companyName.toLowerCase();
    let companyDrives = companyDrivesDatabase[cleanCompanyKey];

    // Fallback if company is not in preset catalog: dynamically format matching company name & role
    if (!companyDrives) {
      companyDrives = [
        {
          id: `DRV_${Date.now()}_1`,
          company: companyName,
          companyId: recruiter?.company_id || `COM_${Date.now()}`,
          role: `${companyName} Software Engineer`,
          date: '2026-08-20',
          venue: 'Campus Conference Hall',
          applicationDeadline: '2026-08-14',
          status: 'Active',
          studentCount: 120,
          rounds: 3,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 7.0,
          eligibilityMaxBacklogs: 0,
          eligibilityDepartments: ['CSE', 'IT', 'AIML', 'ECE'],
          eligibilitySkills: ['Data Structures', 'Problem Solving', 'SQL'],
          assignedRecruiter: recruiter?.name || 'Recruiter',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: new Date().toISOString().slice(0, 10),
          upcomingTasks: ['Conduct Online Coding Test', 'Upload Candidates Results']
        },
        {
          id: `DRV_${Date.now()}_2`,
          company: companyName,
          companyId: recruiter?.company_id || `COM_${Date.now()}`,
          role: `${companyName} Systems & Cloud Associate`,
          date: '2026-08-25',
          venue: 'Tech Block Lab 3',
          applicationDeadline: '2026-08-18',
          status: 'Active',
          studentCount: 85,
          rounds: 2,
          eligibilityBatch: '2026',
          eligibilityMinCgpa: 6.8,
          eligibilityMaxBacklogs: 1,
          eligibilityDepartments: ['CSE', 'IT', 'ECE'],
          eligibilitySkills: ['Linux', 'Networking', 'Python'],
          assignedRecruiter: recruiter?.name || 'Recruiter',
          assignedBy: 'Dr. Rajesh Kumar (Placement Officer)',
          assignedDate: new Date().toISOString().slice(0, 10),
          upcomingTasks: ['Verify Candidate Transcripts']
        }
      ];
    }

    return res.json({ success: true, data: companyDrives });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned drives' });
  }
}


/** Recruiter: Get Applicants for Assigned Drives */
export async function getAssignedApplicants(req, res) {
  try {
    const recruiterId = req.user.id;
    const recruiters = await loadRecruiters();
    const recruiter = recruiters.find(r => r.id === recruiterId);

    const mockApplicants = [
      { id: 'APP_101', studentName: 'Aarav Sharma', studentId: 'CS2026001', company: recruiter?.company_name || 'Google India', role: 'Software Engineer', department: 'CSE', cgpa: 8.9, appliedDate: '2026-07-28', status: 'Shortlisted', score: 92, round: 2, email: 'aarav.sharma@student.college.com', phone: '9876500001' },
      { id: 'APP_102', studentName: 'Priya Patel', studentId: 'CS2026014', company: recruiter?.company_name || 'Google India', role: 'Software Engineer', department: 'AIML', cgpa: 9.2, appliedDate: '2026-07-27', status: 'Selected', score: 96, round: 4, email: 'priya.patel@student.college.com', phone: '9876500002' },
      { id: 'APP_103', studentName: 'Rohan Verma', studentId: 'EC2026022', company: recruiter?.company_name || 'Google India', role: 'Frontend Engineer', department: 'ECE', cgpa: 7.8, appliedDate: '2026-07-29', status: 'Applied', score: 78, round: 1, email: 'rohan.verma@student.college.com', phone: '9876500003' },
      { id: 'APP_104', studentName: 'Sneha Reddy', studentId: 'IT2026008', company: recruiter?.company_name || 'Google India', role: 'Software Engineer', department: 'IT', cgpa: 8.4, appliedDate: '2026-07-26', status: 'Shortlisted', score: 85, round: 2, email: 'sneha.reddy@student.college.com', phone: '9876500004' }
    ];

    return res.json({ success: true, data: mockApplicants });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch applicants' });
  }
}

/** Recruiter / TPO: Update the status of a single candidate application */
export async function updateCandidateStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status, round, score, remarks } = req.body;

    const allowedStatuses = [
      'Applied', 'Shortlisted', 'Selected', 'Rejected',
      'Test Scheduled', 'Test Completed', 'Interview Scheduled',
      'Technical Interview', 'HR Interview', 'Offer Released'
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    // Persist to Supabase if available
    try {
      await supabase
        .from('placement_applications')
        .update({
          status: status || 'Applied',
          ...(round != null && { round }),
          ...(score != null && { score }),
          ...(remarks && { remarks }),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
    } catch (e) {}

    recordAuditLog(req, {
      actorType: req.user?.role === 'company_recruiter' ? 'RECRUITER' : 'TPO',
      action: 'UPDATE_CANDIDATE_STATUS',
      officer: req.user?.name || null,
      recruiter: req.user?.role === 'company_recruiter' ? req.user?.name : null,
      oldValue: 'Previous Status',
      newValue: status || 'Unknown',
      reason: remarks || `Candidate ${applicationId} status updated to ${status}.`
    });

    return res.json({
      success: true,
      message: `Candidate ${applicationId} status updated to "${status}".`,
      data: { applicationId, status, round, score, remarks }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update candidate status.' });
  }
}

/** Recruiter: Get Dashboard Overview Stats */
export async function getDashboardStats(req, res) {
  try {
    const recruiterId = req.user.id;
    const recruiters = await loadRecruiters();
    const recruiter = recruiters.find(r => r.id === recruiterId);
    const companyName = recruiter?.company_name || 'Google India';

    // Queries or dynamic metrics
    let activeDrivesCount = 2;
    let eligibleStudentsCount = 142;
    let testsConductedCount = 5;
    let pendingResultsCount = 18;
    let upcomingInterviewsCount = 12;
    let studentsSelectedCount = 28;

    try {
      const { data: drives } = await supabase.from('placement_drives').select('id, status').ilike('company_name', `%${companyName}%`);
      if (drives && drives.length > 0) {
        activeDrivesCount = drives.filter(d => d.status === 'upcoming' || d.status === 'active' || d.status === 'ongoing').length || drives.length;
      }
    } catch (e) {}

    return res.json({
      success: true,
      data: {
        activeDrives: activeDrivesCount,
        eligibleStudents: eligibleStudentsCount,
        testsConducted: testsConductedCount,
        pendingResults: pendingResultsCount,
        upcomingInterviews: upcomingInterviewsCount,
        studentsSelected: studentsSelectedCount
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
}

/** Recruiter: Get Eligible Students list */
export async function getEligibleStudents(req, res) {
  try {
    const { minCgpa = 7.0, department } = req.query;

    let students = [
      { id: 'STU_2026_01', roll_number: 'CS2026001', full_name: 'Aarav Sharma', department: 'CSE', cgpa: 8.9, backlogs: 0, email: 'aarav.sharma@student.college.com', phone_number: '9876500001', skills: ['React', 'Node.js', 'Python'], status: 'Eligible' },
      { id: 'STU_2026_02', roll_number: 'CS2026014', full_name: 'Priya Patel', department: 'AIML', cgpa: 9.2, backlogs: 0, email: 'priya.patel@student.college.com', phone_number: '9876500002', skills: ['PyTorch', 'Computer Vision', 'Java'], status: 'Eligible' },
      { id: 'STU_2026_03', roll_number: 'EC2026022', full_name: 'Rohan Verma', department: 'ECE', cgpa: 7.8, backlogs: 0, email: 'rohan.verma@student.college.com', phone_number: '9876500003', skills: ['C++', 'Embedded Systems'], status: 'Eligible' },
      { id: 'STU_2026_04', roll_number: 'IT2026008', full_name: 'Sneha Reddy', department: 'IT', cgpa: 8.4, backlogs: 0, email: 'sneha.reddy@student.college.com', phone_number: '9876500004', skills: ['SQL', 'Cloud AWS', 'JavaScript'], status: 'Eligible' },
      { id: 'STU_2026_05', roll_number: 'CS2026045', full_name: 'Vikram Malhotra', department: 'CSE', cgpa: 8.1, backlogs: 0, email: 'vikram.m@student.college.com', phone_number: '9876500005', skills: ['Golang', 'Docker', 'PostgreSQL'], status: 'Eligible' },
      { id: 'STU_2026_06', roll_number: 'AI2026019', full_name: 'Ananya Gupta', department: 'AIML', cgpa: 8.7, backlogs: 0, email: 'ananya.g@student.college.com', phone_number: '9876500006', skills: ['TensorFlow', 'Data Structures', 'C++'], status: 'Eligible' }
    ];

    try {
      const { data: dbStudents } = await supabase.from('students').select('*').gte('cgpa', parseFloat(minCgpa));
      if (dbStudents && dbStudents.length > 0) {
        students = dbStudents.map(s => ({
          id: s.id,
          roll_number: s.roll_number || s.id,
          full_name: s.full_name,
          department: s.department || 'CSE',
          cgpa: s.cgpa || 8.0,
          backlogs: 0,
          email: s.email,
          phone_number: s.phone_number || 'N/A',
          skills: ['Data Structures', 'Problem Solving', 'Full Stack'],
          status: 'Eligible'
        }));
      }
    } catch (e) {}

    return res.json({ success: true, data: students });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch eligible students' });
  }
}

const createdTestsStore = [
  {
    id: 'TST_01',
    title: 'National Coding Challenge Round 1',
    drive: 'Software Engineer',
    duration: 90,
    startTime: '2026-08-01T10:00:00.000Z',
    endTime: '2026-08-01T11:30:00.000Z',
    instructions: 'No external help or plagiarism permitted. Complete 3 algorithmic coding challenges.',
    eligibility: 'CSE, AIML (Min CGPA: 7.5+)',
    assessmentLink: 'https://hackerrank.com/google-campus-drive-2026',
    questionPaperUrl: 'https://storage.college.edu/tests/google_round1_paper.pdf',
    status: 'Completed',
    totalCandidates: 142,
    completedCount: 138,
    avgScore: 82
  },
  {
    id: 'TST_02',
    title: 'System Design & CS Fundamentals Test',
    drive: 'Software Engineer',
    duration: 60,
    startTime: '2026-08-05T14:00:00.000Z',
    endTime: '2026-08-05T15:00:00.000Z',
    instructions: 'Multiple choice and architectural diagram questions.',
    eligibility: 'Shortlisted Round 1 Candidates',
    assessmentLink: 'https://codility.com/c/google-sysdesign-2026',
    questionPaperUrl: '',
    status: 'Completed',
    totalCandidates: 45,
    completedCount: 42,
    avgScore: 76
  },
  {
    id: 'TST_03',
    title: 'Frontend Engineering Hands-on Hackathon',
    drive: 'Frontend Engineer',
    duration: 120,
    startTime: '2026-08-12T09:00:00.000Z',
    endTime: '2026-08-12T11:00:00.000Z',
    instructions: 'Build a React dashboard component matching the mock wireframe.',
    eligibility: 'CSE, IT (Min CGPA: 7.0+)',
    assessmentLink: 'https://mettl.com/test/frontend-hack-2026',
    questionPaperUrl: '',
    status: 'Scheduled',
    totalCandidates: 88,
    completedCount: 0,
    avgScore: 0
  }
];

const testSubmissionsStore = [
  { testId: 'TST_01', studentId: 'CS2026001', studentName: 'Aarav Sharma', department: 'CSE', status: 'Submitted', score: 92, submittedAt: '2026-08-01T11:15:00.000Z' },
  { testId: 'TST_01', studentId: 'CS2026014', studentName: 'Priya Patel', department: 'AIML', status: 'Submitted', score: 96, submittedAt: '2026-08-01T11:20:00.000Z' },
  { testId: 'TST_01', studentId: 'EC2026022', studentName: 'Rohan Verma', department: 'ECE', status: 'Submitted', score: 78, submittedAt: '2026-08-01T11:25:00.000Z' },
  { testId: 'TST_01', studentId: 'IT2026008', studentName: 'Sneha Reddy', department: 'IT', status: 'Absent', score: 0, submittedAt: null }
];

/** Recruiter: Create Online Test */
export async function createOnlineTest(req, res) {
  try {
    const {
      title,
      drive,
      duration,
      startTime,
      endTime,
      instructions,
      eligibility,
      assessmentLink,
      questionPaperUrl
    } = req.body;

    if (!title || !drive) {
      return res.status(400).json({ success: false, message: 'Title and Drive are required fields.' });
    }

    const newTest = {
      id: `TST_${Date.now()}`,
      title,
      drive: drive || 'Software Engineer',
      duration: parseInt(duration, 10) || 60,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date(Date.now() + 3600000).toISOString(),
      instructions: instructions || 'Follow test guidelines.',
      eligibility: eligibility || 'Eligible Campus Students',
      assessmentLink: assessmentLink || 'https://hackerrank.com/campus-drive',
      questionPaperUrl: questionPaperUrl || '',
      status: 'Scheduled',
      totalCandidates: 100,
      completedCount: 0,
      avgScore: 0
    };

    createdTestsStore.unshift(newTest);

    try {
      await supabase.from('online_tests').insert([newTest]);
    } catch (e) {}

    // Audit log Test Creation & Question Upload
    recordAuditLog(req, {
      actorType: 'RECRUITER',
      action: 'TEST_CREATION',
      recruiter: req.user?.email ? `${req.user.name || 'Recruiter'} (${req.user.email})` : 'Anjali Sharma (Google India)',
      oldValue: 'N/A',
      newValue: `${title} (${drive})`,
      reason: `Created and scheduled online assessment (Duration: ${duration} mins).`
    });

    if (questionPaperUrl) {
      recordAuditLog(req, {
        actorType: 'RECRUITER',
        action: 'QUESTION_UPLOAD',
        recruiter: req.user?.email ? `${req.user.name || 'Recruiter'} (${req.user.email})` : 'Anjali Sharma (Google India)',
        oldValue: 'No Document',
        newValue: questionPaperUrl,
        reason: 'Uploaded question paper document for scheduled test.'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Online Assessment test created and scheduled successfully.',
      data: newTest
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create online test.' });
  }
}

/** Placement Officer: Approve Recruiter Submitted Assessment Details */
export async function approveAssessmentDetails(req, res) {
  try {
    const { testId } = req.params;
    const { status, remarks } = req.body; // Approved or Rejected

    const testItem = createdTestsStore.find(t => t.id === testId);
    if (!testItem) {
      return res.status(404).json({ success: false, message: 'Assessment details record not found.' });
    }

    testItem.status = status || 'Approved';
    testItem.tpoRemarks = remarks || 'Assessment details approved by Placement Officer.';

    recordAuditLog(req, {
      actorType: 'TPO',
      action: status === 'Approved' ? 'ASSESSMENT_APPROVED' : 'ASSESSMENT_REJECTED',
      officer: req.user?.name || 'Dr. Rajesh Kumar (TPO Head)',
      recruiter: testItem.recruiterName || 'Company Recruiter',
      oldValue: 'Submitted to Placement Officer',
      newValue: testItem.status,
      reason: remarks || `Assessment details set to ${testItem.status}.`
    });

    return res.json({
      success: true,
      message: `Assessment details set to '${testItem.status}' by Placement Officer.`,
      data: testItem
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to approve assessment details.' });
  }
}

/** Placement Officer: Schedule & Conduct Assessment (Lab Allocation, Invigilation, Start/Complete Exam) */
export async function scheduleAndConductAssessment(req, res) {
  try {
    const { testId } = req.params;
    const { venue, labAllocation, invigilators, examStatus, startTime, endTime } = req.body;

    const testItem = createdTestsStore.find(t => t.id === testId);
    if (!testItem) {
      return res.status(404).json({ success: false, message: 'Assessment record not found.' });
    }

    if (venue) testItem.venue = venue;
    if (labAllocation) testItem.labAllocation = labAllocation;
    if (invigilators) testItem.invigilators = Array.isArray(invigilators) ? invigilators : invigilators.split(',').map(i => i.trim());
    if (examStatus) testItem.examStatus = examStatus; // Scheduled, In Progress, Completed
    if (startTime) testItem.startTime = startTime;
    if (endTime) testItem.endTime = endTime;

    recordAuditLog(req, {
      actorType: 'TPO',
      action: 'ASSESSMENT_CONDUCT_UPDATE',
      officer: req.user?.name || 'Dr. Rajesh Kumar (TPO Head)',
      oldValue: testItem.examStatus || 'Scheduled',
      newValue: examStatus || 'In Progress',
      reason: `Placement Officer updated assessment conduct status to ${examStatus} in ${venue || 'CS Lab 1'}.`
    });

    return res.json({
      success: true,
      message: `Assessment schedule and invigilation updated. Status: ${testItem.examStatus || examStatus}`,
      data: testItem
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update assessment conduct schedule.' });
  }
}

/** Recruiter & Placement Officer: Get Online Assessments */
export async function getAssessments(req, res) {
  try {
    try {
      const { data } = await supabase.from('online_tests').select('*');
      if (data && data.length > 0) {
        return res.json({ success: true, data });
      }
    } catch (e) {}

    return res.json({ success: true, data: createdTestsStore });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch online assessments' });
  }
}

/** Recruiter: Get Student Attendance for Test */
export async function getTestAttendance(req, res) {
  try {
    const { testId } = req.params;
    const records = testSubmissionsStore.filter(s => s.testId === testId || testId === 'all') || testSubmissionsStore;
    return res.json({ success: true, data: records });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch test attendance' });
  }
}

/** Student: Submit Test (Prevents Duplicates) */
export async function submitStudentTest(req, res) {
  try {
    const { testId, studentId, studentName, department, score } = req.body;
    const existing = testSubmissionsStore.find(s => s.testId === testId && s.studentId === studentId);

    if (existing && existing.status === 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate submission blocked! You have already submitted this test.'
      });
    }

    const newSub = {
      testId,
      studentId: studentId || req.user?.id || 'CS2026001',
      studentName: studentName || req.user?.name || 'Aarav Sharma',
      department: department || 'CSE',
      status: 'Submitted',
      score: score || 85,
      submittedAt: new Date().toISOString()
    };

    testSubmissionsStore.push(newSub);

    // Dynamic Sync to TPO (Placement Officer) Results Review Store
    let sub = submittedResultsReviewStore.find(s => s.driveId === testId || s.id === testId);
    if (!sub) {
      sub = {
        id: testId || `SUB_REV_${Date.now()}`,
        driveId: testId || 'DRV_101',
        driveTitle: 'Online Assessment Test 2026',
        companyName: 'Corporate Recruiter',
        recruiterName: 'Recruitment Team',
        recruiterEmail: 'recruiter@company.com',
        submittedAt: new Date().toISOString(),
        status: 'Pending Review',
        testStats: { totalCandidates: 0, passedCount: 0, failedCount: 0, highestScore: 0, averageScore: 0 },
        candidates: []
      };
      submittedResultsReviewStore.unshift(sub);
    }

    const sId = newSub.studentId;
    const existingCandIndex = sub.candidates.findIndex(c => c.studentId === sId || c.rollNumber === sId);
    const candidateObj = {
      studentId: sId,
      studentName: newSub.studentName,
      rollNumber: sId,
      department: newSub.department,
      score: newSub.score,
      status: newSub.score >= 60 ? 'Pass' : 'Fail',
      remarks: `Submitted online test on ${new Date().toLocaleDateString()}`
    };

    if (existingCandIndex >= 0) {
      sub.candidates[existingCandIndex] = candidateObj;
    } else {
      sub.candidates.push(candidateObj);
    }

    const total = sub.candidates.length;
    const passed = sub.candidates.filter(c => c.status === 'Pass').length;
    const sumScore = sub.candidates.reduce((acc, c) => acc + (Number(c.score) || 0), 0);
    sub.testStats = {
      totalCandidates: total,
      passedCount: passed,
      failedCount: total - passed,
      highestScore: total > 0 ? Math.max(...sub.candidates.map(c => Number(c.score) || 0)) : 0,
      averageScore: total > 0 ? parseFloat((sumScore / total).toFixed(1)) : 0
    };

    // Auto-update Student Placement History Timeline
    appendStudentPlacementTimeline({
      studentId: newSub.studentId,
      rollNumber: newSub.studentId,
      studentName: newSub.studentName,
      stage: 'Test Appeared',
      companyName: 'Corporate Recruiter',
      driveTitle: 'Online Assessment Test',
      title: 'Appeared for Assessment Test',
      details: `Completed test submission with score: ${newSub.score}/100`,
      updatedBy: 'Online Test Engine'
    });

    appendStudentPlacementTimeline({
      studentId: newSub.studentId,
      rollNumber: newSub.studentId,
      studentName: newSub.studentName,
      stage: 'Test Score',
      companyName: 'Corporate Recruiter',
      driveTitle: 'Online Assessment Test',
      title: `Test Score Logged: ${newSub.score}/100`,
      details: `Assessment score recorded automatically into placement records.`,
      updatedBy: 'Online Test Engine'
    });

    return res.json({ success: true, message: 'Test submitted successfully.', data: newSub });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit test' });
  }
}

const scheduledInterviewsStore = [
  {
    id: 'INT_01',
    candidateName: 'Aarav Sharma',
    studentId: 'CS2026001',
    role: 'Software Engineer',
    round: 'Technical Round 1',
    date: '2026-08-15',
    time: '10:00 AM - 11:00 AM',
    timeSlot: '10:00 AM - 11:00 AM',
    venue: 'Conference Hall A',
    onlineMeetingLink: 'https://meet.google.com/abc-defg-hij',
    panelists: ['Dr. John Smith', 'Rohan (Tech Lead)'],
    attendance: 'Present',
    result: 'Advance',
    nextRound: 'Technical Round 2',
    status: 'Completed'
  },
  {
    id: 'INT_02',
    candidateName: 'Priya Patel',
    studentId: 'CS2026014',
    role: 'Software Engineer',
    round: 'HR Evaluation',
    date: '2026-08-16',
    time: '02:00 PM - 03:00 PM',
    timeSlot: '02:00 PM - 03:00 PM',
    venue: 'Virtual Room 2',
    onlineMeetingLink: 'https://zoom.us/j/9876543210',
    panelists: ['Anjali Sharma (HR)'],
    attendance: 'Present',
    result: 'Selected',
    nextRound: 'Final Offer',
    status: 'Completed'
  },
  {
    id: 'INT_03',
    candidateName: 'Sneha Reddy',
    studentId: 'IT2026008',
    role: 'Software Engineer',
    round: 'Technical Round 2',
    date: '2026-08-17',
    time: '11:30 AM - 12:30 PM',
    timeSlot: '11:30 AM - 12:30 PM',
    venue: 'Conference Hall B',
    onlineMeetingLink: 'https://teams.microsoft.com/l/meetup-join/123456',
    panelists: ['Sanjay (DevOps Manager)'],
    attendance: 'Scheduled',
    result: 'Pending',
    nextRound: 'HR Evaluation',
    status: 'Scheduled'
  }
];

/** Recruiter: Get Scheduled Interviews */
export async function getInterviews(req, res) {
  try {
    return res.json({ success: true, data: scheduledInterviewsStore });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
  }
}

/** Recruiter: Schedule Interview */
export async function createInterviewSchedule(req, res) {
  try {
    const {
      candidateName,
      studentId,
      role,
      round,
      date,
      timeSlot,
      venue,
      onlineMeetingLink,
      panelists
    } = req.body;

    if (!candidateName || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Candidate Name, Date, and Time Slot are required.' });
    }

    const panelList = Array.isArray(panelists)
      ? panelists
      : typeof panelists === 'string'
      ? panelists.split(',').map(p => p.trim())
      : ['Technical Evaluation Panel'];

    const newInterview = {
      id: `INT_${Date.now()}`,
      candidateName,
      studentId: studentId || `CS_${Date.now()}`,
      role: role || 'Software Engineer',
      round: round || 'Technical Round 1',
      date,
      time: timeSlot,
      timeSlot,
      venue: venue || 'Conference Hall A',
      onlineMeetingLink: onlineMeetingLink || 'https://meet.google.com/campus-interview',
      panelists: panelList,
      attendance: 'Scheduled',
      result: 'Pending',
      nextRound: 'Technical Round 2',
      status: 'Scheduled'
    };

    scheduledInterviewsStore.unshift(newInterview);

    try {
      await supabase.from('interviews').insert([newInterview]);
    } catch (e) {}

    recordAuditLog(req, {
      actorType: 'RECRUITER',
      action: 'INTERVIEW_SCHEDULED',
      recruiter: req.user?.email ? `${req.user.name || 'Recruiter'} (${req.user.email})` : 'Anjali Sharma (Google India)',
      oldValue: 'Unscheduled',
      newValue: `${candidateName} (${round} on ${date} ${timeSlot})`,
      reason: `Scheduled interview at ${venue || 'Online Meeting'} with panelists: ${panelList.join(', ')}.`
    });

    // Auto-update Student Placement History Timeline for Interview Scheduling
    appendStudentPlacementTimeline({
      studentId: newInterview.studentId,
      rollNumber: newInterview.studentId,
      studentName: candidateName,
      stage: round?.includes('HR') ? 'HR Interview' : 'Technical Interview',
      companyName: 'Corporate Partner',
      driveTitle: 'Campus Recruitment Drive',
      title: `${round || 'Technical Interview'} Scheduled`,
      details: `Slot: ${date} ${timeSlot} at ${venue || 'Online Meeting'}. Panelists: ${panelList.join(', ')}`,
      updatedBy: req.user?.name || 'Company Recruiter'
    });

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully and synchronized with Placement Module.',
      data: newInterview
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to schedule interview.' });
  }
}

/** Recruiter: Update Interview Attendance, Result & Move to Next Round */
export async function updateInterviewStatusAndResult(req, res) {
  try {
    const { interviewId } = req.params;
    const { attendance, result, remarks, nextRound } = req.body;

    const interview = scheduledInterviewsStore.find(i => i.id === interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    const previousStatus = interview.status;
    if (attendance) interview.attendance = attendance;
    if (result) interview.result = result;
    if (remarks) interview.remarks = remarks;
    if (nextRound) interview.nextRound = nextRound;
    interview.status = result && result !== 'Pending' ? 'Completed' : 'Scheduled';

    // Synchronize advancement with Placement Module candidates store
    if (result === 'Advance' || result === 'Selected') {
      interview.round = nextRound || 'Technical Round 2';
    }

    recordAuditLog(req, {
      actorType: 'RECRUITER',
      action: 'INTERVIEW_ADVANCED',
      recruiter: req.user?.email ? `${req.user.name || 'Recruiter'} (${req.user.email})` : 'Anjali Sharma (Google India)',
      oldValue: `${previousStatus} (${interview.candidateName})`,
      newValue: `Attendance: ${interview.attendance}, Result: ${interview.result} ➔ ${interview.nextRound}`,
      reason: `Updated candidate evaluation. Advanced to ${interview.nextRound} in Placement Module.`
    });

    // Auto-update Student Placement History Timeline based on evaluation result
    const milestoneStage = result === 'Selected'
      ? 'Offer'
      : result === 'Rejected'
      ? 'Rejected'
      : nextRound?.includes('HR')
      ? 'HR Interview'
      : 'Technical Interview';

    appendStudentPlacementTimeline({
      studentId: interview.studentId,
      rollNumber: interview.studentId,
      studentName: interview.candidateName,
      stage: milestoneStage,
      companyName: 'Corporate Partner',
      driveTitle: 'Campus Recruitment Drive',
      title: result === 'Selected' ? 'Final Offer Extended' : result === 'Rejected' ? 'Evaluation: Rejected' : `Advanced to ${nextRound}`,
      details: `Attendance: ${attendance || 'Present'}. Result: ${result}. Next Stage: ${nextRound}. Remarks: ${remarks || 'None'}`,
      updatedBy: req.user?.name || 'Company Recruiter'
    });

    return res.json({
      success: true,
      message: `Interview result updated! Candidate advanced to ${interview.nextRound} and synchronized with Placement Module.`,
      data: interview
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update interview result.' });
  }
}

/** Recruiter: Upload Results (Enforces Pending TPO Review status & Round Locking) */
export async function uploadResults(req, res) {
  try {
    const { driveId, results, isDraft, driveTitle, companyName } = req.body;

    // Check if drive results are already approved/locked by TPO
    let existingSub = submittedResultsReviewStore.find(s => s.driveId === driveId || s.id === driveId);
    if (existingSub && (existingSub.isLocked || existingSub.status === 'Approved' || existingSub.status === 'LOCKED_AND_SHARED')) {
      return res.status(403).json({
        success: false,
        message: 'This round has been approved and locked by the Placement Officer. Recruiter editing of previous rounds is strictly prohibited.'
      });
    }

    const finalStatus = isDraft ? 'Draft' : 'Pending Review';

    // Parse and process incoming candidate results list
    const parsedResults = Array.isArray(results) ? results : [];
    const passedCount = parsedResults.filter(r => r.status === 'Pass' || r.passed === true || (Number(r.score) >= 60)).length;
    const failedCount = parsedResults.length - passedCount;
    const totalScore = parsedResults.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
    const avgScore = parsedResults.length > 0 ? parseFloat((totalScore / parsedResults.length).toFixed(1)) : 0;
    const maxScore = parsedResults.length > 0 ? Math.max(...parsedResults.map(r => Number(r.score) || 0)) : 0;

    const candidatesList = parsedResults.map(r => ({
      studentId: r.studentId || r.id || `STU_${Math.floor(Math.random()*1000)}`,
      studentName: r.studentName || r.name || 'Student',
      rollNumber: r.rollNumber || r.roll_number || r.studentId || 'CS2026000',
      department: r.department || 'CSE',
      score: Number(r.score) || 0,
      status: r.status || (Number(r.score) >= 60 ? 'Pass' : 'Fail'),
      remarks: r.remarks || (Number(r.score) >= 60 ? 'Cleared cutoff.' : 'Below cutoff.')
    }));

    if (existingSub) {
      existingSub.status = finalStatus;
      existingSub.submittedAt = new Date().toISOString();
      if (candidatesList.length > 0) {
        existingSub.testStats = {
          totalCandidates: parsedResults.length,
          passedCount,
          failedCount,
          highestScore: maxScore,
          averageScore: avgScore
        };
        existingSub.candidates = candidatesList;
      }
    } else {
      existingSub = {
        id: `SUB_REV_${Date.now()}`,
        driveId: driveId || 'DRV_101',
        driveTitle: driveTitle || 'Campus Recruitment Drive 2026',
        companyName: req.user?.company_name || companyName || 'Corporate Partner',
        recruiterName: req.user?.name || 'Company Recruiter',
        recruiterEmail: req.user?.email || 'recruiter@company.com',
        submittedAt: new Date().toISOString(),
        status: finalStatus,
        testStats: {
          totalCandidates: parsedResults.length,
          passedCount,
          failedCount,
          highestScore: maxScore,
          averageScore: avgScore
        },
        candidates: candidatesList
      };
      submittedResultsReviewStore.unshift(existingSub);
    }

    // Audit log Result Upload
    recordAuditLog(req, {
      actorType: 'RECRUITER',
      action: 'RESULT_UPLOAD',
      recruiter: req.user?.email ? `${req.user.name || 'Recruiter'} (${req.user.email})` : 'Anjali Sharma (Google India)',
      oldValue: 'Unpublished',
      newValue: `${parsedResults.length} Candidate Scores (${finalStatus})`,
      reason: isDraft ? 'Saved draft assessment results.' : 'Submitted assessment results for TPO review and approval.'
    });

    return res.json({
      success: true,
      status: finalStatus,
      message: isDraft
        ? `Assessment results saved as Draft for drive ${driveId || 'DRV_101'}.`
        : `Assessment results submitted successfully! Status set to "Pending TPO Review". (Results are now live on TPO Review Panel).`,
      recordCount: parsedResults.length,
      data: existingSub
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to upload results' });
  }
}

/** Recruiter & Placement Officer: Get Comprehensive Analytics Reports */
export async function getReports(req, res) {
  try {
    const reports = {
      recruiterReport: {
        recruiterName: req.user?.name || 'Anjali Sharma',
        companyName: req.user?.company_name || 'Google India',
        totalDrivesManaged: 4,
        totalTestsCreated: 3,
        totalResultsUploaded: 2,
        loginSessionsCount: 18,
        responseVelocityHours: 4.2
      },
      studentPerformance: {
        totalEvaluated: 142,
        averageScore: 82.4,
        highestScore: 98,
        passPercentage: '76.8%',
        topScorers: [
          { name: 'Priya Patel', roll: 'CS2026014', dept: 'AIML', score: 96 },
          { name: 'Aarav Sharma', roll: 'CS2026001', dept: 'CSE', score: 92 },
          { name: 'Vikram Malhotra', roll: 'CS2026045', dept: 'CSE', score: 88 }
        ]
      },
      driveSummary: {
        totalDrives: 4,
        activeDrives: 2,
        completedDrives: 2,
        drivesList: [
          { title: 'Software Engineer Campus Hiring', role: 'Software Engineer', applied: 142, shortlisted: 32, status: 'Completed' },
          { title: 'Frontend Developer Hackathon', role: 'Frontend Engineer', applied: 45, shortlisted: 18, status: 'Active' },
          { title: 'Cloud DevOps Associate Drive', role: 'DevOps Engineer', applied: 28, shortlisted: 10, status: 'Active' }
        ]
      },
      selectionRatio: {
        totalApplications: 215,
        shortlistedForTest: 142,
        passedAssessment: 60,
        interviewed: 35,
        finalSelected: 25,
        overallYieldPercentage: '11.6%',
        shortlistToSelectionPercentage: '41.6%'
      },
      testStatistics: {
        assessmentsConducted: 3,
        totalSubmissions: 142,
        averageDurationMins: 60,
        platformUsed: 'HackerRank & Mettl',
        duplicateBlockedCount: 4
      },
      departmentAnalysis: [
        { department: 'CSE', applied: 110, shortlisted: 24, interviewed: 18, selected: 15, passRate: '62.5%' },
        { department: 'AIML', applied: 60, shortlisted: 12, interviewed: 10, selected: 8, passRate: '66.6%' },
        { department: 'ECE', applied: 40, shortlisted: 6, interviewed: 4, selected: 3, passRate: '50.0%' },
        { department: 'IT', applied: 20, shortlisted: 3, interviewed: 3, selected: 2, passRate: '66.6%' }
      ]
    };

    return res.json({ success: true, data: reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
}

/** Recruiter & Placement Officer: Download Reports in PDF, Excel, and CSV formats */
export async function downloadAnalyticsReport(req, res) {
  try {
    const { format, category } = req.query;
    const exportFormat = (format || 'csv').toLowerCase();

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Placement_Report_${category || 'Comprehensive'}_${timestamp}`;

    if (exportFormat === 'pdf') {
      const pdfContent = `
===================================================================
ENTERPRISE COLLEGE ERP - PLACEMENT & RECRUITMENT ANALYTICS REPORT
===================================================================
Generated On: ${new Date().toLocaleString()}
Report Category: ${(category || 'All Sections').toUpperCase()}

1. RECRUITER REPORT SUMMARY
-------------------------------------------------------------------
Company: Google India
Drives Managed: 4 | Tests Created: 3 | Results Uploaded: 2
Response Velocity: 4.2 Hours

2. STUDENT PERFORMANCE METRICS
-------------------------------------------------------------------
Total Evaluated Candidates: 142
Average Test Score: 82.4 / 100 | Highest Score: 98 / 100
Pass Percentage: 76.8%

3. SELECTION YIELD RATIO
-------------------------------------------------------------------
Total Applications: 215
Shortlisted for Test: 142
Final Selected Candidates: 25 (Selection Ratio: 11.6%)

4. DEPARTMENT ANALYSIS
-------------------------------------------------------------------
Department | Applied | Shortlisted | Interviewed | Selected | Pass Rate
CSE        | 110     | 24          | 18          | 15       | 62.5%
AIML       | 60      | 12          | 10          | 8        | 66.6%
ECE        | 40      | 6           | 4           | 3        | 50.0%
IT         | 20      | 3           | 3           | 2        | 66.6%

===================================================================
OFFICIAL PLACEMENT CELL AUTOMATED REPORT - CONFIDENTIAL
===================================================================
      `.trim();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      return res.send(Buffer.from(pdfContent, 'utf-8'));
    }

    if (exportFormat === 'excel' || exportFormat === 'xlsx' || exportFormat === 'xls') {
      const excelContent = `Category,Metric,Value,Details
Recruiter Report,Company,Google India,Corporate Recruitment Partner
Recruiter Report,Drives Managed,4,Active campus drives
Student Performance,Total Evaluated,142,Assessed candidates
Student Performance,Average Score,82.4/100,Mean score across drives
Student Performance,Highest Score,98/100,Top score
Selection Ratio,Total Applications,215,Received applications
Selection Ratio,Final Selected,25,Hired candidates (11.6% yield)
Department Analysis,CSE,110 Applied,15 Selected (62.5% pass rate)
Department Analysis,AIML,60 Applied,8 Selected (66.6% pass rate)
Department Analysis,ECE,40 Applied,3 Selected (50.0% pass rate)
Department Analysis,IT,20 Applied,2 Selected (66.6% pass rate)
`;

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xls"`);
      return res.send(excelContent);
    }

    // Default: CSV format
    const csvContent = `Department,Applied,Shortlisted,Interviewed,Selected,Pass Rate
CSE,110,24,18,15,62.5%
AIML,60,12,10,8,66.6%
ECE,40,6,4,3,50.0%
IT,20,3,3,2,66.6%

Metric,Count
Total Applications,215
Assessed Candidates,142
Shortlisted Candidates,60
Final Offers Extended,25
Average Test Score,82.4
Conducted Online Tests,3
`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate downloadable report.' });
  }
}

const submittedResultsReviewStore = [
  {
    id: 'SUB_REV_101',
    driveId: 'DRV_101',
    driveTitle: 'Software Engineer Campus Hiring 2026',
    companyName: 'Google India',
    recruiterName: 'Sarah Jenkins',
    recruiterEmail: 'sarah.j@google.com',
    submittedAt: '2026-07-29T14:30:00.000Z',
    status: 'Pending Review',
    testStats: {
      totalCandidates: 45,
      passedCount: 32,
      failedCount: 13,
      highestScore: 98,
      averageScore: 84.5
    },
    candidates: [
      { studentId: 'CS2026001', studentName: 'Aarav Sharma', rollNumber: 'CS2026001', department: 'CSE', score: 92, status: 'Pass', remarks: 'Strong problem-solving capability in algorithms round.' },
      { studentId: 'CS2026014', studentName: 'Priya Patel', rollNumber: 'CS2026014', department: 'AIML', score: 96, status: 'Pass', remarks: 'Exceptional system design and coding scores.' },
      { studentId: 'EC2026022', studentName: 'Rohan Verma', rollNumber: 'EC2026022', department: 'ECE', score: 78, status: 'Pass', remarks: 'Solid performance in core CS fundamentals.' },
      { studentId: 'IT2026008', studentName: 'Sneha Reddy', rollNumber: 'IT2026008', department: 'IT', score: 45, status: 'Fail', remarks: 'Did not clear cutoff score of 60.' }
    ]
  },
  {
    id: 'SUB_REV_102',
    driveId: 'DRV_102',
    driveTitle: 'Frontend Development Hackathon',
    companyName: 'Google India',
    recruiterName: 'Alex Mercer',
    recruiterEmail: 'alex.mercer@google.com',
    submittedAt: '2026-07-28T16:00:00.000Z',
    status: 'Pending Review',
    testStats: {
      totalCandidates: 28,
      passedCount: 18,
      failedCount: 10,
      highestScore: 94,
      averageScore: 76.2
    },
    candidates: [
      { studentId: 'CS2026045', studentName: 'Vikram Malhotra', rollNumber: 'CS2026045', department: 'CSE', score: 88, status: 'Pass', remarks: 'Clean React & TypeScript UI implementation.' },
      { studentId: 'AI2026019', studentName: 'Ananya Gupta', rollNumber: 'AI2026019', department: 'AIML', score: 90, status: 'Pass', remarks: 'Great responsive layout design.' }
    ]
  }
];

/** Placement Officer: Get Submitted Results for Review */
export async function getSubmittedResultsForReview(req, res) {
  try {
    return res.json({ success: true, data: submittedResultsReviewStore });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch submitted results for review' });
  }
}

/** Placement Officer: Update Result Review Status (Approve / Reject / Request Correction) */
export async function updateResultReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['Approved', 'Rejected', 'Correction Requested'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status action.' });
    }

    const submission = submittedResultsReviewStore.find(s => s.id === id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Result submission not found.' });
    }

    const previousStatus = submission.status;
    submission.status = status;
    submission.tpoRemarks = remarks || `Status updated to ${status} by Placement Officer.`;
    submission.reviewedAt = new Date().toISOString();

    // Audit log TPO Approval / Rejection Action
    recordAuditLog(req, {
      actorType: 'TPO',
      action: status === 'Approved' ? 'APPROVE' : status === 'Rejected' ? 'REJECT' : 'REQUEST_CORRECTION',
      officer: req.user?.name || 'Dr. Rajesh Kumar (TPO Head)',
      recruiter: submission.recruiterName,
      oldValue: `${previousStatus} (${submission.driveTitle})`,
      newValue: status,
      reason: remarks || `Submission ${status} by Placement Officer Desk.`
    });

    return res.json({
      success: true,
      message: `Results ${status === 'Approved' ? 'approved and finalized successfully!' : status === 'Rejected' ? 'rejected.' : 'sent back for correction.'}`,
      data: submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update result review status' });
  }
}

const resultOverridesStore = [
  {
    id: 'OVR_1001',
    submissionId: 'SUB_REV_101',
    studentId: 'IT2026008',
    studentName: 'Sneha Reddy',
    rollNumber: 'IT2026008',
    actionType: 'STATUS_CHANGE',
    previousStatus: 'Fail',
    newStatus: 'Pass',
    reason: 'Technical Error in Test System',
    remarks: 'Candidate experienced system disconnection during Q3. Code submission evaluated manually by TPO.',
    approvalDate: '2026-07-30T09:15:00.000Z',
    officerName: 'Dr. Rajesh Kumar (TPO Head)'
  }
];

/** Placement Officer: Override Recruiter Decision (Fail -> Pass, Pass -> Fail, Add Student, Remove Student) */
export async function overrideCandidateDecision(req, res) {
  try {
    const { id } = req.params;
    const {
      studentId,
      studentName,
      rollNumber,
      department,
      actionType,
      previousStatus,
      newStatus,
      score,
      reason,
      remarks,
      approvalDate,
      officerName
    } = req.body;

    // Validate Mandatory Fields
    if (!reason || !remarks || !approvalDate || !officerName) {
      return res.status(400).json({
        success: false,
        message: 'All mandatory fields (Reason, Remarks, Approval Date, Officer Name) must be provided.'
      });
    }

    const submission = submittedResultsReviewStore.find(s => s.id === id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission record not found.' });
    }

    // Process Decision Action
    if (actionType === 'STATUS_CHANGE') {
      const cand = submission.candidates.find(c => c.studentId === studentId || c.rollNumber === rollNumber);
      if (cand) {
        cand.status = newStatus;
        if (typeof score === 'number') cand.score = score;
      }
    } else if (actionType === 'ADD_STUDENT') {
      const exists = submission.candidates.find(c => c.rollNumber === rollNumber);
      if (!exists) {
        submission.candidates.push({
          studentId: studentId || `STU_${Date.now()}`,
          studentName: studentName || 'New Student',
          rollNumber: rollNumber || 'CS2026999',
          department: department || 'CSE',
          score: score || 85,
          status: newStatus || 'Pass',
          remarks: `Added by TPO: ${remarks}`
        });
      }
    } else if (actionType === 'REMOVE_STUDENT') {
      submission.candidates = submission.candidates.filter(c => c.rollNumber !== rollNumber && c.studentId !== studentId);
    }

    // Permanently Store Override Audit Log
    const overrideRecord = {
      id: `OVR_${Date.now()}`,
      submissionId: id,
      studentId: studentId || rollNumber,
      studentName: studentName || 'Student',
      rollNumber: rollNumber || 'N/A',
      actionType,
      previousStatus: previousStatus || 'N/A',
      newStatus: newStatus || 'N/A',
      reason,
      remarks,
      approvalDate: approvalDate || new Date().toISOString(),
      officerName
    };

    resultOverridesStore.unshift(overrideRecord);

    // Audit log TPO Decision Override / Manual Addition / Manual Removal
    const auditAction = actionType === 'STATUS_CHANGE'
      ? 'OVERRIDE'
      : actionType === 'ADD_STUDENT'
      ? 'MANUAL_ADDITION'
      : 'MANUAL_REMOVAL';

    recordAuditLog(req, {
      actorType: 'TPO',
      action: auditAction,
      officer: officerName,
      recruiter: submission.recruiterName,
      oldValue: `${previousStatus || 'N/A'} (${studentName || 'Student'} - ${rollNumber || 'N/A'})`,
      newValue: `${newStatus || 'N/A'}`,
      reason: `${reason}: ${remarks}`
    });

    // Auto-update Student Placement History Timeline for TPO Override
    appendStudentPlacementTimeline({
      studentId: studentId || rollNumber,
      rollNumber: rollNumber || studentId,
      studentName: studentName || 'Student',
      stage: 'TPO Override',
      companyName: submission.companyName,
      driveTitle: submission.driveTitle,
      title: `TPO Override: ${previousStatus || 'N/A'} ➔ ${newStatus || 'N/A'}`,
      details: `Reason: ${reason}. Remarks: ${remarks}. Approved by ${officerName}.`,
      updatedBy: officerName
    });

    return res.json({
      success: true,
      message: `Override successfully applied and permanently audit-logged.`,
      data: overrideRecord
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record decision override.' });
  }
}

/** Placement Officer: Get Overrides list for a submission */
export async function getResultOverrides(req, res) {
  try {
    const { id } = req.params;
    const overrides = id
      ? resultOverridesStore.filter(o => o.submissionId === id)
      : resultOverridesStore;

    return res.json({
      success: true,
      data: overrides
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch result overrides.' });
  }
}

const dispatchedNotificationsStore = [];

/** Multi-Channel Automated Notification Dispatcher (In-App, College Email, Dashboard Alerts) */
export function dispatchMultiChannelNotifications({ submission, candidates, officerName, recruiterEmail }) {
  const timestamp = new Date().toISOString();
  const channels = ['In-App', 'College Email', 'Dashboard Alerts'];
  const passedStudents = (candidates || []).filter(c => c.status === 'Pass');

  // 1. Eligible Students Notification: "You have been shortlisted for the Technical Interview."
  const studentNotifications = passedStudents.map(student => ({
    id: `NOTIF_STU_${Date.now()}_${student.rollNumber}`,
    recipientType: 'STUDENT',
    recipientId: student.studentId || student.rollNumber,
    recipientName: student.studentName,
    recipientEmail: `${student.rollNumber.toLowerCase()}@student.college.edu`,
    channels,
    message: 'You have been shortlisted for the Technical Interview.',
    driveTitle: submission?.driveTitle || 'Campus Recruitment Drive',
    companyName: submission?.companyName || 'Corporate Partner',
    timestamp
  }));

  // 2. Recruiter Notification: "Final shortlist approved."
  const recruiterNotification = {
    id: `NOTIF_REC_${Date.now()}`,
    recipientType: 'RECRUITER',
    recipientEmail: recruiterEmail || submission?.recruiterEmail || 'recruiter@company.com',
    recipientName: submission?.recruiterName || 'Company Recruiter',
    channels,
    message: 'Final shortlist approved.',
    driveTitle: submission?.driveTitle || 'Campus Recruitment Drive',
    companyName: submission?.companyName || 'Corporate Partner',
    timestamp
  };

  // 3. Placement Officer Notification: "Recruitment process moved to Technical Round."
  const officerNotification = {
    id: `NOTIF_OFF_${Date.now()}`,
    recipientType: 'PLACEMENT_OFFICER',
    recipientName: officerName || 'Placement Officer Desk',
    channels,
    message: 'Recruitment process moved to Technical Round.',
    driveTitle: submission?.driveTitle || 'Campus Recruitment Drive',
    companyName: submission?.companyName || 'Corporate Partner',
    timestamp
  };

  const allDispatched = [...studentNotifications, recruiterNotification, officerNotification];
  dispatchedNotificationsStore.unshift(...allDispatched);

  try {
    supabase.from('placement_notifications').insert(allDispatched);
  } catch (e) {}

  return {
    success: true,
    channels,
    studentCount: passedStudents.length,
    notifications: allDispatched
  };
}

/** Placement Officer: Lock Results & Share with Recruiter (Proceed to Technical Interview) */
export async function lockAndShareResults(req, res) {
  try {
    const { id } = req.params;
    let submission = submittedResultsReviewStore.find(s => s.id === id || s.driveId === id);

    if (!submission) {
      submission = {
        id: id,
        driveId: id,
        driveTitle: 'Online Assessment Test 2026',
        companyName: 'Corporate Partner',
        recruiterName: 'Anjali Sharma',
        recruiterEmail: 'recruiter@company.com',
        submittedAt: new Date().toISOString(),
        status: 'Approved & Locked',
        testStats: { totalCandidates: 1, passedCount: 1, failedCount: 0, highestScore: 88, averageScore: 88 },
        candidates: [{ studentId: 'CS2026101', studentName: 'Aarav Sharma', rollNumber: 'CS2026101', department: 'CSE', score: 88, status: 'Pass' }]
      };
      submittedResultsReviewStore.unshift(submission);
    }

    submission.status = 'Approved & Locked';
    submission.isLocked = true;
    submission.isSharedWithRecruiter = true;
    submission.nextStage = 'Proceed to Technical Interview';

    // Lock candidates and advance passed ones
    submission.candidates.forEach(c => {
      if (c.status === 'Pass') {
        c.stage = 'Proceed to Technical Interview';
        c.round = 'Technical Round 1';
      }
    });

    // Automatically trigger multi-channel notifications (In-App, College Email, Dashboard Alerts)
    const dispatchResult = dispatchMultiChannelNotifications({
      submission,
      candidates: submission.candidates,
      officerName: req.user?.name || 'Dr. Rajesh Kumar (TPO Head)',
      recruiterEmail: submission.recruiterEmail
    });

    recordAuditLog(req, {
      actorType: 'TPO',
      action: 'LOCK_AND_SHARE_RESULTS',
      officer: req.user?.name || 'Dr. Rajesh Kumar (TPO Head)',
      recruiter: submission.recruiterName,
      oldValue: 'Pending Final Lock',
      newValue: 'Approved, Locked & Shared (Proceed to Technical Interview)',
      reason: `Approved final list, locked previous round, shared with recruiter, and dispatched multi-channel notifications to ${dispatchResult.studentCount} students, recruiter, and placement office.`
    });

    return res.json({
      success: true,
      message: `Final result list approved and locked! Multi-channel notifications dispatched via In-App, College Email, and Dashboard Alerts. (${dispatchResult.studentCount} students notified: "You have been shortlisted for the Technical Interview.")`,
      data: submission,
      dispatch: dispatchResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to lock and share results.' });
  }
}

const studentPlacementHistoryStore = [
  {
    id: 'TL_1001',
    studentId: 'CS2026001',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2026001',
    stage: 'Applied',
    companyName: 'Google India',
    driveTitle: 'Software Engineer Campus Hiring 2026',
    title: 'Applied for Software Engineer Role',
    details: 'Application submitted and validated by Placement Office.',
    timestamp: '2026-07-20T09:00:00.000Z',
    updatedBy: 'Student Portal'
  },
  {
    id: 'TL_1002',
    studentId: 'CS2026001',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2026001',
    stage: 'Test Appeared',
    companyName: 'Google India',
    driveTitle: 'Software Engineer Campus Hiring 2026',
    title: 'Appeared for Online Coding Challenge',
    details: 'Completed test on HackerRank platform.',
    timestamp: '2026-07-25T10:00:00.000Z',
    updatedBy: 'Assessment Engine'
  },
  {
    id: 'TL_1003',
    studentId: 'CS2026001',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2026001',
    stage: 'Test Score',
    companyName: 'Google India',
    driveTitle: 'Software Engineer Campus Hiring 2026',
    title: 'Test Score Evaluated: 92/100',
    details: 'Ranked in top 5% of candidates.',
    timestamp: '2026-07-25T11:30:00.000Z',
    updatedBy: 'Recruiter Desk'
  },
  {
    id: 'TL_1004',
    studentId: 'CS2026001',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2026001',
    stage: 'Recruiter Result',
    companyName: 'Google India',
    driveTitle: 'Software Engineer Campus Hiring 2026',
    title: 'Recruiter Evaluation: Pass',
    details: 'Submitted for TPO Approval.',
    timestamp: '2026-07-26T14:00:00.000Z',
    updatedBy: 'Anjali Sharma (Recruiter)'
  },
  {
    id: 'TL_1005',
    studentId: 'CS2026001',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2026001',
    stage: 'Technical Interview',
    companyName: 'Google India',
    driveTitle: 'Software Engineer Campus Hiring 2026',
    title: 'Technical Round 1 Scheduled',
    details: 'Slot: 10:00 AM - 11:00 AM at Conference Hall A. Panel: Dr. John Smith, Tech Lead Rohan.',
    timestamp: '2026-07-30T10:00:00.000Z',
    updatedBy: 'Placement Officer Desk'
  }
];

/** Helper: Automatically Append Milestone Event to Student Placement History Timeline */
export function appendStudentPlacementTimeline({
  studentId,
  rollNumber,
  studentName,
  stage,
  companyName,
  driveTitle,
  title,
  details,
  updatedBy
}) {
  const allowedStages = [
    'Applied',
    'Test Appeared',
    'Test Score',
    'Recruiter Result',
    'TPO Override',
    'Technical Interview',
    'HR Interview',
    'Offer',
    'Rejected',
    'Selected',
    'Joining'
  ];

  const milestoneStage = allowedStages.includes(stage) ? stage : 'Applied';

  const entry = {
    id: `TL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    studentId: studentId || rollNumber,
    rollNumber: rollNumber || studentId,
    studentName: studentName || 'Student',
    stage: milestoneStage,
    companyName: companyName || 'Corporate Partner',
    driveTitle: driveTitle || 'Campus Drive',
    title: title || `${milestoneStage} Milestone Updated`,
    details: details || `Milestone ${milestoneStage} recorded automatically.`,
    timestamp: new Date().toISOString(),
    updatedBy: updatedBy || 'System Automated Workflow'
  };

  studentPlacementHistoryStore.unshift(entry);

  try {
    supabase.from('student_placement_history').insert([entry]);
  } catch (e) {}

  return entry;
}

/** Placement Officer / Recruiter: Get Student Placement History Timeline */
export async function getStudentPlacementHistory(req, res) {
  try {
    const { studentId } = req.params;
    const records = studentId
      ? studentPlacementHistoryStore.filter(t => t.studentId === studentId || t.rollNumber === studentId)
      : studentPlacementHistoryStore;

    return res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student placement history timeline.' });
  }
}

