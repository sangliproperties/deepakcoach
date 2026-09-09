import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getBooking, getPaymentForBooking, markPayment } from "@/lib/demo-store";
import { demoPaymentProvider } from "@/lib/payment";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const parsed = z.object({ bookingId: z.string(), paymentId: z.string(), signature: z.string() }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Payment details are incomplete.");
  const booking = getBooking(parsed.data.bookingId);
  const payment = getPaymentForBooking(parsed.data.bookingId);
  if (!booking || !payment || (user.role !== "ADMIN" && booking.userId !== user.id)) return jsonError("Booking not found.", 404);
  if (payment.status === "PAID") return Response.json({ booking });
  const verified = demoPaymentProvider.verifySignature({ orderId: payment.orderId, paymentId: parsed.data.paymentId, signature: parsed.data.signature });
  if (!verified) {
    const failed = markPayment(booking.id, "FAILED", parsed.data.paymentId);
    return Response.json({ error: "Payment verification failed.", booking: failed?.booking }, { status: 400 });
  }
  const updated = markPayment(booking.id, "PAID", parsed.data.paymentId);
  return Response.json({ booking: updated?.booking });
}
