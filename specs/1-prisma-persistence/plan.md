# Implementation Plan

## 1. Establish the persistence boundary

**Objective:** Make Prisma available through a server-only singleton and define
the repository/application-type boundary.

**Affected surfaces:**

- Prisma schema and generated client configuration.
- `src/lib/prisma.ts`.
- Repository modules for users, sessions, programs, availability, bookings, and
  payments.
- Shared domain types and persistence-mode configuration.

**Dependencies:** Confirm the current schema, route data shapes, environment
loading, and existing demo-store interfaces.

**Completion checks:**

- Prisma is not imported by client components.
- Repository methods expose application types rather than Prisma types.
- `PERSISTENCE_MODE=prisma` requires `DATABASE_URL`.
- Explicit demo mode remains available only when configured.

## 2. Evolve the data model and migrations

**Objective:** Add the durable structures, constraints, indexes, and audit
fields required by the workflows.

**Affected surfaces:**

- Prisma models for users, sessions, programs, availability, bookings,
  payments, notifications, and policies.
- Session expiration/revocation fields.
- Guest/registration marker.
- Booking reschedule relation.
- Unique constraints and query indexes.
- Migration files.

**Dependencies:** Persistence boundary and schema review.

**Completion checks:**

- A fresh database migration completes successfully.
- Foreign keys and required unique constraints are enforced.
- Slot claims, email identity, booking references, and payment identities have
  deterministic conflict behavior.
- The migration does not store card data or raw session tokens.

## 3. Add repeatable seed and environment setup

**Objective:** Supply safe local/demo reference data and document required
  configuration.

**Affected surfaces:**

- Prisma seed command and seed data.
- Environment examples or setup documentation already used by the repository.
- Demo administrator, coach, customer, programs, availability, and policy.

**Dependencies:** Final schema and migration.

**Completion checks:**

- Seed runs against an empty database.
- Seed can run repeatedly without duplicates.
- Credentials are environment-controlled or explicitly development-only.
- Prisma mode fails clearly when required configuration is absent.

## 4. Persist authentication and sessions

**Objective:** Replace the in-memory session map while preserving current
  registration, login, logout, recovery, and role behavior.

**Affected surfaces:**

- Authentication routes and server helpers.
- User repository and session repository.
- Cookie creation, lookup, expiration, rotation, and revocation.

**Dependencies:** Persistence boundary, session model, and seed accounts.

**Completion checks:**

- A registered customer can restart the application and log in.
- Expired or revoked sessions cannot authenticate.
- Cookies are HttpOnly, SameSite=Lax, explicitly expiring, and Secure outside
  development.
- Passwords and token hashes never appear in responses or client code.

## 5. Persist programs and availability

**Objective:** Move public program reads and administrator availability
  mutations from volatile storage to Prisma.

**Affected surfaces:**

- Program and availability repositories.
- `GET /api/programs`.
- `GET /api/availability`.
- `POST /api/availability`.
- Related administrator authorization and dashboard reads.

**Dependencies:** Schema, seed, and repository boundary.

**Completion checks:**

- Active programs and future open slots survive restart.
- Inactive programs are excluded from eligible public results.
- Unauthorized availability mutations are rejected server-side.
- Existing response intent remains compatible.

## 6. Persist bookings and payment records transactionally

**Objective:** Move free and paid booking writes to Prisma with atomic slot
  claiming and linked payment state.

**Affected surfaces:**

- Booking and payment repositories.
- `POST /api/bookings`.
- `GET /api/bookings`.
- `PATCH /api/bookings`.
- `POST /api/payments/verify`.
- Guest contact reuse and booking confirmation behavior.

**Dependencies:** Programs, availability, authenticated sessions, and schema
  constraints.

**Completion checks:**

- Guest free booking persists with no automatic password or session.
- Paid guest booking is rejected before any booking/payment write.
- Authenticated paid booking creates linked records.
- Concurrent attempts cannot claim one slot twice.
- Booking and payment failure, pending, confirmed, and cancelled states remain
  explicit and recoverable.
- Payment verification remains server-side and idempotent.

## 7. Switch dashboards and operational reads

**Objective:** Ensure customer and administrator views read persisted records
  rather than demo-store state.

**Affected surfaces:**

- Customer booking reads.
- Administrator program, availability, booking, and payment reads.
- Any notification or audit record reads already exposed by the application.

**Dependencies:** All relevant repositories and route write paths.

**Completion checks:**

- Records created before restart remain visible to authorized users.
- Linked user, program, slot, booking, and payment data is consistent.
- Role boundaries remain enforced for every protected read and mutation.

## 8. Validate cutover and document rollout

**Objective:** Prove the persistence slice is safe to enable and ready for
  review.

**Affected surfaces:**

- Unit, route, integration, and database tests.
- Migration and seed verification.
- Configuration and rollout documentation.

**Dependencies:** All implementation groups.

**Completion checks:**

- Targeted tests cover normalization, sessions, authorization, booking
  conflicts, state transitions, payment verification, and idempotency.
- Fresh migration and repeatable seed checks pass.
- Restart, guest booking, concurrent booking, failure, and unauthorized-role
  scenarios are manually verified.
- No high-severity authorization, persistence, or booking-integrity defect is
  open.
- Prisma mode is enabled only after staging/cutover verification.
