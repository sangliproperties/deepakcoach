import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mediaPath } from "@/lib/recorded-session-storage";

import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
    lectureId: string;
  };
};

function rangeNotSatisfiable(size: number) {
  return new Response(null, {
    status: 416,
    headers: {
      "Content-Range": `bytes */${size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(req: Request, { params }: RouteContext) {
  // 1. Verify login
  const user = await getCurrentUser();

  if (!user) {
    return new Response(null, { status: 401 });
  }

  // 2. Find lecture belonging to the requested course
  const lecture = await prisma.recordedLecture.findFirst({
    where: {
      id: params.lectureId,
      courseId: params.id,
    },
    select: {
      id: true,
      courseId: true,
      videoKey: true,
      active: true,
      course: {
        select: {
          id: true,
          active: true,
        },
      },
    },
  });

  if (!lecture) {
    return new Response(null, { status: 404 });
  }

  // 3. Admin can preview lectures.
  const isAdmin = user.role === "ADMIN";

  if (!isAdmin) {
    // Only published courses and lectures are playable.
    if (!lecture.active || !lecture.course.active) {
      return new Response(null, { status: 404 });
    }

    // 4. Verify course purchase
    const purchase = await prisma.recordedPurchase.findFirst({
      where: {
        userId: user.id,
        videoId: lecture.courseId,
        status: "PAID",
      },
      select: {
        id: true,
      },
    });

    if (!purchase) {
      return new Response(null, { status: 403 });
    }
  }

  // 5. Stream the lecture video securely
  try {
    const filePath = mediaPath(lecture.videoKey, "video");

    const fileInfo = await stat(filePath);

    if (!fileInfo.isFile()) {
      return new Response(null, { status: 404 });
    }

    const fileSize = fileInfo.size;

    if (fileSize <= 0) {
      return new Response(null, { status: 404 });
    }

    const range = req.headers.get("range");

    let start = 0;
    let end = fileSize - 1;

    // 6. Handle HTTP byte-range requests
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());

      if (!match || (!match[1] && !match[2])) {
        return rangeNotSatisfiable(fileSize);
      }

      if (!match[1]) {
        // Example: bytes=-500
        const suffixLength = Number(match[2]);

        if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
          return rangeNotSatisfiable(fileSize);
        }

        start = Math.max(0, fileSize - suffixLength);
      } else {
        // Example: bytes=0-1023
        start = Number(match[1]);

        if (match[2]) {
          end = Number(match[2]);
        }
      }

      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        start >= fileSize ||
        end < start
      ) {
        return rangeNotSatisfiable(fileSize);
      }

      end = Math.min(end, fileSize - 1);
    }

    // 7. Create video file stream
    const nodeStream = createReadStream(filePath, {
      start,
      end,
    });

    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    // 8. Return video with appropriate headers
    return new Response(webStream, {
      status: range ? 206 : 200,
      headers: {
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        ...(range
          ? {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            }
          : {}),
      },
    });
  } catch (error) {
    console.error("Recorded lecture streaming failed:", error);

    return new Response(null, { status: 404 });
  }
}
