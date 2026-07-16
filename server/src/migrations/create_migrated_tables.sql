-- 1. Create Placement Tables
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) UNIQUE NOT NULL,
  industry varchar(255),
  hr_name varchar(255),
  email varchar(255) UNIQUE,
  phone varchar(50),
  package_amount numeric(10, 2),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS placement_drives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  job_title varchar(255) NOT NULL,
  drive_date date NOT NULL,
  venue varchar(255) NOT NULL,
  deadline date NOT NULL,
  status varchar(50) DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
  rounds integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS selected_students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  drive_id uuid REFERENCES placement_drives(id) ON DELETE CASCADE,
  package_amount numeric(10, 2) NOT NULL,
  selection_date date NOT NULL DEFAULT current_date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS student_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  drive_id uuid REFERENCES placement_drives(id) ON DELETE CASCADE,
  status varchar(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'Rejected', 'Selected')),
  applied_date date NOT NULL DEFAULT current_date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS drive_rounds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id uuid REFERENCES placement_drives(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  round_name varchar(255) NOT NULL,
  round_date date,
  status varchar(50) DEFAULT 'Upcoming',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Hostel Tables
CREATE TABLE IF NOT EXISTS hostels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) UNIQUE NOT NULL,
  code varchar(50) UNIQUE NOT NULL,
  type varchar(50) CHECK (type IN ('Boys', 'Girls', 'Co-Ed')),
  warden uuid REFERENCES users(id) ON DELETE SET NULL,
  total_rooms integer NOT NULL,
  total_beds integer NOT NULL,
  monthly_fee numeric(10, 2) NOT NULL,
  facilities jsonb DEFAULT '[]'::jsonb,
  contact_number varchar(50),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS hostel_blocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  code varchar(50) NOT NULL,
  total_floors integer DEFAULT 3,
  total_rooms integer NOT NULL,
  total_beds integer NOT NULL,
  facilities jsonb DEFAULT '[]'::jsonb,
  block_warden varchar(255),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(hostel_id, code)
);

CREATE TABLE IF NOT EXISTS hostel_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  block_id uuid REFERENCES hostel_blocks(id) ON DELETE CASCADE,
  room_number varchar(50) NOT NULL,
  floor integer NOT NULL,
  type varchar(50) NOT NULL, -- AC, Non-AC, Suite
  capacity integer DEFAULT 4,
  occupants integer DEFAULT 0,
  amenities jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(block_id, room_number)
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  block_id uuid REFERENCES hostel_blocks(id) ON DELETE CASCADE,
  room_id uuid REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  bed_number integer NOT NULL,
  status varchar(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Vacated', 'Suspended')),
  academic_year varchar(50) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, academic_year)
);

CREATE TABLE IF NOT EXISTS hostel_fees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  fee_type varchar(100) DEFAULT 'Monthly Rent',
  month varchar(50) NOT NULL,
  year integer NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  paid_amount numeric(10, 2) DEFAULT 0.00,
  due_date date NOT NULL,
  payment_method varchar(100),
  receipt_number varchar(100) UNIQUE,
  status varchar(50) DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Partially-Paid')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE hostel_fees
  ADD COLUMN IF NOT EXISTS block_id uuid REFERENCES hostel_blocks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES hostel_rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fee_structure_id uuid,
  ADD COLUMN IF NOT EXISTS resident_category varchar(100),
  ADD COLUMN IF NOT EXISTS academic_year varchar(50),
  ADD COLUMN IF NOT EXISTS resident_name varchar(255),
  ADD COLUMN IF NOT EXISTS registration_number varchar(100),
  ADD COLUMN IF NOT EXISTS room_number varchar(50),
  ADD COLUMN IF NOT EXISTS room_type varchar(50),
  ADD COLUMN IF NOT EXISTS ac_type varchar(20),
  ADD COLUMN IF NOT EXISTS monthly_hostel_fee numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mess_fee numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS electricity_fee numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS maintenance_fee numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS security_deposit numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS late_fee numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_charges numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_fee numeric(10, 2),
  ADD COLUMN IF NOT EXISTS amount_paid numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_amount numeric(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status varchar(50) DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS transaction_id varchar(100),
  ADD COLUMN IF NOT EXISTS effective_from date,
  ADD COLUMN IF NOT EXISTS effective_to date;

ALTER TABLE hostel_fees DROP CONSTRAINT IF EXISTS hostel_fees_status_check;
ALTER TABLE hostel_fees ADD CONSTRAINT hostel_fees_status_check CHECK (
  status IN (
    'Paid',
    'Unpaid',
    'Partially-Paid',
    'Paid',
    'Pending',
    'Partially Paid',
    'Overdue',
    'pending',
    'partial',
    'overdue'
  )
);

CREATE INDEX IF NOT EXISTS idx_hostel_fees_block_year_status ON hostel_fees (block_id, academic_year, status);
CREATE INDEX IF NOT EXISTS idx_hostel_fees_room_resident ON hostel_fees (room_number, registration_number);
CREATE INDEX IF NOT EXISTS idx_hostel_fees_due_date ON hostel_fees (due_date);

CREATE TABLE IF NOT EXISTS fee_structures (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_structure_code varchar(100) UNIQUE NOT NULL,
  hostel_block_id uuid REFERENCES hostel_blocks(id) ON DELETE CASCADE,
  academic_year varchar(50) NOT NULL,
  fee_category varchar(100) NOT NULL,
  room_type varchar(50) NOT NULL,
  ac_type varchar(20) NOT NULL CHECK (ac_type IN ('AC', 'Non-AC')),
  resident_category varchar(100) NOT NULL,
  monthly_hostel_fee numeric(10, 2) NOT NULL DEFAULT 0,
  mess_fee numeric(10, 2) NOT NULL DEFAULT 0,
  electricity_fee numeric(10, 2) NOT NULL DEFAULT 0,
  maintenance_fee numeric(10, 2) NOT NULL DEFAULT 0,
  security_deposit numeric(10, 2) NOT NULL DEFAULT 0,
  late_fee numeric(10, 2) NOT NULL DEFAULT 0,
  other_charges numeric(10, 2) NOT NULL DEFAULT 0,
  total_fee numeric(10, 2) NOT NULL DEFAULT 0,
  effective_from date NOT NULL,
  effective_to date,
  status varchar(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(hostel_block_id, academic_year, fee_category, room_type, ac_type, resident_category, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_fee_structures_lookup ON fee_structures (hostel_block_id, academic_year, room_type, ac_type, resident_category, status);

CREATE TABLE IF NOT EXISTS hostel_fee_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_id uuid REFERENCES hostel_fees(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  hostel_block_id uuid REFERENCES hostel_blocks(id) ON DELETE SET NULL,
  room_id uuid REFERENCES hostel_rooms(id) ON DELETE SET NULL,
  resident_name varchar(255) NOT NULL,
  registration_number varchar(100),
  room_number varchar(50),
  total_fee numeric(10, 2) NOT NULL DEFAULT 0,
  amount_paid numeric(10, 2) NOT NULL DEFAULT 0,
  pending_amount numeric(10, 2) NOT NULL DEFAULT 0,
  payment_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  payment_method varchar(100),
  transaction_id varchar(100) UNIQUE,
  receipt_number varchar(100) UNIQUE,
  payment_status varchar(50) NOT NULL DEFAULT 'Pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hostel_fee_payments_fee ON hostel_fee_payments (fee_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_hostel_fee_payments_status ON hostel_fee_payments (payment_status, payment_date);

CREATE TABLE IF NOT EXISTS hostel_fee_receipts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_id uuid REFERENCES hostel_fees(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES hostel_fee_payments(id) ON DELETE CASCADE,
  receipt_number varchar(100) UNIQUE NOT NULL,
  college_name varchar(255) NOT NULL DEFAULT 'College Management System',
  hostel_name varchar(255),
  resident_name varchar(255) NOT NULL,
  registration_number varchar(100),
  hostel_block varchar(255),
  room_number varchar(50),
  fee_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_information jsonb NOT NULL DEFAULT '{}'::jsonb,
  qr_code_url text,
  generated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fee_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_id uuid REFERENCES hostel_fees(id) ON DELETE CASCADE,
  notification_type varchar(100) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  priority varchar(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  unread boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION calculate_fee_structure_total()
RETURNS trigger AS $$
BEGIN
  NEW.total_fee := COALESCE(NEW.monthly_hostel_fee, 0)
    + COALESCE(NEW.mess_fee, 0)
    + COALESCE(NEW.electricity_fee, 0)
    + COALESCE(NEW.maintenance_fee, 0)
    + COALESCE(NEW.other_charges, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fee_structure_total ON fee_structures;
CREATE TRIGGER trg_fee_structure_total
BEFORE INSERT OR UPDATE ON fee_structures
FOR EACH ROW EXECUTE FUNCTION calculate_fee_structure_total();

CREATE OR REPLACE FUNCTION sync_hostel_fee_snapshot()
RETURNS trigger AS $$
DECLARE
  structure_record fee_structures%ROWTYPE;
  effective_total numeric(10, 2);
  effective_paid numeric(10, 2);
  effective_pending numeric(10, 2);
BEGIN
  IF NEW.fee_structure_id IS NOT NULL THEN
    SELECT * INTO structure_record
    FROM fee_structures
    WHERE id = NEW.fee_structure_id
    LIMIT 1;

    IF FOUND THEN
      NEW.block_id := COALESCE(NEW.block_id, structure_record.hostel_block_id);
      NEW.academic_year := COALESCE(NEW.academic_year, structure_record.academic_year);
      NEW.fee_type := COALESCE(NEW.fee_type, structure_record.fee_category);
      NEW.room_type := COALESCE(NEW.room_type, structure_record.room_type);
      NEW.ac_type := COALESCE(NEW.ac_type, structure_record.ac_type);
      NEW.resident_category := COALESCE(NEW.resident_category, structure_record.resident_category);
      NEW.monthly_hostel_fee := COALESCE(NEW.monthly_hostel_fee, structure_record.monthly_hostel_fee);
      NEW.mess_fee := COALESCE(NEW.mess_fee, structure_record.mess_fee);
      NEW.electricity_fee := COALESCE(NEW.electricity_fee, structure_record.electricity_fee);
      NEW.maintenance_fee := COALESCE(NEW.maintenance_fee, structure_record.maintenance_fee);
      NEW.security_deposit := COALESCE(NEW.security_deposit, structure_record.security_deposit);
      NEW.late_fee := COALESCE(NEW.late_fee, structure_record.late_fee);
      NEW.other_charges := COALESCE(NEW.other_charges, structure_record.other_charges);
      NEW.total_fee := COALESCE(NEW.total_fee, structure_record.total_fee);
      NEW.effective_from := COALESCE(NEW.effective_from, structure_record.effective_from);
      NEW.effective_to := COALESCE(NEW.effective_to, structure_record.effective_to);
    END IF;
  END IF;

  effective_total := COALESCE(NEW.total_fee, NEW.total_amount, 0);
  effective_paid := COALESCE(NEW.amount_paid, NEW.paid_amount, 0);
  effective_pending := GREATEST(effective_total - effective_paid, 0);

  NEW.total_amount := effective_total;
  NEW.total_fee := effective_total;
  NEW.amount_paid := effective_paid;
  NEW.paid_amount := effective_paid;
  NEW.pending_amount := effective_pending;

  IF effective_paid <= 0 THEN
    NEW.payment_status := 'Pending';
    NEW.status := 'Pending';
  ELSIF effective_pending <= 0 THEN
    NEW.payment_status := 'Paid';
    NEW.status := 'Paid';
    IF NEW.payment_date IS NULL THEN
      NEW.payment_date := timezone('utc'::text, now());
    END IF;
  ELSIF NEW.due_date < current_date THEN
    NEW.payment_status := 'Overdue';
    NEW.status := 'Overdue';
  ELSE
    NEW.payment_status := 'Partially Paid';
    NEW.status := 'Partially-Paid';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hostel_fee_snapshot ON hostel_fees;
CREATE TRIGGER trg_hostel_fee_snapshot
BEFORE INSERT OR UPDATE ON hostel_fees
FOR EACH ROW EXECUTE FUNCTION sync_hostel_fee_snapshot();

CREATE OR REPLACE FUNCTION sync_fee_payment_artifacts()
RETURNS trigger AS $$
DECLARE
  generated_payment_id uuid;
  block_name text;
BEGIN
  IF TG_OP = 'INSERT' OR COALESCE(NEW.amount_paid, 0) <> COALESCE(OLD.amount_paid, 0) THEN
    SELECT name INTO block_name
    FROM hostel_blocks
    WHERE id = NEW.block_id
    LIMIT 1;

    INSERT INTO hostel_fee_payments (
      fee_id,
      student_id,
      hostel_block_id,
      room_id,
      resident_name,
      registration_number,
      room_number,
      total_fee,
      amount_paid,
      pending_amount,
      payment_date,
      payment_method,
      transaction_id,
      receipt_number,
      payment_status
    ) VALUES (
      NEW.id,
      NEW.student_id,
      NEW.block_id,
      NEW.room_id,
      COALESCE(NEW.resident_name, 'Unknown'),
      NEW.registration_number,
      NEW.room_number,
      COALESCE(NEW.total_fee, NEW.total_amount, 0),
      COALESCE(NEW.amount_paid, NEW.paid_amount, 0),
      COALESCE(NEW.pending_amount, 0),
      COALESCE(NEW.payment_date, timezone('utc'::text, now())),
      NEW.payment_method,
      NEW.transaction_id,
      NEW.receipt_number,
      COALESCE(NEW.payment_status, NEW.status, 'Pending')
    )
    ON CONFLICT (transaction_id) DO UPDATE
    SET amount_paid = EXCLUDED.amount_paid,
        pending_amount = EXCLUDED.pending_amount,
        payment_date = EXCLUDED.payment_date,
        payment_method = EXCLUDED.payment_method,
        receipt_number = EXCLUDED.receipt_number,
        payment_status = EXCLUDED.payment_status
    RETURNING id INTO generated_payment_id;

    IF NEW.receipt_number IS NOT NULL THEN
      INSERT INTO hostel_fee_receipts (
        fee_id,
        payment_id,
        receipt_number,
        college_name,
        hostel_name,
        resident_name,
        registration_number,
        hostel_block,
        room_number,
        fee_breakdown,
        payment_information,
        generated_at
      ) VALUES (
        NEW.id,
        generated_payment_id,
        NEW.receipt_number,
        'College Management System',
        NULL,
        COALESCE(NEW.resident_name, 'Unknown'),
        NEW.registration_number,
        COALESCE(block_name, NEW.block_id::text),
        NEW.room_number,
        jsonb_build_object(
          'monthlyHostelFee', COALESCE(NEW.monthly_hostel_fee, 0),
          'messFee', COALESCE(NEW.mess_fee, 0),
          'electricityFee', COALESCE(NEW.electricity_fee, 0),
          'maintenanceFee', COALESCE(NEW.maintenance_fee, 0),
          'securityDeposit', COALESCE(NEW.security_deposit, 0),
          'lateFee', COALESCE(NEW.late_fee, 0),
          'otherCharges', COALESCE(NEW.other_charges, 0),
          'totalFee', COALESCE(NEW.total_fee, NEW.total_amount, 0)
        ),
        jsonb_build_object(
          'amountPaid', COALESCE(NEW.amount_paid, NEW.paid_amount, 0),
          'pendingAmount', COALESCE(NEW.pending_amount, 0),
          'paymentMethod', NEW.payment_method,
          'transactionId', NEW.transaction_id,
          'paymentStatus', COALESCE(NEW.payment_status, NEW.status, 'Pending')
        ),
        COALESCE(NEW.payment_date, timezone('utc'::text, now()))
      )
      ON CONFLICT (receipt_number) DO UPDATE
      SET payment_id = EXCLUDED.payment_id,
          fee_breakdown = EXCLUDED.fee_breakdown,
          payment_information = EXCLUDED.payment_information,
          generated_at = EXCLUDED.generated_at;
    END IF;

    INSERT INTO fee_notifications (
      fee_id,
      notification_type,
      title,
      message,
      priority,
      unread
    ) VALUES (
      NEW.id,
      CASE
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Paid' THEN 'Payment Received'
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Partially Paid' THEN 'Partial Payment'
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Overdue' THEN 'Overdue Fee'
        ELSE 'Fee Update'
      END,
      CASE
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Paid' THEN 'Fee payment received'
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Partially Paid' THEN 'Partial fee payment received'
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Overdue' THEN 'Fee overdue'
        ELSE 'Fee record updated'
      END,
      CASE
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Paid' THEN 'Resident fee has been collected successfully.'
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Partially Paid' THEN 'Resident fee has been partially paid.'
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Overdue' THEN 'Resident fee is overdue and needs attention.'
        ELSE 'Resident fee details were updated.'
      END,
      CASE
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Overdue' THEN 'High'
        WHEN COALESCE(NEW.payment_status, NEW.status) = 'Paid' THEN 'Medium'
        ELSE 'Low'
      END,
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hostel_fee_artifacts ON hostel_fees;
CREATE TRIGGER trg_hostel_fee_artifacts
AFTER INSERT OR UPDATE ON hostel_fees
FOR EACH ROW EXECUTE FUNCTION sync_fee_payment_artifacts();

CREATE OR REPLACE FUNCTION notify_fee_structure_updates()
RETURNS trigger AS $$
BEGIN
  INSERT INTO fee_notifications (
    fee_id,
    notification_type,
    title,
    message,
    priority,
    unread
  ) VALUES (
    NULL,
    'Fee Structure Updated',
    CASE WHEN TG_OP = 'INSERT' THEN 'Fee structure created' ELSE 'Fee structure updated' END,
    CASE WHEN TG_OP = 'INSERT' THEN 'A new fee structure is now active.' ELSE 'Existing fee structure values were updated.' END,
    'Medium',
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fee_structure_notifications ON fee_structures;
CREATE TRIGGER trg_fee_structure_notifications
AFTER INSERT OR UPDATE ON fee_structures
FOR EACH ROW EXECUTE FUNCTION notify_fee_structure_updates();

CREATE OR REPLACE VIEW resident_fees AS
SELECT * FROM hostel_fees;

CREATE TABLE IF NOT EXISTS hostel_complaints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  room_id uuid REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  category varchar(100) NOT NULL,
  priority varchar(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  status varchar(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In-Progress', 'Resolved')),
  assigned_to varchar(255),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS hostel_visitors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  room_id uuid REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  visitor_name varchar(255) NOT NULL,
  visitor_phone varchar(50) NOT NULL,
  relationship varchar(100),
  purpose text,
  id_type varchar(100),
  id_number varchar(100),
  check_in_time timestamp with time zone NOT NULL,
  check_out_time timestamp with time zone,
  status varchar(50) DEFAULT 'In' CHECK (status IN ('In', 'Out')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS hostel_attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES hostels(id) ON DELETE CASCADE,
  room_id uuid REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  status varchar(50) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'On Leave')),
  remarks text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, attendance_date)
);

-- 3. Create Transport Tables
CREATE TABLE IF NOT EXISTS buses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_number varchar(50) UNIQUE NOT NULL,
  type varchar(100),
  make varchar(100),
  model varchar(100),
  year integer,
  capacity integer NOT NULL,
  fuel_type varchar(50),
  status varchar(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Idle', 'Maintenance', 'Inactive')),
  gps_device_number varchar(100),
  insurance_expiry date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name varchar(255) NOT NULL,
  phone varchar(50) NOT NULL,
  license_number varchar(100) UNIQUE NOT NULL,
  license_expiry date NOT NULL,
  experience_years integer DEFAULT 0,
  assigned_bus_id uuid REFERENCES buses(id) ON DELETE SET NULL,
  status varchar(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'On Leave')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) UNIQUE NOT NULL,
  monthly_fare numeric(10, 2) NOT NULL,
  landmark varchar(255),
  latitude varchar(50),
  longitude varchar(50),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) UNIQUE NOT NULL,
  route_number varchar(50) UNIQUE NOT NULL,
  start_point varchar(255) NOT NULL,
  end_point varchar(255) NOT NULL,
  distance numeric(6, 2),
  estimated_time varchar(50),
  bus_id uuid REFERENCES buses(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  status varchar(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  stops jsonb DEFAULT '[]'::jsonb, -- array of Stop references + ordering/times
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS transport_allocations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  pickup_stop_id uuid REFERENCES stops(id) ON DELETE SET NULL,
  drop_stop_id uuid REFERENCES stops(id) ON DELETE SET NULL,
  academic_year varchar(50) NOT NULL,
  monthly_fare numeric(10, 2) NOT NULL,
  pass_number varchar(100) UNIQUE,
  status varchar(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Cancelled', 'Suspended')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, academic_year)
);

CREATE TABLE IF NOT EXISTS vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  maintenance_type varchar(100) NOT NULL,
  description text,
  cost numeric(10, 2) NOT NULL,
  odometer_reading integer,
  status varchar(50) DEFAULT 'Completed' CHECK (status IN ('Scheduled', 'In-Progress', 'Completed')),
  start_date date NOT NULL,
  end_date date,
  mechanic_details text,
  recorded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS transport_fees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  allocation_id uuid REFERENCES transport_allocations(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  academic_year varchar(50) NOT NULL,
  month varchar(50) NOT NULL,
  year integer NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  paid_amount numeric(10, 2) DEFAULT 0.00,
  due_date date NOT NULL,
  payment_method varchar(100),
  receipt_number varchar(100) UNIQUE,
  status varchar(50) DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Partially-Paid')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Alumni Management Tables
CREATE TABLE IF NOT EXISTS alumni_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  full_name varchar(255) NOT NULL,
  roll_number varchar(100) UNIQUE,
  student_id varchar(100) UNIQUE,
  email varchar(255) UNIQUE NOT NULL,
  phone varchar(50),
  photo text,
  department varchar(100) NOT NULL,
  graduation_year integer NOT NULL,
  current_company varchar(255),
  designation varchar(255),
  higher_studies text,
  location varchar(255),
  country varchar(100),
  linkedin varchar(255),
  portfolio varchar(255),
  skills jsonb DEFAULT '[]'::jsonb,
  achievements text,
  biography text,
  resume_url text,
  status varchar(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  profile_completion integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_employment (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  company_name varchar(255) NOT NULL,
  designation varchar(255) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_education (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  institution varchar(255) NOT NULL,
  degree varchar(255) NOT NULL,
  field_of_study varchar(255),
  start_year integer,
  end_year integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  description text,
  category varchar(100) NOT NULL CHECK (category IN ('Reunion', 'Seminar', 'Workshop', 'Networking', 'Webinar', 'Guest Lecture')),
  date date NOT NULL,
  time varchar(50),
  venue varchar(255) NOT NULL,
  organizer varchar(255),
  image_url text,
  capacity integer,
  status varchar(50) DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Cancelled')),
  feedback_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_event_registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES alumni_events(id) ON DELETE CASCADE,
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  registered_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  attended boolean DEFAULT false,
  feedback text,
  rating integer,
  UNIQUE(event_id, alumni_id)
);

CREATE TABLE IF NOT EXISTS alumni_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  company varchar(255) NOT NULL,
  location varchar(255),
  job_type varchar(100) NOT NULL CHECK (job_type IN ('Full-time', 'Part-time', 'Internship', 'Contract')),
  description text NOT NULL,
  requirements text,
  eligibility varchar(255),
  deadline date,
  posted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_job_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid REFERENCES alumni_jobs(id) ON DELETE CASCADE,
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  applied_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status varchar(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'Rejected', 'Selected')),
  resume_url text,
  UNIQUE(job_id, alumni_id)
);

CREATE TABLE IF NOT EXISTS alumni_mentorship_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  request_reason text,
  status varchar(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
  session_schedule timestamp with time zone,
  feedback text,
  rating integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_donations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  cause varchar(255) NOT NULL,
  payment_status varchar(50) DEFAULT 'Completed' CHECK (payment_status IN ('Pending', 'Completed', 'Failed')),
  transaction_id varchar(100),
  date date NOT NULL,
  receipt_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_success_stories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  category varchar(100) NOT NULL CHECK (category IN ('Entrepreneurship', 'Research', 'Government Jobs', 'Startups', 'Featured Alumni', 'Corporate Career')),
  likes_count integer DEFAULT 0,
  published_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_communication_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type varchar(50) NOT NULL CHECK (type IN ('Email', 'SMS', 'WhatsApp')),
  recipient varchar(255) NOT NULL,
  subject varchar(255),
  message text NOT NULL,
  sent_by uuid REFERENCES users(id) ON DELETE SET NULL,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9.1. Create Expanded Alumni Management Tables
CREATE TABLE IF NOT EXISTS alumni_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  status varchar(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS alumni_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_post_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES alumni_posts(id) ON DELETE CASCADE,
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, alumni_id)
);

CREATE TABLE IF NOT EXISTS alumni_post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES alumni_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  file_url text,
  is_seen boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid REFERENCES alumni_mentorship_requests(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time varchar(50) NOT NULL,
  end_time varchar(50) NOT NULL,
  status varchar(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS alumni_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id uuid REFERENCES alumni_profiles(id) ON DELETE SET NULL,
  action varchar(255) NOT NULL,
  ip_address varchar(100),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
