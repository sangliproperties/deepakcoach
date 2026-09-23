import { createHash, randomBytes } from "node:crypto";
import { programs } from "@/lib/catalog";
import { youtubeSessions } from "@/lib/media";
import type {
  AvailabilitySlot,
  Booking,
  BookingStatus,
  CancellationPolicy,
  NotificationEvent,
  PaymentStatus,
  Review,
  ReviewStatus,
  Role,
  SessionUser,
  Testimonial,
  Enquiry,
  YouTubeSession,
  AuditLog
  , Program
} from "@/lib/types";

type StoredUser = SessionUser & { passwordHash: string; phone?: string };
type StoredBooking = Booking & { paymentStatus?: PaymentStatus };
type StoredPayment = {
  id: string;
  bookingId: string;
  orderId: string;
  amountInr: number;
  status: PaymentStatus;
  paymentId?: string;
};
type StoredReview = Review & { userId: string; bookingId: string };

type Store = {
  users: Map<string, StoredUser>;
  sessions: Map<string, string>;
  availability: AvailabilitySlot[];
  bookings: Map<string, StoredBooking>;
  payments: Map<string, StoredPayment>;
  reviews: Map<string, StoredReview>;
  testimonials: Map<string, Testimonial>;
  youtubeSessions: Map<string, YouTubeSession>;
  auditLogs: AuditLog[];
  notifications: NotificationEvent[];
  programStatus: Map<string, boolean>;
  enquiries: Map<string, Enquiry>;
  programs: Map<string, Program>;
  cancellationPolicy: CancellationPolicy;
};

const globalStore = globalThis as typeof globalThis & { __deepakCoachStore?: Store };

function passwordHash(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function seedAvailability(): AvailabilitySlot[] {
  const result: AvailabilitySlot[] = [];
  for (let day = 1; day <= 7; day += 1) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    date.setHours(10, 0, 0, 0);
    for (let index = 0; index < 3; index += 1) {
      const start = new Date(date);
      start.setHours(10 + index * 2, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 60);
      result.push({ id: `demo-slot-${day}-${index}`, startsAt: start.toISOString(), endsAt: end.toISOString(), isOpen: true });
    }
  }
  return result;
}

function seedDemoBookings(availability: AvailabilitySlot[]): { bookings: Map<string, StoredBooking>; payments: Map<string, StoredPayment> } {
  const bookings = new Map<string, StoredBooking>();
  const payments = new Map<string, StoredPayment>();
  const programsById = new Map(programs.map((program) => [program.id, program]));
  const dayMillis = 86_400_000;
  const slot = (day: number, index: number) => availability[day * 3 + index];

  function add(input: {
    day: number;
    index: number;
    suffix: string;
    programId: string;
    status: BookingStatus;
    paymentStatus?: PaymentStatus;
    createdDaysAgo: number;
  }) {
    const id = `booking-demo-${input.suffix}`;
    const booking: StoredBooking = {
      id,
      reference: `DK-DEMO-${input.suffix.toUpperCase()}`,
      userId: "demo-customer",
      programId: input.programId,
      availabilityId: slot(input.day, input.index).id,
      status: input.status,
      paymentStatus: input.paymentStatus,
      rescheduleCount: 0,
      createdAt: new Date(Date.now() - input.createdDaysAgo * dayMillis).toISOString()
    };
    bookings.set(id, booking);
    const price = programsById.get(input.programId)?.priceInr || 0;
    if (price > 0) {
      const paymentId = `payment-demo-${input.suffix}`;
      payments.set(paymentId, {
        id: paymentId,
        bookingId: id,
        orderId: `order_demo_${input.suffix.toUpperCase()}`,
        amountInr: price,
        status: input.paymentStatus === "PAID" ? "PAID" : "CREATED"
      });
    }
  }

  add({ day: 0, index: 0, suffix: "a1", programId: "clarity-call", status: "CONFIRMED", createdDaysAgo: 2 });
  add({ day: 1, index: 0, suffix: "b2", programId: "focused-growth", status: "PENDING", paymentStatus: "CREATED", createdDaysAgo: 0 });
  add({ day: 2, index: 0, suffix: "c3", programId: "direction-series", status: "CONFIRMED", paymentStatus: "PAID", createdDaysAgo: 1 });
  add({ day: 3, index: 0, suffix: "d4", programId: "clarity-call", status: "CANCELLED", createdDaysAgo: 3 });

  return { bookings, payments };
}

function getStore(): Store {
  if (!globalStore.__deepakCoachStore) {
    const admin: StoredUser = {
      id: "demo-admin",
      email: "admin@deepakcoach.local",
      name: "MVP Administrator",
      role: "ADMIN",
      passwordHash: passwordHash("Admin@123")
    };
    const customer: StoredUser = {
      id: "demo-customer",
      email: "hello@example.com",
      name: "Demo Customer",
      role: "CUSTOMER",
      passwordHash: passwordHash("Demo@123")
    };
    const coach: StoredUser = {
      id: "demo-coach",
      email: "coach@deepakcoach.local",
      name: "Demo Coach",
      role: "COACH",
      passwordHash: passwordHash("Coach@123")
    };
    const demoAvailability = seedAvailability();
    const demoActivity = seedDemoBookings(demoAvailability);
    globalStore.__deepakCoachStore = {
      users: new Map([
        [admin.id, admin],
        [customer.id, customer],
        [coach.id, coach]
      ]),
      sessions: new Map(),
      availability: demoAvailability,
      bookings: demoActivity.bookings,
      payments: demoActivity.payments,
      reviews: new Map(),
      testimonials: new Map([
        ["testimonial-1", { id: "testimonial-1", quote: "The conversation helped me slow down and hear what I already knew mattered.", name: "A coaching participant", detail: "Reflection after a clarity conversation", status: "PUBLISHED" }],
        ["testimonial-2", { id: "testimonial-2", quote: "I left with a simple action I could actually take, rather than another overwhelming list.", name: "A growth session participant", detail: "Reflection after a focused session", status: "PUBLISHED" }]
      ]),
      youtubeSessions: new Map(youtubeSessions.map((session) => [session.id, session])),
      auditLogs: [],
      notifications: [],
      enquiries: new Map(),
      programStatus: new Map(programs.map((program) => [program.id, true])),
      programs: new Map(programs.map((program) => [program.id, program])),
      cancellationPolicy: { enabled: true, minimumHours: 12, allowReschedule: true, rescheduleLimit: 1 }
    };
  }
  return globalStore.__deepakCoachStore;
}

export function publicUser(user: StoredUser): SessionUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return Array.from(getStore().users.values()).find((user) => user.email === normalized);
}

export function createUser(input: { name: string; email: string; password: string; phone?: string }) {
  if (findUserByEmail(input.email)) return null;
  const id = `user-${randomBytes(8).toString("hex")}`;
  const user: StoredUser = {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim(),
    role: "CUSTOMER",
    passwordHash: passwordHash(input.password)
  };
  getStore().users.set(id, user);
  return publicUser(user);
}

export function authenticate(email: string, password: string) {
  const user = findUserByEmail(email);
  return user && user.passwordHash === passwordHash(password) ? publicUser(user) : null;
}

export function createSession(userId: string) {
  const token = randomBytes(24).toString("hex");
  getStore().sessions.set(token, userId);
  return token;
}

export function deleteSession(token: string) {
  getStore().sessions.delete(token);
}

export function sessionUser(token?: string) {
  if (!token) return null;
  const userId = getStore().sessions.get(token);
  const user = userId ? getStore().users.get(userId) : undefined;
  return user ? publicUser(user) : null;
}

export function listAvailability() {
  const booked = new Set(
    Array.from(getStore().bookings.values())
      .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED")
      .map((booking) => booking.availabilityId)
  );
  return getStore().availability.map((slot) => ({ ...slot, isOpen: slot.isOpen && !booked.has(slot.id) }));
}

function notify(userId: string, type: string, message: string, bookingId?: string) {
  const notification: NotificationEvent = {
    id: `notification-${randomBytes(8).toString("hex")}`,
    userId,
    bookingId,
    type,
    status: process.env.NEXT_PUBLIC_DEMO_MODE === "false" ? "QUEUED" : "SENT",
    message,
    createdAt: new Date().toISOString()
  };
  getStore().notifications.unshift(notification);
  return notification;
}

export function listNotifications(userId?: string) {
  return getStore().notifications.filter((item) => !userId || item.userId === userId);
}

export function getCancellationPolicy() {
  return { ...getStore().cancellationPolicy };
}

export function updateCancellationPolicy(input: Partial<CancellationPolicy>) {
  const store = getStore();
  const defined = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<CancellationPolicy>;
  store.cancellationPolicy = { ...store.cancellationPolicy, ...defined };
  return getCancellationPolicy();
}

export function listUsers() {
  return Array.from(getStore().users.values()).map(publicUser);
}

export function listPayments() {
  return Array.from(getStore().payments.values()).sort((a, b) => b.id.localeCompare(a.id));
}

export function listPrograms() {
  const store = getStore();
  return Array.from(store.programs.values()).map((program) => ({ ...program, active: store.programStatus.get(program.id) !== false }));
}

export function setProgramActive(programId: string, active: boolean) {
  if (!getStore().programs.has(programId)) return null;
  getStore().programStatus.set(programId, active);
  return listPrograms().find((program) => program.id === programId);
}

export function listPublicPrograms() {
  return listPrograms().filter((program) => program.active);
}

export function getStoredProgram(id: string) {
  const program = Array.from(getStore().programs.values()).find((item) => item.id === id || item.slug === id);
  return program && getStore().programStatus.get(program.id) !== false ? program : undefined;
}

export function addProgram(actorId: string, input: Omit<Program, "id">) {
  const id = input.slug;
  if (getStore().programs.has(id) || Array.from(getStore().programs.values()).some((program) => program.slug === input.slug)) return null;
  const program = { ...input, id };
  getStore().programs.set(id, program);
  getStore().programStatus.set(id, true);
  recordAudit(actorId, "CREATE", "PROGRAM", id);
  return { ...program, active: true };
}

export function addAvailability(startsAt: string, durationMins: number) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMins * 60_000);
  if (Number.isNaN(start.getTime()) || start <= new Date()) return null;
  const conflict = getStore().availability.some((slot) => {
    const existingStart = new Date(slot.startsAt).getTime();
    const existingEnd = new Date(slot.endsAt).getTime();
    return start.getTime() < existingEnd && end.getTime() > existingStart;
  });
  if (conflict) return null;
  const slot = { id: `slot-${randomBytes(8).toString("hex")}`, startsAt: start.toISOString(), endsAt: end.toISOString(), isOpen: true };
  getStore().availability.push(slot);
  return slot;
}

export function removeAvailability(id: string) {
  const store = getStore();
  const hasBooking = Array.from(store.bookings.values()).some((booking) => booking.availabilityId === id && booking.status !== "CANCELLED");
  if (hasBooking) return false;
  const originalLength = store.availability.length;
  store.availability = store.availability.filter((slot) => slot.id !== id);
  return store.availability.length !== originalLength;
}

export function createBooking(input: { userId: string; programId: string; availabilityId: string }) {
  const store = getStore();
  const program = getStoredProgram(input.programId);
  const slot = store.availability.find((item) => item.id === input.availabilityId);
  if (!program || !slot || !slot.isOpen || new Date(slot.startsAt) <= new Date()) return { error: "SLOT_UNAVAILABLE" as const };
  const claimed = Array.from(store.bookings.values()).some(
    (booking) =>
      booking.availabilityId === input.availabilityId &&
      (booking.status === "PENDING" || booking.status === "CONFIRMED")
  );
  if (claimed) return { error: "SLOT_ALREADY_BOOKED" as const };
  const id = `booking-${randomBytes(8).toString("hex")}`;
  const booking: StoredBooking = {
    id,
    reference: `DK-${id.slice(-8).toUpperCase()}`,
    userId: input.userId,
    programId: input.programId,
    availabilityId: input.availabilityId,
    status: program.priceInr === 0 ? "CONFIRMED" : "PENDING",
    paymentStatus: program.priceInr === 0 ? undefined : "CREATED",
    rescheduleCount: 0,
    createdAt: new Date().toISOString()
  };
  store.bookings.set(id, booking);
  notify(input.userId, "BOOKING_CREATED", `Booking ${booking.reference} was created and is ${booking.status.toLowerCase()}.`, id);
  if (program.priceInr > 0) {
    const payment: StoredPayment = {
      id: `payment-${randomBytes(8).toString("hex")}`,
      bookingId: id,
      orderId: `order_demo_${randomBytes(8).toString("hex")}`,
      amountInr: program.priceInr,
      status: "CREATED"
    };
    store.payments.set(id, payment);
  }
  return { booking };
}

export function getBooking(id: string) {
  return getStore().bookings.get(id);
}

export function listBookings() {
  return Array.from(getStore().bookings.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPaymentForBooking(bookingId: string) {
  return getStore().payments.get(bookingId);
}

export function setPaymentOrder(bookingId: string, orderId: string) {
  const payment = getStore().payments.get(bookingId);
  if (payment) payment.orderId = orderId;
  return payment;
}

export function markPayment(bookingId: string, status: PaymentStatus, paymentId?: string) {
  const payment = getStore().payments.get(bookingId);
  const booking = getStore().bookings.get(bookingId);
  if (!payment || !booking) return null;
  if (payment.status === "PAID") return { payment, booking };
  payment.status = status;
  payment.paymentId = paymentId;
  booking.paymentStatus = status;
  if (status === "PAID") booking.status = "CONFIRMED";
  if (status === "FAILED" || status === "CANCELLED") booking.status = status === "FAILED" ? "FAILED" : "CANCELLED";
  notify(booking.userId, `PAYMENT_${status}`, `Payment for booking ${booking.reference} is ${status.toLowerCase()}.`, booking.id);
  return { payment, booking };
}

export function listReviews(status?: ReviewStatus) {
  return Array.from(getStore().reviews.values())
    .filter((review) => !status || review.status === status)
    .map((review) => {
      const user = getStore().users.get(review.userId);
      const booking = getStore().bookings.get(review.bookingId);
      const program = booking ? getStore().programs.get(booking.programId) : undefined;
      return { ...review, userName: user?.name, programTitle: program?.title };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function submitReview(input: { userId: string; bookingId: string; rating: number; text: string }) {
  const booking = getStore().bookings.get(input.bookingId);
  if (!booking || booking.userId !== input.userId || booking.status !== "CONFIRMED") return { error: "BOOKING_NOT_ELIGIBLE" as const };
  if (Array.from(getStore().reviews.values()).some((review) => review.bookingId === input.bookingId)) return { error: "REVIEW_EXISTS" as const };
  const review: StoredReview = {
    id: `review-${randomBytes(8).toString("hex")}`,
    bookingId: input.bookingId,
    userId: input.userId,
    rating: input.rating,
    text: input.text.trim(),
    status: "PENDING",
    createdAt: new Date().toISOString()
  };
  getStore().reviews.set(review.id, review);
  notify(input.userId, "REVIEW_SUBMITTED", "Your review was submitted for moderation.", input.bookingId);
  return { review };
}

export function moderateReview(id: string, status: "APPROVED" | "REJECTED") {
  const review = getStore().reviews.get(id);
  if (!review) return null;
  review.status = status;
  return review;
}

export function listTestimonials(status?: Testimonial["status"]) {
  return Array.from(getStore().testimonials.values()).filter((item) => !status || item.status === status);
}

export function listYoutubeSessions() {
  return Array.from(getStore().youtubeSessions.values());
}

function recordAudit(actorId: string, action: string, entity: string, entityId?: string) {
  getStore().auditLogs.unshift({ id: `audit-${randomBytes(8).toString("hex")}`, actorId, action, entity, entityId, createdAt: new Date().toISOString() });
}

export function listAuditLogs() {
  return getStore().auditLogs.slice(0, 100).map((log) => ({ ...log, actor: getStore().users.get(log.actorId)?.email || "Unknown user" }));
}

export function addYoutubeSession(actorId: string, input: Omit<YouTubeSession, "id">) {
  const session: YouTubeSession = { ...input, id: `youtube-session-${randomBytes(8).toString("hex")}` };
  getStore().youtubeSessions.set(session.id, session);
  recordAudit(actorId, "CREATE", "YOUTUBE_SESSION", session.id);
  return session;
}

export function updateYoutubeSession(actorId: string, id: string, input: Omit<YouTubeSession, "id">) {
  const session = getStore().youtubeSessions.get(id);
  if (!session) return null;
  Object.assign(session, input);
  recordAudit(actorId, "UPDATE", "YOUTUBE_SESSION", id);
  return session;
}

export function removeYoutubeSession(actorId: string, id: string) {
  const removed = getStore().youtubeSessions.delete(id);
  if (removed) recordAudit(actorId, "DELETE", "YOUTUBE_SESSION", id);
  return removed;
}

export function addTestimonial(actorId: string, input: Omit<Testimonial, "id">) {
  const testimonial: Testimonial = { ...input, id: `testimonial-${randomBytes(8).toString("hex")}` };
  getStore().testimonials.set(testimonial.id, testimonial);
  recordAudit(actorId, "CREATE", "TESTIMONIAL", testimonial.id);
  return testimonial;
}

export function updateTestimonial(actorId: string, id: string, input: Omit<Testimonial, "id">) {
  const testimonial = getStore().testimonials.get(id);
  if (!testimonial) return null;
  Object.assign(testimonial, input);
  recordAudit(actorId, "UPDATE", "TESTIMONIAL", id);
  return testimonial;
}

export function moderateTestimonial(actorId: string, id: string, status: Testimonial["status"]) {
  const testimonial = getStore().testimonials.get(id);
  if (!testimonial) return null;
  testimonial.status = status;
  recordAudit(actorId, "STATUS_CHANGE", "TESTIMONIAL", id);
  return testimonial;
}

export function updateUserRole(id: string, role: Role) {
  const user = getStore().users.get(id);
  if (!user) return null;
  user.role = role;
  return publicUser(user);
}

export function cancelBooking(id: string, userId: string, isAdmin = false) {
  const store = getStore();
  const booking = store.bookings.get(id);
  if (!booking || (!isAdmin && booking.userId !== userId)) return { error: "NOT_FOUND" as const };
  if (booking.status === "CANCELLED") return { booking };
  const startsAt = store.availability.find((slot) => slot.id === booking.availabilityId)?.startsAt;
  const hoursUntil = startsAt ? (new Date(startsAt).getTime() - Date.now()) / 3_600_000 : 0;
  if (!isAdmin && (!store.cancellationPolicy.enabled || hoursUntil < store.cancellationPolicy.minimumHours)) return { error: "CANCELLATION_WINDOW_CLOSED" as const };
  booking.status = "CANCELLED";
  booking.cancelledAt = new Date().toISOString();
  const payment = store.payments.get(id);
  if (payment && payment.status !== "PAID") {
    payment.status = "CANCELLED";
    booking.paymentStatus = "CANCELLED";
  }
  notify(booking.userId, "BOOKING_CANCELLED", `Booking ${booking.reference} was cancelled.`, booking.id);
  return { booking };
}

export function rescheduleBooking(id: string, userId: string, availabilityId: string, isAdmin = false) {
  const store = getStore();
  const booking = store.bookings.get(id);
  const slot = store.availability.find((item) => item.id === availabilityId);
  if (!booking || (!isAdmin && booking.userId !== userId) || !slot || !slot.isOpen) return { error: "INVALID_RESCHEDULE" as const };
  if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") return { error: "INVALID_RESCHEDULE" as const };
  if (!isAdmin && (!store.cancellationPolicy.allowReschedule || (booking.rescheduleCount || 0) >= store.cancellationPolicy.rescheduleLimit)) return { error: "RESCHEDULE_LIMIT_REACHED" as const };
  const occupied = Array.from(store.bookings.values()).some((item) => item.id !== id && item.availabilityId === availabilityId && ["PENDING", "CONFIRMED"].includes(item.status));
  if (occupied) return { error: "SLOT_ALREADY_BOOKED" as const };
  const previous = booking.availabilityId;
  booking.availabilityId = availabilityId;
  booking.rescheduledFrom = previous;
  booking.rescheduleCount = (booking.rescheduleCount || 0) + 1;
  notify(booking.userId, "BOOKING_RESCHEDULED", `Booking ${booking.reference} was moved to a new time.`, booking.id);
  return { booking };
}

export function getBookingAccess(id: string) {
  const booking = getStore().bookings.get(id);
  if (!booking) return null;
  const slot = getStore().availability.find((item) => item.id === booking.availabilityId);
  const program = getStore().programs.get(booking.programId);
  return {
    ...booking,
    startsAt: slot?.startsAt,
    endsAt: slot?.endsAt,
    programTitle: program?.title,
    accessUrl: booking.status === "CONFIRMED" ? "https://meet.google.com/demo-coaching-room" : undefined,
    accessInstructions: booking.status === "CONFIRMED" ? "Join five minutes early from a quiet place. Meeting access is provided for this booking only." : undefined
  };
}

export function getDemoCredentials() {
  return { customer: { email: "hello@example.com", password: "Demo@123" }, admin: { email: "admin@deepakcoach.local", password: "Admin@123" } };
}

export function roleIsAllowed(user: SessionUser | null, role: Role) {
  return Boolean(user && user.role === role);
}

export function createEnquiry(input: {
  name: string;
  email: string;
  message: string;
}) {
  const enquiry: Enquiry = {
    id: `enquiry-${randomBytes(8).toString("hex")}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
    status: "NEW",
    createdAt: new Date().toISOString()
  };

  getStore().enquiries.set(enquiry.id, enquiry);

  return enquiry;
}

export function listEnquiries() {
  return Array.from(getStore().enquiries.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

export function markEnquiryRead(id: string) {
  const enquiry = getStore().enquiries.get(id);

  if (!enquiry) {
    return null;
  }

  const updated: Enquiry = {
    ...enquiry,
    status: "READ"
  };

  getStore().enquiries.set(id, updated);

  return updated;
}
