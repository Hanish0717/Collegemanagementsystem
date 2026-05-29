/**
 * Audit & Activity Logging Seeder
 * Usage: npm run seed:audit
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import AuditLog from '../models/audit/AuditLog.js';
import ActivityLog from '../models/audit/ActivityLog.js';
import User from '../models/auth/User.js';

dotenv.config();

async function seedAudit() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Audit & Activity Logging Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const users = await User.find({}).lean();
    if (users.length === 0) {
      console.log('⚠️ No users found. Run core seeder first.');
      return;
    }

    const admin = users.find((u) => u.role === 'super-admin') || users[0];
    const student = users.find((u) => u.role === 'student') || users[0];

    // ── Audit Logs ──────────────────────────────────
    console.log('📌 Seeding Audit Logs...');
    await AuditLog.deleteMany({}).setOptions({ includeDeleted: true });

    await AuditLog.create({
      user: admin._id, action: 'CREATE', collectionName: 'Student',
      documentId: student._id,
      postImage: { fullName: student.fullName, rollNumber: 'CS2026001', department: 'CSE' },
      ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      status: 'success',
    });

    await AuditLog.create({
      user: admin._id, action: 'UPDATE', collectionName: 'HostelRoom',
      documentId: new mongoose.Types.ObjectId(),
      preImage: { roomNumber: 'A-101', occupancy: 1, status: 'available' },
      postImage: { roomNumber: 'A-101', occupancy: 2, status: 'occupied' },
      ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      status: 'success',
    });

    await AuditLog.create({
      user: student._id, action: 'AUTH_LOGIN', collectionName: 'User',
      documentId: student._id,
      ipAddress: '192.168.1.105', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15',
      status: 'success',
    });

    console.log('   ✅ Seeded 3 audit logs');

    // ── Activity Logs ───────────────────────────────
    console.log('\n📌 Seeding Activity Logs...');
    await ActivityLog.deleteMany({}).setOptions({ includeDeleted: true });

    const paths = [
      { action: 'VIEW_DASHBOARD', route: '/api/v1/dashboard/student', method: 'GET', status: 200, duration: 120 },
      { action: 'SEARCH_BOOKS', route: '/api/v1/library/books?q=algorithms', method: 'GET', status: 200, duration: 320 },
      { action: 'DOWNLOAD_PASS', route: '/api/v1/transport/allocation/pass', method: 'GET', status: 200, duration: 180 },
      { action: 'UPDATE_PROFILE', route: '/api/v1/users/profile', method: 'PUT', status: 200, duration: 250 },
      { action: 'UNAUTHORIZED_ACCESS', route: '/api/v1/admin/settings', method: 'GET', status: 403, duration: 15 },
    ];

    for (const p of paths) {
      await ActivityLog.create({
        user: student._id, action: p.action, route: p.route, method: p.method,
        durationMs: p.duration, status: p.status, payloadSize: p.method === 'GET' ? 0 : 512,
        ipAddress: '192.168.1.105', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15',
      });
    }

    console.log('   ✅ Seeded 5 activity logs');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Logging & Audit seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedAudit();
