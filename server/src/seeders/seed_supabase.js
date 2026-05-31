import pkg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import crypto from 'crypto';

dotenv.config();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is missing in your .env file!");
  process.exit(1);
}

async function getClientConfig(connStr) {
  const regex = /^(postgresql|postgres):\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/;
  const match = connStr.match(regex);
  if (!match) throw new Error("Invalid connection string format");

  const [,, username, password, host, port, dbname] = match;
  let resolvedHost = host;

  if (!host.includes('[') && !/^[0-9.]+$/.test(host)) {
    try {
      const ips = await dns.promises.resolve6(host);
      if (ips && ips.length > 0) {
        resolvedHost = ips[0];
      }
    } catch (dnsErr) {
      console.warn(`⚠️ DNS IPv6 resolution failed for ${host}, using raw host:`, dnsErr.message);
    }
  }

  return {
    host: resolvedHost,
    port: port ? parseInt(port, 10) : 5432,
    user: username,
    password: decodeURIComponent(password),
    database: dbname,
    ssl: { rejectUnauthorized: false }
  };
}

// ----------------------------------------------------
// BATCH INSERT HELPER
// ----------------------------------------------------
async function batchInsert(client, table, columns, records) {
  if (!records || records.length === 0) return;
  
  // PostgreSQL parameter limit is 65535. We chunk records to stay safe.
  const maxParams = 50000;
  const chunkSize = Math.floor(maxParams / columns.length);
  
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const valueStrings = [];
    const values = [];
    let paramIdx = 1;
    
    for (const rec of chunk) {
      const placeholders = [];
      for (const col of columns) {
        placeholders.push(`$${paramIdx++}`);
        values.push(rec[col]);
      }
      valueStrings.push(`(${placeholders.join(', ')})`);
    }
    
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueStrings.join(', ')} ON CONFLICT DO NOTHING`;
    await client.query(query, values);
  }
}

// ----------------------------------------------------
// NAME GENERATORS (ANDHRA PRADESH / TELANGANA)
// ----------------------------------------------------
const SURNAMES = [
  'Kothapalli', 'Challa', 'Gudipati', 'Pasupuleti', 'Vadlamudi', 'Nallamothu',
  'Cherukuri', 'Duggirala', 'Alapati', 'Yerra', 'Boddu', 'Chava', 'Katta',
  'Yelamanchili', 'Gottipati', 'Kolli', 'Pendyala', 'Ravipati', 'Maddineni',
  'Gorantla', 'Galla', 'Kamineni', 'Yelamarthi', 'Thota', 'Kondapalli',
  'Koneru', 'Kanneganti', 'Jasti', 'Vemuri', 'Bandla', 'Meka', 'Devineni',
  'Paritala', 'Kambhampati', 'Vallabhaneni', 'Nandamuri', 'Adusumilli', 'Gummadi'
];

const BOY_FIRST_NAMES = [
  'Sai', 'Venkatesh', 'Rajesh', 'Ramesh', 'Suresh', 'Harish', 'Kalyan', 'Srinivas',
  'Ravi', 'Teja', 'Pawan', 'Rahul', 'Sandeep', 'Satish', 'Karthik', 'Nikhil',
  'Akhil', 'Aditya', 'Vivek', 'Surya', 'Chandra', 'Prasad', 'Mohan', 'Anand',
  'Charan', 'Krishna', 'Bhargav', 'Pranav', 'Ganesh', 'Varun', 'Tarun', 'Jaswanth',
  'Vamsi', 'Hari', 'Siva', 'Prathyush', 'Abhinay', 'Avinash', 'Kiran', 'Sravan'
];

const GIRL_FIRST_NAMES = [
  'Ananya', 'Harika', 'Sneha', 'Divya', 'Priyanka', 'Bhavana', 'Sireesha', 'Lakshmi',
  'Kavitha', 'Sravani', 'Swathi', 'Jyothi', 'Ramya', 'Keerthi', 'Meghana', 'Deepthi',
  'Tejaswi', 'Navyasree', 'Sahithi', 'Yamini', 'Sai Pranathi', 'Geetha', 'Sriya',
  'Mounika', 'Madhuri', 'Sindhu', 'Aishwarya', 'Amrutha', 'Sravanthi', 'Nandini',
  'Pranitha', 'Likhitha', 'Himabindu', 'Sirisha', 'Sujatha', 'Sunitha', 'Roopa', 'Sushma'
];

const usedEmails = new Set();

function generateName(gender, sIdx, dept) {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const firstNameList = gender === 'Male' ? BOY_FIRST_NAMES : GIRL_FIRST_NAMES;
  const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
  const fullName = `${surname} ${firstName}`;
  
  let baseEmail = `${firstName.toLowerCase().replace(/\s+/g, '')}.${surname.toLowerCase()}`;
  let finalEmail = `${baseEmail}@college.com`;
  let attempt = 1;
  while (usedEmails.has(finalEmail)) {
    finalEmail = `${baseEmail}${sIdx}_${attempt}@college.com`;
    attempt++;
  }
  usedEmails.add(finalEmail);
  
  return {
    fullName,
    email: finalEmail
  };
}

// ----------------------------------------------------
// SEED RUNNER
// ----------------------------------------------------
async function seed() {
  const config = await getClientConfig(connectionString);
  const client = new Client(config);

  try {
    console.log("⏳ Connecting to PostgreSQL database...");
    await client.connect();
    console.log("✅ Connected successfully.");

    // Clean existing records in dependency order
    console.log("⏳ Cleaning old data...");
    await client.query(`
      TRUNCATE TABLE selected_students CASCADE;
      TRUNCATE TABLE student_applications CASCADE;
      TRUNCATE TABLE drive_rounds CASCADE;
      TRUNCATE TABLE companies CASCADE;
      TRUNCATE TABLE placement_drives CASCADE;
      TRUNCATE TABLE hostel_visitors CASCADE;
      TRUNCATE TABLE hostel_complaints CASCADE;
      TRUNCATE TABLE hostel_fees CASCADE;
      TRUNCATE TABLE hostel_allocations CASCADE;
      TRUNCATE TABLE hostel_rooms CASCADE;
      TRUNCATE TABLE hostel_blocks CASCADE;
      TRUNCATE TABLE hostels CASCADE;
      TRUNCATE TABLE transport_fees CASCADE;
      TRUNCATE TABLE transport_allocations CASCADE;
      TRUNCATE TABLE routes CASCADE;
      TRUNCATE TABLE stops CASCADE;
      TRUNCATE TABLE drivers CASCADE;
      TRUNCATE TABLE buses CASCADE;
      TRUNCATE TABLE vehicle_maintenance CASCADE;
      TRUNCATE TABLE results CASCADE;
      TRUNCATE TABLE attendance CASCADE;
      TRUNCATE TABLE issued_books CASCADE;
      TRUNCATE TABLE books CASCADE;
      DELETE FROM students WHERE email NOT IN ('student@college.com');
      DELETE FROM users WHERE role NOT IN ('super-admin', 'admin', 'faculty', 'librarian');
    `);
    console.log("✅ Old data cleaned.");

    // Retrieve staff IDs
    const wardenRes = await client.query("SELECT id FROM users WHERE role = 'hostel-warden' OR email = 'warden@college.com' LIMIT 1");
    const managerRes = await client.query("SELECT id FROM users WHERE role = 'transport-manager' OR email = 'transport@college.com' LIMIT 1");
    const placementRes = await client.query("SELECT id FROM users WHERE role = 'placement-officer' OR email = 'placement@college.com' LIMIT 1");

    let wardenId = wardenRes.rows[0]?.id;
    let managerId = managerRes.rows[0]?.id;
    let placementOfficerId = placementRes.rows[0]?.id;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create staff users if not exist
    if (!wardenId) {
      const res = await client.query(
        `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active)
         VALUES ('Hostel Warden', 'Hostel Warden', 'warden@college.com', $1, 'hostel-warden', true, true) RETURNING id`,
        [passwordHash]
      );
      wardenId = res.rows[0].id;
    }
    if (!managerId) {
      const res = await client.query(
        `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active)
         VALUES ('Transport Manager', 'Transport Manager', 'transport@college.com', $1, 'transport-manager', true, true) RETURNING id`,
        [passwordHash]
      );
      managerId = res.rows[0].id;
    }
    if (!placementOfficerId) {
      const res = await client.query(
        `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active)
         VALUES ('Placement Officer', 'Placement Officer', 'placement@college.com', $1, 'placement-officer', true, true) RETURNING id`,
        [passwordHash]
      );
      placementOfficerId = res.rows[0].id;
    }

    console.log("✅ Administrative accounts verified/seeded.");

    // ----------------------------------------------------
    // SEED HOSTELS, BLOCKS, ROOMS
    // ----------------------------------------------------
    console.log("⏳ Seeding Hostel structures...");
    const hostelData = [
      { name: 'Vivekananda Boys Hostel', code: 'VBH', type: 'Boys', rooms: 20 },
      { name: 'APJ Kalam Boys Hostel', code: 'KJH', type: 'Boys', rooms: 20 },
      { name: 'Sarojini Girls Hostel', code: 'SGH', type: 'Girls', rooms: 25 }
    ];

    const hostelRoomsList = []; // { hostelId, blockId, roomId, roomNumber, gender, occupants: 0 }

    for (const h of hostelData) {
      const hRes = await client.query(
        `INSERT INTO hostels (name, code, type, warden, total_rooms, total_beds, monthly_fee, facilities, contact_number)
         VALUES ($1, $2, $3, $4, $5, $6, 5500, '["Wi-Fi", "Mess", "Gym", "Power Backup"]', '9876543210') RETURNING id`,
        [h.name, h.code, h.type, wardenId, h.rooms, h.rooms * 4]
      );
      const hostelId = hRes.rows[0].id;

      // Seed 3 blocks per hostel
      const blocks = ['Block-A', 'Block-B', 'Block-C'];
      for (const bCode of blocks) {
        const bRes = await client.query(
          `INSERT INTO hostel_blocks (hostel_id, name, code, total_floors, total_rooms, total_beds, facilities, block_warden)
           VALUES ($1, $2, $3, 3, $4, $5, '["RO Water", "Lounge"]', 'Asst Warden') RETURNING id`,
          [hostelId, bCode, bCode, Math.ceil(h.rooms / 3), Math.ceil(h.rooms / 3) * 4]
        );
        const blockId = bRes.rows[0].id;

        // Seed rooms for this block
        const roomsCount = Math.ceil(h.rooms / 3);
        for (let r = 1; r <= roomsCount; r++) {
          const floor = Math.ceil(r / 3);
          const roomNo = `${floor}0${r % 3 === 0 ? 3 : r % 3}`;
          const rRes = await client.query(
            `INSERT INTO hostel_rooms (hostel_id, block_id, room_number, floor, type, capacity, occupants, amenities)
             VALUES ($1, $2, $3, $4, 'Non-AC', 4, 0, '["Study Table", "Almirah"]') RETURNING id`,
            [hostelId, blockId, roomNo, floor]
          );
          hostelRoomsList.push({
            hostelId,
            blockId,
            roomId: rRes.rows[0].id,
            roomNumber: roomNo,
            gender: h.type,
            occupants: 0
          });
        }
      }
    }
    console.log("✅ Hostel structure seeded.");

    // ----------------------------------------------------
    // SEED TRANSPORT VEHICLES, DRIVERS, STOPS, ROUTES
    // ----------------------------------------------------
    console.log("⏳ Seeding Transport infrastructure...");
    const busesData = [
      { busNumber: 'AP39T1234', type: 'Bus', make: 'Tata', model: 'Starbus', year: 2022, capacity: 50 },
      { busNumber: 'AP39T5678', type: 'Bus', make: 'Ashok Leyland', model: 'Mitr', year: 2021, capacity: 50 },
      { busNumber: 'AP39T9012', type: 'Bus', make: 'Force', model: 'Traveller', year: 2023, capacity: 30 },
      { busNumber: 'AP39T3456', type: 'Bus', make: 'Eicher', model: 'Skyline', year: 2020, capacity: 50 }
    ];

    const busIds = [];
    for (const b of busesData) {
      const bRes = await client.query(
        `INSERT INTO buses (bus_number, type, make, model, year, capacity, fuel_type, status, gps_device_number, insurance_expiry)
         VALUES ($1, $2, $3, $4, $5, $6, 'Diesel', 'Active', $7, '2027-12-31') RETURNING id`,
        [b.busNumber, b.type, b.make, b.model, b.year, b.capacity, 'GPS_' + b.busNumber]
      );
      busIds.push(bRes.rows[0].id);
    }

    const driversData = [
      { name: 'K. Yadaiah', phone: '9848022338', license: 'DL-TEL-0123', busIdx: 0 },
      { name: 'M. Venkatesh', phone: '9848033449', license: 'DL-TEL-4567', busIdx: 1 },
      { name: 'P. Chandraiah', phone: '9848044550', license: 'DL-TEL-8901', busIdx: 2 },
      { name: 'G. Rama Rao', phone: '9848055661', license: 'DL-TEL-2345', busIdx: 3 }
    ];

    const driverIds = [];
    for (const d of driversData) {
      const dRes = await client.query(
        `INSERT INTO drivers (full_name, phone, license_number, license_expiry, experience_years, assigned_bus_id, status)
         VALUES ($1, $2, $3, '2030-05-15', 10, $4, 'Active') RETURNING id`,
        [d.name, d.phone, d.license, busIds[d.busIdx]]
      );
      driverIds.push(dRes.rows[0].id);
    }

    const stopsData = [
      { name: 'Kukatpally Housing Board', fare: 1500, landmark: 'KPHB Metro' },
      { name: 'Miyapur X Roads', fare: 1600, landmark: 'Miyapur Bus Stop' },
      { name: 'Gachibowli DLF', fare: 1800, landmark: 'DLF Gate 1' },
      { name: 'Ameerpet Mythrivanam', fare: 1700, landmark: 'Ameerpet Metro' },
      { name: 'Secunderabad Station', fare: 2000, landmark: 'Rathifile Bus Station' },
      { name: 'LB Nagar Ring Road', fare: 2200, landmark: 'LB Nagar Metro' }
    ];

    const stopIds = [];
    for (const s of stopsData) {
      const sRes = await client.query(
        `INSERT INTO stops (name, monthly_fare, landmark, latitude, longitude)
         VALUES ($1, $2, $3, '17.448', '78.374') RETURNING id`,
        [s.name, s.fare, s.landmark]
      );
      stopIds.push({ id: sRes.rows[0].id, name: s.name, fare: s.fare });
    }

    const routesData = [
      { name: 'Kukatpally-Miyapur Route', num: 'R-01', start: 'KPHB', end: 'College Campus', dist: 18.5, time: '45 mins', busIdx: 0, driverIdx: 0, stopIndices: [0, 1] },
      { name: 'Gachibowli Route', num: 'R-02', start: 'DLF Gate', end: 'College Campus', dist: 22.0, time: '55 mins', busIdx: 1, driverIdx: 1, stopIndices: [2, 3] },
      { name: 'Secunderabad Route', num: 'R-03', start: 'Rathifile', end: 'College Campus', dist: 28.2, time: '75 mins', busIdx: 2, driverIdx: 2, stopIndices: [4, 5] },
      { name: 'Miyapur Express Route', num: 'R-04', start: 'Miyapur', end: 'College Campus', dist: 16.0, time: '40 mins', busIdx: 3, driverIdx: 3, stopIndices: [1, 3] }
    ];

    const routeIds = [];
    for (const r of routesData) {
      const stopsArray = r.stopIndices.map((idx, order) => ({
        stopId: stopIds[idx].id,
        name: stopIds[idx].name,
        order,
        time: `${7 + order * 15}:00 AM`
      }));

      const rRes = await client.query(
        `INSERT INTO routes (name, route_number, start_point, end_point, distance, estimated_time, bus_id, driver_id, status, stops)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active', $9) RETURNING id`,
        [r.name, r.num, r.start, r.end, r.dist, r.time, busIds[r.busIdx], driverIds[r.driverIdx], JSON.stringify(stopsArray)]
      );
      routeIds.push({
        id: rRes.rows[0].id,
        stops: r.stopIndices.map(idx => stopIds[idx])
      });
    }
    console.log("✅ Transport infrastructure seeded.");

    // ----------------------------------------------------
    // IN-MEMORY STUDENT GENERATION & BATCH PREPARATION
    // ----------------------------------------------------
    console.log("⏳ Generating 450 Students and Parents data in memory...");
    const DEPARTMENTS = ['CSE', 'AIML', 'AIDS', 'CYBERSECURITY', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
    const SECTIONS = ['A', 'B'];

    const getDeptAllocationTargets = (dept) => {
      switch (dept) {
        case 'CSE': case 'AIML': case 'MECH': case 'CIVIL':
          return { hostel: 17, transport: 17, day: 16 };
        case 'AIDS': case 'CYBERSECURITY':
          return { hostel: 17, transport: 16, day: 17 };
        case 'IT': case 'ECE':
          return { hostel: 16, transport: 17, day: 17 };
        case 'EEE':
          return { hostel: 16, transport: 16, day: 18 };
        default:
          return { hostel: 16, transport: 16, day: 18 };
      }
    };

    const batchUsers = [];
    const batchStudents = [];
    const batchHostelAllocations = [];
    const batchHostelFees = [];
    const batchTransportAllocations = [];
    const batchTransportFees = [];
    const batchGeneralFees = [];
    const allStudentsList = []; // Helper for attendance & results

    let studentIndex = 1;
    let hostelAllocationCount = 0;
    let transportAllocationCount = 0;
    let dayScholarCount = 0;

    for (const dept of DEPARTMENTS) {
      const targets = getDeptAllocationTargets(dept);
      let deptHostelLeft = targets.hostel;
      let deptTransportLeft = targets.transport;
      let deptDayLeft = targets.day;

      for (let sIdx = 1; sIdx <= 50; sIdx++) {
        const gender = sIdx <= 25 ? 'Male' : 'Female';
        const nameData = generateName(gender, sIdx, dept);
        
        // Year & Semester limits
        const year = ((sIdx - 1) % 4) + 1;
        const semester = (year - 1) * 2 + (sIdx % 2 === 0 ? 2 : 1);
        const section = SECTIONS[sIdx % 2];

        const rollNum = `${dept}26${String(sIdx).padStart(3, '0')}`;
        const admissionNum = `ADM2026${dept}${String(sIdx).padStart(3, '0')}`;

        // Pre-generate IDs
        const studentUserId = crypto.randomUUID();
        const parentUserId = crypto.randomUUID();
        const studentId = crypto.randomUUID();

        // 1. Add Student User
        batchUsers.push({
          id: studentUserId,
          name: nameData.fullName,
          full_name: nameData.fullName,
          email: nameData.email,
          password: passwordHash,
          temp_password: 'password123',
          role: 'student',
          child_email: null,
          is_verified: true,
          is_active: true
        });

        // 2. Add Parent User
        const parentName = gender === 'Male' ? `Sri ${nameData.fullName.split(' ')[0]} Ramana` : `Sri ${nameData.fullName.split(' ')[0]} Prasad`;
        const parentEmail = `parent.${nameData.email}`;
        batchUsers.push({
          id: parentUserId,
          name: parentName,
          full_name: parentName,
          email: parentEmail,
          password: passwordHash,
          temp_password: 'password123',
          role: 'parent',
          child_email: nameData.email,
          is_verified: true,
          is_active: true
        });

        // 3. Add Student Profile
        batchStudents.push({
          id: studentId,
          user_id: studentUserId,
          full_name: nameData.fullName,
          roll_number: rollNum,
          admission_number: admissionNum,
          email: nameData.email,
          phone_number: '9876543211',
          gender,
          date_of_birth: '2005-08-15',
          department: dept,
          year,
          semester,
          section,
          address: 'Plot 102, Hyderabad, Telangana',
          parent_name: parentName,
          parent_phone: '9876543222',
          parent_email: parentEmail,
          cgpa: 8.2,
          attendance_percentage: 88.0,
          is_active: true
        });

        allStudentsList.push({
          id: studentId,
          userId: studentUserId,
          year,
          semester
        });

        // Allocation logic
        let allocationType = 'Day';
        if (deptHostelLeft > 0) {
          allocationType = 'Hostel';
          deptHostelLeft--;
          hostelAllocationCount++;
        } else if (deptTransportLeft > 0) {
          allocationType = 'Transport';
          deptTransportLeft--;
          transportAllocationCount++;
        } else {
          deptDayLeft--;
          dayScholarCount++;
        }

        if (allocationType === 'Hostel') {
          const targetGender = gender === 'Male' ? 'Boys' : 'Girls';
          const availableRoom = hostelRoomsList.find(r => r.gender === targetGender && r.occupants < 4);

          if (availableRoom) {
            availableRoom.occupants++;
            batchHostelAllocations.push({
              student_id: studentId,
              hostel_id: availableRoom.hostelId,
              block_id: availableRoom.blockId,
              room_id: availableRoom.roomId,
              bed_number: availableRoom.occupants,
              status: 'Active',
              academic_year: '2026-2027'
            });

            batchHostelFees.push({
              student_id: studentId,
              hostel_id: availableRoom.hostelId,
              month: 'June',
              year: 2026,
              total_amount: 5500,
              paid_amount: 5500,
              due_date: '2026-06-10',
              status: 'Paid'
            });
          }
        } else if (allocationType === 'Transport') {
          const routeObj = routeIds[Math.floor(Math.random() * routeIds.length)];
          const stopObj = routeObj.stops[Math.floor(Math.random() * routeObj.stops.length)];
          const passNum = `TP2026${String(studentIndex).padStart(4, '0')}`;
          const tAllocId = crypto.randomUUID();

          batchTransportAllocations.push({
            id: tAllocId,
            student_id: studentId,
            route_id: routeObj.id,
            pickup_stop_id: stopObj.id,
            drop_stop_id: stopObj.id,
            academic_year: '2026-2027',
            monthly_fare: stopObj.fare,
            pass_number: passNum,
            status: 'Active'
          });

          batchTransportFees.push({
            student_id: studentId,
            allocation_id: tAllocId,
            route_id: routeObj.id,
            academic_year: '2026-2027',
            month: 'June',
            year: 2026,
            total_amount: stopObj.fare,
            paid_amount: 0,
            due_date: '2026-06-10',
            status: 'Unpaid'
          });
        }

        // General fee
        batchGeneralFees.push({
          student: studentId,
          amount: 75000,
          type: 'Tuition Fee',
          due_date: '2026-07-15',
          status: 'Unpaid',
          paid_amount: 0,
          academic_year: '2026-2027',
          semester
        });

        studentIndex++;
      }
    }

    // ----------------------------------------------------
    // EXECUTE BATCHED INSERTS
    // ----------------------------------------------------
    console.log("⏳ Inserting Users...");
    await batchInsert(client, 'users', [
      'id', 'name', 'full_name', 'email', 'password', 'temp_password', 'role', 'child_email', 'is_verified', 'is_active'
    ], batchUsers);
    console.log("✅ Users inserted.");

    console.log("⏳ Inserting Students...");
    await batchInsert(client, 'students', [
      'id', 'user_id', 'full_name', 'roll_number', 'admission_number', 'email', 'phone_number', 'gender', 'date_of_birth',
      'department', 'year', 'semester', 'section', 'address', 'parent_name', 'parent_phone', 'parent_email', 'cgpa',
      'attendance_percentage', 'is_active'
    ], batchStudents);
    console.log("✅ Students inserted.");

    console.log("⏳ Inserting Hostel Allocations...");
    await batchInsert(client, 'hostel_allocations', [
      'student_id', 'hostel_id', 'block_id', 'room_id', 'bed_number', 'status', 'academic_year'
    ], batchHostelAllocations);
    console.log("✅ Hostel Allocations inserted.");

    console.log("⏳ Inserting Hostel Fees...");
    await batchInsert(client, 'hostel_fees', [
      'student_id', 'hostel_id', 'month', 'year', 'total_amount', 'paid_amount', 'due_date', 'status'
    ], batchHostelFees);
    console.log("✅ Hostel Fees inserted.");

    console.log("⏳ Inserting Transport Allocations...");
    await batchInsert(client, 'transport_allocations', [
      'id', 'student_id', 'route_id', 'pickup_stop_id', 'drop_stop_id', 'academic_year', 'monthly_fare', 'pass_number', 'status'
    ], batchTransportAllocations);
    console.log("✅ Transport Allocations inserted.");

    console.log("⏳ Inserting Transport Fees...");
    await batchInsert(client, 'transport_fees', [
      'student_id', 'allocation_id', 'route_id', 'academic_year', 'month', 'year', 'total_amount', 'paid_amount', 'due_date', 'status'
    ], batchTransportFees);
    console.log("✅ Transport Fees inserted.");

    console.log("⏳ Inserting General Tuition Fees...");
    await batchInsert(client, 'fees', [
      'student', 'amount', 'type', 'due_date', 'status', 'paid_amount', 'academic_year', 'semester'
    ], batchGeneralFees);
    console.log("✅ Tuition Fees inserted.");

    // Update Hostel Rooms occupants column via SQL aggregation
    console.log("⏳ Syncing hostel room occupants counts...");
    await client.query(`
      UPDATE hostel_rooms hr
      SET occupants = (
        SELECT COUNT(*)
        FROM hostel_allocations ha
        WHERE ha.room_id = hr.id AND ha.status = 'Active'
      )
    `);
    console.log("✅ Hostel rooms occupants synced.");

    // ----------------------------------------------------
    // SEED ATTENDANCE RECORDS (BATCHED)
    // ----------------------------------------------------
    console.log("⏳ Seeding Attendance records...");
    const subjects = ['Mathematics', 'Physics', 'Programming in C', 'Data Structures', 'Database Systems'];
    const attendanceValues = [];
    const attendanceValueStrings = [];
    let attParamIdx = 1;

    for (const student of allStudentsList) {
      for (let i = 1; i <= 20; i++) {
        const date = `2026-05-${String(i).padStart(2, '0')}`;
        const status = Math.random() > 0.08 ? 'Present' : 'Absent';
        const sub = subjects[i % subjects.length];
        
        attendanceValueStrings.push(`($${attParamIdx}, $${attParamIdx+1}, $${attParamIdx+2}, $${attParamIdx+3}, $${attParamIdx+4})`);
        attendanceValues.push(student.id, date, status, sub, 'Daily log');
        attParamIdx += 5;
      }
    }

    const attendanceQuery = `
      INSERT INTO attendance (student, date, status, subject, remarks)
      VALUES ${attendanceValueStrings.join(', ')}
      ON CONFLICT (student, date, subject) DO NOTHING
    `;
    await client.query(attendanceQuery, attendanceValues);
    console.log("✅ Attendance records seeded.");

    // ----------------------------------------------------
    // SEED ACADEMIC RESULTS (BATCHED)
    // ----------------------------------------------------
    console.log("⏳ Seeding Results...");
    const resultValues = [];
    const resultValueStrings = [];
    let resParamIdx = 1;

    for (const student of allStudentsList) {
      for (let s = 0; s < subjects.length; s++) {
        const marks = 60 + Math.floor(Math.random() * 38);
        let grade = 'A';
        if (marks >= 90) grade = 'O';
        else if (marks >= 80) grade = 'A+';
        else if (marks >= 70) grade = 'B';
        else grade = 'C';

        resultValueStrings.push(`($${resParamIdx}, $${resParamIdx+1}, $${resParamIdx+2}, $${resParamIdx+3}, $${resParamIdx+4}, $${resParamIdx+5})`);
        resultValues.push(student.userId, subjects[s], 3, marks, grade, 1);
        resParamIdx += 6;
      }
    }

    const resultsQuery = `
      INSERT INTO results (student, subject, credits, marks, grade, semester)
      VALUES ${resultValueStrings.join(', ')}
      ON CONFLICT (student, subject, semester) DO NOTHING
    `;
    await client.query(resultsQuery, resultValues);
    console.log("✅ Results seeded.");

    // ----------------------------------------------------
    // SEED COMPANIES & PLACEMENT DRIVES
    // ----------------------------------------------------
    console.log("⏳ Seeding Placements...");
    const companiesData = [
      { name: 'Microsoft India', ind: 'Technology', pkg: 44.5, contact: 'Sanjay Kapoor', email: 'careers@microsoft.com' },
      { name: 'Amazon Hyderabad', ind: 'E-commerce', pkg: 32.0, contact: 'Neha Sharma', email: 'recruiting@amazon.com' },
      { name: 'Google Bangalore', ind: 'Technology', pkg: 52.0, contact: 'Vikas Rao', email: 'jobs@google.com' },
      { name: 'TCS Hyderabad', ind: 'IT Services', pkg: 7.2, contact: 'Ramesh Reddy', email: 'recruiter@tcs.com' },
      { name: 'Infosys Ltd', ind: 'IT Services', pkg: 6.5, contact: 'Sunita Rao', email: 'hr@infosys.com' },
      { name: 'Accenture India', ind: 'Consulting', pkg: 8.5, contact: 'Amit Varma', email: 'accenture@career.com' },
      { name: 'Oracle', ind: 'Technology', pkg: 16.5, contact: 'Siddharth Sen', email: 'hr@oracle.com' }
    ];

    const companyIds = [];
    for (const c of companiesData) {
      const cRes = await client.query(
        `INSERT INTO companies (name, industry, hr_name, email, phone, package_amount, is_active)
         VALUES ($1, $2, $3, $4, '9123456780', $5, true) RETURNING id`,
        [c.name, c.ind, c.contact, c.email, c.pkg]
      );
      companyIds.push(cRes.rows[0].id);
    }

    const drivesData = [
      { companyIdx: 0, title: 'Software Engineer - Intern', date: '2026-06-15', deadline: '2026-06-10', status: 'Upcoming' },
      { companyIdx: 1, title: 'SDE-1 Graduate Hire', date: '2026-06-25', deadline: '2026-06-20', status: 'Upcoming' },
      { companyIdx: 2, title: 'Associate Cloud Engineer', date: '2026-07-02', deadline: '2026-06-28', status: 'Upcoming' },
      { companyIdx: 3, title: 'System Engineer Trainee', date: '2026-05-10', deadline: '2026-05-05', status: 'Completed' }
    ];

    const driveIds = [];
    for (const d of drivesData) {
      const dRes = await client.query(
        `INSERT INTO placement_drives (company_id, job_title, drive_date, venue, deadline, status, rounds)
         VALUES ($1, $2, $3, 'Seminar Hall-1', $4, $5, 3) RETURNING id`,
        [companyIds[d.companyIdx], d.title, d.date, d.deadline, d.status]
      );
      driveIds.push(dRes.rows[0].id);
    }

    // Seed student applications & selections
    console.log("⏳ Seeding job applications & selections...");
    const seniorStudents = allStudentsList.filter(s => s.year >= 3);

    const batchApplications = [];
    const batchSelections = [];

    for (let i = 0; i < Math.min(seniorStudents.length, 60); i++) {
      const student = seniorStudents[i];
      const driveId = driveIds[i % driveIds.length];
      const status = i % 5 === 0 ? 'Selected' : i % 3 === 0 ? 'Shortlisted' : 'Applied';

      batchApplications.push({
        student_id: student.id,
        drive_id: driveId,
        status,
        applied_date: '2026-05-01'
      });

      if (status === 'Selected') {
        const pkgAmt = i % 10 === 0 ? 32.0 : 8.5;
        batchSelections.push({
          student_id: student.id,
          drive_id: driveId,
          package_amount: pkgAmt,
          selection_date: '2026-05-12'
        });
      }
    }

    await batchInsert(client, 'student_applications', ['student_id', 'drive_id', 'status', 'applied_date'], batchApplications);
    await batchInsert(client, 'selected_students', ['student_id', 'drive_id', 'package_amount', 'selection_date'], batchSelections);
    console.log("✅ Placements seeded.");

    // ----------------------------------------------------
    // SEED LIBRARY BOOKS & ISSUED BOOKS
    // ----------------------------------------------------
    console.log("⏳ Seeding Library Books...");
    const booksData = [
      { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', isbn: '9780262033848', cat: 'Computer Science' },
      { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', isbn: '9781118063330', cat: 'Computer Science' },
      { title: 'Database System Concepts', author: 'Korth, Sudarshan', isbn: '9780073523323', cat: 'Computer Science' },
      { title: 'Digital Design', author: 'M. Morris Mano', isbn: '9780131989269', cat: 'Electronics' },
      { title: 'Electrical Machinery', author: 'P.S. Bimbhra', isbn: '9788174091734', cat: 'Electrical' },
      { title: 'Theory of Machines', author: 'R.S. Khurmi', isbn: '9788121925242', cat: 'Mechanical' },
      { title: 'Surveying Vol. 1', author: 'B.C. Punmia', isbn: '9788170088530', cat: 'Civil' }
    ];

    const bookIds = [];
    for (const b of booksData) {
      const bRes = await client.query(
        `INSERT INTO books (title, author, isbn, category, quantity, available_quantity, shelf_location, publisher)
         VALUES ($1, $2, $3, $4, 10, 8, 'Shelf-C4', 'McGraw Hill') RETURNING id`,
        [b.title, b.author, b.isbn, b.cat]
      );
      bookIds.push(bRes.rows[0].id);
    }

    const batchIssuedBooks = [];
    for (let i = 0; i < 20; i++) {
      const student = allStudentsList[i];
      const bookId = bookIds[i % bookIds.length];
      batchIssuedBooks.push({
        book: bookId,
        user_id: student.userId,
        student: student.id,
        issue_date: '2026-05-15',
        due_date: '2026-05-30',
        status: 'Issued'
      });
    }
    await batchInsert(client, 'issued_books', ['book', 'user_id', 'student', 'issue_date', 'due_date', 'status'], batchIssuedBooks);
    console.log("✅ Library books & circulation seeded.");

    console.log("🎉 SUCCESS! Supabase PostgreSQL has been fully seeded with 450 dynamic students and connected modules.");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seed();
