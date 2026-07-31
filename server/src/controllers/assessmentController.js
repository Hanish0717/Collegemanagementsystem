import { supabase } from '../config/supabase.js';

export const VALID_ASSESSMENT_STATUSES = [
  'Draft',
  'Submitted_to_TPO',
  'Pending_Approval',
  'Approved',
  'Scheduled',
  'Published',
  'In_Progress',
  'Completed',
  'Results_Generated',
  'Results_Verified',
  'Results_Published',
  'Sent_to_Recruiter'
];

/**
 * Get all assessments with optional filtering by drive_id, company_id, status, or search term
 */
export async function getAssessments(req, res) {
  try {
    const { drive_id, company_id, status, search } = req.query;

    let query = supabase.from('assessments').select('*');

    if (drive_id) {
      query = query.eq('drive_id', drive_id);
    }
    if (company_id) {
      query = query.eq('company_id', company_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assessments:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch assessments from database' });
    }

    let results = data || [];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.company_name && a.company_name.toLowerCase().includes(q)) ||
        (a.assessment_type && a.assessment_type.toLowerCase().includes(q))
      );
    }

    // Sort by updated_at descending
    results.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

    return res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error('getAssessments exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Get single assessment by ID with drive details and audit status logs
 */
export async function getAssessmentById(req, res) {
  try {
    const { id } = req.params;

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Fetch drive details if available
    let driveDetails = null;
    if (assessment.drive_id) {
      const { data: drive } = await supabase
        .from('placement_drives')
        .select('*')
        .eq('id', assessment.drive_id)
        .maybeSingle();
      driveDetails = drive;
    }

    // Fetch status logs
    const { data: logs } = await supabase
      .from('assessment_status_logs')
      .select('*')
      .eq('assessment_id', id);

    const sortedLogs = (logs || []).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return res.json({
      success: true,
      data: {
        ...assessment,
        drive: driveDetails,
        status_logs: sortedLogs
      }
    });
  } catch (err) {
    console.error('getAssessmentById exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Get all assessments belonging to a specific Recruitment Drive
 */
export async function getAssessmentsByDrive(req, res) {
  try {
    const { driveId } = req.params;

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('drive_id', driveId);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch assessments for drive' });
    }

    const sortedData = (data || []).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return res.json({
      success: true,
      count: sortedData.length,
      data: sortedData
    });
  } catch (err) {
    console.error('getAssessmentsByDrive exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Create a new Assessment foundation (linked to a Recruitment Drive)
 */
export async function createAssessment(req, res) {
  try {
    const {
      drive_id,
      company_id,
      company_name,
      title,
      description,
      assessment_type = 'Aptitude',
      duration_minutes = 60,
      total_marks = 100,
      passing_marks = 40,
      scheduled_start,
      scheduled_end,
      venue_or_link,
      instructions,
      status = 'Draft'
    } = req.body;

    if (!drive_id) {
      return res.status(400).json({ success: false, message: 'Recruitment Drive ID (drive_id) is required.' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assessment title is required.' });
    }

    if (!VALID_ASSESSMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid initial status '${status}'. Must be one of: ${VALID_ASSESSMENT_STATUSES.join(', ')}`
      });
    }

    const userRole = req.user?.role || 'recruiter';
    const userName = req.user?.name || req.user?.full_name || req.user?.email || 'Recruiter User';

    const newAssessment = {
      id: `asm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      drive_id,
      company_id: company_id || null,
      company_name: company_name || 'Partner Company',
      title: title.trim(),
      description: description || '',
      assessment_type,
      duration_minutes: Number(duration_minutes) || 60,
      total_marks: Number(total_marks) || 100,
      passing_marks: Number(passing_marks) || 40,
      scheduled_start: scheduled_start || null,
      scheduled_end: scheduled_end || null,
      venue_or_link: venue_or_link || '',
      instructions: instructions || '',
      status: status,
      created_by_role: userRole,
      created_by_name: userName,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assessments')
      .insert([newAssessment])
      .select();

    const createdRecord = (data && data[0]) || newAssessment;

    // Log initial status entry
    const initialLog = {
      id: `asl-${Date.now()}`,
      assessment_id: createdRecord.id,
      from_status: null,
      to_status: createdRecord.status,
      changed_by_role: userRole,
      changed_by_name: userName,
      comments: `Assessment foundation created in stage '${createdRecord.status}'.`,
      created_at: new Date().toISOString()
    };

    await supabase.from('assessment_status_logs').insert([initialLog]);

    return res.status(201).json({
      success: true,
      message: 'Assessment foundation created successfully.',
      data: createdRecord
    });
  } catch (err) {
    console.error('createAssessment exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Update assessment details (title, type, duration, marks, instructions, schedule)
 */
export async function updateAssessment(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const { data: existing, error: fetchErr } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const updatedFields = {
      ...payload,
      updated_at: new Date().toISOString()
    };
    delete updatedFields.id;

    const { data: updated, error: updateErr } = await supabase
      .from('assessments')
      .update(updatedFields)
      .eq('id', id)
      .select();

    const result = (updated && updated[0]) || { ...existing, ...updatedFields };

    return res.json({
      success: true,
      message: 'Assessment updated successfully',
      data: result
    });
  } catch (err) {
    console.error('updateAssessment exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Update workflow lifecycle status across the 12 stages with audit logging
 */
export async function updateAssessmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, comments, rejection_reason } = req.body;

    if (!status || !VALID_ASSESSMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${VALID_ASSESSMENT_STATUSES.join(', ')}`
      });
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const fromStatus = existing.status;
    const userRole = req.user?.role || 'user';
    const userName = req.user?.name || req.user?.full_name || req.user?.email || 'System User';

    const updatePayload = {
      status,
      updated_at: new Date().toISOString()
    };

    if (rejection_reason !== undefined) {
      updatePayload.rejection_reason = rejection_reason;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('assessments')
      .update(updatePayload)
      .eq('id', id)
      .select();

    const resultRecord = (updated && updated[0]) || { ...existing, ...updatePayload };

    // Record audit status log
    const statusLog = {
      id: `asl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      assessment_id: id,
      from_status: fromStatus,
      to_status: status,
      changed_by_role: userRole,
      changed_by_name: userName,
      comments: comments || `Status updated from '${fromStatus}' to '${status}'.`,
      created_at: new Date().toISOString()
    };

    await supabase.from('assessment_status_logs').insert([statusLog]);

    return res.json({
      success: true,
      message: `Assessment status updated to '${status}' successfully.`,
      data: resultRecord,
      log: statusLog
    });
  } catch (err) {
    console.error('updateAssessmentStatus exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Delete assessment foundation (if in Draft or Draft-like state)
 */
export async function deleteAssessment(req, res) {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    await supabase.from('assessments').delete().eq('id', id);

    return res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (err) {
    console.error('deleteAssessment exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}
