import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const user = await getCurrentUser();

  const course = await prisma.recordedVideo.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      durationMins: true,
      priceInr: true,
      active: true,
      lectures: {
        where: { active: true },
        orderBy: [{ displayOrder: "asc" }, { dayNumber: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          dayNumber: true,
          displayOrder: true,
          durationMins: true,
        },
      },
    },
  });

  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  const isAdmin = user?.role === "ADMIN";

  const purchase =
    user && !isAdmin
      ? await prisma.recordedPurchase.findFirst({
          where: {
            userId: user.id,
            videoId: course.id,
            status: "PAID",
          },
          select: { id: true },
        })
      : null;

  const owned = isAdmin || !!purchase;

  if (!course.active && !owned) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  return Response.json({
    session: course,
    owned,
    lectureCount: course.lectures.length,
  });
}
