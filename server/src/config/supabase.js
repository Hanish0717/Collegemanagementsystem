import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dns from 'dns/promises';
import * as net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, 'mock_db.json');

const debugLog = (msg) => {
  try {
    fs.appendFileSync(path.join(__dirname, '..', '..', 'debug_startup.txt'), `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
};

debugLog("Supabase.js module loading starting");

dotenv.config();

// Configure DATE (OID 1082) parsing to return raw YYYY-MM-DD string instead of converting to Date objects
pkg.types.setTypeParser(1082, (val) => val);

const { Pool } = pkg;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

// Determine if we should run in Database Mock Mode (only if no live PostgreSQL or Supabase credentials are configured)
let isMockMode = (!databaseUrl || databaseUrl.includes('your_supabase_postgresql')) &&
                   (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) ||
                   process.env.FORCE_MOCK_MODE === 'true';

debugLog("databaseUrl: " + databaseUrl + ", isMockMode: " + isMockMode);

if (!isMockMode && databaseUrl) {
  try {
    const hostParts = databaseUrl.split('@')[1]?.split('/')[0]?.split(':');
    const host = hostParts?.[0];
    const port = hostParts?.[1] ? parseInt(hostParts[1], 10) : 5432;
    debugLog("Starting database TCP check for host: " + host + ", port: " + port);
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === 'host.docker.internal';
    if (host && !isLocal) {
      // 1. Resolve DNS
      await Promise.race([
        dns.lookup(host),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);

      // 2. Check if TCP port is reachable
      const portReachable = await new Promise((resolve) => {
        const socket = new net.Socket();
        let isResolved = false;

        const cleanup = () => {
          socket.removeAllListeners('connect');
          socket.removeAllListeners('timeout');
          socket.on('error', () => {});
          socket.destroy();
        };

        const done = (status) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve(status);
        };

        socket.setTimeout(1500);
        socket.once('connect', () => done(true));
        socket.once('timeout', () => done(false));
        socket.once('error', () => done(false));
        
        try {
          socket.connect(port, host);
        } catch (e) {
          done(false);
        }
      });

      if (!portReachable) {
        throw new Error(`TCP port ${port} is unreachable`);
      }
      debugLog("TCP check succeeded!");
    }
  } catch (err) {
    debugLog("TCP check error: " + err.message + ", stack: " + err.stack);
    console.log("⚠️ Database host or port is unreachable (e.g. company wifi restriction). Automatically enabling DATABASE MOCK MODE.");
    isMockMode = true;
    process.env.FORCE_MOCK_MODE = 'true';
  }
}

let activeSupabaseClient;
let getMockDb = () => ({});


if (isMockMode) {
  console.log("🚀 Running backend in DATABASE MOCK MODE because no live database credentials are configured.");
  
  const hashedDefaultPassword = bcrypt.hashSync('password123', 10);

  // In-memory mock database tables using valid UUIDs to satisfy isUUID checks in middleware
  let db = {
    users: [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Super Admin', full_name: 'Super Admin', email: 'superadmin@college.com', password: hashedDefaultPassword, role: 'super-admin', is_verified: true, is_active: true },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Admin', full_name: 'Admin', email: 'admin@college.com', password: hashedDefaultPassword, role: 'admin', is_verified: true, is_active: true },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Faculty', full_name: 'Dr. John Smith', email: 'faculty@college.com', password: hashedDefaultPassword, role: 'faculty', is_verified: true, is_active: true },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Student', full_name: 'Student Demo', email: 'student@college.com', password: hashedDefaultPassword, role: 'student', is_verified: true, is_active: true },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Parent', full_name: 'Parent Demo', email: 'parent@college.com', password: hashedDefaultPassword, role: 'parent', child_email: 'student@college.com', is_verified: true, is_active: true },
      { id: '66666666-6666-6666-6666-666666666666', name: 'Librarian', full_name: 'Librarian Demo', email: 'librarian@college.com', password: hashedDefaultPassword, role: 'librarian', is_verified: true, is_active: true },
      { id: '77777777-7777-7777-7777-777777777777', name: 'Placement Officer', full_name: 'Placement Officer Demo', email: 'placement@college.com', password: hashedDefaultPassword, role: 'placement-officer', is_verified: true, is_active: true },
      { id: '88888888-8888-8888-8888-888888888888', name: 'Hostel Warden', full_name: 'Hostel Warden Demo', email: 'warden@college.com', password: hashedDefaultPassword, role: 'hostel-warden', is_verified: true, is_active: true },
      { id: '99999999-9999-9999-9999-999999999999', name: 'Transport Manager', full_name: 'Transport Manager Demo', email: 'transport@college.com', password: hashedDefaultPassword, role: 'transport-manager', is_verified: true, is_active: true },
      { id: 'e1111111-1111-1111-1111-111111111111', name: 'Exam Cell Officer', full_name: 'Exam Cell Office', email: 'examcell@college.com', password: hashedDefaultPassword, role: 'exam-cell', is_verified: true, is_active: true },
      { id: 'de111111-1111-1111-1111-111111111111', name: 'Dean Academics', full_name: 'Dean Academics Office', email: 'dean@college.com', password: hashedDefaultPassword, role: 'dean', is_verified: true, is_active: true },
      { id: 'ac111111-1111-1111-1111-111111111111', name: 'Accounts Manager', full_name: 'Accounts Office', email: 'accounts@college.com', password: hashedDefaultPassword, role: 'accounts', is_verified: true, is_active: true },
      { id: 'pr111111-1111-1111-1111-111111111111', name: 'Principal', full_name: 'Principal Office', email: 'principal@college.com', password: hashedDefaultPassword, role: 'principal', is_verified: true, is_active: true },
      { id: 'ho111111-1111-1111-1111-111111111111', name: 'HOD CSE', full_name: 'HOD CSE Dept', email: 'hod@college.com', password: hashedDefaultPassword, role: 'hod', is_verified: true, is_active: true },
      { id: 'co111111-1111-1111-1111-111111111111', name: 'Alumni Coordinator', full_name: 'Alumni Coordinator', email: 'alumni.coordinator@college.com', password: hashedDefaultPassword, role: 'alumni-coordinator', is_verified: true, is_active: true },
      { id: 'al111111-1111-1111-1111-111111111111', name: 'Alumni', full_name: 'Alumni Member', email: 'alumni@college.com', password: hashedDefaultPassword, role: 'alumni', is_verified: true, is_active: true }
    ],
    students: [
      {
        id: 's1111111-1111-1111-1111-111111111111',
        full_name: 'Student Demo',
        roll_number: 'CS100001',
        email: 'student@college.com',
        phone_number: '1234567890',
        gender: 'Male',
        date_of_birth: '2004-05-15',
        department: 'CSE',
        year: 3,
        semester: 5,
        section: 'A',
        address: '123 College Ave, Campus Town',
        parent_name: 'Parent Demo',
        parent_phone: '0987654321',
        parent_email: 'parent@college.com',
        cgpa: 8.5,
        attendance_percentage: 92.5,
        is_active: true
      }
    ],
    admins: [
      { id: 'a1111111-1111-1111-1111-111111111111', user_id: '22222222-2222-2222-2222-222222222222', full_name: 'System Admin', email: 'admin@college.com', employee_id: 'ADM001', department: 'CSE', is_active: true }
    ],
    faculty: [
      { id: 'f1111111-1111-1111-1111-111111111111', user_id: '33333333-3333-3333-3333-333333333333', full_name: 'Dr. John Smith', email: 'faculty@college.com', employee_id: 'FAC2020001', department: 'CSE', designation: 'Associate Professor', experience: 12, gender: 'Male', phone_number: '9876543212', status: 'Active', attendance_percentage: 95.0, is_active: true }
    ],
    books: [
      { id: 'b1111111-1111-1111-1111-111111111111', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '9780262033848', category: 'Computer Science', quantity: 5, available_quantity: 4, shelf_location: 'CS-03', publisher: 'MIT Press', edition: '3rd', language: 'English', description: 'The bible of algorithms.', is_active: true },
      { id: 'b2222222-2222-2222-2222-222222222222', title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', isbn: '9780073523323', category: 'Computer Science', quantity: 3, available_quantity: 3, shelf_location: 'CS-05', publisher: 'McGraw-Hill', edition: '6th', language: 'English', description: 'Core database text.', is_active: true }
    ],
    fees: [
      { id: 'fee11111-1111-1111-1111-111111111111', student: 's1111111-1111-1111-1111-111111111111', amount: 2500, type: 'Tuition Fee', due_date: '2026-06-30', status: 'Paid', paid_amount: 2500, payment_date: '2026-05-10', payment_method: 'Online', transaction_id: 'TXN123456', academic_year: '2025-2026', semester: 5 },
      { id: 'fee22222-2222-2222-2222-222222222222', student: 's1111111-1111-1111-1111-111111111111', amount: 800, type: 'Hostel Fee', due_date: '2026-07-15', status: 'Unpaid', paid_amount: 0, academic_year: '2025-2026', semester: 5 }
    ],
    attendance: [
      { id: 'att11111-1111-1111-1111-111111111111', student: 's1111111-1111-1111-1111-111111111111', date: '2026-05-28', status: 'Present', subject: 'Data Structures', remarks: 'Good participation' },
      { id: 'att22222-2222-2222-2222-222222222222', student: 's1111111-1111-1111-1111-111111111111', date: '2026-05-27', status: 'Present', subject: 'Database Systems', remarks: '' },
      { id: 'att33333-3333-3333-3333-333333333333', student: 's1111111-1111-1111-1111-111111111111', date: '2026-05-26', status: 'Absent', subject: 'Algorithms', remarks: 'Medical leave' }
    ],
    assignments: [
      { id: 'as111111-1111-1111-1111-111111111111', title: 'Red-Black Trees Implementation', description: 'Implement RB-Trees insertion and deletion in C++.', subject: 'Data Structures', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), department: 'CSE', year: 3, semester: 5, section: 'A', faculty: '33333333-3333-3333-3333-333333333333', submissions: [] }
    ],
    complaints: [
      { id: 'c1111111-1111-1111-1111-111111111111', title: 'Lab 2 AC issue', description: 'The AC in Computer Science Lab 2 has been malfunctioning for a week.', category: 'Infrastructure', user_id: '44444444-4444-4444-4444-444444444444', status: 'Pending', remarks: '' }
    ],
    leave_requests: [
      { id: 'lr111111-1111-1111-1111-111111111111', user_id: '44444444-4444-4444-4444-444444444444', type: 'Sick Leave', from_date: '2026-05-25', to_date: '2026-05-26', days: 2, reason: 'High fever', status: 'Approved', comments: 'Get well soon.' }
    ],
    results: [
      { id: 'r1111111-1111-1111-1111-111111111111', student: '44444444-4444-4444-4444-444444444444', subject: 'Data Structures', credits: 4, marks: 88, grade: 'A', semester: 5 },
      { id: 'r2222222-2222-2222-2222-222222222222', student: '44444444-4444-4444-4444-444444444444', subject: 'Database Systems', credits: 3, marks: 78, grade: 'B+', semester: 5 },
      { id: 'r3333333-3333-3333-3333-333333333333', student: '44444444-4444-4444-4444-444444444444', subject: 'Algorithms', credits: 4, marks: 92, grade: 'A+', semester: 5 }
    ],
    study_materials: [
      { id: 'sm111111-1111-1111-1111-111111111111', title: 'SQL Cheatsheet', subject: 'Database Systems', type: 'PDF', file_url: 'https://example.com/sql.pdf', department: 'CSE', year: 3, semester: 5, faculty: '33333333-3333-3333-3333-333333333333' }
    ],
    timetable: [
      { id: 't1111111-1111-1111-1111-111111111111', day: 'Monday', start_time: '09:00 AM', end_time: '10:00 AM', subject: 'Data Structures', faculty_name: 'Dr. John Smith', room: 'LH-101', department: 'CSE', year: 3, semester: 5, section: 'A' },
      { id: 't2222222-2222-2222-2222-222222222222', day: 'Monday', start_time: '10:00 AM', end_time: '11:00 AM', subject: 'Database Systems', faculty_name: 'Dr. John Smith', room: 'LH-101', department: 'CSE', year: 3, semester: 5, section: 'A' }
    ],
    otps: [],
    faculty_attendance: [
      { id: 'fa111111-1111-1111-1111-111111111111', faculty: 'f1111111-1111-1111-1111-111111111111', date: '2026-05-28', status: 'present', remarks: 'On duty' },
      { id: 'fa222222-2222-2222-2222-222222222222', faculty: 'f1111111-1111-1111-1111-111111111111', date: '2026-05-27', status: 'present', remarks: '' },
      { id: 'fa333333-3333-3333-3333-333333333333', faculty: 'f1111111-1111-1111-1111-111111111111', date: '2026-05-26', status: 'absent', remarks: 'Sick leave' }
    ]
  };

  const loadDb = () => {
    try {
      if (fs.existsSync(dbFilePath)) {
        return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
      }
    } catch (e) {
      // ignore
    }
    return db;
  };

  const saveDb = (currentDb) => {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(currentDb, null, 2), 'utf8');
    } catch (e) {
      // ignore
    }
  };

  getMockDb = () => {
    const currentDb = loadDb();
    const requiredTables = [
      'alumni_profiles',
      'alumni_events',
      'alumni_jobs',
      'alumni_donations',
      'alumni_event_registrations',
      'alumni_mentorship_requests',
      'alumni_success_stories',
      'alumni_communication_logs',
      'alumni_connections',
      'alumni_posts',
      'alumni_post_likes',
      'alumni_post_comments',
      'alumni_messages',
      'mentorship_sessions',
      'alumni_employment',
      'alumni_education',
      'alumni_job_applications',
      'attendance_notifications',
      'below_75_students',
      'attendance_notification_requests',
      'college_settings',
      'attendance_notification_templates',
      'attendance_notification_history',
      'attendance_notification_logs'
    ];
    let changed = false;
    requiredTables.forEach(table => {
      if (!currentDb[table]) {
        currentDb[table] = [];
        changed = true;
      }
    });

    if (currentDb['college_settings'].length === 0) {
      currentDb['college_settings'] = [
        {
          key: 'attendance_approval_enabled',
          value: 'false',
          description: 'Enable/disable HOD approval flow for attendance warnings',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      changed = true;
    }

    if (currentDb['attendance_notification_templates'].length === 0) {
      currentDb['attendance_notification_templates'] = [
        {
          id: 'appreciation',
          name: 'Appreciation',
          subject: 'Congratulations on Excellent Attendance',
          body: 'Dear {student_name},\n\nWe are pleased to inform you that you have maintained an excellent attendance of {attendance_percentage}% this month.\n\nKeep up the great work!\n\nBest regards,\nCollege Administration',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'friendly-reminder',
          name: 'Friendly Reminder',
          subject: 'Friendly Reminder: Attendance Update',
          body: 'Dear {student_name},\n\nThis is a friendly reminder that your overall attendance is currently at {attendance_percentage}%.\n\nPlease attend your classes regularly to keep your attendance above the required 75% threshold.\n\nBest regards,\nClass Teacher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'warning',
          name: 'Warning',
          subject: 'Attendance Warning Alert',
          body: 'Dear {student_name},\n\nYour attendance is currently at {attendance_percentage}%, which is below the required 75% threshold.\n\nPlease take immediate steps to attend your classes regularly to avoid academic penalty.\n\nBest regards,\nClass Teacher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'critical-warning',
          name: 'Critical Warning',
          subject: 'Critical Attendance Warning',
          body: 'Dear Parent / Student,\n\nThis is to notify you that the attendance of {student_name} ({roll_number}) is critical at {attendance_percentage}%.\n\nPlease meet your department HOD immediately to resolve this.\n\nBest regards,\nDepartment Head',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'detention-alert',
          name: 'Detention Alert',
          subject: 'Detention Risk Alert',
          body: 'Dear Parent / Student,\n\nYour overall attendance has fallen to {attendance_percentage}%, putting you at immediate risk of detention.\n\nKindly note that you will not be allowed to write the semester exams if this is not resolved.\n\nBest regards,\nPrincipal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      changed = true;
    }

    if (changed) {
      saveDb(currentDb);
    }

    const handler = {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'object' && value !== null) {
          return new Proxy(value, {
            set(subTarget, subProp, subValue, subReceiver) {
              const success = Reflect.set(subTarget, subProp, subValue, subReceiver);
              if (success) {
                saveDb(target);
              }
              return success;
            },
            deleteProperty(subTarget, subProp) {
              const success = Reflect.deleteProperty(subTarget, subProp);
              if (success) {
                saveDb(target);
              }
              return success;
            }
          });
        }
        return value;
      },
      set(target, prop, value, receiver) {
        const success = Reflect.set(target, prop, value, receiver);
        if (success) {
          saveDb(target);
        }
        return success;
      }
    };
    return new Proxy(currentDb, handler);
  };


  // Initialize DB file on startup if it doesn't exist
  if (fs.existsSync(dbFilePath)) {
    db = loadDb();
  } else {
    saveDb(db);
  }

  class MockQueryBuilder {
    constructor(tableName) {
      this.tableName = tableName;
      db = loadDb();
      if (!db[tableName]) { db[tableName] = []; }
      this._data = db[tableName];
      this._error = null;
    }

    select(columns, options = {}) { return this; }

    like(column, value) {
      if (value === undefined || value === null) return this;
      const regexStr = '^' + String(value).replace(/%/g, '.*') + '$';
      const regex = new RegExp(regexStr);
      this._data = this._data.filter(item => regex.test(item[column] || ''));
      return this;
    }

    ilike(column, value) {
      if (value === undefined || value === null) return this;
      const regexStr = '^' + String(value).replace(/%/g, '.*') + '$';
      const regex = new RegExp(regexStr, 'i');
      this._data = this._data.filter(item => regex.test(item[column] || ''));
      return this;
    }

    eq(column, value) {
      if (value === undefined || value === null) return this;
      const cleanVal = typeof value === 'string' ? value.toLowerCase().trim() : value;
      this._data = this._data.filter(item => {
        let fieldVal;
        if (column.startsWith('users.')) {
          const prop = column.split('.')[1];
          db = loadDb();
          const user = db.users.find(u => 
            (item.user_id && u.id === item.user_id) || 
            (item.email && u.email && u.email.toLowerCase().trim() === item.email.toLowerCase().trim()) ||
            (u.id === item.id)
          );
          fieldVal = user ? user[prop] : undefined;
        } else {
          fieldVal = item[column];
          if (column === 'id' && item._id && !item.id) { fieldVal = item._id; }
        }
        
        if (typeof fieldVal === 'string') {
          return fieldVal.toLowerCase().trim() === cleanVal;
        }
        return fieldVal == value;
      });
      return this;
    }

    neq(column, value) {
      this._data = this._data.filter(item => item[column] != value);
      return this;
    }

    lt(column, value) {
      this._data = this._data.filter(item => Number(item[column]) < Number(value));
      return this;
    }

    gte(column, value) {
      this._data = this._data.filter(item => {
        const itemVal = item[column];
        if (itemVal === undefined || itemVal === null) return false;
        return typeof itemVal === 'number' ? itemVal >= Number(value) : String(itemVal) >= String(value);
      });
      return this;
    }

    gt(column, value) {
      this._data = this._data.filter(item => {
        const itemVal = item[column];
        if (itemVal === undefined || itemVal === null) return false;
        return typeof itemVal === 'number' ? itemVal > Number(value) : String(itemVal) > String(value);
      });
      return this;
    }

    lte(column, value) {
      this._data = this._data.filter(item => {
        const itemVal = item[column];
        if (itemVal === undefined || itemVal === null) return false;
        return typeof itemVal === 'number' ? itemVal <= Number(value) : String(itemVal) <= String(value);
      });
      return this;
    }

    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        this._data = this._data.filter(item => item[column] !== null && item[column] !== undefined);
      } else {
        this._data = this._data.filter(item => item[column] != value);
      }
      return this;
    }

    in(column, values) {
      if (Array.isArray(values)) {
        this._data = this._data.filter(item => values.includes(item[column]) || values.includes(item.id) || values.includes(item._id));
      }
      return this;
    }

    or(queryString) {
      if (!queryString) return this;
      const clauses = queryString.split(',').map(c => c.trim());
      
      this._data = this._data.filter(item => {
        return clauses.some(clause => {
          if (clause.endsWith('.is.null')) {
            const col = clause.slice(0, -8);
            const val = item[col];
            return val === null || val === undefined;
          }
          if (clause.endsWith('.is.not.null')) {
            const col = clause.slice(0, -12);
            const val = item[col];
            return val !== null && val !== undefined;
          }

          const match = clause.match(/^(.+?)\.(eq|ilike|like|neq|in)\.(.+)$/);
          if (match) {
            const [, col, op, val] = match;
            const itemVal = item[col];
            
            if (op === 'in') {
              const cleanedVal = val.replace(/^\(|\)$/g, '');
              const vals = cleanedVal.split(',').map(v => v.trim().toLowerCase());
              const cleanItemVal = String(itemVal || '').trim().toLowerCase();
              return vals.includes(cleanItemVal);
            }

            const cleanValStr = String(val).toLowerCase().trim();
            const cleanItemValStr = String(itemVal || '').toLowerCase().trim();

            if (op === 'eq') {
              return cleanItemValStr === cleanValStr;
            }
            if (op === 'neq') {
              return cleanItemValStr !== cleanValStr;
            }
            if (op === 'ilike' || op === 'like') {
              const regexStr = '^' + String(val).replace(/%/g, '.*') + '$';
              const regex = new RegExp(regexStr, 'i');
              return regex.test(String(itemVal || ''));
            }
          }
          return false;
        });
      });
      return this;
    }

    order(column, options = {}) {
      const ascending = options.ascending !== false;
      this._data.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
      });
      return this;
    }

    limit(num) {
      this._data = this._data.slice(0, num);
      return this;
    }

    range(from, to) {
      this._data = this._data.slice(from, to + 1);
      return this;
    }

    insert(rows) {
      this._action = 'insert';
      this._insertRows = rows;
      return this;
    }

    update(values) {
      this._action = 'update';
      this._updateValues = values;
      return this;
    }

    delete() {
      this._action = 'delete';
      return this;
    }

    _executeAction() {
      if (!this._action) return;
      const action = this._action;
      this._action = null;

      if (action === 'delete') {
        db = loadDb();
        if (!db[this.tableName]) { db[this.tableName] = []; }
        this._data.forEach(item => {
          const idx = db[this.tableName].findIndex(i => i.id === item.id || i._id === item.id);
          if (idx !== -1) { db[this.tableName].splice(idx, 1); }
        });
        saveDb(db);
        this._data = [];
      } else if (action === 'update') {
        db = loadDb();
        if (!db[this.tableName]) { db[this.tableName] = []; }
        this._data.forEach(item => {
          const sourceItem = db[this.tableName].find(i => i.id === item.id || i._id === item.id);
          if (sourceItem) {
            Object.assign(sourceItem, this._updateValues);
            sourceItem.updated_at = new Date().toISOString();
          }
          Object.assign(item, this._updateValues);
        });
        saveDb(db);
      } else if (action === 'insert') {
        db = loadDb();
        if (!db[this.tableName]) { db[this.tableName] = []; }
        const inputRows = Array.isArray(this._insertRows) ? this._insertRows : [this._insertRows];
        const addedRows = [];
        inputRows.forEach(r => {
          const mockUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          });
          const newRow = { 
            id: mockUuid, 
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString(),
            ...r 
          };
          if (this.tableName === 'users') {
            if (newRow.is_active === undefined) newRow.is_active = true;
            if (newRow.is_verified === undefined) newRow.is_verified = false;
          }
          db[this.tableName].push(newRow);
          addedRows.push(newRow);
        });
        saveDb(db);
        this._data = addedRows;
      }
    }

    async maybeSingle() {
      this._executeAction();
      return { data: this._data[0] || null, error: this._error };
    }

    async single() {
      this._executeAction();
      if (this._data.length === 0) {
        return { data: null, error: { message: "No rows found" } };
      }
      return { data: this._data[0], error: this._error };
    }

    then(onfulfilled, onrejected) {
      this._executeAction();
      return Promise.resolve({
        data: this._data,
        error: this._error,
        count: this._data.length
      }).then(onfulfilled, onrejected);
    }
  }

  activeSupabaseClient = {
    from: (tableName) => {
      return new MockQueryBuilder(tableName);
    },
    auth: {
      signUp: async ({ email }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signInWithPassword: async ({ email }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signOut: async () => ({ error: null })
    }
  };
} else {
  console.log("✅ LIVE POSTGRESQL / SUPABASE CONNECTION DETECTED. Query builder is online.");

  const isLocalDatabase =
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1') ||
    databaseUrl.includes('db') ||
    databaseUrl.includes('postgres') ||
    databaseUrl.includes('host.docker.internal') ||
    process.env.DATABASE_SSL === 'false';

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  class PostgresQueryBuilder {
    constructor(tableName) {
      this.tableName = tableName;
      this.selectString = '*';
      this.conditions = [];
      this.orderByField = null;
      this.orderByAsc = true;
      this.limitVal = null;
      this.offsetVal = null;
      this.action = 'select';
      this.actionData = null;
      this.joinUsers = false;
      this.joinUsersInner = false;
      this.orConditions = [];
    }

    select(columns = '*', options = {}) {
      this.selectString = columns;
      if (columns.includes('users!inner')) {
        this.joinUsers = true;
        this.joinUsersInner = true;
      } else if (columns.includes('users')) {
        this.joinUsers = true;
      }
      return this;
    }

    eq(column, value) {
      if (value === undefined || value === null) return this;
      if (column.startsWith('users.')) {
        this.conditions.push({ column: `users.${column.split('.')[1]}`, operator: '=', value });
      } else {
        this.conditions.push({ column: `t.${column}`, operator: '=', value });
      }
      return this;
    }

    like(column, value) {
      if (value === undefined || value === null) return this;
      if (column.startsWith('users.')) {
        this.conditions.push({ column: `users.${column.split('.')[1]}`, operator: 'LIKE', value });
      } else {
        this.conditions.push({ column: `t.${column}`, operator: 'LIKE', value });
      }
      return this;
    }

    ilike(column, value) {
      if (value === undefined || value === null) return this;
      if (column.startsWith('users.')) {
        this.conditions.push({ column: `users.${column.split('.')[1]}`, operator: 'ILIKE', value });
      } else {
        this.conditions.push({ column: `t.${column}`, operator: 'ILIKE', value });
      }
      return this;
    }

    neq(column, value) {
      this.conditions.push({ column: `t.${column}`, operator: '!=', value });
      return this;
    }

    lt(column, value) {
      this.conditions.push({ column: `t.${column}`, operator: '<', value });
      return this;
    }

    gte(column, value) {
      this.conditions.push({ column: `t.${column}`, operator: '>=', value });
      return this;
    }

    gt(column, value) {
      this.conditions.push({ column: `t.${column}`, operator: '>', value });
      return this;
    }

    lte(column, value) {
      this.conditions.push({ column: `t.${column}`, operator: '<=', value });
      return this;
    }

    not(column, operator, value) {
      if (operator === 'is' && value === null) {
        this.conditions.push({ column: `t.${column}`, operator: 'IS NOT NULL', value: undefined });
      } else {
        this.conditions.push({ column: `t.${column}`, operator: '!=', value });
      }
      return this;
    }

    in(column, values) {
      this.conditions.push({ column: `t.${column}`, operator: 'IN', value: values });
      return this;
    }

    or(queryString) {
      this.orConditions.push(queryString);
      return this;
    }

    order(column, { ascending = true } = {}) {
      this.orderByField = column;
      this.orderByAsc = ascending;
      return this;
    }

    limit(num) {
      this.limitVal = num;
      return this;
    }

    range(from, to) {
      this.offsetVal = from;
      this.limitVal = to - from + 1;
      return this;
    }

    insert(rows) {
      this.action = 'insert';
      this.actionData = Array.isArray(rows) ? rows : [rows];
      return this;
    }

    update(values) {
      this.action = 'update';
      this.actionData = values;
      return this;
    }

    delete() {
      this.action = 'delete';
      return this;
    }

    async execute() {
      let sql = '';
      const params = [];
      let paramCounter = 1;

      const buildWhere = () => {
        const parts = [];
        this.conditions.forEach(c => {
          if (c.operator === 'IN') {
            if (!Array.isArray(c.value) || c.value.length === 0) {
              parts.push('FALSE');
            } else {
              const placeholders = c.value.map(v => {
                params.push(v);
                return `$${paramCounter++}`;
              }).join(', ');
              parts.push(`${c.column} IN (${placeholders})`);
            }
          } else if (c.operator === 'IS NOT NULL') {
            parts.push(`${c.column} IS NOT NULL`);
          } else {
            params.push(c.value);
            parts.push(`${c.column} ${c.operator} $${paramCounter++}`);
          }
        });

        this.orConditions.forEach(orStr => {
          const clauses = orStr.split(',').map(clause => {
            const trimmed = clause.trim();
            
            // 1. IS NULL or IS NOT NULL
            if (trimmed.endsWith('.is.null')) {
              const col = trimmed.slice(0, -8);
              const colName = col.startsWith('users.') ? `u."${col.split('.')[1]}"` : `t."${col}"`;
              return `${colName} IS NULL`;
            }
            if (trimmed.endsWith('.is.not.null')) {
              const col = trimmed.slice(0, -12);
              const colName = col.startsWith('users.') ? `u."${col.split('.')[1]}"` : `t."${col}"`;
              return `${colName} IS NOT NULL`;
            }

            // 2. Standard Operators
            const match = trimmed.match(/^(.+?)\.(eq|ilike|like|neq|in)\.(.+)$/);
            if (match) {
              const [, col, op, val] = match;
              const colName = col.startsWith('users.') ? `u."${col.split('.')[1]}"` : `t."${col}"`;
              
              if (op === 'in') {
                const cleanedVal = val.replace(/^\(|\)$/g, '');
                const vals = cleanedVal.split(',').map(v => v.trim());
                if (vals.length === 0) return 'FALSE';
                const placeholders = vals.map(v => {
                  params.push(v);
                  return `$${paramCounter++}`;
                }).join(', ');
                return `${colName} IN (${placeholders})`;
              }

              let operator = '=';
              let finalVal = val;
              if (op === 'neq') operator = '!=';
              else if (op === 'ilike') {
                operator = 'ILIKE';
                if (!val.includes('%')) finalVal = `%${val}%`;
              }
              else if (op === 'like') {
                operator = 'LIKE';
                if (!val.includes('%')) finalVal = `%${val}%`;
              }

              params.push(finalVal);
              return `${colName} ${operator} $${paramCounter++}`;
            }

            return 'FALSE';
          });
          
          if (clauses.length > 0) {
            parts.push(`(${clauses.join(' OR ')})`);
          }
        });

        if (parts.length === 0) return '';
        return ' WHERE ' + parts.join(' AND ');
      };

      if (this.action === 'select') {
        let selectFields = 't.*';
        if (this.joinUsers) {
          selectFields = 't.*, u.is_verified as "user_is_verified", u.email as "user_email", u.role as "user_role"';
        }

        sql = `SELECT ${selectFields} FROM "${this.tableName}" t`;
        
        if (this.joinUsers) {
          const joinType = this.joinUsersInner ? 'INNER JOIN' : 'LEFT JOIN';
          sql += ` ${joinType} "users" u ON t.user_id = u.id`;
        }

        this.conditions = this.conditions.map(c => {
          if (c.column.startsWith('users.')) {
            return { ...c, column: `u.${c.column.split('.')[1]}` };
          }
          return c;
        });

        const whereClause = buildWhere();
        sql += whereClause;

        if (this.orderByField) {
          sql += ` ORDER BY t."${this.orderByField}" ${this.orderByAsc ? 'ASC' : 'DESC'}`;
        }

        let totalCount = null;
        if (this.limitVal !== null || this.offsetVal !== null) {
          const countSql = `SELECT COUNT(*) FROM "${this.tableName}" t ${this.joinUsers ? `${this.joinUsersInner ? 'INNER JOIN' : 'LEFT JOIN'} "users" u ON t.user_id = u.id` : ''} ${whereClause}`;
          try {
            const countRes = await pool.query(countSql, params);
            totalCount = parseInt(countRes.rows[0].count, 10);
          } catch (e) {
            console.error("Count query error:", e.message);
          }
        }

        if (this.limitVal !== null) {
          sql += ` LIMIT ${this.limitVal}`;
        }
        if (this.offsetVal !== null) {
          sql += ` OFFSET ${this.offsetVal}`;
        }

        try {
          const res = await pool.query(sql, params);
          let rows = res.rows;

          if (this.joinUsers) {
            rows = rows.map(r => {
              const { user_is_verified, user_email, user_role, ...rest } = r;
              return {
                ...rest,
                users: {
                  is_verified: user_is_verified,
                  email: user_email,
                  role: user_role
                }
              };
            });
          }

          if (this.selectString.includes(':')) {
            const relations = [];
            const matches = this.selectString.matchAll(/(\w+):(\w+)\(\*\)/g);
            for (const m of matches) {
              relations.push({ fieldName: m[1], relationTable: m[2] });
            }

            for (const rel of relations) {
              const ids = rows.map(r => r[rel.fieldName] || r[`${rel.fieldName}_id`]).filter(Boolean);
              if (ids.length > 0) {
                const relRes = await pool.query(`SELECT * FROM "${rel.relationTable}" WHERE id IN (${ids.map((_, i) => `$${i+1}`).join(', ')})`, ids);
                const relMap = new Map(relRes.rows.map(r => [r.id, r]));
                rows.forEach(r => {
                  const foreignId = r[rel.fieldName] || r[`${rel.fieldName}_id`];
                  r[rel.fieldName] = relMap.get(foreignId) || null;
                });
              }
            }
          }

          return { data: rows, error: null, count: totalCount !== null ? totalCount : rows.length };
        } catch (err) {
          console.error(`❌ [PostgresQueryBuilder Error] table: "${this.tableName}", sql: "${sql}", params: ${JSON.stringify(params)}, error: ${err.message}`);
          return { data: null, error: err };
        }
      } else if (this.action === 'insert') {
        const rows = this.actionData;
        if (rows.length === 0) return { data: [], error: null };
        
        const columns = Object.keys(rows[0]);
        const valuePlaceholders = rows.map(row => {
          const rowPlaceholders = columns.map(col => {
            const val = row[col];
            params.push(
              (typeof val === 'object' && val !== null && !(val instanceof Date) && !Buffer.isBuffer(val))
                ? JSON.stringify(val)
                : val
            );
            return `$${paramCounter++}`;
          });
          return `(${rowPlaceholders.join(', ')})`;
        }).join(', ');

        sql = `INSERT INTO "${this.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${valuePlaceholders} RETURNING *`;
        
        try {
          const res = await pool.query(sql, params);
          return { data: res.rows, error: null };
        } catch (err) {
          console.error(`❌ [PostgresQueryBuilder Insert Error] table: "${this.tableName}", sql: "${sql}", params: ${JSON.stringify(params)}, error: ${err.message}`);
          return { data: null, error: err };
        }
      } else if (this.action === 'update') {
        const updates = [];
        for (const [col, val] of Object.entries(this.actionData)) {
          params.push(
            (typeof val === 'object' && val !== null && !(val instanceof Date) && !Buffer.isBuffer(val))
              ? JSON.stringify(val)
              : val
          );
          updates.push(`"${col}" = $${paramCounter++}`);
        }
        sql = `UPDATE "${this.tableName}" t SET ${updates.join(', ')}`;
        sql += buildWhere();
        sql += ' RETURNING *';

        try {
          const res = await pool.query(sql, params);
          return { data: res.rows, error: null };
        } catch (err) {
          console.error(`❌ [PostgresQueryBuilder Update Error] table: "${this.tableName}", sql: "${sql}", params: ${JSON.stringify(params)}, error: ${err.message}`);
          return { data: null, error: err };
        }
      } else if (this.action === 'delete') {
        sql = `DELETE FROM "${this.tableName}" t`;
        sql += buildWhere();
        sql += ' RETURNING *';

        try {
          const res = await pool.query(sql, params);
          return { data: res.rows, error: null };
        } catch (err) {
          console.error(`❌ [PostgresQueryBuilder Delete Error] table: "${this.tableName}", sql: "${sql}", params: ${JSON.stringify(params)}, error: ${err.message}`);
          return { data: null, error: err };
        }
      }
    }

    async maybeSingle() {
      const { data, error } = await this.execute();
      return { data: data && data.length > 0 ? data[0] : null, error };
    }

    async single() {
      const { data, error } = await this.execute();
      if (error) return { data: null, error };
      if (!data || data.length === 0) {
        return { data: null, error: { message: "No rows found" } };
      }
      return { data: data[0], error: null };
    }

    then(onfulfilled, onrejected) {
      if (!this._promise) {
        this._promise = this.execute();
      }
      return this._promise.then(onfulfilled, onrejected);
    }
  }

  activeSupabaseClient = {
    from: (tableName) => {
      return new PostgresQueryBuilder(tableName);
    },
    auth: {
      signUp: async ({ email }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signInWithPassword: async ({ email }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signOut: async () => ({ error: null })
    }
  };
}

debugLog("Supabase.js module loading completed successfully!");

export const supabase = activeSupabaseClient;
export { isMockMode, getMockDb };
