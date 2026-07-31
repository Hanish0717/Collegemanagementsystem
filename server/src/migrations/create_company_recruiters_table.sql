-- Migration: Create company_recruiters table & RLS policies
CREATE TABLE IF NOT EXISTS company_recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(150),
    permissions JSONB DEFAULT '["view_applicants", "shortlist_candidates", "schedule_interviews", "release_offers", "download_dossiers"]'::jsonb,
    status VARCHAR(50) DEFAULT 'active', -- active, disabled
    is_temporary_password BOOLEAN DEFAULT true,
    password_hash VARCHAR(255) NOT NULL,
    assigned_drive_ids JSONB DEFAULT '[]'::jsonb,
    login_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by email and company
CREATE INDEX IF NOT EXISTS idx_company_recruiters_email ON company_recruiters(email);
CREATE INDEX IF NOT EXISTS idx_company_recruiters_company_id ON company_recruiters(company_id);

-- Enable RLS
ALTER TABLE company_recruiters ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Super admin and placement officer manage all recruiters" ON company_recruiters
    FOR ALL
    USING (true);
