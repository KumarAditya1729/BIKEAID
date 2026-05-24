# Production Readiness Checklist

## Done In Code

- Supabase Auth UI exists for all four apps.
- Customer signup sends profile metadata to Supabase.
- Database trigger creates least-privilege customer profiles.
- API route handlers verify bearer tokens server-side.
- Role gates exist for customer, mechanic, garage owner, admin, and super admin operations.
- Real Supabase-backed routes exist for requests, assignment, OTP completion, payment collection/verification, ratings, mechanic availability, photo upload signing, garage analytics, mechanic verification, and role promotion.
- High-risk endpoints have in-memory rate limits.
- JSON structured logs are emitted for sensitive operations and failures.
- Health endpoints exist at `/api/health` for all apps.
- RLS, audit logging, storage bucket, analytics views, and auth trigger migrations are included.

## Must Be Done In Supabase Dashboard

- Apply all migrations.
- Enable email confirmation in Supabase Auth.
- Create the first founder user through normal signup.
- Promote that profile to `super_admin` using the SQL snippet in `supabase/seed.sql`.
- Confirm `service-photos` is private.
- Confirm allowed storage MIME types are JPEG, PNG, and WebP.
- Run `supabase/rls-smoke-tests.sql`.

## Must Be Done In Vercel

- Add environment variables to each project:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OTP_PEPPER`
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Add uptime checks against `/api/health`.
- Add log drains or Vercel Observability before live operations.

## Still Recommended Before Paid Launch

- Replace in-memory rate limiting with Redis or Vercel Runtime Cache.
- Add E2E tests with seeded Supabase test users.
- Add a formal status-transition RPC so invalid request state jumps are impossible.
- Add image moderation/compression for service photos.
- Add Sentry or another error tracker for client-side runtime errors.
- Run QA on low-end Android phones and flaky mobile networks.
