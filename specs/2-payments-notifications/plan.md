# Implementation Plan

## 1. Define payment and notification contracts

**Objective:** Establish provider-independent interfaces and domain state
transitions before wiring Razorpay or delivery vendors.

**Affected surfaces:**

- Payment provider types and adapter interface.
- Notification channel and delivery interfaces.
- Payment, webhook-event, notification, and audit domain types.
- State-transition and idempotency helpers.

**Dependencies:** Existing Prisma persistence boundary and payment models.

**Completion checks:**

- Contracts represent order creation, verification, webhook processing,
  notification delivery, retry, and reconciliation.
- Provider-specific payloads do not leak into booking logic.
- Legal payment and booking transitions are explicit.

## 2. Extend the payment and notification data model

**Objective:** Persist provider events and delivery attempts needed for
idempotency, retries, and operational investigation.

**Affected surfaces:**

- Prisma schema and migration.
- Payment provider references and event uniqueness.
- Notification channel, attempts, retry timing, and failure fields.
- Audit or operational event records.

**Dependencies:** Contract definitions and existing persistence schema.

**Completion checks:**

- Duplicate provider event identifiers cannot be processed twice.
- Payment, booking, webhook-event, and notification records remain linked.
- Sensitive card data and unnecessary secrets are not stored.
- Migration applies cleanly to an existing persisted database.

## 3. Implement the Razorpay adapter

**Objective:** Create server-side Razorpay order, signature, and webhook
verification behind the payment interface.

**Affected surfaces:**

- Razorpay adapter and environment configuration.
- Server-only order creation.
- Raw webhook body handling and signature verification.
- Provider event normalization.

**Dependencies:** Contracts, schema, and configured Razorpay credentials.

**Completion checks:**

- Amount and booking ownership are read from persisted server state.
- Missing configuration fails clearly rather than using demo secrets.
- Invalid signatures, malformed payloads, and replay candidates are rejected or
  safely recorded.
- Provider identifiers are normalized into application fields.

## 4. Add authorized checkout and verification routes

**Objective:** Let customers initiate or retry payment while preserving strict
  authorization and browser-redirect limitations.

**Affected surfaces:**

- Paid-order creation route.
- Checkout verification route.
- Existing booking and payment routes.
- Customer and administrator response shapes.

**Dependencies:** Razorpay adapter, persistence repositories, and session auth.

**Completion checks:**

- Customers can create orders only for their own pending paid booking.
- Guests and cross-customer requests are rejected before provider calls.
- Browser success does not confirm access by itself.
- Failed and cancelled payments expose explicit retryable states.

## 5. Implement idempotent webhook processing

**Objective:** Process verified Razorpay events atomically and make duplicate or
out-of-order delivery safe.

**Affected surfaces:**

- Webhook route.
- Webhook-event repository.
- Payment and booking transition service.
- Access-grant and confirmation logic.

**Dependencies:** Adapter, event schema, and checkout routes.

**Completion checks:**

- Verified success confirms payment and booking atomically.
- Duplicate events are safe and do not duplicate records or notifications.
- Late failures cannot regress a terminal paid booking.
- Invalid or unprocessable events remain observable without granting access.
- No access is available before verified payment success.

## 6. Implement notification adapters and delivery state

**Objective:** Persist and deliver required booking, payment, reminder,
cancellation, and operational notifications through replaceable channels.

**Affected surfaces:**

- Email, WhatsApp, and SMS adapter contracts.
- Notification repository and delivery worker or service.
- Retry and failure handling.
- In-app notification and administrator visibility.

**Dependencies:** Notification schema, payment/booking events, and provider
configuration.

**Completion checks:**

- Required event types create queued notifications.
- Successful delivery records sent state and attempt metadata.
- Provider failures record failed state and a recoverable retry path.
- Notification failure does not alter authoritative payment or booking state.
- Delivery attempts do not leak secrets or sensitive payment data.

## 7. Add reconciliation and operational controls

**Objective:** Give administrators safe visibility into payment events and
notification failures without creating an alternative source of truth.

**Affected surfaces:**

- Administrator payment and notification views.
- Event audit records.
- Explicit retry/reconciliation actions.
- Operational failure responses and logs.

**Dependencies:** Webhook and notification processing.

**Completion checks:**

- Administrators can inspect pending, paid, failed, cancelled, duplicate, and
  unprocessable states.
- Manual retry actions are authorized, auditable, bounded, and idempotent.
- Reconciliation cannot grant access without verified provider evidence.

## 8. Validate provider failures and release readiness

**Objective:** Prove the payment and notification slice is secure, accessible,
recoverable, and ready for deployment.

**Affected surfaces:**

- Unit, route, webhook, integration, and contract tests.
- Configuration and deployment documentation.
- Checkout, status, and administrator UX.

**Dependencies:** All previous implementation groups.

**Completion checks:**

- Success, failure, cancellation, timeout, retry, duplicate, out-of-order,
  invalid-signature, and notification-failure scenarios pass.
- Secrets and card data are protected from storage, logs, and responses.
- Typecheck, lint, build, migrations, and targeted tests pass.
- Production configuration, rollback, and reconciliation steps are documented.
