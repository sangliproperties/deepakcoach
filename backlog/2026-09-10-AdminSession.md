# Unified Admin Content Management

**Date:** 2026-09-10  
**Area:** Administration, YouTube sessions, stories, and content operations  
**Status:** Implemented on the current working branch; changes are currently
uncommitted

## Research Summary

The application already had one `ADMIN` role and an administrator console for
users, programs, availability, bookings, payments, reviews, testimonials, and
policies. However, YouTube sessions were hard-coded in `src/lib/media.ts`, and
new stories could not be entered through the application.

The required direction is to keep one unified administrator role for managing
new content across the public website:

**Admin sign-in -> Add content -> Review or publish -> Display publicly**

This preserves the existing role boundary while making the content surfaces
usable without editing source files.

## Implemented Changes

### Unified administrator access

- Reused the existing `ADMIN` role rather than introducing a separate content
  role.
- Kept `/admin`, `/api/admin/operations`, and availability mutations protected
  by administrator checks.
- Preserved customer access as the default for newly registered users.
- Retained the existing user-role management action for granting or removing
  administrator access.

### YouTube session management

- Added a typed `YouTubeSession` content record with:
  - Stable ID.
  - Title.
  - Description.
  - Category.
  - Duration label.
  - Optional YouTube video ID.
- Seeded the in-memory store from the existing placeholder sessions.
- Added an administrator form for creating new YouTube sessions.
- Added `POST /api/admin/operations` support for new YouTube sessions.
- Updated the homepage and `/sessions` page to read sessions from the shared
  store instead of directly from the hard-coded media module.
- Kept support for real YouTube embeds when a video ID is supplied.

### Story and testimonial management

- Added an administrator form for creating new stories/testimonials.
- New stories are created as `DRAFT` records.
- Added them to the existing testimonial moderation workflow so an
  administrator can publish, archive, or retain them as drafts.
- Published stories continue to appear in the homepage stories section.

### Administrator console

- Added a new **Content** section to the administrator dashboard.
- The section lists existing YouTube sessions.
- It provides separate forms for YouTube sessions and stories.
- It reuses the existing success and error feedback patterns.

## API Surfaces

Updated:

- `GET /api/admin/operations`
  - Now returns `youtubeSessions` in addition to existing operational data.
- `POST /api/admin/operations`
  - Creates a YouTube session or draft testimonial.

Existing moderation remains available through:

- `PATCH /api/admin/operations`
  - Publishes, archives, or drafts testimonials.

## Data and Deployment Notes

The current implementation uses the demo in-memory store. Content added
through the administrator console is therefore suitable for the demo runtime
but is not durable across process restarts or deployments.

For production, the same content contract should be backed by database
repositories and migrations. YouTube sessions and testimonials should have
created/updated timestamps, publication state, ordering, and audit metadata.

## Validation Completed

- TypeScript type-check passed.
- Diff whitespace validation passed.
- Production build was attempted but was blocked by a local Windows
  `EPERM` error while Next.js attempted to open `.next/trace`.

## Follow-up Backlog

- Add Prisma models and migrations for YouTube sessions and testimonials.
- Replace demo-store content mutations with durable repository operations.
- Add edit and delete actions for YouTube sessions and stories.
- Add ordering and featured-content controls.
- Validate YouTube video IDs and optionally fetch approved thumbnails.
- Add draft, published, and archived filters to the content console.
- Add audit logs for administrator content changes.
- Add automated tests for administrator authorization and content lifecycle.
- Replace the placeholder YouTube channel URL with the official channel URL.
