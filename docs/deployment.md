# Deployment Guide

## Local Development

1. Copy `.env.example` to `.env`.
2. Fill Supabase URL and anon key.
3. Run `npm install`.
4. Start one app:

```bash
npm run dev:customer
npm run dev:mechanic
npm run dev:garage
npm run dev:admin
```

Default local ports are `3010` for customer, `3001` for mechanic, `3012` for garage, and `3003` for admin. The customer and garage apps avoid `3000` and `3002` because those ports are commonly occupied by Docker or other local services.

Or start all apps with Docker:

```bash
docker compose up
```

## Supabase

Apply migrations through the Supabase CLI or dashboard SQL editor:

```bash
supabase db push
```

Required Supabase settings:

- Enable email confirmation.
- Keep `service-photos` bucket private.
- Review RLS policies after every schema change.
- Create first `super_admin` profile manually from the Supabase SQL editor.
- Set `OTP_PEPPER` in every server runtime before accepting real OTP completions.
- Run `supabase/rls-smoke-tests.sql` after creating test users for each role.

## Vercel

Create four Vercel projects from this monorepo:

- Customer app root: `apps/customer`
- Mechanic app root: `apps/mechanic`
- Garage app root: `apps/garage`
- Admin app root: `apps/admin`

Build command for each:

```bash
npm run build
```

Install command:

```bash
npm install
```

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` only for apps/routes that need server-side privileged admin operations.

Security implication: do not add service-role keys to customer-facing client bundles. Keep privileged operations in server route handlers.

## Railway

Railway is optional for MVP. Use it later for:

- Background dispatch worker.
- WhatsApp Business webhook service.
- Scheduled analytics jobs.
- Image processing queue.

MVP tradeoff: avoid a separate backend service until manual operations outgrow Supabase and Next.js route handlers.

## CI/CD

The GitHub Actions workflow runs:

- Type checks.
- Lint.
- Build.

Recommended production promotion:

1. Pull request creates preview deployment.
2. Run manual smoke test for all four apps.
3. Merge to `main`.
4. Vercel deploys production.

## Operational Runbook

Daily:

- Verify pending QR/cash payments.
- Review disputed jobs.
- Approve or reject mechanic verifications.
- Check repeated cancellation patterns.
- Reconcile garage revenue and mechanic payouts.

Weekly:

- Export verified payments.
- Review mechanic ratings and completion time.
- Inspect fraud logs.
- Rotate access for inactive admins.

## Health Checks

Each app exposes:

- Customer: `/api/health`
- Mechanic: `/api/health`
- Garage: `/api/health`
- Admin: `/api/health`

Use these for Vercel uptime checks and deployment smoke tests.
