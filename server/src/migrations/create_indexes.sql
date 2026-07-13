-- Create performance indexes for key foreign keys to optimize query plans

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student);
CREATE INDEX IF NOT EXISTS idx_issued_books_student ON issued_books(student);
CREATE INDEX IF NOT EXISTS idx_issued_books_user_id ON issued_books(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
