# How to Run Deepak Coach MVP

This guide helps a new developer install, run, and validate the Deepak Khot
Life Coaching Platform locally.

## Prerequisites

- Node.js 18.17 or newer
- npm
- Git

PostgreSQL is required for the production persistence setup. The current MVP
can run in demo mode without a local PostgreSQL server.

## 1. Get the code

```powershell
git clone <repository-url>
cd deepakcoach
git switch mvp
```

If the repository is already available locally:

```powershell
git switch mvp
```

## 2. Install dependencies

```powershell
npm install
```

## 3. Configure environment variables

Copy the example environment file:

```powershell
Copy-Item .env.example .env.local
```

The default demo configuration is suitable for local development:

```text
NEXT_PUBLIC_DEMO_MODE="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Do not commit `.env.local` or any real credentials.

## 4. Start the development server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The development server normally reloads automatically after source changes.
Stop it with `Ctrl+C`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | `hello@example.com` | `Demo@123` |
| Administrator | `admin@deepakcoach.local` | `Admin@123` |

Use the customer account to test booking. Use the administrator account to
manage availability and inspect bookings at `/admin`.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Public homepage |
| `/programs` | Coaching programs |
| `/programs/clarity-call` | Program detail |
| `/auth` | Registration and sign-in |
| `/book` | Availability and booking |
| `/account` | Customer account |
| `/admin` | Administrator console |
| `/contact` | Enquiry and contact page |

## Payment demo flow

In demo mode:

1. Sign in as a customer.
2. Open `/book`.
3. Select the paid `Focused Growth Session`.
4. Select an available time.
5. Continue to payment.
6. Select **Simulate successful payment** or **Simulate failed payment**.

The demo payment provider verifies the fixed demo signature without contacting
Razorpay. Production payment verification must use real Razorpay credentials
and server-side signature validation.

## Database setup

The Prisma schema is located at `prisma/schema.prisma`, with the initial
migration in `prisma/migrations/0001_init`.

For a PostgreSQL-backed environment:

1. Set `DATABASE_URL` in `.env.local`.
2. Generate the Prisma client:

```powershell
npx prisma generate
```

3. Apply migrations:

```powershell
npx prisma migrate deploy
```

The current demo application uses an in-memory store for local MVP flows.
Connecting PostgreSQL requires replacing the demo-store persistence layer with
the Prisma repositories while preserving the existing domain and provider
boundaries.

## Useful commands

```powershell
npm run dev
npm run typecheck
npm run lint
npm run build
npm run start
```

Run `npm run build` before opening a pull request. A successful build confirms
that the production bundle compiles and the routes can be generated.

## Project structure

```text
src/app/           Next.js pages and API routes
src/components/    Reusable client components
src/lib/           Catalog, auth, demo store, payment, and shared types
prisma/            PostgreSQL schema and migrations
specs/             Product constitution and MVP specifications
public/            Static assets
```

## Development notes

- Keep protected operations authorized on the server, not only in the UI.
- Do not store card details or commit secrets.
- Preserve explicit booking and payment states.
- Keep booking conflict checks transactional when moving to PostgreSQL.
- Keep payment and external-service integrations behind replaceable provider
  boundaries.
- Refer to `specs/mission.md`, `specs/tech-stack.md`, and `specs/mvp/` before
  changing MVP behavior.
