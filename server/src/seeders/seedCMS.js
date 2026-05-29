/**
 * Landing Page CMS Seeder
 * Usage: npm run seed:cms
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import CollegeInformation from '../models/cms/CollegeInformation.js';
import CMSAnnouncement from '../models/cms/CMSAnnouncement.js';
import Event from '../models/cms/Event.js';
import ContactInformation from '../models/cms/ContactInformation.js';
import Testimonial from '../models/cms/Testimonial.js';
import Gallery from '../models/cms/Gallery.js';
import FAQ from '../models/cms/FAQ.js';
import User from '../models/auth/User.js';

dotenv.config();

const collegeInfoData = {
  name: 'Apex Institute of Technology & Sciences',
  tagline: 'Strive for Excellence, Innovate for Tomorrow',
  logo: 'https://storage.college.edu/assets/logo.png',
  aboutUs: 'Apex Institute of Technology & Sciences is a premier educational institution committed to delivering top-tier technical and management education. With state-of-the-art laboratories, a modern library, and an active placement cell, we nurture students to become future innovators.',
  vision: 'To be a globally recognized center of excellence in education and research, fostering innovation and leadership in technical domains.',
  mission: 'To impart quality technical education, promote research and innovation, build strong industry partnerships, and develop socially responsible leaders.',
  establishedYear: 2010,
  accreditations: ['NAAC Accredited with A+ Grade', 'NBA Accredited Programs', 'ISO 9001:2015 Certified'],
  bannerImages: [
    'https://storage.college.edu/banners/campus-main.jpg',
    'https://storage.college.edu/banners/library-interior.jpg',
    'https://storage.college.edu/banners/sports-complex.jpg',
  ],
  seoMetadata: {
    title: 'Apex Institute of Technology & Sciences | Premier Engineering & Management College',
    description: 'Welcome to Apex Institute of Technology & Sciences. Discover our academic programs, admissions, vibrant campus life, and top-tier placement records.',
    keywords: ['engineering college', 'management college', 'best placements', 'btech admission', 'mba admission', 'apex campus'],
  },
};

const announcementsData = [
  { title: 'Academic Calendar for Autumn Semester 2026', content: 'The academic calendar containing start dates, mid-term examinations, holidays, and end-semester dates has been published. All students are advised to download and plan accordingly.', summary: 'Detailed schedule and dates for the upcoming autumn semester.', category: 'academic', priority: 'high', targetAudience: ['students', 'faculty'] },
  { title: 'Campus Recruitment Registrations Open', content: 'Registration for placement drives starting next month is now open. Eligible final-year B.Tech & MBA students must register on the placement portal by Sunday.', summary: 'Placement portal registration deadline for final-year students.', category: 'placement', priority: 'critical', targetAudience: ['students'] },
  { title: 'Declaration of Mid-Term Exam Results', content: 'Mid-term exam results for all B.Tech branches have been uploaded to the student portal. Re-evaluation requests can be submitted within 5 working days.', summary: 'Results uploaded. Re-evaluation window active.', category: 'examination', priority: 'medium', targetAudience: ['students', 'parents'] },
];

const eventsData = [
  { title: 'Apex Hackathon 2026', description: 'A 36-hour national-level coding hackathon where students build innovative solutions for sustainable cities, fintech, and digital health.', category: 'technical', startDate: new Date(2026, 6, 15, 9, 0), endDate: new Date(2026, 6, 16, 21, 0), venue: 'Main Auditorium & CS Labs', organizer: 'AITS Coding Club', registrationRequired: true, registrationLink: 'https://hackathon.college.edu/register' },
  { title: 'Annual Cultural Fest - Spandana 2026', description: 'Celebrating music, dance, fashion, arts, and drama. Join us for a star-studded evening featuring live performances and campus talent.', category: 'cultural', startDate: new Date(2026, 7, 10, 10, 0), endDate: new Date(2026, 7, 12, 22, 0), venue: 'College Open-Air Theatre', organizer: 'Student Welfare Committee', registrationRequired: false },
  { title: 'International Conference on Green Technologies', description: 'Keynote addresses, research paper presentations, and panels with international delegates on renewable energy, grid storage, and sustainable materials.', category: 'seminar', startDate: new Date(2026, 8, 5, 9, 30), endDate: new Date(2026, 8, 6, 17, 30), venue: 'Seminar Hall 3', organizer: 'Dept of Mechanical Engineering', registrationRequired: true, registrationLink: 'https://greencon.college.edu' },
];

const contactInfoData = {
  address: {
    street: 'Plot No. 45, Academic Zone, Hi-Tech City Road',
    city: 'Hyderabad',
    state: 'Telangana',
    pinCode: '500081',
  },
  phoneNumbers: ['+91 40 2345 6789', '+91 40 2345 6790'],
  emails: ['admissions@apex.edu.in', 'info@apex.edu.in'],
  socialLinks: {
    facebook: 'https://facebook.com/apex.institute',
    twitter: 'https://twitter.com/apex_institute',
    linkedin: 'https://linkedin.com/school/apex-institute',
    youtube: 'https://youtube.com/c/apex_institute',
    instagram: 'https://instagram.com/apex.institute',
  },
  coordinates: {
    latitude: 17.4483,
    longitude: 78.3741,
  },
};

const testimonialsData = [
  { name: 'Dr. Ramesh Kumar', designation: 'parent', companyOrBatch: 'Parent of CS Student', message: 'The faculty is outstanding, and the focus on research has truly transformed my son\'s career trajectory. Highly recommended!', rating: 5, isApproved: true, featured: true },
  { name: 'Sarah Jenkins', designation: 'recruiter', companyOrBatch: 'Google India Recruiter', message: 'Students from Apex display solid fundamental knowledge, problem-solving skills, and a great work ethic. We are happy with our hires.', rating: 5, isApproved: true, featured: true },
  { name: 'Rohan Sharma', designation: 'alumnus', companyOrBatch: 'Microsoft (2024 Batch)', message: 'Apex provided me with the mentorship and resource support that helped me clear product-company interviews. Grateful to my professors.', rating: 5, isApproved: true, featured: true },
  { name: 'Neha Reddy', designation: 'student', companyOrBatch: 'B.Tech CSE - 4th Year', message: 'Vibrant campus life, excellent coding culture, and endless opportunities to grow. Best 4 years of my life!', rating: 4, isApproved: true, featured: false },
];

const galleriesData = [
  { title: 'Campus & Infrastructure', description: 'Glimpses of our modern classrooms, well-equipped labs, central library, and green campus corridors.', category: 'campus', images: [
    { url: 'https://storage.college.edu/gallery/campus-front.jpg', caption: 'College Main Entrance and Block A' },
    { url: 'https://storage.college.edu/gallery/library.jpg', caption: 'Our multi-storey automated digital library' },
    { url: 'https://storage.college.edu/gallery/lab-cs.jpg', caption: 'High-performance computing lab' },
  ], tags: ['infrastructure', 'campus', 'building', 'library'] },
  { title: 'Sports & Cultural Highlights', description: 'Highlights of cultural performances and inter-collegiate sports championship matches.', category: 'cultural', images: [
    { url: 'https://storage.college.edu/gallery/dance-fest.jpg', caption: 'Folk dance performance at Spandana Fest' },
    { url: 'https://storage.college.edu/gallery/cricket-team.jpg', caption: 'College cricket team lifting the Zonal Trophy' },
  ], tags: ['sports', 'fest', 'spandana', 'culture'] },
];

const faqsData = [
  { question: 'What is the minimum CGPA required for placements?', answer: 'While it varies by recruiter, a minimum CGPA of 6.0 is required to register for placements. Top product companies (like Google, Microsoft) generally set a cut-off of 7.5 or 8.0 CGPA.', category: 'placements', orderNumber: 1 },
  { question: 'Are hostel facilities available for outstation students?', answer: 'Yes, separate boys and girls hostels are available on campus with Wi-Fi, laundry, common rooms, and complete dining/mess facilities.', category: 'hostel', orderNumber: 2 },
  { question: 'What is the procedure for semester registration?', answer: 'Semester registration is completed online through the Student Portal by paying the fee and selecting elective courses as advised by department mentors.', category: 'academics', orderNumber: 3 },
  { question: 'Does the college run transport routes across the city?', answer: 'Yes, a fleet of college buses services major residential routes. Routes and stops can be checked and allocated via the Transport module.', category: 'transport', orderNumber: 4 },
];

async function seedCMS() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Landing Page CMS Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const adminUser = await User.findOne({ role: 'super-admin' }) || await User.findOne({});

    // ── College Info ────────────────────────────────
    console.log('📌 Seeding College Information...');
    await CollegeInformation.deleteMany({}).setOptions({ includeDeleted: true });
    await CollegeInformation.create(collegeInfoData);
    console.log(`   ✅ ${collegeInfoData.name}`);

    // ── Announcements ───────────────────────────────
    console.log('\n📌 Seeding Announcements...');
    await CMSAnnouncement.deleteMany({}).setOptions({ includeDeleted: true });
    for (const a of announcementsData) {
      await CMSAnnouncement.create({
        ...a,
        author: adminUser?._id,
        publishedAt: new Date(),
        status: 'published',
      });
      console.log(`   ✅ Notice: ${a.title}`);
    }

    // ── Events ──────────────────────────────────────
    console.log('\n📌 Seeding Events...');
    await Event.deleteMany({}).setOptions({ includeDeleted: true });
    for (const e of eventsData) {
      await Event.create({
        ...e,
        seoMetadata: {
          title: `${e.title} | Apex Institute`,
          description: e.description.slice(0, 150),
          keywords: [e.category, 'event', 'apex', 'registration'],
        },
      });
      console.log(`   ✅ Event: ${e.title}`);
    }

    // ── Contact Info ────────────────────────────────
    console.log('\n📌 Seeding Contact Information...');
    await ContactInformation.deleteMany({}).setOptions({ includeDeleted: true });
    await ContactInformation.create(contactInfoData);
    console.log('   ✅ Office Address & Social Details');

    // ── Testimonials ────────────────────────────────
    console.log('\n📌 Seeding Testimonials...');
    await Testimonial.deleteMany({}).setOptions({ includeDeleted: true });
    for (const t of testimonialsData) {
      await Testimonial.create(t);
      console.log(`   ✅ Review by: ${t.name} (${t.designation})`);
    }

    // ── Galleries ───────────────────────────────────
    console.log('\n📌 Seeding Galleries...');
    await Gallery.deleteMany({}).setOptions({ includeDeleted: true });
    for (const g of galleriesData) {
      await Gallery.create(g);
      console.log(`   ✅ Album: ${g.title} (${g.images.length} photos)`);
    }

    // ── FAQs ────────────────────────────────────────
    console.log('\n📌 Seeding FAQs...');
    await FAQ.deleteMany({}).setOptions({ includeDeleted: true });
    for (const f of faqsData) {
      await FAQ.create(f);
      console.log(`   ✅ FAQ [${f.category}]: ${f.question.slice(0, 40)}...`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Landing Page CMS module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedCMS();
