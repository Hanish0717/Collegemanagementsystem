/**
 * Database Seeder
 * 
 * Comprehensive seeder for the College Management System.
 * Seeds all core entities: users, departments, academic years, subjects,
 * students, faculty, parents, books, fees, and sample data for all modules.
 * 
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all models from barrel export
import {
  User,
  Permission,
  Department,
  AcademicYear,
  Subject,
  Student,
  Faculty,
  Parent,
  Fee,
  Book,
  BookCategory,
  IssuedBook,
  Hostel,
  HostelRoom,
  HostelAllocation,
  TransportRoute,
  TransportVehicle,
  TransportAllocation,
  PlacementDrive,
  CMSPage,
  CMSBanner,
  CMSAnnouncement,
  Stop,
  Bus,
  Driver,
  Company,
  DriveRound,
  Role,
  PermissionGroup,
  RolePermission,
  UserRole,
} from '../models/index.js';

dotenv.config();

// ═══════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════

const usersToSeed = [
  {
    fullName: 'System Super Admin',
    email: 'superadmin@college.com',
    password: 'password123',
    role: 'super-admin',
    phoneNumber: '9876543210',
  },
  {
    fullName: 'System Admin',
    email: 'admin@college.com',
    password: 'password123',
    role: 'admin',
    phoneNumber: '9876543211',
  },
  {
    fullName: 'Dr. John Smith',
    email: 'faculty@college.com',
    password: 'password123',
    role: 'faculty',
    phoneNumber: '9876543212',
  },
  {
    fullName: 'Jane Doe',
    email: 'student@college.com',
    password: 'password123',
    role: 'student',
    phoneNumber: '9876543213',
  },
  {
    fullName: 'Robert Doe',
    email: 'parent@college.com',
    password: 'password123',
    role: 'parent',
    phoneNumber: '9876543214',
  },
  {
    fullName: 'Sarah Librarian',
    email: 'librarian@college.com',
    password: 'password123',
    role: 'librarian',
    phoneNumber: '9876543215',
  },
  {
    fullName: 'Robert Placement',
    email: 'placement@college.com',
    password: 'password123',
    role: 'placement-officer',
    phoneNumber: '9876543216',
  },
  {
    fullName: 'Emily Warden',
    email: 'warden@college.com',
    password: 'password123',
    role: 'hostel-warden',
    phoneNumber: '9876543217',
  },
  {
    fullName: 'David Transport',
    email: 'transport@college.com',
    password: 'password123',
    role: 'transport-manager',
    phoneNumber: '9876543218',
  },
];

const departmentsToSeed = [
  { name: 'Computer Science and Engineering', code: 'CSE', totalSeats: 120, establishedYear: 2005 },
  { name: 'Electronics and Communication Engineering', code: 'ECE', totalSeats: 120, establishedYear: 2005 },
  { name: 'Mechanical Engineering', code: 'ME', totalSeats: 60, establishedYear: 2008 },
  { name: 'Civil Engineering', code: 'CE', totalSeats: 60, establishedYear: 2010 },
  { name: 'Electrical Engineering', code: 'EE', totalSeats: 60, establishedYear: 2010 },
];

const bookCategoriesToSeed = [
  { name: 'Computer Science', code: 'CS', shelfPrefix: 'CS' },
  { name: 'Software Engineering', code: 'SE', shelfPrefix: 'SE' },
  { name: 'Mathematics', code: 'MATH', shelfPrefix: 'MA' },
  { name: 'Physics', code: 'PHY', shelfPrefix: 'PH' },
  { name: 'Electronics', code: 'ELEC', shelfPrefix: 'EL' },
];

const booksToSeed = [
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    categoryName: 'Computer Science',
    isbn: '9780262033848',
    publisher: 'MIT Press',
    edition: '3rd',
    totalCopies: 10,
    availableCopies: 8,
    language: 'English',
    shelfNumber: 'CS-04',
    description: 'A comprehensive guide to the design and analysis of computer algorithms.',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    categoryName: 'Software Engineering',
    isbn: '9780132350884',
    publisher: 'Prentice Hall',
    edition: '1st',
    totalCopies: 5,
    availableCopies: 4,
    language: 'English',
    shelfNumber: 'SE-02',
    description: 'A handbook of agile software craftsmanship.',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    categoryName: 'Software Engineering',
    isbn: '9780201616224',
    publisher: 'Addison-Wesley',
    edition: '20th Anniversary',
    totalCopies: 6,
    availableCopies: 6,
    language: 'English',
    shelfNumber: 'SE-03',
    description: 'Your journey to mastery.',
  },
];

// ═══════════════════════════════════════════════════════════
// SEED FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function seedUsers() {
  console.log('\n📌 Seeding Users...');
  const emailsToClean = usersToSeed.map((u) => u.email);
  await User.deleteMany({ email: { $in: emailsToClean } }).setOptions({ includeDeleted: true });

  const seededUsers = {};
  for (const u of usersToSeed) {
    const user = await User.create(u);
    seededUsers[user.role] = user;
    console.log(`   ✅ ${user.email} (${user.role})`);
  }
  return seededUsers;
}

async function seedDepartments() {
  console.log('\n📌 Seeding Departments...');
  const codesToClean = departmentsToSeed.map((d) => d.code);
  await Department.deleteMany({ code: { $in: codesToClean } }).setOptions({ includeDeleted: true });

  const seededDepts = {};
  for (const d of departmentsToSeed) {
    const dept = await Department.create(d);
    seededDepts[dept.code] = dept;
    console.log(`   ✅ ${dept.name} (${dept.code})`);
  }
  return seededDepts;
}

async function seedAcademicYear() {
  console.log('\n📌 Seeding Academic Year...');
  await AcademicYear.deleteMany({ name: '2025-2026' }).setOptions({ includeDeleted: true });

  const ay = await AcademicYear.create({
    name: '2025-2026',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2026-06-30'),
    isCurrent: true,
  });
  console.log(`   ✅ ${ay.name} (current)`);
  return ay;
}

async function seedSubjects(departments) {
  console.log('\n📌 Seeding Subjects...');
  const subjectsData = [
    { name: 'Data Structures', code: 'CS301', department: departments['CSE']._id, semester: 3, credits: 4, type: 'theory' },
    { name: 'Database Management Systems', code: 'CS401', department: departments['CSE']._id, semester: 4, credits: 4, type: 'theory' },
    { name: 'Operating Systems', code: 'CS501', department: departments['CSE']._id, semester: 5, credits: 4, type: 'theory' },
    { name: 'Computer Networks', code: 'CS601', department: departments['CSE']._id, semester: 6, credits: 3, type: 'theory' },
    { name: 'Machine Learning', code: 'CS701', department: departments['CSE']._id, semester: 7, credits: 4, type: 'elective' },
    { name: 'Digital Electronics', code: 'EC301', department: departments['ECE']._id, semester: 3, credits: 4, type: 'theory' },
  ];

  const codesToClean = subjectsData.map((s) => s.code);
  await Subject.deleteMany({ code: { $in: codesToClean } }).setOptions({ includeDeleted: true });

  for (const s of subjectsData) {
    const subj = await Subject.create(s);
    console.log(`   ✅ ${subj.name} (${subj.code})`);
  }
}

async function seedStudent(users, departments, academicYear) {
  console.log('\n📌 Seeding Student Profile...');
  const studentUser = users['student'];
  await Student.deleteMany({ email: studentUser.email }).setOptions({ includeDeleted: true });

  const student = await Student.create({
    user: studentUser._id,
    fullName: studentUser.fullName,
    rollNumber: 'CS2026001',
    email: studentUser.email,
    phoneNumber: studentUser.phoneNumber,
    gender: 'Female',
    dateOfBirth: new Date('2004-05-15'),
    department: departments['CSE']._id,
    departmentName: 'CSE',
    year: 3,
    semester: 6,
    section: 'A',
    parentName: 'Robert Doe',
    parentPhone: '9876543214',
    parent: users['parent']._id,
    cgpa: 9.4,
    attendancePercentage: 92,
  });
  console.log(`   ✅ ${student.fullName} (${student.rollNumber})`);
  return student;
}

async function seedFaculty(users, departments) {
  console.log('\n📌 Seeding Faculty Profile...');
  const facultyUser = users['faculty'];
  await Faculty.deleteMany({ email: facultyUser.email }).setOptions({ includeDeleted: true });

  const faculty = await Faculty.create({
    user: facultyUser._id,
    fullName: facultyUser.fullName,
    employeeId: 'FAC2020001',
    email: facultyUser.email,
    phoneNumber: facultyUser.phoneNumber,
    gender: 'Male',
    department: departments['CSE']._id,
    designation: 'Associate Professor',
    qualification: 'Ph.D. in Computer Science',
    specialization: 'Machine Learning',
    experience: 12,
    joiningDate: new Date('2020-08-01'),
  });
  console.log(`   ✅ ${faculty.fullName} (${faculty.employeeId})`);
  return faculty;
}

async function seedParent(users, student) {
  console.log('\n📌 Seeding Parent Profile...');
  const parentUser = users['parent'];
  await Parent.deleteMany({ email: parentUser.email }).setOptions({ includeDeleted: true });

  const parent = await Parent.create({
    user: parentUser._id,
    fullName: parentUser.fullName,
    email: parentUser.email,
    phoneNumber: parentUser.phoneNumber,
    relationship: 'Father',
    occupation: 'Engineer',
    students: [student._id],
  });
  console.log(`   ✅ ${parent.fullName}`);
  return parent;
}

async function seedFees(student, academicYear) {
  console.log('\n📌 Seeding Fee Records...');
  await Fee.deleteMany({ student: student._id }).setOptions({ includeDeleted: true });

  const fees = await Fee.create([
    {
      student: student._id,
      academicYear: academicYear._id,
      academicYearName: '2025-2026',
      semester: 6,
      feeType: 'tuition',
      totalAmount: 50000,
      paidAmount: 50000,
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      paymentMethod: 'bank-transfer',
      transactionId: 'TXN8391039',
    },
    {
      student: student._id,
      academicYear: academicYear._id,
      academicYearName: '2025-2026',
      semester: 6,
      feeType: 'hostel',
      totalAmount: 25000,
      paidAmount: 10000,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      paymentMethod: 'upi',
      transactionId: 'TXN8391040',
    },
    {
      student: student._id,
      academicYear: academicYear._id,
      academicYearName: '2025-2026',
      semester: 6,
      feeType: 'examination',
      totalAmount: 2500,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log(`   ✅ Created ${fees.length} fee records`);
}

async function seedBookCategories() {
  console.log('\n📌 Seeding Book Categories...');
  const namesToClean = bookCategoriesToSeed.map((c) => c.name);
  await BookCategory.deleteMany({ name: { $in: namesToClean } }).setOptions({ includeDeleted: true });

  const seededCategories = {};
  for (const c of bookCategoriesToSeed) {
    const cat = await BookCategory.create(c);
    seededCategories[cat.name] = cat;
    console.log(`   ✅ ${cat.name} (${cat.code})`);
  }
  return seededCategories;
}

async function seedBooks(categories) {
  console.log('\n📌 Seeding Books...');
  const isbnsToClean = booksToSeed.map((b) => b.isbn);
  await Book.deleteMany({ isbn: { $in: isbnsToClean } }).setOptions({ includeDeleted: true });

  for (const b of booksToSeed) {
    const categoryRef = categories[b.categoryName];
    const bookData = { ...b };
    if (categoryRef) bookData.category = categoryRef._id;
    const book = await Book.create(bookData);
    console.log(`   ✅ ${book.title}`);
  }
}

async function seedHostel(users) {
  console.log('\n📌 Seeding Hostel...');
  await Hostel.deleteMany({ code: 'BH1' }).setOptions({ includeDeleted: true });

  const hostel = await Hostel.create({
    name: 'Boys Hostel Block A',
    code: 'BH1',
    type: 'boys',
    warden: users['hostel-warden']._id,
    totalRooms: 50,
    totalBeds: 200,
    occupiedBeds: 150,
    facilities: ['WiFi', 'Gym', 'Mess', 'Laundry', 'Common Room'],
    monthlyFee: 5000,
    contactNumber: '9876543217',
  });
  console.log(`   ✅ ${hostel.name}`);
  return hostel;
}async function seedTransport() {
  console.log('\n📌 Seeding Transport...');
  await TransportRoute.deleteMany({ routeNumber: 'R001' }).setOptions({ includeDeleted: true });
  await Stop.deleteMany({ name: { $in: ['City Center', 'Railway Station', 'Tech Park', 'College Gate'] } }).setOptions({ includeDeleted: true });
  await Bus.deleteMany({ busNumber: 'TS-09-UB-9999' }).setOptions({ includeDeleted: true });
  await Driver.deleteMany({ licenseNumber: 'DL-1234567890' }).setOptions({ includeDeleted: true });

  const bus = await Bus.create({
    busNumber: 'TS-09-UB-9999', type: 'bus', make: 'Tata', model: 'Starbus', year: 2021, capacity: 50, fuelType: 'cng', status: 'active',
  });

  const driver = await Driver.create({
    fullName: 'Ramesh Kumar', phone: '9876500001', licenseNumber: 'DL-1234567890', licenseExpiry: new Date(2028, 5, 20), experienceYears: 10, assignedBus: bus._id,
  });

  const stopsData = [
    { name: 'City Center', monthlyFare: 1500, landmark: 'Near Central Mall' },
    { name: 'Railway Station', monthlyFare: 1600, landmark: 'East Gate' },
    { name: 'Tech Park', monthlyFare: 1700, landmark: 'Near Gate 1' },
    { name: 'College Gate', monthlyFare: 1800, landmark: 'Main Gate' },
  ];

  const stopDocs = [];
  for (const s of stopsData) {
    const stopDoc = await Stop.create(s);
    stopDocs.push(stopDoc);
  }

  const routeStops = stopDocs.map((s, index) => ({
    stop: s._id,
    arrivalTime: index === 0 ? '07:30' : index === 1 ? '07:45' : index === 2 ? '08:00' : '08:15',
    order: index + 1,
  }));

  const route = await TransportRoute.create({
    name: 'City Center to Campus',
    routeNumber: 'R001',
    startPoint: 'City Center Bus Stand',
    endPoint: 'College Main Gate',
    stops: routeStops,
    distance: 15,
    estimatedTime: '45 mins',
    bus: bus._id,
    driver: driver._id,
  });
  console.log(`   ✅ ${route.name} (${route.routeNumber})`);
}
async function seedPlacement(departments) {
  console.log('\n📌 Seeding Placement Drive...');
  await Company.deleteMany({ name: 'Tech Corp India' }).setOptions({ includeDeleted: true });
  await PlacementDrive.deleteMany({ companyName: 'Tech Corp India' }).setOptions({ includeDeleted: true });

  const company = await Company.create({
    name: 'Tech Corp India', website: 'https://techcorp.in', industry: 'Software Development',
    contacts: [{ name: 'Aditi Roy', email: 'aditi@techcorp.in', phone: '9876543219', designation: 'University Relations' }],
  });

  const drive = await PlacementDrive.create({
    company: company._id,
    companyName: 'Tech Corp India',
    description: 'Annual campus recruitment drive for software engineering roles.',
    jobTitle: 'Software Developer',
    jobType: 'full-time',
    package: { minimum: 6, maximum: 12, currency: 'LPA' },
    eligibility: {
      departments: [departments['CSE']._id, departments['ECE']._id],
      minCGPA: 7.0,
      maxBacklogs: 0,
      batch: 2026,
    },
    driveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    lastDateToApply: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    venue: 'Seminar Hall A',
    totalPositions: 20,
    status: 'upcoming',
  });

  // Create mock rounds as well
  const roundsData = [
    { num: 1, name: 'Online Aptitude Test', type: 'aptitude' },
    { num: 2, name: 'Technical Coding Round', type: 'coding' },
    { num: 3, name: 'Technical Interview', type: 'technical' },
    { num: 4, name: 'HR Interview', type: 'hr' },
  ];

  for (const r of roundsData) {
    await DriveRound.create({
      drive: drive._id, roundNumber: r.num, name: r.name, type: r.type, status: 'scheduled',
    });
  }

  console.log(`   ✅ ${drive.companyName} - ${drive.jobTitle}`);
}async function seedCMS(users) {
  console.log('\n📌 Seeding CMS Content...');
  const adminUser = users['admin'] || users['super-admin'];

  // Clean existing
  await CMSAnnouncement.deleteMany({ title: 'Welcome to Academic Year 2025-2026' }).setOptions({ includeDeleted: true });

  await CMSAnnouncement.create({
    title: 'Welcome to Academic Year 2025-2026',
    content: 'We welcome all students and faculty to the new academic year. Classes begin on July 15, 2025.',
    summary: 'New academic year begins July 15',
    category: 'academic',
    priority: 'high',
    targetAudience: ['all'],
    author: adminUser._id,
    publishedAt: new Date(),
    isPinned: true,
    status: 'published',
  });
  console.log('   ✅ Welcome announcement created');
}

async function seedPermissions() {
  console.log('\n📌 Seeding RBAC System...');

  const permissionGroups = [
    { name: 'Dashboard', slug: 'dashboard', icon: '📊', order: 1, description: 'Dashboard & analytics access' },
    { name: 'User Management', slug: 'user-management', icon: '👤', order: 2, description: 'Manage system users and accounts' },
    { name: 'Role Management', slug: 'role-management', icon: '🔐', order: 3, description: 'Manage roles and permissions' },
    { name: 'Student Management', slug: 'student-management', icon: '🎓', order: 4, description: 'Student records and profiles' },
    { name: 'Faculty Management', slug: 'faculty-management', icon: '👨‍🏫', order: 5, description: 'Faculty records and assignments' },
    { name: 'Academic Operations', slug: 'academic-operations', icon: '📚', order: 6, description: 'Attendance, subjects, departments' },
    { name: 'Financial Operations', slug: 'financial-operations', icon: '💰', order: 7, description: 'Fees, payments, and financial reports' },
    { name: 'Library Management', slug: 'library-management', icon: '📖', order: 8, description: 'Book catalog, issues, and returns' },
    { name: 'Hostel Management', slug: 'hostel-management', icon: '🏠', order: 9, description: 'Hostels, rooms, and allocations' },
    { name: 'Transport Management', slug: 'transport-management', icon: '🚌', order: 10, description: 'Routes, vehicles, and allocations' },
    { name: 'Placement Management', slug: 'placement-management', icon: '💼', order: 11, description: 'Placement drives and applications' },
    { name: 'CMS & Content', slug: 'cms-content', icon: '📝', order: 12, description: 'Pages, banners, and announcements' },
    { name: 'Reports & Analytics', slug: 'reports-analytics', icon: '📈', order: 13, description: 'System-wide reports and data export' },
    { name: 'Settings', slug: 'settings', icon: '⚙️', order: 14, description: 'System configuration and settings' },
    { name: 'AI Assistant', slug: 'ai-assistant', icon: '🤖', order: 15, description: 'AI chatbot and assistant features' },
  ];

  await PermissionGroup.deleteMany({}).setOptions({ includeDeleted: true });
  const groupMap = {};
  for (const g of permissionGroups) {
    const group = await PermissionGroup.create(g);
    groupMap[g.slug] = group._id;
  }

  const modules = [
    { module: 'dashboard', group: 'dashboard', actions: ['read'], label: 'Dashboard' },
    { module: 'users', group: 'user-management', actions: ['create', 'read', 'update', 'delete', 'export', 'import'], label: 'Users' },
    { module: 'roles', group: 'role-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Roles' },
    { module: 'students', group: 'student-management', actions: ['create', 'read', 'update', 'delete', 'export', 'import'], label: 'Students' },
    { module: 'parents', group: 'student-management', actions: ['create', 'read', 'update', 'delete'], label: 'Parents' },
    { module: 'faculty', group: 'faculty-management', actions: ['create', 'read', 'update', 'delete', 'export'], label: 'Faculty' },
    { module: 'attendance', group: 'academic-operations', actions: ['create', 'read', 'update', 'delete', 'export'], label: 'Attendance' },
    { module: 'fees', group: 'financial-operations', actions: ['create', 'read', 'update', 'delete', 'export', 'approve'], label: 'Fees' },
    { module: 'library', group: 'library-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Library' },
    { module: 'hostel', group: 'hostel-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Hostel' },
    { module: 'transport', group: 'transport-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Transport' },
    { module: 'placement', group: 'placement-management', actions: ['create', 'read', 'update', 'delete', 'manage'], label: 'Placement' },
    { module: 'cms', group: 'cms-content', actions: ['create', 'read', 'update', 'delete'], label: 'CMS' },
    { module: 'reports', group: 'reports-analytics', actions: ['read', 'export'], label: 'Reports' },
    { module: 'settings', group: 'settings', actions: ['read', 'update', 'manage'], label: 'Settings' },
    { module: 'ai-assistant', group: 'ai-assistant', actions: ['read', 'create'], label: 'AI Assistant' },
  ];

  const actionLabels = {
    create: 'Create', read: 'View', update: 'Edit',
    delete: 'Delete', export: 'Export', import: 'Import',
    manage: 'Manage', approve: 'Approve',
  };

  await Permission.deleteMany({}).setOptions({ includeDeleted: true });
  const permMap = {};
  for (const mod of modules) {
    for (const action of mod.actions) {
      const perm = await Permission.create({
        name: `${actionLabels[action]} ${mod.label}`,
        slug: `${mod.module}:${action}`,
        module: mod.module,
        action,
        group: groupMap[mod.group] || null,
        description: `${actionLabels[action]} ${mod.label.toLowerCase()} records`,
        isSystem: true,
      });
      permMap[perm.slug] = perm._id;
    }
  }

  const roles = [
    { name: 'Super Admin', slug: 'super-admin', level: 0, color: '#EF4444', description: 'Full system access', isSystem: true },
    { name: 'Admin', slug: 'admin', level: 10, color: '#F59E0B', description: 'Administrative access', isSystem: true },
    { name: 'Faculty', slug: 'faculty', level: 30, color: '#3B82F6', description: 'Academic operations', isSystem: true },
    { name: 'Librarian', slug: 'librarian', level: 40, color: '#8B5CF6', description: 'Library catalog management', isSystem: true },
    { name: 'Placement Officer', slug: 'placement-officer', level: 40, color: '#06B6D4', description: 'Placement drives management', isSystem: true },
    { name: 'Hostel Warden', slug: 'hostel-warden', level: 40, color: '#10B981', description: 'Hostel rooms management', isSystem: true },
    { name: 'Transport Manager', slug: 'transport-manager', level: 40, color: '#F97316', description: 'Transport operations', isSystem: true },
    { name: 'Student', slug: 'student', level: 80, color: '#6366F1', description: 'Student portal', isSystem: true, isDefault: true },
    { name: 'Parent', slug: 'parent', level: 85, color: '#EC4899', description: 'Parent portal', isSystem: true },
  ];

  await Role.deleteMany({}).setOptions({ includeDeleted: true });
  const roleMap = {};
  for (const r of roles) {
    const role = await Role.create(r);
    roleMap[r.slug] = role._id;
  }

  const rolePermissionMatrix = {
    'super-admin': '*',
    'admin': [
      'dashboard:read', 'users:create', 'users:read', 'users:update', 'users:delete', 'users:export',
      'roles:read', 'students:create', 'students:read', 'students:update', 'students:delete', 'students:export', 'students:import',
      'parents:create', 'parents:read', 'parents:update', 'parents:delete', 'faculty:create', 'faculty:read', 'faculty:update', 'faculty:delete', 'faculty:export',
      'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete', 'attendance:export',
      'fees:create', 'fees:read', 'fees:update', 'fees:delete', 'fees:export', 'fees:approve',
      'library:create', 'library:read', 'library:update', 'library:delete', 'library:manage',
      'hostel:create', 'hostel:read', 'hostel:update', 'hostel:delete', 'hostel:manage',
      'transport:create', 'transport:read', 'transport:update', 'transport:delete', 'transport:manage',
      'placement:create', 'placement:read', 'placement:update', 'placement:delete', 'placement:manage',
      'cms:create', 'cms:read', 'cms:update', 'cms:delete', 'reports:read', 'reports:export',
      'settings:read', 'settings:update', 'ai-assistant:read', 'ai-assistant:create',
    ],
    'faculty': [
      'dashboard:read', 'students:read', 'parents:read', 'faculty:read',
      'attendance:create', 'attendance:read', 'attendance:update', 'fees:read', 'library:read', 'placement:read', 'reports:read', 'ai-assistant:read', 'ai-assistant:create',
    ],
    'librarian': [
      'dashboard:read', 'students:read', 'library:create', 'library:read', 'library:update', 'library:delete', 'library:manage', 'reports:read',
    ],
    'placement-officer': [
      'dashboard:read', 'students:read', 'faculty:read', 'placement:create', 'placement:read', 'placement:update', 'placement:delete', 'placement:manage', 'reports:read', 'cms:create', 'cms:read',
    ],
    'hostel-warden': [
      'dashboard:read', 'students:read', 'hostel:create', 'hostel:read', 'hostel:update', 'hostel:delete', 'hostel:manage', 'reports:read',
    ],
    'transport-manager': [
      'dashboard:read', 'students:read', 'transport:create', 'transport:read', 'transport:update', 'transport:delete', 'transport:manage', 'reports:read',
    ],
    'student': [
      'dashboard:read', 'attendance:read', 'fees:read', 'library:read', 'placement:read', 'hostel:read', 'transport:read', 'cms:read', 'ai-assistant:read', 'ai-assistant:create',
    ],
    'parent': [
      'dashboard:read', 'attendance:read', 'fees:read', 'students:read', 'cms:read',
    ],
  };

  await RolePermission.deleteMany({}).setOptions({ includeDeleted: true });
  for (const [roleSlug, permSlugs] of Object.entries(rolePermissionMatrix)) {
    const roleId = roleMap[roleSlug];
    if (!roleId) continue;
    const slugs = permSlugs === '*' ? Object.keys(permMap) : permSlugs;
    for (const slug of slugs) {
      const permId = permMap[slug];
      if (!permId) continue;
      await RolePermission.create({ role: roleId, permission: permId });
    }
  }

  await UserRole.deleteMany({}).setOptions({ includeDeleted: true });
  const users = await User.find({}).lean();
  for (const user of users) {
    const roleId = roleMap[user.role];
    if (roleId) {
      await UserRole.create({ user: user._id, role: roleId, isPrimary: true });
    }
  }

  console.log(`   ✅ RBAC System permissions, groups, roles, and mappings seeded successfully`);
}

// ═══════════════════════════════════════════════════════════
// MAIN SEED ORCHESTRATOR
// ═══════════════════════════════════════════════════════════

async function seed() {
  const startTime = Date.now();

  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  College Management System — Database Seeder');
    console.log('═══════════════════════════════════════════════════');
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.\n');

    // Seed in dependency order
    const users = await seedUsers();
    const departments = await seedDepartments();
    const academicYear = await seedAcademicYear();
    await seedSubjects(departments);
    const student = await seedStudent(users, departments, academicYear);
    await seedFaculty(users, departments);
    await seedParent(users, student);
    await seedFees(student, academicYear);
    const categories = await seedBookCategories();
    await seedBooks(categories);
    await seedHostel(users);
    await seedTransport();
    await seedPlacement(departments);
    await seedCMS(users);
    await seedPermissions();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Seeding completed successfully in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
    console.log('\n🔑 Login credentials (all passwords: password123):');
    console.log('   superadmin@college.com | admin@college.com');
    console.log('   faculty@college.com    | student@college.com');
    console.log('   parent@college.com     | librarian@college.com');
    console.log('   placement@college.com  | warden@college.com');
    console.log('   transport@college.com');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected.');
  }
}

seed();
