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

export const IMMUTABLE_EDIT_STATUSES = [
  'Completed',
  'Results_Generated',
  'Results_Verified',
  'Results_Published',
  'Sent_to_Recruiter'
];

export const IMMUTABLE_DELETE_STATUSES = [
  'Published',
  'In_Progress',
  'Completed',
  'Results_Generated',
  'Results_Verified',
  'Results_Published',
  'Sent_to_Recruiter'
];

export async function getAssessmentsByDrive(req, res) {
  req.query = { ...req.query, drive_id: req.params.driveId };
  return getAssessments(req, res);
}

/**
 * Get all assessments with optional filtering by drive_id, recruiter_id, current_status, or search query
 */
export async function getAssessments(req, res) {
  try {
    const { drive_id, recruiter_id, current_status, status, search, role } = req.query;

    let query = supabase.from('assessments').select('*');

    if (drive_id) {
      query = query.eq('drive_id', drive_id);
    }
    if (recruiter_id) {
      query = query.eq('recruiter_id', recruiter_id);
    }
    const targetStatus = current_status || status;
    if (targetStatus) {
      query = query.eq('current_status', targetStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assessments:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch assessments' });
    }

    let results = (data || []).map(item => ({
      ...item,
      assessment_name: item.assessment_name || item.title || 'Untitled Assessment',
      current_status: item.current_status || item.status || 'Draft',
      duration: item.duration || item.duration_minutes || 60
    }));

    // Filter out unpublished assessments for Students
    if (role === 'student' || req.user?.role === 'student') {
      results = results.filter(a =>
        a.current_status === 'Published' ||
        a.current_status === 'In_Progress' ||
        a.current_status === 'Completed' ||
        a.current_status === 'Results_Published'
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(a =>
        (a.assessment_name && a.assessment_name.toLowerCase().includes(q)) ||
        (a.company_name && a.company_name.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }

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
 * Get single assessment by ID with timeline events and status history
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

    const normalized = {
      ...assessment,
      assessment_name: assessment.assessment_name || assessment.title || 'Untitled Assessment',
      current_status: assessment.current_status || assessment.status || 'Draft',
      duration: assessment.duration || assessment.duration_minutes || 60
    };

    // Drive details
    let driveDetails = null;
    if (normalized.drive_id) {
      const { data: drive } = await supabase
        .from('placement_drives')
        .select('*')
        .eq('id', normalized.drive_id)
        .maybeSingle();
      driveDetails = drive;
    }

    // Status history
    const { data: statusHistory } = await supabase
      .from('assessment_status_history')
      .select('*')
      .eq('assessment_id', id);

    // Timeline events
    const { data: timelineEvents } = await supabase
      .from('assessment_timeline')
      .select('*')
      .eq('assessment_id', id);

    const sortedHistory = (statusHistory || []).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const sortedTimeline = (timelineEvents || []).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return res.json({
      success: true,
      data: {
        ...normalized,
        drive: driveDetails,
        status_history: sortedHistory,
        timeline: sortedTimeline
      }
    });
  } catch (err) {
    console.error('getAssessmentById exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Create a new Assessment Foundation
 * Validation: Enforces unique assessment_name within the same drive_id
 */
export async function createAssessment(req, res) {
  try {
    const {
      drive_id,
      recruiter_id,
      company_id,
      company_name,
      assessment_name,
      title,
      description,
      instructions,
      passing_marks = 40,
      total_marks = 100,
      duration = 60,
      current_status = 'Draft'
    } = req.body;

    const name = (assessment_name || title || '').trim();

    if (!drive_id) {
      return res.status(400).json({ success: false, message: 'Drive ID (drive_id) is required.' });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: 'Assessment Name (assessment_name) is required.' });
    }

    // Validation Rule 1: No duplicate assessment names within the same drive
    const { data: existingSameDrive } = await supabase
      .from('assessments')
      .select('*')
      .eq('drive_id', drive_id);

    console.log('DEBUG duplicate check:', (existingSameDrive || []).map(a => a.assessment_name || a.title), 'checking:', name);

    const isDuplicate = (existingSameDrive || []).some(
      a => (a.assessment_name || a.title || '').toLowerCase().trim() === name.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: An assessment named "${name}" already exists for this recruitment drive.`
      });
    }

    const userRole = req.user?.role || 'recruiter';
    const userName = req.user?.name || req.user?.full_name || req.user?.email || 'Recruiter User';

    const newAssessment = {
      id: `asm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      drive_id,
      recruiter_id: recruiter_id || req.user?.id || null,
      company_id: company_id || null,
      company_name: company_name || 'Partner Company',
      assessment_name: name,
      description: description || '',
      instructions: instructions || '',
      passing_marks: Number(passing_marks) || 40,
      total_marks: Number(total_marks) || 100,
      duration: Number(duration) || 60,
      current_status,
      created_by: userName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assessments')
      .insert([newAssessment])
      .select();

    const createdRecord = (data && data[0]) || newAssessment;

    // Log status history
    await supabase.from('assessment_status_history').insert([{
      id: `ash-${Date.now()}`,
      assessment_id: createdRecord.id,
      from_status: null,
      to_status: createdRecord.current_status,
      changed_by: userName,
      comments: `Assessment foundation created in status '${createdRecord.current_status}'.`,
      created_at: new Date().toISOString()
    }]);

    // Log timeline event
    await supabase.from('assessment_timeline').insert([{
      id: `atl-${Date.now()}`,
      assessment_id: createdRecord.id,
      event_type: 'CREATED',
      title: 'Assessment Created',
      description: `Assessment "${name}" was created by ${userName}.`,
      actor_name: userName,
      actor_role: userRole,
      created_at: new Date().toISOString()
    }]);

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
 * Update assessment details
 * Validation: Cannot edit completed assessments
 */
export async function updateAssessment(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const { data: existing } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const currentStatus = existing.current_status || existing.status || 'Draft';

    // Validation Rule 3: Cannot edit completed assessments
    if (IMMUTABLE_EDIT_STATUSES.includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Cannot edit assessment "${existing.assessment_name || existing.title}" because it has reached status "${currentStatus}".`
      });
    }

    // Validation Rule 1 (on rename): No duplicate assessment names within the same drive
    if (payload.assessment_name || payload.title) {
      const newName = (payload.assessment_name || payload.title).trim();
      const { data: existingSameDrive } = await supabase
        .from('assessments')
        .select('*')
        .eq('drive_id', existing.drive_id);

      const isDuplicate = (existingSameDrive || []).some(
        a => a.id !== id && (a.assessment_name || a.title || '').toLowerCase().trim() === newName.toLowerCase()
      );

      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: `Validation Error: Another assessment named "${newName}" already exists in this drive.`
        });
      }
    }

    const updatedFields = {
      ...payload,
      updated_at: new Date().toISOString()
    };
    delete updatedFields.id;

    const { data: updated } = await supabase
      .from('assessments')
      .update(updatedFields)
      .eq('id', id)
      .select();

    const userName = req.user?.name || req.user?.full_name || req.user?.email || 'User';
    const userRole = req.user?.role || 'user';

    // Log timeline event for update
    await supabase.from('assessment_timeline').insert([{
      id: `atl-${Date.now()}`,
      assessment_id: id,
      event_type: 'UPDATED',
      title: 'Assessment Specifications Updated',
      description: `Assessment parameters updated by ${userName}.`,
      actor_name: userName,
      actor_role: userRole,
      created_at: new Date().toISOString()
    }]);

    return res.json({
      success: true,
      message: 'Assessment updated successfully',
      data: (updated && updated[0]) || { ...existing, ...updatedFields }
    });
  } catch (err) {
    console.error('updateAssessment exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Update assessment status & record status history and timeline events
 */
export async function updateAssessmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, current_status, comments } = req.body;
    const nextStatus = current_status || status;

    if (!nextStatus || !VALID_ASSESSMENT_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${nextStatus}'. Must be one of: ${VALID_ASSESSMENT_STATUSES.join(', ')}`
      });
    }

    const { data: existing } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const fromStatus = existing.current_status || existing.status || 'Draft';
    const userName = req.user?.name || req.user?.full_name || req.user?.email || 'System User';
    const userRole = req.user?.role || 'user';

    const updatePayload = {
      current_status: nextStatus,
      status: nextStatus,
      updated_at: new Date().toISOString()
    };

    const { data: updated } = await supabase
      .from('assessments')
      .update(updatePayload)
      .eq('id', id)
      .select();

    // Record status history
    await supabase.from('assessment_status_history').insert([{
      id: `ash-${Date.now()}`,
      assessment_id: id,
      from_status: fromStatus,
      to_status: nextStatus,
      changed_by: userName,
      comments: comments || `Status changed from '${fromStatus}' to '${nextStatus}'.`,
      created_at: new Date().toISOString()
    }]);

    // Record timeline event
    const eventTypeMap = {
      Submitted_to_TPO: 'SUBMITTED',
      Approved: 'APPROVED',
      Scheduled: 'SCHEDULED',
      Published: 'PUBLISHED',
      In_Progress: 'IN_PROGRESS',
      Completed: 'COMPLETED',
      Results_Generated: 'RESULTS_GENERATED',
      Results_Verified: 'RESULTS_VERIFIED',
      Results_Published: 'RESULTS_PUBLISHED',
      Sent_to_Recruiter: 'SENT_TO_RECRUITER'
    };

    const eventType = eventTypeMap[nextStatus] || 'STATUS_CHANGED';

    await supabase.from('assessment_timeline').insert([{
      id: `atl-${Date.now()}`,
      assessment_id: id,
      event_type: eventType,
      title: `Assessment ${nextStatus.replace(/_/g, ' ')}`,
      description: comments || `Assessment status transitioned to ${nextStatus}.`,
      actor_name: userName,
      actor_role: userRole,
      created_at: new Date().toISOString()
    }]);

    return res.json({
      success: true,
      message: `Assessment status updated to '${nextStatus}' successfully.`,
      data: (updated && updated[0]) || { ...existing, ...updatePayload }
    });
  } catch (err) {
    console.error('updateAssessmentStatus exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

/**
 * Delete assessment draft
 * Validation: Cannot delete published or completed assessments
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

    const currentStatus = existing.current_status || existing.status || 'Draft';

    // Validation Rule 2: Cannot delete published assessments
    if (IMMUTABLE_DELETE_STATUSES.includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Cannot delete assessment "${existing.assessment_name || existing.title}" because it is currently in status "${currentStatus}".`
      });
    }

    await supabase.from('assessments').delete().eq('id', id);

    return res.json({
      success: true,
      message: `Assessment "${existing.assessment_name || existing.title}" deleted successfully.`
    });
  } catch (err) {
    console.error('deleteAssessment exception:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}
