-- IntelliDeskAI Row-Level Security
-- Migration 003: RLS policies for multi-tenant data isolation
-- Run this in Supabase SQL Editor AFTER 002_auth.sql

-- ==================== ENABLE RLS ====================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_emails ENABLE ROW LEVEL SECURITY;

-- ==================== NOTE ====================
-- The application uses supabase service_role key which BYPASSES RLS.
-- These policies are defense-in-depth for any future use of anon/user keys.
-- They also protect against accidental cross-org data leaks.

-- ==================== ORGANIZATIONS ====================
-- Users can only see their own organization
DROP POLICY IF EXISTS "Users can view own org" ON organizations;
CREATE POLICY "Users can view own org"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== USERS ====================
-- Users can see other users in same org
DROP POLICY IF EXISTS "Users can view same org users" ON users;
CREATE POLICY "Users can view same org users"
  ON users FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== ACCOUNTS ====================
DROP POLICY IF EXISTS "Org isolation for accounts" ON accounts;
CREATE POLICY "Org isolation for accounts"
  ON accounts FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== TICKETS ====================
DROP POLICY IF EXISTS "Org isolation for tickets" ON tickets;
CREATE POLICY "Org isolation for tickets"
  ON tickets FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== EMAILS ====================
DROP POLICY IF EXISTS "Org isolation for emails" ON emails;
CREATE POLICY "Org isolation for emails"
  ON emails FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== FAQS ====================
DROP POLICY IF EXISTS "Org isolation for faqs" ON faqs;
CREATE POLICY "Org isolation for faqs"
  ON faqs FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== AUDIT LOGS ====================
DROP POLICY IF EXISTS "Org isolation for audit_logs" ON audit_logs;
CREATE POLICY "Org isolation for audit_logs"
  ON audit_logs FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== TEAMS ====================
DROP POLICY IF EXISTS "Org isolation for teams" ON teams;
CREATE POLICY "Org isolation for teams"
  ON teams FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== AUTO RESPONSES ====================
DROP POLICY IF EXISTS "Org isolation for auto_responses" ON auto_responses;
CREATE POLICY "Org isolation for auto_responses"
  ON auto_responses FOR ALL
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ==================== CONTACTS ====================
-- Contacts are scoped via their account's organization_id
DROP POLICY IF EXISTS "Org isolation for contacts" ON contacts;
CREATE POLICY "Org isolation for contacts"
  ON contacts FOR ALL
  USING (account_id IN (SELECT id FROM accounts WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())));

-- ==================== TICKET EMAILS ====================
-- ticket_emails are scoped via ticket's organization_id
DROP POLICY IF EXISTS "Org isolation for ticket_emails" ON ticket_emails;
CREATE POLICY "Org isolation for ticket_emails"
  ON ticket_emails FOR ALL
  USING (ticket_id IN (SELECT id FROM tickets WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())));

-- ==================== SLA POLICIES (GLOBAL) ====================
-- sla_policies stay readable by all (shared across orgs)
-- No RLS needed since they have no org_id column
