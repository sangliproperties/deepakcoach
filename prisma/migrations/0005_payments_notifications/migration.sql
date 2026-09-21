-- Provider events, notification delivery metadata, and operational audit records.
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP', 'SMS');
CREATE TYPE "PaymentEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'DUPLICATE', 'REJECTED', 'FAILED');

CREATE TABLE "PaymentWebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "orderId" TEXT,
  "providerPaymentId" TEXT,
  "eventType" TEXT NOT NULL,
  "status" "PaymentEventStatus" NOT NULL DEFAULT 'RECEIVED',
  "outcome" TEXT,
  "failureReason" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "paymentId" TEXT,
  CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaymentWebhookEvent_provider_providerEventId_key"
  ON "PaymentWebhookEvent"("provider", "providerEventId");
CREATE INDEX "PaymentWebhookEvent_provider_orderId_idx"
  ON "PaymentWebhookEvent"("provider", "orderId");
CREATE INDEX "PaymentWebhookEvent_status_receivedAt_idx"
  ON "PaymentWebhookEvent"("status", "receivedAt");
ALTER TABLE "PaymentWebhookEvent" ADD CONSTRAINT "PaymentWebhookEvent_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD COLUMN "paymentId" TEXT,
  ADD COLUMN "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
  ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastAttemptAt" TIMESTAMP(3),
  ADD COLUMN "failureReason" TEXT,
  ADD COLUMN "nextRetryAt" TIMESTAMP(3),
  ADD COLUMN "providerMessageId" TEXT,
  ADD COLUMN "dedupeKey" TEXT;
CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");
CREATE INDEX "Notification_status_nextRetryAt_idx" ON "Notification"("status", "nextRetryAt");
CREATE INDEX "Notification_bookingId_type_idx" ON "Notification"("bookingId", "type");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "OperationalAudit" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OperationalAudit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OperationalAudit_entity_entityId_createdAt_idx"
  ON "OperationalAudit"("entity", "entityId", "createdAt");
CREATE INDEX "OperationalAudit_actorId_createdAt_idx"
  ON "OperationalAudit"("actorId", "createdAt");
