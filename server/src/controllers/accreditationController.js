import { supabase } from '../config/supabase.js';

// Fallback seeds for NAAC Cycles, Criteria, Metrics, Evidence, Committees, and Meetings
const fallbackCycles = [
  { id: "CYC001", name: "NAAC Cycle-3 Accreditation", status: "Active", startDate: "2024-01-01", endDate: "2028-12-31" }
];

const fallbackCriteria = [
  { id: "CRT1", number: 1, title: "Curricular Aspects", weightage: 100, completionPercentage: 95, status: "Review" },
  { id: "CRT2", number: 2, title: "Teaching-Learning & Evaluation", weightage: 350, completionPercentage: 92, status: "Review" },
  { id: "CRT3", number: 3, title: "Research, Innovations & Extension", weightage: 120, completionPercentage: 78, status: "Drafting" },
  { id: "CRT4", number: 4, title: "Infrastructure & Learning Resources", weightage: 100, completionPercentage: 98, status: "Approved" },
  { id: "CRT5", number: 5, title: "Student Support & Progression", weightage: 130, completionPercentage: 85, status: "Drafting" },
  { id: "CRT6", number: 6, title: "Governance, Leadership & Management", weightage: 100, completionPercentage: 88, status: "Review" },
  { id: "CRT7", number: 7, title: "Institutional Values & Best Practices", weightage: 100, completionPercentage: 90, status: "Approved" }
];

const fallbackMetrics = [
  { id: "MET111", criteriaId: "CRT1", code: "1.1.1", name: "Curriculum Design & Development", description: "Curriculum developed and implemented have relevance to the local, national, regional and global developmental needs.", weightage: 50, department: "CSE", coordinator: "Dr. John Smith", status: "Completed", targetDate: "2026-06-30", completedDate: "2026-06-25" },
  { id: "MET112", criteriaId: "CRT1", code: "1.1.2", name: "Academic Flexibility", description: "Percentage of programs where syllabus revision was carried out.", weightage: 30, department: "CSE", coordinator: "Dr. John Smith", status: "Completed", targetDate: "2026-07-10", completedDate: "2026-07-08" },
  { id: "MET113", criteriaId: "CRT1", code: "1.1.3", name: "Syllabus Revision Board Minutes", description: "Average percentage of courses having focus on employability/ entrepreneurship/ skill development.", weightage: 20, department: "ECE", coordinator: "Mrs. Ananya Sen", status: "In_Progress", targetDate: "2026-07-28", completedDate: null },
  { id: "MET211", criteriaId: "CRT2", code: "2.1.1", name: "Student Enrolment and Profile", description: "Average enrolment percentage of students.", weightage: 40, department: "CSE", coordinator: "Dr. John Smith", status: "Completed", targetDate: "2026-06-15", completedDate: "2026-06-12" },
  { id: "MET221", criteriaId: "CRT2", code: "2.2.1", name: "Student-Computer Ratio Verification", description: "Student - Computer ratio (Data for the latest completed academic year).", weightage: 50, department: "CSE", coordinator: "Dr. John Smith", status: "In_Progress", targetDate: "2026-07-24", completedDate: null },
  { id: "MET311", criteriaId: "CRT3", code: "3.1.1", name: "Research Funding Projects", description: "Grants received from Government and non-governmental agencies for research projects.", weightage: 60, department: "MECH", coordinator: "Dr. Srinivas Rao", status: "Pending", targetDate: "2026-08-15", completedDate: null },
  { id: "MET411", criteriaId: "CRT4", code: "4.1.1", name: "Infrastructure & Physical Facilities", description: "Adequacy of infrastructure and physical facilities for teaching-learning.", weightage: 100, department: "Civil", coordinator: "Mrs. Ananya Sen", status: "Completed", targetDate: "2026-05-10", completedDate: "2026-05-08" }
];

const fallbackEvidence = [
  { id: "EVD001", metricId: "MET111", title: "Syllabus Structure 2025", fileUrl: "SyllabusStructure_2025.pdf", fileType: "PDF", status: "Approved", owner: "Dr. John Smith", department: "CSE", version: 2 },
  { id: "EVD002", metricId: "MET112", title: "Academic Council Minutes 2026", fileUrl: "AcademicCouncilMinutes_2026.docx", fileType: "DOCX", status: "In_Review", owner: "Mrs. Ananya Sen", department: "ECE", version: 1 },
  { id: "EVD003", metricId: "MET221", title: "Computer Lab Stock Ledger", fileUrl: "LabStockLedger_2026.xlsx", fileType: "XLSX", status: "Uploaded", owner: "Dr. John Smith", department: "CSE", version: 1 }
];

const fallbackRemarks = [
  { id: "RMK001", documentId: "EVD001", remarks: "Curriculum structure meets all AICTE model syllabus guidelines.", role: "Dean Academics", userName: "Dean Academics Office", createdAt: "2026-06-25T10:00:00Z" },
  { id: "RMK002", documentId: "EVD002", remarks: "Please upload signed copy of the minutes instead of draft.", role: "HOD CSE", userName: "HOD CSE Dept", createdAt: "2026-07-09T14:30:00Z" }
];

const fallbackCommittees = [
  { id: "COM001", name: "Internal Quality Assurance Cell (IQAC)", description: "Central committee responsible for overseeing and maintaining institutional quality standards." },
  { id: "COM002", name: "NAAC Steering Committee", description: "Departmental coordinators focused on compiling the Self-Study Report (SSR)." }
];

const fallbackMembers = [
  { id: "MEM001", committeeId: "COM001", userName: "Dr. Srinivas Rao", role: "IQAC Coordinator", tenure: "2024-2027" },
  { id: "MEM002", committeeId: "COM001", userName: "Principal Office", role: "Chairman", tenure: "Ex-Officio" },
  { id: "MEM003", committeeId: "COM002", userName: "Dr. John Smith", role: "CSE Coordinator", tenure: "2025-2027" }
];

const fallbackMeetings = [
  { id: "MTG001", committeeId: "COM001", title: "Odd Semester QA Review", agenda: "Review of syllabus revisions and OBE course mapping progress.", date: "2026-07-10", time: "11:00 AM", venue: "Board Room", participants: ["Dr. Srinivas Rao", "Principal Office", "Dr. John Smith"], minutes: "Decided to accelerate CO-PO mapping completions. Addressed low computer-student ratio in Mechanical block.", status: "Completed" },
  { id: "MTG002", committeeId: "COM001", title: "Peer Team Visit Preparedness Check", agenda: "SSR document validation and DVV check audit trail verification.", date: "2026-07-25", time: "02:30 PM", venue: "Conference Hall B", participants: ["Dr. Srinivas Rao", "Principal Office"], minutes: "", status: "Scheduled" }
];

const fallbackActionItems = [
  { id: "ATR001", meetingId: "MTG001", description: "Complete CO-PO Mapping verification for CSE cohort", assignedTo: "Dr. John Smith", dueDate: "2026-07-20", priority: "High", status: "Completed", remarks: "All 18 courses mapped.", completedAt: "2026-07-18T09:30:00Z" },
  { id: "ATR002", meetingId: "MTG001", description: "Audit mechanical lab computer stock logs", assignedTo: "Dr. Srinivas Rao", dueDate: "2026-07-24", priority: "Medium", status: "Pending", remarks: "", completedAt: null }
];

const fallbackAuditLogs = [
  { id: "AUD001", userName: "Super Admin", role: "super-admin", action: "Seeded", entity: "naac_criteria", entityId: "CRT1", oldValue: null, newValue: "Curricular Aspects (100 weightage)", ip: "127.0.0.1", createdAt: "2026-07-18T04:00:00Z" },
  { id: "AUD002", userName: "Dr. John Smith", role: "faculty", action: "Uploaded Evidence", entity: "evidence_documents", entityId: "EVD003", oldValue: null, newValue: "Computer Lab Stock Ledger v1", ip: "192.168.1.10", createdAt: "2026-07-18T08:15:00Z" }
];

const fallbackNotifications = [
  { id: "NTF001", userId: "all", message: "NAAC Self-Study Report (SSR) generator is open for drafting.", type: "General", unread: true, createdAt: "2026-07-18T04:10:00Z" },
  { id: "NTF002", userId: "33333333-3333-3333-3333-333333333333", message: "Action Item: complete ECE syllabus revisions audit due by July 28.", type: "ATR", unread: true, createdAt: "2026-07-18T09:40:00Z" }
];

// Helper to push audit logs dynamically
const logAction = async (userName, role, action, entity, entityId, oldValue, newValue, req) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    await supabase.from('audit_logs').insert([{
      user_name: userName,
      role,
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip
    }]);
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};

export const getAccreditationDashboard = async (req, res, next) => {
  try {
    const [criteriaRes, metricsRes, evidenceRes, meetingsRes, atrRes, notificationsRes] = await Promise.all([
      supabase.from('naac_criteria').select('*'),
      supabase.from('naac_metrics').select('*'),
      supabase.from('evidence_documents').select('*'),
      supabase.from('committee_meetings').select('*'),
      supabase.from('committee_action_items').select('*'),
      supabase.from('notifications').select('*')
    ]);

    const hasDBError = criteriaRes.error || metricsRes.error || evidenceRes.error;

    let criteria = fallbackCriteria;
    let metrics = fallbackMetrics;
    let evidence = fallbackEvidence;
    let meetings = fallbackMeetings;
    let actionItems = fallbackActionItems;
    let notificationsList = fallbackNotifications;

    if (!hasDBError) {
      if (criteriaRes.data && criteriaRes.data.length > 0) criteria = criteriaRes.data;
      if (metricsRes.data && metricsRes.data.length > 0) metrics = metricsRes.data;
      if (evidenceRes.data && evidenceRes.data.length > 0) evidence = evidenceRes.data;
      if (meetingsRes.data && meetingsRes.data.length > 0) meetings = meetingsRes.data;
      if (atrRes.data && atrRes.data.length > 0) actionItems = atrRes.data;
      if (notificationsRes.data && notificationsRes.data.length > 0) notificationsList = notificationsRes.data;
    }

    // Calculations
    const totalMetrics = metrics.length;
    const completedMetrics = metrics.filter(m => m.status === 'Completed').length;
    const pendingMetrics = metrics.filter(m => m.status === 'Pending' || m.status === 'In_Progress').length;
    
    const approvedEvidences = evidence.filter(e => e.status === 'Approved').length;
    const inReviewEvidences = evidence.filter(e => e.status === 'In_Review' || e.status === 'Uploaded').length;
    const rejectedEvidences = evidence.filter(e => e.status === 'Rejected').length;

    const completedATR = actionItems.filter(a => a.status === 'Completed').length;
    const totalATR = actionItems.length;

    // Due dates check
    const today = new Date();
    const overdueMetricsList = [];
    const dueThisWeekList = [];
    const dueThisMonthList = [];

    metrics.forEach(m => {
      if (m.status !== 'Completed' && m.targetDate) {
        const target = new Date(m.targetDate);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const metricObj = {
          id: m.id,
          code: m.code,
          name: m.name,
          coordinator: m.coordinator,
          targetDate: m.targetDate,
          daysRemaining: diffDays
        };

        if (diffDays < 0) {
          overdueMetricsList.push(metricObj);
        } else if (diffDays <= 7) {
          dueThisWeekList.push(metricObj);
        } else if (diffDays <= 30) {
          dueThisMonthList.push(metricObj);
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        cycles: fallbackCycles,
        kpis: {
          naacGrade: "A++",
          naacCgpa: "3.82 / 4.00",
          cycle: "Cycle 3",
          validity: "Until Dec 2028",
          nextVisit: "October 2026",
          ssrCompletion: 88,
          aqarCompletion: 95,
          totalMetrics,
          completedMetrics,
          pendingMetrics,
          evidenceCount: evidence.length,
          approvedEvidences,
          inReviewEvidences,
          rejectedEvidences,
          totalATR,
          completedATR,
          atrCompletionRate: totalATR > 0 ? Math.round((completedATR / totalATR) * 100) : 100
        },
        criteria,
        metrics,
        evidence,
        meetings,
        actionItems,
        notifications: notificationsList,
        overdueMetrics: overdueMetricsList,
        dueThisWeek: dueThisWeekList,
        dueThisMonth: dueThisMonthList
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getCriteria = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('naac_criteria').select('*');
    if (error || !data || data.length === 0) {
      return res.status(200).json({ success: true, data: fallbackCriteria });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMetrics = async (req, res, next) => {
  try {
    const { criteriaId, department, status } = req.query;
    let query = supabase.from('naac_metrics').select('*');

    if (criteriaId) query = query.eq('criteria_id', criteriaId);
    if (department) query = query.eq('department', department);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = fallbackMetrics;
      if (criteriaId) filtered = filtered.filter(m => m.criteriaId === criteriaId);
      if (department) filtered = filtered.filter(m => m.department.toLowerCase() === department.toLowerCase());
      if (status) filtered = filtered.filter(m => m.status.toLowerCase() === status.toLowerCase());
      return res.status(200).json({ success: true, data: filtered });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createMetric = async (req, res, next) => {
  try {
    const { criteriaId, code, name, description, weightage, department, coordinator, targetDate } = req.body;
    
    if (!criteriaId || !code || !name) {
      return res.status(400).json({ success: false, message: "Criteria ID, Code, and Metric Name are required." });
    }

    const { data, error } = await supabase.from('naac_metrics').insert([{
      criteria_id: criteriaId,
      code,
      name,
      description,
      weightage: parseFloat(weightage) || 10,
      department: department || 'CSE',
      coordinator: coordinator || 'Dr. John Smith',
      status: 'Pending',
      target_date: targetDate || null
    }]).select().single();

    if (error) throw error;

    await logAction(req.user?.name || "System", req.user?.role || "admin", "Created Metric", "naac_metrics", data.id, null, data, req);

    res.status(201).json({ success: true, message: "Metric created successfully.", data });
  } catch (err) {
    next(err);
  }
};

export const updateMetric = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateBody = req.body;

    const { data: exists } = await supabase.from('naac_metrics').select('*').eq('id', id).maybeSingle();
    
    const { data, error } = await supabase.from('naac_metrics').update({
      criteria_id: updateBody.criteriaId,
      code: updateBody.code,
      name: updateBody.name,
      description: updateBody.description,
      weightage: updateBody.weightage ? parseFloat(updateBody.weightage) : undefined,
      department: updateBody.department,
      coordinator: updateBody.coordinator,
      status: updateBody.status,
      target_date: updateBody.targetDate,
      completed_date: updateBody.status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    }).eq('id', id).select().single();

    if (error) throw error;

    await logAction(req.user?.name || "System", req.user?.role || "admin", "Updated Metric", "naac_metrics", id, exists, data, req);

    res.status(200).json({ success: true, message: "Metric updated successfully.", data });
  } catch (err) {
    next(err);
  }
};

export const deleteMetric = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check fallback
    const idx = fallbackMetrics.findIndex(m => m.id === id);
    if (idx !== -1) {
      fallbackMetrics.splice(idx, 1);
      return res.status(200).json({ success: true, message: "Metric deleted from fallback." });
    }

    const { error } = await supabase.from('naac_metrics').delete().eq('id', id);
    if (error) throw error;

    await logAction(req.user?.name || "System", req.user?.role || "admin", "Deleted Metric", "naac_metrics", id, null, null, req);

    res.status(200).json({ success: true, message: "Metric deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export const getEvidence = async (req, res, next) => {
  try {
    const { metricId, status } = req.query;
    let query = supabase.from('evidence_documents').select('*');
    if (metricId) query = query.eq('metric_id', metricId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = fallbackEvidence;
      if (metricId) filtered = filtered.filter(e => e.metricId === metricId);
      if (status) filtered = filtered.filter(e => e.status === status);
      return res.status(200).json({ success: true, data: filtered });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const uploadEvidence = async (req, res, next) => {
  try {
    const { metricId, title, fileUrl, fileType, department } = req.body;

    const { data, error } = await supabase.from('evidence_documents').insert([{
      metric_id: metricId,
      title,
      file_url: fileUrl || "draft_upload.pdf",
      file_type: fileType || "PDF",
      status: "Uploaded",
      owner_name: req.user?.name || "Faculty Member",
      department: department || "CSE",
      version: 1
    }]).select().single();

    if (error) throw error;

    await logAction(req.user?.name || "Faculty Member", req.user?.role || "faculty", "Uploaded Evidence", "evidence_documents", data.id, null, data, req);

    // Initial Remarks History
    await supabase.from('remarks_history').insert([{
      document_id: data.id,
      remarks: "Document created and uploaded.",
      role: req.user?.role || "faculty",
      user_name: req.user?.name || "Faculty Member"
    }]);

    res.status(201).json({ success: true, message: "Evidence metadata registered.", data });
  } catch (err) {
    next(err);
  }
};

export const replaceEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fileUrl, fileType } = req.body;

    const { data: current, error: getErr } = await supabase.from('evidence_documents').select('*').eq('id', id).single();
    if (getErr || !current) {
      return res.status(404).json({ success: false, message: "Evidence document not found." });
    }

    const nextVer = (current.version || 1) + 1;

    // Update document
    const { data, error } = await supabase.from('evidence_documents').update({
      file_url: fileUrl,
      file_type: fileType || current.file_type,
      version: nextVer,
      status: "Uploaded"
    }).eq('id', id).select().single();

    if (error) throw error;

    // Log version history
    await supabase.from('evidence_versions').insert([{
      document_id: id,
      version: nextVer,
      file_url: fileUrl,
      uploaded_by: req.user?.id || 'mock-user-id'
    }]);

    await logAction(req.user?.name || "Faculty", req.user?.role || "faculty", "Replaced Evidence File", "evidence_documents", id, current, data, req);

    res.status(200).json({ success: true, message: `Replaced file. Incremented version to ${nextVer}`, data });
  } catch (err) {
    next(err);
  }
};

export const submitWorkflowState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, status, remarks } = req.body; // e.g. status: Approved/Rejected/Sent_Back

    const { data: current } = await supabase.from('evidence_documents').select('*').eq('id', id).maybeSingle();

    let targetDocStatus = 'In_Review';
    if (status === 'Approved' && stage === 'Principal') {
      targetDocStatus = 'Approved';
    } else if (status === 'Rejected') {
      targetDocStatus = 'Rejected';
    }

    const { data, error } = await supabase.from('evidence_documents').update({
      status: targetDocStatus
    }).eq('id', id).select().single();

    if (error) throw error;

    // Save Remarks History
    await supabase.from('remarks_history').insert([{
      document_id: id,
      remarks: remarks || `Workflow update to ${stage} status ${status}`,
      role: req.user?.role || "coordinator",
      user_name: req.user?.name || "Reviewer Office"
    }]);

    // Save Workflow Step record
    await supabase.from('approval_workflow').insert([{
      document_id: id,
      stage,
      status,
      remarks,
      actor_id: req.user?.id || 'mock-user-id'
    }]);

    await logAction(req.user?.name || "Reviewer", req.user?.role || "coordinator", `Workflow Update: ${stage} - ${status}`, "evidence_documents", id, current, data, req);

    res.status(200).json({ success: true, message: `Workflow transitioned to ${stage}: ${status}`, data });
  } catch (err) {
    next(err);
  }
};

export const getCommitteesAndMeetings = async (req, res, next) => {
  try {
    const [coms, mtgs, actions] = await Promise.all([
      supabase.from('committee_master').select('*'),
      supabase.from('committee_meetings').select('*'),
      supabase.from('committee_action_items').select('*')
    ]);

    res.status(200).json({
      success: true,
      data: {
        committees: coms.data && coms.data.length > 0 ? coms.data : fallbackCommittees,
        meetings: mtgs.data && mtgs.data.length > 0 ? mtgs.data : fallbackMeetings,
        actionItems: actions.data && actions.data.length > 0 ? actions.data : fallbackActionItems
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createMeeting = async (req, res, next) => {
  try {
    const { committeeId, title, agenda, date, time, venue, participants } = req.body;

    const { data, error } = await supabase.from('committee_meetings').insert([{
      committee_id: committeeId || "COM001",
      title,
      agenda,
      date,
      time,
      venue,
      participants: JSON.stringify(participants || []),
      status: "Scheduled"
    }]).select().single();

    if (error) throw error;

    await logAction(req.user?.name || "IQAC Office", req.user?.role || "coordinator", "Scheduled Meeting", "committee_meetings", data.id, null, data, req);

    res.status(201).json({ success: true, message: "Meeting scheduled.", data });
  } catch (err) {
    next(err);
  }
};

export const createActionItem = async (req, res, next) => {
  try {
    const { meetingId, description, assignedTo, dueDate, priority } = req.body;

    const { data, error } = await supabase.from('committee_action_items').insert([{
      meeting_id: meetingId,
      description,
      assigned_to: assignedTo,
      due_date: dueDate,
      priority: priority || "Medium",
      status: "Pending"
    }]).select().single();

    if (error) throw error;

    await logAction(req.user?.name || "IQAC Office", req.user?.role || "coordinator", "Created Action Item (ATR)", "committee_action_items", data.id, null, data, req);

    res.status(201).json({ success: true, message: "Action Item successfully tracked under ATR registry.", data });
  } catch (err) {
    next(err);
  }
};

export const updateActionItemStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const { data: current } = await supabase.from('committee_action_items').select('*').eq('id', id).maybeSingle();

    const { data, error } = await supabase.from('committee_action_items').update({
      status,
      remarks,
      completed_at: status === 'Completed' ? new Date().toISOString() : null
    }).eq('id', id).select().single();

    if (error) throw error;

    await logAction(req.user?.name || "Reviewer", req.user?.role || "admin", `ATR Updated: ${status}`, "committee_action_items", id, current, data, req);

    res.status(200).json({ success: true, message: "Action Item status updated.", data });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (error || !data || data.length === 0) {
      return res.status(200).json({ success: true, data: fallbackAuditLogs });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getRemarksHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { data, error } = await supabase.from('remarks_history').select('*').eq('document_id', documentId).order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      const filtered = fallbackRemarks.filter(r => r.documentId === documentId);
      return res.status(200).json({ success: true, data: filtered });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
