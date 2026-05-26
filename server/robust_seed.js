import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const demoUsers = [];

const seedDatabase = async () => {
  let connected = false;
  while (!connected) {
    try {
      console.log("Connecting to MongoDB (Retrying if failed)...");
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        family: 4
      });
      connected = true;
      console.log("Connected successfully!");
    } catch (e) {
      console.log("Network timeout, retrying in 2 seconds...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  try {
    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({
          name: u.name, fullName: u.name, email: u.email, password: 'password123',
          role: u.role, mobile: '0000000000', phoneNumber: '0000000000',
          isVerified: true, mobileVerified: true, isActive: true
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
