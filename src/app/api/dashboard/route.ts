import { getCurrentUser } from "@/lib/auth";
import { listDatabaseBookings } from "@/lib/booking-store";
import { listNotifications } from "@/lib/demo-store";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Sign in required.", 401);
  }

  const databaseBookings = await listDatabaseBookings(user.id);
  const now = new Date();

  const bookings = databaseBookings.map((booking) => {
    const startsAt = booking.availability?.startsAt;
    const endsAt = booking.availability?.endsAt;

    const meetingAvailable =
      booking.status === "CONFIRMED" &&
      !!booking.accessUrl &&
      !!startsAt &&
      !!endsAt &&
      now >= startsAt &&
      now <= endsAt;

    return {
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      paymentStatus: booking.payment?.status ?? undefined,
      programId: booking.programId,
      programTitle: booking.program?.title ?? "Program",
      availabilityId: booking.availabilityId,
      startsAt: startsAt?.toISOString(),
      endsAt: endsAt?.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      rescheduleCount: booking.rescheduleCount,
      accessUrl: meetingAvailable
        ? (booking.accessUrl ?? undefined)
        : undefined,
      accessInstructions: booking.accessInstructions ?? undefined,
      meetingAvailable,
      payment: booking.payment
        ? {
            id: booking.payment.id,
            amountInr: booking.payment.amountInr,
            status: booking.payment.status,
            orderId: booking.payment.providerOrderId,
            paymentId: booking.payment.providerPaymentId,
          }
        : undefined,
    };
  });

  const reviews = await prisma.review.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const recordedPurchases = await prisma.recordedPurchase.findMany({
    where: {
      userId: user.id,
      status: "PAID",
    },
    include: {
      video: true,
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });

  return Response.json({
    bookings,
    recordedPurchases: recordedPurchases.map((purchase) => ({
      id: purchase.id,
      slug: purchase.video.slug,
      title: purchase.video.title,
      durationMins: purchase.video.durationMins,
      purchasedAt: purchase.purchasedAt?.toISOString() ?? null,
    })),
    reviews,
    notifications: listNotifications(user.id),
  });
}
