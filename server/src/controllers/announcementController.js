import { supabase } from '../config/supabase.js';

/**
 * GET /api/hod/announcements
 * Fetches department announcements and circulars filtered by HOD department.
 */
export const getAnnouncements = async (req, res) => {
  try {
    const dept = (req.query.department || req.user?.department || req.departmentCode || 'AIML').toUpperCase();
    const { category, priority, audience, status, search } = req.query;

    let query = supabase
      .from('announcements')
      .select('*')
      .eq('department', dept)
      .order('created_at', { ascending: false });

    if (category && category !== 'All') query = query.eq('category', category);
    if (priority && priority !== 'All') query = query.eq('priority', priority);
    if (audience && audience !== 'All') query = query.eq('audience', audience);
    if (status && status !== 'All') query = query.eq('status', status);

    const { data: announcements, error } = await query;

    let filtered = announcements || [];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      department: dept,
      count: filtered.length,
      announcements: filtered.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        priority: a.priority,
        audience: a.audience,
        department: a.department,
        semester: a.semester,
        section: a.section,
        expiryDate: a.expiry_date,
        status: a.status,
        attachmentName: a.attachment_name,
        attachmentUrl: a.attachment_url,
        publishedBy: a.published_by,
        publishedDate: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/hod/announcements
 * Creates a new announcement & automatically dispatches notifications to target recipients' Notification Center!
 */
export const createAnnouncement = async (req, res) => {
  try {
    const dept = (req.body.department || req.user?.department || req.departmentCode || 'AIML').toUpperCase();
    const {
      title,
      description,
      category = 'General',
      priority = 'Medium',
      audience = 'All Students',
      semester,
      section,
      expiryDate,
      status = 'Published',
      attachmentName,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const id = `ANN-${Date.now()}`;
    const publishedBy = req.user?.fullName || `Dr. HOD (${dept})`;

    // 1. Insert into PostgreSQL announcements table
    const { data: newAnn, error: annErr } = await supabase
      .from('announcements')
      .insert({
        id,
        title,
        description,
        category,
        priority,
        audience,
        department: dept,
        semester: semester ? parseInt(semester) : null,
        section: section || null,
        expiry_date: expiryDate || null,
        status,
        attachment_name: attachmentName || null,
        published_by: publishedBy,
      })
      .select()
      .single();

    // 2. Automatically generate & insert notification records for target recipients
    const notificationMessage = `[HOD ${dept}] ${category} Announcement: ${title}`;
    
    // Fetch target users (Faculty & Students)
    const { data: targetStudents } = await supabase
      .from('students')
      .select('id, email, full_name')
      .eq('department', dept);

    const { data: targetFaculty } = await supabase
      .from('faculty')
      .select('id, email, full_name')
      .eq('department', dept);

    const notificationsToInsert = [];

    if (audience.includes('Student') || audience.includes('All')) {
      (targetStudents || []).forEach((s) => {
        notificationsToInsert.push({
          id: `NTF-STU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: s.id,
          title: `HOD Published Announcement: ${title}`,
          message: description,
          type: 'announcement',
          category,
          priority,
          read: false,
          created_at: new Date().toISOString(),
        });
      });
    }

    if (audience.includes('Faculty') || audience.includes('All')) {
      (targetFaculty || []).forEach((f) => {
        notificationsToInsert.push({
          id: `NTF-FAC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: f.id,
          title: `HOD Published Circular: ${title}`,
          message: description,
          type: 'circular',
          category,
          priority,
          read: false,
          created_at: new Date().toISOString(),
        });
      });
    }

    if (notificationsToInsert.length > 0) {
      await supabase.from('notifications').insert(notificationsToInsert).select();
    }

    res.status(201).json({
      success: true,
      message: `Announcement published successfully and ${notificationsToInsert.length} notifications dispatched to recipient Notification Center!`,
      announcement: {
        id,
        title,
        description,
        category,
        priority,
        audience,
        department: dept,
        status,
        publishedBy,
        publishedDate: new Date().toISOString().split('T')[0],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/hod/announcements/:id
 * Edit, archive, or republish an announcement.
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, category } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (priority) updateFields.priority = priority;
    if (category) updateFields.category = category;

    const { data: updated, error } = await supabase
      .from('announcements')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    res.json({
      success: true,
      message: `Announcement ${id} updated successfully.`,
      announcement: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/hod/announcements/:id
 * Delete an announcement.
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    await supabase.from('announcements').delete().eq('id', id);

    res.json({
      success: true,
      message: `Announcement ${id} deleted successfully.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
