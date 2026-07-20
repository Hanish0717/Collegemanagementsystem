import { supabase } from '../config/supabase.js';

// Fallback seeds for Announcements, Templates, Delivery Logs, Gateways, Polls, and Surveys
const fallbackAnnouncements = [
  { id: "ANC001", title: "Upcoming Odd Semester Exams", subject: "Odd Semester Exam Schedule 2026", content: "<p>Dear Students,<br/>The odd semester examinations will commence from <strong>November 15, 2026</strong>. Please download your hall tickets from the academic registry portal.</p>", category: "Exam", priority: "High", channel: "Portal", audience_roles: ["student"], target_departments: ["all"], status: "Published", publish_date: "2026-07-10T09:00:00Z", expiry_date: "2026-11-30T23:59:59Z", created_by: "Admin" },
  { id: "ANC002", title: "Independence Day Holiday", subject: "Holiday Announcement - 15th August", content: "<p>Dear Faculty and Students,<br/>The college will remain closed on <strong>August 15, 2026</strong> on account of Independence Day celebrations.</p>", category: "Holiday", priority: "Medium", channel: "Email", audience_roles: ["student", "faculty"], target_departments: ["all"], status: "Scheduled", publish_date: "2026-08-14T08:00:00Z", expiry_date: "2026-08-16T23:59:59Z", created_by: "Admin" },
  { id: "ANC003", title: "Placement Drive - Google India", subject: "SDE Recruitment Drive 2026", content: "<p>SDE recruitment drive registrations are open for final year CSE/ECE candidates.</p>", category: "Placement", priority: "High", channel: "WhatsApp", audience_roles: ["student"], target_departments: ["CSE", "ECE"], status: "Published", publish_date: "2026-07-15T11:00:00Z", expiry_date: "2026-08-01T23:59:59Z", created_by: "Placement Officer" }
];

const fallbackTemplates = [
  { id: "TMP001", title: "Holiday Announcement Notice", subject: "Holiday Notice: [Holiday Name]", content_template: "Dear Faculty and Students,\n\nThe college will remain closed on [Date] on account of [Holiday Name]. Normal classes will resume on [Resume Date].\n\nRegards,\nPrincipal Office", category: "Holiday" },
  { id: "TMP002", title: "Fee Reminder circular", subject: "Urgent: Fee Payment Reminder - [Semester]", content_template: "Dear Students,\n\nThis is a friendly reminder that the tuition fee due date for [Semester] semester is [Due Date]. Please clear outstanding balances to avoid registration holds.\n\nRegards,\nAccounts Desk", category: "Fee Reminder" },
  { id: "TMP003", title: "Exam Schedule Release", subject: "Exam Schedule: [Semester] End Semesters", content_template: "Dear Students,\n\nThe timetables for [Semester] final examinations have been published. Please review details on the exam block board.\n\nRegards,\nExam Cell", category: "Exam" }
];

const fallbackLogs = [
  { id: "LOG001", announcement_id: "ANC001", title: "Upcoming Odd Semester Exams", channel: "Portal", sent_by: "Admin Office", sent_time: "2026-07-10T09:05:00Z", recipients_count: 850, delivered_count: 850, failed_count: 0, status: "Success" },
  { id: "LOG002", announcement_id: "ANC003", title: "Placement Drive - Google India", channel: "WhatsApp", sent_by: "Placement Office", sent_time: "2026-07-15T11:12:00Z", recipients_count: 240, delivered_count: 232, failed_count: 8, status: "Success" }
];

const fallbackQueue = [
  { id: "DLQ001", announcement_id: "ANC002", channel: "Email", recipient: "student@college.com", status: "Pending", error_message: null, retry_count: 0 },
  { id: "DLQ002", announcement_id: "ANC002", channel: "Email", recipient: "faculty@college.com", status: "Pending", error_message: null, retry_count: 0 }
];

const fallbackReads = [
  { id: "RED001", announcement_id: "ANC001", user_id: "44444444-4444-4444-4444-444444444444", read_at: "2026-07-10T10:15:00Z", device: "Mobile (iOS)", ip_address: "192.168.1.12" },
  { id: "RED002", announcement_id: "ANC001", user_id: "33333333-3333-3333-3333-333333333333", read_at: "2026-07-10T12:30:00Z", device: "Desktop (Chrome)", ip_address: "10.0.2.15" }
];

const fallbackGateways = [
  { id: "GTW001", channel: "Email", config_json: { smtp: "smtp.college.edu", port: 587, auth: true }, is_active: true, success_rate: 99.2, failure_rate: 0.8, last_sync: "2026-07-18T09:00:00Z" },
  { id: "GTW002", channel: "SMS", config_json: { gateway: "Twilio", sid: "ACxxxxxxxxxxxx" }, is_active: true, success_rate: 95.8, failure_rate: 4.2, last_sync: "2026-07-18T09:12:00Z" },
  { id: "GTW003", channel: "WhatsApp", config_json: { provider: "Meta API", id: "1055243128" }, is_active: true, success_rate: 97.5, failure_rate: 2.5, last_sync: "2026-07-18T09:15:00Z" },
  { id: "GTW004", channel: "Push", config_json: { provider: "FCM Firebase", appId: "1:8542:web" }, is_active: false, success_rate: 0, failure_rate: 0, last_sync: null }
];

const fallbackPolls = [
  { id: "POL001", question: "Should the college extend Library hours during final exams to 10:00 PM?", deadline: "2026-07-28T18:00:00Z", status: "Active", options: ["Yes, absolutely", "No, existing timings are sufficient", "Maybe, only on weekends"], votes: [{ option: "Yes, absolutely", count: 184 }, { option: "No, existing timings are sufficient", count: 22 }, { option: "Maybe, only on weekends", count: 48 }] }
];

const fallbackSurveys = [
  { id: "SRV001", title: "Canteen Food Quality Survey 2026", description: "Collect student feedback regarding food quality, hygiene standards, and item pricing.", deadline: "2026-08-15T23:59:59Z", status: "Active", is_anonymous: true, is_mandatory: false, questionsCount: 4, responsesCount: 156 }
];

// Helper to push communication audit logs dynamically
const logCommAction = async (userId, action, entity, entityId, oldValue, newValue, req) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    await supabase.from('communication_audit_logs').insert([{
      user_id: userId || 'mock-user-id',
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null
    }]);
  } catch (err) {
    console.error('Comm audit log failed:', err);
  }
};

export const getCommunicationDashboard = async (req, res, next) => {
  try {
    const [ancRes, logsRes, queueRes, readsRes, surveysRes, pollsRes] = await Promise.all([
      supabase.from('communication_announcements').select('*'),
      supabase.from('communication_logs').select('*'),
      supabase.from('delivery_queue').select('*'),
      supabase.from('announcement_reads').select('*'),
      supabase.from('surveys').select('*'),
      supabase.from('polls').select('*')
    ]);

    const hasDBError = ancRes.error || logsRes.error;

    let announcements = fallbackAnnouncements;
    let logs = fallbackLogs;
    let queue = fallbackQueue;
    let reads = fallbackReads;
    let surveys = fallbackSurveys;
    let polls = fallbackPolls;

    if (!hasDBError) {
      if (ancRes.data && ancRes.data.length > 0) announcements = ancRes.data;
      if (logsRes.data && logsRes.data.length > 0) logs = logsRes.data;
      if (queueRes.data && queueRes.data.length > 0) queue = queueRes.data;
      if (readsRes.data && readsRes.data.length > 0) reads = readsRes.data;
      if (surveysRes.data && surveysRes.data.length > 0) surveys = surveysRes.data;
      if (pollsRes.data && pollsRes.data.length > 0) polls = pollsRes.data;
    }

    const totalAnnouncements = announcements.length;
    const activeAnnouncements = announcements.filter(a => a.status === 'Published').length;
    const draftsCount = announcements.filter(a => a.status === 'Draft').length;
    const scheduledCount = announcements.filter(a => a.status === 'Scheduled').length;
    const archivedCount = announcements.filter(a => a.status === 'Archived').length;

    const emailSent = logs.filter(l => l.channel === 'Email').reduce((acc, curr) => acc + curr.recipients_count, 0);
    const smsSent = logs.filter(l => l.channel === 'SMS').reduce((acc, curr) => acc + curr.recipients_count, 0);
    const whatsappSent = logs.filter(l => l.channel === 'WhatsApp').reduce((acc, curr) => acc + curr.recipients_count, 0);
    const pushSent = logs.filter(l => l.channel === 'Push').reduce((acc, curr) => acc + curr.recipients_count, 0);

    const totalRecipients = logs.reduce((acc, curr) => acc + curr.recipients_count, 0);
    const totalDelivered = logs.reduce((acc, curr) => acc + curr.delivered_count, 0);
    const totalFailed = logs.reduce((acc, curr) => acc + curr.failed_count, 0);

    const successRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 98;
    const readRate = totalDelivered > 0 ? Math.round((reads.length / totalDelivered) * 100) : 45;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalAnnouncements,
          activeAnnouncements,
          draftsCount,
          scheduledCount,
          archivedCount,
          emailSent,
          smsSent,
          whatsappSent,
          pushSent,
          failedCount: totalFailed,
          successRate,
          readRate,
          activeSurveys: surveys.filter(s => s.status === 'Active').length,
          activePolls: polls.filter(p => p.status === 'Active').length,
          pendingApprovals: announcements.filter(a => a.status === 'Awaiting_Approval').length
        },
        announcements,
        logs,
        queue,
        reads,
        surveys,
        polls,
        gateways: fallbackGateways
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let query = supabase.from('communication_announcements').select('*');

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = fallbackAnnouncements;
      if (status) filtered = filtered.filter(a => a.status.toLowerCase() === status.toLowerCase());
      if (category) filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
      return res.status(200).json({ success: true, data: filtered });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, subject, content, category, priority, channel, audienceRoles, targetDepartments, status, publishDate, expiryDate } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ success: false, message: "Announcement Title, Subject, and Content are required." });
    }

    const { data, error } = await supabase.from('communication_announcements').insert([{
      title,
      subject,
      content,
      category: category || 'Academic',
      priority: priority || 'Medium',
      channel: channel || 'Portal',
      audience_roles: JSON.stringify(audienceRoles || ['student']),
      target_departments: JSON.stringify(targetDepartments || ['all']),
      status: status || 'Draft',
      publish_date: publishDate || new Date().toISOString(),
      expiry_date: expiryDate || null,
      created_by: req.user?.name || 'Admin Desk'
    }]).select().single();

    if (error) throw error;

    await logCommAction(req.user?.id, "Created Announcement", "communication_announcements", data.id, null, data, req);

    // Seed delivery queue items
    await supabase.from('delivery_queue').insert([{
      announcement_id: data.id,
      channel: data.channel,
      recipient: "student@college.com",
      status: data.status === 'Published' ? 'Delivered' : 'Pending',
      retry_count: 0
    }]);

    res.status(201).json({ success: true, message: "Announcement saved successfully.", data });
  } catch (err) {
    next(err);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const { data: exists } = await supabase.from('communication_announcements').select('*').eq('id', id).maybeSingle();

    const { data, error } = await supabase.from('communication_announcements').update({
      title: body.title,
      subject: body.subject,
      content: body.content,
      category: body.category,
      priority: body.priority,
      channel: body.channel,
      audience_roles: body.audienceRoles ? JSON.stringify(body.audienceRoles) : undefined,
      target_departments: body.targetDepartments ? JSON.stringify(body.targetDepartments) : undefined,
      status: body.status,
      publish_date: body.publishDate,
      expiry_date: body.expiryDate
    }).eq('id', id).select().single();

    if (error) throw error;

    await logCommAction(req.user?.id, "Updated Announcement", "communication_announcements", id, exists, data, req);

    res.status(200).json({ success: true, message: "Announcement updated successfully.", data });
  } catch (err) {
    next(err);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idx = fallbackAnnouncements.findIndex(a => a.id === id);
    if (idx !== -1) {
      fallbackAnnouncements.splice(idx, 1);
      return res.status(200).json({ success: true, message: "Announcement deleted from fallback." });
    }

    const { error } = await supabase.from('communication_announcements').delete().eq('id', id);
    if (error) throw error;

    await logCommAction(req.user?.id, "Deleted Announcement", "communication_announcements", id, null, null, req);

    res.status(200).json({ success: true, message: "Announcement deleted successfully." });
  } catch (err) {
    next(err);
  }
};

export const getTemplates = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('announcement_templates').select('*');
    if (error || !data || data.length === 0) {
      return res.status(200).json({ success: true, data: fallbackTemplates });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const { title, subject, contentTemplate, category } = req.body;

    const { data, error } = await supabase.from('announcement_templates').insert([{
      title,
      subject,
      content_template: contentTemplate,
      category
    }]).select().single();

    if (error) throw error;

    res.status(201).json({ success: true, message: "Template created.", data });
  } catch (err) {
    next(err);
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('surveys').select('*');
    if (error || !data || data.length === 0) {
      return res.status(200).json({ success: true, data: fallbackSurveys });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createSurvey = async (req, res, next) => {
  try {
    const { title, description, deadline, isAnonymous, isMandatory, questions } = req.body;

    const { data, error } = await supabase.from('surveys').insert([{
      title,
      description,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_anonymous: isAnonymous || false,
      is_mandatory: isMandatory || false,
      status: "Active",
      created_by: req.user?.id || 'mock-user-id'
    }]).select().single();

    if (error) throw error;

    // Seed questions
    if (questions && questions.length > 0) {
      const qRows = questions.map((q, idx) => ({
        survey_id: data.id,
        question_text: q.text,
        question_type: q.type || 'Text',
        sequence_order: idx
      }));
      await supabase.from('survey_questions').insert(qRows);
    }

    res.status(201).json({ success: true, message: "Survey builder published.", data });
  } catch (err) {
    next(err);
  }
};

export const getPolls = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('polls').select('*');
    if (error || !data || data.length === 0) {
      return res.status(200).json({ success: true, data: fallbackPolls });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, deadline } = req.body;

    const { data, error } = await supabase.from('polls').insert([{
      question,
      deadline: deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
      created_by: req.user?.id || 'mock-user-id'
    }]).select().single();

    if (error) throw error;

    if (options && options.length > 0) {
      const optRows = options.map(o => ({
        poll_id: data.id,
        option_text: o
      }));
      await supabase.from('poll_options').insert(optRows);
    }

    res.status(201).json({ success: true, message: "Live poll published successfully.", data });
  } catch (err) {
    next(err);
  }
};

export const submitVote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { optionText } = req.body;

    // Log poll vote
    await supabase.from('poll_votes').insert([{
      poll_id: id,
      option_selected: optionText,
      user_id: req.user?.id || 'mock-user-id'
    }]);

    res.status(200).json({ success: true, message: "Your vote was cast successfully." });
  } catch (err) {
    next(err);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    const [logsData, queueData, readsData] = await Promise.all([
      supabase.from('communication_logs').select('*'),
      supabase.from('delivery_queue').select('*'),
      supabase.from('announcement_reads').select('*')
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs: logsData.data && logsData.data.length > 0 ? logsData.data : fallbackLogs,
        queue: queueData.data && queueData.data.length > 0 ? queueData.data : fallbackQueue,
        reads: readsData.data && readsData.data.length > 0 ? readsData.data : fallbackReads
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getGateways = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('gateway_settings').select('*');
    if (error || !data || data.length === 0) {
      return res.status(200).json({ success: true, data: fallbackGateways });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateGatewaySettings = async (req, res, next) => {
  try {
    const { channel } = req.params;
    const { configJson, isActive } = req.body;

    const { data, error } = await supabase.from('gateway_settings').update({
      config_json: JSON.stringify(configJson),
      is_active: isActive
    }).eq('channel', channel).select().single();

    if (error) throw error;

    res.status(200).json({ success: true, message: "Gateway updated successfully.", data });
  } catch (err) {
    next(err);
  }
};

export const submitCircularWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, status, remarks } = req.body;

    const { data: exists } = await supabase.from('communication_announcements').select('*').eq('id', id).maybeSingle();

    let targetStatus = 'Awaiting_Approval';
    if (status === 'Approved' && stage === 'Principal') {
      targetStatus = 'Published';
    } else if (status === 'Rejected') {
      targetStatus = 'Archived';
    }

    const { data, error } = await supabase.from('communication_announcements').update({
      status: targetStatus
    }).eq('id', id).select().single();

    if (error) throw error;

    await supabase.from('communication_workflow').insert([{
      announcement_id: id,
      stage,
      status,
      remarks,
      actor_id: req.user?.id || 'mock-user-id'
    }]);

    await logCommAction(req.user?.id, `Workflow Circular: ${stage} - ${status}`, "communication_announcements", id, exists, data, req);

    res.status(200).json({ success: true, message: `Circular workflow transitioned to ${stage}: ${status}`, data });
  } catch (err) {
    next(err);
  }
};
