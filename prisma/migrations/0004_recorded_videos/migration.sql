CREATE TABLE
    "RecordedVideo" (
        "id" TEXT PRIMARY KEY,
        "slug" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "durationMins" INTEGER NOT NULL,
        "priceInr" INTEGER NOT NULL,
        "thumbnailKey" TEXT NOT NULL,
        "videoKey" TEXT NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

CREATE TABLE
    "RecordedPurchase" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "videoId" TEXT NOT NULL,
        "amountInr" INTEGER NOT NULL,
        "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
        "demoOrderId" TEXT NOT NULL UNIQUE,
        "purchasedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RecordedPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "RecordedPurchase_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "RecordedVideo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

CREATE INDEX "RecordedPurchase_userId_status_idx" ON "RecordedPurchase" ("userId", "status");

CREATE INDEX "RecordedPurchase_videoId_idx" ON "RecordedPurchase" ("videoId");