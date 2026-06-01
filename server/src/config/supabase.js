import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pkg from 'pg';

dotenv.config();

// Configure DATE (OID 1082) parsing to return raw YYYY-MM-DD string instead of converting to Date objects
pkg.types.setTypeParser(1082, (val) => val);

const { Pool } = pkg;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

// Determine if we should run in Database Mock Mode (only if no live PostgreSQL or Supabase credentials are configured)
const isMockMode = (!databaseUrl || databaseUrl.includes('your_supabase_postgresql')) &&
                   (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder'));

let activeSupabaseClient;

if (isMockMode) {
  console.log("🚀 Running backend in DATABASE MOCK MODE because no live database credentials are configured.");
  
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
        let fieldVal = item[column];
        if (column === 'id' && item._id && !item.id) { fieldVal = item._id; }
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

    maybeSingle() { return Promise.resolve({ data: this._data[0] || null, error: this._error }); }

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
        if (idx !== -1) { db[this.tableName].splice(idx, 1); }
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
      if (!db[tableName]) { db[tableName] = []; }
      return new MockQueryBuilder(tableName, db[tableName]);
    },
    auth: {
      signUp: async ({ email }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signInWithPassword: async ({ email }) => ({ data: { user: { id: 'mock-user-id', email } }, error: null }),
      signOut: async () => ({ error: null })
    }
  };
} else {
  console.log("✅ LIVE POSTGRESQL / SUPABASE CONNECTION DETECTED. Query builder is online.");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
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
      this.conditions.push({ column: `t.${column}`, operator: 'LIKE', value });
      return this;
    }

    ilike(column, value) {
      if (value === undefined || value === null) return this;
      this.conditions.push({ column: `t.${column}`, operator: 'ILIKE', value });
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

export const supabase = activeSupabaseClient;
