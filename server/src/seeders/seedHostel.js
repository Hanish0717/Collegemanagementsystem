/**
 * Hostel Management Seeder
 * Usage: npm run seed:hostel
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Hostel from '../models/hostel/Hostel.js';
import HostelBlock from '../models/hostel/HostelBlock.js';
import HostelRoom from '../models/hostel/HostelRoom.js';
import HostelAllocation from '../models/hostel/HostelAllocation.js';
import HostelFee from '../models/hostel/HostelFee.js';
import HostelComplaint from '../models/hostel/HostelComplaint.js';
import HostelVisitor from '../models/hostel/HostelVisitor.js';
import Student from '../models/student/Student.js';
import AcademicYear from '../models/academic/AcademicYear.js';
import User from '../models/auth/User.js';

dotenv.config();

const hostelsData = [
  { name: 'Vivekananda Boys Hostel', code: 'VBH', type: 'boys', totalRooms: 60, totalBeds: 120, monthlyFee: 5000, facilities: ['WiFi', 'Gym', 'Common Room', 'Mess', 'Laundry', 'Reading Room'], contact: '9876500100' },
  { name: 'Sarojini Girls Hostel', code: 'SGH', type: 'girls', totalRooms: 40, totalBeds: 80, monthlyFee: 5500, facilities: ['WiFi', 'Gym', 'Common Room', 'Mess', 'Laundry', 'CCTV'], contact: '9876500101' },
  { name: 'APJ Kalam Hostel', code: 'AKH', type: 'boys', totalRooms: 50, totalBeds: 100, monthlyFee: 4500, facilities: ['WiFi', 'Common Room', 'Mess', 'Sports Ground'], contact: '9876500102' },
];

const blocksPerHostel = [
  { name: 'Block A', code: 'A', floors: 3, rooms: 20, beds: 40, facilities: ['WiFi', 'Water Cooler'] },
  { name: 'Block B', code: 'B', floors: 3, rooms: 20, beds: 40, facilities: ['WiFi', 'Water Cooler'] },
  { name: 'Block C', code: 'C', floors: 2, rooms: 10, beds: 20, facilities: ['WiFi'] },
];

async function seedHostel() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Hostel Management Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const academicYear = await AcademicYear.findOne({ isCurrent: true });
    const wardenUser = await User.findOne({ role: 'hostel-warden' });
    const students = await Student.find({}).lean();

    // ── Hostels ─────────────────────────────────────
    console.log('📌 Seeding Hostels...');
    await Hostel.deleteMany({}).setOptions({ includeDeleted: true });
    const hostelDocs = [];
    for (const h of hostelsData) {
      const hostel = await Hostel.create({
        name: h.name, code: h.code, type: h.type,
        warden: wardenUser?._id, totalRooms: h.totalRooms, totalBeds: h.totalBeds,
        monthlyFee: h.monthlyFee, facilities: h.facilities, contactNumber: h.contact,
      });
      hostelDocs.push(hostel);
      console.log(`   ✅ ${h.name} (${h.code})`);
    }

    // ── Blocks ──────────────────────────────────────
    console.log('\n📌 Seeding Hostel Blocks...');
    await HostelBlock.deleteMany({}).setOptions({ includeDeleted: true });
    let blockCount = 0;
    const blockDocs = [];
    for (const hostel of hostelDocs) {
      for (const b of blocksPerHostel) {
        const block = await HostelBlock.create({
          hostel: hostel._id, name: b.name, code: `${hostel.code}-${b.code}`,
          totalFloors: b.floors, totalRooms: b.rooms, totalBeds: b.beds,
          facilities: b.facilities, blockWarden: wardenUser?._id,
        });
        blockDocs.push(block);
        blockCount++;
      }
    }
    console.log(`   ✅ ${blockCount} blocks`);

    // ── Rooms ───────────────────────────────────────
    console.log('\n📌 Seeding Hostel Rooms...');
    await HostelRoom.deleteMany({}).setOptions({ includeDeleted: true });
    let roomCount = 0;
    const roomDocs = [];
    for (const hostel of hostelDocs) {
      for (let floor = 1; floor <= 3; floor++) {
        for (let r = 1; r <= 5; r++) {
          const roomNum = `${floor}0${r}`;
          const types = ['single', 'double', 'double', 'triple'];
          const type = types[Math.floor(Math.random() * types.length)];
          const cap = type === 'single' ? 1 : type === 'double' ? 2 : 3;
          const room = await HostelRoom.create({
            hostel: hostel._id, roomNumber: roomNum, floor,
            type, capacity: cap, amenities: ['Bed', 'Table', 'Chair', 'Fan', 'Light'],
          });
          roomDocs.push(room);
          roomCount++;
        }
      }
    }
    console.log(`   ✅ ${roomCount} rooms`);

    // ── Allocations ─────────────────────────────────
    console.log('\n📌 Seeding Room Allocations...');
    await HostelAllocation.deleteMany({}).setOptions({ includeDeleted: true });
    let allocCount = 0;
    for (let i = 0; i < students.length && i < roomDocs.length; i++) {
      const room = roomDocs[i];
      await HostelAllocation.create({
        student: students[i]._id, hostel: room.hostel, room: room._id,
        academicYear: academicYear._id, bedNumber: 'B1', status: 'active',
      });
      await HostelRoom.findByIdAndUpdate(room._id, { $inc: { occupants: 1 } });
      allocCount++;
    }
    console.log(`   ✅ ${allocCount} allocations`);

    // ── Hostel Fees ─────────────────────────────────
    console.log('\n📌 Seeding Hostel Fees...');
    await HostelFee.deleteMany({}).setOptions({ includeDeleted: true });
    let feeCount = 0;
    for (let i = 0; i < students.length && i < roomDocs.length; i++) {
      const hostel = hostelDocs[0];
      for (let m = 1; m <= 3; m++) {
        await HostelFee.create({
          student: students[i]._id, hostel: hostel._id,
          academicYear: academicYear._id,
          feeType: 'room-rent', month: m, year: 2026,
          totalAmount: hostel.monthlyFee, paidAmount: m <= 2 ? hostel.monthlyFee : 0,
          dueDate: new Date(2026, m - 1, 10),
          paymentMethod: m <= 2 ? 'bank-transfer' : undefined,
          receiptNumber: m <= 2 ? `HF-${students[i].rollNumber}-2026-${String(m).padStart(2, '0')}` : undefined,
        });
        feeCount++;
      }
      // Mess fee
      await HostelFee.create({
        student: students[i]._id, hostel: hostel._id,
        academicYear: academicYear._id,
        feeType: 'mess', month: 1, year: 2026,
        totalAmount: 3500, paidAmount: 3500,
        dueDate: new Date(2026, 0, 10), paymentMethod: 'upi',
        receiptNumber: `HF-MESS-${students[i].rollNumber}-2026-01`,
      });
      feeCount++;
    }
    console.log(`   ✅ ${feeCount} fee records`);

    // ── Complaints ──────────────────────────────────
    console.log('\n📌 Seeding Hostel Complaints...');
    await HostelComplaint.deleteMany({}).setOptions({ includeDeleted: true });
    const complaints = [
      { cat: 'plumbing', title: 'Water leakage in bathroom', desc: 'Continuous water dripping from the shower pipe. Floor is always wet.', priority: 'high', status: 'in-progress' },
      { cat: 'electrical', title: 'Fan not working', desc: 'Ceiling fan in room stopped working since yesterday.', priority: 'medium', status: 'resolved' },
      { cat: 'internet', title: 'WiFi connectivity issues', desc: 'WiFi signal very weak in Block B, 2nd floor.', priority: 'medium', status: 'submitted' },
      { cat: 'food-quality', title: 'Mess food quality complaint', desc: 'Food served is cold and stale for the past 3 days.', priority: 'high', status: 'acknowledged' },
      { cat: 'pest-control', title: 'Cockroach infestation', desc: 'Multiple cockroaches spotted in the bathroom area.', priority: 'urgent', status: 'submitted' },
      { cat: 'cleaning', title: 'Common area not cleaned', desc: 'The common room and corridor have not been cleaned for a week.', priority: 'low', status: 'closed' },
    ];
    let compCount = 0;
    for (let i = 0; i < complaints.length && i < students.length; i++) {
      const c = complaints[i];
      await HostelComplaint.create({
        student: students[i]._id, hostel: hostelDocs[0]._id,
        room: roomDocs[i]?._id, title: c.title, description: c.desc,
        category: c.cat, priority: c.priority, status: c.status,
        assignedTo: wardenUser?._id,
        resolvedAt: c.status === 'resolved' ? new Date() : undefined,
        resolution: c.status === 'resolved' ? 'Issue fixed by maintenance team.' : undefined,
      });
      compCount++;
    }
    console.log(`   ✅ ${compCount} complaints`);

    // ── Visitors ────────────────────────────────────
    console.log('\n📌 Seeding Hostel Visitors...');
    await HostelVisitor.deleteMany({}).setOptions({ includeDeleted: true });
    const visitors = [
      { name: 'Ramesh Kumar', phone: '9876500030', rel: 'parent', purpose: 'Monthly visit to check on ward', id: 'aadhaar', idNum: '1234-5678-9012' },
      { name: 'Sunita Sharma', phone: '9876500031', rel: 'parent', purpose: 'Dropping off supplies and clothes', id: 'aadhaar', idNum: '2345-6789-0123' },
      { name: 'Vikram Singh', phone: '9876500040', rel: 'friend', purpose: 'Weekend visit', id: 'driving-license', idNum: 'DL-123456' },
      { name: 'Priya Patel', phone: '9876500041', rel: 'sibling', purpose: 'Birthday celebration', id: 'voter-id', idNum: 'VOTER789' },
    ];
    let visCount = 0;
    for (let i = 0; i < visitors.length && i < students.length; i++) {
      const v = visitors[i];
      const checkIn = new Date(); checkIn.setDate(checkIn.getDate() - Math.floor(Math.random() * 7));
      checkIn.setHours(10 + Math.floor(Math.random() * 4), 0, 0);
      const checkOut = new Date(checkIn); checkOut.setHours(checkIn.getHours() + 3);
      await HostelVisitor.create({
        hostel: hostelDocs[0]._id, student: students[i]._id, room: roomDocs[i]?._id,
        visitorName: v.name, visitorPhone: v.phone, relationship: v.rel,
        purpose: v.purpose, idType: v.id, idNumber: v.idNum,
        checkInTime: checkIn, checkOutTime: i < 3 ? checkOut : undefined,
        approvedBy: wardenUser?._id,
        status: i < 3 ? 'checked-out' : 'checked-in',
      });
      visCount++;
    }
    console.log(`   ✅ ${visCount} visitor logs`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Hostel module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedHostel();
