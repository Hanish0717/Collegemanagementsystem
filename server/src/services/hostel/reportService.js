/**
 * Hostel Reports Service
 * 
 * Comprehensive reporting service for all hostel management data
 * Includes resident reports, occupancy reports, fee reports, and analytics
 */

import { supabase } from '../../config/supabase.js';

const normalizeFeeStatus = (status, dueDate, pendingAmount = 0) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid') return 'Paid';
  if (normalized === 'partially paid' || normalized === 'partially-paid' || normalized === 'partial') return 'Partially Paid';
  if (normalized === 'overdue') return 'Overdue';
  if ((normalized === 'pending' || normalized === 'unpaid') && dueDate && new Date(dueDate).getTime() < Date.now() && pendingAmount > 0) {
    return 'Overdue';
  }
  if (pendingAmount <= 0) return 'Paid';
  return 'Pending';
};

const feeAmount = (row) => Number(row.total_fee ?? row.total_amount ?? 0);
const paidAmount = (row) => Number(row.amount_paid ?? row.paid_amount ?? 0);
const pendingAmount = (row) => Number(row.pending_amount ?? Math.max(0, feeAmount(row) - paidAmount(row)));

/**
 * Fetch Resident Report with filters
 * Returns all residents with hostel, room, and status information
 */
export const getResidentReport = async (filters = {}) => {
  try {
    let query = supabase
      .from('hostel_allocations')
      .select(`
        id,
        student:students(
          id,
          full_name,
          roll_number,
          email,
          phone_number,
          date_of_birth,
          gender,
          department,
          year,
          profile_image
        ),
        room:hostel_rooms(
          id,
          room_number,
          floor,
          room_type,
          ac_type,
          capacity
        ),
        hostel:hostels(
          id,
          name
        ),
        hostel_blocks(
          id,
          name
        ),
        allocation_date:allocationDate,
        status,
        created_at
      `)
      .eq('status', 'active');

    // Apply filters
    if (filters.hostelId) {
      query = query.eq('hostel_id', filters.hostelId);
    }
    if (filters.roomType) {
      query = query.eq('room.room_type', filters.roomType);
    }
    if (filters.acType) {
      query = query.eq('room.ac_type', filters.acType);
    }
    if (filters.blockId) {
      query = query.eq('hostel_blocks.id', filters.blockId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Format response
    const residents = (data || []).map((allocation) => ({
      id: allocation.id,
      residentId: allocation.student?.id,
      name: allocation.student?.full_name,
      registrationNumber: allocation.student?.roll_number,
      email: allocation.student?.email,
      phone: allocation.student?.phone_number,
      gender: allocation.student?.gender,
      dob: allocation.student?.date_of_birth,
      department: allocation.student?.department,
      year: allocation.student?.year,
      hostelBlock: allocation.hostel_blocks?.name,
      roomNumber: allocation.room?.room_number,
      roomType: allocation.room?.room_type,
      acType: allocation.room?.ac_type,
      floor: allocation.room?.floor,
      capacity: allocation.room?.capacity,
      checkInDate: allocation.allocation_date,
      status: allocation.status,
      createdAt: allocation.created_at,
    }));

    return {
      total: residents.length,
      data: residents,
    };
  } catch (error) {
    console.error('Error fetching resident report:', error);
    throw error;
  }
};

/**
 * Fetch Room Occupancy Report
 * Returns occupancy statistics for all rooms with calculations
 */
export const getRoomOccupancyReport = async (filters = {}) => {
  try {
    let query = supabase
      .from('hostel_rooms')
      .select(`
        id,
        room_number,
        floor,
        room_type,
        ac_type,
        capacity,
        occupants,
        room_status,
        hostel_blocks(
          id,
          name,
          total_beds,
          occupied_beds
        ),
        hostels(
          id,
          name
        )
      `);

    // Apply filters
    if (filters.hostelId) {
      query = query.eq('hostel', filters.hostelId);
    }
    if (filters.roomType) {
      query = query.eq('room_type', filters.roomType);
    }
    if (filters.acType) {
      query = query.eq('ac_type', filters.acType);
    }
    if (filters.blockId) {
      query = query.eq('hostel_blocks.id', filters.blockId);
    }

    const { data: rooms, error } = await query;
    if (error) throw error;

    // Group by block and calculate statistics
    const reportByBlock = {};
    const allRooms = [];

    (rooms || []).forEach((room) => {
      const blockName = room.hostel_blocks?.name || 'Unknown';
      const occupancyPct = room.capacity > 0 ? Math.round((room.occupants / room.capacity) * 100) : 0;

      if (!reportByBlock[blockName]) {
        reportByBlock[blockName] = {
          blockName,
          blockId: room.hostel_blocks?.id,
          totalRooms: 0,
          occupiedRooms: 0,
          vacantRooms: 0,
          totalBeds: 0,
          occupiedBeds: 0,
          availableBeds: 0,
          occupancyPercentage: 0,
          rooms: [],
        };
      }

      reportByBlock[blockName].totalRooms += 1;
      reportByBlock[blockName].totalBeds += room.capacity;
      reportByBlock[blockName].occupiedBeds += room.occupants;
      if (room.occupants > 0) {
        reportByBlock[blockName].occupiedRooms += 1;
      } else {
        reportByBlock[blockName].vacantRooms += 1;
      }

      allRooms.push({
        roomId: room.id,
        roomNumber: room.room_number,
        floor: room.floor,
        roomType: room.room_type,
        acType: room.ac_type,
        capacity: room.capacity,
        occupants: room.occupants,
        available: Math.max(0, room.capacity - room.occupants),
        status: room.room_status,
        occupancyPercentage: occupancyPct,
        block: blockName,
      });
    });

    // Calculate block statistics
    Object.keys(reportByBlock).forEach((blockName) => {
      const block = reportByBlock[blockName];
      block.availableBeds = block.totalBeds - block.occupiedBeds;
      block.occupancyPercentage = block.totalBeds > 0 ? Math.round((block.occupiedBeds / block.totalBeds) * 100) : 0;
    });

    return {
      summary: {
        totalRooms: allRooms.length,
        totalOccupiedRooms: Object.values(reportByBlock).reduce((sum, b) => sum + b.occupiedRooms, 0),
        totalVacantRooms: Object.values(reportByBlock).reduce((sum, b) => sum + b.vacantRooms, 0),
        totalBeds: Object.values(reportByBlock).reduce((sum, b) => sum + b.totalBeds, 0),
        totalOccupiedBeds: Object.values(reportByBlock).reduce((sum, b) => sum + b.occupiedBeds, 0),
        totalAvailableBeds: Object.values(reportByBlock).reduce((sum, b) => sum + b.availableBeds, 0),
      },
      byBlock: Object.values(reportByBlock),
      allRooms: allRooms,
    };
  } catch (error) {
    console.error('Error fetching room occupancy report:', error);
    throw error;
  }
};

/**
 * Fetch Hostel Block Report
 * Returns summary statistics for each hostel block
 */
export const getHostelBlockReport = async (filters = {}) => {
  try {
    let query = supabase
      .from('hostel_blocks')
      .select(`
        id,
        name,
        total_beds,
        occupied_beds,
        total_rooms,
        ac_rooms,
        non_ac_rooms,
        status,
        hostels(
          id,
          name
        ),
        hostel_rooms(
          id,
          capacity,
          occupants,
          room_type,
          ac_type
        )
      `);

    if (filters.hostelId) {
      query = query.eq('hostel', filters.hostelId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data: blocks, error } = await query;
    if (error) throw error;

    const report = (blocks || []).map((block) => {
      const rooms = block.hostel_rooms || [];
      const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
      const occupiedBeds = rooms.reduce((sum, r) => sum + (r.occupants || 0), 0);
      const availableBeds = totalBeds - occupiedBeds;

      return {
        blockId: block.id,
        blockName: block.name,
        hostelName: block.hostels?.name,
        capacity: totalBeds,
        totalRooms: rooms.length,
        acRooms: rooms.filter((r) => r.ac_type === 'AC').length,
        nonAcRooms: rooms.filter((r) => r.ac_type === 'Non-AC').length,
        occupiedBeds: occupiedBeds,
        availableBeds: availableBeds,
        occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        status: block.status,
      };
    });

    return {
      total: report.length,
      data: report,
    };
  } catch (error) {
    console.error('Error fetching hostel block report:', error);
    throw error;
  }
};

/**
 * Fetch Fee Collection Report
 * Returns fee and payment information for residents
 */
export const getFeeCollectionReport = async (filters = {}) => {
  try {
    let query = supabase
      .from('hostel_fees')
      .select(`
        id,
        student:students(
          id,
          full_name,
          roll_number,
          email
        ),
        hostel_blocks(
          id,
          name
        ),
        hostel_rooms(
          id,
          room_number,
          room_type,
          ac_type
        ),
        fee_type,
        fee_category,
        academic_year,
        total_amount,
        total_fee,
        paid_amount,
        amount_paid,
        pending_amount,
        due_date,
        payment_date,
        paid_date,
        status,
        payment_status,
        payment_method,
        receipt_number,
        transaction_id,
        month,
        year,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.hostelId) {
      query = query.eq('hostel', filters.hostelId);
    }
    if (filters.blockId) {
      query = query.eq('block_id', filters.blockId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.feeType) {
      query = query.eq('fee_type', filters.feeType);
    }
    if (filters.academicYear) {
      query = query.eq('academic_year', filters.academicYear);
    }
    if (filters.roomNumber) {
      query = query.ilike('room_number', `%${filters.roomNumber}%`);
    }
    if (filters.registrationNumber) {
      query = query.ilike('registration_number', `%${filters.registrationNumber}%`);
    }
    if (filters.startDate && filters.endDate) {
      query = query.gte('due_date', filters.startDate).lte('due_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const fees = (data || []).map((fee) => {
      const totalAmount = feeAmount(fee);
      const paid = paidAmount(fee);
      const pending = pendingAmount(fee);
      const status = normalizeFeeStatus(fee.payment_status || fee.status, fee.due_date, pending);
      return {
        id: fee.id,
        residentName: fee.resident_name || fee.student?.full_name,
        registrationNumber: fee.registration_number || fee.student?.roll_number,
        hostelBlock: fee.hostel_blocks?.name,
        roomNumber: fee.room_number || fee.hostel_rooms?.room_number,
        roomType: fee.room_type || fee.hostel_rooms?.room_type,
        acType: fee.ac_type || fee.hostel_rooms?.ac_type,
        feeType: fee.fee_type,
        feeCategory: fee.fee_category,
        academicYear: fee.academic_year,
        month: fee.month,
        year: fee.year,
        totalAmount,
        paidAmount: paid,
        pendingAmount: pending,
        dueDate: fee.due_date,
        paidDate: fee.paid_date || fee.payment_date,
        paymentDate: fee.payment_date,
        paymentStatus: status,
        paymentMethod: fee.payment_method,
        receiptNumber: fee.receipt_number,
        transactionId: fee.transaction_id,
        createdAt: fee.created_at,
      };
    });

    const filteredFees = fees.filter((fee) => {
      if (!filters.status) return true;
      const normalized = String(filters.status).toLowerCase();
      return fee.paymentStatus.toLowerCase() === normalized || (normalized === 'paid' && fee.paymentStatus === 'Paid');
    });

    // Calculate summary statistics
    const totalAmount = filteredFees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
    const paidSum = filteredFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const pendingSum = filteredFees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

    const summary = {
      totalRecords: filteredFees.length,
      totalAmount,
      paidAmount: paidSum,
      pendingAmount: pendingSum,
      paidCount: filteredFees.filter((f) => f.paymentStatus === 'Paid').length,
      pendingCount: filteredFees.filter((f) => f.paymentStatus === 'Pending').length,
      overdueCount: filteredFees.filter((f) => f.paymentStatus === 'Overdue').length,
      collectionRate: totalAmount > 0 ? Math.round((paidSum / totalAmount) * 100) : 0,
    };

    return {
      summary,
      data: filteredFees,
    };
  } catch (error) {
    console.error('Error fetching fee collection report:', error);
    throw error;
  }
};

/**
 * Fetch Available Rooms Report
 * Returns only rooms with available beds
 */
export const getAvailableRoomsReport = async (filters = {}) => {
  try {
    let query = supabase
      .from('hostel_rooms')
      .select(`
        id,
        room_number,
        floor,
        room_type,
        ac_type,
        capacity,
        occupants,
        room_status,
        hostel_blocks(
          id,
          name
        ),
        hostels(
          id,
          name
        )
      `)
      .gt('capacity', supabase.raw('occupants')); // Only rooms with available beds

    // Apply filters
    if (filters.hostelId) {
      query = query.eq('hostel', filters.hostelId);
    }
    if (filters.roomType) {
      query = query.eq('room_type', filters.roomType);
    }
    if (filters.acType) {
      query = query.eq('ac_type', filters.acType);
    }
    if (filters.blockId) {
      query = query.eq('hostel_blocks.id', filters.blockId);
    }

    const { data: rooms, error } = await query;
    if (error) throw error;

    const availableRooms = (rooms || []).map((room) => ({
      roomId: room.id,
      hostelBlock: room.hostel_blocks?.name,
      roomNumber: room.room_number,
      floor: room.floor,
      roomType: room.room_type,
      acType: room.ac_type,
      capacity: room.capacity,
      currentOccupancy: room.occupants,
      availableBeds: Math.max(0, room.capacity - room.occupants),
      occupancyPercentage: room.capacity > 0 ? Math.round((room.occupants / room.capacity) * 100) : 0,
      status: room.room_status,
    }));

    return {
      total: availableRooms.length,
      data: availableRooms,
    };
  } catch (error) {
    console.error('Error fetching available rooms report:', error);
    throw error;
  }
};

/**
 * Fetch Dashboard Analytics Summary
 * Returns high-level metrics for dashboard cards
 */
export const getDashboardAnalytics = async () => {
  try {
    // Fetch all required data in parallel
    const [
      { data: residents },
      { data: rooms },
      { data: blocks },
      { data: fees },
      { data: hostels },
    ] = await Promise.all([
      supabase
        .from('hostel_allocations')
        .select('id, student(id)', { count: 'exact' })
        .eq('status', 'active'),
      supabase
        .from('hostel_rooms')
        .select('id, capacity, occupants', { count: 'exact' }),
      supabase
        .from('hostel_blocks')
        .select('id', { count: 'exact' }),
      supabase
        .from('hostel_fees')
        .select('id, total_amount, total_fee, amount_paid, paid_amount, pending_amount, status, payment_status, due_date, payment_date, created_at, academic_year, fee_type, fee_category'),
      supabase
        .from('hostels')
        .select('id', { count: 'exact' }),
    ]);

    const totalRooms = rooms?.length || 0;
    const occupiedRooms = rooms?.filter((r) => (r.occupants || 0) > 0).length || 0;
    const vacantRooms = totalRooms - occupiedRooms;

    const totalBeds = rooms?.reduce((sum, r) => sum + (r.capacity || 0), 0) || 0;
    const occupiedBeds = rooms?.reduce((sum, r) => sum + (r.occupants || 0), 0) || 0;
    const availableBeds = totalBeds - occupiedBeds;

    const feesNormalized = (fees || []).map((fee) => {
      const total = feeAmount(fee);
      const paid = paidAmount(fee);
      const pending = pendingAmount(fee);
      const status = normalizeFeeStatus(fee.payment_status || fee.status, fee.due_date, pending);
      return { ...fee, total, paid, pending, status };
    });

    const totalRevenue = feesNormalized.reduce((sum, f) => sum + f.paid, 0);
    const pendingFees = feesNormalized.reduce((sum, f) => sum + (f.status !== 'Paid' ? f.pending : 0), 0);
    const overduePayments = feesNormalized.filter((f) => f.status === 'Overdue').length;
    const collectionPercentage = totalRevenue + pendingFees > 0 ? Math.round((totalRevenue / (totalRevenue + pendingFees)) * 100) : 0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyCollection = months.map((month, idx) => {
      const monthFees = feesNormalized.filter((fee) => {
        const dt = new Date(fee.payment_date || fee.due_date || fee.created_at);
        return dt.getMonth() === idx;
      });
      return {
        month,
        collected: monthFees.reduce((sum, fee) => sum + fee.paid, 0),
        pending: monthFees.reduce((sum, fee) => sum + fee.pending, 0),
      };
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalResidents: residents?.length || 0,
      totalHostels: hostels?.length || 0,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      totalRevenue,
      pendingFees,
      overduePayments,
      collectionPercentage,
      monthlyCollection,
      revenueStatistics: {
        totalRecords: feesNormalized.length,
        paidCount: feesNormalized.filter((f) => f.status === 'Paid').length,
        partialCount: feesNormalized.filter((f) => f.status === 'Partially Paid').length,
        overdueCount: overduePayments,
      },
      occupancyRate,
      reportGeneratedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
};

/**
 * Search residents across all hostels
 * Returns paginated results
 */
export const searchResidents = async (searchTerm = '', page = 1, pageSize = 20) => {
  try {
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('hostel_allocations')
      .select(
        `
        id,
        student:students(
          id,
          full_name,
          roll_number,
          email,
          phone_number
        ),
        room:hostel_rooms(
          room_number,
          room_type
        ),
        hostel_blocks(name)
      `,
        { count: 'exact' }
      )
      .eq('status', 'active');

    if (searchTerm) {
      query = query.or(
        `student.full_name.ilike.%${searchTerm}%,student.roll_number.ilike.%${searchTerm}%,room.room_number.ilike.%${searchTerm}%`
      );
    }

    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (error) {
    console.error('Error searching residents:', error);
    throw error;
  }
};

/**
 * Get fee statistics by type
 */
export const getFeeStatisticsByType = async () => {
  try {
    const { data, error } = await supabase
      .from('hostel_fees')
      .select('fee_type, fee_category, total_amount, total_fee, amount_paid, paid_amount, pending_amount, status, payment_status');

    if (error) throw error;

    const stats = {};
    (data || []).forEach((fee) => {
      const key = fee.fee_category || fee.fee_type || 'Other';
      const total = feeAmount(fee);
      const paid = paidAmount(fee);
      const pending = pendingAmount(fee);
      if (!stats[key]) {
        stats[key] = {
          feeType: key,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          count: 0,
        };
      }
      stats[key].totalAmount += total;
      stats[key].paidAmount += paid;
      stats[key].pendingAmount += pending;
      stats[key].count += 1;
    });

    return Object.values(stats);
  } catch (error) {
    console.error('Error fetching fee statistics:', error);
    throw error;
  }
};
