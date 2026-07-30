import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:5435/college_management',
});

async function seedLiveData() {
  console.log('Seeding PostgreSQL database with live Student & Faculty data...');

  try {
    // 1. Insert Faculty
    const facultyMembers = [
      {
        employee_id: 'EMP-AIML-101',
        full_name: 'Dr. Ramesh Kumar',
        email: 'ramesh.kumar@college.com',
        department: 'AIML',
        designation: 'Professor & Head',
        experience: 14,
        attendance_percentage: 98.5,
        status: 'Active',
        gender: 'Male',
        phone_number: '+91 98765 43210',
        assigned_subjects: JSON.stringify(['AIML501', 'AIML701']),
        assigned_sections: JSON.stringify(['Sem 5 Sec A', 'Sem 7 Sec A']),
      },
      {
        employee_id: 'EMP-AIML-102',
        full_name: 'Prof. Sneha Verma',
        email: 'sneha.verma@college.com',
        department: 'AIML',
        designation: 'Associate Professor',
        experience: 9,
        attendance_percentage: 95.0,
        status: 'Active',
        gender: 'Female',
        phone_number: '+91 98765 43211',
        assigned_subjects: JSON.stringify(['AIML502']),
        assigned_sections: JSON.stringify(['Sem 5 Sec B']),
      },
      {
        employee_id: 'EMP-AIML-103',
        full_name: 'Prof. Vikram Rathore',
        email: 'vikram.rathore@college.com',
        department: 'AIML',
        designation: 'Assistant Professor',
        experience: 6,
        attendance_percentage: 92.0,
        status: 'Active',
        gender: 'Male',
        phone_number: '+91 98765 43212',
        assigned_subjects: JSON.stringify(['AIML503L']),
        assigned_sections: JSON.stringify(['Sem 5 Sec A', 'Sem 5 Sec C']),
      },
      {
        employee_id: 'EMP-AIML-104',
        full_name: 'Dr. Ananya Roy',
        email: 'ananya.roy@college.com',
        department: 'AIML',
        designation: 'Assistant Professor',
        experience: 5,
        attendance_percentage: 96.0,
        status: 'Active',
        gender: 'Female',
        phone_number: '+91 98765 43213',
        assigned_subjects: JSON.stringify(['AIML701']),
        assigned_sections: JSON.stringify(['Sem 7 Sec B']),
      },
      {
        employee_id: 'EMP-AIML-105',
        full_name: 'Prof. Rajesh Sharma',
        email: 'rajesh.sharma@college.com',
        department: 'AIML',
        designation: 'Assistant Professor',
        experience: 7,
        attendance_percentage: 94.0,
        status: 'Active',
        gender: 'Male',
        phone_number: '+91 98765 43214',
        assigned_subjects: JSON.stringify(['AIML301']),
        assigned_sections: JSON.stringify(['Sem 3 Sec A']),
      },
    ];

    for (const f of facultyMembers) {
      await pool.query(
        `INSERT INTO faculty (employee_id, full_name, email, department, designation, experience, attendance_percentage, status, gender, phone_number, assigned_subjects, assigned_sections)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           designation = EXCLUDED.designation,
           assigned_sections = EXCLUDED.assigned_sections;`,
        [
          f.employee_id,
          f.full_name,
          f.email,
          f.department,
          f.designation,
          f.experience,
          f.attendance_percentage,
          f.status,
          f.gender,
          f.phone_number,
          f.assigned_subjects,
          f.assigned_sections,
        ]
      );
    }
    console.log(`✅ Seeded ${facultyMembers.length} Faculty members into PostgreSQL.`);

    // 2. Insert Students
    const students = [
      { roll_number: '23091A4201', full_name: 'Aarav Sharma', email: 'aarav.sharma@college.com', department: 'AIML', year: 3, semester: 5, section: 'A', gender: 'Male', phone_number: '9876543201', cgpa: 9.2, attendance_percentage: 94.0, parent_name: 'Suresh Sharma', parent_phone: '9876543299', parent_email: 'suresh.sharma@gmail.com' },
      { roll_number: '23091A4202', full_name: 'Bhavna Patel', email: 'bhavna.patel@college.com', department: 'AIML', year: 3, semester: 5, section: 'A', gender: 'Female', phone_number: '9876543202', cgpa: 8.8, attendance_percentage: 89.0, parent_name: 'Ramesh Patel', parent_phone: '9876543298', parent_email: 'ramesh.patel@gmail.com' },
      { roll_number: '23091A4203', full_name: 'Chirag Reddy', email: 'chirag.reddy@college.com', department: 'AIML', year: 3, semester: 5, section: 'B', gender: 'Male', phone_number: '9876543203', cgpa: 7.4, attendance_percentage: 68.0, parent_name: 'Venkata Reddy', parent_phone: '9876543297', parent_email: 'venkata.reddy@gmail.com' },
      { roll_number: '23091A4204', full_name: 'Divya Iyer', email: 'divya.iyer@college.com', department: 'AIML', year: 3, semester: 5, section: 'B', gender: 'Female', phone_number: '9876543204', cgpa: 9.6, attendance_percentage: 96.0, parent_name: 'Subramanian Iyer', parent_phone: '9876543296', parent_email: 'subramanian.iyer@gmail.com' },
      { roll_number: '23091A4205', full_name: 'Eshwar Verma', email: 'eshwar.verma@college.com', department: 'AIML', year: 3, semester: 5, section: 'C', gender: 'Male', phone_number: '9876543205', cgpa: 8.1, attendance_percentage: 82.0, parent_name: 'Mahesh Verma', parent_phone: '9876543295', parent_email: 'mahesh.verma@gmail.com' },
      { roll_number: '23091A4206', full_name: 'Farhan Ali', email: 'farhan.ali@college.com', department: 'AIML', year: 3, semester: 5, section: 'C', gender: 'Male', phone_number: '9876543206', cgpa: 7.8, attendance_percentage: 71.0, parent_name: 'Tariq Ali', parent_phone: '9876543294', parent_email: 'tariq.ali@gmail.com' },
      { roll_number: '23091A4207', full_name: 'Geetha Nair', email: 'geetha.nair@college.com', department: 'AIML', year: 3, semester: 5, section: 'A', gender: 'Female', phone_number: '9876543207', cgpa: 8.5, attendance_percentage: 91.0, parent_name: 'Unnikrishnan Nair', parent_phone: '9876543293', parent_email: 'unnikrishnan.nair@gmail.com' },
      { roll_number: '23091A4208', full_name: 'Harish Bose', email: 'harish.bose@college.com', department: 'AIML', year: 3, semester: 5, section: 'B', gender: 'Male', phone_number: '9876543208', cgpa: 7.9, attendance_percentage: 85.0, parent_name: 'Subhash Bose', parent_phone: '9876543292', parent_email: 'subhash.bose@gmail.com' },
      { roll_number: '23091A4209', full_name: 'Ishita Roy', email: 'ishita.roy@college.com', department: 'AIML', year: 4, semester: 7, section: 'A', gender: 'Female', phone_number: '9876543209', cgpa: 9.4, attendance_percentage: 97.0, parent_name: 'Debashis Roy', parent_phone: '9876543291', parent_email: 'debashis.roy@gmail.com' },
      { roll_number: '23091A4210', full_name: 'Jai Kapoor', email: 'jai.kapoor@college.com', department: 'AIML', year: 2, semester: 3, section: 'A', gender: 'Male', phone_number: '9876543210', cgpa: 8.7, attendance_percentage: 90.0, parent_name: 'Vikram Kapoor', parent_phone: '9876543290', parent_email: 'vikram.kapoor@gmail.com' },
    ];

    for (const s of students) {
      await pool.query(
        `INSERT INTO students (roll_number, full_name, email, department, year, semester, section, gender, phone_number, cgpa, attendance_percentage, parent_name, parent_phone, parent_email, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           department = EXCLUDED.department,
           semester = EXCLUDED.semester,
           section = EXCLUDED.section,
           cgpa = EXCLUDED.cgpa,
           attendance_percentage = EXCLUDED.attendance_percentage;`,
        [
          s.roll_number,
          s.full_name,
          s.email,
          s.department,
          s.year,
          s.semester,
          s.section,
          s.gender,
          s.phone_number,
          s.cgpa,
          s.attendance_percentage,
          s.parent_name,
          s.parent_phone,
          s.parent_email,
        ]
      );
    }
    console.log(`✅ Seeded ${students.length} Students into PostgreSQL.`);
  } catch (e) {
    console.error('Error seeding live data:', e);
  } finally {
    await pool.end();
  }
}

seedLiveData();
