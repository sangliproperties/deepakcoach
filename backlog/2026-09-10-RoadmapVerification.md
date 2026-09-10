# Roadmap Verification and Launch Gaps

**Date:** 2026-09-10  
**Area:** Roadmap review, authentication, administration, and launch readiness  
**Status:** Reviewed; demo-ready gaps implemented where no external service is
required

## Already Implemented

- Public homepage, About page, programs, contact, and YouTube sessions.
- Customer registration, login, logout, recovery guidance, and role-aware
  redirects.
- Customer account dashboard with booking, payment, notification, cancellation,
  rescheduling, and review flows.
- Administrator operations for users, programs, availability, bookings,
  payments, reviews, testimonials, policies, YouTube sessions, and stories.
- Server-side role checks for protected routes and mutation APIs.
- Demo payment signature verification boundary.

## Implemented in This Review

- Added a visible **Login** button to the desktop header for signed-out users.
- Added a separate registration destination through **Get started**.
- Added administrator content activity records for creation, updates, deletion,
  and publication-state changes.
- Added an **Activity log** section to the administrator console.
- Added deletion of administrator-created YouTube sessions.
- Added API support for updating YouTube sessions and testimonials.
- Kept content mutations administrator-only.
- Added a dedicated `COACH` role, coach login redirect, coach schedule route,
  and coach booking/availability API view.

## Still Blocked by External Infrastructure

These roadmap items should not be simulated as complete in the demo store:

- Prisma repository wiring and durable production account/content persistence.
- Verified Razorpay webhooks, refunds, and production reconciliation.
- Email, SMS, and WhatsApp provider delivery.
- Scheduled reminder workers and delivery retry handling.
- Production monitoring, error reporting, backups, secrets, and deployment
  procedures.

They require a configured PostgreSQL environment, payment credentials,
notification providers, a scheduler/worker runtime, and deployment
configuration.

## Recommended Next Production Slice

1. Move users, sessions, bookings, payments, notifications, testimonials,
   YouTube sessions, and audit logs to Prisma repositories.
2. Add migration-backed idempotency keys for payment events.
3. Add a queue-backed notification adapter and scheduled reminders.
4. Add integration tests for authorization, concurrent booking, duplicate
   payment events, and notification failures.
