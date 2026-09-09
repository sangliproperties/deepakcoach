# MVP Validation

The MVP can be merged only when the implementation satisfies the acceptance
criteria below and the repository's available quality checks pass.

## End-to-End Acceptance Criteria

1. A visitor can open the site on a mobile or desktop viewport, understand
   Deepak Khot Sir's practice, and find the coaching philosophy, vision,
   mission, offerings, testimonials, and contact path.
2. A visitor can inspect an offering's duration, price in INR when applicable,
   inclusions, eligibility, and booking expectations before starting checkout.
3. A new customer can register, sign in, sign out, recover access, and maintain
   the minimum profile information required for a booking.
4. An administrator can create or manage an available fixed-duration slot and
   view the resulting booking state.
5. An authenticated customer can book an eligible free offering and receive a
   booking reference with a clear confirmation state.
6. An authenticated customer can start a paid booking, complete the Razorpay
   flow in a configured environment, and receive confirmation only after
   server-side payment verification.
7. Failed, cancelled, pending, and duplicate payment callbacks result in
   explicit, recoverable states and never create duplicate confirmed bookings.
8. Two customers cannot successfully claim the same slot, including when their
   requests arrive concurrently.
9. Unauthenticated users cannot access protected customer or administrator
   operations, and customers cannot perform administrator actions.
10. Public and protected journeys are responsive, keyboard usable, readable,
    and provide labels, focus states, validation messages, and non-color-only
    status cues.
11. Required setup, environment variables, payment test-mode behavior, and
    known MVP limitations are documented.

## Technical Checks

- TypeScript type-checking passes with strict settings where configured.
- Targeted tests cover:
  - role-based authorization;
  - registration and protected booking actions;
  - booking conflict prevention;
  - booking state transitions;
  - Razorpay signature or callback verification;
  - duplicate callback/webhook idempotency;
  - payment failure and retry handling.
- The project's configured lint and formatting checks pass for changed files.
- The production build completes successfully.
- Database migrations apply cleanly to a fresh development database.
- No secrets, payment credentials, card data, or private customer data are
  committed to source control.

## Manual Review Scenarios

- Browse the full public journey on a narrow mobile viewport.
- Complete a free booking using a newly registered customer.
- Attempt to book an already claimed slot from two customer sessions.
- Run a successful Razorpay test payment.
- Run failed, cancelled, and repeated Razorpay callback scenarios.
- Attempt customer access to administrator routes and administrator access with
  invalid credentials.
- Submit invalid and incomplete forms and confirm useful, accessible errors.
- Confirm that a payment or notification provider failure does not silently
  lose the booking state.

## Merge Readiness

The MVP is ready to merge when:

- All end-to-end acceptance criteria are demonstrated or covered by automated
  tests.
- Technical checks pass in the repository's supported environment.
- No high-severity authorization, booking-integrity, or payment-verification
  defect remains open.
- The implementation is consistent with `specs/mission.md`,
  `specs/tech-stack.md`, and `specs/mvp/plan.md`.
- Deferred roadmap capabilities remain out of the MVP unless explicitly
  documented as a scope change.
