-- Preserve existing demo purchases.
ALTER TABLE "RecordedPurchase"
ALTER COLUMN "demoOrderId"
DROP NOT NULL;

-- Razorpay identifiers for recorded purchases.
ALTER TABLE "RecordedPurchase"
ADD COLUMN "providerOrderId" TEXT;

ALTER TABLE "RecordedPurchase"
ADD COLUMN "providerPaymentId" TEXT;

-- Prevent duplicate recorded-course order/payment IDs.
CREATE UNIQUE INDEX "RecordedPurchase_providerOrderId_key" ON "RecordedPurchase" ("providerOrderId");

CREATE UNIQUE INDEX "RecordedPurchase_providerPaymentId_key" ON "RecordedPurchase" ("providerPaymentId");

-- Prevent duplicate booking order/payment IDs.
CREATE UNIQUE INDEX "Payment_providerOrderId_key" ON "Payment" ("providerOrderId");

CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment" ("providerPaymentId");