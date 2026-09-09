import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { listReviews, submitReview } from "@/lib/demo-store";
import { jsonError } from "@/lib/http";

export async function GET() {
  return Response.json({ reviews: listReviews("APPROVED") });
}

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const parsed = z.object({
    bookingId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim().min(20).max(1000)
  }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Choose a rating and write at least 20 characters.");
  const result = submitReview({ ...parsed.data, userId: user.id });
  if ("error" in result) return jsonError(result.error === "REVIEW_EXISTS" ? "A review already exists for this booking." : "Only confirmed bookings can be reviewed.", 409);
  return Response.json({ review: result.review }, { status: 201 });
}
