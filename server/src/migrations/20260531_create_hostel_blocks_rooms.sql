-- Migration: create hostel_blocks and hostel_rooms
CREATE TABLE IF NOT EXISTS hostel_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  description text,
  capacity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hostel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES hostel_blocks(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  capacity integer DEFAULT 1,
  gender text DEFAULT 'unassigned',
  current_occupancy integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (block_id, room_number)
);
