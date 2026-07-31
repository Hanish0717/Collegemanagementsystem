-- Migration: Create Assessment Management Foundation Tables
-- Hierarchy: Company -> Recruitment Drive (placement_drives) -> Assessment (assessments)

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id uuid REFERENCES placement_drives(id) ON DELETE CASCADE NOT NULL,
  recruiter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  assessment_name varchar(255) NOT NULL,
  description text,
  instructions text,
  passing_marks integer NOT NULL DEFAULT 40,
  total_marks integer NOT NULL DEFAULT 100,
  duration integer NOT NULL DEFAULT 60, -- in minutes
  current_status varchar(50) NOT NULL DEFAULT 'Draft' CHECK (current_status IN (
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
  created_by varchar(255),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_assessment_name_per_drive UNIQUE (drive_id, assessment_name)
);

CREATE INDEX IF NOT EXISTS idx_assessments_drive_id ON assessments(drive_id);
CREATE INDEX IF NOT EXISTS idx_assessments_recruiter_id ON assessments(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(current_status);

-- Table for tracking status change history
CREATE TABLE IF NOT EXISTS assessment_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  from_status varchar(50),
  to_status varchar(50) NOT NULL,
  changed_by varchar(255),
  comments text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessment_status_history_id ON assessment_status_history(assessment_id);

-- Table for tracking detailed event timeline
CREATE TABLE IF NOT EXISTS assessment_timeline (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  event_type varchar(100) NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  actor_name varchar(255),
  actor_role varchar(50),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessment_timeline_id ON assessment_timeline(assessment_id);
