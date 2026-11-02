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
  if (user?.role !== "ADMIN")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    const form = await req.formData();
    const existing = await prisma.recordedVideo.findUnique({
      where: { id: params.id },
    });
    if (!existing)
      return Response.json({ error: "Not found" }, { status: 404 });
    const data = recordedSchema.parse({
      title: form.get("title"),
      slug: form.get("slug"),
      description: form.get("description"),
      durationMins: form.get("durationMins"),
      priceInr: form.get("priceInr"),
      active: form.get("active") === "true",
    });
    const video = form.get("video"),
      thumbnail = form.get("thumbnail");
    const thumbnailKey =
      thumbnail instanceof File && thumbnail.size
        ? await saveMedia(thumbnail, "thumbnail")
        : existing.thumbnailKey;
    const videoKey =
      video instanceof File && video.size
        ? await saveMedia(video, "video")
        : existing.videoKey;
    const session = await prisma.recordedVideo.update({
      where: { id: params.id },
      data: { ...data, thumbnailKey, videoKey },
    });
    return Response.json({ session });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 },
    );
  }
}
