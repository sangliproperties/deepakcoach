import "server-only";

import * as demo from "@/lib/demo-store";
import { persistenceMode } from "@/lib/persistence-mode";
import * as prismaRepo from "@/lib/prisma-repository";
import type {
  CancellationPolicy,
  PaymentStatus,
  Program,
  ReviewStatus,
  Role,
} from "@/lib/types";
import type { PaymentWebhookEvent } from "@/lib/payment";

export { persistenceMode };

export async function findUserByEmail(email: string) {
  if (persistenceMode === "prisma") return prismaRepo.findUserByEmail(email);
  const user = demo.findUserByEmail(email);
  return user ? demo.publicUser(user) : null;
}
export const createUser = (input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) =>
  persistenceMode === "prisma"
    ? prismaRepo.createUser(input)
    : Promise.resolve(demo.createUser(input));
export const createGuestUser = (input: {
  name: string;
  email: string;
  phone?: string;
}) =>
  persistenceMode === "prisma"
    ? prismaRepo.createGuestUser(input)
    : Promise.resolve(demo.createGuestUser(input));
export const authenticate = (email: string, password: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.authenticate(email, password)
    : Promise.resolve(demo.authenticate(email, password));
export const createSession = (userId: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.createSession(userId)
    : Promise.resolve(demo.createSession(userId));
export const deleteSession = (token: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.deleteSession(token)
    : Promise.resolve(demo.deleteSession(token));
export const sessionUser = (token?: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.sessionUser(token)
    : Promise.resolve(demo.sessionUser(token));

export const listPublicPrograms = () =>
  persistenceMode === "prisma"
    ? prismaRepo.listPublicPrograms()
    : Promise.resolve(demo.listPublicPrograms());

export const listPrograms = () =>
  persistenceMode === "prisma"
    ? prismaRepo.listPrograms()
    : Promise.resolve(demo.listPrograms());

export const getStoredProgram = (id: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.getStoredProgram(id)
    : Promise.resolve(demo.getStoredProgram(id));

export const setProgramActive = (id: string, active: boolean) =>
  persistenceMode === "prisma"
    ? prismaRepo.setProgramActive(id, active)
    : Promise.resolve(demo.setProgramActive(id, active));

export const addProgram = (actorId: string, input: Omit<Program, "id">) =>
  persistenceMode === "prisma"
    ? prismaRepo.addProgram(actorId, input)
    : Promise.resolve(demo.addProgram(actorId, input));

export const updateProgram = (
  actorId: string,
  id: string,
  input: Omit<Program, "id">,
) =>
  persistenceMode === "prisma"
    ? prismaRepo.updateProgram(actorId, id, input)
    : Promise.resolve(demo.updateProgram(actorId, id, input));
export const listAvailability = () =>
  persistenceMode === "prisma"
    ? prismaRepo.listAvailability()
    : Promise.resolve(demo.listAvailability());
export const addAvailability = (startsAt: string, durationMins: number) =>
  persistenceMode === "prisma"
    ? prismaRepo.addAvailability(startsAt, durationMins)
    : Promise.resolve(demo.addAvailability(startsAt, durationMins));
export const removeAvailability = (id: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.removeAvailability(id)
    : Promise.resolve(demo.removeAvailability(id));
export const createBooking = (input: {
  userId: string;
  programId: string;
  availabilityId: string;
}) =>
  persistenceMode === "prisma"
    ? prismaRepo.createBooking(input)
    : Promise.resolve(demo.createBooking(input));
export const getBooking = (id: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.getBooking(id)
    : Promise.resolve(demo.getBooking(id));
export const listBookings = (userId?: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.listBookings(userId)
    : Promise.resolve(
        demo
          .listBookings()
          .filter((booking) => !userId || booking.userId === userId),
      );
export const getPaymentForBooking = (id: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.getPaymentForBooking(id)
    : Promise.resolve(demo.getPaymentForBooking(id));
export const setPaymentOrder = (
  id: string,
  orderId: string,
  provider = "razorpay",
) =>
  persistenceMode === "prisma"
    ? prismaRepo.setPaymentOrder(id, orderId, provider)
    : Promise.resolve(demo.setPaymentOrder(id, orderId));
export const markPayment = (
  id: string,
  status: PaymentStatus,
  paymentId?: string,
) =>
  persistenceMode === "prisma"
    ? prismaRepo.markPayment(id, status, paymentId)
    : Promise.resolve(demo.markPayment(id, status, paymentId));
export const recordCheckoutVerification = (id: string, paymentId: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.recordCheckoutVerification(id, paymentId)
    : Promise.resolve(demo.recordCheckoutVerification(id, paymentId));
export const processPaymentWebhook = (event: PaymentWebhookEvent) =>
  persistenceMode === "prisma"
    ? prismaRepo.processPaymentWebhook(event)
    : Promise.resolve(demo.processPaymentWebhook(event));
export const cancelBooking = (id: string, userId: string, isAdmin = false) =>
  persistenceMode === "prisma"
    ? prismaRepo.cancelBooking(id, userId, isAdmin)
    : Promise.resolve(demo.cancelBooking(id, userId, isAdmin));
export const rescheduleBooking = (
  id: string,
  userId: string,
  availabilityId: string,
  isAdmin = false,
) =>
  persistenceMode === "prisma"
    ? prismaRepo.rescheduleBooking(id, userId, availabilityId, isAdmin)
    : Promise.resolve(
        demo.rescheduleBooking(id, userId, availabilityId, isAdmin),
      );
export const getBookingAccess = (id: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.getBookingAccess(id)
    : Promise.resolve(demo.getBookingAccess(id));

export const listNotifications = (userId?: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.listNotifications(userId)
    : Promise.resolve(demo.listNotifications(userId));
export const listPaymentWebhookEvents = () =>
  persistenceMode === "prisma"
    ? prismaRepo.listPaymentWebhookEvents()
    : Promise.resolve([]);
export const retryNotification = (id: string, actorId: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.retryNotification(id, actorId)
    : Promise.resolve(null);
export const deliverNotification = (id: string) =>
  persistenceMode === "prisma"
    ? prismaRepo.deliverNotification(id)
    : Promise.resolve(null);
export const listReviews = (status?: ReviewStatus) =>
  persistenceMode === "prisma"
    ? prismaRepo.listReviews(status)
    : Promise.resolve(demo.listReviews(status));
export const submitReview = (input: {
  userId: string;
  bookingId: string;
  rating: number;
  text: string;
}) =>
  persistenceMode === "prisma"
    ? prismaRepo.submitReview(input)
    : Promise.resolve(demo.submitReview(input));
export const moderateReview = (id: string, status: "APPROVED" | "REJECTED") =>
  persistenceMode === "prisma"
    ? prismaRepo.moderateReview(id, status)
    : Promise.resolve(demo.moderateReview(id, status));
export const getCancellationPolicy = () =>
  persistenceMode === "prisma"
    ? prismaRepo.getCancellationPolicy()
    : Promise.resolve(demo.getCancellationPolicy());
export const updateCancellationPolicy = (input: Partial<CancellationPolicy>) =>
  persistenceMode === "prisma"
    ? prismaRepo.updateCancellationPolicy(input)
    : Promise.resolve(demo.updateCancellationPolicy(input));
export const listUsers = () =>
  persistenceMode === "prisma"
    ? prismaRepo.listUsers()
    : Promise.resolve(demo.listUsers());
export const listPayments = () =>
  persistenceMode === "prisma"
    ? prismaRepo.listPayments()
    : Promise.resolve(demo.listPayments());
export const updateUserRole = (id: string, role: Role) =>
  persistenceMode === "prisma"
    ? prismaRepo.updateUserRole(id, role)
    : Promise.resolve(demo.updateUserRole(id, role));
