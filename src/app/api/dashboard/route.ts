import { getCurrentUser } from "@/lib/auth";
import { getBookingAccess, listBookings, listNotifications, listReviews } from "@/lib/persistence";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const bookings = (await Promise.all(
    (await listBookings(user.id)).map((booking) => getBookingAccess(booking.id))
  )).filter(Boolean);
  return Response.json({
    bookings,
    reviews: (await listReviews()).filter((review) => review.userId === user.id),
    notifications: await listNotifications(user.id)
  });
}
