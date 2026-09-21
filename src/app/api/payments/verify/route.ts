import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getBooking, getPaymentForBooking, markPayment, recordCheckoutVerification } from "@/lib/persistence";
import { getPaymentProvider } from "@/lib/payment";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const parsed = z.object({ bookingId: z.string(), paymentId: z.string(), signature: z.string() }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Payment details are incomplete.");
  const booking = await getBooking(parsed.data.bookingId);
  const payment = await getPaymentForBooking(parsed.data.bookingId);
  if (!booking || !payment || (user.role !== "ADMIN" && booking.userId !== user.id)) return jsonError("Booking not found.", 404);
  if (payment.status === "PAID") return Response.json({ booking });
  if (!payment.orderId) return jsonError("Payment order is not ready. Please retry checkout.", 409);
  const provider = getPaymentProvider();
  const verified = provider.verifyCheckoutSignature({ orderId: payment.orderId, paymentId: parsed.data.paymentId, signature: parsed.data.signature });
  if (!verified) {
    if (provider.name === "demo") {
      const failed = await markPayment(booking.id, "FAILED", parsed.data.paymentId);
      return Response.json({ error: "Payment verification failed.", booking: failed?.booking }, { status: 400 });
    }
    return jsonError("Payment verification failed. Awaiting a verified provider event.", 400);
  }
  if (provider.name === "demo") {
    const updated = await markPayment(booking.id, "PAID", parsed.data.paymentId);
    return Response.json({ booking: updated?.booking, paymentStatus: "PAID", source: "demo" });
  }
  const updated = await recordCheckoutVerification(booking.id, parsed.data.paymentId);
  return Response.json({ booking: await getBooking(booking.id), paymentStatus: updated?.status || "PENDING", awaitingWebhook: true });
}
