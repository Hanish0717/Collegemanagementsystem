import bcrypt from 'bcryptjs';

const generateDemoUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const demoUsers = [
    { name: 'Super Admin', fullName: 'Super Admin', email: 'superadmin@college.com', password: hashedPassword, role: 'super-admin', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Admin', fullName: 'Admin', email: 'admin@college.com', password: hashedPassword, role: 'admin', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Faculty', fullName: 'Faculty', email: 'faculty@college.com', password: hashedPassword, role: 'faculty', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Student', fullName: 'Student', email: 'student@college.com', password: hashedPassword, role: 'student', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Parent', fullName: 'Parent', email: 'parent@college.com', password: hashedPassword, role: 'parent', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Librarian', fullName: 'Librarian', email: 'librarian@college.com', password: hashedPassword, role: 'librarian', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Placement Officer', fullName: 'Placement Officer', email: 'placement@college.com', password: hashedPassword, role: 'placement-officer', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Hostel Warden', fullName: 'Hostel Warden', email: 'warden@college.com', password: hashedPassword, role: 'hostel-warden', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true },
    { name: 'Transport Manager', fullName: 'Transport Manager', email: 'transport@college.com', password: hashedPassword, role: 'transport-manager', mobile: '0000000000', phoneNumber: '0000000000', isVerified: true, mobileVerified: true, isActive: true }
  ];

  console.log(JSON.stringify(demoUsers, null, 2));
};

generateDemoUsers();
