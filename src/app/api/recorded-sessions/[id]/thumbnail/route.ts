import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mediaPath } from "@/lib/recorded-session-storage";
import { readFile } from "node:fs/promises";
export const runtime = "nodejs";
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const item = await prisma.recordedVideo.findUnique({
    where: { id: params.id },
  });
  if (!item) return new Response(null, { status: 404 });
  if (!item.active) {
    const user = await getCurrentUser();
    if (
      user?.role !== "ADMIN" &&
      (!user ||
        !(await prisma.recordedPurchase.findFirst({
          where: { userId: user.id, videoId: item.id, status: "PAID" },
        })))
    )
      return new Response(null, { status: 404 });
  }
  try {
    const buffer = await readFile(mediaPath(item.thumbnailKey, "thumbnail"));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": item.thumbnailKey.endsWith("png")
          ? "image/png"
          : item.thumbnailKey.endsWith("webp")
            ? "image/webp"
            : "image/jpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
