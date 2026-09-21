import { getCurrentUser } from "@/lib/auth";
import { listNotifications } from "@/lib/persistence";
import { jsonError } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);
  return Response.json({ notifications: await listNotifications(user.role === "ADMIN" ? undefined : user.id) });
}
