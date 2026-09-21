# Validation and Merge Readiness

## Acceptance criteria

1. An authenticated customer can start checkout for their own pending paid
   booking using a server-created Razorpay order.
2. Order amount, currency, booking ownership, and payment status come from
   persisted server state rather than trusted client input.
3. A browser redirect or client success response alone never confirms payment,
   booking, or purchased access.
4. Only a verified Razorpay webhook event can confirm payment and transition the
   booking to confirmed.
5. Duplicate provider events are idempotent and do not create duplicate
   confirmations, access grants, payment records, or notifications.
6. Out-of-order events cannot regress a terminal successful payment or confirmed
   booking to failure or cancellation.
7. Invalid signatures, malformed events, replay candidates, and unknown
   bookings do not grant access and remain observable for operations.
8. Failed, cancelled, pending, and timeout states are explicit and provide a
   safe retry path where permitted.
9. Guests cannot create paid orders or verify payments for paid bookings.
10. Customers cannot inspect or mutate another customer's payment or booking.
11. Purchased access is withheld until verified payment success.
12. Booking, payment, provider-event, notification, and operational records
    remain linked and durable.
13. Required booking, payment, reminder, cancellation, and operational
    notifications enter an explicit queued, sent, or failed state.
14. Notification delivery failure does not alter authoritative booking or
    payment state and exposes an explicit retry or recovery path.
15. Administrators can inspect and reconcile payment and notification failures
    without bypassing provider verification.

## Automated validation

### Unit and contract tests

- Build a Razorpay order from persisted booking amount and ownership.
- Verify valid and invalid checkout signatures.
- Verify valid, malformed, replayed, and invalid-signature webhook payloads.
- Normalize provider event identifiers and reject duplicate identities.
- Validate legal payment and booking state transitions.
- Confirm terminal paid states cannot regress from late failure events.
- Test notification adapter contracts, attempt tracking, and retry eligibility.
- Confirm no purchased access exists before verified payment success.

### Route and integration tests

- Authorized customer creates an order for their own pending booking.
- Guest, unauthenticated, and cross-customer order attempts are rejected.
- Checkout abandonment leaves a recoverable pending state.
- Verified success confirms payment and booking atomically.
- Failed, cancelled, and timed-out payments remain explicit and retryable.
- Duplicate success, duplicate failure, and duplicate webhook events are safe.
- Out-of-order success/failure events preserve the correct terminal state.
- Administrator inspection and reconciliation actions enforce role checks.
- Notification success, provider timeout, retry, and permanent failure are
  persisted without changing payment truth.

### Database and migration checks

- Apply the migration to an empty and an existing development database.
- Verify unique provider event identifiers and linked payment/booking records.
- Confirm notification attempts and retry metadata persist across restart.
- Verify re-running migrations or seed/reference setup does not duplicate
  provider or notification records.
- Confirm transactional webhook processing does not partially update state.

### Repository quality checks

- Run configured lint and formatting checks.
- Run strict TypeScript type-checking where configured.
- Run the production build.
- Run targeted payment, webhook, notification, authorization, and route tests.

## Manual scenarios

1. Run a successful Razorpay test payment and verify that confirmation and
   access appear only after the verified event.
2. Close or abandon checkout and confirm the booking remains pending with a
   clear retry path.
3. Submit a failed and cancelled payment and confirm explicit status, no
   access, and safe retry behavior.
4. Delay or time out the provider response and confirm persisted state is not
   lost or incorrectly confirmed.
5. Send an invalid-signature webhook and confirm no state mutation or access
   grant.
6. Send the same success webhook repeatedly and confirm one payment transition,
   one booking confirmation, and no duplicate notification.
7. Send success and failure events out of order and confirm a paid booking
   cannot regress.
8. Trigger a notification provider failure, inspect the failed state, and
   perform an authorized retry.
9. Attempt guest checkout, cross-customer access, and unauthorized
   administrator actions.
10. Inspect logs, responses, and persisted records to confirm card data,
    secrets, raw tokens, and unnecessary sensitive payloads are absent.
11. Use keyboard navigation and narrow viewports to review checkout, pending,
    success, failure, retry, and administrator status experiences.

## Security and operational review

- Razorpay keys, webhook secrets, notification credentials, and signing data
  are environment-only.
- Raw webhook signatures and payloads are handled safely; signature validation
  occurs before trusting event fields.
- Replay, duplicate, malformed, and unknown events are rejected or recorded
  without granting access.
- Sensitive payment data is absent from logs, API responses, and client bundles.
- Provider outages and notification failures produce auditable, recoverable
  states rather than silent loss.
- Server-side authorization protects every payment, webhook, notification, and
  reconciliation operation.
- Statuses and errors are readable, keyboard-accessible, and not conveyed by
  color alone.

## Merge readiness

The feature is ready to merge only when:

- Every acceptance criterion is demonstrated or covered by automated tests.
- Webhook verification, idempotency, and state-transition tests pass without
  high-severity defects.
- Failed, cancelled, duplicate, out-of-order, and notification-failure paths
  are recoverable and observable.
- No card data, provider secret, raw token, or unnecessary sensitive payload is
  stored, logged, or returned.
- Payment and notification provider boundaries are documented and replaceable.
- Production configuration, rollback, reconciliation, and retry procedures are
  documented.
- Migrations, typecheck, lint, build, and targeted integration checks pass.
- The implementation remains consistent with `specs/mission.md`,
  `specs/tech-stack.md`, `specs/roadmap.md`, and the persistence feature.
