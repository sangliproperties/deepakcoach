# Validation and Merge Readiness

## Acceptance criteria

1. Restarting the application does not remove registered users, guest contacts,
   programs, availability, bookings, payments, or related records.
2. A newly registered customer can log in after an application restart.
3. A visitor can book the free Clarity Call with name, email, optional phone,
   and a future open slot without creating a password or session.
4. A guest cannot book a paid program, and the rejected request creates neither
   a booking nor a payment record.
5. Programs created or deactivated by an administrator persist after restart
   and inactive programs are not offered for new bookings.
6. Availability created or changed by an administrator persists after restart.
7. Two concurrent attempts to claim one slot cannot create duplicate active
   bookings; the losing request receives an explicit conflict.
8. Booking, payment, and notification records remain correctly linked after
   restart.
9. Expired and revoked sessions cannot authenticate.
10. No password hash, raw session token, card data, or payment secret is
    returned in API output.
11. Customer and administrator dashboards show persisted records subject to
    server-side authorization.

## Automated validation

### Unit tests

- Normalize email consistently and reuse a guest customer by normalized email.
- Hash and compare session tokens without storing raw values.
- Reject expired and revoked sessions.
- Filter inactive programs and unavailable or past slots.
- Validate booking and payment state transitions.
- Confirm authorization for customer, coach, and administrator operations.

### Integration and route tests

- Register, restart, and log in.
- Create a guest free booking and retrieve its confirmation.
- Reject a paid booking without authentication.
- Create an authenticated paid booking and linked payment record.
- Claim one slot concurrently from two requests.
- Exercise cancellation, rescheduling, pending, failed, and confirmed states
  supported by the current application.
- Verify payment callbacks or verification are server-side and idempotent.
- Perform administrator program and availability mutations.
- Preserve the response intent of the existing authentication, program,
  availability, booking, and payment routes.

### Database checks

- Apply the migration to an empty PostgreSQL database.
- Run the seed repeatedly without duplicate reference records.
- Verify foreign-key integrity and required indexes.
- Verify unique constraints for normalized email, program slug, booking
  reference, and payment booking identity.
- Confirm transaction behavior under concurrent slot claims.

### Repository quality checks

- Run the configured lint and formatting checks for changed files.
- Run strict TypeScript type-checking where configured.
- Run the production build.
- Run the repository's targeted route and integration tests.

## Manual scenarios

1. Start the application in Prisma mode, create a customer, create or seed a
   slot, and restart the application; confirm all records remain.
2. Use a signed-out browser to book the free Clarity Call and confirm the
   booking reference and next-step state.
3. Attempt the same guest flow for a paid program and confirm an explicit
   authentication error with no new records.
4. Use two browser sessions to submit the same slot concurrently and confirm
   exactly one booking succeeds.
5. Log in, revoke or expire the session, and confirm protected requests fail.
6. Run successful, failed, cancelled, retried, and duplicate payment
   verification scenarios and confirm no duplicate confirmation.
7. Attempt customer access to administrator operations and confirm server-side
   denial.
8. Submit incomplete and invalid forms and confirm readable, keyboard-usable,
   non-color-only error and status feedback.
9. Inspect representative API responses and logs to confirm secrets and
   sensitive hashes are absent.
10. Remove `DATABASE_URL` while `PERSISTENCE_MODE=prisma` is enabled and
    confirm the application fails clearly rather than silently using memory.

## Accessibility and security review

- Public and protected flows remain responsive on narrow and wide viewports.
- Forms have labels, focus states, useful validation messages, and status cues
  that do not rely on color alone.
- Every protected read and mutation checks authorization on the server.
- Input is validated at API or server-action boundaries.
- Prisma remains server-only and cannot enter client bundles.
- Cookies use HttpOnly, SameSite=Lax, explicit expiration, and Secure outside
  development.
- Passwords, raw session tokens, card data, and provider secrets are not
  persisted or exposed.

## Merge readiness

This feature is ready to merge only when:

- Every acceptance criterion is demonstrated or covered by an automated test.
- Targeted quality checks, migration checks, and seed checks pass.
- Prisma mode fails clearly without required configuration.
- Demo fallback is explicit and cannot activate silently in production.
- No high-severity authorization, booking-integrity, session-security, or
  persistence defect remains open.
- Existing user-facing behavior remains understandable and recoverable.
- The implementation is consistent with `specs/mission.md`,
  `specs/tech-stack.md`, `specs/roadmap.md`, and `specs/mvp/*`.
- The out-of-scope capabilities remain deferred unless separately specified.
