# Payments and Notifications

## Context

The persistence slice now keeps bookings and payment records durable, but the
current payment flow still relies on a demo provider and browser-driven
confirmation. Phase 6 must establish a trustworthy payment boundary and clear
follow-up communication for the journey from **Book** to **Pay** and **Attend**.

The feature must follow the mission's principles of trust, clarity, security,
and operational reliability. Razorpay webhooks are the source of truth for
payment status. Notification delivery is important but must not override the
authoritative booking and payment state.

## Goal

Allow an authenticated customer to begin a paid booking, complete Razorpay
checkout, and receive confirmation only after a verified Razorpay event. Persist
payment and notification state so duplicate events, provider failures, retries,
and operational reconciliation are explicit and recoverable.

## Users and operators

- **Customers:** Start checkout for their own pending paid bookings, understand
  payment status, and receive booking, payment, reminder, and cancellation
  communication.
- **Administrators:** Inspect and reconcile payment and notification states,
  retry recoverable delivery failures, and investigate operational failures.
- **Coaching team:** Receive the operational visibility needed to act on
  confirmed bookings and failed communication.

## Scope

### In scope

- Server-side Razorpay order creation for pending paid bookings.
- Razorpay payment signature and webhook verification.
- Persisted provider order, payment, and event references.
- Idempotent and replay-safe webhook handling.
- Explicit payment and booking state transitions for success, failure,
  cancellation, pending, and retryable conditions.
- Authorization for customer checkout and administrator reconciliation.
- Payment and notification provider interfaces.
- Email, WhatsApp, and SMS notification adapter contracts; only configured
  providers need to be deployed initially.
- Queued, sent, and failed notification states with explicit retry behavior.
- Booking confirmation, payment success/failure, reminder, cancellation, and
  operational-failure notifications.
- User-facing status and recovery paths that remain clear when providers fail.
- A Stripe-compatible payment boundary for future expansion.

### Out of scope

- Subscriptions, recurring billing, or installment payments.
- Automated refunds or refund policy expansion.
- Production deployment of multiple payment providers.
- Full notification campaign management or marketing automation.
- Advanced analytics and revenue reporting.
- Mandatory WhatsApp or SMS vendor rollout in the first deployment.
- Unrelated UI redesign.

## Payment behavior

### Checkout and order creation

- Only an authenticated customer may begin payment for their own pending paid
  booking.
- Guests cannot pay for paid programs.
- The server creates the Razorpay order using the persisted booking and payment
  amount; client-provided amount and ownership values are not trusted.
- The payment record stores provider, order reference, amount, and explicit
  status. Card data and provider secrets are never stored.
- Browser checkout success or redirect is not sufficient to confirm a booking.
- A customer may retry a failed, cancelled, or otherwise retryable payment
  without creating duplicate bookings or ambiguous payment records.

### Verification and webhook authority

- Razorpay webhook events are the payment source of truth.
- Verify the webhook signature against the raw request payload and an
  environment-provided webhook secret before parsing or mutating state.
- Verify checkout signatures server-side when the application exposes a
  client-return verification endpoint, but do not treat that endpoint alone as
  final confirmation.
- Persist a provider event identifier, order identifier, payment identifier,
  event type, received time, and processing outcome.
- Reprocessing an already-successful event is safe and does not create a second
  confirmation, notification, or access grant.
- Out-of-order events must not regress a terminal successful payment to a
  failure or cancellation state.
- Invalid, malformed, expired, or replayed events are rejected or recorded as
  rejected without mutating booking access.
- A duplicate event may receive a safe success response after its prior result
  is known, while an unprocessable event must remain observable for operations.

### State transitions

Persist explicit states and legal transitions:

- Payment: `CREATED` -> `PENDING` -> `PAID`.
- Payment failure or cancellation may produce `FAILED` or `CANCELLED` with a
  retryable path where business policy allows.
- Booking remains `PENDING` until verified payment success, then becomes
  `CONFIRMED`.
- Verified payment failure or cancellation makes the booking state explicit and
  must not grant purchased access.
- A terminal `PAID` payment and confirmed booking cannot be regressed by a late
  failure event.
- Access URL and access instructions are available only after confirmed
  payment, subject to the existing booking access rules.

Payment event processing and booking confirmation must be atomic. A payment
event that cannot be safely applied must not partially grant access or silently
discard the booking.

## Authorization

- Customers may create or retry orders only for their own pending paid booking.
- Customers may read their own payment and notification status.
- Administrators may inspect all payment and notification records and perform
  explicitly supported reconciliation or retry operations.
- Unauthenticated users and guests cannot create paid orders, verify payment for
  another user, or access payment records.
- Server-side authorization is required even when the UI hides an action.

## Notification behavior

### Required event types

- Booking created and awaiting payment.
- Payment succeeded and booking confirmed.
- Payment failed, cancelled, or requires retry.
- Booking reminder.
- Booking cancelled or rescheduled.
- Operational payment or notification failure for administrators.

### Delivery contract

Each provider adapter must expose a replaceable contract for creating and
delivering a notification without coupling booking logic to a vendor. The
application persists:

- Recipient and channel.
- Notification type and related booking/payment identifiers.
- Queued, sent, or failed status.
- Attempt count, last attempt time, and safe failure reason.
- Next retry time where retryable.

Notification failure must not change an already authoritative booking or
payment state. In-app status remains the fallback communication path. Retries
must be explicit, bounded, auditable, and safe to repeat.

## Provider boundaries

- Implement a Razorpay adapter behind a payment interface.
- Preserve a Stripe-compatible payment interface without requiring Stripe in
  this release.
- Define notification interfaces for email, WhatsApp, and SMS.
- Keep credentials, webhook secrets, and provider configuration in environment
  variables.
- Keep raw webhook verification and provider-specific payload mapping inside the
  adapter or server-side integration boundary.
- Leave exact notification vendors, queue/worker technology, reminder
  scheduling, webhook hosting, reconciliation UI depth, and future Stripe
  implementation open when contracts and failure semantics are explicit.

## Data requirements

Extend the persisted model as needed to support:

- Payment provider order and payment identifiers.
- Provider webhook/event identifier with a unique constraint for idempotency.
- Event type, raw-payload handling policy, received/processed timestamps, and
  processing outcome.
- Notification channel, attempts, failure reason, and retry scheduling.
- Audit records for administrator reconciliation and manual retry actions.

Do not store card details or unnecessary raw payment payloads. If payload
retention is required for reconciliation, minimize and protect the stored
fields.

## Security and reliability requirements

- Validate all order, verification, webhook, and retry inputs at server
  boundaries.
- Read webhook secrets only from environment configuration.
- Verify signatures before trusting event fields.
- Protect against replay, duplicate processing, and event-order regressions.
- Do not log card data, secrets, raw tokens, or unnecessary personal data.
- Apply provider timeout and failure handling without losing persisted state.
- Keep payment and notification errors explicit, auditable, and recoverable.
- Maintain accessible, readable status feedback with non-color-only states.

## Non-goals and deferred decisions

The exact notification vendors, queue/worker implementation, reminder
scheduler, production webhook host, reconciliation screen depth, and Stripe
adapter implementation may be selected during implementation. These choices
must preserve server-side verification, explicit state transitions,
idempotency, provider replacement, and secure handling of payment data.
