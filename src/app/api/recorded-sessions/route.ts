import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
export async function GET() {
  const user = await getCurrentUser();
  const sessions = await prisma.recordedVideo.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      durationMins: true,
      priceInr: true,
    },
  });
  const purchases = user
    ? await prisma.recordedPurchase.findMany({
        where: { userId: user.id, status: "PAID" },
        select: { videoId: true },
      })
    : [];
  const owned = new Set(purchases.map((p) => p.videoId));
  return Response.json({
    sessions: sessions.map((s) => ({ ...s, owned: owned.has(s.id) })),
  });
}
