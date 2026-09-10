# Administrator Program Creation

**Date:** 2026-09-10  
**Area:** Administration, program catalog, booking, and public content  
**Status:** Implemented on the current working branch; changes are currently
uncommitted

## Research Summary

The platform had a fixed program catalog in `src/lib/catalog.ts`. Administrators
could activate or deactivate existing programs, but they could not create a new
program from the administrator console.

The required workflow is:

**Admin sign-in -> Create program -> Publish/activate -> Display publicly ->
Accept bookings**

The implementation keeps the existing single administrator role and extends
the shared demo store so a newly created program is available across public
pages and booking flows.

## Implemented Changes

### Administrator program form

Added a program creation form to:

`/admin` -> **Programs**

The form collects:

- URL slug.
- Program title.
- Tagline.
- Duration in minutes.
- Price in INR.
- Delivery format.
- Description.
- Inclusions, one per line.
- Eligibility or ideal participant.
- Booking expectations.

The form preserves its values when creation fails, allowing an administrator
to correct validation errors or a duplicate slug without re-entering the
content.

### Program creation API

Extended `POST /api/admin/operations` with `contentType: "program"`.

The API:

- Requires an authenticated administrator.
- Validates the slug format.
- Validates title, copy, duration, price, and program details.
- Rejects duplicate program IDs or slugs with a conflict response.
- Creates the program as active and bookable.
- Records a `CREATE` activity entry for the program.

### Shared catalog and public pages

The demo store now maintains programs in a shared map initialized from the
original catalog. New programs are available to:

- Homepage program cards.
- `/programs`.
- `/programs/<slug>`.
- `GET /api/programs`.
- Booking validation.
- The booking program selector.
- Booking confirmation and booking detail program lookups.

Existing program activation/deactivation controls continue to work for both
seeded and newly created programs.

## Data and Deployment Notes

The current implementation stores newly created programs in the in-memory demo
store. They are lost when the process restarts.

Production persistence should move program records and active state to Prisma
repositories backed by PostgreSQL. The production model should also support
created/updated timestamps, ordering, featured state, publication status, and
audit metadata.

## API Surfaces

Updated:

- `POST /api/admin/operations`
- `GET /api/admin/operations`
- `POST /api/bookings`

Added:

- `GET /api/programs`

## Validation Completed

- TypeScript type-check passed.
- Diff whitespace validation passed.
- Duplicate slug handling was implemented.
- Failed submissions retain the administrator form values.

## Follow-up Backlog

- Add Prisma persistence and a migration for administrator-created programs.
- Add edit and delete actions for programs.
- Add ordering and featured-program controls.
- Add draft and published program states.
- Add program-specific availability rules and package/session counts.
- Add automated tests for authorization, validation, duplicate slugs, and
  booking newly created programs.
- Add audit-log persistence in the production database.
