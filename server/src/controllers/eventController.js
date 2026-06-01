import { supabase } from '../config/supabase.js';
import sendEmail from '../utils/sendEmail.js';

// Helper to broadcast notifications and emails to all roles
async function broadcastEventNotifications(event) {
  try {
    console.log(`[Event Broadcaster] Preparing broadcasts for event: "${event.title}"`);

    // 1. Fetch Students
    const { data: students, error: stuError } = await supabase
      .from('students')
      .select('id, full_name, email, parent_email');
    if (stuError) console.error('[Event Broadcaster] Error fetching students:', stuError.message);

    // 2. Fetch Faculty
    const { data: faculty, error: facError } = await supabase
      .from('faculty')
      .select('id, full_name, email');
    if (facError) console.error('[Event Broadcaster] Error fetching faculty:', facError.message);

    // 3. Fetch Admin Users
    const { data: admins, error: admError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('role', ['admin', 'super-admin', 'superadmin']);
    if (admError) console.error('[Event Broadcaster] Error fetching admins:', admError.message);

    const emailTasks = [];
    const studentNotifs = [];
    const facultyNotifs = [];
    const adminNotifs = [];

    const eventDetailsHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">New Event: ${event.title}</h2>
        <p style="color: #334155; font-size: 15px;">Greetings,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">We are pleased to announce the following upcoming event:</p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;"><strong>Type:</strong> ${event.type}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;"><strong>Date:</strong> ${event.date} ${event.time ? `at ${event.time}` : ''}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;"><strong>Venue:</strong> ${event.venue}</p>
          <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Organizer:</strong> ${event.organizer || 'College Administration'}</p>
        </div>

        <p style="color: #334155; font-size: 15px; line-height: 1.5;">${event.description}</p>
        
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">View on Dashboard</a>
        </div>
        
        <p style="color: #4f46e5; font-weight: 600; font-size: 14px; margin-top: 32px; margin-bottom: 0;">College Events & Administration</p>
      </div>
    `;

    // Process Students
    if (students && students.length > 0) {
      students.forEach(s => {
        studentNotifs.push({
          id: 'SN-' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 5),
          student_id: s.id,
          title: `New ${event.type}: ${event.title}`,
          type: 'Event',
          priority: 'Medium',
          time: 'Just now',
          unread: true
        });

        if (s.email) {
          emailTasks.push({ to: s.email, subject: `Upcoming Event: ${event.title}`, html: eventDetailsHtml });
        }
        if (s.parent_email) {
          emailTasks.push({ to: s.parent_email, subject: `Upcoming College Event: ${event.title}`, html: eventDetailsHtml });
        }
      });
      
      // Chunk insert
      for (let i = 0; i < studentNotifs.length; i += 100) {
        await supabase.from('student_notifications').insert(studentNotifs.slice(i, i + 100));
      }
    }

    // Process Faculty
    if (faculty && faculty.length > 0) {
      faculty.forEach(f => {
        facultyNotifs.push({
          id: 'FN-' + Math.random().toString(36).substr(2, 9),
          title: `New ${event.type}: ${event.title}`,
          type: 'Event',
          priority: 'Medium',
          time: 'Just now',
          unread: true
        });

        if (f.email) {
          emailTasks.push({ to: f.email, subject: `Faculty Notice: ${event.title}`, html: eventDetailsHtml });
        }
      });

      for (let i = 0; i < facultyNotifs.length; i += 100) {
        await supabase.from('faculty_notifications').insert(facultyNotifs.slice(i, i + 100));
      }
    }

    // Process Admins
    if (admins && admins.length > 0) {
      admins.forEach(a => {
        adminNotifs.push({
          id: 'AN-' + Math.random().toString(36).substr(2, 9),
          title: `Event Approved & Published: ${event.title}`,
          category: 'Academic',
          time: 'Just now',
          unread: true
        });

        if (a.email) {
          emailTasks.push({ to: a.email, subject: `Event Published: ${event.title}`, html: eventDetailsHtml });
        }
      });

      for (let i = 0; i < adminNotifs.length; i += 100) {
        await supabase.from('admin_notifications').insert(adminNotifs.slice(i, i + 100));
      }
    }

    // Async background email sending in chunks
    console.log(`[Event Broadcaster] Starting background email broadcast to ${emailTasks.length} recipients...`);
    (async () => {
      for (const task of emailTasks) {
        sendEmail(task).catch(err => {
          console.error(`[Event Email Error] Failed to send to ${task.to}:`, err.message);
        });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      console.log(`[Event Broadcaster] Email broadcast complete.`);
    })();

  } catch (err) {
    console.error('[Event Broadcaster Error] Broadcast failed:', err);
  }
}

/**
 * 1. Get Event Stats
 */
export async function getEventStats(req, res, next) {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('status, date, created_at, updated_at');
    
    if (error) throw error;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'

    let pendingCount = 0;
    let approvedCount = 0;
    let upcomingCount = 0;
    let totalEvents = events?.length || 0;
    let thisMonthCount = 0;
    let thisSemesterCount = 0;
    let approvedForRate = 0;
    let rejectedForRate = 0;
    let sumProcessingDays = 0;
    let processedCount = 0;

    events?.forEach(e => {
      const status = e.status;
      const eventDateStr = e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date || '');

      if (status === 'Pending Approval') {
        pendingCount++;
      } else if (status === 'Approved') {
        approvedCount++;
        if (eventDateStr >= todayStr) {
          upcomingCount++;
        }
      }

      if (eventDateStr.startsWith(currentMonthStr)) {
        thisMonthCount++;
      }
      
      // Events this semester (assume last 4 months for now)
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
      const fourMonthsAgoStr = fourMonthsAgo.toISOString().split('T')[0];
      if (eventDateStr >= fourMonthsAgoStr) {
        thisSemesterCount++;
      }

      if (status === 'Approved') approvedForRate++;
      if (status === 'Rejected') rejectedForRate++;

      if (status === 'Approved' || status === 'Rejected') {
        const created = new Date(e.created_at);
        const updated = new Date(e.updated_at);
        const diffMs = updated - created;
        const diffDays = Math.max(0.1, diffMs / (1000 * 60 * 60 * 24));
        sumProcessingDays += diffDays;
        processedCount++;
      }
    });

    const totalRated = approvedForRate + rejectedForRate;
    const approvalRate = totalRated > 0 ? Math.round((approvedForRate / totalRated) * 100) : 100;
    const avgProcessingTime = processedCount > 0 
      ? (sumProcessingDays / processedCount).toFixed(1) + ' days'
      : '2.3 days';

    res.json({
      success: true,
      data: {
        pendingCount,
        approvedCount,
        upcomingCount,
        totalEvents,
        thisMonthCount,
        thisSemesterCount,
        approvalRate: `${approvalRate}%`,
        avgProcessingTime
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Get Events List
 */
export async function getEvents(req, res, next) {
  try {
    const { search, status, type } = req.query;

    let query = supabase.from('events').select('*');

    if (status && status !== 'All Status') {
      query = query.eq('status', status);
    }
    if (type && type !== 'All Types') {
      query = query.eq('type', type);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue.ilike.%${search}%`);
    }

    // Sort by date descending and created_at descending
    query = query.order('date', { ascending: false }).order('created_at', { ascending: false });

    const { data: events, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Create Event
 */
export async function createEvent(req, res, next) {
  try {
    const { title, description, type, date, time, venue, organizer, status } = req.body;

    if (!title || !description || !type || !date || !venue) {
      return res.status(400).json({ success: false, message: 'Title, description, type, date, and venue are required.' });
    }

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        type,
        category: (type || 'other').toLowerCase(),
        date,
        time: time || null,
        venue,
        organizer: organizer || 'College Administration',
        status: status || 'Approved'
      })
      .select()
      .single();

    if (error) throw error;

    // If approved, trigger background email & in-app notifications to all roles
    if (newEvent.status === 'Approved') {
      broadcastEventNotifications(newEvent);
    }

    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Update Event Status (Approve/Reject)
 */
export async function updateEventStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected', 'Pending Approval'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required.' });
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Trigger broadcasts if newly approved
    if (status === 'Approved') {
      broadcastEventNotifications(updatedEvent);
    }

    res.json({ success: true, data: updatedEvent });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Delete Event
 */
export async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
