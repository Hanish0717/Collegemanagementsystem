import { supabase } from '../../config/supabase.js';
import pool from '../../lib/db.js';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// Run setup SQL migration file if DB pool is configured
export async function setupSchema(req, res) {
  const sqlPath = path.resolve('server/src/migrations/20260531_create_mess_tables.sql');
  if (!pool) return res.status(500).json({ error: 'DATABASE_URL not configured; run migrations manually.' });
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    return res.json({ success: true, message: 'Mess schema applied (if not present).' });
  } catch (err) {
    console.error('setupSchema', err);
    return res.status(500).json({ error: err.message || 'Failed to apply schema' });
  }
}

// Menus
export async function listMenus(req, res) {
  try {
    const { start, end } = req.query;
    let q = supabase.from('mess_menus').select('*').order('meal_date', { ascending: true }).order('meal_type', { ascending: true });
    if (start) q = q.gte('meal_date', start);
    if (end) q = q.lte('meal_date', end);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ menus: data });
  } catch (err) {
    console.error('listMenus', err);
    res.status(500).json({ error: err.message || 'Failed to list menus' });
  }
}

export async function createMenu(req, res) {
  try {
    const payload = req.body;
    // validation: meal_date and meal_type required
    if (!payload.meal_date || !payload.meal_type) return res.status(400).json({ error: 'meal_date and meal_type required' });
    // prevent duplicate
    const { data: exists } = await supabase.from('mess_menus').select('id').eq('meal_date', payload.meal_date).eq('meal_type', payload.meal_type).maybeSingle();
    if (exists) return res.status(409).json({ error: 'Menu for this date and meal already exists' });
    const { data, error } = await supabase.from('mess_menus').insert([payload]).select().single();
    if (error) throw error;
    // notify
    try { await supabase.from('system_notifications').insert([{ title: `Mess menu updated for ${payload.meal_date}`, type: 'Mess', time: 'Just now', unread: true }]); } catch (e) {}
    res.status(201).json({ menu: data });
  } catch (err) {
    console.error('createMenu', err);
    res.status(500).json({ error: err.message || 'Failed to create menu' });
  }
}

export async function updateMenu(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from('mess_menus').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    res.json({ menu: data });
  } catch (err) {
    console.error('updateMenu', err);
    res.status(500).json({ error: err.message || 'Failed to update menu' });
  }
}

export async function deleteMenu(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('mess_menus').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('deleteMenu', err);
    res.status(500).json({ error: err.message || 'Failed to delete menu' });
  }
}

// Residents
export async function listResidents(req, res) {
  try {
    const { data, error } = await supabase.from('mess_residents').select('*').order('joined_date', { ascending: false });
    if (error) throw error;
    res.json({ residents: data });
  } catch (err) {
    console.error('listResidents', err);
    res.status(500).json({ error: err.message || 'Failed to list residents' });
  }
}

export async function addResident(req, res) {
  try {
    const payload = req.body;
    if (!payload.resident_id) return res.status(400).json({ error: 'resident_id required' });
    const { data: exists } = await supabase.from('mess_residents').select('id').eq('resident_id', payload.resident_id).maybeSingle();
    if (exists) return res.status(409).json({ error: 'Resident already in mess' });
    const { data, error } = await supabase.from('mess_residents').insert([payload]).select().single();
    if (error) throw error;
    res.status(201).json({ resident: data });
  } catch (err) {
    console.error('addResident', err);
    res.status(500).json({ error: err.message || 'Failed to add resident' });
  }
}

export async function updateResident(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from('mess_residents').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    res.json({ resident: data });
  } catch (err) {
    console.error('updateResident', err);
    res.status(500).json({ error: err.message || 'Failed to update resident' });
  }
}

export async function removeResident(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('mess_residents').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('removeResident', err);
    res.status(500).json({ error: err.message || 'Failed to remove resident' });
  }
}

// Feedback
export async function submitFeedback(req, res) {
  try {
    const payload = req.body;
    if (!payload.resident_id || !payload.meal_type || typeof payload.rating !== 'number') return res.status(400).json({ error: 'resident_id, meal_type and numeric rating required' });
    if (payload.rating < 1 || payload.rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });
    const { data, error } = await supabase.from('mess_feedback').insert([payload]).select().single();
    if (error) throw error;
    res.status(201).json({ feedback: data });
  } catch (err) {
    console.error('submitFeedback', err);
    res.status(500).json({ error: err.message || 'Failed to submit feedback' });
  }
}

export async function listFeedback(req, res) {
  try {
    const { meal_type } = req.query;
    let q = supabase.from('mess_feedback').select('*').order('created_at', { ascending: false });
    if (meal_type) q = q.eq('meal_type', meal_type);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ feedback: data });
  } catch (err) {
    console.error('listFeedback', err);
    res.status(500).json({ error: err.message || 'Failed to list feedback' });
  }
}

// Fees
export async function listFees(req, res) {
  try {
    // 1. Get all active hostel allocations
    const { data: activeAllocations } = await supabase.from('hostel_allocations').select('student_id').eq('status', 'Active');
    
    if (activeAllocations && activeAllocations.length > 0) {
      // 2. Get existing mess fee resident IDs
      const { data: existingFees } = await supabase.from('mess_fees').select('resident_id');
      const existingIds = new Set(existingFees ? existingFees.map(f => f.resident_id) : []);
      
      // 3. For any active allocation not in mess_fees, auto-insert a fee bill
      const newBills = [];
      for (const alloc of activeAllocations) {
        if (!existingIds.has(alloc.student_id)) {
          newBills.push({
            resident_id: alloc.student_id,
            mess_fee: 3000.00,
            paid_amount: 0.00,
            pending_amount: 3000.00,
            payment_status: 'Unpaid'
          });
        }
      }
      
      if (newBills.length > 0) {
        await supabase.from('mess_fees').insert(newBills);
      }
    }

    let q = supabase.from('mess_fees').select('*');
    if (req.user && (req.user.role === 'student' || req.user.role === 'Student')) {
      const { data: student } = await supabase.from('students').select('id').eq('user_id', req.user.id).maybeSingle();
      if (student) {
        q = q.eq('resident_id', student.id);
      } else {
        q = q.eq('resident_id', req.user.id);
      }
    }
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch all students to map details
    const { data: students } = await supabase.from('students').select('id, full_name, roll_number');
    const studentMap = {};
    if (students) {
      students.forEach(s => {
        studentMap[s.id] = s;
      });
    }

    const mappedFees = data.map(f => {
      const student = studentMap[f.resident_id];
      return {
        ...f,
        resident_name: student ? student.full_name : 'Unknown Member',
        roll_number: student ? student.roll_number : ''
      };
    });

    res.json({ fees: mappedFees });
  } catch (err) {
    console.error('listFees', err);
    res.status(500).json({ error: err.message || 'Failed to list fees' });
  }
}

export async function createFee(req, res) {
  try {
    const payload = req.body;
    if (typeof payload.mess_fee !== 'number' || payload.mess_fee < 0) return res.status(400).json({ error: 'mess_fee must be non-negative number' });
    const inserted = await supabase.from('mess_fees').insert([{ ...payload, pending_amount: payload.mess_fee - (payload.paid_amount || 0) }]).select().single();
    if (inserted.error) throw inserted.error;
    res.status(201).json({ fee: inserted.data });
  } catch (err) {
    console.error('createFee', err);
    res.status(500).json({ error: err.message || 'Failed to create fee' });
  }
}

export async function payFee(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'amount must be positive number' });
    
    // Update mess_fees
    const { data: feeRow, error: feeErr } = await supabase.from('mess_fees').select('*').eq('id', id).maybeSingle();
    if (feeErr) throw feeErr;
    if (!feeRow) return res.status(404).json({ error: 'Fee record not found' });
    
    const newPaid = Number(feeRow.paid_amount || 0) + Number(amount);
    const newPending = Math.max(0, Number(feeRow.mess_fee) - newPaid);
    const status = newPending <= 0 ? 'Paid' : (newPaid > 0 ? 'Partially-Paid' : 'Unpaid');
    
    const { data, error } = await supabase.from('mess_fees').update({ paid_amount: newPaid, pending_amount: newPending, payment_status: status, payment_date: new Date().toISOString() }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    
    // Connect with existing hostel fees: update if exists for this month/year, or create a new one
    try {
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const currentYear = new Date().getFullYear();
      
      const { data: existingFee } = await supabase
        .from('hostel_fees')
        .select('*')
        .eq('student_id', feeRow.resident_id)
        .eq('fee_type', 'Mess Fee')
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();
        
      if (existingFee) {
        const hostelFeePaid = Number(existingFee.paid_amount || 0) + Number(amount);
        const hostelFeePending = Math.max(0, Number(existingFee.total_amount || 0) - hostelFeePaid);
        const hostelFeeStatus = hostelFeePending <= 0 ? 'Paid' : (hostelFeePaid > 0 ? 'Partially Paid' : 'Pending');
        
        await supabase
          .from('hostel_fees')
          .update({
            paid_amount: hostelFeePaid,
            pending_amount: hostelFeePending,
            status: hostelFeeStatus,
            payment_status: hostelFeeStatus,
            payment_date: new Date().toISOString(),
            payment_method: 'Mess Portal'
          })
          .eq('id', existingFee.id);
      } else {
        await supabase.from('hostel_fees').insert([{
          student_id: feeRow.resident_id,
          hostel_id: null,
          fee_type: 'Mess Fee',
          month: currentMonth,
          year: currentYear,
          total_amount: feeRow.mess_fee,
          paid_amount: newPaid,
          pending_amount: newPending,
          due_date: new Date().toISOString().split('T')[0],
          payment_method: 'Mess Portal',
          status: status === 'Paid' ? 'Paid' : (status === 'Partially-Paid' ? 'Partially Paid' : 'Pending')
        }]);
      }
    } catch (e) {
      console.error('Error connecting to hostel_fees:', e);
    }

    // notify
    try { await supabase.from('system_notifications').insert([{ title: `Mess fee payment received (₹${amount})`, type: 'Mess', time: 'Just now', unread: true }]); } catch (e) {}

    res.json({ fee: data });
  } catch (err) {
    console.error('payFee', err);
    res.status(500).json({ error: err.message || 'Failed to record payment' });
  }
}

// Reports: basic aggregation endpoints
export async function dailyMealReport(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    // count meals served today from allocations + menus
    const { data: menus } = await supabase.from('mess_menus').select('*').eq('meal_date', date);
    const { data: members } = await supabase.from('mess_residents').select('id');
    const mealsServed = (members?.length || 0) * (menus?.length || 0);
    res.json({ date, mealsServed, menus, membersCount: members?.length || 0 });
  } catch (err) {
    console.error('dailyMealReport', err);
    res.status(500).json({ error: err.message || 'Failed to generate report' });
  }
}

export async function monthlyRevenueReport(req, res) {
  try {
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();
    // basic sum of payments recorded this month
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 0, 23, 59, 59).toISOString();
    const { data } = await supabase.from('mess_fees').select('paid_amount, payment_date');
    const monthly = (data || []).filter(d => d.payment_date && new Date(d.payment_date) >= new Date(from) && new Date(d.payment_date) <= new Date(to));
    const revenue = (monthly || []).reduce((s, r) => s + Number(r.paid_amount || 0), 0);
    res.json({ month, year, revenue });
  } catch (err) {
    console.error('monthlyRevenueReport', err);
    res.status(500).json({ error: err.message || 'Failed to generate report' });
  }
}

export async function feeCollectionReport(req, res) {
  try {
    const { data } = await supabase.from('mess_fees').select('*');
    res.json({ fees: data });
  } catch (err) {
    console.error('feeCollectionReport', err);
    res.status(500).json({ error: err.message || 'Failed to generate fee report' });
  }
}

export async function feedbackReport(req, res) {
  try {
    const { data } = await supabase.from('mess_feedback').select('*');
    const avg = (data || []).reduce((s, f) => s + (f.rating || 0), 0) / Math.max(1, (data || []).length);
    res.json({ feedback: data, averageRating: Number(avg.toFixed(2)) });
  } catch (err) {
    console.error('feedbackReport', err);
    res.status(500).json({ error: err.message || 'Failed to generate feedback report' });
  }
}

// Helper: Format date to readable string
const formatReportDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper: Format currency to INR
const formatReportCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// Export Daily Meal Report
export async function exportDailyMealReport(req, res) {
  try {
    const format = req.query.format || 'pdf';
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    const { data: menus } = await supabase.from('mess_menus').select('*').eq('meal_date', date);
    const { data: members } = await supabase.from('mess_residents').select('*');
    const mealsServed = (members?.length || 0) * (menus?.length || 0);

    const title = `Daily Mess Meal Report - ${date}`;
    const filename = `daily-meal-report-${date}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfData.length
        });
        res.end(pdfData);
      });

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Generated: ${formatReportDate(new Date())}`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(11).font('Helvetica-Bold').text('Summary Statistics:');
      doc.fontSize(9).font('Helvetica');
      doc.text(`Total Mess Subscribers: ${members?.length || 0}`);
      doc.text(`Meals Scheduled Today: ${menus?.length || 0}`);
      doc.text(`Estimated Meals Served Today: ${mealsServed}`);
      doc.moveDown();

      // Menus Table
      doc.fontSize(11).font('Helvetica-Bold').text('Scheduled Menus:');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 120;
      const col3 = 250;
      const col4 = 450;
      const rowHeight = 20;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Meal Type', col1, tableTop);
      doc.text('Status', col2, tableTop);
      doc.text('Food Items', col3, tableTop);

      doc.font('Helvetica').fontSize(8);
      let y = tableTop + rowHeight;

      (menus || []).forEach((m) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 30;
        }
        doc.text(m.meal_type || '—', col1, y);
        doc.text(m.status || '—', col2, y);
        
        const items = Array.isArray(m.food_items) ? m.food_items.join(', ') : String(m.food_items || '[]');
        doc.text(items.substring(0, 70), col3, y);
        y += rowHeight;
      });

      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Daily Meals');

      worksheet.columns = [
        { header: 'Meal Date', key: 'meal_date', width: 15 },
        { header: 'Meal Type', key: 'meal_type', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Food Items', key: 'food_items', width: 50 },
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

      (menus || []).forEach((m) => {
        worksheet.addRow({
          meal_date: m.meal_date,
          meal_type: m.meal_type,
          status: m.status,
          food_items: Array.isArray(m.food_items) ? m.food_items.join(', ') : String(m.food_items || ''),
        });
      });

      worksheet.addRow([]);
      worksheet.addRow(['Summary Statistics']);
      worksheet.addRow(['Total Mess Subscribers', members?.length || 0]);
      worksheet.addRow(['Meals Scheduled Today', menus?.length || 0]);
      worksheet.addRow(['Estimated Meals Served Today', mealsServed]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    console.error('exportDailyMealReport', err);
    res.status(500).json({ error: err.message || 'Failed to export daily meal report' });
  }
}

// Export Monthly Mess Revenue Report
export async function exportMonthlyRevenueReport(req, res) {
  try {
    const format = req.query.format || 'pdf';
    const month = parseInt(req.query.month || new Date().getMonth() + 1, 10);
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);

    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: fees } = await supabase.from('mess_fees').select('*');
    const monthlyFees = (fees || []).filter(d => d.payment_date && new Date(d.payment_date) >= new Date(from) && new Date(d.payment_date) <= new Date(to));
    const totalCollected = monthlyFees.reduce((s, r) => s + Number(r.paid_amount || 0), 0);
    const totalPending = monthlyFees.reduce((s, r) => s + Number(r.pending_amount || 0), 0);

    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
    const title = `Mess Revenue Report - ${monthName} ${year}`;
    const filename = `mess-revenue-report-${monthName}-${year}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfData.length
        });
        res.end(pdfData);
      });

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Generated: ${formatReportDate(new Date())}`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(11).font('Helvetica-Bold').text('Revenue Summary:');
      doc.fontSize(9).font('Helvetica');
      doc.text(`Total Collections This Month: ${formatReportCurrency(totalCollected)}`);
      doc.text(`Total Pending Dues This Month: ${formatReportCurrency(totalPending)}`);
      doc.text(`Total Transaction Records: ${monthlyFees.length}`);
      doc.moveDown();

      // Table of payments
      doc.fontSize(11).font('Helvetica-Bold').text('Payments List:');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 180;
      const col3 = 260;
      const col4 = 340;
      const col5 = 440;
      const rowHeight = 20;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Resident Name', col1, tableTop);
      doc.text('Student ID', col2, tableTop);
      doc.text('Paid Amount', col3, tableTop);
      doc.text('Pending Amount', col4, tableTop);
      doc.text('Payment Date', col5, tableTop);

      doc.font('Helvetica').fontSize(8);
      let y = tableTop + rowHeight;

      monthlyFees.forEach((fee) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 30;
        }
        // Fetch values
        doc.text((fee.resident_name || '—').substring(0, 22), col1, y);
        doc.text((fee.resident_id || '—').substring(0, 15), col2, y);
        doc.text(formatReportCurrency(fee.paid_amount), col3, y);
        doc.text(formatReportCurrency(fee.pending_amount), col4, y);
        doc.text(fee.payment_date ? new Date(fee.payment_date).toLocaleDateString() : '—', col5, y);
        y += rowHeight;
      });

      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Revenue Details');

      worksheet.columns = [
        { header: 'Resident Name', key: 'resident_name', width: 25 },
        { header: 'Student ID', key: 'resident_id', width: 25 },
        { header: 'Mess Fee', key: 'mess_fee', width: 15 },
        { header: 'Paid Amount', key: 'paid_amount', width: 15 },
        { header: 'Pending Amount', key: 'pending_amount', width: 15 },
        { header: 'Payment Status', key: 'payment_status', width: 15 },
        { header: 'Payment Date', key: 'payment_date', width: 20 },
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };

      monthlyFees.forEach((fee) => {
        worksheet.addRow({
          resident_name: fee.resident_name || '—',
          resident_id: fee.resident_id || '—',
          mess_fee: Number(fee.mess_fee || 0),
          paid_amount: Number(fee.paid_amount || 0),
          pending_amount: Number(fee.pending_amount || 0),
          payment_status: fee.payment_status || '—',
          payment_date: fee.payment_date ? formatDate(fee.payment_date) : '—',
        });
      });

      worksheet.getColumn('C').numFmt = '₹#,##0';
      worksheet.getColumn('D').numFmt = '₹#,##0';
      worksheet.getColumn('E').numFmt = '₹#,##0';

      worksheet.addRow([]);
      worksheet.addRow(['Revenue Summary']);
      worksheet.addRow(['Total Collections This Month', totalCollected]);
      worksheet.addRow(['Total Pending Dues This Month', totalPending]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    console.error('exportMonthlyRevenueReport', err);
    res.status(500).json({ error: err.message || 'Failed to export monthly revenue report' });
  }
}

// Export Mess Fee Collection Report
export async function exportFeeCollectionReport(req, res) {
  try {
    const format = req.query.format || 'pdf';
    const { data: fees } = await supabase.from('mess_fees').select('*').order('created_at', { ascending: false });

    const totalFeeSum = (fees || []).reduce((s, r) => s + Number(r.mess_fee || 0), 0);
    const totalPaidSum = (fees || []).reduce((s, r) => s + Number(r.paid_amount || 0), 0);
    const totalPendingSum = (fees || []).reduce((s, r) => s + Number(r.pending_amount || 0), 0);

    const title = `Mess Fee Collection Report`;
    const filename = `mess-fee-collection-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfData.length
        });
        res.end(pdfData);
      });

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Generated: ${formatReportDate(new Date())}`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(11).font('Helvetica-Bold').text('Collection Summary:');
      doc.fontSize(9).font('Helvetica');
      doc.text(`Total Assigned Fees: ${formatReportCurrency(totalFeeSum)}`);
      doc.text(`Total Fees Paid: ${formatReportCurrency(totalPaidSum)}`);
      doc.text(`Total Outstanding Dues: ${formatReportCurrency(totalPendingSum)}`);
      doc.moveDown();

      // Table of fees
      doc.fontSize(11).font('Helvetica-Bold').text('Fees Details:');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 170;
      const col3 = 240;
      const col4 = 310;
      const col5 = 380;
      const col6 = 450;
      const rowHeight = 20;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Resident Name', col1, tableTop);
      doc.text('Student ID', col2, tableTop);
      doc.text('Mess Fee', col3, tableTop);
      doc.text('Paid', col4, tableTop);
      doc.text('Pending', col5, tableTop);
      doc.text('Status', col6, tableTop);

      doc.font('Helvetica').fontSize(8);
      let y = tableTop + rowHeight;

      (fees || []).forEach((fee) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 30;
        }
        doc.text((fee.resident_name || '—').substring(0, 20), col1, y);
        doc.text((fee.resident_id || '—').substring(0, 15), col2, y);
        doc.text(formatReportCurrency(fee.mess_fee), col3, y);
        doc.text(formatReportCurrency(fee.paid_amount), col4, y);
        doc.text(formatReportCurrency(fee.pending_amount), col5, y);
        doc.text(fee.payment_status || '—', col6, y);
        y += rowHeight;
      });

      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Mess Fees');

      worksheet.columns = [
        { header: 'Resident Name', key: 'resident_name', width: 25 },
        { header: 'Student ID', key: 'resident_id', width: 25 },
        { header: 'Mess Fee', key: 'mess_fee', width: 15 },
        { header: 'Paid Amount', key: 'paid_amount', width: 15 },
        { header: 'Pending Amount', key: 'pending_amount', width: 15 },
        { header: 'Payment Status', key: 'payment_status', width: 15 },
        { header: 'Payment Date', key: 'payment_date', width: 20 },
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

      (fees || []).forEach((fee) => {
        worksheet.addRow({
          resident_name: fee.resident_name || '—',
          resident_id: fee.resident_id || '—',
          mess_fee: Number(fee.mess_fee || 0),
          paid_amount: Number(fee.paid_amount || 0),
          pending_amount: Number(fee.pending_amount || 0),
          payment_status: fee.payment_status || '—',
          payment_date: fee.payment_date ? formatDate(fee.payment_date) : '—',
        });
      });

      worksheet.getColumn('C').numFmt = '₹#,##0';
      worksheet.getColumn('D').numFmt = '₹#,##0';
      worksheet.getColumn('E').numFmt = '₹#,##0';

      worksheet.addRow([]);
      worksheet.addRow(['Collection Summary']);
      worksheet.addRow(['Total Assigned Fees', totalFeeSum]);
      worksheet.addRow(['Total Fees Paid', totalPaidSum]);
      worksheet.addRow(['Total Outstanding Dues', totalPendingSum]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    console.error('exportFeeCollectionReport', err);
    res.status(500).json({ error: err.message || 'Failed to export fee collection report' });
  }
}

// Export Mess Food Feedback Report
export async function exportFeedbackReport(req, res) {
  try {
    const format = req.query.format || 'pdf';
    const { data: feedback } = await supabase.from('mess_feedback').select('*').order('created_at', { ascending: false });

    const avgRating = (feedback || []).reduce((s, f) => s + (f.rating || 0), 0) / Math.max(1, (feedback || []).length);

    const title = `Mess Food Feedback Report`;
    const filename = `mess-food-feedback-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfData.length
        });
        res.end(pdfData);
      });

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Generated: ${formatReportDate(new Date())}`, { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(11).font('Helvetica-Bold').text('Feedback Summary:');
      doc.fontSize(9).font('Helvetica');
      doc.text(`Total Reviews Submitted: ${(feedback || []).length}`);
      doc.text(`Average Food Rating: ${avgRating ? avgRating.toFixed(2) : '0.0'} / 5.0`);
      doc.moveDown();

      // Table of feedback
      doc.fontSize(11).font('Helvetica-Bold').text('Student Feedbacks:');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 160;
      const col3 = 240;
      const col4 = 300;
      const col5 = 480;
      const rowHeight = 25;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Resident Name', col1, tableTop);
      doc.text('Student ID', col2, tableTop);
      doc.text('Meal Type', col3, tableTop);
      doc.text('Rating', col4, tableTop);
      doc.text('Feedback Comment', col5, tableTop);

      doc.font('Helvetica').fontSize(8);
      let y = tableTop + rowHeight;

      (feedback || []).forEach((fb) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 30;
        }
        doc.text((fb.resident_name || '—').substring(0, 18), col1, y);
        doc.text((fb.resident_id || '—').substring(0, 12), col2, y);
        doc.text(fb.meal_type || '—', col3, y);
        doc.text(`${fb.rating || 0} Stars`, col4, y);
        doc.text((fb.feedback || '—').substring(0, 50), col5, y);
        y += rowHeight;
      });

      doc.end();
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Feedback');

      worksheet.columns = [
        { header: 'Resident Name', key: 'resident_name', width: 25 },
        { header: 'Student ID', key: 'resident_id', width: 25 },
        { header: 'Meal Type', key: 'meal_type', width: 15 },
        { header: 'Rating (1-5)', key: 'rating', width: 12 },
        { header: 'Feedback', key: 'feedback', width: 50 },
        { header: 'Date Submitted', key: 'created_at', width: 20 },
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

      (feedback || []).forEach((fb) => {
        worksheet.addRow({
          resident_name: fb.resident_name || '—',
          resident_id: fb.resident_id || '—',
          meal_type: fb.meal_type || '—',
          rating: Number(fb.rating || 0),
          feedback: fb.feedback || '—',
          created_at: fb.created_at ? formatDate(fb.created_at) : '—',
        });
      });

      worksheet.addRow([]);
      worksheet.addRow(['Feedback Summary']);
      worksheet.addRow(['Total Reviews Submitted', (feedback || []).length]);
      worksheet.addRow(['Average Food Rating', avgRating ? Number(avgRating.toFixed(2)) : 0]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    console.error('exportFeedbackReport', err);
    res.status(500).json({ error: err.message || 'Failed to export feedback report' });
  }
}
