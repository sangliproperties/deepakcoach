# Roadmap

The roadmap delivers small, demonstrable vertical slices. Each phase should
leave the system in a usable state and should be validated before the next
phase begins.

## Phase 1: Foundation

- Establish the Next.js and TypeScript application structure.
- Configure Tailwind CSS, formatting, environment configuration, and database
  connectivity.
- Define the initial Prisma schema and migration workflow.
- Add shared layout, navigation, error handling, and basic accessibility
  conventions.

**Outcome:** A deployable application shell with a reliable development
foundation.

## Phase 2: Brand and Public Experience

- Build the homepage and core navigation.
- Add Deepak Khot Sir's profile, coaching philosophy, vision, and mission.
- Add contact and enquiry entry points.
- Establish the visual language for trust, personal growth, professionalism,
  and transformation.

**Outcome:** Visitors can understand the coach and the purpose of the practice.

## Phase 3: Programs and Social Proof

- Add coaching services, session packages, workshops, and course/program
  detail pages.
- Add pricing, duration, inclusions, eligibility, and relevant policies.
- Add testimonials and review presentation with moderation-ready data models.

**Outcome:** Visitors can compare offerings and build confidence before booking.

## Phase 4: Authentication and Customer Accounts

- Add registration, sign-in, sign-out, password recovery, and profile
  management.
- Establish roles for customer, coach, administrator, and content manager.
- Add server-side authorization for protected routes and actions.

**Outcome:** Customers have secure accounts and the platform has a clear access
model.

## Phase 5: Availability and Booking

- Add coach availability, session slots, booking creation, and booking status.
- Prevent conflicting bookings with transactional checks.
- Add cancellation and rescheduling rules as business policy becomes final.

**Outcome:** A customer can select an available slot and create a trackable
booking.

## Phase 6: Payments and Notifications

- Integrate Razorpay through a server-side payment boundary.
- Preserve a Stripe-compatible integration boundary for future expansion.
- Verify webhooks and make payment updates idempotent.
- Send booking, payment, reminder, cancellation, and failure notifications
  through provider adapters.

**Outcome:** Paid bookings are confirmed from verified payment events and users
receive clear next steps.

## Phase 7: Customer Access

- Add a customer dashboard for upcoming and past bookings.
- Show purchased sessions, courses, workshops, payment records, and relevant
  access instructions.
- Add post-session review submission and status visibility.

**Outcome:** Customers can manage their participation after purchase.

## Phase 8: Administration and Content Operations

- Add dashboards for users, programs, packages, schedules, bookings, payments,
  reviews, testimonials, and content.
- Add moderation, operational status changes, and audit-friendly activity
  records.
- Add coach-facing views for availability and customer context.

**Outcome:** The coaching team can operate the business without relying on
  manual data changes.

## Phase 9: Hardening and Launch

- Complete targeted unit, integration, accessibility, security, and
  performance validation.
- Test payment callbacks, notification failures, duplicate events, booking
  conflicts, and permission boundaries.
- Configure backups, monitoring, error reporting, production secrets, and
  deployment procedures.
- Run user acceptance testing with representative visitor, customer, coach, and
  administrator journeys.

**Outcome:** A monitored, secure, production-ready coaching platform.

## Delivery Rule

Do not begin a later phase merely because its screens can be mocked. A phase is
complete only when its core workflow is wired end-to-end, its permissions and
failure states are addressed, and its user-facing behavior is understandable.
