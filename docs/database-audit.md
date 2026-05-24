# MechConnect Database Audit

Audit date: May 24, 2026
Remediation status: high-risk database issues have been addressed in `supabase/migrations/003_database_hardening.sql`. This report is retained as a review trail and launch checklist.

Scope:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_auth_storage_operational_hardening.sql`
- API/database contract in `apps/*/app/api/**`

## Executive Summary

The database has a strong MVP foundation: normalized operational tables, RLS enabled on public tables, private storage bucket, audit triggers for core operational tables, and role-aware helper functions.

The main production risk was that several RLS policies were broader than the server API logic. The API routes enforce safer workflows, and `003_database_hardening.sql` now tightens direct table access, adds consistency triggers, expands audit coverage, and locks analytics views.

## Critical Findings

### P0: Mechanics Can Insert Payments For Requests Not Assigned To Them

Location: `supabase/migrations/001_initial_schema.sql:296`
Status: fixed in `supabase/migrations/003_database_hardening.sql`; direct non-admin operational inserts now go through server APIs.

Policy:

```sql
create policy "mechanic marks collected payment" on public.payments
for insert
with check (public.is_assigned_mechanic(mechanic_id) and status = 'pending');
```

Problem:

The policy checks only that `mechanic_id` belongs to the caller. It does not verify that `payments.request_id` is assigned to that same mechanic or that the service request is in `completed_pending_payment`. A mechanic could create a pending payment row for another request and block the legitimate collection because `payments.request_id` is unique.

Impact:

- Payment spoofing
- Operational disputes
- Legitimate payment collection blocked
- Revenue queue pollution

Recommended fix:

Require an `exists` check tying `payments.request_id` to a service request whose `assigned_mechanic_id = payments.mechanic_id` and whose status is `completed_pending_payment`.

### P0: Mechanic RLS Allows Broad Updates To Assigned Service Requests

Location: `supabase/migrations/001_initial_schema.sql:267`
Status: fixed in `supabase/migrations/003_database_hardening.sql`; direct non-admin operational inserts now go through server APIs.

Policy:

```sql
create policy "mechanic updates assigned request" on public.service_requests
for update
using (public.is_assigned_mechanic(assigned_mechanic_id))
with check (public.is_assigned_mechanic(assigned_mechanic_id));
```

Problem:

RLS does not restrict columns. A directly authenticated mechanic can update any column on an assigned request, including pricing fields, `customer_id`, `garage_id`, `status`, `completion_otp_hash`, and address details.

Impact:

- Price tampering
- State-machine bypass
- Customer/request ownership corruption
- OTP integrity loss

Recommended fix:

Remove broad direct update access. Use security-definer RPC functions for specific transitions: accept, reject, complete with OTP, and payment-pending transition. Alternatively add restrictive triggers that reject illegal column changes and invalid status transitions.

### P0: Mechanics Can Update Verification, Garage, And Payout Fields

Location: `supabase/migrations/001_initial_schema.sql:256`
Status: fixed in `supabase/migrations/003_database_hardening.sql`; direct non-admin operational inserts now go through server APIs.

Policy:

```sql
create policy "mechanic updates own availability" on public.mechanics
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());
```

Problem:

This policy is intended for availability updates, but RLS applies to the row, not individual columns. A mechanic can directly update `is_verified`, `garage_id`, `payout_percentage`, and `emergency_enabled` on their own row.

Impact:

- Self-verification
- Payout manipulation
- Unauthorized garage reassignment
- Emergency-duty abuse

Recommended fix:

Do not allow direct row updates for mechanics. Replace with an RPC such as `set_mechanic_status(status mechanic_status)` that only updates the `status` field after validating the caller.

## High Findings

### P1: Customers Can Bypass Server Pricing On Direct Inserts

Location: `supabase/migrations/001_initial_schema.sql:260`
Status: fixed in `supabase/migrations/003_database_hardening.sql`; direct non-admin operational inserts now go through server APIs.

Problem:

Customers can insert their own service requests, but the policy does not restrict `status`, `base_price`, `visiting_charge`, `estimated_total`, `garage_id`, `assigned_mechanic_id`, or `completion_otp_hash`. The API calculates pricing safely, but direct Supabase table inserts can bypass it.

Impact:

- Fake low-price jobs
- Fake assigned/completed states
- Operational queue pollution

Recommended fix:

Either route creation through a security-definer RPC or add `with check` constraints that force `status = 'submitted'`, `garage_id is null`, `assigned_mechanic_id is null`, and DB-calculated pricing.

### P1: Ratings Can Be Inserted For Requests The Customer Does Not Own

Location: `supabase/migrations/001_initial_schema.sql:299`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

The insert policy checks `customer_id = auth.uid()` but does not verify that `request_id` belongs to the customer or that the request is completed.

Impact:

- Fake ratings
- Reputation manipulation
- One-rating-per-request slot can be consumed by an attacker

Recommended fix:

Require an `exists` check against `service_requests` where `id = request_id`, `customer_id = auth.uid()`, and `status = 'completed'`.

### P1: Service Photo Metadata Can Be Attached To Unrelated Requests

Location: `supabase/migrations/001_initial_schema.sql:282`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

The policy checks only that `mechanic_id` belongs to the caller. It does not ensure the `request_id` is assigned to that mechanic.

Impact:

- Photo metadata poisoning
- Dispute evidence contamination
- Possible storage path confusion

Recommended fix:

Require `exists` against `service_requests` where `id = request_id` and `assigned_mechanic_id = mechanic_id`.

### P1: Admin Analytics Views May Bypass RLS

Location: `supabase/migrations/002_auth_storage_operational_hardening.sql:49`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

Postgres views can run with owner privileges unless configured carefully. The views `admin_revenue_analytics` and `admin_request_funnel` aggregate all platform data and have no explicit access restriction.

Impact:

- Non-admin users may be able to query platform-wide analytics if grants allow it.

Recommended fix:

Use `security_invoker = true` where supported, revoke public/authenticated access, or expose analytics only through admin-only RPC/API routes.

### P1: Role/Profile Changes Are Not Fully Audited At The Database Layer

Location: `supabase/migrations/001_initial_schema.sql:233`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

Audit triggers exist for `service_requests`, `payments`, and `mechanics`, but not for `profiles`, `garages`, `ratings`, `disputes`, `fraud_logs`, or `service_photos`.

Impact:

- Direct profile role changes may not be automatically audited.
- Garage verification and dispute changes have weaker forensic traceability.

Recommended fix:

Add audit triggers to `profiles`, `garages`, `disputes`, `fraud_logs`, `ratings`, and `service_photos`.

### P1: Garage Owners Can Broadly Update Mechanic Rows

Location: `supabase/migrations/001_initial_schema.sql:257`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

The policy allows garage owners to update garage mechanics, but RLS does not limit columns. Garage owners may be able to change verification, payout, status, and assignment-sensitive fields.

Impact:

- Payout tampering
- Verification bypass
- Workforce data corruption

Recommended fix:

Move garage mechanic management into explicit admin/garage-owner RPC functions with column-specific logic.

## Medium Findings

### P2: Disputes Can Be Opened Against Unrelated Requests

Location: `supabase/migrations/001_initial_schema.sql:312`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

The insert policy checks only `opened_by = auth.uid()`. It does not verify that the caller is involved in the request.

Impact:

- Dispute queue spam
- Unrelated operational noise

Recommended fix:

Require request involvement: customer, assigned mechanic, garage owner, or admin.

### P2: Auth Trigger Uses Placeholder Phone Number

Location: `supabase/migrations/002_auth_storage_operational_hardening.sql:13`
Status: partially mitigated in `supabase/migrations/003_database_hardening.sql`; invalid metadata no longer breaks signup, but onboarding should still require a real verified phone before paid service use.

Problem:

If signup metadata has no phone, the profile is created with `9999999999`. The hardening migration now prevents malformed metadata from breaking signup, but the placeholder value is still not suitable for a paid-service account.

Impact:

- Dirty profile data
- Signup failures for malformed metadata

Recommended fix:

Use a pending onboarding table, make `phone` nullable until profile completion, or validate phone before signup.

### P2: No Database-Level Request State Machine

Location: `supabase/migrations/001_initial_schema.sql:57`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

`service_requests.status` is an enum, but the database does not prevent invalid transitions like `submitted -> completed` or `completed -> accepted`.

Impact:

- Bugs or direct table calls can create impossible operational states.

Recommended fix:

Add a transition validation trigger or route all transitions through RPC functions.

### P2: Missing Cross-Entity Consistency Constraints

Location: `supabase/migrations/001_initial_schema.sql:57`, `89`, `103`
Status: fixed for request/mechanic/garage, payment, rating, and photo consistency in `supabase/migrations/003_database_hardening.sql`

Problem:

The database does not enforce:

- assigned mechanic belongs to request garage
- payment mechanic matches request assigned mechanic
- rating customer/mechanic/garage matches request
- photo mechanic matches request assigned mechanic

Impact:

- Data drift
- Incorrect payouts and analytics
- Dispute confusion

Recommended fix:

Add validation triggers for cross-table invariants.

### P2: Audit Logs Do Not Capture Request IP

Location: `supabase/migrations/001_initial_schema.sql:143`
Status: open; should be handled by API-level audit writes or RPC context because Postgres cannot reliably infer client IP behind Supabase APIs.

Problem:

`audit_logs.ip_address` exists but `write_audit_log()` never sets it.

Impact:

- Reduced fraud investigation detail.

Recommended fix:

Set IP from request context where possible, or pass it explicitly through RPC/API audit writes.

## Low Findings

### P3: No Uniqueness On Profile Email Or Phone

Location: `supabase/migrations/001_initial_schema.sql:23`
Status: email uniqueness fixed in `supabase/migrations/003_database_hardening.sql`; phone uniqueness intentionally deferred until phone verification is implemented.

Problem:

`profiles.email` and `profiles.phone` are not unique.

Impact:

- Duplicate operational identities
- Harder support and reconciliation

Recommended fix:

Add unique indexes where business rules allow, likely on normalized phone and non-null email.

### P3: Some Operational Columns Need Length Checks

Location: `supabase/migrations/001_initial_schema.sql:65`
Status: fixed in `supabase/migrations/003_database_hardening.sql`

Problem:

Fields like `pickup_address`, `issue_description`, `reference_note`, `reason`, and `resolution` do not all have database length checks.

Impact:

- Large text payload abuse
- Inconsistent DB/API validation

Recommended fix:

Mirror API max lengths in database check constraints.

## Recommended Remediation Order

1. Remove broad direct update policies for `mechanics` and `service_requests`.
2. Tighten `payments`, `ratings`, `service_photos`, and `disputes` insert policies with ownership checks.
3. Add request status transition and cross-entity validation triggers.
4. Lock down analytics views.
5. Expand audit triggers to role/profile, disputes, garages, ratings, fraud logs, and photos.
6. Clean up signup/profile phone handling.
7. Add uniqueness and text-length constraints.

## Bottom Line

After `003_database_hardening.sql`, the schema is significantly safer for direct Supabase client exposure. Before live launch, still run the RLS smoke tests against real Supabase users and add API-level IP capture for fraud/audit workflows.
