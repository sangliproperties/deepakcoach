# Prisma/PostgreSQL Persistence

## Context

The application currently relies on an in-memory demo store. Users, sessions,
program changes, availability, guest contacts, bookings, payments, and related
records disappear when the process restarts. The next roadmap slice must add
durable persistence without changing the current public booking, authentication,
or role-based behavior.

This feature supports the mission's path from **Discover** through **Book** and
**Pay** by making the booking state explicit, recoverable, and operationally
reliable. It follows the technology stack's PostgreSQL, Prisma, server-side
authorization, provider-boundary, and secure-data requirements.

## Goal

Persist the core customer journey in PostgreSQL through Prisma:

**Register or book as guest -> authenticate -> view programs and availability ->
create booking -> complete payment -> manage booking**

An application restart must not remove customer, session, program, availability,
booking, payment, or guest-contact data.

## Users and operators

- **Guests:** May book only the free Clarity Call with contact details and an
  available future slot.
- **Customers:** May register, authenticate, view eligible offerings and slots,
  and create free or paid bookings according to existing authorization rules.
- **Coaches:** Retain the role needed by existing authorization behavior, with
  access limited to the operations already supported by the application.
- **Administrators:** Operate programs, availability, bookings, payments, and
  related customer records through server-authorized operations.

## Scope

### In scope

- Server-only Prisma client initialization with development hot-reload safety.
- Repository modules for users, sessions, programs, availability, bookings, and
  payments.
- Durable users, including guest-created customer records.
- Database-backed sessions with hashed tokens, expiration, and revocation.
- Durable active/inactive programs and availability slots.
- Transactional booking creation with slot conflict protection.
- Payment records linked to paid bookings without storing card data.
- Migration and repeatable seed data for local/demo development.
- Explicit environment-controlled demo fallback for development only.
- Compatibility with the current route response intent and public booking flow.

### Out of scope

- Production payment-provider webhook expansion.
- Email, SMS, or WhatsApp delivery orchestration.
- CAPTCHA, rate limiting, or email verification.
- Full CMS migration for testimonials or video sessions.
- Multi-tenant or multi-coach scheduling.
- UI redesign or broad customer-dashboard expansion.
- Subscriptions, automated refunds, or advanced self-service rescheduling.

## Required behavior

### Guest and authenticated booking

- A guest may submit name, normalized email, optional phone, and a future open
  slot only for the free Clarity Call.
- A guest request for a paid program is rejected before a booking or payment
  record is created.
- A guest contact is reused when its normalized email matches an existing
  customer record; it must not receive a password or authenticated session
  automatically.
- Paid programs require an authenticated customer, coach, or administrator
  according to existing authorization rules.
- Existing booking response intent and `SLOT_ALREADY_BOOKED` behavior remain
  compatible where practical.

### Persistence and state

Persist explicit states rather than inferring them from missing records:

- User role and registration state.
- Session active, expired, and revoked state.
- Program active/inactive state.
- Availability open, claimed, and unavailable state.
- Booking pending, confirmed, cancelled, and failed state.
- Payment pending, paid, and failed state.

Records must remain linked across user, program, availability, booking, payment,
and notification relationships after restart.

### Transactional slot claiming

Booking creation must use a Prisma transaction that:

1. Loads and validates the selected active program and future availability row.
2. Atomically claims or locks the slot.
3. Confirms that no active booking already claims the slot.
4. Creates the booking.
5. Creates a payment row for paid programs when required.
6. Creates the related notification event when that model is part of the
   current application flow.

Concurrent attempts must produce one successful claim and an explicit conflict
for competing requests; they must not create duplicate bookings.

### Sessions and credentials

- Generate cryptographically random raw session tokens.
- Store only a hash of each session token.
- Store passwords only as hashes.
- Set the raw token in an `HttpOnly` cookie with `SameSite=Lax`, explicit
  expiration, and `Secure` outside development.
- Resolve, expire, and revoke sessions through the session repository.
- Never return passwords, password hashes, raw session tokens, or payment
  secrets in API responses.

### Configuration and fallback

- `PERSISTENCE_MODE=prisma` requires `DATABASE_URL` and fails clearly when it
  is missing or unusable.
- In-memory demo mode is available only when explicitly enabled for local/demo
  use; it must not silently activate in Prisma mode or production.
- Secrets and seed credentials come from environment variables or clearly
  development-only values and are never committed.

## Data and schema requirements

The existing Prisma entities should be reviewed and extended as necessary:

- `User`
- `Program`
- `Availability`
- `Booking`
- `Payment`
- `Review`
- `Testimonial`
- `Notification`
- `BusinessPolicy`

Add a `Session` model for hashed tokens, expiration, and revocation. Add guest
or registration markers needed to distinguish a guest-created customer from a
password-created account. Add unique and indexed constraints for email,
program slug, booking reference, payment booking identity, slot claims, and
common dashboard queries. Confirm the booking reschedule self-relation before
generating a production migration.

## Compatibility boundaries

Preserve the response intent of:

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

Repositories return application types from `src/lib/types.ts` or the
repository's established domain boundary; Prisma-generated types must not leak
into client components.

## Seed and migration requirements

Migrations must apply to an empty database and be safe for the existing
deployment path. A repeatable seed must upsert, without duplicates:

- Demo administrator.
- Demo coach.
- Demo customer.
- The three initial programs.
- Initial availability slots for local/demo development.
- Default business policy.

Seed passwords must come from environment variables or be explicitly
development-only. The rollout must support applying schema changes, seeding
reference data, verifying indexes and constraints, enabling Prisma mode, and
keeping demo mode available until cutover is verified.

## Open decisions

The following may remain implementation decisions if the architectural
guarantees and validation criteria are preserved:

- Exact authentication library.
- PostgreSQL hosting vendor.
- Notification provider.
- Production webhook design.
- Rate limiting, CAPTCHA, and email-verification approach.
- Exact transaction locking strategy.

## Non-functional requirements

- Preserve mission principles of trust, clarity, accessibility, and human
  support; persistence must not introduce unsupported claims or confusing
  states.
- Enforce authorization on the server for every protected operation.
- Validate all external input at route or server-action boundaries.
- Keep Prisma imports inside server-only modules.
- Keep migrations reviewable and backwards-compatible where practical.
- Make errors explicit and recoverable rather than silently falling back or
  dropping state.
