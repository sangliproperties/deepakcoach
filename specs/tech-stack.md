# Technology Stack

## Stack Decision

Build the platform as a modern TypeScript web application with a server-side
capable Next.js foundation, PostgreSQL persistence, and provider-based
integrations for payments, notifications, and online sessions.

## Core Technologies

| Area | Decision | Rationale |
| --- | --- | --- |
| Application | Next.js with TypeScript | Supports public content, authenticated customer areas, server-side operations, and a scalable full-stack structure. |
| UI | React with Tailwind CSS | Enables reusable, responsive, accessible interfaces with consistent design tokens. |
| Database | PostgreSQL | Reliable relational storage for users, roles, programs, schedules, bookings, payments, reviews, and audit data. |
| ORM and migrations | Prisma | Provides typed database access, explicit schema evolution, and productive relational modeling. |
| Authentication | Secure role-based authentication | Supports visitors, customers, coach, administrators, and content managers with least-privilege access. |
| Payments | Razorpay first; Stripe-compatible boundary | Fits an India-focused launch while preserving an option for broader payment coverage. |
| Notifications | Provider-based email, WhatsApp, and SMS integrations | Keeps booking and payment communication replaceable and testable. |
| Video sessions | Provider-based meeting integration | Avoids coupling the core product to one meeting vendor. |
| File storage | Object storage behind an application boundary | Supports coach images, program media, and future course assets without coupling to local disk. |
| Deployment | Managed hosting for the web app and managed PostgreSQL | Reduces operational burden and supports staged environments and backups. |

## Architectural Boundaries

- Keep public marketing pages, customer workflows, and administrative
  operations separated by route and authorization boundaries.
- Keep payment creation, webhook verification, refunds, and reconciliation in a
  server-side module.
- Treat payment webhooks as the source of truth for payment status; do not
  grant access solely from a client-side success screen.
- Keep notification and video providers behind interfaces so they can be
  replaced without changing booking domain logic.
- Model booking, payment, enrollment, and attendance states explicitly rather
  than inferring them from missing data.
- Keep secrets and provider credentials in environment configuration; never
  commit them to source control.

## Data and Security Standards

- Use PostgreSQL constraints and transactions for booking and payment
  consistency.
- Validate all external input at API and server-action boundaries.
- Enforce authorization on the server for every protected operation.
- Store only the personal data required for the service.
- Do not store sensitive payment-card information.
- Verify webhook signatures and make webhook handling idempotent.
- Record operational events needed to investigate booking and payment issues.
- Apply secure session handling, CSRF protection where applicable, rate
  limiting, and secure headers.
- Provide account, consent, privacy, cancellation, and refund flows appropriate
  to the final business policy.

## Quality and Delivery Standards

- Use strict TypeScript and shared domain types.
- Prefer reusable components and validated form schemas over duplicated logic.
- Add targeted unit and integration tests around booking, authorization,
  payment state, and webhook behavior.
- Verify responsive behavior and accessibility for all public and customer
  journeys.
- Use separate development, staging, and production configuration.
- Keep migrations reviewable and backwards-compatible where practical.

## Deferred Decisions

The exact authentication library, hosting vendor, notification vendors, video
provider, object-storage provider, analytics, and content-management approach
may be selected during implementation. Each choice must preserve the
architectural boundaries and security standards above.
