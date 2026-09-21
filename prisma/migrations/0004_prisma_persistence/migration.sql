-- Durable authentication, guest identity, program metadata, slot claims, and sessions.
ALTER TABLE "User"
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "registeredAt" TIMESTAMP(3);

ALTER TABLE "Program"
  ADD COLUMN "tagline" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "format" TEXT NOT NULL DEFAULT 'Online, one-to-one',
  ADD COLUMN "inclusions" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "eligibility" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "expectations" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Availability"
  ADD COLUMN "claimedAt" TIMESTAMP(3),
  ADD COLUMN "unavailableAt" TIMESTAMP(3);

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_rescheduledFromId_fkey"
  FOREIGN KEY ("rescheduledFromId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
CREATE INDEX "Session_expiresAt_revokedAt_idx" ON "Session"("expiresAt", "revokedAt");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");
CREATE INDEX "Booking_userId_status_createdAt_idx" ON "Booking"("userId", "status", "createdAt");
CREATE INDEX "Booking_programId_status_idx" ON "Booking"("programId", "status");
