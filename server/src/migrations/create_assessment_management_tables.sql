-- Migration: Create Assessment Management Module Tables
-- Supports 1:N relationship between Recruitment Drives (placement_drives) and Assessments
-- Supports 12-stage assessment lifecycle status flow

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id uuid REFERENCES placement_drives(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  company_name varchar(255),
  title varchar(255) NOT NULL,
  description text,
  assessment_type varchar(100) NOT NULL DEFAULT 'Aptitude', -- Aptitude, Technical, Coding, HR, Mixed
  duration_minutes integer NOT NULL DEFAULT 60,
  total_marks integer NOT NULL DEFAULT 100,
  passing_marks integer NOT NULL DEFAULT 40,
  scheduled_start timestamp with time zone,
  scheduled_end timestamp with time zone,
  venue_or_link varchar(255),
  instructions text,
  status varchar(50) NOT NULL DEFAULT 'Draft' CHECK (status IN (
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
  )),
  created_by_role varchar(50) DEFAULT 'recruiter', -- 'recruiter', 'placement_officer', 'admin'
  created_by_name varchar(255),
  rejection_reason text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessments_drive_id ON assessments(drive_id);
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Table for tracking detailed status transition audit history
CREATE TABLE IF NOT EXISTS assessment_status_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  from_status varchar(50),
  to_status varchar(50) NOT NULL,
  changed_by_role varchar(50),
  changed_by_name varchar(255),
  comments text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessment_logs_assessment_id ON assessment_status_logs(assessment_id);
