import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { cancelBooking, createBooking, createGuestUser, getPaymentForBooking, getStoredProgram, listBookings, rescheduleBooking, setPaymentOrder } from "@/lib/persistence";
import { jsonError } from "@/lib/http";
import { getPaymentProvider } from "@/lib/payment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const bookings = await listBookings(user.role === "ADMIN" ? undefined : user.id);
  return Response.json({ bookings });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const parsed = z.object({
    programId: z.string(),
    availabilityId: z.string(),
    guest: z.object({
      name: z.string().trim().min(2).max(100),
      email: z.string().email(),
      phone: z.string().trim().max(30).optional()
    }).optional()
  }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Choose a valid offering and time.");
  const programId = parsed.data.programId;
  const availabilityId = parsed.data.availabilityId;
  const program = await getStoredProgram(programId);
  if (!programId || !availabilityId || !program) return jsonError("Choose a valid offering and time.");
  if (program.priceInr > 0 && (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN"))) return jsonError("Sign in as a customer is required for paid sessions.", 401);
  const bookingUser = user || (parsed.data.guest ? await createGuestUser(parsed.data.guest) : null);
  if (!bookingUser) return jsonError("Enter your name and email to book the complimentary session.");
  const result = await createBooking({ programId, availabilityId, userId: bookingUser.id });
  if ("error" in result) return jsonError(String(result.error), 409);
  let payment = await getPaymentForBooking(result.booking.id);
  if (payment) {
    try {
      const provider = getPaymentProvider();
      const order = await provider.createOrder({ amountInr: payment.amountInr, receipt: result.booking.reference });
      payment = await setPaymentOrder(result.booking.id, order.orderId, provider.name);
    } catch {
      // The booking remains persisted and can use the explicit order retry route.
      payment = await getPaymentForBooking(result.booking.id);
    }
  }

  return Response.json({ booking: result.booking, payment: payment ? { orderId: payment.orderId, amountInr: payment.amountInr } : undefined }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const parsed = z.object({ bookingId: z.string(), action: z.enum(["cancel", "reschedule"]), availabilityId: z.string().optional() }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Provide a valid booking action.");
  const isAdmin = user.role === "ADMIN";
  const result = parsed.data.action === "cancel"
    ? await cancelBooking(parsed.data.bookingId, user.id, isAdmin)
    : parsed.data.availabilityId
      ? await rescheduleBooking(parsed.data.bookingId, user.id, parsed.data.availabilityId, isAdmin)
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
