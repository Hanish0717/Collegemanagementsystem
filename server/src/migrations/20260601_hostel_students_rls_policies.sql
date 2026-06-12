-- Hostel Students/Residents RLS policies
-- Apply in Supabase SQL editor or via migration runner.
-- Assumes auth.uid() maps to public.users.id.

BEGIN;

ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hostels ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (idempotent migration behavior)
DROP POLICY IF EXISTS students_admin_all_access ON students;
DROP POLICY IF EXISTS students_warden_read_assigned ON students;
DROP POLICY IF EXISTS students_warden_insert ON students;
DROP POLICY IF EXISTS students_warden_update_assigned ON students;

DROP POLICY IF EXISTS hostel_allocations_admin_all_access ON hostel_allocations;
DROP POLICY IF EXISTS hostel_allocations_warden_read_assigned ON hostel_allocations;
DROP POLICY IF EXISTS hostel_allocations_warden_insert_assigned ON hostel_allocations;
DROP POLICY IF EXISTS hostel_allocations_warden_update_assigned ON hostel_allocations;

DROP POLICY IF EXISTS hostels_admin_all_access ON hostels;
DROP POLICY IF EXISTS hostels_warden_read_own ON hostels;

-- Admin / super-admin full access on students
CREATE POLICY students_admin_all_access
ON students
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super-admin')
      AND COALESCE(u.is_active, true) = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super-admin')
      AND COALESCE(u.is_active, true) = true
  )
);

-- Hostel warden can read students assigned to hostels they manage
CREATE POLICY students_warden_read_assigned
ON students
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM hostel_allocations ha
    JOIN hostels h ON h.id = ha.hostel_id
    JOIN users u ON u.id = auth.uid()
    WHERE ha.student_id = students.id
      AND h.warden = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
);

-- Hostel warden can create students (for resident onboarding)
CREATE POLICY students_warden_insert
ON students
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
);

-- Hostel warden can update students assigned to their hostels
CREATE POLICY students_warden_update_assigned
ON students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM hostel_allocations ha
    JOIN hostels h ON h.id = ha.hostel_id
    JOIN users u ON u.id = auth.uid()
    WHERE ha.student_id = students.id
      AND h.warden = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM hostel_allocations ha
    JOIN hostels h ON h.id = ha.hostel_id
    JOIN users u ON u.id = auth.uid()
    WHERE ha.student_id = students.id
      AND h.warden = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
);

-- Admin / super-admin full access on hostel allocations
CREATE POLICY hostel_allocations_admin_all_access
ON hostel_allocations
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super-admin')
      AND COALESCE(u.is_active, true) = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super-admin')
      AND COALESCE(u.is_active, true) = true
  )
);

-- Hostel warden can read allocations for their own hostels
CREATE POLICY hostel_allocations_warden_read_assigned
ON hostel_allocations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM hostels h
    JOIN users u ON u.id = auth.uid()
    WHERE h.id = hostel_allocations.hostel_id
      AND h.warden = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
);

-- Hostel warden can create allocations only in their own hostels
CREATE POLICY hostel_allocations_warden_insert_assigned
ON hostel_allocations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM hostels h
    JOIN users u ON u.id = auth.uid()
    WHERE h.id = hostel_allocations.hostel_id
      AND h.warden = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
);

-- Hostel warden can update allocations only in their own hostels
CREATE POLICY hostel_allocations_warden_update_assigned
ON hostel_allocations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM hostels h
    JOIN users u ON u.id = auth.uid()
    WHERE h.id = hostel_allocations.hostel_id
      AND h.warden = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM hostels h
    JOIN users u ON u.id = auth.uid()
    WHERE h.id = hostel_allocations.hostel_id
      AND h.warden = auth.uid()
      AND u.role = 'hostel-warden'
      AND COALESCE(u.is_active, true) = true
  )
);

-- Optional hostels table policies (for resident module joins)
CREATE POLICY hostels_admin_all_access
ON hostels
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super-admin')
      AND COALESCE(u.is_active, true) = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super-admin')
      AND COALESCE(u.is_active, true) = true
  )
);

CREATE POLICY hostels_warden_read_own
ON hostels
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND u.role = 'hostel-warden'
      AND hostels.warden = auth.uid()
      AND COALESCE(u.is_active, true) = true
  )
);

COMMIT;
