# Security Model

## Principles

- Never trust client-side role claims.
- Keep Supabase service role keys server-only.
- Use RLS as the primary data boundary.
- Validate all input with shared Zod schemas.
- Log sensitive state changes.
- Keep storage private and type-restricted.
- Prefer least privilege over convenience.

## Authentication

Supabase Auth should require email verification. After signup, create a `profiles` row with the least-privileged role. Admin and mechanic verification must be done by an existing admin, not by a public signup form.

Security implication: public users cannot self-promote into mechanic, garage owner, or admin roles.

## Authorization

The database enforces:

- Customers read/create their own requests.
- Mechanics read/update assigned requests.
- Garage owners read garage jobs and mechanics.
- Admins can verify mechanics, payments, disputes, and fraud logs.
- Audit logs are admin-readable only.

MVP tradeoff: complex field-level permission checks should be done through server actions/RPC functions as the app becomes interactive. The initial RLS policies provide safe table-level boundaries.

## API Validation Pattern

Use `packages/core/src/validation.ts` at every mutation boundary:

```ts
const input = serviceRequestSchema.parse(await request.json());
```

Why: validation in a shared package keeps Next.js routes, server actions, and future Expo clients aligned.

## Rate Limiting

Initial low-cost recommendation:

- Rate limit public request creation and OTP attempts in Next.js route handlers.
- Start with in-memory per-instance limits in development.
- Move to Upstash Redis or Vercel Runtime Cache when abuse appears.

Security implication: OTP and signup endpoints are the first abuse targets.

## Secure Uploads

Before/after photos:

- Store in private Supabase Storage bucket `service-photos`.
- Allow only JPEG, PNG, and WebP.
- Limit file size to 5 MB.
- Tie every upload to an assigned mechanic and request.

Scalability: image processing, compression, and malware scanning can be added asynchronously later.

## Audit Logging

The migration logs writes for:

- `service_requests`
- `payments`
- `mechanics`

Why: these are high-risk operational records where disputes, fraud, and payout conflicts occur.

Security implication: audit rows should be append-only to application users. Keep modification access restricted to database owners/service role.

## Secrets

Use `.env.example` as a template. Never commit `.env`, Supabase service role keys, Vercel tokens, or database passwords.

Production secrets:

- Vercel project env vars for each app.
- Supabase dashboard secrets for database/auth/storage.
- GitHub Actions secrets only for deployment tokens.

## Known Dependency Advisory

As of this scaffold, `npm audit --omit=dev` reports a moderate advisory for Next.js stable pulling `postcss@8.4.31` below the patched `8.5.10` line. The latest stable Next release checked during setup was `16.2.6`; npm reports the patched Next range is not yet on the stable line. Do not use `npm audit fix --force`, because it proposes a breaking downgrade. Track the next stable Next release and upgrade as soon as the patched dependency lands.
