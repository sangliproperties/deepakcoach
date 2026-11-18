import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { fulfillRecordedPurchase } from "@/lib/razorpay-fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = z
    .object({
      purchaseId: z.string().min(1),
      paymentId: z.string().min(1),
      signature: z.string().min(1),
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Invalid payment details" }, { status: 400 });
  }

  const purchase = await prisma.recordedPurchase.findFirst({
    where: {
      id: parsed.data.purchaseId,
      userId: user.id,
    },
  });

  if (
    !purchase?.providerOrderId ||
    !verifyCheckoutSignature(
      purchase.providerOrderId,
      parsed.data.paymentId,
      parsed.data.signature,
    )
  ) {
    return Response.json(
      { error: "Invalid purchase or payment signature" },
      { status: 400 },
    );
  }

  try {
    const result = await fulfillRecordedPurchase(
      purchase.providerOrderId,
      parsed.data.paymentId,
    );

    return Response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Course payment verification:", error);

    return Response.json(
      {
        error: "Payment is awaiting confirmation. Please check again shortly.",
      },
      { status: 409 },
    );
  }
}
