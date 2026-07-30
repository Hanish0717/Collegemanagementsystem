BEGIN;

-- Enable uuid-ossp extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create automations table (if not exists)
CREATE TABLE IF NOT EXISTS automations (
  name varchar(255) PRIMARY KEY,
  trigger varchar(255) NOT NULL,
  runs integer DEFAULT 0,
  success integer DEFAULT 100,
  enabled boolean DEFAULT true,
  frequency varchar(50) DEFAULT 'Daily',
  target varchar(100) DEFAULT 'All Students',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create automation_logs table (if not exists)
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event varchar(255) NOT NULL,
  result varchar(255) NOT NULL,
  time varchar(100) NOT NULL,
  status varchar(50) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed automations default baseline records if empty
INSERT INTO automations (name, trigger, runs, success, enabled, frequency, target) VALUES
('Notification Automation', 'New circular published', 184, 98, true, 'Daily', 'All Students'),
('Attendance Alerts', 'Attendance below 75%', 426, 94, true, 'Hourly', 'All Students'),
('Fee Reminder Controls', 'Payment due in 3 days', 342, 96, true, 'Daily', 'All Students'),
('Approval Escalation', 'Pending beyond 48 hours', 28, 89, false, 'Daily', 'Admins and Heads')
ON CONFLICT (name) DO NOTHING;

-- Seed automation_logs default baseline records if empty
INSERT INTO automation_logs (event, result, time, status) VALUES
('Fee reminders delivered', '342 sent', '20m ago', 'Success'),
('Low attendance alerts queued', '86 students', '1h ago', 'Success'),
('Admin approval escalation paused', 'Manual review', '3h ago', 'Review'),
('Daily report digest generated', '12 recipients', '6h ago', 'Success')
ON CONFLICT DO NOTHING;

-- 3. Create updatable transport_routes view over routes table
CREATE OR REPLACE VIEW transport_routes AS
SELECT 
  id,
  name,
  route_number,
  start_point,
  end_point,
  distance,
  estimated_time,
  bus_id AS bus,
  driver_id AS driver,
  bus_id,
  driver_id,
  status,
  stops,
  created_at,
  updated_at
FROM routes;

-- Trigger function for INSTEAD OF UPDATE on transport_routes view
CREATE OR REPLACE FUNCTION fn_update_transport_routes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE routes SET
    name = COALESCE(NEW.name, OLD.name),
    route_number = COALESCE(NEW.route_number, OLD.route_number),
    start_point = COALESCE(NEW.start_point, OLD.start_point),
    end_point = COALESCE(NEW.end_point, OLD.end_point),
    distance = COALESCE(NEW.distance, OLD.distance),
    estimated_time = COALESCE(NEW.estimated_time, OLD.estimated_time),
    bus_id = COALESCE(NEW.bus, NEW.bus_id, OLD.bus_id),
    driver_id = COALESCE(NEW.driver, NEW.driver_id, OLD.driver_id),
    status = COALESCE(NEW.status, OLD.status),
    stops = COALESCE(NEW.stops, OLD.stops),
    updated_at = NOW()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_transport_routes ON transport_routes;
CREATE TRIGGER trg_update_transport_routes
INSTEAD OF UPDATE ON transport_routes
FOR EACH ROW
EXECUTE FUNCTION fn_update_transport_routes();

-- 4. Create updatable transport_buses view over buses table
CREATE OR REPLACE VIEW transport_buses AS
SELECT 
  id,
  bus_number,
  type,
  make,
  model,
  capacity,
  fuel_type,
  status,
  gps_device_number,
  insurance_expiry,
  created_at,
  updated_at
FROM buses;

-- 5. Create updatable transport_drivers view over drivers table
CREATE OR REPLACE VIEW transport_drivers AS
SELECT 
  id,
  full_name,
  phone,
  license_number,
  license_expiry,
  experience_years,
  assigned_bus_id,
  status,
  created_at,
  updated_at
FROM drivers;

COMMIT;
