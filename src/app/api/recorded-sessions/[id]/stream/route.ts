import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mediaPath } from "@/lib/recorded-session-storage";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
export const runtime = "nodejs";
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  const item = await prisma.recordedVideo.findUnique({
    where: { id: params.id },
  });
  if (!item) return new Response(null, { status: 404 });
  if (
    user.role !== "ADMIN" &&
    !(await prisma.recordedPurchase.findFirst({
      where: { userId: user.id, videoId: item.id, status: "PAID" },
    }))
  )
    return new Response(null, { status: 403 });
  try {
    const path = mediaPath(item.videoKey, "video");
    const info = await stat(path);
    const size = info.size;
    const range = req.headers.get("range");
    let start = 0,
      end = size - 1;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m || (!m[1] && !m[2]))
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      if (!m[1]) {
        const suffix = Number(m[2]);
        if (!Number.isSafeInteger(suffix) || suffix < 1)
          return new Response(null, { status: 416 });
        start = Math.max(0, size - suffix);
      } else {
        start = Number(m[1]);
        end = m[2] ? Number(m[2]) : end;
      }
      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start >= size ||
        end < start
      )
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      end = Math.min(end, size - 1);
    }
    const stream = Readable.toWeb(
      createReadStream(path, { start, end }),
    ) as ReadableStream;
    return new Response(stream, {
      status: range ? 206 : 200,
      headers: {
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Cache-Control": "private, no-store",
        ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
