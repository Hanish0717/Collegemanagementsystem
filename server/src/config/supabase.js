import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if we should run in Database Mock Mode
const isMockMode = !supabaseUrl || 
                   supabaseUrl.includes('your-project') || 
                   supabaseUrl.includes('placeholder') ||
                   !supabaseServiceRoleKey ||
                   supabaseServiceRoleKey.includes('placeholder') ||
                   supabaseServiceRoleKey.includes('your_supabase');

let activeSupabaseClient;

if (isMockMode) {
  console.log("🚀 Running backend in DATABASE MOCK MODE because no live Supabase credentials are configured.");
  
  const hashedDefaultPassword = bcrypt.hashSync('password123', 10);

  // In-memory mock database tables using valid UUIDs to satisfy isUUID checks in middleware
  const db = {
    users: [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Super Admin', full_name: 'Super Admin', email: 'superadmin@college.com', password: hashedDefaultPassword, role: 'super-admin', is_verified: true, is_active: true },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Admin', full_name: 'Admin', email: 'admin@college.com', password: hashedDefaultPassword, role: 'admin', is_verified: true, is_active: true },
      { id: '33333333-3333-3333-3333-333333333333', name: 'Faculty', full_name: 'Dr. John Smith', email: 'faculty@college.com', password: hashedDefaultPassword, role: 'faculty', is_verified: true, is_active: true },
      { id: '44444444-4444-4444-4444-444444444444', name: 'Student', full_name: 'Student Demo', email: 'student@college.com', password: hashedDefaultPassword, role: 'student', is_verified: true, is_active: true },
      { id: '55555555-5555-5555-5555-555555555555', name: 'Parent', full_name: 'Parent Demo', email: 'parent@college.com', password: hashedDefaultPassword, role: 'parent', child_email: 'student@college.com', is_verified: true, is_active: true },
      { id: '66666666-6666-6666-6666-666666666666', name: 'Librarian', full_name: 'Librarian Demo', email: 'librarian@college.com', password: hashedDefaultPassword, role: 'librarian', is_verified: true, is_active: true },
      { id: '77777777-7777-7777-7777-777777777777', name: 'Placement Officer', full_name: 'Placement Officer Demo', email: 'placement@college.com', password: hashedDefaultPassword, role: 'placement-officer', is_verified: true, is_active: true },
      { id: '88888888-8888-8888-8888-888888888888', name: 'Hostel Warden', full_name: 'Hostel Warden Demo', email: 'warden@college.com', password: hashedDefaultPassword, role: 'hostel-warden', is_verified: true, is_active: true },
      { id: '99999999-9999-9999-9999-999999999999', name: 'Transport Manager', full_name: 'Transport Manager Demo', email: 'transport@college.com', password: hashedDefaultPassword, role: 'transport-manager', is_verified: true, is_active: true }
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
      { id: 'f1111111-1111-1111-1111-111111111111', user_id: '33333333-3333-3333-3333-333333333333', full_name: 'Dr. John Smith', email: 'faculty@college.com', employee_id: 'FAC2020001', department: 'CSE', designation: 'Associate Professor', experience: 12, gender: 'Male', phone_number: '9876543212', status: 'Active', is_active: true }
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
    otps: []
  };

  class MockQueryBuilder {
    constructor(tableName, data) {
      this.tableName = tableName;
      this._data = data || [];
      this._error = null;
    }

    select(columns, options = {}) {
      return this;
    }

    eq(column, value) {
      if (value === undefined || value === null) return this;
      
      const cleanVal = typeof value === 'string' ? value.toLowerCase().trim() : value;
      
      this._data = this._data.filter(item => {
        let fieldVal = item[column];
        if (column === 'id' && item._id && !item.id) {
          fieldVal = item._id;
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

    in(column, values) {
      if (Array.isArray(values)) {
        this._data = this._data.filter(item => values.includes(item[column]) || values.includes(item.id) || values.includes(item._id));
      }
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

    maybeSingle() {
      return Promise.resolve({ data: this._data[0] || null, error: this._error });
    }

    single() {
      if (this._data.length === 0) {
        return Promise.resolve({ data: null, error: { message: "No rows found" } });
      }
      return Promise.resolve({ data: this._data[0], error: this._error });
    }

    insert(rows) {
      const inputRows = Array.isArray(rows) ? rows : [rows];
      const addedRows = [];
      inputRows.forEach(r => {
        const newRow = { 
          id: Math.random().toString(36).substr(2, 9), 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString(),
          ...r 
        };
        db[this.tableName].push(newRow);
        addedRows.push(newRow);
      });
      this._data = addedRows;
      return this;
    }

    update(values) {
      this._data.forEach(item => {
        // Find in source db list and update
        const sourceItem = db[this.tableName].find(i => i.id === item.id || i._id === item.id);
        if (sourceItem) {
          Object.assign(sourceItem, values);
          sourceItem.updated_at = new Date().toISOString();
        }
        Object.assign(item, values);
      });
      return this;
    }

    delete() {
      this._data.forEach(item => {
        const idx = db[this.tableName].findIndex(i => i.id === item.id || i._id === item.id);
        if (idx !== -1) {
          db[this.tableName].splice(idx, 1);
        }
      });
      this._data = [];
      return this;
    }

    then(onfulfilled, onrejected) {
      return Promise.resolve({
        data: this._data,
        error: this._error,
        count: this._data.length
      }).then(onfulfilled, onrejected);
    }
  }

  activeSupabaseClient = {
    from: (tableName) => {
      if (!db[tableName]) {
        db[tableName] = [];
      }
      return new MockQueryBuilder(tableName, db[tableName]);
    },
    auth: {
      signUp: async ({ email, password }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signInWithPassword: async ({ email }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signOut: async () => ({ error: null })
    }
  };
} else {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("⚠️ Supabase URL or Service Role Key is missing from env variables. Database operations may fail.");
  }
  
  activeSupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceRoleKey || 'placeholder_key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

export const supabase = activeSupabaseClient;
