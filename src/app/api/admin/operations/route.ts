import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  getCancellationPolicy,
  listPayments,
  listPrograms,
  listReviews,
  listTestimonials,
  markPayment,
  listUsers,
  moderateReview,
  moderateTestimonial,
  setProgramActive,
  updateCancellationPolicy,
  updateUserRole
} from "@/lib/demo-store";
import { listBookings } from "@/lib/demo-store";
import { jsonError } from "@/lib/http";

function requireAdmin() {
  const user = getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  if (!requireAdmin()) return jsonError("Administrator access required.", 403);
  return Response.json({
    users: listUsers(),
    programs: listPrograms(),
    bookings: listBookings(),
    payments: listPayments(),
    reviews: listReviews(),
    testimonials: listTestimonials(),
    cancellationPolicy: getCancellationPolicy()
  });
}

export async function PATCH(request: Request) {
  if (!requireAdmin()) return jsonError("Administrator access required.", 403);
  const parsed = z.object({
    action: z.enum(["review", "testimonial", "user-role", "program", "policy", "payment-status"]),
    id: z.string().optional(),
    status: z.string().optional(),
    role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
    active: z.boolean().optional(),
    enabled: z.boolean().optional(),
    minimumHours: z.number().int().min(0).max(168).optional(),
    allowReschedule: z.boolean().optional(),
    rescheduleLimit: z.number().int().min(0).max(5).optional(),
    paymentStatus: z.enum(["PAID", "FAILED", "CANCELLED"]).optional()
  }).safeParse(await request.json());
  if (!parsed.success) return jsonError("The requested operation is invalid.");
  const data = parsed.data;
  if (data.action === "review" && data.id && (data.status === "APPROVED" || data.status === "REJECTED")) return Response.json({ review: moderateReview(data.id, data.status) });
  if (data.action === "testimonial" && data.id && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(data.status || "")) return Response.json({ testimonial: moderateTestimonial(data.id, data.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") });
  if (data.action === "user-role" && data.id && data.role) return Response.json({ user: updateUserRole(data.id, data.role) });
  if (data.action === "program" && data.id && typeof data.active === "boolean") return Response.json({ program: setProgramActive(data.id, data.active) });
  if (data.action === "payment-status" && data.id && data.paymentStatus) return Response.json({ payment: markPayment(data.id, data.paymentStatus) });
  if (data.action === "policy") return Response.json({ cancellationPolicy: updateCancellationPolicy({ enabled: data.enabled, minimumHours: data.minimumHours, allowReschedule: data.allowReschedule, rescheduleLimit: data.rescheduleLimit }) });
  return jsonError("The requested operation is invalid.");
}
