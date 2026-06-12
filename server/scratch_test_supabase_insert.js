import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Read credentials from client/.env
dotenv.config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const studentPayload = {
    fullName: "Test Resident Student",
    rollNumber: "TEST_ROLL_" + Math.floor(Math.random() * 10000),
    admissionNumber: "TEST_ADM_" + Math.floor(Math.random() * 10000),
    email: `test_resident_${Date.now()}@example.com`,
    phoneNumber: "9876543210",
    gender: "Male",
    dateOfBirth: "2005-01-01",
    department: "CSE",
    year: 1,
    semester: 1,
    section: "A",
    parentName: "Test Parent",
    parentPhone: "9999999999",
    parentEmail: "parent@example.com",
    cgpa: 8.5,
    attendancePercentage: 90
  };

  try {
    // 1. Fetch first hostel, block, and room to use
    const { data: hostels } = await supabase.from("hostels").select("id").limit(1);
    if (!hostels || hostels.length === 0) {
      throw new Error("No hostels found in database");
    }
    const hostelId = hostels[0].id;

    const { data: blocks } = await supabase.from("hostel_blocks").select("id").eq("hostel_id", hostelId).limit(1);
    if (!blocks || blocks.length === 0) {
      throw new Error("No blocks found in database for hostel " + hostelId);
    }
    const blockId = blocks[0].id;

    const { data: rooms } = await supabase.from("hostel_rooms").select("id").eq("block_id", blockId).limit(1);
    if (!rooms || rooms.length === 0) {
      throw new Error("No rooms found in database for block " + blockId);
    }
    const roomId = rooms[0].id;

    console.log("Using allocation IDs:", { hostelId, blockId, roomId });

    // 2. Insert Student
    console.log("Inserting student...");
    const { data: newStudent, error: createErr } = await supabase
      .from("students")
      .insert([{
        full_name: studentPayload.fullName,
        roll_number: studentPayload.rollNumber,
        admission_number: studentPayload.admissionNumber,
        email: studentPayload.email,
        phone_number: studentPayload.phoneNumber,
        gender: studentPayload.gender,
        date_of_birth: studentPayload.dateOfBirth,
        department: studentPayload.department,
        year: studentPayload.year,
        semester: studentPayload.semester,
        section: studentPayload.section,
        parent_name: studentPayload.parentName,
        parent_phone: studentPayload.parentPhone,
        parent_email: studentPayload.parentEmail,
        cgpa: studentPayload.cgpa,
        attendance_percentage: studentPayload.attendancePercentage,
        is_active: true
      }])
      .select()
      .single();

    if (createErr) {
      console.error("❌ Student creation error:", createErr);
      return;
    }
    console.log("✅ Student inserted:", newStudent.id);

    // 3. Insert hostel allocation
    console.log("Inserting allocation...");
    const { data: allocation, error: allocErr } = await supabase
      .from("hostel_allocations")
      .insert([{
        student_id: newStudent.id,
        hostel_id: hostelId,
        block_id: blockId,
        room_id: roomId,
        bed_number: 1,
        status: "Active",
        academic_year: "2026-2027"
      }])
      .select()
      .single();

    if (allocErr) {
      console.error("❌ Allocation creation error:", allocErr);
      return;
    }
    console.log("✅ Allocation inserted:", allocation.id);

  } catch (err) {
    console.error("❌ Exception during testInsert:", err);
  }
}

testInsert();
