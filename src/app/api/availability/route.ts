import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";

import {
  addDatabaseAvailability,
  listDatabaseAvailability,
  removeDatabaseAvailability,
  recoverDatabaseAvailability
} from "@/lib/booking-store";

import { jsonError } from "@/lib/http";


export async function GET() {
  const user = await getCurrentUser();

  const availability =
    await listDatabaseAvailability();

  /*
   * ADMIN
   *
   * Admin sees everything:
   * - available slots
   * - booked slots
   * - manually closed slots
   */
  if (user?.role === "ADMIN") {
    return Response.json({
      availability
    });
  }

  /*
   * CUSTOMER
   *
   * Show:
   * - available slots
   * - booked slots
   *
   * Hide:
   * - slots manually closed by Admin
   */
  return Response.json({
    availability:
      availability.filter(
        (slot) =>
          slot.isOpen ||
          slot.hasBooking
      )
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

  if (user.role !== "ADMIN") {
    return jsonError(
      "Administrator access required.",
      403
    );
  }

  const parsed = z
    .object({
      startsAt: z.string(),

      durationMins: z
        .number()
        .int()
        .min(30)
        .max(180)
    })
    .safeParse(await request.json());

  if (!parsed.success) {
    return jsonError(
      "Provide a valid start time and duration."
    );
  }

  const slot =
    await addDatabaseAvailability(
      parsed.data.startsAt,
      parsed.data.durationMins
    );

  if (!slot) {
    return jsonError(
      "That time is invalid, in the past, or overlaps another slot.",
      409
    );
  }

  return Response.json(
    {
      slot
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

  if (user.role !== "ADMIN") {
    return jsonError(
      "Administrator access required.",
      403
    );
  }

  const parsed = z
    .object({
      id: z.string().min(1)
    })
    .safeParse(
      await request.json()
    );

  if (!parsed.success) {
    return jsonError(
      "Valid slot ID required.",
      400
    );
  }

  const recovered =
    await recoverDatabaseAvailability(
      parsed.data.id
    );

  if (!recovered) {
    return jsonError(
      "Slot cannot be recovered because it is already booked or unavailable.",
      409
    );
  }

  return Response.json({
    ok: true
  });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError(
      "Sign in required.",
      401
    );
  }

  if (user.role !== "ADMIN") {
    return jsonError(
      "Administrator access required.",
      403
    );
  }

  const id =
    new URL(request.url)
      .searchParams
      .get("id");

  if (!id) {
    return jsonError(
      "Slot cannot be removed after it has been booked.",
      409
    );
  }

  const removed =
    await removeDatabaseAvailability(id);

  if (!removed) {
    return jsonError(
      "Slot cannot be removed after it has been booked.",
      409
    );
  }

  return Response.json({
    ok: true
  });
}