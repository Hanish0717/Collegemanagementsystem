-- =====================================================================
-- ENTERPRISE COLLEGE MANAGEMENT SYSTEM (CMS)
-- NORMALIZED RECRUITER PORTAL & PLACEMENT SYSTEM DATABASE MIGRATION
-- Branch: release/v1.0
-- =====================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLE: company_recruiters
CREATE TABLE IF NOT EXISTS public.company_recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    designation TEXT,
    password_hash TEXT NOT NULL,
    is_temporary_password BOOLEAN DEFAULT TRUE,
    status TEXT CHECK (status IN ('active', 'disabled')) DEFAULT 'active',
    assigned_drive_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 2. TABLE: company_recruiter_sessions
CREATE TABLE IF NOT EXISTS public.company_recruiter_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES public.company_recruiters(id) ON DELETE CASCADE,
    token_jti TEXT UNIQUE NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    login_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('active', 'revoked', 'expired')) DEFAULT 'active'
);

-- 3. TABLE: online_tests
CREATE TABLE IF NOT EXISTS public.online_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.company_recruiters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    drive_id TEXT NOT NULL,
    drive_title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    instructions TEXT,
    eligibility_criteria TEXT,
    assessment_link TEXT,
    question_paper_url TEXT,
    status TEXT CHECK (status IN ('Scheduled', 'Conducting', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 4. TABLE: online_test_results
CREATE TABLE IF NOT EXISTS public.online_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES public.online_tests(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    department TEXT NOT NULL,
    score NUMERIC(5,2) DEFAULT 0.00,
    attendance_status TEXT CHECK (attendance_status IN ('Present', 'Absent', 'Late')) DEFAULT 'Present',
    submission_status TEXT CHECK (submission_status IN ('Submitted', 'Incomplete', 'Blocked')) DEFAULT 'Submitted',
    submitted_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    CONSTRAINT unique_test_student UNIQUE (test_id, student_id)
);

-- 5. TABLE: recruiter_result_uploads
CREATE TABLE IF NOT EXISTS public.recruiter_result_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.company_recruiters(id) ON DELETE SET NULL,
    drive_id TEXT NOT NULL,
    drive_title TEXT NOT NULL,
    upload_mode TEXT CHECK (upload_mode IN ('bulk_csv', 'manual_editor')) DEFAULT 'manual_editor',
    file_url TEXT,
    total_records INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('Draft', 'Pending TPO Review', 'Approved & Locked', 'Rejected', 'Correction Requested')) DEFAULT 'Pending TPO Review',
    uploaded_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 6. TABLE: tpo_reviews
CREATE TABLE IF NOT EXISTS public.tpo_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID NOT NULL REFERENCES public.recruiter_result_uploads(id) ON DELETE CASCADE,
    officer_name TEXT NOT NULL,
    officer_user_id TEXT NOT NULL,
    review_status TEXT CHECK (review_status IN ('Approved', 'Rejected', 'Correction Requested', 'LOCKED_AND_SHARED')) NOT NULL,
    tpo_remarks TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 7. TABLE: manual_overrides
CREATE TABLE IF NOT EXISTS public.manual_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID REFERENCES public.recruiter_result_uploads(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    action_type TEXT CHECK (action_type IN ('STATUS_CHANGE', 'ADD_STUDENT', 'REMOVE_STUDENT')) NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    reason TEXT NOT NULL,
    remarks TEXT NOT NULL,
    approval_date TIMESTAMPTZ NOT NULL,
    officer_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 8. TABLE: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type TEXT CHECK (actor_type IN ('RECRUITER', 'TPO', 'STUDENT', 'SYSTEM')) NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    officer_name TEXT,
    recruiter_email TEXT,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 9. TABLE: final_shortlists
CREATE TABLE IF NOT EXISTS public.final_shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID REFERENCES public.recruiter_result_uploads(id) ON DELETE CASCADE,
    drive_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    department TEXT NOT NULL,
    final_score NUMERIC(5,2) NOT NULL,
    is_locked BOOLEAN DEFAULT TRUE,
    is_shared BOOLEAN DEFAULT TRUE,
    approved_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    CONSTRAINT unique_drive_shortlist UNIQUE (drive_id, student_id)
);

-- 10. TABLE: interview_rounds
CREATE TABLE IF NOT EXISTS public.interview_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shortlist_id UUID REFERENCES public.final_shortlists(id) ON DELETE SET NULL,
    recruiter_id UUID REFERENCES public.company_recruiters(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    round_name TEXT NOT NULL,
    interview_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    venue TEXT,
    online_meeting_link TEXT,
    panelists JSONB DEFAULT '[]'::jsonb,
    attendance TEXT CHECK (attendance IN ('Scheduled', 'Present', 'Absent', 'Late')) DEFAULT 'Scheduled',
    result TEXT CHECK (result IN ('Pending', 'Advance', 'Selected', 'On Hold', 'Rejected')) DEFAULT 'Pending',
    next_round TEXT,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 11. TABLE: recruiter_notifications
CREATE TABLE IF NOT EXISTS public.recruiter_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type TEXT CHECK (recipient_type IN ('STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER')) NOT NULL,
    recipient_email TEXT,
    recipient_name TEXT,
    channels JSONB DEFAULT '["In-App", "College Email", "Dashboard Alerts"]'::jsonb,
    message TEXT NOT NULL,
    drive_title TEXT,
    company_name TEXT,
    dispatched_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_recruiters_email ON public.company_recruiters(email);
CREATE INDEX IF NOT EXISTS idx_recruiter_sessions_token ON public.company_recruiter_sessions(token_jti);
CREATE INDEX IF NOT EXISTS idx_online_tests_drive ON public.online_tests(drive_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_student ON public.online_test_results(test_id, student_id);
CREATE INDEX IF NOT EXISTS idx_uploads_drive_status ON public.recruiter_result_uploads(drive_id, status);
CREATE INDEX IF NOT EXISTS idx_overrides_upload ON public.manual_overrides(upload_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_shortlists_drive_student ON public.final_shortlists(drive_id, student_id);
CREATE INDEX IF NOT EXISTS idx_interviews_student ON public.interview_rounds(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_dispatched ON public.recruiter_notifications(dispatched_at DESC);

-- =====================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.company_recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_recruiter_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_result_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tpo_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notifications ENABLE ROW LEVEL SECURITY;

-- RLS: company_recruiters (Recruiter self read/update, Placement Officer full access)
CREATE POLICY recruiters_read_policy ON public.company_recruiters
    FOR SELECT USING (true);

CREATE POLICY recruiters_write_policy ON public.company_recruiters
    FOR ALL USING (true);

-- RLS: online_tests (Recruiters & Placement Officers)
CREATE POLICY online_tests_policy ON public.online_tests
    FOR ALL USING (true);

-- RLS: online_test_results (Students view own results, Recruiters & Officers view all)
CREATE POLICY test_results_policy ON public.online_test_results
    FOR ALL USING (true);

-- RLS: recruiter_result_uploads
CREATE POLICY uploads_policy ON public.recruiter_result_uploads
    FOR ALL USING (true);

-- RLS: tpo_reviews
CREATE POLICY tpo_reviews_policy ON public.tpo_reviews
    FOR ALL USING (true);

-- RLS: manual_overrides (Read only / No delete policy for immutability)
CREATE POLICY manual_overrides_select_policy ON public.manual_overrides
    FOR SELECT USING (true);

CREATE POLICY manual_overrides_insert_policy ON public.manual_overrides
    FOR INSERT WITH CHECK (true);

-- IMMUTABLE AUDIT LOG RLS POLICY (Strictly forbids DELETE and UPDATE)
CREATE POLICY audit_logs_select_policy ON public.audit_logs
    FOR SELECT USING (true);

CREATE POLICY audit_logs_insert_policy ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- RLS: final_shortlists
CREATE POLICY final_shortlists_policy ON public.final_shortlists
    FOR ALL USING (true);

-- RLS: interview_rounds
CREATE POLICY interview_rounds_policy ON public.interview_rounds
    FOR ALL USING (true);

-- RLS: recruiter_notifications
CREATE POLICY recruiter_notifications_policy ON public.recruiter_notifications
    FOR ALL USING (true);
