import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createBooking, getPaymentForBooking, listBookings, setPaymentOrder } from "@/lib/demo-store";
import { getProgram } from "@/lib/catalog";
import { jsonError } from "@/lib/http";
import { demoPaymentProvider } from "@/lib/payment";

export async function GET() {
  const user = getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const bookings = user.role === "ADMIN" ? listBookings() : listBookings().filter((booking) => booking.userId === user.id);
  return Response.json({ bookings });
}

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const parsed = z.object({ programId: z.string(), availabilityId: z.string() }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Choose a valid offering and time.");
  const programId = parsed.data.programId;
  const availabilityId = parsed.data.availabilityId;
  if (!programId || !availabilityId || !getProgram(programId)) return jsonError("Choose a valid offering and time.");
  const result = createBooking({ programId, availabilityId, userId: user.id });
  if ("error" in result) return jsonError(String(result.error), 409);
  const payment = getPaymentForBooking(result.booking.id);
  if (payment) {
    const order = await demoPaymentProvider.createOrder({ amountInr: payment.amountInr, receipt: result.booking.reference });
    setPaymentOrder(result.booking.id, order.orderId);
  }
  return Response.json({ booking: result.booking, payment: payment ? { orderId: payment.orderId, amountInr: payment.amountInr } : undefined }, { status: 201 });
}
