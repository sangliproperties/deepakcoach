import { prisma } from "@/lib/prisma";
import { ensureBookingMeeting, lockBookingSlot } from "@/lib/booking-store";
import { assertCapturedPayment, getRazorpayPayment } from "@/lib/razorpay";

export async function fulfillBooking(orderId: string, paymentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: orderId },
    include: { booking: true },
  });

  if (!payment) {
    throw new Error("Unknown booking payment order");
  }

  // Verify the payment directly with Razorpay.
  const remote = await getRazorpayPayment(paymentId);

  assertCapturedPayment(remote, orderId, payment.amountInr);

  await prisma.$transaction(
    async (tx) => {
      // Use the same slot lock as booking creation.
      await lockBookingSlot(tx, payment.booking.availabilityId);

      // Re-read inside the transaction.
      const current = await tx.payment.findUnique({
        where: { id: payment.id },
        include: { booking: true },
      });

      if (!current) {
        throw new Error("Payment record not found");
      }

      // Idempotent retry of an already fulfilled payment.
      if (current.status === "PAID") {
        if (
          current.providerPaymentId !== paymentId ||
          current.booking.status !== "CONFIRMED"
        ) {
          throw new Error("Payment requires reconciliation");
        }

        return;
      }

      // Never confirm a slot already released.
      if (current.booking.status !== "PENDING") {
        throw new Error(
          "Booking is no longer pending; " +
            "captured payment requires reconciliation",
        );
      }

      // Confirm that another booking has not claimed
      // this availability slot.
      const conflict = await tx.booking.findFirst({
        where: {
          availabilityId: current.booking.availabilityId,
          id: { not: current.bookingId },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        select: { id: true },
      });

      if (conflict) {
        throw new Error(
          "Slot already assigned; payment requires reconciliation",
        );
      }

      const paymentUpdate = await tx.payment.updateMany({
        where: {
          id: current.id,
          status: {
            in: ["CREATED", "PENDING"],
          },
          providerOrderId: orderId,
          providerPaymentId: null,
        },
        data: {
          status: "PAID",
          providerPaymentId: paymentId,
        },
      });

      if (paymentUpdate.count !== 1) {
        throw new Error("Payment status changed during fulfillment");
      }

      const bookingUpdate = await tx.booking.updateMany({
        where: {
          id: current.bookingId,
          status: "PENDING",
        },
        data: {
          status: "CONFIRMED",
          holdExpiresAt: null,
        },
      });

      if (bookingUpdate.count !== 1) {
        throw new Error("Booking status changed during fulfillment");
      }
    },
    {
      maxWait: 10000,
      timeout: 15000,
    },
  );

  try {
    await ensureBookingMeeting(payment.bookingId);
  } catch (error) {
    console.error("Meeting creation failed:", error);
  }

  return {
    bookingId: payment.bookingId,
  };
}

export async function fulfillRecordedPurchase(
  orderId: string,
  paymentId: string,
) {
  const purchase = await prisma.recordedPurchase.findFirst({
    where: { providerOrderId: orderId },
  });

  if (!purchase) {
    throw new Error("Unknown recorded-course order");
  }

  const remote = await getRazorpayPayment(paymentId);

  assertCapturedPayment(remote, orderId, purchase.amountInr);

  if (purchase.status === "PAID" && purchase.providerPaymentId !== paymentId) {
    throw new Error("Order already fulfilled");
  }

  await prisma.recordedPurchase.updateMany({
    where: {
      id: purchase.id,
      status: { not: "PAID" },
      providerOrderId: orderId,
    },
    data: {
      status: "PAID",
      providerPaymentId: paymentId,
      purchasedAt: new Date(),
    },
  });

  return {
    videoId: purchase.videoId,
  };
}
