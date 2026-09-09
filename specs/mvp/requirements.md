# MVP Requirements

## Scope

The MVP is the first usable release of the Deepak Khot Life Coaching and
Personal Development Platform. It must support the core path:

**Discover -> Understand -> Choose -> Register -> Book -> Pay (when required) -> Confirm**

The MVP serves:

- Website visitors evaluating Deepak Khot Sir and his offerings.
- Customers registering for free or paid one-to-one coaching sessions.
- Administrators operating the minimum availability, booking, and customer
  workflows.

It does not attempt to deliver the complete coaching business platform
described by the full roadmap.

## Included Capabilities

### Public experience

- Homepage and responsive navigation.
- Coach profile and professional introduction.
- Coaching philosophy, vision, and mission.
- Coaching services and fixed-duration package details.
- INR pricing where an offering is paid.
- Curated testimonials.
- Contact and enquiry entry points.

### Customer experience

- Customer registration and sign-in.
- Sign-out, password recovery, and basic profile information.
- View eligible offerings and available time slots.
- Book a free or paid one-to-one session.
- Receive a booking reference and clear confirmation or failure state.

### Administrator experience

- Protected administrator access.
- Manage the availability slots needed for MVP bookings.
- View and manage the minimum booking and payment states needed to resolve
  normal operations.
- Coach availability is administered through this role for the MVP; a separate
  coach role is not required yet.

### Payment experience

- India launch geography with INR as the currency.
- Razorpay is the payment provider for paid bookings.
- Payment creation occurs server-side.
- Payment success is accepted only after server-side verification.
- Duplicate callbacks or webhook events do not create duplicate confirmations.
- Card data is never stored by the platform.

## Decisions

| Area | MVP decision |
| --- | --- |
| Primary users | Website visitors, customers, and administrators |
| Launch geography | India |
| Currency | INR |
| Paid provider | Razorpay |
| Payment model | One-time payment per paid booking |
| Session model | Fixed-duration one-to-one packages |
| Free access | Enquiry and free-booking paths are supported |
| Roles | Customer and administrator; administrator handles coach operations |
| Content | Curated static content managed in code |
| Availability | Administrator-created fixed slots |
| Booking conflicts | Prevented by server-side transactional validation |
| Cancellation/rescheduling | Configurable policy; advanced self-service deferred |
| Notifications | Minimal hooks and clear in-app states; advanced orchestration deferred |
| Future providers | Payment and external services remain behind replaceable boundaries |

## Context and Constraints

- The mission requires trust, clarity, accessibility, and a human-centered
  coaching experience; the MVP must not use unsupported transformation claims.
- The technology constitution requires Next.js with TypeScript, PostgreSQL with
  Prisma, Tailwind CSS, role-based authorization, provider boundaries, and
  server-side payment verification.
- The MVP should prefer reliable, explicit states over broad feature coverage.
- Static content is intentional for the first release so the coach can validate
  messaging before a full content-management system is introduced.
- Payment confirmation must not depend only on a browser redirect or client-side
  success message.
- The MVP should collect only the personal data needed for account, booking,
  and support operations.

## Out of Scope

- Full customer dashboard for historical purchases and course access.
- Self-service subscriptions, refunds, or automated rescheduling.
- Full CMS, review moderation workflow, or revenue reporting.
- Dedicated coach role and coach-facing scheduling portal.
- SMS/WhatsApp reminder campaigns and complex notification retries.
- Video meeting provider integration.
- Corporate coaching, mobile applications, recommendations, and advanced
  analytics.
