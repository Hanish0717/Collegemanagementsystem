/**
 * Quick verification script to check all seeded data.
 * Usage: node src/seeders/verify.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  Database Verification Report');
    console.log('═══════════════════════════════════════════════════\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log(`📦 Total Collections: ${collections.length}\n`);

    for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
      const count = await db.collection(col.name).countDocuments();
      const icon = count > 0 ? '✅' : '⚠️';
      console.log(`  ${icon} ${col.name.padEnd(30)} → ${count} document(s)`);
    }

    // Show sample data
    console.log('\n───────────────────────────────────────────────────');
    console.log('  Sample Data Preview');
    console.log('───────────────────────────────────────────────────\n');

    // Users
    const users = await db.collection('users').find({}, { projection: { fullName: 1, email: 1, role: 1 } }).toArray();
    console.log('👤 Users:');
    users.forEach(u => console.log(`   ${u.role.padEnd(20)} → ${u.email}`));

    // Departments
    const depts = await db.collection('departments').find({}, { projection: { name: 1, code: 1 } }).toArray();
    console.log('\n🏛️  Departments:');
    depts.forEach(d => console.log(`   ${d.code.padEnd(10)} → ${d.name}`));

    // Subjects
    const subjects = await db.collection('subjects').find({}, { projection: { name: 1, code: 1, semester: 1 } }).toArray();
    console.log('\n📚 Subjects:');
    subjects.forEach(s => console.log(`   ${s.code.padEnd(10)} → ${s.name} (Sem ${s.semester})`));

    // Students
    const students = await db.collection('students').find({}, { projection: { fullName: 1, rollNumber: 1, departmentName: 1 } }).toArray();
    console.log('\n🎓 Students:');
    students.forEach(s => console.log(`   ${s.rollNumber.padEnd(12)} → ${s.fullName} (${s.departmentName})`));

    // Faculty
    const faculty = await db.collection('faculties').find({}, { projection: { fullName: 1, employeeId: 1, designation: 1 } }).toArray();
    console.log('\n👨‍🏫 Faculty:');
    faculty.forEach(f => console.log(`   ${f.employeeId.padEnd(12)} → ${f.fullName} (${f.designation})`));

    // Books
    const books = await db.collection('books').find({}, { projection: { title: 1, author: 1 } }).toArray();
    console.log('\n📖 Books:');
    books.forEach(b => console.log(`   ${b.title} — ${b.author}`));

    // Fees
    const fees = await db.collection('fees').find({}, { projection: { feeType: 1, totalAmount: 1, paymentStatus: 1 } }).toArray();
    console.log('\n💰 Fees:');
    fees.forEach(f => console.log(`   ${f.feeType.padEnd(15)} → ₹${f.totalAmount} (${f.paymentStatus})`));

    // Hostels
    const hostels = await db.collection('hostels').find({}, { projection: { name: 1, totalBeds: 1, occupiedBeds: 1 } }).toArray();
    console.log('\n🏠 Hostels:');
    hostels.forEach(h => console.log(`   ${h.name} — ${h.occupiedBeds}/${h.totalBeds} beds`));

    // Transport
    const routes = await db.collection('transportroutes').find({}, { projection: { name: 1, routeNumber: 1 } }).toArray();
    console.log('\n🚌 Transport Routes:');
    routes.forEach(r => console.log(`   ${r.routeNumber} → ${r.name}`));

    // Placement
    const drives = await db.collection('placementdrives').find({}, { projection: { companyName: 1, jobTitle: 1, status: 1 } }).toArray();
    console.log('\n💼 Placement Drives:');
    drives.forEach(d => console.log(`   ${d.companyName} — ${d.jobTitle} (${d.status})`));

    // Permissions
    const permCount = await db.collection('permissions').countDocuments();
    console.log(`\n🔐 RBAC Permissions: ${permCount} rules configured`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ✅ Verification Complete!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
