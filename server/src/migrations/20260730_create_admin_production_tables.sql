-- Migration: Create Admin Production Tables & Indexes
-- Date: 2026-07-30
-- Description: Adds work_wallet_tasks, audit_logs, login_history, security_logs, system_notifications, system_settings tables and indexes.

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Work Wallet Tasks Table
CREATE TABLE IF NOT EXISTS work_wallet_tasks (
  id varchar(50) PRIMARY KEY,
  title varchar(255) NOT NULL,
  category varchar(100) NOT NULL,
  assignee varchar(255) NOT NULL,
  assigned_by varchar(255) NOT NULL,
  priority varchar(50) NOT NULL DEFAULT 'Medium',
  status varchar(50) NOT NULL DEFAULT 'Pending',
  due_date varchar(100) NOT NULL,
  comments_count integer DEFAULT 0,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Security Logs Table
CREATE TABLE IF NOT EXISTS security_logs (
  id varchar(50) PRIMARY KEY,
  user_name varchar(255) NOT NULL,
  event varchar(255) NOT NULL,
  ip varchar(50) NOT NULL,
  time varchar(100) NOT NULL,
  status varchar(50) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. System Notifications Table
CREATE TABLE IF NOT EXISTS system_notifications (
  id varchar(50) PRIMARY KEY,
  title varchar(255) NOT NULL,
  type varchar(100) NOT NULL,
  time varchar(100) NOT NULL,
  unread boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  key varchar(255) PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Backups Table
CREATE TABLE IF NOT EXISTS backups (
  id varchar(50) PRIMARY KEY,
  type varchar(100) NOT NULL,
  size varchar(50) NOT NULL,
  date varchar(100) NOT NULL,
  status varchar(50) DEFAULT 'Completed',
  cloud varchar(50) DEFAULT 'Synced',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name varchar(255) NOT NULL,
  role varchar(100) NOT NULL,
  action varchar(255) NOT NULL,
  module varchar(100) NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address varchar(50),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Login History Table
CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  role varchar(100) NOT NULL,
  ip_address varchar(50),
  user_agent text,
  status varchar(50) NOT NULL DEFAULT 'Success',
  login_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_work_wallet_tasks_status ON work_wallet_tasks(status);
CREATE INDEX IF NOT EXISTS idx_work_wallet_tasks_priority ON work_wallet_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_notifications_unread ON system_notifications(unread);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history(login_at DESC);
