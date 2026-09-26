import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";

import {
  getDatabaseBooking,
  getDatabasePaymentForBooking,
  markDatabasePayment
} from "@/lib/booking-store";

import { demoPaymentProvider } from "@/lib/payment";
import { jsonError } from "@/lib/http";


export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError(
      "Sign in required.",
      401
    );
  }

  const parsed = z
    .object({
      bookingId: z.string(),
      paymentId: z.string(),
      signature: z.string()
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError(
      "Payment details are incomplete."
    );
  }

  const booking =
    await getDatabaseBooking(
      parsed.data.bookingId
    );

  const payment =
    await getDatabasePaymentForBooking(
      parsed.data.bookingId
    );

  if (
    !booking ||
    !payment ||
    (
      user.role !== "ADMIN" &&
      booking.userId !== user.id
    )
  ) {
    return jsonError(
      "Booking not found.",
      404
    );
  }

  if (payment.status === "PAID") {
    return Response.json({
      booking: {
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        paymentStatus: payment.status
      }
    });
  }

  if (!payment.providerOrderId) {
    return jsonError(
      "Payment order was not found.",
      409
    );
  }

  const verified =
    demoPaymentProvider.verifySignature({
      orderId:
        payment.providerOrderId,

      paymentId:
        parsed.data.paymentId,

      signature:
        parsed.data.signature
    });

  if (!verified) {
    const failed =
      await markDatabasePayment(
        booking.id,
        "FAILED",
        parsed.data.paymentId
      );

    return Response.json(
      {
        error:
          "Payment verification failed.",

        booking: failed
          ? {
            id: failed.booking.id,
            reference:
              failed.booking.reference,
            status:
              failed.booking.status,
            paymentStatus:
              failed.payment.status
          }
          : undefined
      },
      {
        status: 400
      }
    );
  }

  const updated =
    await markDatabasePayment(
      booking.id,
      "PAID",
      parsed.data.paymentId
    );

  if (!updated) {
    return jsonError(
      "Payment could not be updated.",
      500
    );
  }

  return Response.json({
    booking: {
      id: updated.booking.id,
      reference:
        updated.booking.reference,
      status:
        updated.booking.status,
      paymentStatus:
        updated.payment.status
    }
  });
}