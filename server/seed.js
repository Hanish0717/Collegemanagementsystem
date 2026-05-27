import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const demoUsers = [
  { name: 'Super Admin', email: 'superadmin@college.com', role: 'super-admin' },
  { name: 'Admin', email: 'admin@college.com', role: 'admin' },
  { name: 'Faculty', email: 'faculty@college.com', role: 'faculty' },
  { name: 'Student', email: 'student@college.com', role: 'student' },
  { name: 'Parent', email: 'parent@college.com', role: 'parent' },
  { name: 'Librarian', email: 'librarian@college.com', role: 'librarian' },
  { name: 'Placement Officer', email: 'placement@college.com', role: 'placement-officer' },
  { name: 'Hostel Warden', email: 'warden@college.com', role: 'hostel-warden' },
  { name: 'Transport Manager', email: 'transport@college.com', role: 'transport-manager' }
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({
          name: u.name,
          fullName: u.name,
          email: u.email,
          password: 'password123',
          role: u.role,
          mobile: '0000000000',
          phoneNumber: '0000000000',
          isVerified: true,
          mobileVerified: true,
          isActive: true
        });
        console.log(`Created user: ${u.email}`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
