import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordedSchema } from "@/lib/recorded-session-validation";
import { saveMedia } from "@/lib/recorded-session-storage";
export const runtime = "nodejs";
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({
    sessions: await prisma.recordedVideo.findMany({
      orderBy: { createdAt: "desc" },
    }),
  });
}
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    const form = await req.formData();
    const data = recordedSchema.parse({
      title: form.get("title"),
      slug: form.get("slug"),
      description: form.get("description"),
      durationMins: form.get("durationMins"),
      priceInr: form.get("priceInr"),
      active: false,
    });
    const video = form.get("video"),
      thumbnail = form.get("thumbnail");
    if (!(video instanceof File) || !(thumbnail instanceof File))
      return Response.json(
        { error: "Video and thumbnail required" },
        { status: 400 },
      );
    if (await prisma.recordedVideo.findUnique({ where: { slug: data.slug } }))
      return Response.json({ error: "Slug already exists" }, { status: 409 });
    const thumbnailKey = await saveMedia(thumbnail, "thumbnail");
    const videoKey = await saveMedia(video, "video");
    const session = await prisma.recordedVideo.create({
      data: { ...data, thumbnailKey, videoKey },
    });
    return Response.json({ session }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 400 },
    );
  }
}
