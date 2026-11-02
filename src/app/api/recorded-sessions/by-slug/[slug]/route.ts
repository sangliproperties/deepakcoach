import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const video = await prisma.recordedVideo.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      durationMins: true,
      priceInr: true,
      active: true,
    },
  });
  if (!video) return Response.json({ error: "Not found" }, { status: 404 });
  const user = await getCurrentUser();
  const owned =
    user?.role === "ADMIN" ||
    !!(
      user &&
      (await prisma.recordedPurchase.findFirst({
        where: { userId: user.id, videoId: video.id, status: "PAID" },
      }))
    );
  if (!video.active && !owned)
    return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ session: video, owned: !!owned });
}
