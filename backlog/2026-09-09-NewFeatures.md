# Roadmap Feature Expansion

**Date:** 2026-09-09  
**Area:** Customer operations, administration, and coaching lifecycle  
**Status:** Implemented on `main`; changes are currently uncommitted

## Research Summary

The MVP established the public coaching website, authentication, availability,
booking, and payment boundary. The next roadmap features needed to make the
platform useful after a booking were:

- A customer area for managing participation.
- Operational tools for administrators.
- A moderated review and testimonial workflow.
- Explicit notifications and recoverable booking states.
- Configurable cancellation and rescheduling rules.
- Data-model support for session access and operational records.

These features extend the core product journey:

**Discover -> Understand -> Choose -> Book -> Pay -> Attend -> Review -> Continue**

They also preserve the product principles from the mission and technology
constitution: trust before conversion, explicit states, secure role boundaries,
accessible workflows, and replaceable provider integrations.

## Implemented Features

### Customer dashboard

Added a customer dashboard to the account area with:

- Booking history and booking references.
- Program and scheduled-session information.
- Payment status visibility.
- Session access instructions and meeting links when available.
- Cancellation actions.
- Rescheduling to another available slot.
- Configurable booking-policy behavior.
- Customer notifications.
- Review submission for eligible confirmed bookings.

### Administration

Expanded the administrator console to provide operational visibility and
control for:

- Users and roles.
- Program active/inactive state.
- Availability slots.
- Bookings and booking status.
- Payments and payment status.
- Customer reviews.
- Testimonials and publication status.
- Cancellation and rescheduling policy.

Coach scheduling operations remain under the administrator role for now, as
defined by the MVP requirements.

### Reviews and testimonials

Added a review lifecycle:

1. A customer submits a review for a confirmed booking.
2. The review is stored as pending.
3. An administrator approves or rejects it.
4. Approved reviews can be displayed publicly.

Validation includes a rating range and minimum review text length. A customer
cannot submit multiple reviews for the same booking.

### Notifications

Added notification records and hooks for important lifecycle events:

- Booking created.
- Payment succeeded.
- Payment failed.
- Booking cancelled.
- Booking rescheduled.
- Review submitted.

The current implementation provides an operational notification feed. External
email, SMS, and WhatsApp delivery remain provider-boundary work for a later
deployment stage.

### Cancellation and rescheduling

Added configurable policy controls for:

- Whether cancellation is enabled.
- Minimum notice required before a session.
- Whether rescheduling is allowed.
- Maximum number of reschedules.

The rules are enforced by the booking API and surfaced through the customer
dashboard. Rescheduling preserves the booking identity while changing its
availability assignment and incrementing its reschedule count.

### Session access

Bookings now support:

- Access URL.
- Access instructions.
- Session lifecycle information for future video-provider integration.

These fields allow an administrator to provide meeting details without coupling
the booking domain to one video service.

## Data Model Changes

The Prisma schema was expanded with:

- `Review` and `ReviewStatus`.
- `Testimonial` and `TestimonialStatus`.
- `Notification` and `NotificationStatus`.
- `BusinessPolicy`.
- Booking cancellation, rescheduling, and access fields.
- User, booking, and program relations for the new workflows.

Migration added:

```text
prisma/migrations/0002_operations
```

The demo in-memory store was updated in parallel so the application remains
usable without a PostgreSQL instance.

## API Surfaces Added or Updated

- `GET /api/dashboard`
- `GET /api/notifications`
- `GET /api/reviews`
- `POST /api/reviews`
- `GET /api/admin/operations`
- `PATCH /api/admin/operations`
- `PATCH /api/bookings`

Existing booking and payment endpoints were extended to create notifications
and maintain the new lifecycle states.

## Validation Completed

- TypeScript type-check passed.
- ESLint passed without warnings or errors.
- Production build completed successfully.
- Prisma schema validation passed.
- Demo flows were exercised for:
  - Booking.
  - Customer dashboard.
  - Notifications.
  - Review submission.
  - Review moderation.
  - Public review publication.
  - Cancellation.
  - Rescheduling.

## Follow-up Backlog

- Replace the in-memory store with Prisma repositories for production.
- Add real session and account persistence.
- Connect email, SMS, and WhatsApp notification providers.
- Add verified Razorpay webhook handling for production payment events.
- Add refund processing and payment reconciliation.
- Add automated reminders before sessions.
- Add a dedicated coach role and coach-facing schedule management.
- Add richer testimonial editing and content management.
- Add audit logs for administrative changes.
- Add automated tests for concurrent booking and rescheduling conflicts.
- Add monitoring, error reporting, backups, and production deployment checks.
