# Authentication And Roles

## Signup

1. User signs up through Supabase Auth.
2. Supabase sends email verification.
3. A least-privilege `profiles` row is created with role `customer`.
4. Admin upgrades approved mechanics, garage owners, and admins through protected admin workflows.

Why: public signup should never grant operational privileges.

Security implication: client-side role selection is not trusted. It may request onboarding, but only admin-controlled database updates can grant elevated roles.

## Login

Each app uses Supabase session cookies:

- Customer app allows `customer`.
- Mechanic app allows verified `mechanic`.
- Garage app allows `garage_owner`.
- Admin app allows `admin` and `super_admin`.

Unauthorized users should be redirected to the correct app or a locked account screen.

## Session Validation

Server handlers must:

- Read authenticated Supabase user.
- Query `profiles`.
- Check `is_active`.
- Check role permission.
- Continue only if RLS and server permission both allow the operation.

## RBAC

Application permissions are described in `packages/core/src/rbac.ts`. Database ownership and visibility are enforced in `supabase/migrations/001_initial_schema.sql`.

Why both: RBAC gives readable application intent, while RLS prevents data leakage even if an API handler has a bug.
