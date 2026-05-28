import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer = null;

const seedFallbackData = async () => {
  try {
    // Dynamically import to avoid circular deps
    const { default: User } = await import("../models/User.js");
    const { default: bcrypt } = await import("bcryptjs");

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

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({
          name: u.name, fullName: u.name, email: u.email,
          password: "password123", role: u.role,
          mobile: "0000000000", phoneNumber: "0000000000",
          isVerified: true, mobileVerified: true, isActive: true,
        });
        console.log(`✅ Seeded: ${u.email}`);
      }
    }
    console.log("✅ Fallback DB seeding complete. All demo accounts ready.");
  } catch (err) {
    console.error("⚠️  Seeding error:", err.message);
  }
};

const connectAtlas = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 30000,
    family: 4,
    maxPoolSize: 10,
  });
};

const connectFallback = async () => {
  console.log("⚡ Starting local in-memory MongoDB (no internet required)...");
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  console.log("✅ Local MongoDB started at:", uri);
  await seedFallbackData();
};

const connectDB = async () => {
  try {
    await connectAtlas();
    console.log(`✅ MongoDB Atlas Connected: ${mongoose.connection.host}`);
    console.log(`✅ Database: ${mongoose.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  Atlas disconnected. Reconnecting in 3s...");
      setTimeout(connectDB, 3000);
    });
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });
  } catch (atlasErr) {
    console.warn(`⚠️  Atlas unavailable: ${atlasErr.message}`);
    console.log("🔄 Falling back to local in-memory MongoDB...");
    try {
      await connectFallback();
    } catch (fallbackErr) {
      console.error("❌ Local MongoDB also failed:", fallbackErr.message);
      console.log("🔄 Retrying in 5 seconds...");
      setTimeout(connectDB, 5000);
    }
  }
};

export default connectDB;
