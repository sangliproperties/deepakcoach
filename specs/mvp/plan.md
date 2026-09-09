# MVP Implementation Plan

The MVP is a small end-to-end slice of the roadmap. It prioritizes the path
from discovery to a trusted booking while keeping operational complexity
deliberately small.

## 1. Establish the Application Foundation

- Create the Next.js and TypeScript application structure.
- Configure Tailwind CSS, environment variables, formatting, and error
  handling.
- Configure PostgreSQL and Prisma with migrations.
- Define initial domain entities for users, roles, programs, packages,
  availability, bookings, and payments.
- Add shared layout, navigation, loading states, and accessible form
  conventions.

**Deliverable:** A deployable application shell with a working database
foundation.

## 2. Build the Public Brand Experience

- Build the homepage and primary navigation.
- Add Deepak Khot Sir's profile, coaching philosophy, vision, and mission.
- Add contact and enquiry entry points.
- Present the coaching journey and primary calls to action without unsupported
  claims.

**Deliverable:** A visitor can understand who the coach is and why the practice
exists.

## 3. Publish MVP Programs and Testimonials

- Add curated, code-managed content for coaching services, fixed-duration
  packages, workshops, and future course placeholders where useful.
- Show price in INR, duration, inclusions, eligibility, and relevant booking
  expectations.
- Add curated testimonials using a review-ready content shape.
- Link each eligible offering to its booking or enquiry action.

**Deliverable:** A visitor can compare the initial offerings and make an
informed choice.

## 4. Implement Customer Authentication

- Add customer registration, sign-in, sign-out, password recovery, and basic
  profile data.
- Add administrator access for the minimum content and booking operations
  needed by the MVP.
- Enforce protected routes and server-side authorization.
- Keep coach operations under the administrator role for this release.

**Deliverable:** Customers can securely begin a booking journey and protected
operations cannot be performed by unauthenticated users.

## 5. Implement Availability and Booking

- Allow administrators to define fixed-duration availability slots.
- Display available slots for eligible one-to-one packages.
- Let an authenticated customer create a booking for a free or paid offering.
- Use transactional checks to prevent conflicting bookings.
- Store explicit booking states, including pending, confirmed, cancelled, and
  failed where applicable.
- Keep cancellation and rescheduling rules configurable, without expanding
  them into a full self-service workflow in the MVP.

**Deliverable:** A customer can select an available time and create a
trackable booking.

## 6. Add the Razorpay Payment Boundary

- Create payments server-side for paid bookings in INR.
- Keep Razorpay credentials and configuration in environment variables.
- Verify Razorpay payment signatures or callbacks server-side.
- Make payment handling idempotent and update booking confirmation only after
  verified payment success.
- Record payment references and states without storing card information.
- Provide clear pending, success, failure, and retry states.

**Deliverable:** A paid customer can complete a verified Razorpay payment and
receive a confirmed booking; the payment integration remains isolated for
future provider support.

## 7. Connect the MVP Journeys

- Link public offering pages to authentication, booking, enquiry, and payment
  actions.
- Provide confirmation pages with the next steps and booking reference.
- Add minimum transactional email or notification hooks where the chosen
  provider is available; do not make advanced notification orchestration an MVP
  blocker.
- Surface recoverable errors instead of silently dropping booking or payment
  state.

**Deliverable:** The primary visitor, free-booking, and paid-booking journeys
work end to end.

## 8. Validate and Prepare the MVP Merge

- Add targeted tests for authorization, booking conflicts, booking states,
  payment verification, and webhook/callback idempotency.
- Check responsive behavior and accessibility for public, authentication,
  booking, and payment pages.
- Document required environment variables and local setup.
- Run the repository's targeted tests and production build.
- Review the diff against `specs/mission.md`, `specs/tech-stack.md`, and this
  MVP scope before merging.

**Deliverable:** The MVP is demonstrably usable, secure within its scope, and
ready for review.

## Deferred from MVP

- Full customer dashboard and purchased-course access.
- Advanced email, SMS, and WhatsApp notification workflows.
- Full content management and reporting administration.
- Refund automation, subscriptions, corporate coaching, and video-provider
  orchestration.
- Broad analytics, performance optimization, and production hardening beyond
  the checks required for the MVP merge.
