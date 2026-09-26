import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  listDatabaseUsers,
  updateDatabaseUserRole
} from "@/lib/auth-store";
import {
  getCancellationPolicy,
  listPrograms,
  listReviews,
  listTestimonials,
  moderateReview,
  moderateTestimonial,
  setProgramActive,
  updateCancellationPolicy,
  addTestimonial,
  addYoutubeSession,
  listYoutubeSessions,
  listAuditLogs,
  updateYoutubeSession,
  removeYoutubeSession,
  updateTestimonial,
  listEnquiries,
  markEnquiryRead,
  addProgram
} from "@/lib/demo-store";

import {
  listAdminBookings
} from "@/lib/booking-store";

import type {
  PaymentStatus
} from "@prisma/client";

import { jsonError } from "@/lib/http";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}

export async function GET(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError(
      "Administrator access required.",
      403
    );
  }

  const url = new URL(request.url);

  const startDateParam =
    url.searchParams.get("startDate");

  const endDateParam =
    url.searchParams.get("endDate");

  const paymentStatusParam =
    url.searchParams.get("paymentStatus");

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  let paymentStatus:
    | PaymentStatus
    | undefined;

  // Start Date:
  // Include meetings from 00:00 on this date.
  if (startDateParam) {
    const parsed = new Date(
      `${startDateParam}T00:00:00`
    );

    if (!Number.isNaN(parsed.getTime())) {
      startDate = parsed;
    }
  }

  // End Date:
  // Convert the selected end date to
  // midnight of the following day.
  if (endDateParam) {
    const parsed = new Date(
      `${endDateParam}T00:00:00`
    );

    if (!Number.isNaN(parsed.getTime())) {
      parsed.setDate(
        parsed.getDate() + 1
      );

      endDate = parsed;
    }
  }

  const validPaymentStatuses:
    PaymentStatus[] = [
      "CREATED",
      "PENDING",
      "PAID",
      "FAILED",
      "CANCELLED"
    ];

  if (
    paymentStatusParam &&
    validPaymentStatuses.includes(
      paymentStatusParam as PaymentStatus
    )
  ) {
    paymentStatus =
      paymentStatusParam as PaymentStatus;
  }

  const users =
    await listDatabaseUsers();

  const bookings =
    await listAdminBookings({
      startDate,
      endDate,
      paymentStatus
    });

  return Response.json({
    users,

    programs:
      listPrograms(),

    bookings,

    reviews:
      listReviews(),

    testimonials:
      listTestimonials(),

    youtubeSessions:
      listYoutubeSessions(),

    auditLogs:
      listAuditLogs(),

    enquiries:
      listEnquiries(),

    cancellationPolicy:
      getCancellationPolicy()
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("Administrator access required.", 403);
  }

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
  const admin = await requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = z.object({
    action: z.enum([
      "review",
      "testimonial",
      "user-role",
      "program",
      "policy",
      "enquiry-read"
    ]),
    id: z.string().optional(),
    status: z.string().optional(),
    role: z.enum(["CUSTOMER", "COACH", "ADMIN"]).optional(),
    active: z.boolean().optional(),
    enabled: z.boolean().optional(),
    minimumHours: z.number().int().min(0).max(168).optional(),
    allowReschedule: z.boolean().optional(),
    rescheduleLimit: z
      .number()
      .int()
      .min(0)
      .max(5)
      .optional()

  }).safeParse(await request.json());
  if (!parsed.success) return jsonError("The requested operation is invalid.");
  const data = parsed.data;
  if (data.action === "review" && data.id && (data.status === "APPROVED" || data.status === "REJECTED")) return Response.json({ review: moderateReview(data.id, data.status) });
  if (data.action === "testimonial" && data.id && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(data.status || "")) return Response.json({ testimonial: moderateTestimonial(admin.id, data.id, data.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") });
  if (
    data.action === "user-role" &&
    data.id &&
    data.role
  ) {
    const user = await updateDatabaseUserRole(
      data.id,
      data.role
    );

    return Response.json({
      user
    });
  }
  if (data.action === "program" && data.id && typeof data.active === "boolean") return Response.json({ program: setProgramActive(data.id, data.active) });
  if (data.action === "policy") return Response.json({ cancellationPolicy: updateCancellationPolicy({ enabled: data.enabled, minimumHours: data.minimumHours, allowReschedule: data.allowReschedule, rescheduleLimit: data.rescheduleLimit }) });
  if (data.action === "enquiry-read" && data.id) {
    const enquiry = markEnquiryRead(data.id);

    if (!enquiry) {
      return jsonError("Enquiry was not found.", 404);
    }

    return Response.json({ enquiry });
  }
  return jsonError("The requested operation is invalid.");
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
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
  const admin = await requireAdmin();
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = z.object({ contentType: z.enum(["youtube-session"]), id: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return jsonError("The requested deletion is invalid.");
  if (!removeYoutubeSession(admin.id, parsed.data.id)) return jsonError("Content was not found.", 404);
  return Response.json({ ok: true });
}
