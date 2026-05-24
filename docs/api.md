# API Architecture

## Pattern

Use Next.js route handlers or server actions for mutations. Every mutation follows this sequence:

1. Read the Supabase session from secure cookies.
2. Validate payload with `@mechconnect/core` Zod schemas.
3. Load the caller profile from Supabase.
4. Enforce server-side role permission.
5. Perform the database write.
6. Let RLS provide the final data-access boundary.
7. Write or rely on database audit logs for sensitive state changes.

Why: this gives the MVP a real backend security boundary without operating a separate API service.

Security implication: never accept `role`, `customer_id`, `mechanic_id`, `garage_id`, prices, or payment status from the client as trusted facts.

## Initial Routes

Customer:

- `POST /api/quote`: validates service request inputs and returns a trusted quote.
- `POST /api/requests`: creates request after auth, server-calculated pricing, and RLS insert.
- `POST /api/ratings`: customer rates a completed request.

Mechanic:

- `POST /api/jobs/accept`: assigned mechanic accepts job.
- `POST /api/jobs/reject`: assigned mechanic rejects job with reason.
- `POST /api/jobs/complete`: verifies OTP and marks completion pending payment.
- `POST /api/payments/collect`: records cash/QR collection as pending.
- `POST /api/photos`: uploads before/after photo metadata after storage upload validation.

Garage:

- `GET /api/mechanics`: garage owner roster.
- `PATCH /api/mechanics/:id`: garage-level mechanic assignment or status visibility.
- `GET /api/analytics`: garage revenue and performance.

Admin:

- `PATCH /api/requests/:id/assign`: assign garage/mechanic.
- `POST /api/payments/verify`: verify pending payment.
- `POST /api/payments/dispute`: mark payment disputed.
- `PATCH /api/mechanics/:id/verify`: approve mechanic.
- `GET /api/audit`: audit log search.
- `GET /api/fraud`: fraud log search.

## Backend Logic Rules

- Pricing is calculated server-side from `quoteService`.
- OTP is generated server-side, hashed, and stored in `completion_otp_hash`.
- OTP attempts should be rate limited.
- File uploads must validate MIME type and size before storage insert.
- Payments become revenue only after admin verification.
- Mechanic earnings are calculated from verified payment amount and mechanic payout percentage.
- Admin analytics should ignore pending and disputed payments unless explicitly reporting those queues.

## Example Request Creation Flow

```ts
const input = serviceRequestSchema.parse(body);
const quote = quoteService(input.serviceType, input.bikeCategory, input.distanceSlab);

await supabase.from("service_requests").insert({
  customer_id: user.id,
  service_type: input.serviceType,
  bike_category: input.bikeCategory,
  distance_slab: input.distanceSlab,
  pickup_address: input.pickupAddress,
  issue_description: input.issueDescription,
  whatsapp_number: input.whatsappNumber,
  base_price: quote.serviceBasePrice,
  visiting_charge: quote.visitingCharge,
  estimated_total: quote.estimatedTotal
});
```

## Low-Cost Rate Limit Strategy

MVP:

- Use simple per-IP limits in route handlers for quote, request creation, OTP, and auth-adjacent operations.

Scale-up:

- Move counters to Upstash Redis or Vercel Runtime Cache.
- Add stricter device/session-level limits for OTP attempts.

## API Dependency Strategy

Avoid in MVP:

- Razorpay.
- Google Maps.
- Paid SMS by default.

Use:

- Supabase Auth/Postgres/Storage.
- WhatsApp manual workflows.
- Vercel hosting.

Why: operational learning is more valuable than integrating paid services before dispatch density is proven.
