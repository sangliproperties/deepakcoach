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
  updateUserRole,
  addTestimonial,
  addYoutubeSession,
  listYoutubeSessions,
  listAuditLogs,
  updateYoutubeSession,
  removeYoutubeSession,
  updateTestimonial,
  addProgram
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
    youtubeSessions: listYoutubeSessions(),
    auditLogs: listAuditLogs(),
    cancellationPolicy: getCancellationPolicy()
  });
}

export async function POST(request: Request) {
  if (!requireAdmin()) return jsonError("Administrator access required.", 403);
  const parsed = z.object({
    contentType: z.enum(["youtube-session", "testimonial", "program"]),
    title: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().min(2).max(1000).optional(),
    category: z.string().trim().min(2).max(80).optional(),
    duration: z.string().trim().min(1).max(40).optional(),
    videoId: z.string().trim().max(30).optional(),
    quote: z.string().trim().min(2).max(1000).optional(),
    name: z.string().trim().min(2).max(120).optional(),
    detail: z.string().trim().min(2).max(200).optional(),
    slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional(),
    tagline: z.string().trim().min(2).max(200).optional(),
    durationMins: z.number().int().min(15).max(480).optional(),
    priceInr: z.number().int().min(0).max(1000000).optional(),
    format: z.string().trim().min(2).max(100).optional(),
    inclusions: z.array(z.string().trim().min(1).max(200)).max(10).optional(),
    eligibility: z.string().trim().min(2).max(500).optional(),
    expectations: z.string().trim().min(2).max(500).optional()
  }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Please provide valid content details.");
  const data = parsed.data;
  const admin = requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  if (data.contentType === "youtube-session" && data.title && data.description && data.category && data.duration) {
    return Response.json({ youtubeSession: addYoutubeSession(admin.id, { title: data.title, description: data.description, category: data.category, duration: data.duration, videoId: data.videoId || undefined }) }, { status: 201 });
  }
  if (data.contentType === "testimonial" && data.quote && data.name && data.detail) {
    return Response.json({ testimonial: addTestimonial(admin.id, { quote: data.quote, name: data.name, detail: data.detail, status: "DRAFT" }) }, { status: 201 });
  }
  if (data.contentType === "program" && data.slug && data.title && data.tagline && data.description && data.durationMins !== undefined && data.priceInr !== undefined && data.format && data.inclusions && data.eligibility && data.expectations) {
    const program = addProgram(admin.id, { slug: data.slug, title: data.title, tagline: data.tagline, description: data.description, durationMins: data.durationMins, priceInr: data.priceInr, format: data.format, inclusions: data.inclusions, eligibility: data.eligibility, expectations: data.expectations });
    if (!program) return jsonError("A program with that slug already exists.", 409);
    return Response.json({ program }, { status: 201 });
  }
  return jsonError("Please provide all required content details.");
}

export async function PATCH(request: Request) {
  const admin = requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = z.object({
    action: z.enum(["review", "testimonial", "user-role", "program", "policy", "payment-status"]),
    id: z.string().optional(),
    status: z.string().optional(),
    role: z.enum(["CUSTOMER", "COACH", "ADMIN"]).optional(),
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
  if (data.action === "testimonial" && data.id && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(data.status || "")) return Response.json({ testimonial: moderateTestimonial(admin.id, data.id, data.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") });
  if (data.action === "user-role" && data.id && data.role) return Response.json({ user: updateUserRole(data.id, data.role) });
  if (data.action === "program" && data.id && typeof data.active === "boolean") return Response.json({ program: setProgramActive(data.id, data.active) });
  if (data.action === "payment-status" && data.id && data.paymentStatus) return Response.json({ payment: markPayment(data.id, data.paymentStatus) });
  if (data.action === "policy") return Response.json({ cancellationPolicy: updateCancellationPolicy({ enabled: data.enabled, minimumHours: data.minimumHours, allowReschedule: data.allowReschedule, rescheduleLimit: data.rescheduleLimit }) });
  return jsonError("The requested operation is invalid.");
}

export async function PUT(request: Request) {
  const admin = requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = z.object({
    contentType: z.enum(["youtube-session", "testimonial"]),
    id: z.string().min(1),
    title: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().min(2).max(1000).optional(),
    category: z.string().trim().min(2).max(80).optional(),
    duration: z.string().trim().min(1).max(40).optional(),
    videoId: z.string().trim().max(30).optional(),
    quote: z.string().trim().min(2).max(1000).optional(),
    name: z.string().trim().min(2).max(120).optional(),
    detail: z.string().trim().min(2).max(200).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional()
  }).safeParse(await request.json());
  if (!parsed.success) return jsonError("Please provide valid content details.");
  const data = parsed.data;
  if (data.contentType === "youtube-session" && data.title && data.description && data.category && data.duration) {
    return Response.json({ youtubeSession: updateYoutubeSession(admin.id, data.id, { title: data.title, description: data.description, category: data.category, duration: data.duration, videoId: data.videoId || undefined }) });
  }
  if (data.contentType === "testimonial" && data.quote && data.name && data.detail && data.status) {
    return Response.json({ testimonial: updateTestimonial(admin.id, data.id, { quote: data.quote, name: data.name, detail: data.detail, status: data.status }) });
  }
  return jsonError("Please provide all required content details.");
}

export async function DELETE(request: Request) {
  const admin = requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = z.object({ contentType: z.enum(["youtube-session"]), id: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return jsonError("The requested deletion is invalid.");
  if (!removeYoutubeSession(admin.id, parsed.data.id)) return jsonError("Content was not found.", 404);
  return Response.json({ ok: true });
}
