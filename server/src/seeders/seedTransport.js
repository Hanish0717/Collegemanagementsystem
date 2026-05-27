/**
 * Transport Management Seeder
 * Usage: npm run seed:transport
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Bus from '../models/transport/Bus.js';
import Driver from '../models/transport/Driver.js';
import Stop from '../models/transport/Stop.js';
import Route from '../models/transport/Route.js';
import TransportAllocation from '../models/transport/TransportAllocation.js';
import VehicleMaintenance from '../models/transport/VehicleMaintenance.js';
import TransportFee from '../models/transport/TransportFee.js';
import Student from '../models/student/Student.js';
import AcademicYear from '../models/academic/AcademicYear.js';
import User from '../models/auth/User.js';

dotenv.config();

const stopsData = [
  { name: 'Kukatpally Y Junction', monthlyFare: 1500, landmark: 'Near Metro Station Pillar 12', lat: 17.4844, lng: 78.4011 },
  { name: 'Gachibowli DLF Phase 2', monthlyFare: 2000, landmark: 'Opposite DLF Cyber City Gate 3', lat: 17.4484, lng: 78.3741 },
  { name: 'Secunderabad East', monthlyFare: 1800, landmark: 'Near Railway Station Exit 1', lat: 17.4344, lng: 78.5011 },
  { name: 'Dilsukhnagar Bus Depot', monthlyFare: 1600, landmark: 'Near Hanuman Temple', lat: 17.3684, lng: 78.5282 },
  { name: 'Ameerpet X Roads', monthlyFare: 1400, landmark: 'Opposite Metro Station Exit B', lat: 17.4374, lng: 78.4482 },
  { name: 'LB Nagar Ring Road', monthlyFare: 2200, landmark: 'Near LB Nagar Circle', lat: 17.3460, lng: 78.5520 },
];

const busesData = [
  { busNumber: 'TS-09-UB-1001', type: 'bus', make: 'Tata', model: 'Starbus 50', year: 2021, capacity: 50, fuelType: 'cng', status: 'active', gps: 'GPS-1001' },
  { busNumber: 'TS-09-UB-1002', type: 'bus', make: 'Leyland', model: 'Viking 60', year: 2022, capacity: 60, fuelType: 'diesel', status: 'active', gps: 'GPS-1002' },
  { busNumber: 'TS-09-UB-1003', type: 'mini-bus', make: 'Force', model: 'Traveller 30', year: 2020, capacity: 30, fuelType: 'diesel', status: 'maintenance', gps: 'GPS-1003' },
  { busNumber: 'TS-09-UB-1004', type: 'bus', make: 'Eicher', model: 'Skyline 40', year: 2023, capacity: 40, fuelType: 'electric', status: 'active', gps: 'GPS-1004' },
];

const driversData = [
  { fullName: 'Satish Kumar', phone: '9848011221', licenseNumber: 'AP09-2015-0012', licenseExpiry: new Date(2028, 5, 20), experience: 10 },
  { fullName: 'Mohammad Rafiq', phone: '9848011222', licenseNumber: 'AP09-2012-0943', licenseExpiry: new Date(2029, 8, 15), experience: 14 },
  { fullName: 'Baldev Singh', phone: '9848011223', licenseNumber: 'AP09-2018-0231', licenseExpiry: new Date(2027, 2, 10), experience: 8 },
  { fullName: 'Ramesh Chander', phone: '9848011224', licenseNumber: 'AP09-2019-0552', licenseExpiry: new Date(2030, 11, 25), experience: 6 },
];

async function seedTransport() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Transport Management Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const academicYear = await AcademicYear.findOne({ isCurrent: true });
    const students = await Student.find({}).lean();
    const adminUser = await User.findOne({ role: 'super-admin' }) || await User.findOne({});

    // ── Stops ───────────────────────────────────────
    console.log('📌 Seeding Stops...');
    await Stop.deleteMany({}).setOptions({ includeDeleted: true });
    const stopDocs = [];
    for (const s of stopsData) {
      const stop = await Stop.create({
        name: s.name, monthlyFare: s.monthlyFare, landmark: s.landmark,
        latitude: s.lat, longitude: s.lng,
      });
      stopDocs.push(stop);
      console.log(`   ✅ ${s.name} (Fare: ₹${s.monthlyFare})`);
    }

    // ── Buses ───────────────────────────────────────
    console.log('\n📌 Seeding Buses...');
    await Bus.deleteMany({}).setOptions({ includeDeleted: true });
    const busDocs = [];
    const today = new Date();
    for (const b of busesData) {
      const bus = await Bus.create({
        busNumber: b.busNumber, type: b.type, make: b.make, model: b.model, year: b.year,
        capacity: b.capacity, fuelType: b.fuelType, status: b.status, gpsDeviceNumber: b.gps,
        insuranceExpiry: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
        fitnessExpiry: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()),
        pollutionExpiry: new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()),
      });
      busDocs.push(bus);
      console.log(`   ✅ Bus: ${b.busNumber} (${b.make} - ${b.capacity} seats)`);
    }

    // ── Drivers ─────────────────────────────────────
    console.log('\n📌 Seeding Drivers...');
    await Driver.deleteMany({}).setOptions({ includeDeleted: true });
    const driverDocs = [];
    for (let i = 0; i < driversData.length; i++) {
      const d = driversData[i];
      const driver = await Driver.create({
        fullName: d.fullName, phone: d.phone, licenseNumber: d.licenseNumber,
        licenseExpiry: d.licenseExpiry, experienceYears: d.experience,
        assignedBus: busDocs[i]?._id, status: 'active',
      });
      driverDocs.push(driver);
      console.log(`   ✅ Driver: ${d.fullName} (Exp: ${d.experience} yrs)`);
    }

    // ── Routes ──────────────────────────────────────
    console.log('\n📌 Seeding Routes...');
    await Route.deleteMany({}).setOptions({ includeDeleted: true });
    const routeDocs = [];
    const routesDetails = [
      { name: 'Kukatpally Route 1', code: 'R-KPT1', start: 'Kukatpally Y Junction', end: 'College Campus', distance: 18, time: '40 mins', stopsIndices: [0, 4] },
      { name: 'Gachibowli Route 2', code: 'R-GBL2', start: 'Gachibowli DLF Phase 2', end: 'College Campus', distance: 22, time: '50 mins', stopsIndices: [1, 5] },
      { name: 'Secunderabad Route 3', code: 'R-SEC3', start: 'Secunderabad East', end: 'College Campus', distance: 25, time: '60 mins', stopsIndices: [2, 3] },
    ];

    for (let i = 0; i < routesDetails.length; i++) {
      const rd = routesDetails[i];
      const rStops = rd.stopsIndices.map((idx, index) => ({
        stop: stopDocs[idx]._id,
        arrivalTime: `08:${String(10 + index * 15).padStart(2, '0')}`,
        order: index + 1,
      }));

      const route = await Route.create({
        name: rd.name, routeNumber: rd.code, startPoint: rd.start, endPoint: rd.end,
        distance: rd.distance, estimatedTime: rd.time, stops: rStops,
        bus: busDocs[i]?._id, driver: driverDocs[i]?._id, status: 'active',
      });
      routeDocs.push(route);
      console.log(`   ✅ Route: ${rd.name} (${rd.code})`);
    }

    // ── Transport Allocations ────────────────────────
    console.log('\n📌 Seeding Transport Allocations...');
    await TransportAllocation.deleteMany({}).setOptions({ includeDeleted: true });
    const allocDocs = [];
    let allocatedCount = 0;

    for (let i = 0; i < students.length && i < routeDocs.length; i++) {
      const student = students[i];
      const route = routeDocs[i];
      const primaryStop = stopDocs.find(s => s._id.toString() === route.stops[0].stop.toString());

      const allocation = await TransportAllocation.create({
        student: student._id, route: route._id,
        pickupStop: primaryStop._id, dropStop: primaryStop._id,
        academicYear: academicYear._id, monthlyFare: primaryStop.monthlyFare,
        passNumber: `PASS-${student.rollNumber}`, status: 'active',
      });
      allocDocs.push(allocation);
      allocatedCount++;
      console.log(`   ✅ Pass ${allocation.passNumber} -> ${student.fullName} (Route: ${route.routeNumber})`);
    }
    console.log(`   ✅ Allocated ${allocatedCount} students`);

    // ── Maintenance Logs ────────────────────────────
    console.log('\n📌 Seeding Vehicle Maintenance logs...');
    await VehicleMaintenance.deleteMany({}).setOptions({ includeDeleted: true });
    const maintenanceTasks = [
      { busIndex: 0, type: 'routine-service', desc: 'Engine oil replacement, oil filter replacement, and general checking.', cost: 4500, odo: 12500, status: 'completed' },
      { busIndex: 1, type: 'tire-replacement', desc: 'Replacement of rear left side twin tires due to wear & tear.', cost: 18000, odo: 28400, status: 'completed' },
      { busIndex: 2, type: 'repair', desc: 'AC cooling unit repairing and gas recharging.', cost: 8500, odo: 15300, status: 'in-progress' },
    ];
    let maintCount = 0;
    for (const m of maintenanceTasks) {
      await VehicleMaintenance.create({
        bus: busDocs[m.busIndex]._id, maintenanceType: m.type, description: m.desc,
        cost: m.cost, odometerReading: m.odo, status: m.status,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
        endDate: m.status === 'completed' ? new Date() : undefined,
        mechanicDetails: { name: 'Venkatesh Motor Works', contact: '9988776655', workshopName: 'Gachibowli Automotives' },
        recordedBy: adminUser?._id,
      });
      maintCount++;
    }
    console.log(`   ✅ Created ${maintCount} maintenance records`);

    // ── Transport Fees ──────────────────────────────
    console.log('\n📌 Seeding Transport Fees...');
    await TransportFee.deleteMany({}).setOptions({ includeDeleted: true });
    let feeCount = 0;

    for (const alloc of allocDocs) {
      const studentObj = students.find((s) => s._id.toString() === alloc.student.toString());
      for (let m = 1; m <= 3; m++) {
        await TransportFee.create({
          student: alloc.student, allocation: alloc._id, route: alloc.route,
          academicYear: academicYear._id, month: m, year: 2026,
          totalAmount: alloc.monthlyFare, paidAmount: m <= 2 ? alloc.monthlyFare : 0,
          dueDate: new Date(2026, m - 1, 10),
          paymentMethod: m <= 2 ? 'upi' : undefined,
          receiptNumber: m <= 2 ? `TF-${studentObj.rollNumber}-2026-${String(m).padStart(2, '0')}` : undefined,
        });
        feeCount++;
      }
    }
    console.log(`   ✅ Seeded ${feeCount} transport fee records`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Transport module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedTransport();
