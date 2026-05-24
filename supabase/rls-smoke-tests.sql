-- Manual smoke-test checklist for Supabase SQL editor.
-- These queries should be run after creating test users for each role.
-- Do not commit real user IDs or production data.

-- 1. Confirm every application table has RLS enabled.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
and tablename in (
  'profiles',
  'garages',
  'mechanics',
  'service_requests',
  'service_photos',
  'payments',
  'ratings',
  'disputes',
  'fraud_logs',
  'audit_logs'
)
order by tablename;

-- 2. Confirm admin views are present.
select table_name
from information_schema.views
where table_schema = 'public'
and table_name in ('admin_revenue_analytics', 'admin_request_funnel');

-- 3. Confirm storage bucket remains private.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'service-photos';

-- 4. API-level checks to perform with real bearer tokens:
-- Customer token can POST /api/requests and GET only their requests.
-- Mechanic token can PATCH /api/availability and complete only assigned jobs.
-- Garage owner token can GET only their garage mechanics and analytics.
-- Admin token can assign requests and verify payments.
-- Non-admin token must receive 403 from /api/roles/promote.
