import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";

import {
  cancelDatabaseBooking,
  createDatabaseBooking,
  getDatabasePaymentForBooking,
  listDatabaseBookings,
  rescheduleDatabaseBooking,
  setDatabasePaymentOrder
} from "@/lib/booking-store";

import { jsonError } from "@/lib/http";
import { demoPaymentProvider } from "@/lib/payment";


function serializeBooking(booking: any) {
  return {
    id: booking.id,
    reference: booking.reference,
    userId: booking.userId,
    programId: booking.programId,
    availabilityId: booking.availabilityId,
    status: booking.status,

    paymentStatus:
      booking.payment?.status ?? undefined,

    createdAt:
      booking.createdAt instanceof Date
        ? booking.createdAt.toISOString()
        : booking.createdAt,

    cancelledAt: booking.cancelledAt
      ? booking.cancelledAt instanceof Date
        ? booking.cancelledAt.toISOString()
        : booking.cancelledAt
      : undefined,

    rescheduledFrom:
      booking.rescheduledFromId ?? undefined,

    rescheduleCount:
      booking.rescheduleCount,

    accessUrl:
      booking.accessUrl ?? undefined,

    accessInstructions:
      booking.accessInstructions ?? undefined
  };
}


export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError(
      "Sign in required.",
      401
    );
  }

  const bookings =
    user.role === "ADMIN"
      ? await listDatabaseBookings()
      : await listDatabaseBookings(user.id);

  return Response.json({
    bookings: bookings.map(serializeBooking)
  });
}


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
      programId: z.string(),
      availabilityId: z.string()
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError(
      "Choose a valid offering and time."
    );
  }

  const result =
    await createDatabaseBooking({
      userId: user.id,
      programId: parsed.data.programId,
      availabilityId:
        parsed.data.availabilityId
    });

  if ("error" in result) {
    return jsonError(
      String(result.error),
      409
    );
  }

  let payment =
    await getDatabasePaymentForBooking(
      result.booking.id
    );

  if (payment) {
    const order =
      await demoPaymentProvider.createOrder({
        amountInr: payment.amountInr,
        receipt: result.booking.reference
      });

    payment =
      await setDatabasePaymentOrder(
        result.booking.id,
        order.orderId
      );
  }

  return Response.json(
    {
      booking:
        serializeBooking({
          ...result.booking,
          payment
        }),

      payment: payment
        ? {
          orderId:
            payment.providerOrderId,
          amountInr:
            payment.amountInr
        }
        : undefined
    },
    {
      status: 201
    }
  );
}


export async function PATCH(request: Request) {
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

      action: z.enum([
        "cancel",
        "reschedule"
      ]),

      availabilityId:
        z.string().optional()
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError(
      "Provide a valid booking action."
    );
  }

  const isAdmin =
    user.role === "ADMIN";

  const result =
    parsed.data.action === "cancel"
      ? await cancelDatabaseBooking(
        parsed.data.bookingId,
        user.id,
        isAdmin
      )
      : parsed.data.availabilityId
        ? await rescheduleDatabaseBooking(
          parsed.data.bookingId,
          user.id,
          parsed.data.availabilityId,
          isAdmin
        )
        : {
          error:
            "INVALID_RESCHEDULE" as const
        };

  if ("error" in result && result.error) {
    const messages: Record<string, string> = {
      CANCELLATION_WINDOW_CLOSED:
        "Cancellation is only available before the configured notice window.",

      RESCHEDULE_LIMIT_REACHED:
        "This booking has reached its rescheduling limit.",

      SLOT_ALREADY_BOOKED:
        "That time was just claimed by someone else.",

      INVALID_RESCHEDULE:
        "Choose an available replacement time.",

      NOT_FOUND:
        "Booking not found.",

      SLOT_UNAVAILABLE:
        "That time is no longer available."
    };

    const errorCode = String(result.error);

    return jsonError(
      messages[errorCode] ||
      "Booking could not be updated.",
      409
    );
  }

  return Response.json({
    booking:
      serializeBooking(result.booking)
  });
}