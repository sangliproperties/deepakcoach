import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER")
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (
    process.env.NEXT_PUBLIC_DEMO_MODE !== "true" ||
    process.env.NODE_ENV === "production"
  )
    return Response.json(
      { error: "Demo checkout is disabled" },
      { status: 503 },
    );
  const { purchaseId } = await req.json();
  if (typeof purchaseId !== "string")
    return Response.json({ error: "Invalid purchase" }, { status: 400 });
  const purchase = await prisma.recordedPurchase.findFirst({
    where: { id: purchaseId, userId: user.id },
    include: { video: true },
  });
  if (!purchase || !purchase.video.active)
    return Response.json({ error: "Purchase unavailable" }, { status: 404 });
  const result = await prisma.$transaction(async (tx) => {
    const owned = await tx.recordedPurchase.findFirst({
      where: { userId: user.id, videoId: purchase.videoId, status: "PAID" },
    });
    if (owned) return owned;
    return tx.recordedPurchase.update({
      where: { id: purchase.id },
      data: { status: "PAID", purchasedAt: new Date() },
    });
  });
  return Response.json({ success: true, videoId: result.videoId });
}
