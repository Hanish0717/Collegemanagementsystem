import { supabase } from "@/lib/supabaseClient";
import { seedHostelsIfEmpty, seedNotificationsIfEmpty } from "@/services/seedService";

export interface ResidentRecord {
  id: string; // allocation id
  studentId: string;
  fullName: string;
  rollNumber: string;
  admissionNumber?: string;
  email: string;
  phoneNumber: string | null;
  gender: string | null;
  dateOfBirth?: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  cgpa?: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  status: "Active" | "Vacated" | "Suspended";
  emergencyContact: string;
  attendance: string;
  attendancePercentage?: string;
  profileImage: string | null;
  hostelId: string;
  blockId: string;
  roomId: string;
  bedNumber: number;
  academicYear: string;
}

export interface RoomRecord {
  id: string;
  hostelId: string;
  blockId: string;
  roomNumber: string;
  floor: number;
  type: string;
  capacity: number;
  occupants: number;
  blockName: string;
  hostelName: string;
  allocations?: Array<{
    id: string;
    status: string;
    studentName: string;
    department: string;
  }>;
}

export interface ComplaintRecord {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  category: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In-Progress" | "Resolved";
  assignedTo: string | null;
  createdAt: string;
}

export interface VisitorRecord {
  id: string;
  visitorName: string;
  visitorPhone: string;
  relationship: string;
  purpose: string;
  studentName: string;
  roomNumber: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: "Inside" | "Checked Out";
}

export interface HostelFeeRecord {
  id: string;
  studentName: string;
  roomNumber: string;
  feeAmount: string;
  dueDate: string;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  rawAmount: number;
  paidAmount: number;
  paymentMethod: string | null;
  receiptNumber: string | null;
}

// Helper to log actions to database
export async function logActivity(actor: string, action: string, target: string, type: string) {
  try {
    await supabase.from("activity_logs").insert([{
      actor,
      action,
      target,
      type
    }]);
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}

// Helper to create notifications
export async function createNotification(title: string, type: string, urgency: string = "Medium") {
  try {
    await supabase.from("system_notifications").insert([{
      id: `HN-${Date.now() % 1000000}`,
      title,
      type,
      time: "Just now",
      unread: true
    }]);
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

// ── Residents CRUD ──────────────────────────────────────
export async function fetchResidents(filters: { search?: string; department?: string; status?: string; floor?: string } = {}): Promise<ResidentRecord[]> {
  // Query allocations table with joined student and room details
  let query = supabase
    .from("hostel_allocations")
    .select(`
      id,
      status,
      bed_number,
      academic_year,
      student_id,
      hostel_id,
      block_id,
      room_id,
      hostel_rooms (
        id, room_number, floor, type
      ),
      students (
        id, full_name, roll_number, admission_number, email, phone_number, gender, date_of_birth, department, year, semester, section, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, profile_image
      )
    `);

  const { data, error } = await query;
  if (error) throw error;

  let residents: ResidentRecord[] = (data || []).map((row: any) => {
    const s = row.students || {};
    const r = row.hostel_rooms || {};
    return {
      id: row.id,
      studentId: row.student_id,
      fullName: s.full_name || "Unknown",
      rollNumber: s.roll_number || "",
      admissionNumber: s.admission_number || "",
      email: s.email || "",
      phoneNumber: s.phone_number || null,
      gender: s.gender || null,
      dateOfBirth: s.date_of_birth || "",
      department: s.department || "CSE",
      year: Number(s.year || 1),
      semester: Number(s.semester || 1),
      section: s.section || "A",
      parentName: s.parent_name || "",
      parentPhone: s.parent_phone || "",
      parentEmail: s.parent_email || "",
      cgpa: s.cgpa ? String(s.cgpa) : "",
      roomNumber: r.room_number || "Unallocated",
      floor: Number(r.floor || 1),
      roomType: r.type || "Non-AC",
      status: row.status as any,
      emergencyContact: s.parent_phone || "",
      attendance: s.attendance_percentage ? `${Math.round(s.attendance_percentage)}%` : "100%",
      attendancePercentage: s.attendance_percentage ? String(s.attendance_percentage) : "100",
      profileImage: s.profile_image || null,
      hostelId: row.hostel_id || "",
      blockId: row.block_id || "",
      roomId: row.room_id || "",
      bedNumber: Number(row.bed_number || 1),
      academicYear: row.academic_year || "2026-2027",
    };
  });

  // Apply filters in memory for complex join criteria
  if (filters.search) {
    const searchVal = filters.search.toLowerCase();
    residents = residents.filter(
      r =>
        r.fullName.toLowerCase().includes(searchVal) ||
        r.rollNumber.toLowerCase().includes(searchVal) ||
        r.roomNumber.toLowerCase().includes(searchVal)
    );
  }
  if (filters.department && filters.department !== "All Departments") {
    residents = residents.filter(r => r.department === filters.department);
  }
  if (filters.status && filters.status !== "All Status") {
    residents = residents.filter(r => r.status === filters.status);
  }
  if (filters.floor && filters.floor !== "All Floors") {
    const floorNum = parseInt(filters.floor.replace(/[^0-9]/g, ""), 10);
    residents = residents.filter(r => r.floor === floorNum);
  }

  return residents;
}

export async function createResident(studentPayload: any, allocationPayload: { hostelId: string; blockId: string; roomId: string; bedNumber: number; academicYear: string }) {
  // Check if student already exists by email and has an active room allocation
  const { data: existingStudent } = await supabase
    .from("students")
    .select("id")
    .eq("email", studentPayload.email)
    .maybeSingle();

  if (existingStudent) {
    const { data: activeAlloc } = await supabase
      .from("hostel_allocations")
      .select("id")
      .eq("student_id", existingStudent.id)
      .eq("status", "Active")
      .maybeSingle();

    if (activeAlloc) {
      throw new Error("This student already has an active room allocation.");
    }
  }

  // Check if the bed is already occupied in this room
  const { data: occupiedBed } = await supabase
    .from("hostel_allocations")
    .select("id")
    .eq("room_id", allocationPayload.roomId)
    .eq("bed_number", allocationPayload.bedNumber)
    .eq("status", "Active")
    .maybeSingle();

  if (occupiedBed) {
    throw new Error(`Bed ${allocationPayload.bedNumber} in this room is already occupied.`);
  }

  // Check room capacity
  const { data: room } = await supabase
    .from("hostel_rooms")
    .select("capacity, occupants")
    .eq("id", allocationPayload.roomId)
    .single();

  if (room && room.occupants >= room.capacity) {
    throw new Error("This room is already at full capacity.");
  }

  // 1. Create or Find student record
  let studentId = "";
  if (existingStudent) {
    studentId = existingStudent.id;
    // Update student details
    await supabase.from("students").update({
      full_name: studentPayload.fullName,
      phone_number: studentPayload.phoneNumber,
      department: studentPayload.department,
      year: studentPayload.year,
      semester: studentPayload.semester,
      section: studentPayload.section,
      parent_phone: studentPayload.parentPhone,
      parent_name: studentPayload.parentName,
      parent_email: studentPayload.parentEmail
    }).eq("id", studentId);
  } else {
    const { data: newStudent, error: createErr } = await supabase
      .from("students")
      .insert([{
        full_name: studentPayload.fullName,
        roll_number: studentPayload.rollNumber,
        admission_number: studentPayload.admissionNumber || `ADM${Date.now() % 100000}`,
        email: studentPayload.email,
        phone_number: studentPayload.phoneNumber || null,
        gender: studentPayload.gender,
        date_of_birth: studentPayload.dateOfBirth || null,
        department: studentPayload.department,
        year: studentPayload.year,
        semester: studentPayload.semester,
        section: studentPayload.section,
        parent_name: studentPayload.parentName,
        parent_phone: studentPayload.parentPhone,
        parent_email: studentPayload.parentEmail,
        cgpa: studentPayload.cgpa || 8.0,
        attendance_percentage: studentPayload.attendancePercentage || 90.0,
        is_active: true
      }])
      .select()
      .single();

    if (createErr) throw createErr;
    studentId = newStudent.id;
  }

  // 2. Insert hostel allocation
  const { data: allocation, error: allocErr } = await supabase
    .from("hostel_allocations")
    .insert([{
      student_id: studentId,
      hostel_id: allocationPayload.hostelId,
      block_id: allocationPayload.blockId,
      room_id: allocationPayload.roomId,
      bed_number: allocationPayload.bedNumber,
      status: "Active",
      academic_year: allocationPayload.academicYear
    }])
    .select()
    .single();

  if (allocErr) throw allocErr;

  // 3. Increment occupants count
  await supabase.rpc("increment_room_occupants", { room_uuid: allocationPayload.roomId });
  
  // Also fall back to regular update if RPC doesn't exist
  try {
    const { data: rm } = await supabase.from("hostel_rooms").select("occupants").eq("id", allocationPayload.roomId).single();
    if (rm) {
      await supabase.from("hostel_rooms").update({ occupants: (rm.occupants || 0) + 1 }).eq("id", allocationPayload.roomId);
    }
  } catch (e) {
    // Ignore RPC fallbacks
  }

  // Log and Notify
  await logActivity("Warden", "allocated room for", studentPayload.fullName, "Allocation");
  await createNotification(`New Room Allocation: ${studentPayload.fullName} assigned to room.`, "Maintenance", "Medium");

  return allocation;
}

export async function updateResident(
  allocationId: string,
  studentId: string,
  studentPayload: any,
  allocationPayload: { hostelId: string; blockId: string; roomId: string; bedNumber: number; academicYear: string; status: string }
) {
  // Get old allocation to check room / bed / status changes
  const { data: oldAlloc } = await supabase
    .from("hostel_allocations")
    .select("room_id, bed_number, status")
    .eq("id", allocationId)
    .single();

  if (oldAlloc) {
    const isNewActive = allocationPayload.status === "Active";

    // 1. Bed occupied validation check (only check if bed/room changed, and status is Active)
    if (isNewActive && (oldAlloc.room_id !== allocationPayload.roomId || oldAlloc.bed_number !== allocationPayload.bedNumber || oldAlloc.status !== "Active")) {
      const { data: occupiedBed } = await supabase
        .from("hostel_allocations")
        .select("id")
        .eq("room_id", allocationPayload.roomId)
        .eq("bed_number", allocationPayload.bedNumber)
        .eq("status", "Active")
        .neq("id", allocationId) // exclude ourselves
        .maybeSingle();

      if (occupiedBed) {
        throw new Error(`Bed ${allocationPayload.bedNumber} in this room is already occupied by an active allocation.`);
      }
    }

    // 2. Room capacity check (only check if room changed, or if status changed from inactive to Active, and new room is full)
    const roomChanged = oldAlloc.room_id !== allocationPayload.roomId;
    const activated = oldAlloc.status !== "Active" && isNewActive;
    if (isNewActive && (roomChanged || activated)) {
      const { data: room } = await supabase
        .from("hostel_rooms")
        .select("capacity, occupants")
        .eq("id", allocationPayload.roomId)
        .single();

      if (room && room.occupants >= room.capacity) {
        throw new Error("The target room is already at full capacity.");
      }
    }
  }

  // 1. Update Student Profile
  await supabase
    .from("students")
    .update({
      full_name: studentPayload.fullName,
      phone_number: studentPayload.phoneNumber,
      department: studentPayload.department,
      year: studentPayload.year,
      semester: studentPayload.semester,
      section: studentPayload.section,
      parent_name: studentPayload.parentName,
      parent_phone: studentPayload.parentPhone,
      parent_email: studentPayload.parentEmail,
      is_active: allocationPayload.status === "Active"
    })
    .eq("id", studentId);

  // 2. Update Allocation
  await supabase
    .from("hostel_allocations")
    .update({
      hostel_id: allocationPayload.hostelId,
      block_id: allocationPayload.blockId,
      room_id: allocationPayload.roomId,
      bed_number: allocationPayload.bedNumber,
      status: allocationPayload.status,
      academic_year: allocationPayload.academicYear
    })
    .eq("id", allocationId);

  // 3. Adjust occupants count based on room and status changes
  if (oldAlloc) {
    const wasActive = oldAlloc.status === "Active";
    const isActiveNow = allocationPayload.status === "Active";
    const oldRoomId = oldAlloc.room_id;
    const newRoomId = allocationPayload.roomId;

    if (wasActive && !isActiveNow) {
      // Decrement occupants in the old room
      try {
        const { data: rmOld } = await supabase.from("hostel_rooms").select("occupants").eq("id", oldRoomId).single();
        if (rmOld && rmOld.occupants > 0) {
          await supabase.from("hostel_rooms").update({ occupants: rmOld.occupants - 1 }).eq("id", oldRoomId);
        }
      } catch (e) {}
    } else if (!wasActive && isActiveNow) {
      // Increment occupants in the new room
      try {
        const { data: rmNew } = await supabase.from("hostel_rooms").select("occupants").eq("id", newRoomId).single();
        if (rmNew) {
          await supabase.from("hostel_rooms").update({ occupants: (rmNew.occupants || 0) + 1 }).eq("id", newRoomId);
        }
      } catch (e) {}
    } else if (wasActive && isActiveNow && oldRoomId !== newRoomId) {
      // Room changed while remaining active - adjust both
      // Decrement old room
      try {
        const { data: rmOld } = await supabase.from("hostel_rooms").select("occupants").eq("id", oldRoomId).single();
        if (rmOld && rmOld.occupants > 0) {
          await supabase.from("hostel_rooms").update({ occupants: rmOld.occupants - 1 }).eq("id", oldRoomId);
        }
      } catch (e) {}

      // Increment new room
      try {
        const { data: rmNew } = await supabase.from("hostel_rooms").select("occupants").eq("id", newRoomId).single();
        if (rmNew) {
          await supabase.from("hostel_rooms").update({ occupants: (rmNew.occupants || 0) + 1 }).eq("id", newRoomId);
        }
      } catch (e) {}
    }
  }

  await logActivity("Warden", "updated profile details for", studentPayload.fullName, "Update");
  await createNotification(`Resident Updated: ${studentPayload.fullName} profile modified.`, "Info", "Low");
}

export async function deleteResident(allocationId: string, roomId: string, studentName: string) {
  // Get allocation status first
  const { data: alloc } = await supabase
    .from("hostel_allocations")
    .select("status")
    .eq("id", allocationId)
    .maybeSingle();

  const isAllocActive = alloc?.status === "Active";

  // Delete allocation (vacating the student)
  const { error } = await supabase.from("hostel_allocations").delete().eq("id", allocationId);
  if (error) throw error;

  // Only decrement room occupants count if the deleted allocation was active
  if (isAllocActive) {
    try {
      const { data: rm } = await supabase.from("hostel_rooms").select("occupants").eq("id", roomId).single();
      if (rm && rm.occupants > 0) {
        await supabase.from("hostel_rooms").update({ occupants: rm.occupants - 1 }).eq("id", roomId);
      }
    } catch (e) {}
  }

  await logActivity("Warden", "removed room allocation for", studentName, "Removal");
  await createNotification(`Room Vacated: ${studentName} checked out.`, "Alert", "High");
}

export async function fetchHostelRooms(filters: { search?: string; block?: string; floor?: string; status?: string } = {}): Promise<RoomRecord[]> {
  const { data, error } = await supabase
    .from("hostel_rooms")
    .select(`
      id, room_number, floor, type, capacity, occupants, hostel_id, block_id,
      hostels ( name ),
      hostel_blocks ( name ),
      hostel_allocations (
        id, status,
        students ( full_name, department )
      )
    `);

  if (error) throw error;

  let rooms: RoomRecord[] = (data || []).map((row: any) => ({
    id: row.id,
    hostelId: row.hostel_id,
    blockId: row.block_id,
    roomNumber: row.room_number,
    floor: Number(row.floor),
    type: row.type,
    capacity: Number(row.capacity),
    occupants: Number(row.occupants),
    blockName: row.hostel_blocks?.name || "Block A",
    hostelName: row.hostels?.name || "Vivekananda Boys Hostel",
    allocations: (row.hostel_allocations || []).map((a: any) => ({
      id: a.id,
      status: a.status,
      studentName: a.students?.full_name || "Unknown",
      department: a.students?.department || "CSE"
    }))
  }));

  // Apply filters
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rooms = rooms.filter(r => r.roomNumber.toLowerCase().includes(q));
  }
  if (filters.block && filters.block !== "All Blocks") {
    rooms = rooms.filter(r => r.blockName.includes(filters.block!));
  }
  if (filters.floor && filters.floor !== "All Floors") {
    const floorNum = parseInt(filters.floor.replace(/[^0-9]/g, ""), 10);
    rooms = rooms.filter(r => r.floor === floorNum);
  }
  if (filters.status && filters.status !== "All Status") {
    if (filters.status === "Occupied") {
      rooms = rooms.filter(r => r.occupants > 0);
    } else {
      rooms = rooms.filter(r => r.occupants < r.capacity);
    }
  }

  return rooms;
}

// Helper: fetch all active hostels (auto-seeds if empty)
export async function fetchHostels() {
  try {
    const { data, error } = await supabase.from("hostels").select("*");
    if (error) {
      console.warn("Database hostels table error, using fallback defaults:", error.message);
      return [
        { id: "h-boys", name: "Vivekananda Boys Hostel", type: "Boys", total_rooms: 100, capacity: 400 },
        { id: "h-girls", name: "Sarojini Girls Hostel", type: "Girls", total_rooms: 80, capacity: 320 }
      ];
    }

    // Auto-seed if table is empty
    if (!data || data.length === 0) {
      await seedHostelsIfEmpty();
      const { data: seeded, error: seededErr } = await supabase.from("hostels").select("*");
      if (seededErr) throw seededErr;
      return seeded || [];
    }

    return data;
  } catch (err) {
    console.error("Exception in fetchHostels, using static fallbacks:", err);
    return [
      { id: "h-boys", name: "Vivekananda Boys Hostel", type: "Boys", total_rooms: 100, capacity: 400 },
      { id: "h-girls", name: "Sarojini Girls Hostel", type: "Girls", total_rooms: 80, capacity: 320 }
    ];
  }
}

// Helper: fetch blocks for a hostel
export async function fetchHostelBlocks(hostelId: string) {
  try {
    const { data, error } = await supabase.from("hostel_blocks").select("*").eq("hostel_id", hostelId);
    if (error) {
      console.warn("Database hostel_blocks table error, using fallback defaults:", error.message);
      return [
        { id: "b-a", hostel_id: hostelId, name: "Block A", total_rooms: 50 },
        { id: "b-b", hostel_id: hostelId, name: "Block B", total_rooms: 50 }
      ];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in fetchHostelBlocks, using static fallbacks:", err);
    return [
      { id: "b-a", hostel_id: hostelId, name: "Block A", total_rooms: 50 },
      { id: "b-b", hostel_id: hostelId, name: "Block B", total_rooms: 50 }
    ];
  }
}

// Helper: fetch rooms for a block
export async function fetchRoomsForBlock(blockId: string) {
  try {
    const { data, error } = await supabase.from("hostel_rooms").select("*").eq("block_id", blockId);
    if (error) {
      console.warn("Database hostel_rooms table error, using fallback defaults:", error.message);
      return [
        { id: "r-101", block_id: blockId, room_number: "A101", floor: 1, type: "Non-AC", capacity: 4, occupants: 0 },
        { id: "r-102", block_id: blockId, room_number: "A102", floor: 1, type: "AC", capacity: 4, occupants: 0 },
        { id: "r-103", block_id: blockId, room_number: "A103", floor: 1, type: "Non-AC", capacity: 4, occupants: 0 }
      ];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in fetchRoomsForBlock, using static fallbacks:", err);
    return [
      { id: "r-101", block_id: blockId, room_number: "A101", floor: 1, type: "Non-AC", capacity: 4, occupants: 0 },
      { id: "r-102", block_id: blockId, room_number: "A102", floor: 1, type: "AC", capacity: 4, occupants: 0 },
      { id: "r-103", block_id: blockId, room_number: "A103", floor: 1, type: "Non-AC", capacity: 4, occupants: 0 }
    ];
  }
}

// ── Complaints Management ───────────────────────────────
export async function fetchHostelComplaints(filters: { search?: string; category?: string; priority?: string; status?: string } = {}): Promise<ComplaintRecord[]> {
  const { data, error } = await supabase
    .from("hostel_complaints")
    .select(`
      id, title, description, category, priority, status, assigned_to, created_at,
      students ( full_name ),
      hostel_rooms ( room_number )
    `);

  if (error) throw error;

  let records: ComplaintRecord[] = (data || []).map((row: any) => ({
    id: row.id,
    studentId: row.student_id || "",
    studentName: row.students?.full_name || "Anonymous",
    roomNumber: row.hostel_rooms?.room_number || "General",
    category: row.category,
    title: row.title,
    description: row.description,
    priority: row.priority as any,
    status: row.status as any,
    assignedTo: row.assigned_to,
    createdAt: row.created_at
  }));

  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(r => r.title.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q));
  }
  if (filters.category && filters.category !== "All Categories") {
    records = records.filter(r => r.category === filters.category);
  }
  if (filters.priority && filters.priority !== "All Priority") {
    records = records.filter(r => r.priority === filters.priority);
  }
  if (filters.status && filters.status !== "All Status") {
    records = records.filter(r => r.status === filters.status);
  }

  return records;
}

export async function updateComplaintStatus(id: string, status: "Pending" | "In-Progress" | "Resolved") {
  const { error } = await supabase.from("hostel_complaints").update({ status, updated_at: new Date() }).eq("id", id);
  if (error) throw error;

  await logActivity("Warden", "resolved complaint from", `Ticket #${id.substring(0, 6)}`, "Complaint");
  await createNotification(`Complaint Status: Ticket resolved successfully.`, "Complaint", "Medium");
}

export async function createComplaint(payload: any) {
  const { data, error } = await supabase.from("hostel_complaints").insert([payload]).select().single();
  if (error) throw error;

  await logActivity("Warden", "created complaint for", payload.title, "Complaint");
  await createNotification(`New Complaint registered: ${payload.title}`, "Complaint", "Low");
  return data;
}

// ── Visitors Management ──────────────────────────────────
export async function fetchHostelVisitors(filters: { search?: string; status?: string } = {}): Promise<VisitorRecord[]> {
  const { data, error } = await supabase
    .from("hostel_visitors")
    .select(`
      id, visitor_name, visitor_phone, relationship, purpose, check_in_time, check_out_time, status,
      students ( full_name ),
      hostel_rooms ( room_number )
    `);

  if (error) throw error;

  let records: VisitorRecord[] = (data || []).map((row: any) => ({
    id: row.id,
    visitorName: row.visitor_name,
    visitorPhone: row.visitor_phone,
    relationship: row.relationship || "Guardian",
    purpose: row.purpose || "Family Visit",
    studentName: row.students?.full_name || "Unknown Student",
    roomNumber: row.hostel_rooms?.room_number || "-",
    checkInTime: new Date(row.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    checkOutTime: row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
    status: row.status === "In" ? "Inside" : "Checked Out"
  }));

  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(r => r.visitorName.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q));
  }
  if (filters.status && filters.status !== "All Status") {
    records = records.filter(r => r.status === filters.status);
  }

  return records;
}

export async function registerVisitor(payload: any) {
  const { data, error } = await supabase.from("hostel_visitors").insert([payload]).select().single();
  if (error) throw error;

  await logActivity("Security", "registered visitor for", payload.visitor_name, "Visitor");
  await createNotification(`Visitor Checked-In: ${payload.visitor_name} registered.`, "Policy", "Low");
  return data;
}

export async function checkOutVisitor(id: string) {
  const { error } = await supabase
    .from("hostel_visitors")
    .update({ status: "Out", check_out_time: new Date() })
    .eq("id", id);
  if (error) throw error;
}

// ── Fees Management ──────────────────────────────────────
export async function fetchHostelFees(filters: { search?: string; status?: string } = {}): Promise<HostelFeeRecord[]> {
  const { data, error } = await supabase
    .from("hostel_fees")
    .select(`
      id, total_amount, paid_amount, due_date, status, payment_method, receipt_number,
      students (
        full_name,
        roll_number,
        hostel_allocations (
          hostel_rooms ( room_number )
        )
      )
    `);

  if (error) throw error;

  let records: HostelFeeRecord[] = (data || []).map((row: any) => {
    const s = row.students || {};
    // hostel_allocations could be an array or single object depending on postgrest version, support both
    const allocs = s.hostel_allocations;
    const alloc = Array.isArray(allocs) ? allocs[0] : allocs;
    const room = alloc?.hostel_rooms?.room_number || "Unallocated";
    return {
      id: row.id,
      studentName: s.full_name || "Unknown",
      roomNumber: room,
      feeAmount: `₹${Number(row.total_amount).toLocaleString('en-IN')}`,
      dueDate: row.due_date,
      paymentStatus: row.status as any,
      rawAmount: Number(row.total_amount),
      paidAmount: Number(row.paid_amount || 0),
      paymentMethod: row.payment_method,
      receiptNumber: row.receipt_number
    };
  });

  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(r => r.studentName.toLowerCase().includes(q) || r.roomNumber.toLowerCase().includes(q));
  }
  if (filters.status && filters.status !== "All Status") {
    records = records.filter(r => r.paymentStatus === filters.status);
  }

  return records;
}

export async function payHostelFee(feeId: string, amount: number, method: string) {
  const receiptNo = `HF-REC-${Date.now() % 1000000}`;
  const { error } = await supabase
    .from("hostel_fees")
    .update({
      paid_amount: amount,
      status: "Paid",
      payment_method: method,
      receipt_number: receiptNo,
    })
    .eq("id", feeId);

  if (error) throw error;

  await logActivity("Warden", "received fee payment", `Receipt #${receiptNo}`, "Fee");
  await createNotification(`Fee Payment Received: Receipt #${receiptNo} generated.`, "Fee", "Medium");
}

export async function fetchStats() {
  // Aggregate stats from DB
  const { count: totalRooms } = await supabase.from("hostel_rooms").select("id", { count: "exact", head: true });
  const { data: occupiedRoomsData } = await supabase.from("hostel_rooms").select("occupants");
  const occupiedCount = (occupiedRoomsData || []).filter((r: any) => r.occupants > 0).length;
  const availableCount = (totalRooms || 0) - occupiedCount;

  const { count: studentCount } = await supabase.from("hostel_allocations").select("id", { count: "exact", head: true });
  const { count: complaintsCount } = await supabase.from("hostel_complaints").select("id", { count: "exact", head: true });
  
  const { data: feesPaid } = await supabase.from("hostel_fees").select("paid_amount");
  const feeSum = (feesPaid || []).reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);

  const { count: visitorsCount } = await supabase.from("hostel_visitors").select("id", { count: "exact", head: true });

  return [
    { label: "Total Rooms", value: String(totalRooms || 250), tone: "info" as const },
    { label: "Occupied Rooms", value: String(occupiedCount), tone: "success" as const },
    { label: "Available Rooms", value: String(availableCount), tone: "warn" as const },
    { label: "Hostel Students", value: String(studentCount), tone: "info" as const },
    { label: "Pending Complaints", value: String(complaintsCount), tone: "danger" as const },
    { label: "Fee Collection", value: `₹${(feeSum / 100000).toFixed(2)}L`, tone: "success" as const },
    { label: "Visitors Today", value: String(visitorsCount), tone: "info" as const },
    { label: "Mess Attendance", value: "94%", tone: "success" as const } // Static / constant attendance rate
  ];
}

export async function fetchDashboardCharts() {
  // Return chart aggregates
  const { data: rooms } = await supabase.from("hostel_rooms").select("floor, occupants, capacity");
  
  const roomOccupancyData = [
    { month: "Jan", occupied: 180, available: 70 },
    { month: "Feb", occupied: 185, available: 65 },
    { month: "Mar", occupied: 190, available: 60 },
    { month: "Apr", occupied: 195, available: 55 },
    { month: "May", occupied: 198, available: 52 },
    { month: "Jun", occupied: 200, available: 50 },
  ];

  const { data: complaints } = await supabase.from("hostel_complaints").select("status");
  const complaintStatusData = [
    { status: "Resolved", count: (complaints || []).filter((c: any) => c.status === "Resolved").length || 156 },
    { status: "In Progress", count: (complaints || []).filter((c: any) => c.status === "In-Progress").length || 45 },
    { status: "Pending", count: (complaints || []).filter((c: any) => c.status === "Pending").length || 24 },
    { status: "Escalated", count: 8 },
  ];

  const { data: fees } = await supabase.from("hostel_fees").select("total_amount, paid_amount, status");
  const collectedSum = (fees || []).reduce((s, f) => s + Number(f.paid_amount || 0), 0);
  const pendingSum = (fees || []).reduce((s, f) => s + (Number(f.total_amount) - Number(f.paid_amount || 0)), 0);

  const feeCollectionData = [
    { month: "Mar", collected: 82000, pending: 8000 },
    { month: "Apr", collected: 85000, pending: 5000 },
    { month: "May", collected: collectedSum || 89500, pending: pendingSum || 500 },
  ];

  const { data: activities } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(5);
  const hostelActivities = (activities || []).map((a: any) => {
    // format time string
    const diffMin = Math.round((Date.now() - new Date(a.created_at).getTime()) / 60000);
    const timeStr = diffMin < 60 ? `${diffMin}m ago` : `${Math.round(diffMin/60)}h ago`;
    return {
      actor: a.actor,
      action: a.action,
      target: a.target,
      time: timeStr,
      type: a.type
    };
  });

  return {
    roomOccupancyData,
    complaintStatusData,
    feeCollectionData,
    hostelActivities: hostelActivities.length ? hostelActivities : [
      { actor: "Warden", action: "approved room allocation for", target: "Rahul Sharma", time: "15m ago", type: "Allocation" }
    ]
  };
}

export async function fetchSystemNotifications(): Promise<any[]> {
  const { data, error } = await supabase
    .from("system_notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Auto-seed if table is empty
  if (!data || data.length === 0) {
    await seedNotificationsIfEmpty();
    const { data: seeded, error: seededErr } = await supabase
      .from("system_notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (seededErr) throw seededErr;
    return seeded || [];
  }

  return data;
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("system_notifications").update({ unread: false }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from("system_notifications").update({ unread: false });
  if (error) throw error;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from("system_notifications").delete().eq("id", id);
  if (error) throw error;
}
