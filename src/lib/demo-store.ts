import { createHash, randomBytes } from "node:crypto";
import { programs } from "@/lib/catalog";
import type { AvailabilitySlot, Booking, PaymentStatus, Role, SessionUser } from "@/lib/types";

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

type Store = {
  users: Map<string, StoredUser>;
  sessions: Map<string, string>;
  availability: AvailabilitySlot[];
  bookings: Map<string, StoredBooking>;
  payments: Map<string, StoredPayment>;
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
    globalStore.__deepakCoachStore = {
      users: new Map([
        [admin.id, admin],
        [customer.id, customer]
      ]),
      sessions: new Map(),
      availability: seedAvailability(),
      bookings: new Map(),
      payments: new Map()
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
  const program = programs.find((item) => item.id === input.programId);
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
    createdAt: new Date().toISOString()
  };
  store.bookings.set(id, booking);
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
  return { payment, booking };
}

export function getDemoCredentials() {
  return { customer: { email: "hello@example.com", password: "Demo@123" }, admin: { email: "admin@deepakcoach.local", password: "Admin@123" } };
}

export function roleIsAllowed(user: SessionUser | null, role: Role) {
  return Boolean(user && user.role === role);
}
