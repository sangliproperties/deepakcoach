import { getCurrentUser } from "@/lib/auth";
import { getBookingAccess, listBookings, listNotifications, listReviews } from "@/lib/demo-store";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  const bookings = listBookings()
    .filter((booking) => booking.userId === user.id)
    .map((booking) => getBookingAccess(booking.id))
    .filter(Boolean);
  return Response.json({
    bookings,
    reviews: listReviews().filter((review) => review.userId === user.id),
    notifications: listNotifications(user.id)
  });
}
