# Prisma/PostgreSQL Persistence

**Date:** 2026-09-13  
**Area:** Data persistence, authentication, programs, availability, bookings,
payments, and guest contacts  
**Status:** Feature specification; implementation not started

## Problem

The application currently uses `src/lib/demo-store.ts` as an in-memory
repository. This is useful for the MVP demo but causes all users, sessions,
program changes, availability, guest contacts, bookings, payments, reviews,
notifications, and administrative changes to disappear when the process
restarts.

The application already contains a Prisma PostgreSQL schema and migrations, but
the route handlers do not use Prisma. The next roadmap slice should replace
volatile storage with durable persistence without changing the public booking
or role-based behavior.

## Goal

Persist the core customer journey in PostgreSQL through Prisma:

**Register or book as guest -> authenticate -> view programs and availability ->
create booking -> complete payment -> manage booking**

The migration must preserve:

- Customer, coach, and administrator roles.
- Public complimentary trial booking.
- Login and session behavior.
- Paid-session authentication requirements.
- Slot conflict protection.
- Existing program, booking, payment, and dashboard API shapes where practical.

## Scope

### In scope

- Prisma client initialization and server-only database access.
- User persistence, including guest-created customer records.
- Session persistence with secure expiration.
- Program persistence and active/inactive state.
- Availability persistence.
- Booking persistence and transactional slot claiming.
- Payment record persistence.
- Migration and seed data for demo accounts and initial programs.
- Environment-controlled demo fallback only when explicitly enabled.

### Out of scope

- Production payment provider webhooks.
- Email, SMS, or WhatsApp delivery.
- CAPTCHA and rate limiting.
- Full content-management migration for testimonials and YouTube sessions.
- Multi-tenant or multi-coach scheduling.
- Replacing the current UI.

## Existing Data Model

The current Prisma schema already defines:

- `User`
- `Program`
- `Availability`
- `Booking`
- `Payment`
- `Review`
- `Testimonial`
- `Notification`
- `BusinessPolicy`

The schema needs the following persistence details before production use:

- Add a `Session` model for hashed session tokens, expiration, and revocation.
- Add a guest/contact marker or registration state to distinguish a guest-created
  customer from a password-created account.
- Add unique and indexed constraints for booking concurrency and common
  dashboard queries.
- Add `updatedAt` and audit fields where administrative edits require history.
- Confirm the `Booking.rescheduledFromId` self-relation before generating the
  production migration.

## Proposed Architecture

### Prisma client

Create `src/lib/prisma.ts` with a singleton `PrismaClient` for development
hot-reload safety. The module must not be imported by client components.

### Repository boundary

Create server-side repositories instead of calling Prisma directly from route
handlers:

- `src/lib/repositories/users.ts`
- `src/lib/repositories/sessions.ts`
- `src/lib/repositories/programs.ts`
- `src/lib/repositories/availability.ts`
- `src/lib/repositories/bookings.ts`
- `src/lib/repositories/payments.ts`

Repositories should return application types from `src/lib/types.ts`, keeping
Prisma-generated types out of UI components.

### Authentication

Replace the in-memory session map with a database-backed session record:

1. Generate a cryptographically random raw token.
2. Store only a hash of the token.
3. Set the raw token in an `HttpOnly`, `Secure` cookie outside development,
   with `SameSite=Lax` and an explicit expiration.
4. Resolve and rotate or revoke sessions through the session repository.
5. Remove expired sessions during lookup or through a scheduled cleanup task.

Passwords must continue to be stored as hashes and must never be persisted in
cookies or returned by API responses.

### Guest trial booking

For the free Clarity Call:

- Validate name, email, optional phone, and selected slot.
- Find or create a customer by normalized email.
- Do not create a password or authenticated session automatically.
- Persist the booking and confirmation status in one transaction.

For paid programs:

- Require an authenticated customer, coach, or administrator according to the
  existing authorization rules.
- Reject guest requests before creating any booking or payment record.

### Transactional slot claiming

Booking creation must use a Prisma transaction:

1. Load the selected program and availability row.
2. Verify the program is active and the slot is open and in the future.
3. Lock or atomically update the availability row.
4. Confirm no active booking already claims the slot.
5. Create the booking.
6. Create the payment row for paid programs.
7. Create the notification event.

A conflicting transaction must return the existing
`SLOT_ALREADY_BOOKED` behavior rather than creating duplicate bookings.

## API Compatibility

The following routes should retain their current response intent:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/recover`
- `GET /api/programs`
- `GET /api/availability`
- `POST /api/availability`
- `POST /api/bookings`
- `GET /api/bookings`
- `PATCH /api/bookings`
- `POST /api/payments/verify`

Any response-shape changes should be isolated to repository adapters and
covered by route-level tests.

## Seed and Migration Requirements

Add a Prisma seed command that creates:

- Demo administrator.
- Demo coach.
- Demo customer.
- The three initial programs.
- Initial availability slots only for local/demo development.
- Default business policy.

Seed passwords must come from environment variables or be clearly marked as
development-only values. They must not be used in production.

The migration process must be safe for an existing deployment:

1. Apply schema changes.
2. Seed or upsert required reference programs.
3. Verify indexes and constraints.
4. Enable database mode through environment configuration.
5. Keep demo mode available for local development until cutover is verified.

## Configuration

Required:

```env
DATABASE_URL="postgresql://user:password@host:5432/deepakcoach?schema=public"
```

Recommended:

```env
PERSISTENCE_MODE="prisma"
SESSION_SECRET="replace-with-a-long-random-value"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="development-only-password"
```

`PERSISTENCE_MODE` should fail clearly when set to `prisma` and
`DATABASE_URL` is missing. It must not silently fall back to in-memory storage
in production.

## Acceptance Criteria

- Restarting the application does not remove registered users or bookings.
- A newly registered customer can log in after a restart.
- A visitor can book the free Clarity Call with name and email only.
- A guest cannot book a paid program.
- Programs created or deactivated by an administrator persist after restart.
- Availability created by an administrator persists after restart.
- Two concurrent attempts cannot claim the same slot.
- Booking, payment, and notification records remain linked after restart.
- Customer and administrator dashboards show persisted records.
- Expired sessions cannot authenticate.
- No password hash, session token, or payment secret is returned in API output.
- Existing lint, type-check, build, and route tests pass.

## Test Plan

### Unit tests

- Email normalization and guest customer reuse.
- Session token hashing, expiration, and revocation.
- Program active-state filtering.
- Booking state transitions.
- Payment state transitions.

### Integration tests

- Register, restart, and login.
- Guest free booking.
- Paid booking authorization.
- Duplicate slot booking under concurrent requests.
- Cancellation and rescheduling.
- Payment verification and booking confirmation.
- Administrator program and availability mutations.

### Database checks

- Migration from an empty database.
- Re-running seed without duplicates.
- Foreign-key integrity.
- Unique constraints for email, program slug, booking reference, and payment
  booking ID.

## Rollout Plan

1. Add Prisma client, repositories, and session model.
2. Add seed script and migration.
3. Add repository-backed authentication.
4. Move programs and availability reads/writes.
5. Move booking and payment writes inside transactions.
6. Move dashboard and administrative reads.
7. Run integration tests against a disposable PostgreSQL database.
8. Enable `PERSISTENCE_MODE=prisma` in staging.
9. Verify guest trial booking and concurrent slot protection.
10. Enable Prisma persistence in production with backups and monitoring.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Existing demo data is not automatically migrated | Provide an explicit seed/import script and document the cutover |
| Duplicate slot claims under load | Use a transaction and database constraint/lock strategy |
| Guest endpoint abuse | Add rate limiting, CAPTCHA, and email verification before production |
| Session token leakage | Store only token hashes and use secure, HTTP-only cookies |
| Silent fallback to volatile storage | Fail startup or requests when Prisma mode lacks database configuration |
| Prisma client misuse in client bundles | Keep Prisma imports inside server-only repository modules |
