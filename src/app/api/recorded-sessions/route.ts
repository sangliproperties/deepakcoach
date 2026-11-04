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
      _count: {
        select: {
          lectures: {
            where: { active: true },
          },
        },
      },
    },
  });

  const purchases = user
    ? await prisma.recordedPurchase.findMany({
        where: {
          userId: user.id,
          status: "PAID",
        },
        select: {
          videoId: true,
        },
      })
    : [];

  const owned = new Set(purchases.map((purchase) => purchase.videoId));

  return Response.json({
    sessions: sessions.map((session) => ({
      id: session.id,
      slug: session.slug,
      title: session.title,
      description: session.description,
      durationMins: session.durationMins,
      priceInr: session.priceInr,
      lectureCount: session._count.lectures,
      owned: user?.role === "ADMIN" || owned.has(session.id),
    })),
  });
}
