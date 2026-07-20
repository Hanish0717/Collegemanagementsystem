import { supabase } from '../../config/supabase.js';
import db from '../../lib/db.js';
import { dispatchNotification } from '../../services/notificationService.js';

const toNumber = (value) => Number(value || 0);

const formatStatus = (status, dueDate, pendingAmount) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid') return 'Paid';
  if (normalized === 'partially paid' || normalized === 'partially-paid' || normalized === 'partial') return 'Partially Paid';
  if (normalized === 'overdue') return 'Overdue';
  if (normalized === 'pending' || normalized === 'unpaid') {
    if (dueDate && new Date(dueDate).getTime() < Date.now() && pendingAmount > 0) return 'Overdue';
    return 'Pending';
  }
  if (pendingAmount <= 0) return 'Paid';
  if (dueDate && new Date(dueDate).getTime() < Date.now()) return 'Overdue';
  return 'Pending';
};

const formatFeeStructure = (row) => ({
  id: row.id,
  feeStructureId: row.fee_structure_code,
  hostelBlock: row.hostel_blocks?.name || '',
  hostelBlockId: row.hostel_block_id,
  academicYear: row.academic_year,
  feeCategory: row.fee_category,
  roomType: row.room_type,
  acType: row.ac_type,
  residentCategory: row.resident_category,
  monthlyHostelFee: toNumber(row.monthly_hostel_fee),
  messFee: toNumber(row.mess_fee),
  electricityFee: toNumber(row.electricity_fee),
  maintenanceFee: toNumber(row.maintenance_fee),
  securityDeposit: toNumber(row.security_deposit),
  lateFee: toNumber(row.late_fee),
  otherCharges: toNumber(row.other_charges),
  totalFee: toNumber(row.total_fee),
  effectiveFrom: row.effective_from,
  effectiveTo: row.effective_to,
  status: row.status,
});

const formatResidentFee = (row) => {
  const totalFee = toNumber(row.total_fee ?? row.total_amount);
  const paidAmount = toNumber(row.amount_paid ?? row.paid_amount);
  const pendingAmount = toNumber(row.pending_amount ?? Math.max(0, totalFee - paidAmount));
  const status = formatStatus(row.payment_status ?? row.status, row.due_date, pendingAmount);

  return {
    id: row.id,
    feeStructureId: row.fee_structure_id,
    feeId: row.id,
    studentId: row.student_id,
    residentName: row.resident_name || row.students?.full_name || 'Unknown',
    registrationNumber: row.registration_number || row.students?.roll_number || '',
    hostelBlock: row.hostel_blocks?.name || row.block_name || '',
    roomNumber: row.room_number || row.hostel_rooms?.room_number || '',
    roomType: row.room_type || row.hostel_rooms?.room_type || '',
    acType: row.ac_type || row.hostel_rooms?.ac_type || '',
    academicYear: row.academic_year,
    feeCategory: row.fee_type || row.fee_category || '',
    totalFee,
    paidAmount,
    pendingAmount,
    dueDate: row.due_date,
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    receiptNumber: row.receipt_number,
    paymentStatus: status,
    monthlyHostelFee: toNumber(row.monthly_hostel_fee),
    messFee: toNumber(row.mess_fee),
    electricityFee: toNumber(row.electricity_fee),
    maintenanceFee: toNumber(row.maintenance_fee),
    securityDeposit: toNumber(row.security_deposit),
    lateFee: toNumber(row.late_fee),
    otherCharges: toNumber(row.other_charges),
    blockId: row.block_id,
    roomId: row.room_id,
    residentCategory: row.resident_category,
    createdAt: row.created_at,
  };
};

const buildFeeQuery = () =>
  supabase
    .from('hostel_fees')
    .select(`
      *,
      students(id, full_name, roll_number),
      hostel_blocks(id, name),
      hostel_rooms(id, room_number, room_type, ac_type)
    `)
    .order('created_at', { ascending: false });

const pushSystemNotification = async (title, type, time = 'Just now') => {
  try {
    await supabase.from('system_notifications').insert([{ id: `HN-${Date.now() % 1000000}`, title, type, time, unread: true }]);
  } catch (error) {
    console.error('Failed to create system notification:', error);
  }
};

const sendHostelPaymentNotification = async (fee, amount, nextStatus) => {
  try {
    const studentId = fee.student_id;
    if (!studentId) return;

    const { data: student } = await supabase
      .from('students')
      .select('full_name, email, parent_email, user_id')
      .eq('id', studentId)
      .maybeSingle();

    if (student) {
      dispatchNotification({
        userId: student.user_id,
        studentId,
        email: student.email,
        parentEmail: student.parent_email,
        type: 'Fee',
        title: 'Hostel Fee Payment Recorded',
        message: `Dear ${student.full_name}, we have recorded a payment of ₹${toNumber(amount).toLocaleString('en-IN')} towards your hostel fee. Updated status: ${nextStatus}.`,
        priority: 'Medium'
      });
    }
  } catch (err) {
    console.error('sendHostelPaymentNotification error:', err);
  }
};

export const listFeeStructures = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fee_structures')
      .select('*, hostel_blocks(id, name)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, data: (data || []).map(formatFeeStructure) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee structures', error: error.message });
  }
};

export const createFeeStructure = async (req, res) => {
  try {
    const payload = req.body || {};
    const numericFields = ['monthly_hostel_fee', 'mess_fee', 'electricity_fee', 'maintenance_fee', 'security_deposit', 'late_fee', 'other_charges'];
    numericFields.forEach((field) => {
      if (toNumber(payload[field]) < 0) {
        throw new Error(`${field} cannot be negative`);
      }
    });

    const duplicateCheck = await supabase
      .from('fee_structures')
      .select('id')
      .eq('hostel_block_id', payload.hostel_block_id)
      .eq('academic_year', payload.academic_year)
      .eq('fee_category', payload.fee_category)
      .eq('room_type', payload.room_type)
      .eq('ac_type', payload.ac_type)
      .eq('resident_category', payload.resident_category)
      .eq('effective_from', payload.effective_from)
      .maybeSingle();

    if (duplicateCheck.data) {
      return res.status(409).json({ success: false, message: 'A fee structure already exists for this block, room type, category, and effective date.' });
    }

    const insertPayload = {
      fee_structure_code: payload.fee_structure_code || `FS-${Date.now() % 1000000}`,
      hostel_block_id: payload.hostel_block_id,
      academic_year: payload.academic_year,
      fee_category: payload.fee_category,
      room_type: payload.room_type,
      ac_type: payload.ac_type,
      resident_category: payload.resident_category,
      monthly_hostel_fee: toNumber(payload.monthly_hostel_fee),
      mess_fee: toNumber(payload.mess_fee),
      electricity_fee: toNumber(payload.electricity_fee),
      maintenance_fee: toNumber(payload.maintenance_fee),
      security_deposit: toNumber(payload.security_deposit),
      late_fee: toNumber(payload.late_fee),
      other_charges: toNumber(payload.other_charges),
      effective_from: payload.effective_from,
      effective_to: payload.effective_to || null,
      status: payload.status || 'Active',
      notes: payload.notes || null,
    };

    const { data, error } = await supabase.from('fee_structures').insert([insertPayload]).select('*, hostel_blocks(id, name)').single();
    if (error) throw error;

    await pushSystemNotification(`Fee structure created for ${payload.academic_year}.`, 'Fee');

    res.status(201).json({ success: true, message: 'Fee structure created successfully', data: formatFeeStructure(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create fee structure', error: error.message });
  }
};

export const updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const updatePayload = {
      academic_year: payload.academic_year,
      fee_category: payload.fee_category,
      room_type: payload.room_type,
      ac_type: payload.ac_type,
      resident_category: payload.resident_category,
      monthly_hostel_fee: payload.monthly_hostel_fee !== undefined ? toNumber(payload.monthly_hostel_fee) : undefined,
      mess_fee: payload.mess_fee !== undefined ? toNumber(payload.mess_fee) : undefined,
      electricity_fee: payload.electricity_fee !== undefined ? toNumber(payload.electricity_fee) : undefined,
      maintenance_fee: payload.maintenance_fee !== undefined ? toNumber(payload.maintenance_fee) : undefined,
      security_deposit: payload.security_deposit !== undefined ? toNumber(payload.security_deposit) : undefined,
      late_fee: payload.late_fee !== undefined ? toNumber(payload.late_fee) : undefined,
      other_charges: payload.other_charges !== undefined ? toNumber(payload.other_charges) : undefined,
      effective_from: payload.effective_from,
      effective_to: payload.effective_to ?? null,
      status: payload.status,
      notes: payload.notes ?? null,
    };

    Object.keys(updatePayload).forEach((key) => updatePayload[key] === undefined && delete updatePayload[key]);

    const { data, error } = await supabase.from('fee_structures').update(updatePayload).eq('id', id).select('*, hostel_blocks(id, name)').single();
    if (error) throw error;

    await pushSystemNotification('Fee structure updated.', 'Fee');

    res.json({ success: true, message: 'Fee structure updated successfully', data: formatFeeStructure(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update fee structure', error: error.message });
  }
};

export const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('fee_structures').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Fee structure deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete fee structure', error: error.message });
  }
};

export const listResidentFees = async (req, res) => {
  try {
    const { search, status, academicYear, hostelBlock, roomNumber, registrationNumber, startDate, endDate } = req.query;
    let query = buildFeeQuery();

    if (status && status !== 'All Status') query = query.or(`status.eq.${status},payment_status.eq.${status}`);
    if (academicYear) query = query.eq('academic_year', academicYear);
    if (roomNumber) query = query.ilike('room_number', `%${roomNumber}%`);
    if (registrationNumber) query = query.ilike('registration_number', `%${registrationNumber}%`);
    if (startDate) query = query.gte('due_date', startDate);
    if (endDate) query = query.lte('due_date', endDate);

    const { data, error } = await query;
    if (error) throw error;

    let records = (data || []).map(formatResidentFee);
    if (search) {
      const q = String(search).toLowerCase();
      records = records.filter((fee) => [fee.residentName, fee.registrationNumber, fee.hostelBlock, fee.roomNumber].join(' ').toLowerCase().includes(q));
    }
    if (hostelBlock && hostelBlock !== 'All Blocks') {
      records = records.filter((fee) => fee.hostelBlock === hostelBlock);
    }

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resident fees', error: error.message });
  }
};

export const assignFeeToResident = async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { academicYear } = req.body;

    const { data: allocation, error: allocationError } = await supabase
      .from('hostel_allocations')
      .select(`
        *,
        students(id, full_name, roll_number, department, year, semester),
        hostel_blocks(id, name),
        hostel_rooms(id, room_number, room_type, type, ac_type)
      `)
      .eq('id', allocationId)
      .maybeSingle();
    if (allocationError) throw allocationError;
    if (!allocation) return res.status(404).json({ success: false, message: 'Resident allocation not found' });

    const roomType = allocation.hostel_rooms?.room_type || allocation.hostel_rooms?.type || '';
    const acType = allocation.hostel_rooms?.ac_type || (String(roomType).toLowerCase().includes('ac') ? 'AC' : 'Non-AC');
    const year = academicYear || allocation.academic_year;

    const { data: feeStructure, error: structureError } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('hostel_block_id', allocation.block_id)
      .eq('academic_year', year)
      .eq('room_type', roomType)
      .eq('ac_type', acType)
      .eq('status', 'Active')
      .maybeSingle();
    if (structureError) throw structureError;
    if (!feeStructure) {
      return res.status(404).json({ success: false, message: 'No active fee structure found for this resident.' });
    }

    const { data: existingFee } = await supabase
      .from('hostel_fees')
      .select('id')
      .eq('student_id', allocation.student_id)
      .eq('academic_year', year)
      .eq('fee_structure_id', feeStructure.id)
      .maybeSingle();

    if (existingFee) {
      return res.status(409).json({ success: false, message: 'Fee already assigned for this resident and academic year.' });
    }

    const totalFee = toNumber(feeStructure.total_fee);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);

    const insertPayload = {
      student_id: allocation.student_id,
      hostel_id: allocation.hostel_id,
      block_id: allocation.block_id,
      room_id: allocation.room_id,
      fee_structure_id: feeStructure.id,
      resident_category: feeStructure.resident_category,
      academic_year: year,
      resident_name: allocation.students?.full_name,
      registration_number: allocation.students?.roll_number,
      room_number: allocation.hostel_rooms?.room_number,
      room_type: roomType,
      ac_type: acType,
      fee_type: feeStructure.fee_category,
      monthly_hostel_fee: toNumber(feeStructure.monthly_hostel_fee),
      mess_fee: toNumber(feeStructure.mess_fee),
      electricity_fee: toNumber(feeStructure.electricity_fee),
      maintenance_fee: toNumber(feeStructure.maintenance_fee),
      security_deposit: toNumber(feeStructure.security_deposit),
      late_fee: toNumber(feeStructure.late_fee),
      other_charges: toNumber(feeStructure.other_charges),
      total_fee: totalFee,
      total_amount: totalFee,
      amount_paid: 0,
      paid_amount: 0,
      pending_amount: totalFee,
      due_date: dueDate.toISOString().split('T')[0],
      payment_method: null,
      payment_status: 'Pending',
      status: 'Pending',
      effective_from: feeStructure.effective_from,
      effective_to: feeStructure.effective_to,
    };

    const { data, error } = await supabase.from('hostel_fees').insert([insertPayload]).select(`*, students(id, full_name, roll_number), hostel_blocks(id, name), hostel_rooms(id, room_number, room_type, ac_type)`).single();
    if (error) throw error;

    await pushSystemNotification(`Fee assigned to ${allocation.students?.full_name}.`, 'Fee');

    try {
      const { data: student } = await supabase
        .from('students')
        .select('full_name, email, parent_email, user_id')
        .eq('id', allocation.student_id)
        .maybeSingle();

      if (student) {
        dispatchNotification({
          userId: student.user_id,
          studentId: allocation.student_id,
          email: student.email,
          parentEmail: student.parent_email,
          type: 'Fee',
          title: 'Hostel Fee Assigned',
          message: `Dear ${student.full_name}, your hostel fee structure has been initialized. Amount due: ₹${totalFee.toLocaleString('en-IN')}, due by ${dueDate.toISOString().split('T')[0]}.`,
          priority: 'High'
        });
      }
    } catch (notifErr) {
      console.error('Failed to dispatch fee assignment notification:', notifErr);
    }

    res.status(201).json({ success: true, message: 'Fee assigned to resident successfully', data: formatResidentFee(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign fee to resident', error: error.message });
  }
};

export const recordPayment = async (req, res) => {
  const { id } = req.params;
  const { amount, paymentMethod, transactionId } = req.body;

  if (toNumber(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
  }

  // If a Postgres pool is available, run the update + insert inside a DB transaction
  if (db) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Lock the fee row
      const feeRes = await client.query('SELECT * FROM hostel_fees WHERE id = $1 FOR UPDATE', [id]);
      if (feeRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Fee record not found' });
      }
      const fee = feeRes.rows[0];

      // Duplicate transaction check
      if (transactionId) {
        const dup = await client.query('SELECT id FROM hostel_fee_payments WHERE transaction_id = $1', [transactionId]);
        if (dup.rowCount > 0) {
          await client.query('ROLLBACK');
          return res.status(409).json({ success: false, message: 'Duplicate transaction ID detected.' });
        }
      }

      const currentPaid = toNumber(fee.amount_paid ?? fee.paid_amount);
      const totalFee = toNumber(fee.total_fee ?? fee.total_amount);
      const nextPaid = Math.min(totalFee, currentPaid + toNumber(amount));
      const nextPending = Math.max(0, totalFee - nextPaid);
      const nextStatus = formatStatus(nextPaid >= totalFee ? 'Paid' : nextPaid > 0 ? 'Partially Paid' : 'Pending', fee.due_date, nextPending);
      const generatedTransactionId = transactionId || `HF-TXN-${Date.now() % 1000000}`;
      const generatedReceipt = fee.receipt_number || `HF-REC-${Date.now() % 1000000}`;

      const now = new Date().toISOString();

      const updateRes = await client.query(
        `UPDATE hostel_fees SET amount_paid = $1, paid_amount = $1, pending_amount = $2, payment_method = $3, transaction_id = $4, receipt_number = $5, payment_date = $6, payment_status = $7, status = $7 WHERE id = $8 RETURNING *`,
        [nextPaid, nextPending, paymentMethod || fee.payment_method, generatedTransactionId, generatedReceipt, now, nextStatus, id]
      );

      if (updateRes.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new Error('Failed to update fee record');
      }

      // Insert payment history
      const insertRes = await client.query(
        `INSERT INTO hostel_fee_payments (fee_id, student_id, hostel_block_id, room_id, resident_name, registration_number, room_number, total_fee, amount_paid, pending_amount, payment_date, payment_method, transaction_id, receipt_number, payment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [
          id,
          fee.student_id || null,
          fee.block_id || fee.hostel_block_id || null,
          fee.room_id || null,
          fee.resident_name || fee.resident_name || null,
          fee.registration_number || null,
          fee.room_number || null,
          totalFee,
          toNumber(amount),
          nextPending,
          now,
          paymentMethod,
          generatedTransactionId,
          generatedReceipt,
          nextStatus,
        ]
      );

      await client.query('COMMIT');

      // Notify and return fresh fee object via supabase query for consistent shape
      await pushSystemNotification(`Fee payment received for ${fee.resident_name || 'resident'}.`, nextStatus === 'Paid' ? 'Fee' : 'Alert');
      sendHostelPaymentNotification(fee, amount, nextStatus);

      const { data: freshFee } = await buildFeeQuery().eq('id', id).maybeSingle();
      const insertedPayment = insertRes.rows && insertRes.rows[0] ? insertRes.rows[0] : null;
      return res.json({ success: true, message: 'Payment recorded successfully', data: formatResidentFee(freshFee), payment: insertedPayment });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (e) {
        // ignore
      }
      console.error('Transactional payment error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record payment', error: err.message });
    } finally {
      client.release();
    }
  }

  // Fallback to Supabase-based implementation when no DB pool is configured
  try {
    const { data: fee, error: feeError } = await buildFeeQuery().eq('id', id).maybeSingle();
    if (feeError) throw feeError;
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

    if (transactionId) {
      const { data: duplicatePayment } = await supabase.from('hostel_fee_payments').select('id').eq('transaction_id', transactionId).maybeSingle();
      if (duplicatePayment) {
        return res.status(409).json({ success: false, message: 'Duplicate transaction ID detected.' });
      }
    }

    const currentPaid = toNumber(fee.amount_paid ?? fee.paid_amount);
    const totalFee = toNumber(fee.total_fee ?? fee.total_amount);
    const nextPaid = Math.min(totalFee, currentPaid + toNumber(amount));
    const nextPending = Math.max(0, totalFee - nextPaid);
    const nextStatus = formatStatus(nextPaid >= totalFee ? 'Paid' : nextPaid > 0 ? 'Partially Paid' : 'Pending', fee.due_date, nextPending);
    const generatedTransactionId = transactionId || `HF-TXN-${Date.now() % 1000000}`;
    const generatedReceipt = fee.receipt_number || `HF-REC-${Date.now() % 1000000}`;

    const { data, error } = await supabase
      .from('hostel_fees')
      .update({
        amount_paid: nextPaid,
        paid_amount: nextPaid,
        pending_amount: nextPending,
        payment_method: paymentMethod || fee.payment_method,
        transaction_id: generatedTransactionId,
        receipt_number: generatedReceipt,
        payment_date: new Date().toISOString(),
        payment_status: nextStatus,
        status: nextStatus,
      })
      .eq('id', id)
      .select(`*, students(id, full_name, roll_number), hostel_blocks(id, name), hostel_rooms(id, room_number, room_type, ac_type)`)
      .single();
    if (error) throw error;

    // Record payment history for audit/receipts
    let insertedPayment = null;
    try {
      const paymentRow = {
        fee_id: id,
        student_id: fee.student_id || null,
        hostel_block_id: fee.block_id || fee.hostel_block_id || null,
        room_id: fee.room_id || null,
        resident_name: fee.resident_name || fee.students?.full_name || 'Resident',
        registration_number: fee.registration_number || fee.students?.roll_number || null,
        room_number: fee.room_number || fee.hostel_rooms?.room_number || null,
        total_fee: totalFee,
        amount_paid: toNumber(amount),
        pending_amount: nextPending,
        payment_date: new Date().toISOString(),
        payment_method: paymentMethod,
        transaction_id: generatedTransactionId,
        receipt_number: generatedReceipt,
        payment_status: nextStatus,
      };

      const { data: paymentData, error: paymentError } = await supabase.from('hostel_fee_payments').insert([paymentRow]).select().maybeSingle();
      if (paymentError) {
        console.error('Failed to insert payment history:', paymentError);
      }

      insertedPayment = paymentData || null;
    } catch (err) {
      console.error('Unexpected error inserting payment history:', err);
    }

    await pushSystemNotification(`Fee payment received for ${fee.resident_name || fee.students?.full_name || 'resident'}.`, nextStatus === 'Paid' ? 'Fee' : 'Alert');
    sendHostelPaymentNotification(fee, amount, nextStatus);

    return res.json({ success: true, message: 'Payment recorded successfully', data: formatResidentFee(data), payment: insertedPayment || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  }
};

export const listFeePayments = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sort = 'payment_date',
      order = 'desc',
      paymentMethod,
      transactionId,
      fromDate,
      toDate,
      search,
    } = req.query;

    const pageInt = Math.max(1, parseInt(page, 10) || 1);
    const limitInt = Math.max(1, Math.min(200, parseInt(limit, 10) || 20));
    const start = (pageInt - 1) * limitInt;
    const end = start + limitInt - 1;

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('hostel_fee_payments')
      .select('id', { count: 'exact', head: true })
      .eq('fee_id', id);

    // Build query with filters
    let query = supabase.from('hostel_fee_payments').select('*').eq('fee_id', id);
    if (paymentMethod) query = query.eq('payment_method', paymentMethod);
    if (transactionId) query = query.ilike('transaction_id', `%${transactionId}%`);
    if (fromDate) query = query.gte('payment_date', fromDate);
    if (toDate) query = query.lte('payment_date', toDate);
    if (search) {
      const q = String(search).trim();
      query = query.or(`resident_name.ilike.%${q}%,registration_number.ilike.%${q}%`);
    }

    const { data, error } = await query.order(sort, { ascending: order === 'asc' }).range(start, end);
    if (error) throw error;

    res.json({ success: true, data: data || [], meta: { total: totalCount || 0, page: pageInt, limit: limitInt } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee payments', error: error.message });
  }
};

export const getFeeDashboard = async (req, res) => {
  try {
    const { data, error } = await buildFeeQuery();
    if (error) throw error;

    const fees = (data || []).map(formatResidentFee);
    const totalCollected = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const totalPending = fees.reduce((sum, fee) => sum + fee.pendingAmount, 0);
    const overduePayments = fees.filter((fee) => fee.paymentStatus === 'Overdue').length;
    const collectionPercentage = totalCollected + totalPending > 0 ? Math.round((totalCollected / (totalCollected + totalPending)) * 100) : 0;

    const monthMap = new Map();
    fees.forEach((fee) => {
      const dt = new Date(fee.paymentDate || fee.dueDate || new Date());
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { month: dt.toLocaleString('en-US', { month: 'short' }), collected: 0, pending: 0 });
      }
      const bucket = monthMap.get(key);
      bucket.collected += fee.paidAmount;
      bucket.pending += fee.pendingAmount;
    });

    res.json({
      success: true,
      data: {
        totalFeesCollected: totalCollected,
        pendingFees: totalPending,
        overduePayments,
        collectionPercentage,
        monthlyCollection: Array.from(monthMap.values()),
        revenueStatistics: {
          totalRecords: fees.length,
          paidCount: fees.filter((fee) => fee.paymentStatus === 'Paid').length,
          pendingCount: fees.filter((fee) => fee.paymentStatus === 'Pending').length,
          partialCount: fees.filter((fee) => fee.paymentStatus === 'Partially Paid').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee dashboard', error: error.message });
  }
};

export const getFeeNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fee_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee notifications', error: error.message });
  }
};
