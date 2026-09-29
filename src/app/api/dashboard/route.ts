import { getCurrentUser } from "@/lib/auth";
import { listDatabaseBookings } from "@/lib/booking-store";
import {
  listNotifications,
  listReviews
} from "@/lib/demo-store";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Sign in required.", 401);
  }

  const databaseBookings = await listDatabaseBookings(user.id);

  const bookings = databaseBookings.map((booking) => ({
    id: booking.id,
    reference: booking.reference,

    status: booking.status,

    paymentStatus:
      booking.payment?.status ?? undefined,

    programId: booking.programId,

    programTitle:
      booking.program?.title ?? "Program",

    availabilityId:
      booking.availabilityId,

    startsAt:
      booking.availability?.startsAt.toISOString(),

    endsAt:
      booking.availability?.endsAt.toISOString(),

    createdAt:
      booking.createdAt.toISOString(),

    rescheduleCount:
      booking.rescheduleCount,

    payment: booking.payment
      ? {
        id: booking.payment.id,
        amountInr: booking.payment.amountInr,
        status: booking.payment.status,
        orderId:
          booking.payment.providerOrderId,
        paymentId:
          booking.payment.providerPaymentId
      }
      : undefined
  }));

  return Response.json({
    bookings,

    reviews: listReviews().filter(
      (review) => review.userId === user.id
    ),

    notifications: listNotifications(user.id)
  });
}