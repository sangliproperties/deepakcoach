import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  fulfillBooking,
  fulfillRecordedPurchase,
} from "@/lib/razorpay-fulfillment";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type WebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  let event: WebhookEvent;

  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return Response.json({ received: true });
  }

  const payment = event.payload?.payment?.entity;

  // Some order.paid notifications may not include a
  // payment entity. payment.captured is the primary
  // fulfillment event in this implementation.
  if (!payment?.id || !payment?.order_id) {
    return Response.json({ received: true });
  }

  const orderId = payment.order_id;
  const paymentId = payment.id;

  try {
    const bookingPayment = await prisma.payment.findFirst({
      where: { providerOrderId: orderId },
    });

    if (bookingPayment) {
      await fulfillBooking(orderId, paymentId);
    } else {
      const coursePurchase = await prisma.recordedPurchase.findFirst({
        where: { providerOrderId: orderId },
      });

      if (!coursePurchase) {
        return Response.json(
          { error: "Unknown Razorpay order" },
          { status: 409 },
        );
      }

      await fulfillRecordedPurchase(orderId, paymentId);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error);

    return Response.json(
      { error: "Webhook processing failed; retry later" },
      { status: 500 },
    );
  }
}
