
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: {
      status: "APPROVED"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return Response.json({ reviews });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Sign in required.", 401);
  }

  const parsed = z.object({
    bookingId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim().min(20).max(1000)
  }).safeParse(await request.json());

  if (!parsed.success) {
    return jsonError(
      "Choose a rating and write at least 20 characters.",
      400
    );
  }

  const { bookingId, rating, text } = parsed.data;

  try {
    // Verify the booking belongs to this customer.
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!booking) {
      return jsonError(
        "Booking not found for your account.",
        404
      );
    }

    if (booking.status !== "CONFIRMED") {
      return jsonError(
        "Only confirmed bookings can be reviewed.",
        409
      );
    }

    // Only one review per booking.
    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId
      }
    });

    if (existingReview) {
      return jsonError(
        "A review already exists for this booking.",
        409
      );
    }

    // Save the review permanently in PostgreSQL.
    const review = await prisma.review.create({
      data: {
        bookingId,
        userId: user.id,
        rating,
        text,
        status: "PENDING"
      }
    });

    return Response.json(
      { review },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(
        "A review already exists for this booking.",
        409
      );
    }

    console.error("Review submission failed:", error);

    return jsonError(
      "Could not submit your review. Please try again.",
      500
    );
  }
}
