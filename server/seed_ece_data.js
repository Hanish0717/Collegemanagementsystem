import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:5435/college_management',
});

async function seedECEData() {
  console.log('Seeding PostgreSQL database with ECE Faculty & Student records...');

  try {
    // 1. Insert ECE Faculty Members
    const eceFaculty = [
      {
        employee_id: 'EMP-ECE-201',
        full_name: 'Dr. V. K. Sharma',
        email: 'vk.sharma@college.com',
        department: 'ECE',
        designation: 'Professor & Head',
        experience: 16,
        attendance_percentage: 97.5,
        status: 'Active',
        gender: 'Male',
        phone_number: '+91 98765 43220',
        assigned_subjects: JSON.stringify(['Digital Signal Processing (ECE501)', 'VLSI Design (ECE701)']),
        assigned_sections: JSON.stringify(['Sem 5 Sec A', 'Sem 7 Sec A']),
      },
      {
        employee_id: 'EMP-ECE-202',
        full_name: 'Prof. Priya Nambiar',
        email: 'priya.nambiar@college.com',
        department: 'ECE',
        designation: 'Associate Professor',
        experience: 11,
        attendance_percentage: 96.0,
        status: 'Active',
        gender: 'Female',
        phone_number: '+91 98765 43221',
        assigned_subjects: JSON.stringify(['Microprocessors & Microcontrollers (ECE502)']),
        assigned_sections: JSON.stringify(['Sem 5 Sec B']),
      },
      {
        employee_id: 'EMP-ECE-203',
        full_name: 'Dr. S. K. Gupta',
        email: 'sk.gupta@college.com',
        department: 'ECE',
        designation: 'Assistant Professor',
        experience: 8,
        attendance_percentage: 93.0,
        status: 'Active',
        gender: 'Male',
        phone_number: '+91 98765 43222',
        assigned_subjects: JSON.stringify(['Antennas & Wave Propagation (ECE503)']),
        assigned_sections: JSON.stringify(['Sem 5 Sec C']),
      },
      {
        employee_id: 'EMP-ECE-204',
        full_name: 'Prof. Anil Deshmukh',
        email: 'anil.deshmukh@college.com',
        department: 'ECE',
        designation: 'Assistant Professor',
        experience: 6,
        attendance_percentage: 94.5,
        status: 'Active',
        gender: 'Male',
        phone_number: '+91 98765 43223',
        assigned_subjects: JSON.stringify(['Embedded Systems & IoT (ECE702)']),
        assigned_sections: JSON.stringify(['Sem 7 Sec B']),
      },
      {
        employee_id: 'EMP-ECE-205',
        full_name: 'Dr. Radhika Menon',
        email: 'radhika.menon@college.com',
        department: 'ECE',
        designation: 'Assistant Professor',
        experience: 7,
        attendance_percentage: 95.5,
        status: 'Active',
        gender: 'Female',
        phone_number: '+91 98765 43224',
        assigned_subjects: JSON.stringify(['Communication Systems (ECE301)']),
        assigned_sections: JSON.stringify(['Sem 3 Sec A']),
      },
    ];

    for (const f of eceFaculty) {
      await pool.query(
        `INSERT INTO faculty (employee_id, full_name, email, department, designation, experience, attendance_percentage, status, gender, phone_number, assigned_subjects, assigned_sections)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           designation = EXCLUDED.designation,
           department = EXCLUDED.department,
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
    console.log(`✅ Seeded ${eceFaculty.length} ECE Faculty members into PostgreSQL.`);

    // 2. Insert ECE Students
    const eceStudents = [
      { roll_number: '23091A0401', full_name: 'Abhinav Varma', email: 'abhinav.varma@college.com', department: 'ECE', year: 3, semester: 5, section: 'A', gender: 'Male', phone_number: '9876543301', cgpa: 8.9, attendance_percentage: 93.0, parent_name: 'Koteswara Varma', parent_phone: '9876543399', parent_email: 'koteswara.varma@gmail.com' },
      { roll_number: '23091A0402', full_name: 'Bhavya Sri', email: 'bhavya.sri@college.com', department: 'ECE', year: 3, semester: 5, section: 'A', gender: 'Female', phone_number: '9876543302', cgpa: 9.1, attendance_percentage: 95.0, parent_name: 'Srinivasa Rao', parent_phone: '9876543398', parent_email: 'srinivasa.rao@gmail.com' },
      { roll_number: '23091A0403', full_name: 'Chetan Kumar', email: 'chetan.kumar@college.com', department: 'ECE', year: 3, semester: 5, section: 'B', gender: 'Male', phone_number: '9876543303', cgpa: 7.6, attendance_percentage: 72.0, parent_name: 'Anand Kumar', parent_phone: '9876543397', parent_email: 'anand.kumar@gmail.com' },
      { roll_number: '23091A0404', full_name: 'Deepika Sen', email: 'deepika.sen@college.com', department: 'ECE', year: 3, semester: 5, section: 'B', gender: 'Female', phone_number: '9876543304', cgpa: 9.5, attendance_percentage: 97.0, parent_name: 'Pranab Sen', parent_phone: '9876543396', parent_email: 'pranab.sen@gmail.com' },
    ];

    for (const s of eceStudents) {
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
    console.log(`✅ Seeded ${eceStudents.length} ECE Students into PostgreSQL.`);
  } catch (e) {
    console.error('Error seeding ECE data:', e);
  } finally {
    await pool.end();
  }
}

seedECEData();
