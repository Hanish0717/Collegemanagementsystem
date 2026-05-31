-- Migration: Mess & Food Management tables and policies
-- Tables: mess_menus, mess_residents, mess_feedback, mess_fees

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- mess_menus: one row per meal per date
CREATE TABLE IF NOT EXISTS mess_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_date date NOT NULL,
  meal_type varchar(20) NOT NULL CHECK (meal_type IN ('Breakfast','Lunch','Snacks','Dinner')),
  food_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status varchar(20) NOT NULL DEFAULT 'Available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (meal_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_mess_menus_date ON mess_menus (meal_date);

-- mess_residents: members subscribed to mess
CREATE TABLE IF NOT EXISTS mess_residents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid,
  resident_name varchar(255),
  hostel_block varchar(255),
  room_number varchar(50),
  mess_status varchar(20) DEFAULT 'Active' CHECK (mess_status IN ('Active','Inactive')),
  joined_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mess_residents_resident ON mess_residents (resident_id);

-- mess_feedback
CREATE TABLE IF NOT EXISTS mess_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid,
  resident_name varchar(255),
  meal_type varchar(20) CHECK (meal_type IN ('Breakfast','Lunch','Snacks','Dinner')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mess_feedback_resident ON mess_feedback (resident_id);

-- mess_fees
CREATE TABLE IF NOT EXISTS mess_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid,
  mess_fee numeric(10,2) NOT NULL DEFAULT 0,
  paid_amount numeric(10,2) NOT NULL DEFAULT 0,
  pending_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_status varchar(20) DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid','Unpaid','Partially-Paid')),
  payment_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mess_fees_resident ON mess_fees (resident_id);

-- Row Level Security: basic example policies; adjust for production auth claims
ALTER TABLE mess_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mess_menus_select" ON mess_menus FOR SELECT USING (true);
CREATE POLICY "mess_menus_insert_admin" ON mess_menus FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "mess_menus_update_admin" ON mess_menus FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "mess_menus_delete_admin" ON mess_menus FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE mess_residents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mess_residents_select" ON mess_residents FOR SELECT USING (true);
CREATE POLICY "mess_residents_insert" ON mess_residents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "mess_residents_update" ON mess_residents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "mess_residents_delete" ON mess_residents FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE mess_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mess_feedback_insert_own" ON mess_feedback FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "mess_feedback_select" ON mess_feedback FOR SELECT USING (true);

ALTER TABLE mess_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mess_fees_select" ON mess_fees FOR SELECT USING (true);
CREATE POLICY "mess_fees_insert_admin" ON mess_fees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "mess_fees_update_admin" ON mess_fees FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "mess_fees_delete_admin" ON mess_fees FOR DELETE USING (auth.role() = 'authenticated');

-- Note: Supabase service role bypasses RLS; refine policies to match your auth claims in production.
