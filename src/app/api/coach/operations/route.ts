import { getCurrentUser } from "@/lib/auth";
import { listAvailability, listBookings } from "@/lib/demo-store";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  if (user.role !== "COACH" && user.role !== "ADMIN") return jsonError("Coach access required.", 403);
  return Response.json({ availability: listAvailability(), bookings: listBookings() });
}
