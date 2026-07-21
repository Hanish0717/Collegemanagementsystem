/**
 * Approval Workflow Service
 * 
 * Configurable, workflow-driven multi-stage approval engine supporting
 * active leave delegation, complete audit trail history, and automated notification triggers.
 */

import { supabase } from '../config/supabase.js';

export const WORKFLOW_CONFIGS = {
  LEAVE_REQUEST: {
    name: 'Leave Request Workflow',
    type: 'leave',
    stages: ['Faculty', 'HOD', 'Principal'],
  },
  EXAM_SCHEDULE: {
    name: 'Exam Schedule Workflow',
    type: 'exam_schedule',
    stages: ['Faculty', 'Exam Cell', 'Dean (Examinations)', 'Principal'],
  },
  RESEARCH_PROPOSAL: {
    name: 'Research Proposal Workflow',
    type: 'research_proposal',
    stages: ['Faculty', 'HOD', 'Dean (Research)', 'Principal'],
  },
  STUDENT_COMPLAINT: {
    name: 'Student Complaint Workflow',
    type: 'student_complaint',
    stages: ['Student', 'Faculty Advisor', 'HOD', 'Dean (Student Affairs)'],
  },
  PURCHASE_REQUEST: {
    name: 'Purchase Request Workflow',
    type: 'purchase_request',
    stages: ['Faculty', 'HOD', 'Accounts', 'Principal'],
  },
};

/**
 * Checks if a given approver profile has active leave delegation.
 */
export function resolveEffectiveApprover(approverProfile) {
  if (!approverProfile || !approverProfile.delegatedTo) return approverProfile;
  const del = approverProfile.delegatedTo;
  if (!del.userId || !del.startDate || !del.endDate) return approverProfile;

  const now = new Date();
  const start = new Date(del.startDate);
  const end = new Date(del.endDate);

  if (now >= start && now <= end) {
    return {
      ...approverProfile,
      isDelegated: true,
      delegatedFrom: approverProfile.full_name || approverProfile.name,
      id: del.userId,
      full_name: `${del.name} (Delegated from ${approverProfile.full_name || approverProfile.name})`,
    };
  }

  return approverProfile;
}

/**
 * Emits an admin notification for approval events.
 */
export async function emitApprovalNotification(title, message, role = 'admin') {
  try {
    await supabase.from('admin_notifications').insert([
      {
        type: 'APPROVAL_WORKFLOW',
        title,
        message,
        unread: true,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('Failed to emit workflow notification:', err.message);
  }
}

/**
 * Initializes a new approval workflow state for a request.
 */
export function initiateWorkflow(workflowType, requesterData = {}) {
  const config = WORKFLOW_CONFIGS[workflowType] || WORKFLOW_CONFIGS.LEAVE_REQUEST;
  const requestId = requesterData.requestId || `REQ-${Date.now()}`;
  
  const initialState = {
    requestId,
    workflowType: config.type,
    workflowName: config.name,
    stages: config.stages,
    currentStageIndex: 1, // Stage 0 is the requester
    currentApproverRole: config.stages[1],
    status: 'PENDING',
    history: [
      {
        requestId,
        requestType: config.type,
        stage: config.stages[0],
        action: 'INITIATED',
        timestamp: new Date().toISOString(),
        requestedBy: requesterData.name || requesterData.id || 'Requester',
        approvedBy: requesterData.name || requesterData.id || 'Requester',
        designation: requesterData.designation || 'Staff',
        status: 'PENDING',
        comments: requesterData.notes || 'Request submitted for approval',
      },
    ],
  };

  emitApprovalNotification(
    `New ${config.name} Initiated`,
    `Request ${requestId} submitted by ${requesterData.name || 'Requester'}. Awaiting ${config.stages[1]} approval.`
  );

  return initialState;
}

/**
 * Advances the workflow to the next approval stage or completes it.
 */
export function processWorkflowStep(workflowState, approverRole, action, approverInfo = {}) {
  const state = { ...workflowState };

  if (state.status === 'COMPLETED' || state.status === 'REJECTED') {
    throw new Error(`Workflow is already in terminal state: ${state.status}`);
  }

  const timestamp = new Date().toISOString();
  const effectiveName = approverInfo.name || approverRole;
  const effectiveDesignation = approverInfo.designation || approverRole;

  if (action === 'REJECT') {
    state.status = 'REJECTED';
    state.history.push({
      requestId: state.requestId,
      requestType: state.workflowType,
      stage: state.currentApproverRole,
      action: 'REJECTED',
      timestamp,
      requestedBy: state.history[0]?.requestedBy || 'Requester',
      approvedBy: effectiveName,
      designation: effectiveDesignation,
      status: 'REJECTED',
      comments: approverInfo.notes || 'Request rejected',
    });

    emitApprovalNotification(
      `${state.workflowName} Rejected`,
      `Request ${state.requestId} was rejected by ${effectiveName} (${effectiveDesignation}).`
    );

    return state;
  }

  if (action === 'RETURN') {
    state.status = 'RETURNED_FOR_CHANGES';
    state.history.push({
      requestId: state.requestId,
      requestType: state.workflowType,
      stage: state.currentApproverRole,
      action: 'RETURNED_FOR_CHANGES',
      timestamp,
      requestedBy: state.history[0]?.requestedBy || 'Requester',
      approvedBy: effectiveName,
      designation: effectiveDesignation,
      status: 'RETURNED_FOR_CHANGES',
      comments: approverInfo.notes || 'Returned for changes',
    });

    emitApprovalNotification(
      `${state.workflowName} Returned`,
      `Request ${state.requestId} returned for changes by ${effectiveName}.`
    );

    return state;
  }

  if (action === 'APPROVE') {
    state.history.push({
      requestId: state.requestId,
      requestType: state.workflowType,
      stage: state.currentApproverRole,
      action: 'APPROVED',
      timestamp,
      requestedBy: state.history[0]?.requestedBy || 'Requester',
      approvedBy: effectiveName,
      designation: effectiveDesignation,
      status: 'APPROVED',
      comments: approverInfo.notes || 'Approved',
    });

    if (state.currentStageIndex >= state.stages.length - 1) {
      state.status = 'COMPLETED';
      state.currentApproverRole = 'COMPLETED';

      emitApprovalNotification(
        `${state.workflowName} Fully Approved`,
        `Request ${state.requestId} has completed all approval stages successfully.`
      );
    } else {
      state.currentStageIndex += 1;
      state.currentApproverRole = state.stages[state.currentStageIndex];
      state.status = 'PENDING';

      emitApprovalNotification(
        `${state.workflowName} Advanced`,
        `Request ${state.requestId} approved by ${effectiveName}. Now pending ${state.currentApproverRole} approval.`
      );
    }

    return state;
  }

  throw new Error(`Invalid workflow action: ${action}`);
}

export default {
  WORKFLOW_CONFIGS,
  resolveEffectiveApprover,
  emitApprovalNotification,
  initiateWorkflow,
  processWorkflowStep,
};
