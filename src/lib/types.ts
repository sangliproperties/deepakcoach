export type Role = "CUSTOMER" | "COACH" | "ADMIN";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "FAILED";
export type PaymentStatus = "CREATED" | "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export type Program = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  durationMins: number;
  priceInr: number;
  format: string;
  inclusions: string[];
  eligibility: string;
  expectations: string;
  featured?: boolean;
};

export type AvailabilitySlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  isOpen: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type YouTubeSession = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  videoId?: string;
};

export type Booking = {
  id: string;
  reference: string;
  userId: string;
  programId: string;
  availabilityId: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  cancelledAt?: string;
  rescheduledFrom?: string;
  rescheduleCount?: number;
  accessUrl?: string;
  accessInstructions?: string;
};

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Review = {
  id: string;
  bookingId: string;
  userId: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
  userName?: string;
  programTitle?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export type NotificationStatus = "QUEUED" | "SENT" | "FAILED";
export type NotificationEvent = {
  id: string;
  userId: string;
  bookingId?: string;
  type: string;
  status: NotificationStatus;
  message: string;
  createdAt: string;
};

export type CancellationPolicy = {
  enabled: boolean;
  minimumHours: number;
  allowReschedule: boolean;
  rescheduleLimit: number;
};

export type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
};
