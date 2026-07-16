import pool from '../../lib/db.js';
import { supabase } from '../../config/supabase.js';
import { dispatchNotification } from '../../services/notificationService.js';

// Create allocation (non-transactional via supabase for now)
export async function createAllocation(req, res) {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_allocations').insert([payload]).select().single();
    if (error) throw error;
    // increment occupants
    await supabase.from('hostel_rooms').update({ occupants: (payload._occupants_delta || 1) }).eq('id', payload.room_id);
    
    // Asynchronously dispatch notification
    try {
      const { data: student } = await supabase
        .from('students')
        .select('full_name, email, parent_email, user_id')
        .eq('id', data.student_id)
        .maybeSingle();

      if (student) {
        dispatchNotification({
          userId: student.user_id,
          studentId: data.student_id,
          email: student.email,
          parentEmail: student.parent_email,
          type: 'Hostel',
          title: 'Hostel Room Allocated Successfully',
          message: `Dear ${student.full_name}, your hostel room allocation has been processed successfully.`,
          priority: 'Medium'
        });
      }
    } catch (notifErr) {
      console.error('Failed to dispatch room allocation notification:', notifErr);
    }

    res.status(201).json({ allocation: data });
  } catch (err) {
    console.error('createAllocation', err);
    res.status(500).json({ error: err.message || 'Failed to create allocation' });
  }
}

// Transfer allocation: transactional update of allocation row and room occupants
export async function transferAllocation(req, res) {
  const allocationId = req.params.id;
  const { newRoomId, newBedNumber } = req.body;

  if (!allocationId || !newRoomId) return res.status(400).json({ error: 'allocation id and newRoomId required' });

  const client = pool;
  if (!client) return res.status(500).json({ error: 'Database pool not configured' });

  const conn = await client.connect();
  try {
    await conn.query('BEGIN');

    // lock the allocation row
    const allocRes = await conn.query('SELECT * FROM hostel_allocations WHERE id=$1 FOR UPDATE', [allocationId]);
    if (allocRes.rowCount === 0) throw new Error('Allocation not found');
    const alloc = allocRes.rows[0];

    // lock target room
    const roomRes = await conn.query('SELECT capacity, occupants FROM hostel_rooms WHERE id=$1 FOR UPDATE', [newRoomId]);
    if (roomRes.rowCount === 0) throw new Error('Target room not found');
    const targetRoom = roomRes.rows[0];

    if (targetRoom.occupants >= targetRoom.capacity) throw new Error('Target room is full');

    // check bed occupancy in target room
    const bedRes = await conn.query('SELECT id FROM hostel_allocations WHERE room_id=$1 AND bed_number=$2 AND status=$3', [newRoomId, newBedNumber, 'Active']);
    if (bedRes.rowCount > 0) throw new Error('Bed already occupied in target room');

    // decrement old room occupants if allocation was active
    if (alloc.status === 'Active') {
      await conn.query('UPDATE hostel_rooms SET occupants = GREATEST(0, occupants - 1) WHERE id=$1', [alloc.room_id]);
    }

    // update allocation to new room/bed
    await conn.query('UPDATE hostel_allocations SET room_id=$1, bed_number=$2, block_id=$3, updated_at=now() WHERE id=$4', [newRoomId, newBedNumber, req.body.newBlockId || alloc.block_id, allocationId]);

    // increment target room occupants
    await conn.query('UPDATE hostel_rooms SET occupants = occupants + 1 WHERE id=$1', [newRoomId]);

    await conn.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await conn.query('ROLLBACK');
    console.error('transferAllocation', err);
    res.status(500).json({ error: err.message || 'Transfer failed' });
  } finally {
    conn.release();
  }
}

export async function updateAllocation(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_allocations').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    res.json({ allocation: data });
  } catch (err) {
    console.error('updateAllocation', err);
    res.status(500).json({ error: err.message || 'Failed to update allocation' });
  }
}

export async function deleteAllocation(req, res) {
  try {
    const { id } = req.params;
    
    // Fetch details before deletion
    const { data: alloc } = await supabase
      .from('hostel_allocations')
      .select('student_id, room_id, status')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('hostel_allocations').delete().eq('id', id);
    if (error) throw error;

    // Decrement occupants in room if the allocation was active
    if (alloc && alloc.status === 'Active' && alloc.room_id) {
      try {
        const { data: rm } = await supabase.from('hostel_rooms').select('occupants').eq('id', alloc.room_id).single();
        if (rm && rm.occupants > 0) {
          await supabase.from('hostel_rooms').update({ occupants: rm.occupants - 1 }).eq('id', alloc.room_id);
        }
      } catch (e) {
        console.error('Failed to decrement room occupants during vacate:', e);
      }
    }
    
    // Asynchronously dispatch notification
    if (alloc && alloc.student_id) {
      try {
        const { data: student } = await supabase
          .from('students')
          .select('full_name, email, parent_email, user_id')
          .eq('id', alloc.student_id)
          .maybeSingle();

        if (student) {
          dispatchNotification({
            userId: student.user_id,
            studentId: alloc.student_id,
            email: student.email,
            parentEmail: student.parent_email,
            type: 'Hostel',
            title: 'Hostel Room Allocation Vacated',
            message: `Dear ${student.full_name}, your hostel room allocation has been vacated.`,
            priority: 'High'
          });
        }
      } catch (notifErr) {
        console.error('Failed to dispatch room vacate notification:', notifErr);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('deleteAllocation', err);
    res.status(500).json({ error: err.message || 'Failed to delete allocation' });
  }
}

export async function listAllocations(req, res) {
  try {
    const { status, hostelId, blockId, roomId } = req.query;

    let query = supabase.from('hostel_allocations').select('*');

    if (status) query = query.eq('status', status);
    if (hostelId) query = query.eq('hostel_id', hostelId);
    if (blockId) query = query.eq('block_id', blockId);
    if (roomId) query = query.eq('room_id', roomId);

    const { data: allocations, error } = await query;
    if (error) throw error;

    // Resolve relationships in parallel to guarantee mock db mode works
    const { data: students } = await supabase.from('students').select('*');
    const { data: rooms } = await supabase.from('hostel_rooms').select('*');
    const { data: blocks } = await supabase.from('hostel_blocks').select('*');

    const studentMap = new Map((students || []).map(s => [s.id, s]));
    const roomMap = new Map((rooms || []).map(r => [r.id, r]));
    const blockMap = new Map((blocks || []).map(b => [b.id, b]));

    const records = (allocations || []).map(alloc => {
      const student = studentMap.get(alloc.student_id) || {};
      const room = roomMap.get(alloc.room_id) || {};
      const block = blockMap.get(alloc.block_id) || {};

      return {
        id: alloc.id,
        studentId: alloc.student_id,
        hostelId: alloc.hostel_id,
        blockId: alloc.block_id,
        roomId: alloc.room_id,
        bedNumber: alloc.bed_number,
        status: alloc.status,
        academicYear: alloc.academic_year,
        createdAt: alloc.created_at,
        updatedAt: alloc.updated_at,
        // Match the relationship shapes
        students: {
          id: student.id,
          full_name: student.full_name || 'Unknown Student',
          roll_number: student.roll_number || '-',
          admission_number: student.admission_number || '-',
          email: student.email || '-',
          phone_number: student.phone_number || '-',
          gender: student.gender || '-',
          date_of_birth: student.date_of_birth || '-',
          department: student.department || '-',
          year: student.year || 1,
          semester: student.semester || 1,
          section: student.section || '-',
          parent_name: student.parent_name || '-',
          parent_phone: student.parent_phone || '-',
          parent_email: student.parent_email || '-',
          cgpa: student.cgpa || '-',
          attendance_percentage: student.attendance_percentage || 100
        },
        hostel_rooms: {
          id: room.id,
          room_number: room.room_number || '-',
          room_type: room.room_type || room.type || '-',
          type: room.type || '-',
          ac_type: room.ac_type || (String(room.type).toLowerCase().includes('ac') ? 'AC' : 'Non-AC')
        },
        hostel_blocks: {
          id: block.id,
          name: block.name || '-'
        }
      };
    });

    res.json({ success: true, data: records });
  } catch (err) {
    console.error('listAllocations error:', err);
    res.status(500).json({ error: err.message || 'Failed to list allocations' });
  }
}

export async function createResidentAllocation(req, res) {
  try {
    const { studentPayload, allocationPayload } = req.body;
    const cleanRoll = studentPayload.rollNumber ? studentPayload.rollNumber.toUpperCase().trim() : "";

    // Check if student exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .or(`email.eq.${studentPayload.email},roll_number.eq.${cleanRoll}`)
      .maybeSingle();

    if (existingStudent) {
      const { data: activeAlloc } = await supabase
        .from('hostel_allocations')
        .select('id')
        .eq('student_id', existingStudent.id)
        .eq('status', 'Active')
        .maybeSingle();

      if (activeAlloc) {
        return res.status(400).json({ error: 'This student already has an active room allocation.' });
      }
    }

    // Check if bed is occupied
    const { data: occupiedBed } = await supabase
      .from('hostel_allocations')
      .select('id')
      .eq('room_id', allocationPayload.roomId)
      .eq('bed_number', allocationPayload.bedNumber)
      .eq('status', 'Active')
      .maybeSingle();

    if (occupiedBed) {
      return res.status(400).json({ error: `Bed ${allocationPayload.bedNumber} in this room is already occupied.` });
    }

    // Check room capacity
    const { data: room } = await supabase
      .from('hostel_rooms')
      .select('capacity, occupants')
      .eq('id', allocationPayload.roomId)
      .maybeSingle();

    if (room && room.occupants >= room.capacity) {
      return res.status(400).json({ error: 'This room is already at full capacity.' });
    }

    let studentId = "";
    if (existingStudent) {
      studentId = existingStudent.id;
      await supabase.from('students').update({
        full_name: studentPayload.fullName,
        phone_number: studentPayload.phoneNumber,
        department: studentPayload.department,
        year: studentPayload.year,
        semester: studentPayload.semester,
        section: studentPayload.section,
        parent_phone: studentPayload.parentPhone,
        parent_name: studentPayload.parentName,
        parent_email: studentPayload.parentEmail
      }).eq('id', studentId);
    } else {
      const { data: newStudent, error: studError } = await supabase.from('students').insert([{
        full_name: studentPayload.fullName,
        roll_number: cleanRoll,
        admission_number: studentPayload.admissionNumber || `ADM${Date.now() % 100000}`,
        email: studentPayload.email,
        phone_number: studentPayload.phoneNumber || '9999999999',
        gender: studentPayload.gender || 'Male',
        date_of_birth: studentPayload.dateOfBirth || '2005-01-01',
        department: studentPayload.department,
        year: Number(studentPayload.year),
        semester: Number(studentPayload.semester),
        section: studentPayload.section,
        parent_name: studentPayload.parentName,
        parent_phone: studentPayload.parentPhone,
        parent_email: studentPayload.parentEmail || studentPayload.email,
        cgpa: studentPayload.cgpa ? Number(studentPayload.cgpa) : 8.0,
        attendance_percentage: studentPayload.attendancePercentage ? Number(studentPayload.attendancePercentage) : 90.0,
        is_active: true
      }]).select().single();

      if (studError) throw studError;
      studentId = newStudent.id;
    }

    // Insert allocation
    const { data: allocation, error: allocErr } = await supabase
      .from('hostel_allocations')
      .insert([{
        student_id: studentId,
        hostel_id: allocationPayload.hostelId,
        block_id: allocationPayload.blockId,
        room_id: allocationPayload.roomId,
        bed_number: allocationPayload.bedNumber,
        status: 'Active',
        academic_year: allocationPayload.academicYear
      }])
      .select()
      .single();

    if (allocErr) throw allocErr;

    // Increment occupants count
    if (room) {
      await supabase.from('hostel_rooms').update({ occupants: (room.occupants || 0) + 1 }).eq('id', allocationPayload.roomId);
    }

    // Auto-assign fee structure
    try {
      const roomType = room?.room_type || room?.type || 'Standard';
      const acType = room?.ac_type || (String(roomType).toLowerCase().includes('ac') ? 'AC' : 'Non-AC');
      const residentCategory = studentPayload.residentCategory || studentPayload.category || studentPayload.department || 'General';
      
      const { data: feeStructure } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('hostel_block_id', allocationPayload.blockId)
        .eq('academic_year', allocationPayload.academicYear)
        .eq('room_type', roomType)
        .eq('ac_type', acType)
        .eq('status', 'Active')
        .maybeSingle();

      if (feeStructure) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);

        await supabase.from('hostel_fees').insert([{
          student_id: studentId,
          hostel_id: allocationPayload.hostelId,
          block_id: allocationPayload.blockId,
          room_id: allocationPayload.roomId,
          fee_structure_id: feeStructure.id,
          resident_category: residentCategory,
          academic_year: allocationPayload.academicYear,
          resident_name: studentPayload.fullName,
          registration_number: cleanRoll,
          room_number: room?.room_number || '-',
          room_type: roomType,
          ac_type: acType,
          fee_type: feeStructure.fee_category || 'Hostel Rent',
          monthly_hostel_fee: Number(feeStructure.monthly_hostel_fee || 0),
          mess_fee: Number(feeStructure.mess_fee || 0),
          electricity_fee: Number(feeStructure.electricity_fee || 0),
          maintenance_fee: Number(feeStructure.maintenance_fee || 0),
          security_deposit: Number(feeStructure.security_deposit || 0),
          other_charges: Number(feeStructure.other_charges || 0),
          total_fee: Number(feeStructure.total_fee || 0),
          amount_paid: 0,
          pending_amount: Number(feeStructure.total_fee || 0),
          due_date: dueDate.toISOString().split('T')[0],
          status: 'Unpaid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      }
    } catch (feeErr) {
      console.error('Failed auto fee assignment in createResidentAllocation:', feeErr);
    }

    res.status(201).json({ success: true, data: allocation });
  } catch (err) {
    console.error('createResidentAllocation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create resident allocation' });
  }
}

export async function updateResidentAllocation(req, res) {
  try {
    const { id: allocationId } = req.params;
    const { studentId, studentPayload, allocationPayload } = req.body;

    // Check old allocation
    const { data: oldAlloc } = await supabase
      .from('hostel_allocations')
      .select('room_id, bed_number, status')
      .eq('id', allocationId)
      .maybeSingle();

    if (oldAlloc) {
      const isNewActive = allocationPayload.status === 'Active';

      if (isNewActive && (oldAlloc.room_id !== allocationPayload.roomId || oldAlloc.bed_number !== allocationPayload.bedNumber || oldAlloc.status !== 'Active')) {
        const { data: occupiedBed } = await supabase
          .from('hostel_allocations')
          .select('id')
          .eq('room_id', allocationPayload.roomId)
          .eq('bed_number', allocationPayload.bedNumber)
          .eq('status', 'Active')
          .neq('id', allocationId)
          .maybeSingle();

        if (occupiedBed) {
          return res.status(400).json({ error: `Bed ${allocationPayload.bedNumber} in this room is already occupied.` });
        }
      }

      const roomChanged = oldAlloc.room_id !== allocationPayload.roomId;
      const activated = oldAlloc.status !== 'Active' && isNewActive;
      if (isNewActive && (roomChanged || activated)) {
        const { data: room } = await supabase
          .from('hostel_rooms')
          .select('capacity, occupants')
          .eq('id', allocationPayload.roomId)
          .maybeSingle();

        if (room && room.occupants >= room.capacity) {
          return res.status(400).json({ error: 'The target room is already at full capacity.' });
        }
      }
    }

    // Update Student Details
    await supabase.from('students').update({
      full_name: studentPayload.fullName,
      phone_number: studentPayload.phoneNumber,
      department: studentPayload.department,
      year: studentPayload.year,
      semester: studentPayload.semester,
      section: studentPayload.section,
      parent_name: studentPayload.parentName,
      parent_phone: studentPayload.parentPhone,
      parent_email: studentPayload.parentEmail,
      is_active: allocationPayload.status === 'Active'
    }).eq('id', studentId);

    // Update Allocation
    const { data: allocation, error: allocErr } = await supabase
      .from('hostel_allocations')
      .update({
        hostel_id: allocationPayload.hostelId,
        block_id: allocationPayload.blockId,
        room_id: allocationPayload.roomId,
        bed_number: allocationPayload.bedNumber,
        status: allocationPayload.status,
        academic_year: allocationPayload.academicYear
      })
      .eq('id', allocationId)
      .select()
      .maybeSingle();

    if (allocErr) throw allocErr;

    // Adjust occupants counts
    if (oldAlloc) {
      const wasActive = oldAlloc.status === 'Active';
      const isActiveNow = allocationPayload.status === 'Active';
      const oldRoomId = oldAlloc.room_id;
      const newRoomId = allocationPayload.roomId;

      if (wasActive && !isActiveNow) {
        const { data: rmOld } = await supabase.from('hostel_rooms').select('occupants').eq('id', oldRoomId).single();
        if (rmOld && rmOld.occupants > 0) {
          await supabase.from('hostel_rooms').update({ occupants: rmOld.occupants - 1 }).eq('id', oldRoomId);
        }
      } else if (!wasActive && isActiveNow) {
        const { data: rmNew } = await supabase.from('hostel_rooms').select('occupants').eq('id', newRoomId).single();
        if (rmNew) {
          await supabase.from('hostel_rooms').update({ occupants: (rmNew.occupants || 0) + 1 }).eq('id', newRoomId);
        }
      } else if (wasActive && isActiveNow && oldRoomId !== newRoomId) {
        const { data: rmOld } = await supabase.from('hostel_rooms').select('occupants').eq('id', oldRoomId).single();
        if (rmOld && rmOld.occupants > 0) {
          await supabase.from('hostel_rooms').update({ occupants: rmOld.occupants - 1 }).eq('id', oldRoomId);
        }
        const { data: rmNew } = await supabase.from('hostel_rooms').select('occupants').eq('id', newRoomId).single();
        if (rmNew) {
          await supabase.from('hostel_rooms').update({ occupants: (rmNew.occupants || 0) + 1 }).eq('id', newRoomId);
        }
      }
    }

    res.json({ success: true, data: allocation });
  } catch (err) {
    console.error('updateResidentAllocation error:', err);
    res.status(500).json({ error: err.message || 'Failed to update resident allocation' });
  }
}

