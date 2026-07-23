import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:postgres@127.0.0.1:5435/college_management',
});

async function initAnnouncementsTables() {
  console.log('Initializing PostgreSQL Announcements & Circulars schema...');

  try {
    // 1. Create announcements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(64) NOT NULL,
        priority VARCHAR(32) NOT NULL,
        audience VARCHAR(64) NOT NULL,
        department VARCHAR(32) NOT NULL,
        semester INT,
        section VARCHAR(16),
        expiry_date DATE,
        status VARCHAR(32) NOT NULL DEFAULT 'Published',
        attachment_url VARCHAR(512),
        attachment_name VARCHAR(255),
        published_by VARCHAR(128) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create announcement_recipients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcement_recipients (
        id VARCHAR(64) PRIMARY KEY,
        announcement_id VARCHAR(64) REFERENCES announcements(id) ON DELETE CASCADE,
        recipient_type VARCHAR(64) NOT NULL,
        recipient_id VARCHAR(128),
        read_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 3. Create announcement_attachments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcement_attachments (
        id VARCHAR(64) PRIMARY KEY,
        announcement_id VARCHAR(64) REFERENCES announcements(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(64) NOT NULL,
        file_size VARCHAR(32) NOT NULL,
        version VARCHAR(16) DEFAULT 'v1.0',
        uploaded_by VARCHAR(128) NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Seed initial announcements for testing
    const sampleAnnouncements = [
      {
        id: 'ANN-2026-001',
        title: 'Mid-1 Internal Examination Schedule & Guidelines',
        description: 'Official Mid-1 Examination timetable for all 3rd Year B.Tech students. Attendance is mandatory.',
        category: 'Examination',
        priority: 'High',
        audience: 'All Students',
        department: 'AIML',
        semester: 5,
        section: 'A',
        expiry_date: '2026-08-15',
        status: 'Published',
        attachment_name: 'Mid1_Exam_Timetable_2026.pdf',
        published_by: 'Dr. Ramesh Kumar (HOD)',
      },
      {
        id: 'ANN-2026-002',
        title: 'NBA Accreditation Faculty Peer Review Meeting',
        description: 'All department faculty members are requested to attend the Criterion 5 compliance review in Seminar Hall B.',
        category: 'Meeting',
        priority: 'Critical',
        audience: 'All Faculty',
        department: 'AIML',
        semester: null,
        section: null,
        expiry_date: '2026-07-30',
        status: 'Published',
        attachment_name: 'NBA_Criterion5_Review_Agenda.pdf',
        published_by: 'Dr. Ramesh Kumar (HOD)',
      },
      {
        id: 'ANN-2026-003',
        title: 'Campus Placement Drive — Microsoft & Google AI Labs',
        description: 'Eligible 7th & 5th semester students with CGPA > 8.0 must submit resumes to Placement Cell by Friday.',
        category: 'Placement',
        priority: 'High',
        audience: 'All Students',
        department: 'AIML',
        semester: 5,
        section: null,
        expiry_date: '2026-08-10',
        status: 'Published',
        attachment_name: 'Placement_Drive_Eligibility.pdf',
        published_by: 'Dr. Ramesh Kumar (HOD)',
      },
    ];

    for (const a of sampleAnnouncements) {
      await pool.query(
        `INSERT INTO announcements (id, title, description, category, priority, audience, department, semester, section, expiry_date, status, attachment_name, published_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING;`,
        [a.id, a.title, a.description, a.category, a.priority, a.audience, a.department, a.semester, a.section, a.expiry_date, a.status, a.attachment_name, a.published_by]
      );
    }

    console.log('✅ PostgreSQL Announcements & Circulars schema created & seeded successfully!');
  } catch (err) {
    console.error('Error creating announcements tables:', err);
  } finally {
    await pool.end();
  }
}

initAnnouncementsTables();
