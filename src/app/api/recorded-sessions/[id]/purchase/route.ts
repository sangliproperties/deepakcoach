import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: "Sign in to purchase" }, { status: 401 });
  if (user.role !== "CUSTOMER")
    return Response.json(
      { error: "Customer account required" },
      { status: 403 },
    );
  if (
    process.env.NEXT_PUBLIC_DEMO_MODE !== "true" ||
    process.env.NODE_ENV === "production"
  )
    return Response.json(
      { error: "Demo checkout is disabled" },
      { status: 503 },
    );
  const video = await prisma.recordedVideo.findFirst({
    where: { id: params.id, active: true },
  });
  if (!video) return Response.json({ error: "Unavailable" }, { status: 404 });
  const owned = await prisma.recordedPurchase.findFirst({
    where: { userId: user.id, videoId: video.id, status: "PAID" },
  });
  if (owned) return Response.json({ owned: true });
  const purchase = await prisma.recordedPurchase.create({
    data: {
      userId: user.id,
      videoId: video.id,
      amountInr: video.priceInr,
      demoOrderId: `demo_${randomUUID()}`,
    },
  });
  return Response.json({
    purchaseId: purchase.id,
    amountInr: purchase.amountInr,
  });
}
