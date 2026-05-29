import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'College ERP Backend Running'
  });
});

// Database overview — shows tables and row counts in Supabase
router.get('/db', async (req, res) => {
  try {
    const tables = [
      'users', 'students', 'assignments', 'attendance', 'books', 
      'issued_books', 'complaints', 'leave_requests', 'fees', 
      'results', 'study_materials', 'timetable'
    ];
    const result = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        result[table] = `Error: ${error.message}`;
      } else {
        result[table] = count;
      }
    }

    // Fetch sample data
    const { data: users } = await supabase.from('users').select('full_name, email, role').limit(5);
    const { data: students } = await supabase.from('students').select('full_name, roll_number, department').limit(5);
    const { data: books } = await supabase.from('books').select('title, author').limit(5);

    res.json({
      success: true,
      database: 'Supabase PostgreSQL',
      totalTables: tables.length,
      tables: result,
      sampleData: { users, students, books }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
