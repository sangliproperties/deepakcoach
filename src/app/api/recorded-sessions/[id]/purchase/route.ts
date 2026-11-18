import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, publicRazorpayKey } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  if (user.role !== "CUSTOMER") {
    return Response.json(
      { error: "Customer account required" },
      { status: 403 },
    );
  }

  const video = await prisma.recordedVideo.findFirst({
    where: {
      id: params.id,
      active: true,
    },
  });

  if (!video) {
    return Response.json({ error: "Course unavailable" }, { status: 404 });
  }

  const owned = await prisma.recordedPurchase.findFirst({
    where: {
      userId: user.id,
      videoId: video.id,
      status: "PAID",
    },
  });

  if (owned) {
    return Response.json({ owned: true });
  }

  if (video.priceInr <= 0) {
    return Response.json(
      {
        error: "Free course enrollment requires a separate flow",
      },
      { status: 400 },
    );
  }

  const purchase = await prisma.recordedPurchase.create({
    data: {
      userId: user.id,
      videoId: video.id,
      amountInr: video.priceInr,
    },
  });

  try {
    const order = await createRazorpayOrder(purchase.amountInr, purchase.id);

    await prisma.recordedPurchase.update({
      where: { id: purchase.id },
      data: {
        providerOrderId: order.id,
      },
    });

    return Response.json({
      purchaseId: purchase.id,
      orderId: order.id,
      amountInr: purchase.amountInr,
      keyId: publicRazorpayKey(),
    });
  } catch (error) {
    console.error("Recorded-course checkout failed:", error);

    return Response.json(
      { error: "Could not start Razorpay checkout" },
      { status: 502 },
    );
  }
}
