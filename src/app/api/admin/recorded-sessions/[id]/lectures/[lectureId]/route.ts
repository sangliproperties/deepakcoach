import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveMedia } from "@/lib/recorded-session-storage";
import { recordedLectureSchema } from "@/lib/recorded-session-validation";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type Context = {
  params: {
    id: string;
    lectureId: string;
  };
};

export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Find lecture in the selected course
    const existing = await prisma.recordedLecture.findFirst({
      where: {
        id: params.lectureId,
        courseId: params.id,
      },
    });

    if (!existing) {
      return Response.json({ error: "Lecture not found" }, { status: 404 });
    }

    const form = await req.formData();

    // Validate all editable lecture fields
    const data = recordedLectureSchema.parse({
      title: form.get("title") ?? existing.title,
      description: form.get("description") ?? existing.description,
      dayNumber: form.get("dayNumber") ?? existing.dayNumber,
      displayOrder: form.get("displayOrder") ?? existing.displayOrder,
      durationMins: form.get("durationMins") ?? existing.durationMins,
      active: form.has("active")
        ? form.get("active") === "true"
        : existing.active,
    });

    // Prevent duplicate day numbers
    const duplicate = await prisma.recordedLecture.findUnique({
      where: {
        courseId_dayNumber: {
          courseId: params.id,
          dayNumber: data.dayNumber,
        },
      },
    });

    if (duplicate && duplicate.id !== existing.id) {
      return Response.json(
        {
          error: "Another lecture already uses Day " + data.dayNumber,
        },
        { status: 409 },
      );
    }

    // MP4 replacement is optional
    const video = form.get("video");

    const videoKey =
      video instanceof File && video.size > 0
        ? await saveMedia(video, "video")
        : existing.videoKey;

    // Save updated lecture
    const lecture = await prisma.recordedLecture.update({
      where: { id: existing.id },
      data: {
        ...data,
        videoKey,
      },
    });

    return Response.json({
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          error: "This day number is already used by another lecture.",
        },
        { status: 409 },
      );
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Lecture update failed",
      },
      { status: 400 },
    );
  }
}
