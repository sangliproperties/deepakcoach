import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordedSchema } from "@/lib/recorded-session-validation";
import { saveMedia } from "@/lib/recorded-session-storage";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await prisma.recordedVideo.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    const form = await req.formData();

    const data = recordedSchema.parse({
      title: form.get("title"),
      slug: form.get("slug"),
      description: form.get("description"),
      durationMins: form.get("durationMins"),
      priceInr: form.get("priceInr"),
      active: form.get("active") === "true",
    });

    // Require at least one active lecture
    // before publishing a course.
    if (data.active) {
      const lectureCount = await prisma.recordedLecture.count({
        where: {
          courseId: params.id,
          active: true,
        },
      });

      if (lectureCount === 0) {
        return Response.json(
          {
            error:
              "Upload at least one active lecture " +
              "before publishing this course.",
          },
          { status: 400 },
        );
      }
    }

    const thumbnail = form.get("thumbnail");

    const thumbnailKey =
      thumbnail instanceof File && thumbnail.size > 0
        ? await saveMedia(thumbnail, "thumbnail")
        : existing.thumbnailKey;

    const session = await prisma.recordedVideo.update({
      where: { id: params.id },
      data: {
        ...data,
        thumbnailKey,
      },
    });

    return Response.json({ session });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Course update failed",
      },
      { status: 400 },
    );
  }
}
