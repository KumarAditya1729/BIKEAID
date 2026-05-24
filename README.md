# MechConnect

Production-minded MVP foundation for a low-cost roadside assistance and home bike service platform in India.

## What Is Included

- Four Next.js app workspaces: customer, mechanic, garage owner, admin.
- Shared TypeScript packages for pricing, validation, RBAC, Supabase helpers, and UI primitives.
- Supabase PostgreSQL schema with RLS, audit logs, payment workflow, service photos, disputes, fraud logs, and storage bucket setup.
- Docker Compose development setup.
- GitHub Actions CI.
- Architecture, security, API, auth, and deployment docs.

## Quick Start

```bash
npm install
npm run dev:customer
npm run dev:mechanic
npm run dev:garage
npm run dev:admin
```

Default local ports:

- Customer: `http://localhost:3010`
- Mechanic: `http://localhost:3001`
- Garage: `http://localhost:3012`
- Admin: `http://localhost:3003`

## Documentation

- [Architecture](./docs/architecture.md)
- [Security](./docs/security.md)
- [API Architecture](./docs/api.md)
- [Authentication Flow](./docs/auth-flow.md)
- [Deployment](./docs/deployment.md)
- [Production Readiness](./docs/production-readiness.md)
- [Database Audit](./docs/database-audit.md)

## MVP Positioning

The platform intentionally avoids Razorpay and Google Maps at launch. It uses cash/QR payment collection, admin verification, manual dispatch, and WhatsApp live location sharing so a solo founder can validate operations before adding paid APIs and heavier infrastructure.
