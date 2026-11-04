ALTER TABLE "RecordedVideo"
ALTER COLUMN "videoKey"
DROP NOT NULL;

CREATE TABLE
    "RecordedLecture" (
        "id" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "dayNumber" INTEGER NOT NULL,
        "displayOrder" INTEGER NOT NULL,
        "durationMins" INTEGER NOT NULL,
        "videoKey" TEXT NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "RecordedLecture_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "RecordedLecture_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "RecordedVideo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE UNIQUE INDEX "RecordedLecture_courseId_dayNumber_key" ON "RecordedLecture" ("courseId", "dayNumber");

CREATE INDEX "RecordedLecture_courseId_displayOrder_idx" ON "RecordedLecture" ("courseId", "displayOrder");

-- Convert existing single-video recordings
-- into Day 1 lectures without moving the files.
INSERT INTO
    "RecordedLecture" (
        "id",
        "courseId",
        "title",
        "description",
        "dayNumber",
        "displayOrder",
        "durationMins",
        "videoKey",
        "active",
        "createdAt",
        "updatedAt"
    )
SELECT
    'legacy-' || "id",
    "id",
    "title",
    "description",
    1,
    1,
    "durationMins",
    "videoKey",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM
    "RecordedVideo"
WHERE
    "videoKey" IS NOT NULL;