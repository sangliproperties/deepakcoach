import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { retryNotification } from "@/lib/persistence";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return jsonError("Administrator access required.", 403);
  const parsed = z.object({ notificationId: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Notification details are incomplete.");
  const result = await retryNotification(parsed.data.notificationId, user.id);
  if (!result) return jsonError("Notification is not retryable.", 409);
  return Response.json({ notification: result });
}
