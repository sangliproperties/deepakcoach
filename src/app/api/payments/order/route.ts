import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getBooking, getPaymentForBooking, setPaymentOrder } from "@/lib/persistence";
import { getPaymentProvider } from "@/lib/payment";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  if (user.role !== "CUSTOMER" && user.role !== "ADMIN") return jsonError("Customer access required.", 403);
  const parsed = z.object({ bookingId: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Booking details are incomplete.");
  const booking = await getBooking(parsed.data.bookingId);
  const payment = await getPaymentForBooking(parsed.data.bookingId);
  if (!booking || !payment || (user.role !== "ADMIN" && booking.userId !== user.id)) return jsonError("Booking not found.", 404);
  if (booking.status === "CONFIRMED" || payment.status === "PAID") return jsonError("This booking is already confirmed.", 409);
  if (!["CREATED", "PENDING", "FAILED", "CANCELLED"].includes(payment.status)) return jsonError("This payment cannot be retried.", 409);
  try {
    const provider = getPaymentProvider();
    const order = await provider.createOrder({ amountInr: payment.amountInr, receipt: booking.reference });
    const persisted = await setPaymentOrder(booking.id, order.orderId, provider.name);
    if (!persisted) return jsonError("Payment order could not be persisted.", 500);
    return Response.json({ payment: { orderId: persisted.orderId, amountInr: persisted.amountInr, currency: order.currency } });
  } catch {
    return jsonError("Payment provider is temporarily unavailable. Your booking is still recoverable.", 502);
  }
}
