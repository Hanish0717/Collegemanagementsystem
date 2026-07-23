import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:5435/college_management',
});

async function seedAllBranches() {
  console.log('Seeding PostgreSQL database with Multi-Branch Data (CSE, AIML, ECE, EEE, MECH, CIVIL, IT)...');

  try {
    // 1. Seed Faculty across all 7 branches
    const allFaculty = [
      // CSE
      { empId: 'EMP-CSE-101', name: 'Dr. Anjali Mehra', email: 'anjali.mehra@college.com', dept: 'CSE', designation: 'Professor & Head', exp: 15, att: 98.0, subjects: 'Data Structures & Algorithms (CS501)' },
      { empId: 'EMP-CSE-102', name: 'Prof. Rajesh Kumar', email: 'rajesh.kumar@college.com', dept: 'CSE', designation: 'Associate Professor', exp: 10, att: 95.5, subjects: 'Operating Systems (CS502)' },
      { empId: 'EMP-CSE-103', name: 'Prof. Sunita Reddy', email: 'sunita.reddy@college.com', dept: 'CSE', designation: 'Assistant Professor', exp: 7, att: 94.0, subjects: 'Computer Networks (CS503)' },
      
      // AIML
      { empId: 'EMP-AIML-101', name: 'Dr. Ramesh Kumar', email: 'ramesh.kumar@college.com', dept: 'AIML', designation: 'Professor & Head', exp: 14, att: 98.5, subjects: 'Deep Learning & Neural Networks (AIML501)' },
      { empId: 'EMP-AIML-102', name: 'Prof. Sneha Verma', email: 'sneha.verma@college.com', dept: 'AIML', designation: 'Associate Professor', exp: 9, att: 95.0, subjects: 'Natural Language Processing (AIML502)' },
      { empId: 'EMP-AIML-103', name: 'Prof. Vikram Rathore', email: 'vikram.rathore@college.com', dept: 'AIML', designation: 'Assistant Professor', exp: 6, att: 92.0, subjects: 'Computer Vision & Robotics (AIML503L)' },
      
      // ECE
      { empId: 'EMP-ECE-201', name: 'Dr. V. K. Sharma', email: 'vk.sharma@college.com', dept: 'ECE', designation: 'Professor & Head', exp: 16, att: 97.5, subjects: 'Digital Signal Processing (ECE501)' },
      { empId: 'EMP-ECE-202', name: 'Prof. Priya Nambiar', email: 'priya.nambiar@college.com', dept: 'ECE', designation: 'Associate Professor', exp: 11, att: 96.0, subjects: 'Microprocessors & Microcontrollers (ECE502)' },
      { empId: 'EMP-ECE-203', name: 'Dr. S. K. Gupta', email: 'sk.gupta@college.com', dept: 'ECE', designation: 'Assistant Professor', exp: 8, att: 93.0, subjects: 'Antennas & Wave Propagation (ECE503)' },

      // EEE
      { empId: 'EMP-EEE-301', name: 'Dr. Suresh Varma', email: 'suresh.varma@college.com', dept: 'EEE', designation: 'Professor & Head', exp: 18, att: 98.0, subjects: 'Power Systems & Smart Grid (EEE501)' },
      { empId: 'EMP-EEE-302', name: 'Prof. Kavita Rao', email: 'kavita.rao@college.com', dept: 'EEE', designation: 'Associate Professor', exp: 12, att: 95.0, subjects: 'Control Systems (EEE502)' },
      { empId: 'EMP-EEE-303', name: 'Prof. M. K. Chawla', email: 'mk.chawla@college.com', dept: 'EEE', designation: 'Assistant Professor', exp: 7, att: 93.5, subjects: 'Electrical Machines II (EEE503)' },

      // MECH
      { empId: 'EMP-MECH-401', name: 'Dr. Vikram Rathore', email: 'vikram.mech@college.com', dept: 'MECH', designation: 'Professor & Head', exp: 17, att: 97.0, subjects: 'Thermodynamics & Heat Transfer (ME501)' },
      { empId: 'EMP-MECH-402', name: 'Prof. R. P. Singh', email: 'rp.singh@college.com', dept: 'MECH', designation: 'Associate Professor', exp: 10, att: 94.5, subjects: 'CAD/CAM & Robotics (ME502)' },
      { empId: 'EMP-MECH-403', name: 'Prof. Amit Shah', email: 'amit.shah@college.com', dept: 'MECH', designation: 'Assistant Professor', exp: 8, att: 92.5, subjects: 'Fluid Mechanics & Machinery (ME503)' },

      // CIVIL
      { empId: 'EMP-CIVIL-501', name: 'Dr. Rajesh Gupta', email: 'rajesh.gupta@college.com', dept: 'CIVIL', designation: 'Professor & Head', exp: 19, att: 98.5, subjects: 'Structural Analysis & Design (CE501)' },
      { empId: 'EMP-CIVIL-502', name: 'Prof. Meenakshi Sundaram', email: 'meenakshi.sundaram@college.com', dept: 'CIVIL', designation: 'Associate Professor', exp: 13, att: 96.0, subjects: 'Geotechnical Engineering (CE502)' },

      // IT
      { empId: 'EMP-IT-601', name: 'Dr. Neha Sharma', email: 'neha.sharma@college.com', dept: 'IT', designation: 'Professor & Head', exp: 14, att: 97.5, subjects: 'Cloud Computing & DevOps (IT501)' },
      { empId: 'EMP-IT-602', name: 'Prof. Aravind Swamy', email: 'aravind.swamy@college.com', dept: 'IT', designation: 'Associate Professor', exp: 9, att: 95.0, subjects: 'Cyber Security & Cryptography (IT502)' },
    ];

    for (const f of allFaculty) {
      await pool.query(
        `INSERT INTO faculty (employee_id, full_name, email, department, designation, experience, attendance_percentage, status, gender, phone_number, assigned_subjects, assigned_sections)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active', 'Male', '+91 98765 00000', $8, JSON_BUILD_ARRAY('Sem 5 Sec A'))
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           designation = EXCLUDED.designation,
           department = EXCLUDED.department,
           assigned_subjects = EXCLUDED.assigned_subjects;`,
        [f.empId, f.name, f.email, f.dept, f.designation, f.exp, f.att, JSON.stringify([f.subjects])]
      );
    }
    console.log(`✅ Seeded ${allFaculty.length} Multi-Branch Faculty Members into PostgreSQL.`);

    // 2. Seed Students across all 7 branches
    const allStudents = [
      // CSE
      { roll: '23091A0501', name: 'Aakash Verma', email: 'aakash.verma@college.com', dept: 'CSE', sem: 5, sec: 'A', gpa: 9.3, att: 95.0 },
      { roll: '23091A0502', name: 'Bhavna Kulkarni', email: 'bhavna.kulkarni@college.com', dept: 'CSE', sem: 5, sec: 'A', gpa: 8.7, att: 91.0 },
      { roll: '23091A0503', name: 'Chaitanya Das', email: 'chaitanya.das@college.com', dept: 'CSE', sem: 5, sec: 'B', gpa: 7.8, att: 74.0 },

      // EEE
      { roll: '23091A0201', name: 'Dinesh Kumar', email: 'dinesh.kumar@college.com', dept: 'EEE', sem: 5, sec: 'A', gpa: 8.8, att: 92.0 },
      { roll: '23091A0202', name: 'Divya Bharathi', email: 'divya.bharathi@college.com', dept: 'EEE', sem: 5, sec: 'A', gpa: 9.4, att: 96.0 },

      // MECH
      { roll: '23091A0301', name: 'Ganesh Shinde', email: 'ganesh.shinde@college.com', dept: 'MECH', sem: 5, sec: 'A', gpa: 8.2, att: 88.0 },
      { roll: '23091A0302', name: 'Harish Chandra', email: 'harish.chandra@college.com', dept: 'MECH', sem: 5, sec: 'B', gpa: 7.9, att: 84.0 },

      // CIVIL
      { roll: '23091A0101', name: 'Indraja Pillai', email: 'indraja.pillai@college.com', dept: 'CIVIL', sem: 5, sec: 'A', gpa: 8.6, att: 90.0 },

      // IT
      { roll: '23091A1201', name: 'Jitendra Sahu', email: 'jitendra.sahu@college.com', dept: 'IT', sem: 5, sec: 'A', gpa: 9.1, att: 94.0 },
    ];

    for (const s of allStudents) {
      await pool.query(
        `INSERT INTO students (roll_number, full_name, email, department, year, semester, section, gender, phone_number, cgpa, attendance_percentage, parent_name, parent_phone, parent_email, is_active)
         VALUES ($1, $2, $3, $4, 3, $5, $6, 'Male', '+91 98765 11111', $7, $8, 'Parent Name', '9876543210', 'parent@college.com', true)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           department = EXCLUDED.department,
           semester = EXCLUDED.semester,
           section = EXCLUDED.section,
           cgpa = EXCLUDED.cgpa,
           attendance_percentage = EXCLUDED.attendance_percentage;`,
        [s.roll, s.name, s.email, s.dept, s.sem, s.sec, s.gpa, s.att]
      );
    }
    console.log(`✅ Seeded ${allStudents.length} Multi-Branch Students into PostgreSQL.`);
  } catch (e) {
    console.error('Error seeding multi-branch data:', e);
  } finally {
    await pool.end();
  }
}

seedAllBranches();
