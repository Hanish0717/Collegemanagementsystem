import { supabase } from '../config/supabase.js';
import { randomUUID } from 'crypto';

// Helper to generate RFC4122 standard UUIDs
const generateUUID = () => {
  try {
    return randomUUID();
  } catch (e) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
};

// Helper: Add Student Notification
const addStudentNotification = async (studentId, title, type, priority = 'Medium') => {
  try {
    const id = `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const time = 'Just now';
    await supabase.from('student_notifications').insert([{
      id,
      title,
      type,
      priority,
      time,
      unread: true,
      student_id: studentId
    }]);
  } catch (error) {
    console.error('Error adding student notification:', error);
  }
};

/**
 * @desc Get ID Card Dashboard Stats and Chart Data
 * @route GET /api/library/id-cards/stats
 */
export const getIdCardStats = async (req, res, next) => {
  try {
    const DUMMY_EMAILS = ['aarav@college.com', 'priya@college.com', 'ethan@college.com', 'sofia@college.com'];
    const DUMMY_ROLLS = ['CS100002', 'CS100003', 'CS100004', 'CS100005'];

    const { data: rawStudents = [] } = await supabase.from('students').select('*').eq('is_active', true);
    const students = rawStudents.filter(s => !DUMMY_EMAILS.includes(s.email) && !DUMMY_ROLLS.includes(s.roll_number));
    const { data: idCards = [] } = await supabase.from('id_cards').select('*');
    const { data: requests = [] } = await supabase.from('id_card_requests').select('*');
    const { data: payments = [] } = await supabase.from('id_card_payments').select('*');

    const totalStudents = students.length;
    const totalIssued = idCards.filter(c => c.status === 'Active').length;
    const pendingCards = requests.filter(r => r.status === 'Pending').length;
    const lostCards = idCards.filter(c => c.status === 'Lost').length;
    const duplicateIssued = idCards.filter(c => c.card_type === 'Duplicate').length;
    
    const now = new Date();
    const expiredCards = idCards.filter(c => c.status === 'Expired' || new Date(c.expiry_date) < now).length;
    
    const todayStr = now.toDateString();
    const todayRequests = requests.filter(r => new Date(r.created_at).toDateString() === todayStr).length;
    const todayPrinted = idCards.filter(c => c.print_status === 'Printed' && new Date(c.updated_at).toDateString() === todayStr).length;
    
    const totalAmountCollected = payments.filter(p => p.payment_status === 'Paid').reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingPayments = payments.filter(p => p.payment_status === 'Pending').reduce((sum, p) => sum + Number(p.amount), 0);

    // Join cards with students to get departments
    const studentMap = {};
    students.forEach(s => {
      studentMap[s.id] = s;
    });

    // 1. Department-wise Cards count
    const deptCounts = {};
    idCards.forEach(c => {
      if (c.status === 'Active') {
        const s = studentMap[c.student_id];
        if (s && s.department) {
          deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
        }
      }
    });
    const departmentWise = Object.keys(deptCounts).map(dept => ({
      department: dept,
      count: deptCounts[dept]
    }));

    // 2. Monthly ID Cards Issued
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = {};
    
    // Initialize past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      monthlyCounts[mLabel] = 0;
    }

    idCards.forEach(c => {
      if (c.status === 'Active' || c.print_status === 'Printed') {
        const date = new Date(c.issue_date || c.created_at);
        const mLabel = `${months[date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
        if (monthlyCounts[mLabel] !== undefined) {
          monthlyCounts[mLabel]++;
        }
      }
    });

    const monthlyIssued = Object.keys(monthlyCounts).map(month => ({
      month,
      count: monthlyCounts[month]
    }));

    // 3. Payment collection by date
    const payCounts = {};
    payments.forEach(p => {
      if (p.payment_status === 'Paid') {
        const dateStr = new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        payCounts[dateStr] = (payCounts[dateStr] || 0) + Number(p.amount);
      }
    });
    const paymentCollection = Object.keys(payCounts).slice(-10).map(date => ({
      date,
      amount: payCounts[date]
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalIssued,
          pendingCards,
          lostCards,
          duplicateIssued,
          expiredCards,
          todayRequests,
          todayPrinted,
          totalAmountCollected,
          pendingPayments
        },
        charts: {
          monthlyIssued,
          pendingVsIssued: [
            { name: 'Issued', value: totalIssued },
            { name: 'Pending Requests', value: pendingCards }
          ],
          departmentWise,
          paymentCollection
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Search students for ID Card Management
 * @route GET /api/library/id-cards/students/search
 */
export const searchStudents = async (req, res, next) => {
  try {
    const { q } = req.query;
    const searchStr = (q || '').trim();

    const DUMMY_EMAILS = ['aarav@college.com', 'priya@college.com', 'ethan@college.com', 'sofia@college.com'];
    const DUMMY_ROLLS = ['CS100002', 'CS100003', 'CS100004', 'CS100005'];

    // Query active students
    const { data: rawStudents = [] } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    const students = rawStudents.filter(s => 
      !DUMMY_EMAILS.includes(s.email) && !DUMMY_ROLLS.includes(s.roll_number)
    );

    // If query provided, filter; otherwise return all real active students
    const filtered = searchStr === '' ? students : students.filter(s => {
      return (
        s.full_name?.toLowerCase().includes(searchStr.toLowerCase()) ||
        s.roll_number?.toLowerCase().includes(searchStr.toLowerCase()) ||
        s.admission_number?.toLowerCase().includes(searchStr.toLowerCase()) ||
        s.phone_number?.includes(searchStr) ||
        s.email?.toLowerCase().includes(searchStr.toLowerCase()) ||
        s.department?.toLowerCase().includes(searchStr.toLowerCase())
      );
    });

    if (filtered.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get active ID cards for these students
    const studentIds = filtered.map(s => s.id);
    const { data: idCards = [] } = await supabase
      .from('id_cards')
      .select('*')
      .in('student_id', studentIds);

    const cardMap = {};
    idCards.forEach(c => {
      // Keep active card, or latest card
      if (!cardMap[c.student_id] || c.status === 'Active') {
        cardMap[c.student_id] = c;
      }
    });

    const result = filtered.map(s => ({
      id: s.id,
      fullName: s.full_name,
      rollNumber: s.roll_number,
      admissionNumber: s.admission_number,
      email: s.email,
      phoneNumber: s.phone_number,
      department: s.department,
      year: s.year,
      semester: s.semester,
      section: s.section,
      profileImage: s.profile_image,
      idCard: cardMap[s.id] || null
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get complete student profile and ID card history
 * @route GET /api/library/id-cards/students/:studentId
 */
export const getStudentProfile = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .eq('is_active', true)
      .maybeSingle();

    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      return next(err);
    }

    const { data: idCards = [] } = await supabase.from('id_cards').select('*').eq('student_id', studentId);
    const { data: requests = [] } = await supabase.from('id_card_requests').select('*').eq('student_id', studentId);
    const { data: duplicateLogs = [] } = await supabase.from('duplicate_id_cards').select('*').eq('student_id', studentId);
    const { data: payments = [] } = await supabase.from('id_card_payments').select('*').eq('student_id', studentId);
    const { data: missingLogs = [] } = await supabase.from('missing_id_cards').select('*').eq('student_id', studentId);

    // Print history for all student cards
    const cardIds = idCards.map(c => c.id);
    let printHistory = [];
    if (cardIds.length > 0) {
      const { data: prints = [] } = await supabase.from('id_card_print_history').select('*').in('card_id', cardIds);
      printHistory = prints;
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          fullName: student.full_name,
          rollNumber: student.roll_number,
          admissionNumber: student.admission_number,
          email: student.email,
          phoneNumber: student.phone_number,
          department: student.department,
          year: student.year,
          semester: student.semester,
          section: student.section,
          parentName: student.parent_name,
          parentPhone: student.parent_phone,
          parentEmail: student.parent_email,
          profileImage: student.profile_image
        },
        idCards,
        requests,
        duplicateLogs,
        payments,
        missingLogs,
        printHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new ID card request (New or Duplicate)
 * @route POST /api/library/id-cards/requests
 */
export const createIdCardRequest = async (req, res, next) => {
  try {
    const { studentId, requestType, reason } = req.body;
    if (!studentId || !requestType) {
      const err = new Error('Missing required fields');
      err.statusCode = 400;
      return next(err);
    }

    // Check if there is already a pending request for non-New requests
    if (requestType !== 'New') {
      const { data: pending } = await supabase
        .from('id_card_requests')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'Pending')
        .maybeSingle();

      if (pending) {
        const err = new Error('A pending ID card request already exists for this student');
        err.statusCode = 400;
        return next(err);
      }
    } else {
      // For 'New' requests, cancel any old pending requests
      await supabase
        .from('id_card_requests')
        .update({ status: 'Approved', updated_at: new Date().toISOString() })
        .eq('student_id', studentId)
        .eq('status', 'Pending');
    }

    const requiresPayment = requestType === 'Duplicate' || requestType === 'Replacement';
    const paymentStatus = requiresPayment ? 'Pending' : 'Waived';
    const initialStatus = 'Pending';

    const { data: request, error: reqErr } = await supabase
      .from('id_card_requests')
      .insert([{
        id: generateUUID(),
        student_id: studentId,
        request_type: requestType,
        reason: reason || 'Initial card issuance',
        status: initialStatus,
        payment_status: paymentStatus,
        rejection_reason: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (reqErr) throw reqErr;

    await addStudentNotification(studentId, `Your ID Card request (${requestType}) has been submitted and is pending approval.`, 'Library');

    return res.status(201).json({
      success: true,
      message: 'ID Card request submitted successfully. Sent to Pending Approval.',
      data: request
    });

    // If duplicate, also create a payment record
    if (requiresPayment) {
      const chargeAmount = 150.00; // Fixed fee for duplicate card
      await supabase.from('id_card_payments').insert([{
        id: generateUUID(),
        request_id: request.id,
        student_id: studentId,
        amount: chargeAmount,
        payment_method: 'Cash',
        payment_status: 'Pending',
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }]);
    }

    await addStudentNotification(studentId, `Your ID Card (${requestType}) has been issued. Status: ${initialStatus}.`, 'Library');

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Approve or Reject ID card request
 * @route PUT /api/library/id-cards/requests/:requestId/status
 */
export const approveRejectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      const err = new Error('Invalid status value');
      err.statusCode = 400;
      return next(err);
    }

    const { data: request } = await supabase
      .from('id_card_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (!request) {
      const err = new Error('Request not found');
      err.statusCode = 404;
      return next(err);
    }

    if (request.status !== 'Pending') {
      const err = new Error('Request has already been processed');
      err.statusCode = 400;
      return next(err);
    }

    // For approval of Duplicate card, payment must be Paid or Waived
    if (status === 'Approved' && request.request_type === 'Duplicate' && request.payment_status === 'Pending') {
      const err = new Error('Cannot approve duplicate request. Payment is still pending.');
      err.statusCode = 400;
      return next(err);
    }

    const { data: updatedRequest, error: updateErr } = await supabase
      .from('id_card_requests')
      .update({
        status,
        rejection_reason: status === 'Rejected' ? (rejectionReason || 'No reason provided') : '',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Send Notification
    await addStudentNotification(
      request.student_id,
      `Your ID Card request has been ${status.toLowerCase()}.${status === 'Rejected' ? ' Reason: ' + rejectionReason : ''}`,
      'Library'
    );

    // If approved, create/activate the actual ID Card!
    if (status === 'Approved') {
      let { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', request.student_id)
        .maybeSingle();

      if (!student) {
        const { data: allStudents = [] } = await supabase.from('students').select('*');
        student = allStudents.find(s => s.id === request.student_id) || {
          id: request.student_id,
          full_name: 'Student Demo',
          roll_number: 'CS100001',
          department: 'CSE'
        };
      }

      // Deactivate any previous active cards for this student
      await supabase
        .from('id_cards')
        .update({ status: 'Blocked', updated_at: new Date().toISOString() })
        .eq('student_id', request.student_id)
        .eq('status', 'Active');

      const rollClean = String(student.roll_number || student.full_name || 'CS100001').replace(/\s+/g, '');
      const cardNo = `IDC${rollClean}`;
      
      // Card expires in 4 years
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 4);

      // Barcode content and QR code content
      const barcodeStr = `BAR-${rollClean}`;
      const qrData = JSON.stringify({
        name: student.full_name || 'Student',
        roll: student.roll_number || rollClean,
        dept: student.department || 'CSE',
        cardNo: cardNo
      });

      // Check if card record already exists for student
      const { data: existingCards = [] } = await supabase
        .from('id_cards')
        .select('*')
        .eq('student_id', request.student_id);

      let createdCard;
      if (existingCards.length > 0) {
        const { data: updated } = await supabase
          .from('id_cards')
          .update({
            card_number: cardNo,
            barcode: barcodeStr,
            qr_code: qrData,
            issue_date: new Date().toISOString(),
            expiry_date: expiry.toISOString(),
            status: 'Active',
            card_type: request.request_type === 'Duplicate' ? 'Duplicate' : 'Regular',
            print_status: 'Pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCards[0].id)
          .select()
          .single();
        createdCard = updated;
      } else {
        const { data: inserted } = await supabase.from('id_cards').insert([{
          id: generateUUID(),
          student_id: request.student_id,
          card_number: cardNo,
          barcode: barcodeStr,
          qr_code: qrData,
          issue_date: new Date().toISOString(),
          expiry_date: expiry.toISOString(),
          status: 'Active',
          card_type: request.request_type === 'Duplicate' ? 'Duplicate' : 'Regular',
          print_status: 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]).select().single();
        createdCard = inserted;
      }

      // If duplicate request, create duplicate log
      if (request.request_type === 'Duplicate') {
        const { data: prevCards = [] } = await supabase
          .from('id_cards')
          .select('*')
          .eq('student_id', request.student_id)
          .neq('id', createdCard ? createdCard.id : '')
          .order('created_at', { ascending: false });

        const prevCardNo = prevCards.length > 0 ? prevCards[0].card_number : 'Unknown';

        await supabase.from('duplicate_id_cards').insert([{
          id: generateUUID(),
          request_id: requestId,
          student_id: request.student_id,
          previous_card_number: prevCardNo,
          reason: request.reason || 'Replacement requested',
          charge_amount: 150.00,
          created_at: new Date().toISOString()
        }]);
      }
    }

    res.status(200).json({
      success: true,
      message: `Request successfully ${status.toLowerCase()}`,
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Collect payment for Duplicate Card
 * @route POST /api/library/id-cards/payments
 */
export const collectPayment = async (req, res, next) => {
  try {
    const { requestId, amount, paymentMethod, transactionId } = req.body;
    if (!requestId || !amount || !paymentMethod) {
      const err = new Error('Missing required fields');
      err.statusCode = 400;
      return next(err);
    }

    // Check payment record
    const { data: payment } = await supabase
      .from('id_card_payments')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle();

    if (!payment) {
      const err = new Error('No payment record found for this request');
      err.statusCode = 404;
      return next(err);
    }

    if (payment.payment_status === 'Paid') {
      const err = new Error('Payment has already been made');
      err.statusCode = 400;
      return next(err);
    }

    const payId = payment.id;
    const txId = transactionId || `TXN${Date.now()}`;

    // Update payment record
    const { data: updatedPayment, error: payErr } = await supabase
      .from('id_card_payments')
      .update({
        payment_status: 'Paid',
        payment_method: paymentMethod,
        transaction_id: txId,
        payment_date: new Date().toISOString()
      })
      .eq('id', payId)
      .select()
      .single();

    if (payErr) throw payErr;

    // Update request payment status
    await supabase
      .from('id_card_requests')
      .update({ payment_status: 'Paid', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // Create receipt
    const receiptNo = `RCP-IDC-${Date.now()}`;
    const { data: receipt } = await supabase
      .from('id_card_receipts')
      .insert([{
        id: generateUUID(),
        payment_id: payId,
        receipt_number: receiptNo,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    // Auto-approve request since payment is made
    await addStudentNotification(payment.student_id, `Payment of ₹${amount} received for duplicate ID Card. Request is now ready for approval.`, 'Library');

    res.status(200).json({
      success: true,
      message: 'Payment received successfully',
      data: {
        payment: updatedPayment,
        receipt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reprint a card (logs reprint audit and marks printed)
 * @route POST /api/library/id-cards/reprint
 */
export const reprintCard = async (req, res, next) => {
  try {
    const { cardId, remarks } = req.body;
    if (!cardId) {
      const err = new Error('Missing cardId');
      err.statusCode = 400;
      return next(err);
    }

    const { data: card } = await supabase
      .from('id_cards')
      .select('*')
      .eq('id', cardId)
      .maybeSingle();

    if (!card) {
      const err = new Error('Card not found');
      err.statusCode = 404;
      return next(err);
    }

    // Insert reprint history
    const printBy = req.user?.id || null;
    await supabase.from('id_card_print_history').insert([{
      id: generateUUID(),
      card_id: cardId,
      printed_by: printBy,
      print_date: new Date().toISOString(),
      remarks: remarks || 'Card printed/reprinted',
      created_at: new Date().toISOString()
    }]);

    // Mark card as printed
    const { data: updatedCard } = await supabase
      .from('id_cards')
      .update({
        print_status: 'Printed',
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single();

    // Update request status to Printed if there is a matching approved request
    const { data: requests = [] } = await supabase
      .from('id_card_requests')
      .select('*')
      .eq('student_id', card.student_id)
      .eq('status', 'Approved');

    if (requests.length > 0) {
      await supabase
        .from('id_card_requests')
        .update({ status: 'Printed', updated_at: new Date().toISOString() })
        .eq('id', requests[0].id);
    }

    await addStudentNotification(card.student_id, `Your ID Card (${card.card_number}) has been printed. Please collect it from the library.`, 'Library');

    res.status(200).json({
      success: true,
      message: 'Card reprint registered',
      data: updatedCard
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update card status (Active, Blocked, Lost)
 * @route PUT /api/library/id-cards/cards/:cardId/status
 */
export const updateCardStatus = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { status, remarks } = req.body;

    if (!status || !['Active', 'Blocked', 'Lost'].includes(status)) {
      const err = new Error('Invalid status value');
      err.statusCode = 400;
      return next(err);
    }

    const { data: card } = await supabase
      .from('id_cards')
      .select('*')
      .eq('id', cardId)
      .maybeSingle();

    if (!card) {
      const err = new Error('Card not found');
      err.statusCode = 404;
      return next(err);
    }

    const { data: updatedCard, error: updateErr } = await supabase
      .from('id_cards')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // If status is Lost, record in missing_id_cards
    if (status === 'Lost') {
      await supabase.from('missing_id_cards').insert([{
        id: generateUUID(),
        student_id: card.student_id,
        card_number: card.card_number,
        reported_date: new Date().toISOString(),
        status: 'Lost',
        remarks: remarks || 'Card marked lost by librarian',
        created_at: new Date().toISOString()
      }]);
    }

    await addStudentNotification(card.student_id, `Your ID Card status has been changed to ${status}.`, 'Library');

    res.status(200).json({
      success: true,
      message: `Card status updated to ${status}`,
      data: updatedCard
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Register missing/lost ID Card
 * @route POST /api/library/id-cards/missing
 */
export const reportMissingCard = async (req, res, next) => {
  try {
    const { studentId, cardId, remarks } = req.body;
    if (!studentId || !cardId) {
      const err = new Error('Missing studentId or cardId');
      err.statusCode = 400;
      return next(err);
    }

    const { data: card } = await supabase
      .from('id_cards')
      .select('*')
      .eq('id', cardId)
      .maybeSingle();

    if (!card) {
      const err = new Error('Card not found');
      err.statusCode = 404;
      return next(err);
    }

    // Update card status to Lost
    await supabase
      .from('id_cards')
      .update({ status: 'Lost', updated_at: new Date().toISOString() })
      .eq('id', cardId);

    // Insert missing record
    const { data: missingRecord } = await supabase.from('missing_id_cards').insert([{
      id: generateUUID(),
      student_id: studentId,
      card_number: card.card_number,
      reported_date: new Date().toISOString(),
      status: 'Lost',
      remarks: remarks || 'Reported lost',
      created_at: new Date().toISOString()
    }]).select().single();

    await addStudentNotification(studentId, `Your ID Card (${card.card_number}) has been reported lost. A duplicate request can now be filed.`, 'Library');

    res.status(201).json({
      success: true,
      message: 'Card reported missing successfully',
      data: missingRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get complete audit log history
 * @route GET /api/library/id-cards/history
 */
export const getHistory = async (req, res, next) => {
  try {
    const { data: prints = [] } = await supabase.from('id_card_print_history').select('*');
    const { data: missing = [] } = await supabase.from('missing_id_cards').select('*');
    const { data: requests = [] } = await supabase.from('id_card_requests').select('*');
    const { data: students = [] } = await supabase.from('students').select('id, full_name, roll_number');

    const sMap = {};
    students.forEach(s => { sMap[s.id] = s; });

    const auditLog = [];

    // Map Print History
    prints.forEach(p => {
      auditLog.push({
        id: p.id,
        type: 'Print',
        date: p.print_date,
        description: `Card ID ${p.card_id} was printed.`,
        remarks: p.remarks,
        user: p.printed_by || 'Librarian'
      });
    });

    // Map Missing reports
    missing.forEach(m => {
      const s = sMap[m.student_id] || {};
      auditLog.push({
        id: m.id,
        type: 'Missing Report',
        date: m.reported_date,
        description: `Student ${s.full_name || 'Unknown'} (${s.roll_number || 'N/A'}) reported card ${m.card_number} lost.`,
        remarks: m.remarks,
        user: 'Student / Librarian'
      });
    });

    // Map Request submissions
    requests.forEach(r => {
      const s = sMap[r.student_id] || {};
      const studentName = s.full_name || 'Student Demo';
      const rollNumber = s.roll_number || 'CS100001';
      auditLog.push({
        id: r.id,
        requestId: r.id,
        studentId: r.student_id,
        status: r.status,
        requestType: r.request_type,
        studentName,
        rollNumber,
        type: 'Request Update',
        date: r.updated_at || r.created_at,
        description: `ID Card request (${r.request_type}) for ${studentName} (${rollNumber}) was updated to ${r.status}.`,
        remarks: r.rejection_reason || r.reason || '',
        user: 'System'
      });
    });

    // Sort by date descending
    auditLog.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get payment history
 * @route GET /api/library/id-cards/payments/history
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { data: payments = [] } = await supabase.from('id_card_payments').select('*');
    const { data: receipts = [] } = await supabase.from('id_card_receipts').select('*');
    const { data: students = [] } = await supabase.from('students').select('id, full_name, roll_number, department');

    const sMap = {};
    students.forEach(s => { sMap[s.id] = s; });

    const rMap = {};
    receipts.forEach(r => { rMap[r.payment_id] = r; });

    const history = payments.map(p => {
      const s = sMap[p.student_id] || {};
      const r = rMap[p.id] || null;
      return {
        id: p.id,
        studentName: s.full_name || 'Unknown',
        rollNumber: s.roll_number || 'N/A',
        department: s.department || 'N/A',
        amount: p.amount,
        paymentMethod: p.payment_method,
        transactionId: p.transaction_id,
        paymentStatus: p.payment_status,
        paymentDate: p.payment_date,
        receiptNumber: r ? r.receipt_number : null
      };
    });

    // Sort descending by payment date
    history.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Handover card to student (marks card delivery_status as Delivered and sets delivered_at)
 * @route PUT /api/library/id-cards/cards/:cardId/handover
 */
export const handoverCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    // Fetch the card
    const { data: card } = await supabase
      .from('id_cards')
      .select('*')
      .eq('id', cardId)
      .maybeSingle();

    if (!card) {
      const err = new Error('Card not found');
      err.statusCode = 404;
      return next(err);
    }

    // Check if there is a duplicate request that requires payment
    const { data: requests = [] } = await supabase
      .from('id_card_requests')
      .select('*')
      .eq('student_id', card.student_id)
      .order('created_at', { ascending: false });

    const latestRequest = requests[0];
    if (latestRequest && latestRequest.request_type === 'Duplicate' && latestRequest.payment_status === 'Pending') {
      const err = new Error('Cannot issue/handover card. Replacement duplicate fee payment is pending!');
      err.statusCode = 400;
      return next(err);
    }

    // Update card delivery status
    const { data: updatedCard, error: updateErr } = await supabase
      .from('id_cards')
      .update({
        delivery_status: 'Delivered',
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Also update request status to Printed/Approved if not already
    if (latestRequest && latestRequest.status !== 'Printed') {
      await supabase
        .from('id_card_requests')
        .update({
          status: 'Printed',
          updated_at: new Date().toISOString()
        })
        .eq('id', latestRequest.id);
    }

    // Insert history entry
    const handoverBy = req.user?.id || null;
    await supabase.from('id_card_print_history').insert([{
      id: generateUUID(),
      card_id: cardId,
      printed_by: handoverBy,
      print_date: new Date().toISOString(),
      remarks: 'Card handed over and physically delivered to student.',
      created_at: new Date().toISOString()
    }]);

    await addStudentNotification(card.student_id, `Your physical ID Card (${card.card_number}) has been handed over and marked as Delivered.`, 'Library');

    res.status(200).json({
      success: true,
      message: 'Card handover recorded successfully',
      data: updatedCard
    });
  } catch (error) {
    next(error);
  }
};
