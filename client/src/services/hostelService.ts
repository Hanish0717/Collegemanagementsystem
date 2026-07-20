import { supabase } from '@/lib/supabaseClient';
import api from '@/lib/api';
import { seedHostelsIfEmpty, seedNotificationsIfEmpty } from '@/services/seedService';

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
  status: 'Active' | 'Vacated' | 'Suspended';
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
  type: string; // Legacy: ac_type
  roomType: string; // Single | Double | Triple | Dormitory
  acType: string; // AC | Non-AC
  roomStatus: string; // Vacant | Partially Occupied | Fully Occupied | Maintenance
  capacity: number;
  occupants: number;
  blockName: string;
  hostelName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  allocations?: Array<{
    id: string;
    status: string;
    bedNumber: number;
    academicYear: string;
    allocationDate?: string;
    checkInDate?: string;
    checkOutDate?: string;
    studentId?: string;
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
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In-Progress' | 'Resolved';
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
  status: 'Inside' | 'Checked Out';
  rawCheckInTime?: string;
}

export interface HostelFeeRecord {
  id: string;
  studentName: string;
  roomNumber: string;
  feeAmount: string;
  dueDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  rawAmount: number;
  paidAmount: number;
  pendingAmount?: number;
  academicYear?: string;
  hostelBlock?: string;
  registrationNumber?: string;
  roomType?: string;
  acType?: string;
  feeCategory?: string;
  paymentDate?: string | null;
  paymentMethod: string | null;
  receiptNumber: string | null;
}

export interface HostelFeeFilters {
  search?: string;
  status?: string;
  academicYear?: string;
  hostelBlock?: string;
  roomNumber?: string;
  registrationNumber?: string;
  startDate?: string;
  endDate?: string;
  timeRange?: string;
}

export interface FeeStructureRecord {
  id: string;
  feeStructureId?: string;
  hostelBlock: string;
  academicYear: string;
  feeCategory: string;
  roomType: string;
  acType: string;
  monthlyHostelFee: number;
  messFee: number;
  electricityFee: number;
  maintenanceFee: number;
  securityDeposit: number;
  lateFee: number;
  otherCharges: number;
  totalFee: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'Active' | 'Inactive';
}

// Helper to log actions to database
export async function logActivity(actor: string, action: string, target: string, type: string) {
  try {
    await supabase.from('activity_logs').insert([
      {
        actor,
        action,
        target,
        type,
      },
    ]);
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

// Helper to create notifications
export async function createNotification(title: string, type: string, urgency: string = 'Medium') {
  try {
    await supabase.from('system_notifications').insert([
      {
        id: `HN-${Date.now() % 1000000}`,
        title,
        type,
        time: 'Just now',
        unread: true,
      },
    ]);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

const formatCurrencyINR = (amount: number) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const normalizeFeeStatus = (
  status?: string | null,
  dueDate?: string | null,
  pendingAmount?: number,
) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid') return 'Paid';
  if (
    normalized === 'partially paid' ||
    normalized === 'partially-paid' ||
    normalized === 'partial'
  )
    return 'Partially Paid';
  if (normalized === 'overdue') return 'Overdue';
  if (normalized === 'pending' || normalized === 'unpaid') {
    if (dueDate && pendingAmount && new Date(dueDate).getTime() < Date.now()) return 'Overdue';
    return 'Pending';
  }
  if (typeof pendingAmount === 'number' && pendingAmount <= 0) return 'Paid';
  if (dueDate && pendingAmount && pendingAmount > 0 && new Date(dueDate).getTime() < Date.now())
    return 'Overdue';
  return 'Pending';
};

const getFeeReferenceText = (row: any) => {
  const studentName = row.student_name || row.resident_name || row.students?.full_name || 'Unknown';
  const registrationNumber = row.registration_number || row.students?.roll_number || '';
  const hostelBlock = row.hostel_blocks?.name || row.block_name || row.hostel_block || '';
  const roomNumber =
    row.room_number || row.hostel_rooms?.room_number || row.rooms?.room_number || 'Unallocated';

  return {
    studentName,
    registrationNumber,
    hostelBlock,
    roomNumber,
  };
};

const getFeeTiming = (row: any) => {
  const dueDate =
    row.due_date ||
    row.dueDate ||
    row.payment_due_date ||
    row.effective_to ||
    row.created_at ||
    new Date().toISOString();
  const paymentDate = row.payment_date || row.paymentDate || row.paid_date || null;
  return { dueDate, paymentDate };
};

const autoAssignResidentFee = async (
  studentId: string,
  studentPayload: any,
  allocationPayload: {
    hostelId: string;
    blockId: string;
    roomId: string;
    bedNumber: number;
    academicYear: string;
  },
) => {
  const { data: room, error: roomError } = await supabase
    .from('hostel_rooms')
    .select('id, room_number, type, room_type, ac_type')
    .eq('id', allocationPayload.roomId)
    .maybeSingle();
  if (roomError) throw roomError;

  const residentCategory =
    studentPayload.residentCategory ||
    studentPayload.category ||
    studentPayload.department ||
    'General';
  const roomType = room?.room_type || room?.type || 'Standard';
  const acType =
    room?.ac_type || (String(roomType).toLowerCase().includes('non') ? 'Non-AC' : 'AC');

  const { data: feeStructure, error: structureError } = await supabase
    .from('fee_structures')
    .select('*')
    .eq('hostel_block_id', allocationPayload.blockId)
    .eq('academic_year', allocationPayload.academicYear)
    .eq('room_type', roomType)
    .eq('ac_type', acType)
    .eq('resident_category', residentCategory)
    .eq('status', 'Active')
    .maybeSingle();
  if (structureError) throw structureError;

  if (!feeStructure) {
    return null;
  }

  const { data: existingFee } = await supabase
    .from('hostel_fees')
    .select('id')
    .eq('student_id', studentId)
    .eq('academic_year', allocationPayload.academicYear)
    .eq('fee_structure_id', feeStructure.id)
    .maybeSingle();

  if (existingFee) {
    return existingFee;
  }

  const totalFee = Number(feeStructure.total_fee || 0);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 10);

  const { data: insertedFee, error: insertError } = await supabase
    .from('hostel_fees')
    .insert([
      {
        student_id: studentId,
        hostel_id: allocationPayload.hostelId,
        block_id: allocationPayload.blockId,
        room_id: allocationPayload.roomId,
        fee_structure_id: feeStructure.id,
        resident_category: residentCategory,
        academic_year: allocationPayload.academicYear,
        resident_name: studentPayload.fullName,
        registration_number: studentPayload.rollNumber,
        room_number: room?.room_number,
        room_type: roomType,
        ac_type: acType,
        fee_type: feeStructure.fee_category,
        monthly_hostel_fee: Number(feeStructure.monthly_hostel_fee || 0),
        mess_fee: Number(feeStructure.mess_fee || 0),
        electricity_fee: Number(feeStructure.electricity_fee || 0),
        maintenance_fee: Number(feeStructure.maintenance_fee || 0),
        security_deposit: Number(feeStructure.security_deposit || 0),
        late_fee: Number(feeStructure.late_fee || 0),
        other_charges: Number(feeStructure.other_charges || 0),
        total_fee: totalFee,
        total_amount: totalFee,
        amount_paid: 0,
        paid_amount: 0,
        pending_amount: totalFee,
        due_date: dueDate.toISOString().split('T')[0],
        payment_status: 'Pending',
        status: 'Pending',
        effective_from: feeStructure.effective_from,
        effective_to: feeStructure.effective_to,
      },
    ])
    .select()
    .single();
  if (insertError) throw insertError;

  await createNotification(
    `Fee Assigned: ${studentPayload.fullName} now has an active hostel fee record.`,
    'Fee',
    'Medium',
  );
  return insertedFee;
};

// ── Residents CRUD ──────────────────────────────────────
export async function fetchResidents(
  filters: { search?: string; department?: string; status?: string; floor?: string } = {},
): Promise<ResidentRecord[]> {
  const response = await api.get('/api/hostel/allocations', { params: filters });
  const rawData = response.data.data || [];

  let residents: ResidentRecord[] = rawData.map((row: any) => {
    const s = row.students || {};
    const r = row.hostel_rooms || {};
    return {
      id: row.id,
      studentId: row.studentId || row.student_id,
      fullName: s.full_name || 'Unknown',
      rollNumber: s.roll_number || '',
      admissionNumber: s.admission_number || '',
      email: s.email || '',
      phoneNumber: s.phone_number || null,
      gender: s.gender || null,
      dateOfBirth: s.date_of_birth || '',
      department: s.department || 'CSE',
      year: Number(s.year || 1),
      semester: Number(s.semester || 1),
      section: s.section || 'A',
      parentName: s.parent_name || '',
      parentPhone: s.parent_phone || '',
      parentEmail: s.parent_email || '',
      cgpa: s.cgpa ? String(s.cgpa) : '',
      roomNumber: r.room_number || 'Unallocated',
      floor: Number(r.floor || 1),
      roomType: r.room_type || 'Non-AC',
      status: row.status as any,
      emergencyContact: s.parent_phone || '',
      attendance: s.attendance_percentage ? `${Math.round(s.attendance_percentage)}%` : '100%',
      attendancePercentage: s.attendance_percentage ? String(s.attendance_percentage) : '100',
      profileImage: s.profile_image || null,
      hostelId: row.hostelId || row.hostel_id || '',
      blockId: row.blockId || row.block_id || '',
      roomId: row.roomId || row.room_id || '',
      bedNumber: Number(row.bedNumber || row.bed_number || 1),
      academicYear: row.academicYear || row.academic_year || '2026-2027',
    };
  });

  // Apply filters in memory for complex join criteria
  if (filters.search) {
    const searchVal = filters.search.toLowerCase();
    residents = residents.filter(
      (r) =>
        r.fullName.toLowerCase().includes(searchVal) ||
        r.rollNumber.toLowerCase().includes(searchVal) ||
        r.roomNumber.toLowerCase().includes(searchVal),
    );
  }
  if (filters.department && filters.department !== 'All Departments') {
    residents = residents.filter((r) => r.department === filters.department);
  }
  if (filters.status && filters.status !== 'All Status') {
    residents = residents.filter((r) => r.status === filters.status);
  }
  if (filters.floor && filters.floor !== 'All Floors') {
    const floorNum = parseInt(filters.floor.replace(/[^0-9]/g, ''), 10);
    residents = residents.filter((r) => r.floor === floorNum);
  }

  return residents;
}

export async function createResident(
  studentPayload: any,
  allocationPayload: {
    hostelId: string;
    blockId: string;
    roomId: string;
    bedNumber: number;
    academicYear: string;
  },
) {
  const response = await api.post('/api/hostel/allocations/resident', {
    studentPayload,
    allocationPayload,
  });
  await logActivity('Warden', 'allocated room for', studentPayload.fullName, 'Allocation');
  await createNotification(
    `New Room Allocation: ${studentPayload.fullName} assigned to room.`,
    'Maintenance',
    'Medium',
  );
  return response.data.data;
}

export async function updateResident(
  allocationId: string,
  studentId: string,
  studentPayload: any,
  allocationPayload: {
    hostelId: string;
    blockId: string;
    roomId: string;
    bedNumber: number;
    academicYear: string;
    status: string;
  },
) {
  const response = await api.put(`/api/hostel/allocations/resident/${allocationId}`, {
    studentId,
    studentPayload,
    allocationPayload,
  });
  await logActivity('Warden', 'updated profile details for', studentPayload.fullName, 'Update');
  await createNotification(
    `Resident Updated: ${studentPayload.fullName} profile modified.`,
    'Info',
    'Low',
  );
  return response.data.data;
}

export async function deleteResident(allocationId: string, roomId: string, studentName: string) {
  const response = await api.delete(`/api/hostel/allocations/${allocationId}`);
  await logActivity('Warden', 'removed room allocation for', studentName, 'Removal');
  await createNotification(`Room Vacated: ${studentName} checked out.`, 'Alert', 'High');
  return response.data;
}

export async function fetchHostelRooms(
  filters: {
    search?: string;
    block?: string;
    floor?: string;
    status?: string;
    roomType?: string;
    acType?: string;
  } = {},
): Promise<RoomRecord[]> {
  const response = await api.get('/api/hostel/rooms', { params: filters });
  const rawRooms = response.data.rooms || [];
  const rawAllocations = await fetchResidents();

  const roomAllocMap = new Map<string, any[]>();
  rawAllocations.forEach((alloc) => {
    if (alloc.roomId) {
      if (!roomAllocMap.has(alloc.roomId)) {
        roomAllocMap.set(alloc.roomId, []);
      }
      roomAllocMap.get(alloc.roomId)!.push({
        id: alloc.id,
        status: alloc.status,
        bedNumber: alloc.bedNumber,
        academicYear: alloc.academicYear,
        studentId: alloc.studentId,
        studentName: alloc.fullName,
        department: alloc.department,
      });
    }
  });

  let rooms: RoomRecord[] = rawRooms.map((row: any) => {
    const occupants = Number(row.occupants || 0);
    const capacity = Number(row.capacity || 4);

    // Auto status logic
    let derivedStatus = row.room_status || 'Vacant';
    if (derivedStatus !== 'Maintenance') {
      if (occupants === 0) {
        derivedStatus = 'Vacant';
      } else if (occupants >= capacity) {
        derivedStatus = 'Fully Occupied';
      } else {
        derivedStatus = 'Partially Occupied';
      }
    }

    return {
      id: row.id,
      hostelId: row.hostel_id,
      blockId: row.block_id,
      roomNumber: row.room_number,
      floor: Number(row.floor),
      type: row.ac_type || row.type || 'Non-AC',
      capacity: capacity,
      occupants: occupants,
      blockName: row.hostel_blocks?.name || 'Block A',
      hostelName: row.hostels?.name || 'Vivekananda Boys Hostel',
      roomType: row.room_type || 'Double',
      acType: row.ac_type || 'Non-AC',
      roomStatus: derivedStatus,
      description: row.description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      allocations: roomAllocMap.get(row.id) || [],
    };
  });

  // Apply filters
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rooms = rooms.filter((r) => r.roomNumber.toLowerCase().includes(q));
  }
  if (filters.block && filters.block !== 'All Blocks') {
    rooms = rooms.filter(
      (r) => r.blockName.includes(filters.block!) || r.blockId === filters.block,
    );
  }
  if (filters.floor && filters.floor !== 'All Floors') {
    const floorNum = parseInt(filters.floor.replace(/[^0-9]/g, ''), 10);
    rooms = rooms.filter((r) => r.floor === floorNum);
  }
  if (filters.status && filters.status !== 'All Status' && filters.status !== 'All') {
    const s = filters.status;
    if (s === 'Occupied') {
      rooms = rooms.filter((r) => r.occupants > 0);
    } else if (s === 'Available') {
      rooms = rooms.filter((r) => r.occupants < r.capacity && r.roomStatus !== 'Maintenance');
    } else if (s === 'Vacant') {
      rooms = rooms.filter((r) => r.roomStatus === 'Vacant' || r.occupants === 0);
    } else if (s === 'Partially Occupied') {
      rooms = rooms.filter((r) => r.roomStatus === 'Partially Occupied');
    } else if (s === 'Fully Occupied') {
      rooms = rooms.filter((r) => r.roomStatus === 'Fully Occupied' || r.occupants >= r.capacity);
    } else if (s === 'Maintenance') {
      rooms = rooms.filter((r) => r.roomStatus === 'Maintenance');
    }
  }
  if (filters.roomType && filters.roomType !== 'All' && filters.roomType !== 'All Types') {
    rooms = rooms.filter((r) => r.roomType === filters.roomType);
  }
  if (filters.acType && filters.acType !== 'All' && filters.acType !== 'All Types') {
    rooms = rooms.filter((r) => r.acType === filters.acType);
  }

  return rooms;
}

// Helper: fetch all active hostels (auto-seeds if empty)
export async function fetchHostels() {
  try {
    const response = await api.get('/api/hostel/hostels');
    return response.data.hostels || [];
  } catch (err) {
    console.error('Exception in fetchHostels, using static fallbacks:', err);
    return [
      {
        id: 'h-boys',
        name: 'Vivekananda Boys Hostel',
        type: 'Boys',
        total_rooms: 100,
        capacity: 400,
      },
      {
        id: 'h-girls',
        name: 'Sarojini Girls Hostel',
        type: 'Girls',
        total_rooms: 80,
        capacity: 320,
      },
    ];
  }
}

// Helper: fetch blocks for a hostel
export async function fetchHostelBlocks(hostelId: string) {
  try {
    const response = await api.get('/api/hostel/blocks', { params: { hostelId } });
    return response.data.blocks || [];
  } catch (err) {
    console.error('Exception in fetchHostelBlocks, using static fallbacks:', err);
    return [
      { id: 'b-a', hostel_id: hostelId, name: 'Block A', total_rooms: 50 },
      { id: 'b-b', hostel_id: hostelId, name: 'Block B', total_rooms: 50 },
    ];
  }
}

// Helper: fetch rooms for a block
export async function fetchRoomsForBlock(blockId: string) {
  try {
    const response = await api.get('/api/hostel/rooms', { params: { blockId } });
    return response.data.rooms || [];
  } catch (err) {
    console.error('Exception in fetchRoomsForBlock, using static fallbacks:', err);
    return [
      {
        id: 'r-101',
        block_id: blockId,
        room_number: 'A101',
        floor: 1,
        type: 'Non-AC',
        capacity: 4,
        occupants: 0,
      },
      {
        id: 'r-102',
        block_id: blockId,
        room_number: 'A102',
        floor: 1,
        type: 'AC',
        capacity: 4,
        occupants: 0,
      },
      {
        id: 'r-103',
        block_id: blockId,
        room_number: 'A103',
        floor: 1,
        type: 'Non-AC',
        capacity: 4,
        occupants: 0,
      },
    ];
  }
}

export async function fetchHostelComplaints(
  filters: { search?: string; category?: string; priority?: string; status?: string } = {},
): Promise<ComplaintRecord[]> {
  const response = await api.get('/api/hostel/complaints', { params: filters });
  return response.data.data;
}

export async function updateComplaintStatus(
  id: string,
  status: 'Pending' | 'In-Progress' | 'Resolved',
) {
  const response = await api.put(`/api/hostel/complaints/${id}/status`, { status });
  await logActivity(
    'Warden',
    'resolved complaint from',
    `Ticket #${id.substring(0, 6)}`,
    'Complaint',
  );
  await createNotification(
    `Complaint Status: Ticket resolved successfully.`,
    'Complaint',
    'Medium',
  );
  return response.data;
}

export async function createComplaint(payload: any) {
  const response = await api.post('/api/hostel/complaints', payload);
  await logActivity('Warden', 'created complaint for', payload.title, 'Complaint');
  await createNotification(`New Complaint registered: ${payload.title}`, 'Complaint', 'Low');
  return response.data.data;
}

// ── Visitors Management ──────────────────────────────────
// ── Visitors Management ──────────────────────────────────
export async function fetchHostelVisitors(
  filters: { search?: string; status?: string } = {},
): Promise<VisitorRecord[]> {
  const response = await api.get('/api/hostel/visitors', { params: filters });
  const rawData = response.data.data || [];

  const records: VisitorRecord[] = rawData.map((row: any) => ({
    id: row.id,
    visitorName: row.visitorName || row.visitor_name,
    visitorPhone: row.visitorPhone || row.visitor_phone,
    relationship: row.relationship || 'Guardian',
    purpose: row.purpose || 'Family Visit',
    studentName: row.studentName || 'Unknown Student',
    roomNumber: row.roomNumber || '-',
    checkInTime: new Date(row.checkInTime || row.check_in_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    checkOutTime:
      row.checkOutTime || row.check_out_time
        ? new Date(row.checkOutTime || row.check_out_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : null,
    status: row.status === 'Inside' || row.status === 'In' ? 'Inside' : 'Checked Out',
    rawCheckInTime: row.checkInTime || row.check_in_time,
  }));

  return records;
}

export async function registerVisitor(payload: any) {
  const response = await api.post('/api/hostel/visitors', payload);
  await logActivity('Security', 'registered visitor for', payload.visitor_name, 'Visitor');
  await createNotification(
    `Visitor Checked-In: ${payload.visitor_name} registered.`,
    'Policy',
    'Low',
  );
  return response.data.data;
}

export async function checkOutVisitor(id: string) {
  const response = await api.put(`/api/hostel/visitors/${id}/checkout`);
  return response.data;
}

// ── Fees Management ──────────────────────────────────────
export async function fetchHostelFees(filters: HostelFeeFilters = {}): Promise<HostelFeeRecord[]> {
  const response = await api.get('/api/hostel/fees', { params: filters });
  const rawData = response.data.data || [];

  let records: HostelFeeRecord[] = rawData.map((row: any) => {
    const totalAmount = Number(row.totalFee ?? row.total_fee ?? 0);
    const paidAmount = Number(row.paidAmount ?? row.amount_paid ?? 0);
    const pendingAmount = Number(row.pendingAmount ?? Math.max(0, totalAmount - paidAmount));

    return {
      id: row.id,
      studentName: row.residentName || row.studentName || 'Unknown',
      roomNumber: row.roomNumber || '-',
      feeAmount: formatCurrencyINR(totalAmount),
      dueDate: row.dueDate || row.due_date,
      paymentStatus: row.paymentStatus || row.status,
      rawAmount: totalAmount,
      paidAmount,
      pendingAmount,
      academicYear: row.academicYear || row.academic_year || '',
      hostelBlock: row.hostelBlock || '',
      registrationNumber: row.registrationNumber || '',
      roomType: row.roomType || '',
      acType: row.acType || '',
      feeCategory: row.feeCategory || row.fee_category || '',
      paymentDate: row.paymentDate || row.payment_date || null,
      paymentMethod: row.paymentMethod || row.payment_method || null,
      receiptNumber: row.receiptNumber || row.receipt_number || null,
    };
  });

  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter((r) =>
      [r.studentName, r.roomNumber, r.registrationNumber || '', r.hostelBlock || '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }
  if (filters.status && filters.status !== 'All Status') {
    records = records.filter((r) => r.paymentStatus === filters.status);
  }
  if (filters.academicYear && filters.academicYear !== 'All Academic Years') {
    records = records.filter((r) => r.academicYear === filters.academicYear);
  }
  if (filters.hostelBlock && filters.hostelBlock !== 'All Blocks') {
    records = records.filter((r) => r.hostelBlock === filters.hostelBlock);
  }
  if (filters.roomNumber) {
    records = records.filter((r) =>
      r.roomNumber.toLowerCase().includes(filters.roomNumber!.toLowerCase()),
    );
  }
  if (filters.registrationNumber) {
    records = records.filter((r) =>
      (r.registrationNumber || '')
        .toLowerCase()
        .includes(filters.registrationNumber!.toLowerCase()),
    );
  }
  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    records = records.filter((r) => new Date(r.dueDate).getTime() >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    records = records.filter((r) => new Date(r.dueDate).getTime() <= end);
  }
  if (filters.timeRange === 'This Month') {
    const now = new Date();
    records = records.filter((r) => {
      const d = new Date(r.dueDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (filters.timeRange === 'Last Month') {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    records = records.filter((r) => {
      const d = new Date(r.dueDate);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    });
  } else if (filters.timeRange === 'This Semester') {
    const now = new Date();
    records = records.filter((r) => {
      const d = new Date(r.dueDate);
      return Math.abs(now.getMonth() - d.getMonth()) <= 5 && d.getFullYear() === now.getFullYear();
    });
  }

  records.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  return records;
}

export async function fetchFeePayments(
  feeId: string,
  opts: {
    page?: number;
    limit?: number;
    paymentMethod?: string;
    transactionId?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
  } = {},
) {
  const params = new URLSearchParams();
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.paymentMethod) params.set('paymentMethod', opts.paymentMethod);
  if (opts.transactionId) params.set('transactionId', opts.transactionId);
  if (opts.fromDate) params.set('fromDate', opts.fromDate);
  if (opts.toDate) params.set('toDate', opts.toDate);
  if (opts.search) params.set('search', opts.search);

  const resp = await fetch(`/api/hostel/fees/${feeId}/payments?${params.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.message || 'Failed to fetch payment history');
  }
  const json = await resp.json();
  return {
    payments: (json.data || []).map((p: any) => ({
      id: p.id,
      feeId: p.fee_id,
      amountPaid: p.amount_paid || p.amount || 0,
      paymentDate: p.payment_date || p.paymentDate,
      paymentMethod: p.payment_method || p.paymentMethod,
      transactionId: p.transaction_id || p.transactionId,
      receiptNumber: p.receipt_number || p.receiptNumber,
      paymentStatus: p.payment_status || p.paymentStatus,
      notes: p.notes || null,
    })),
    meta: json.meta || { total: 0, page: 1, limit: 20 },
  };
}

export async function payHostelFee(
  feeId: string,
  amount: number,
  method: string,
  transactionId?: string,
) {
  if (Number(amount) <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  const txnId = transactionId?.trim();

  try {
    const resp = await api.post(`/api/hostel/fees/${feeId}/pay`, {
      amount: Number(amount),
      paymentMethod: method,
      transactionId: txnId,
    });

    const updated = resp?.data?.data;

    // Client-side activity log; server also pushes system notifications
    await logActivity(
      'Warden',
      'received fee payment',
      `Receipt #${updated?.receiptNumber || 'N/A'}`,
      'Fee',
    );

    return updated;
  } catch (err: any) {
    if (err.response?.status === 409) {
      throw new Error(err.response.data?.message || 'Duplicate transaction ID detected.');
    }
    // Axios error or network error
    throw err;
  }
}

export async function fetchStats() {
  // Aggregate stats from DB
  // Prefer counting explicit `hostel_rooms` rows when available, but fall back to
  // summing `total_rooms` from `hostel_blocks` (some setups store rooms only on blocks).
  const { count: totalRoomsCount } = await supabase
    .from('hostel_rooms')
    .select('id', { count: 'exact', head: true });

  const { data: blocksData } = await supabase
    .from('hostel_blocks')
    .select('total_rooms, ac_rooms, non_ac_rooms, capacity, occupants');

  const totalRoomsFromBlocks = (blocksData || []).reduce(
    (sum: number, b: any) => sum + Number(b.total_rooms || 0),
    0,
  );

  const totalRooms = totalRoomsCount || 0 || totalRoomsFromBlocks || 0;

  // Occupied count: prefer `hostel_allocations` count (active allocations), fall back to block occupants
  const { count: allocationCount } = await supabase
    .from('hostel_allocations')
    .select('id', { count: 'exact', head: true });
  const occupiedFromBlocks = (blocksData || []).reduce(
    (sum: number, b: any) => sum + Number(b.occupants || 0),
    0,
  );
  const occupiedCount = allocationCount || 0 || occupiedFromBlocks || 0;

  const availableCount = Math.max(0, totalRooms - occupiedCount);

  const { count: studentCount } = await supabase
    .from('hostel_allocations')
    .select('id', { count: 'exact', head: true });
  const { count: complaintsCount } = await supabase
    .from('hostel_complaints')
    .select('id', { count: 'exact', head: true });

  const { data: feesPaid } = await supabase
    .from('hostel_fees')
    .select(
      'total_fee, total_amount, amount_paid, paid_amount, pending_amount, payment_status, status, due_date, academic_year, hostel_blocks(name)',
    );

  const feeSum = (feesPaid || []).reduce(
    (sum, f: any) => sum + Number(f.amount_paid ?? f.paid_amount ?? 0),
    0,
  );
  const pendingSum = (feesPaid || []).reduce((sum, f: any) => {
    const total = Number(f.total_fee ?? f.total_amount ?? 0);
    const paid = Number(f.amount_paid ?? f.paid_amount ?? 0);
    return sum + Math.max(0, total - paid);
  }, 0);
  const overdueCount = (feesPaid || []).filter(
    (f: any) =>
      normalizeFeeStatus(
        f.payment_status ?? f.status,
        f.due_date,
        Number(f.pending_amount ?? 0),
      ) === 'Overdue',
  ).length;
  const collectionRate =
    (feesPaid || []).length > 0 ? Math.round((feeSum / (feeSum + pendingSum || 1)) * 100) : 0;

  const { count: visitorsCount } = await supabase
    .from('hostel_visitors')
    .select('id', { count: 'exact', head: true });

  return [
    {
      label: 'Total Rooms',
      value: String(totalRoomsCount === null && !blocksData ? 250 : totalRooms),
      tone: 'info' as const,
    },
    { label: 'Occupied Rooms', value: String(occupiedCount), tone: 'success' as const },
    { label: 'Available Rooms', value: String(availableCount), tone: 'warn' as const },
    { label: 'Hostel Students', value: String(studentCount), tone: 'info' as const },
    { label: 'Pending Complaints', value: String(complaintsCount), tone: 'danger' as const },
    { label: 'Fee Collection', value: formatCurrencyINR(feeSum), tone: 'success' as const },
    { label: 'Pending Fees', value: formatCurrencyINR(pendingSum), tone: 'warn' as const },
    { label: 'Overdue Payments', value: String(overdueCount), tone: 'danger' as const },
    { label: 'Collection Rate', value: `${collectionRate}%`, tone: 'success' as const },
    { label: 'Visitors Today', value: String(visitorsCount), tone: 'info' as const },
    { label: 'Mess Attendance', value: '94%', tone: 'success' as const }, // Static / constant attendance rate
  ];
}

export async function fetchDashboardCharts() {
  // Return chart aggregates
  const { data: rooms } = await supabase
    .from('hostel_rooms')
    .select('floor, occupants, capacity, created_at');

  const monthBuckets = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const roomOccupancyData = monthBuckets.slice(0, 6).map((month, idx) => {
    const currentRooms = rooms || [];
    const occupied = currentRooms.reduce((sum, room: any) => sum + Number(room.occupants || 0), 0);
    const available = currentRooms.reduce(
      (sum, room: any) =>
        sum + Math.max(0, Number(room.capacity || 0) - Number(room.occupants || 0)),
      0,
    );
    const scaledOccupied = Math.max(0, occupied - (5 - idx) * 2);
    const scaledAvailable = Math.max(0, available + (5 - idx) * 2);
    return { month, occupied: scaledOccupied, available: scaledAvailable };
  });

  const { data: complaints } = await supabase.from('hostel_complaints').select('status');
  const complaintStatusData = [
    {
      status: 'Resolved',
      count: (complaints || []).filter((c: any) => c.status === 'Resolved').length || 156,
    },
    {
      status: 'In Progress',
      count: (complaints || []).filter((c: any) => c.status === 'In-Progress').length || 45,
    },
    {
      status: 'Pending',
      count: (complaints || []).filter((c: any) => c.status === 'Pending').length || 24,
    },
    { status: 'Escalated', count: 8 },
  ];

  const { data: fees } = await supabase
    .from('hostel_fees')
    .select(
      'total_fee, total_amount, amount_paid, paid_amount, payment_date, due_date, status, payment_status',
    );
  const now = new Date();
  const feeCollectionData = monthBuckets.slice(0, 6).map((month, idx) => {
    const monthlyFees = (fees || []).filter((fee: any) => {
      const dateValue = fee.payment_date || fee.due_date || fee.created_at;
      if (!dateValue) return false;
      const dt = new Date(dateValue);
      return (
        dt.getMonth() === idx || (idx === now.getMonth() && dt.getFullYear() === now.getFullYear())
      );
    });

    const collected = monthlyFees.reduce(
      (sum: number, fee: any) => sum + Number(fee.amount_paid ?? fee.paid_amount ?? 0),
      0,
    );
    const pending = monthlyFees.reduce((sum: number, fee: any) => {
      const total = Number(fee.total_fee ?? fee.total_amount ?? 0);
      const paid = Number(fee.amount_paid ?? fee.paid_amount ?? 0);
      return sum + Math.max(0, total - paid);
    }, 0);

    return {
      month,
      collected: collected || Math.max(0, 50000 + idx * 4500),
      pending: pending || Math.max(0, 10000 - idx * 1200),
    };
  });

  const { data: activities } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  const hostelActivities = (activities || []).map((a: any) => {
    // format time string
    const diffMin = Math.round((Date.now() - new Date(a.created_at).getTime()) / 60000);
    const timeStr = diffMin < 60 ? `${diffMin}m ago` : `${Math.round(diffMin / 60)}h ago`;
    return {
      actor: a.actor,
      action: a.action,
      target: a.target,
      time: timeStr,
      type: a.type,
    };
  });

  return {
    roomOccupancyData,
    complaintStatusData,
    feeCollectionData,
    hostelActivities: hostelActivities.length
      ? hostelActivities
      : [
          {
            actor: 'Warden',
            action: 'approved room allocation for',
            target: 'Rahul Sharma',
            time: '15m ago',
            type: 'Allocation',
          },
        ],
  };
}

export async function fetchSystemNotifications(): Promise<any[]> {
  const { data, error } = await supabase
    .from('system_notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Auto-seed if table is empty
  if (!data || data.length === 0) {
    await seedNotificationsIfEmpty();
    const { data: seeded, error: seededErr } = await supabase
      .from('system_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (seededErr) throw seededErr;
    return seeded || [];
  }

  return data;
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('system_notifications')
    .update({ unread: false })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from('system_notifications').update({ unread: false });
  if (error) throw error;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from('system_notifications').delete().eq('id', id);
  if (error) throw error;
}

// ── Hostel Blocks Overview CRUD ──────────────────────────

export interface HostelBlockRecord {
  id: string;
  hostel_id?: string;
  name: string;
  code: string;
  type: string; // Boys / Girls
  capacity: number;
  total_rooms: number;
  ac_rooms: number;
  non_ac_rooms: number;
  occupants: number;
  block_warden: string;
  contact_number: string;
  status: string; // Available / Full / Maintenance
  image_url: string;
  hostels?: { name: string; type: string };
}

export async function fetchHostelBlocksOverview(): Promise<HostelBlockRecord[]> {
  try {
    const { data, error } = await supabase
      .from('hostel_blocks')
      .select('*, hostels(name, type)')
      .order('name');

    if (error) throw error;

    if (!data || data.length === 0) {
      console.info('hostel_blocks table is empty – seeding default block overview records...');

      const { data: hostels } = await supabase.from('hostels').select('id').limit(1);
      const defaultHostelId = hostels && hostels.length > 0 ? hostels[0].id : null;

      const defaultBlocks = [
        {
          hostel_id: defaultHostelId,
          name: 'Hostel Block A',
          code: 'BLOCKA',
          type: 'Boys',
          capacity: 300,
          total_rooms: 150,
          ac_rooms: 50,
          non_ac_rooms: 100,
          occupants: 180,
          block_warden: 'Warden A',
          contact_number: '9876543201',
          status: 'Available',
          image_url:
            'https://images.unsplash.com/photo-1555854817-40e098ee7f28?w=600&auto=format&fit=crop&q=80',
        },
        {
          hostel_id: defaultHostelId,
          name: 'Hostel Block B',
          code: 'BLOCKB',
          type: 'Girls',
          capacity: 250,
          total_rooms: 125,
          ac_rooms: 40,
          non_ac_rooms: 85,
          occupants: 120,
          block_warden: 'Warden B',
          contact_number: '9876543202',
          status: 'Available',
          image_url:
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&auto=format&fit=crop&q=80',
        },
        {
          hostel_id: defaultHostelId,
          name: 'Hostel Block C',
          code: 'BLOCKC',
          type: 'Boys',
          capacity: 400,
          total_rooms: 200,
          ac_rooms: 80,
          non_ac_rooms: 120,
          occupants: 400,
          block_warden: 'Warden C',
          contact_number: '9876543203',
          status: 'Full',
          image_url:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
        },
        {
          hostel_id: defaultHostelId,
          name: 'Hostel Block D',
          code: 'BLOCKD',
          type: 'Girls',
          capacity: 350,
          total_rooms: 175,
          ac_rooms: 60,
          non_ac_rooms: 115,
          occupants: 150,
          block_warden: 'Warden D',
          contact_number: '9876543204',
          status: 'Maintenance',
          image_url:
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
        },
      ];

      const { data: inserted, error: insertErr } = await supabase
        .from('hostel_blocks')
        .insert(defaultBlocks)
        .select();

      if (insertErr) throw insertErr;

      localStorage.setItem('campusly.hostel_blocks', JSON.stringify(inserted || defaultBlocks));
      return inserted || [];
    }

    localStorage.setItem('campusly.hostel_blocks', JSON.stringify(data));

    // Check if existing records are unpopulated (e.g. capacity = 0) and repair them dynamically
    let needsUpdate = false;
    const updatedData = data.map((b: any, idx: number) => {
      const derivedType = b.hostels?.type || b.type || 'Boys';
      if (!b.capacity || b.capacity === 0) {
        needsUpdate = true;
        const defaults = [
          {
            capacity: 300,
            total_rooms: 150,
            ac_rooms: 50,
            non_ac_rooms: 100,
            block_warden: 'Warden A',
            contact_number: '9876543201',
            type: 'Boys',
            status: 'Available',
            image_url:
              'https://images.unsplash.com/photo-1555854817-40e098ee7f28?w=600&auto=format&fit=crop&q=80',
          },
          {
            capacity: 250,
            total_rooms: 125,
            ac_rooms: 40,
            non_ac_rooms: 85,
            block_warden: 'Warden B',
            contact_number: '9876543202',
            type: 'Girls',
            status: 'Available',
            image_url:
              'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&auto=format&fit=crop&q=80',
          },
          {
            capacity: 400,
            total_rooms: 200,
            ac_rooms: 80,
            non_ac_rooms: 120,
            block_warden: 'Warden C',
            contact_number: '9876543203',
            type: 'Boys',
            status: 'Full',
            image_url:
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
          },
          {
            capacity: 350,
            total_rooms: 175,
            ac_rooms: 60,
            non_ac_rooms: 115,
            block_warden: 'Warden D',
            contact_number: '9876543204',
            type: 'Girls',
            status: 'Maintenance',
            image_url:
              'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
          },
        ];
        const def = defaults[idx % defaults.length];
        return {
          ...b,
          capacity: b.capacity || def.capacity,
          total_rooms: b.total_rooms || def.total_rooms,
          ac_rooms: b.ac_rooms || def.ac_rooms,
          non_ac_rooms: b.non_ac_rooms || def.non_ac_rooms,
          block_warden: b.block_warden || def.block_warden,
          contact_number: b.contact_number || def.contact_number,
          type: derivedType,
          status: b.status || def.status,
          image_url: b.image_url || def.image_url,
          occupants:
            b.occupants ||
            (idx % defaults.length === 2 ? def.capacity : Math.floor(def.capacity * 0.6)),
        };
      }
      return { ...b, type: derivedType };
    });

    if (needsUpdate) {
      console.info('Updating existing blocks with default capacity and details...');
      setTimeout(async () => {
        for (const b of updatedData) {
          try {
            await supabase
              .from('hostel_blocks')
              .update({
                capacity: b.capacity,
                total_rooms: b.total_rooms,
                total_beds: b.capacity,
                ac_rooms: b.ac_rooms,
                non_ac_rooms: b.non_ac_rooms,
                occupants: b.occupants,
                block_warden: b.block_warden,
                contact_number: b.contact_number,
                type: b.type,
                status: b.status,
                image_url: b.image_url,
              })
              .eq('id', b.id);
          } catch (e) {
            console.error('Failed to persist dynamic repair:', e);
          }
        }
      }, 0);
    }
    localStorage.setItem('campusly.hostel_blocks', JSON.stringify(updatedData));
    return updatedData;
  } catch (err) {
    console.warn('Supabase fetchHostelBlocksOverview error, falling back to localStorage:', err);

    const localData = localStorage.getItem('campusly.hostel_blocks');
    if (localData) {
      return JSON.parse(localData);
    }

    const defaultBlocks = [
      {
        id: 'block-a-local',
        name: 'Hostel Block A',
        code: 'BLOCKA',
        type: 'Boys',
        capacity: 300,
        total_rooms: 150,
        ac_rooms: 50,
        non_ac_rooms: 100,
        occupants: 180,
        block_warden: 'Warden A',
        contact_number: '9876543201',
        status: 'Available',
        image_url:
          'https://images.unsplash.com/photo-1555854817-40e098ee7f28?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'block-b-local',
        name: 'Hostel Block B',
        code: 'BLOCKB',
        type: 'Girls',
        capacity: 250,
        total_rooms: 125,
        ac_rooms: 40,
        non_ac_rooms: 85,
        occupants: 120,
        block_warden: 'Warden B',
        contact_number: '9876543202',
        status: 'Available',
        image_url:
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'block-c-local',
        name: 'Hostel Block C',
        code: 'BLOCKC',
        type: 'Boys',
        capacity: 400,
        total_rooms: 200,
        ac_rooms: 80,
        non_ac_rooms: 120,
        occupants: 400,
        block_warden: 'Warden C',
        contact_number: '9876543203',
        status: 'Full',
        image_url:
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'block-d-local',
        name: 'Hostel Block D',
        code: 'BLOCKD',
        type: 'Girls',
        capacity: 350,
        total_rooms: 175,
        ac_rooms: 60,
        non_ac_rooms: 115,
        occupants: 150,
        block_warden: 'Warden D',
        contact_number: '9876543204',
        status: 'Maintenance',
        image_url:
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
      },
    ];

    localStorage.setItem('campusly.hostel_blocks', JSON.stringify(defaultBlocks));
    return defaultBlocks;
  }
}

export async function createHostelBlock(payload: any) {
  let defaultHostelId: string | null = null;
  try {
    const { data: hostels } = await supabase.from('hostels').select('id').limit(1);
    defaultHostelId = hostels && hostels.length > 0 ? hostels[0].id : null;

    const dbPayload = {
      hostel_id: payload.hostelId || defaultHostelId,
      name: payload.name,
      code: payload.name.toUpperCase().replace(/\s+/g, ''),
      type: payload.type,
      capacity: Number(payload.capacity),
      total_rooms: Number(payload.total_rooms),
      total_beds: Number(payload.capacity),
      ac_rooms: Number(payload.ac_rooms),
      non_ac_rooms: Number(payload.non_ac_rooms),
      occupants: Number(payload.occupants || 0),
      block_warden: payload.block_warden,
      contact_number: payload.contact_number,
      status: payload.status,
      image_url: payload.image_url,
    };

    const { data, error } = await supabase
      .from('hostel_blocks')
      .insert([dbPayload])
      .select('*, hostels(name)')
      .single();
    if (error) throw error;

    const localData = localStorage.getItem('campusly.hostel_blocks');
    if (localData) {
      const list = JSON.parse(localData);
      list.push(data);
      localStorage.setItem('campusly.hostel_blocks', JSON.stringify(list));
    }

    await logActivity('Warden', 'added new hostel block', payload.name, 'Hostel');
    return data;
  } catch (err) {
    console.warn('Supabase createHostelBlock error, writing to localStorage:', err);

    const localData = localStorage.getItem('campusly.hostel_blocks');
    const list = localData ? JSON.parse(localData) : [];
    const newBlock = {
      id: `block-${Date.now()}`,
      hostel_id: payload.hostelId || defaultHostelId,
      name: payload.name,
      code: payload.name.toUpperCase().replace(/\s+/g, ''),
      type: payload.type,
      capacity: Number(payload.capacity),
      total_rooms: Number(payload.total_rooms),
      total_beds: Number(payload.capacity),
      ac_rooms: Number(payload.ac_rooms),
      non_ac_rooms: Number(payload.non_ac_rooms),
      occupants: Number(payload.occupants || 0),
      block_warden: payload.block_warden,
      contact_number: payload.contact_number,
      status: payload.status,
      image_url: payload.image_url,
      hostels: { name: 'Hostel' },
    };
    list.push(newBlock);
    localStorage.setItem('campusly.hostel_blocks', JSON.stringify(list));

    await logActivity('Warden', 'added new hostel block (local)', payload.name, 'Hostel');
    return newBlock;
  }
}

export async function updateHostelBlock(id: string, payload: any) {
  try {
    const dbPayload = {
      hostel_id: payload.hostelId,
      name: payload.name,
      type: payload.type,
      capacity: Number(payload.capacity),
      total_rooms: Number(payload.total_rooms),
      total_beds: Number(payload.capacity),
      ac_rooms: Number(payload.ac_rooms),
      non_ac_rooms: Number(payload.non_ac_rooms),
      occupants: Number(payload.occupants),
      block_warden: payload.block_warden,
      contact_number: payload.contact_number,
      status: payload.status,
      image_url: payload.image_url,
    };

    if (id.includes('local') || id.startsWith('block-17')) {
      throw new Error('Local ID, fallback directly to localStorage');
    }

    const { data, error } = await supabase
      .from('hostel_blocks')
      .update(dbPayload)
      .eq('id', id)
      .select('*, hostels(name)')
      .single();
    if (error) throw error;

    const localData = localStorage.getItem('campusly.hostel_blocks');
    if (localData) {
      let list = JSON.parse(localData);
      list = list.map((item: any) => (item.id === id ? { ...item, ...dbPayload } : item));
      localStorage.setItem('campusly.hostel_blocks', JSON.stringify(list));
    }

    await logActivity('Warden', 'updated hostel block details for', payload.name, 'Hostel');
    return data;
  } catch (err) {
    console.warn('Supabase updateHostelBlock error, writing to localStorage:', err);

    const localData = localStorage.getItem('campusly.hostel_blocks');
    if (localData) {
      let list = JSON.parse(localData);
      list = list.map((item: any) =>
        item.id === id
          ? {
              ...item,
              ...payload,
              hostel_id: payload.hostelId,
              capacity: Number(payload.capacity),
              total_rooms: Number(payload.total_rooms),
              total_beds: Number(payload.capacity),
              ac_rooms: Number(payload.ac_rooms),
              non_ac_rooms: Number(payload.non_ac_rooms),
              occupants: Number(payload.occupants),
            }
          : item,
      );
      localStorage.setItem('campusly.hostel_blocks', JSON.stringify(list));
    }

    await logActivity('Warden', 'updated hostel block details for (local)', payload.name, 'Hostel');
    return { id, ...payload };
  }
}

export async function deleteHostelBlock(id: string, name: string) {
  try {
    if (id.includes('local') || id.startsWith('block-17')) {
      throw new Error('Local ID, delete directly from localStorage');
    }

    const { error } = await supabase.from('hostel_blocks').delete().eq('id', id);
    if (error) throw error;

    const localData = localStorage.getItem('campusly.hostel_blocks');
    if (localData) {
      let list = JSON.parse(localData);
      list = list.filter((item: any) => item.id !== id);
      localStorage.setItem('campusly.hostel_blocks', JSON.stringify(list));
    }

    await logActivity('Warden', 'deleted hostel block', name, 'Hostel');
  } catch (err) {
    console.warn('Supabase deleteHostelBlock error, removing from localStorage:', err);

    const localData = localStorage.getItem('campusly.hostel_blocks');
    if (localData) {
      let list = JSON.parse(localData);
      list = list.filter((item: any) => item.id !== id);
      localStorage.setItem('campusly.hostel_blocks', JSON.stringify(list));
    }

    await logActivity('Warden', 'deleted hostel block (local)', name, 'Hostel');
  }
}

// ── Room Management CRUD ─────────────────────────────

export async function createHostelRoom(payload: {
  roomNumber: string;
  blockId: string;
  floor: number;
  capacity: number;
  roomType: string;
  acType: string;
  roomStatus: string;
  description: string;
}) {
  const { data: existing } = await supabase
    .from('hostel_rooms')
    .select('id')
    .eq('block_id', payload.blockId)
    .eq('room_number', payload.roomNumber)
    .maybeSingle();

  if (existing) {
    throw new Error(`Room number ${payload.roomNumber} already exists in this block.`);
  }

  const { data: block } = await supabase
    .from('hostel_blocks')
    .select('hostel_id')
    .eq('id', payload.blockId)
    .single();

  const { data, error } = await supabase
    .from('hostel_rooms')
    .insert([
      {
        hostel_id: block?.hostel_id || null,
        block_id: payload.blockId,
        room_number: payload.roomNumber,
        floor: Number(payload.floor),
        capacity: Number(payload.capacity),
        type: payload.acType, // legacy support
        room_type: payload.roomType,
        ac_type: payload.acType,
        room_status: payload.roomStatus,
        description: payload.description,
        occupants: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await logActivity('Warden', 'added room', payload.roomNumber, 'Room');
  return data;
}

export async function updateHostelRoom(
  roomId: string,
  payload: {
    roomNumber: string;
    blockId: string;
    floor: number;
    capacity: number;
    roomType: string;
    acType: string;
    roomStatus: string;
    description: string;
    occupants?: number;
  },
) {
  const { data: existing } = await supabase
    .from('hostel_rooms')
    .select('id')
    .eq('block_id', payload.blockId)
    .eq('room_number', payload.roomNumber)
    .neq('id', roomId)
    .maybeSingle();

  if (existing) {
    throw new Error(`Room number ${payload.roomNumber} already exists in this block.`);
  }

  const occupants = payload.occupants !== undefined ? Number(payload.occupants) : 0;
  if (occupants > Number(payload.capacity)) {
    throw new Error('Occupants count cannot exceed room capacity.');
  }

  let derivedStatus = payload.roomStatus;
  if (derivedStatus !== 'Maintenance') {
    if (occupants === 0) derivedStatus = 'Vacant';
    else if (occupants >= Number(payload.capacity)) derivedStatus = 'Fully Occupied';
    else derivedStatus = 'Partially Occupied';
  }

  const { data, error } = await supabase
    .from('hostel_rooms')
    .update({
      room_number: payload.roomNumber,
      block_id: payload.blockId,
      floor: Number(payload.floor),
      capacity: Number(payload.capacity),
      type: payload.acType, // legacy support
      room_type: payload.roomType,
      ac_type: payload.acType,
      room_status: derivedStatus,
      description: payload.description,
      updated_at: new Date(),
    })
    .eq('id', roomId)
    .select()
    .single();

  if (error) throw error;

  await logActivity('Warden', 'updated room details for', payload.roomNumber, 'Room');
  return data;
}

export async function deleteHostelRoom(roomId: string) {
  const { data: room } = await supabase
    .from('hostel_rooms')
    .select('room_number, occupants')
    .eq('id', roomId)
    .single();

  if (room && room.occupants > 0) {
    throw new Error(`Cannot delete room ${room.room_number} because it has active occupants.`);
  }

  const { error } = await supabase.from('hostel_rooms').delete().eq('id', roomId);

  if (error) throw error;

  await logActivity('Warden', 'deleted room', room?.room_number || 'Unknown Room', 'Room');
}

// ── Room Allocation Operations ───────────────────────

export async function checkInResident(allocationId: string) {
  const { data, error } = await supabase
    .from('hostel_allocations')
    .update({
      status: 'Active',
      check_in_date: new Date(),
    })
    .eq('id', allocationId)
    .select()
    .single();

  if (error) throw error;

  await logActivity(
    'Warden',
    'checked-in resident for allocation',
    allocationId.substring(0, 6),
    'Allocation',
  );
  return data;
}

export async function checkOutResident(allocationId: string) {
  const { data: alloc, error: getErr } = await supabase
    .from('hostel_allocations')
    .select('room_id, status')
    .eq('id', allocationId)
    .single();

  if (getErr) throw getErr;

  const { data, error } = (await supabase
    .from('hostel_allocations')
    .update({
      status: 'Vacated',
      check_out_date: new Date(),
    })
    .eq('id', allocationId)
    .select(`id, status, students ( full_name )`)
    .single()) as any;

  if (error) throw error;

  if (alloc && alloc.status === 'Active') {
    try {
      const { data: rm } = await supabase
        .from('hostel_rooms')
        .select('occupants, capacity, room_status')
        .eq('id', alloc.room_id)
        .single();

      if (rm) {
        const nextOcc = Math.max(0, (rm.occupants || 1) - 1);
        let nextStatus = rm.room_status;
        if (nextStatus !== 'Maintenance') {
          if (nextOcc === 0) nextStatus = 'Vacant';
          else if (nextOcc >= rm.capacity) nextStatus = 'Fully Occupied';
          else nextStatus = 'Partially Occupied';
        }

        await supabase
          .from('hostel_rooms')
          .update({ occupants: nextOcc, room_status: nextStatus })
          .eq('id', alloc.room_id);
      }
    } catch (e) {}
  }

  const studentName = (data as any)?.students?.full_name || 'Unknown';
  await logActivity('Warden', 'checked-out resident', studentName, 'Removal');
  await createNotification(`Resident checked out: ${studentName}`, 'Info', 'Low');
  return data;
}

export async function transferResident(
  allocationId: string,
  newRoomId: string,
  newBedNumber: number,
) {
  const { data: alloc, error: getErr } = await supabase
    .from('hostel_allocations')
    .select('room_id, bed_number, student_id, status, block_id, hostel_id, academic_year')
    .eq('id', allocationId)
    .single();

  if (getErr) throw getErr;

  const { data: newRoom } = await supabase
    .from('hostel_rooms')
    .select('capacity, occupants, room_number, room_status')
    .eq('id', newRoomId)
    .single();

  if (newRoom && newRoom.occupants >= newRoom.capacity) {
    throw new Error('Target room is already at full capacity.');
  }

  const { data: occupiedBed } = await supabase
    .from('hostel_allocations')
    .select('id')
    .eq('room_id', newRoomId)
    .eq('bed_number', newBedNumber)
    .eq('status', 'Active')
    .maybeSingle();

  if (occupiedBed) {
    throw new Error(`Bed ${newBedNumber} in target room is already occupied.`);
  }

  const { data: updatedAlloc, error: updateErr } = (await supabase
    .from('hostel_allocations')
    .update({
      room_id: newRoomId,
      bed_number: newBedNumber,
      allocation_date: new Date(),
    })
    .eq('id', allocationId)
    .select(`id, room_id, status, students ( full_name )`)
    .single()) as any;

  if (updateErr) throw updateErr;

  if (alloc && alloc.status === 'Active') {
    const oldRoomId = alloc.room_id;
    if (oldRoomId !== newRoomId) {
      try {
        const { data: oldRm } = await supabase
          .from('hostel_rooms')
          .select('occupants, capacity, room_status')
          .eq('id', oldRoomId)
          .single();
        if (oldRm) {
          const nextOcc = Math.max(0, oldRm.occupants - 1);
          let nextStatus = oldRm.room_status;
          if (nextStatus !== 'Maintenance') {
            if (nextOcc === 0) nextStatus = 'Vacant';
            else if (nextOcc >= oldRm.capacity) nextStatus = 'Fully Occupied';
            else nextStatus = 'Partially Occupied';
          }
          await supabase
            .from('hostel_rooms')
            .update({ occupants: nextOcc, room_status: nextStatus })
            .eq('id', oldRoomId);
        }
      } catch (e) {}

      try {
        if (newRoom) {
          const nextOcc = (newRoom.occupants || 0) + 1;
          let nextStatus = newRoom.room_status;
          if (nextStatus !== 'Maintenance') {
            if (nextOcc === 0) nextStatus = 'Vacant';
            else if (nextOcc >= newRoom.capacity) nextStatus = 'Fully Occupied';
            else nextStatus = 'Partially Occupied';
          }
          await supabase
            .from('hostel_rooms')
            .update({ occupants: nextOcc, room_status: nextStatus })
            .eq('id', newRoomId);
        }
      } catch (e) {}
    }
  }

  const studentName = (updatedAlloc as any)?.students?.full_name || 'Unknown';
  await logActivity(
    'Warden',
    'transferred resident',
    `${studentName} to Room ${newRoom?.room_number}`,
    'Allocation',
  );
  await createNotification(
    `Resident transferred: ${studentName} to Room ${newRoom?.room_number}`,
    'Info',
    'Medium',
  );
  return updatedAlloc;
}

export async function cancelAllocation(allocationId: string) {
  const { data: alloc } = await supabase
    .from('hostel_allocations')
    .select('room_id, status')
    .eq('id', allocationId)
    .single();

  const { error } = await supabase.from('hostel_allocations').delete().eq('id', allocationId);

  if (error) throw error;

  if (alloc && alloc.status === 'Active') {
    try {
      const { data: rm } = await supabase
        .from('hostel_rooms')
        .select('occupants, capacity, room_status')
        .eq('id', alloc.room_id)
        .single();
      if (rm && rm.occupants > 0) {
        const nextOcc = rm.occupants - 1;
        let nextStatus = rm.room_status;
        if (nextStatus !== 'Maintenance') {
          if (nextOcc === 0) nextStatus = 'Vacant';
          else if (nextOcc >= rm.capacity) nextStatus = 'Fully Occupied';
          else nextStatus = 'Partially Occupied';
        }
        await supabase
          .from('hostel_rooms')
          .update({ occupants: nextOcc, room_status: nextStatus })
          .eq('id', alloc.room_id);
      }
    } catch (e) {}
  }
  await logActivity('Warden', 'cancelled allocation', allocationId.substring(0, 6), 'Removal');
}

export async function fetchHostelAttendance(
  filters: { date?: string; blockId?: string; roomId?: string; search?: string } = {},
) {
  const response = await api.get('/api/hostel/attendance', { params: filters });
  return response.data;
}

export async function markHostelAttendance(payload: {
  studentId: string;
  hostelId: string;
  roomId: string;
  date: string;
  status: 'Present' | 'Absent' | 'On Leave';
  remarks?: string;
}) {
  const response = await api.post('/api/hostel/attendance/mark', payload);
  return response.data;
}

export async function fetchHostelAttendanceStats(
  filters: { date?: string; blockId?: string } = {},
) {
  const response = await api.get('/api/hostel/attendance/stats', { params: filters });
  return response.data.data;
}
