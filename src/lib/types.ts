export type Role = "CUSTOMER" | "ADMIN";
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

export type Booking = {
  id: string;
  reference: string;
  userId: string;
  programId: string;
  availabilityId: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  createdAt: string;
};
