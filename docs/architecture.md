# MechConnect MVP Architecture

## Product Shape

MechConnect starts as four lightweight web apps in one TypeScript monorepo:

- `apps/customer`: customer registration, profile, request creation, WhatsApp location workflow, OTP completion, history, ratings.
- `apps/mechanic`: mechanic availability, assigned jobs, accept/reject, WhatsApp navigation, photo upload, OTP completion, earnings.
- `apps/garage`: garage workforce, active jobs, mechanic performance, verified revenue.
- `apps/admin`: customers, mechanics, garages, live requests, manual payment verification, disputes, fraud logs, approvals, audit logs.

Why: separate app workspaces keep UX and deployment boundaries clear while shared packages prevent duplicated business rules.

MVP tradeoff: these are Next.js mobile-first web apps/PWAs first, not native Expo apps. That is cheaper to ship and operate. Expo can later consume the same `packages/core` contracts.

## Monorepo Layout

```text
apps/
  customer/
  mechanic/
  garage/
  admin/
packages/
  core/       # pricing, validation, RBAC, domain types
  supabase/   # lazy Supabase clients
  ui/         # reusable mobile-first UI primitives
supabase/
  migrations/ # schema, RLS, storage buckets
docs/
```

Security implication: role checks live in the database and server-side packages. Client UI role checks are only for presentation.

Scalability: new surfaces, mobile apps, or backend workers reuse the same domain contracts without rewriting request/payment semantics.

## Backend Boundary

Supabase owns the MVP backend:

- Auth with email verification.
- PostgreSQL for operational records.
- Storage for before/after photos.
- RLS for data isolation.
- Audit logs for sensitive writes.

Why: this avoids a custom backend and expensive infrastructure while still providing a real production security boundary.

MVP tradeoff: manual dispatch remains human-led from admin/ops workflows. This avoids premature routing algorithms and map billing.

## Request Lifecycle

1. Customer creates a request with bike category, service type, distance slab, WhatsApp number, address, issue.
2. Admin or operator assigns garage/mechanic.
3. Mechanic accepts, navigates using WhatsApp live location, uploads before photo.
4. Mechanic completes work and enters the customer-provided OTP.
5. Mechanic records cash/QR payment as pending.
6. Admin verifies payment or marks dispute.
7. Customer rates service.

Why: this mirrors real Indian roadside operations, including uncertain GPS quality and offline payment collection.

Security implication: OTP prevents a mechanic from self-completing a job without customer confirmation. Payment verification prevents field-side cash/QR claims from becoming final revenue automatically.

Scalability: status transitions can later move into a workflow engine or queue worker without changing table ownership.

## Pricing

The MVP pricing model is centralized in `packages/core/src/pricing.ts`:

- Bike categories: `100cc`, `150cc`, `200-250cc`, `350cc`.
- Distance slab: within 5km is Rs.100, within 10km is Rs.200.
- Spare parts remain outside the fixed estimate until inspection.

Why: price certainty is enough for request conversion while avoiding parts catalog complexity.

Security implication: server/API code must calculate final quote from trusted constants, not accept client-submitted totals.

Scalability: pricing can later become database-driven by city, garage, time, surge, and service package.

## Payments

The MVP intentionally excludes Razorpay:

- Customer pays mechanic by cash or mechanic QR.
- Mechanic records collection.
- Admin verifies payment.
- Statuses: `pending`, `verified`, `disputed`.

Why: this reduces launch cost and avoids payment-gateway onboarding delays.

Security implication: transaction logs are immutable operational evidence. Admin verification creates separation of duties.

Scalability: a future payment provider can write into the same `payments` table with a new method and webhook audit trail.

## Location

No Google Maps in MVP:

- Customer shares WhatsApp live location.
- Customer/admin selects manual distance slab.
- Mechanic opens WhatsApp navigation workflow.

Why: this is cheaper and practical for early dense-city operations.

Security implication: exact GPS is not stored by default, reducing privacy exposure.

Scalability: add a `locations` table and a maps adapter package later. Existing requests already have service area and distance slab fields.

## Admin Analytics

Initial analytics should use SQL views over verified data:

- Gross verified revenue.
- Pending payment count.
- Live request funnel by status.
- Cancellation rate.
- Mechanic completion rate.
- Garage revenue and payout.
- Disputes and fraud log volume.

Why: SQL views are cheap, explainable, and easy for a solo founder to maintain.

Scalability: move to materialized views, warehouse sync, or event analytics only after operational volume justifies it.

## Future Evolution

- Real-time dispatch: Supabase Realtime on `service_requests`.
- Notifications: WhatsApp Business API or low-cost SMS after manual workflows stabilize.
- Maps: adapter interface for Google Maps/MapmyIndia without changing request lifecycle.
- AI diagnostics: add guided issue intake and mechanic recommendations.
- Redis: cache hot admin analytics and rate limits.
- WebSockets: mechanic status and live request board.
- Microservices: split payments/dispatch only after team size and traffic require it.
- Kubernetes: defer until multi-service workloads and infra team exist.
