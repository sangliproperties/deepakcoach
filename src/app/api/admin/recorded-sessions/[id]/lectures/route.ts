import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveMedia } from "@/lib/recorded-session-storage";
import { recordedLectureSchema } from "@/lib/recorded-session-validation";

export const runtime = "nodejs";

type Context = {
  params: { id: string };
};

export async function GET(_req: Request, { params }: Context) {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const course = await prisma.recordedVideo.findUnique({
    where: { id: params.id },
  });

  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  const lectures = await prisma.recordedLecture.findMany({
    where: { courseId: params.id },
    orderBy: [{ displayOrder: "asc" }, { dayNumber: "asc" }],
  });

  return Response.json({ lectures });
}

export async function POST(req: Request, { params }: Context) {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const course = await prisma.recordedVideo.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    const form = await req.formData();

    const data = recordedLectureSchema.parse({
      title: form.get("title"),
      description: form.get("description") ?? "",
      dayNumber: form.get("dayNumber"),
      displayOrder: form.get("displayOrder"),
      durationMins: form.get("durationMins"),
      active: true,
    });

    const video = form.get("video");

    if (!(video instanceof File) || video.size === 0) {
      return Response.json(
        { error: "MP4 lecture video is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.recordedLecture.findUnique({
      where: {
        courseId_dayNumber: {
          courseId: params.id,
          dayNumber: data.dayNumber,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "This day already has a lecture" },
        { status: 409 },
      );
    }

    const videoKey = await saveMedia(video, "video");

    const lecture = await prisma.recordedLecture.create({
      data: {
        ...data,
        courseId: params.id,
        videoKey,
      },
    });

    return Response.json({ lecture }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Lecture upload failed",
      },
      { status: 400 },
    );
  }
}
