import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { fulfillBooking } from "@/lib/razorpay-fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = z
    .object({
      bookingId: z.string().min(1),
      paymentId: z.string().min(1),
      signature: z.string().min(1),
    })
    .safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid payment details" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: {
      bookingId: parsed.data.bookingId,
    },
    include: { booking: true },
  });

  if (!payment || payment.booking.userId !== user.id) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  if (
    !payment.providerOrderId ||
    !verifyCheckoutSignature(
      payment.providerOrderId,
      parsed.data.paymentId,
      parsed.data.signature,
    )
  ) {
    return Response.json(
      { error: "Invalid payment signature" },
      { status: 400 },
    );
  }

  try {
    await fulfillBooking(payment.providerOrderId, parsed.data.paymentId);

    const confirmed = await prisma.booking.findUnique({
      where: { id: parsed.data.bookingId },
      include: { payment: true },
    });

    if (
      !confirmed ||
      confirmed.status !== "CONFIRMED" ||
      confirmed.payment?.status !== "PAID"
    ) {
      throw new Error("Booking payment requires reconciliation");
    }

    return Response.json({
      booking: {
        id: confirmed.id,
        reference: confirmed.reference,
        status: confirmed.status,
        paymentStatus: confirmed.payment.status,
      },
    });
  } catch (error) {
    console.error("Booking payment verification failed:", error);

    return Response.json(
      {
        error: "Payment is awaiting confirmation. Please check again shortly.",
      },
      { status: 409 },
    );
  }
}
