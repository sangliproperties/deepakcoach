import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { cancelBooking, createBooking, getPaymentForBooking, listBookings, rescheduleBooking, setPaymentOrder } from "@/lib/demo-store";
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

export async function PATCH(request: Request) {
  const user = getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const parsed = z.object({ bookingId: z.string(), action: z.enum(["cancel", "reschedule"]), availabilityId: z.string().optional() }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Provide a valid booking action.");
  const isAdmin = user.role === "ADMIN";
  const result = parsed.data.action === "cancel"
    ? cancelBooking(parsed.data.bookingId, user.id, isAdmin)
    : parsed.data.availabilityId
      ? rescheduleBooking(parsed.data.bookingId, user.id, parsed.data.availabilityId, isAdmin)
      : { error: "INVALID_RESCHEDULE" as const };
  if ("error" in result) {
    const messages: Record<string, string> = {
      CANCELLATION_WINDOW_CLOSED: "Cancellation is only available before the configured notice window.",
      RESCHEDULE_LIMIT_REACHED: "This booking has reached its rescheduling limit.",
      SLOT_ALREADY_BOOKED: "That time was just claimed by someone else.",
      INVALID_RESCHEDULE: "Choose an available replacement time.",
      NOT_FOUND: "Booking not found."
    };
    const error = result.error || "UNKNOWN";
    return jsonError(messages[error] || "Booking could not be updated.", 409);
  }
  return Response.json({ booking: result.booking });
}
