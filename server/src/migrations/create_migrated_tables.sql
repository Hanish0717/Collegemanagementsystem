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
