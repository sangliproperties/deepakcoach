# Public Complimentary Trial Booking

**Date:** 2026-09-13  
**Area:** Public navigation, authentication, booking, and guest contact capture  
**Status:** Implemented on the current working branch; changes are currently
uncommitted

## Research Summary

The booking flow previously required authentication at both the booking page
and `POST /api/bookings`. This prevented a first-time website visitor from
booking the free Clarity Call, even though the session is intended as a
complimentary trial conversation.

The desired visitor journey is:

**Visit website -> Book free trial -> Enter contact details -> Choose an open
time -> Receive booking confirmation**

Paid sessions should continue to require an authenticated account.

## Implemented Changes

### Public header action

Signed-out visitors now see:

- **Book free trial**, linking to `/book?program=clarity-call`.
- **Login**, retaining the existing account access path.

Signed-in users continue to see the existing account, role-specific links, and
booking action.

### Guest booking details

The booking page allows visitors to provide:

- Full name.
- Email address.
- Optional phone number.

The contact form is shown for the complimentary program and is submitted with
the selected program and availability slot.

### Booking API behavior

`POST /api/bookings` now supports an optional `guest` object for the free
program. The API:

- Validates the guest name, email, and optional phone number.
- Creates a customer record for a new guest contact.
- Reuses an existing customer record when the email already exists.
- Creates the free booking as confirmed.
- Rejects unauthenticated paid-session requests with HTTP 401.
- Preserves the existing slot conflict protection.

### Data and deployment notes

The current application uses the in-memory demo store. Guest contacts and
bookings are therefore lost when the process restarts.

Production persistence should store guest/customer contacts, booking consent,
and communication preferences in PostgreSQL through the Prisma data layer.
Production should also add email verification or abuse controls before exposing
the free booking endpoint publicly.

## Updated Files

- `src/app/layout.tsx`
- `src/app/book/page.tsx`
- `src/app/api/bookings/route.ts`
- `src/lib/demo-store.ts`

## Validation

- ESLint passed after the changes.
- The public booking path and paid-session authentication path were reviewed
  against the existing API behavior.
- A production build was attempted, but the Windows `.next` build process
  stalled on a file lock and was stopped; no application compilation error was
  reported before the process stalled.

## Recommended Follow-up

1. Persist guest/customer records and bookings through Prisma.
2. Add rate limiting and CAPTCHA or email verification for free bookings.
3. Send confirmation and reminder notifications through a configured provider.
4. Add automated tests for guest booking, duplicate email reuse, paid-session
   authorization, and concurrent slot claims.
