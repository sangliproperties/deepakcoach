import "server-only";

import { promisify } from "node:util";
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { Prisma, PrismaClient, Role as PrismaRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { programs as catalogPrograms } from "@/lib/catalog";
import type {
  AvailabilitySlot,
  Booking,
  CancellationPolicy,
  NotificationEvent,
  PaymentStatus,
  Program,
  Review,
  ReviewStatus,
  Role,
  SessionUser,
} from "@/lib/types";
import { retryDelay } from "@/lib/notifications";
import type { PaymentWebhookEvent as NormalizedPaymentWebhookEvent } from "@/lib/payment";

const scrypt = promisify(scryptCallback);
const ACTIVE_BOOKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

type DbClient = PrismaClient | Prisma.TransactionClient;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toUser(user: {
  id: string;
  email: string;
  name: string;
  role: PrismaRole;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  };
}

function toProgram(program: {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  durationMins: number;
  priceInr: number;
  format: string;
  inclusions: Prisma.JsonValue;
  eligibility: string;
  expectations: string;
  active: boolean;
}): Program {
  return {
    id: program.id,
    slug: program.slug,
    title: program.title,
    tagline: program.tagline,
    description: program.description,
    durationMins: program.durationMins,
    priceInr: program.priceInr,
    format: program.format,
    inclusions: Array.isArray(program.inclusions)
      ? program.inclusions.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    eligibility: program.eligibility,
    expectations: program.expectations,
    active: program.active,
  };
}

function toSlot(slot: {
  id: string;
  startsAt: Date;
  endsAt: Date;
  isOpen: boolean;
}): AvailabilitySlot {
  return {
    id: slot.id,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    isOpen: slot.isOpen,
  };
}

function toBooking(booking: {
  id: string;
  reference: string;
  userId: string;
  programId: string;
  availabilityId: string;
  status: string;
  cancelledAt: Date | null;
  rescheduledFromId: string | null;
  rescheduleCount: number;
  accessUrl: string | null;
  accessInstructions: string | null;
  createdAt: Date;
  payment?: { status: string } | null;
}): Booking {
  const paymentIsVerified =
    booking.payment?.status === "PAID" && booking.status === "CONFIRMED";
  return {
    id: booking.id,
    reference: booking.reference,
    userId: booking.userId,
    programId: booking.programId,
    availabilityId: booking.availabilityId,
    status: booking.status as Booking["status"],
    paymentStatus: booking.payment?.status as PaymentStatus | undefined,
    createdAt: booking.createdAt.toISOString(),
    cancelledAt: booking.cancelledAt?.toISOString(),
    rescheduledFrom: booking.rescheduledFromId || undefined,
    rescheduleCount: booking.rescheduleCount,
    accessUrl: paymentIsVerified ? booking.accessUrl || undefined : undefined,
    accessInstructions: paymentIsVerified
      ? booking.accessInstructions || undefined
      : undefined,
  };
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string | null) {
  if (!encoded) return false;
  const [algorithm, salt, expected] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    expectedBuffer.length === actual.length &&
    timingSafeEqual(expectedBuffer, actual)
  );
}

async function findDbUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function findUserByEmail(email: string) {
  const user = await findDbUserByEmail(email);
  return user ? toUser(user) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const email = normalizeEmail(input.email);
  const existing = await findDbUserByEmail(email);
  if (existing) {
    if (!existing.isGuest || existing.passwordHash) return null;
    const upgraded = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim(),
        phone: input.phone?.trim() || existing.phone,
        passwordHash: await hashPassword(input.password),
        isGuest: false,
        registeredAt: new Date(),
      },
    });
    return toUser(upgraded);
  }
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || null,
      passwordHash: await hashPassword(input.password),
      registeredAt: new Date(),
    },
  });
  return toUser(user);
}

export async function createGuestUser(input: {
  name: string;
  email: string;
  phone?: string;
}) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "CUSTOMER") return toUser(existing);
    return null;
  }
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || null,
      isGuest: true,
    },
  });
  return toUser(user);
}

export async function authenticate(email: string, password: string) {
  const user = await findDbUserByEmail(email);
  return user && (await verifyPassword(password, user.passwordHash))
    ? toUser(user)
    : null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

export async function deleteSession(token: string) {
  await prisma.session.updateMany({
    where: { tokenHash: hashSessionToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function sessionUser(token?: string) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date())
    return null;
  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  });
  return toUser(session.user);
}

export async function listPrograms(includeInactive = true) {
  const rows = await prisma.program.findMany({
    where: includeInactive ? undefined : { active: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProgram);
}

export async function listPublicPrograms() {
  return listPrograms(false);
}

export async function getStoredProgram(id: string) {
  const program = await prisma.program.findFirst({
    where: { active: true, OR: [{ id }, { slug: id }] },
  });
  return program ? toProgram(program) : undefined;
}

export async function setProgramActive(programId: string, active: boolean) {
  try {
    return toProgram(
      await prisma.program.update({
        where: { id: programId },
        data: { active },
      }),
    );
  } catch {
    return null;
  }
}

export async function addProgram(actorId: string, input: Omit<Program, "id">) {
  try {
    return toProgram(
      await prisma.program.create({
        data: {
          id: input.slug,
          slug: input.slug,
          title: input.title,
          tagline: input.tagline,
          description: input.description,
          durationMins: input.durationMins,
          priceInr: input.priceInr,
          format: input.format,
          inclusions: input.inclusions,
          eligibility: input.eligibility,
          expectations: input.expectations,
        },
      }),
    );
  } catch {
    return null;
  }
}

export async function updateProgram(
  actorId: string,
  programId: string,
  input: Omit<Program, "id">,
) {
  try {
    // Make sure the program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return null;
    }

    // Prevent duplicate slug
    const duplicateSlug = await prisma.program.findFirst({
      where: {
        slug: input.slug,
        id: {
          not: programId,
        },
      },
    });

    if (duplicateSlug) {
      return null;
    }

    const updatedProgram = await prisma.program.update({
      where: {
        id: programId,
      },

      data: {
        slug: input.slug,
        title: input.title,
        tagline: input.tagline,
        description: input.description,
        durationMins: input.durationMins,
        priceInr: input.priceInr,
        format: input.format,
        inclusions: input.inclusions,
        eligibility: input.eligibility,
        expectations: input.expectations,
      },
    });

    return toProgram(updatedProgram);
  } catch {
    return null;
  }
}

export async function listAvailability() {
  const slots = await prisma.availability.findMany({
    where: { startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
  });
  return slots.map(toSlot);
}

export async function addAvailability(startsAt: string, durationMins: number) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMins * 60_000);
  if (Number.isNaN(start.getTime()) || start <= new Date()) return null;
  const conflict = await prisma.availability.findFirst({
    where: { startsAt: { lt: end }, endsAt: { gt: start } },
  });
  if (conflict) return null;
  return toSlot(
    await prisma.availability.create({
      data: { startsAt: start, endsAt: end },
    }),
  );
}

export async function removeAvailability(id: string) {
  const booking = await prisma.booking.findFirst({
    where: { availabilityId: id, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
  });
  if (booking) return false;
  try {
    await prisma.availability.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function createBooking(input: {
  userId: string;
  programId: string;
  availabilityId: string;
}) {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const program = await tx.program.findFirst({
          where: { id: input.programId, active: true },
        });
        const slot = await tx.availability.findUnique({
          where: { id: input.availabilityId },
        });
        if (!program || !slot || slot.startsAt <= new Date() || !slot.isOpen)
          throw new Error("SLOT_UNAVAILABLE");
        const claimed = await tx.booking.findFirst({
          where: {
            availabilityId: slot.id,
            status: { in: [...ACTIVE_BOOKING_STATUSES] },
          },
        });
        if (claimed) throw new Error("SLOT_ALREADY_BOOKED");
        const claimedSlot = await tx.availability.updateMany({
          where: { id: slot.id, isOpen: true },
          data: { isOpen: false, claimedAt: new Date() },
        });
        if (claimedSlot.count !== 1) throw new Error("SLOT_ALREADY_BOOKED");
        const booking = await tx.booking.create({
          data: {
            reference: `DK-${randomBytes(4).toString("hex").toUpperCase()}`,
            userId: input.userId,
            programId: program.id,
            availabilityId: slot.id,
            status: program.priceInr === 0 ? "CONFIRMED" : "PENDING",
            payment:
              program.priceInr > 0
                ? {
                    create: {
                      provider: "demo",
                      amountInr: program.priceInr,
                      status: "CREATED",
                    },
                  }
                : undefined,
          },
          include: { payment: true },
        });
        await tx.notification.create({
          data: {
            userId: input.userId,
            bookingId: booking.id,
            type: "BOOKING_CREATED",
            status: "QUEUED",
            message: `Booking ${booking.reference} was created and is ${booking.status.toLowerCase()}.`,
          },
        });
        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return { booking: toBooking(result) };
  } catch (error) {
    if (
      error instanceof Error &&
      ["SLOT_UNAVAILABLE", "SLOT_ALREADY_BOOKED"].includes(error.message)
    )
      return {
        error: error.message as "SLOT_UNAVAILABLE" | "SLOT_ALREADY_BOOKED",
      };
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    )
      return { error: "SLOT_ALREADY_BOOKED" as const };
    throw error;
  }
}

export async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  });
  return booking ? toBooking(booking) : undefined;
}

export async function listBookings(userId?: string) {
  const rows = await prisma.booking.findMany({
    where: userId ? { userId } : undefined,
    include: { payment: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toBooking);
}

export async function getPaymentForBooking(bookingId: string) {
  const payment = await prisma.payment.findUnique({ where: { bookingId } });
  return payment
    ? {
        id: payment.id,
        bookingId,
        provider: payment.provider,
        orderId: payment.providerOrderId || "",
        amountInr: payment.amountInr,
        status: payment.status as PaymentStatus,
        paymentId: payment.providerPaymentId || undefined,
      }
    : undefined;
}

export async function setPaymentOrder(
  bookingId: string,
  orderId: string,
  provider = "razorpay",
) {
  const payment = await prisma.payment.update({
    where: { bookingId },
    data: { providerOrderId: orderId, provider, status: "PENDING" },
  });
  return {
    id: payment.id,
    bookingId,
    provider: payment.provider,
    orderId,
    amountInr: payment.amountInr,
    status: payment.status as PaymentStatus,
    paymentId: payment.providerPaymentId || undefined,
  };
}

export async function markPayment(
  bookingId: string,
  status: PaymentStatus,
  paymentId?: string,
) {
  const updated = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { bookingId },
      include: { booking: true },
    });
    if (!payment) return null;
    if (payment.status === "PAID") return payment;
    const bookingStatus =
      status === "PAID"
        ? "CONFIRMED"
        : status === "FAILED"
          ? "FAILED"
          : status === "CANCELLED"
            ? "CANCELLED"
            : payment.booking.status;
    const result = await tx.payment.update({
      where: { bookingId },
      data: {
        status,
        providerPaymentId: paymentId || payment.providerPaymentId,
      },
    });
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: bookingStatus },
    });
    await tx.notification.createMany({
      data: [
        {
          userId: payment.booking.userId,
          bookingId,
          paymentId: payment.id,
          type: `PAYMENT_${status}`,
          status: "QUEUED",
          message: `Payment for booking ${payment.booking.reference} is ${status.toLowerCase()}.`,
          dedupeKey: `payment:${payment.id}:${status}`,
        },
      ],
      skipDuplicates: true,
    });
    return result;
  });
  if (!updated) return null;
  return {
    payment: await getPaymentForBooking(bookingId),
    booking: await getBooking(bookingId),
  };
}

export async function recordCheckoutVerification(
  bookingId: string,
  paymentId: string,
) {
  const payment = await prisma.payment.findUnique({ where: { bookingId } });
  if (!payment || payment.status === "PAID")
    return getPaymentForBooking(bookingId);
  const updated = await prisma.payment.update({
    where: { bookingId },
    data: {
      providerPaymentId: paymentId,
      status: payment.status === "CREATED" ? "PENDING" : payment.status,
    },
  });
  return {
    id: updated.id,
    bookingId,
    provider: updated.provider,
    orderId: updated.providerOrderId || "",
    amountInr: updated.amountInr,
    status: updated.status as PaymentStatus,
    paymentId: updated.providerPaymentId || undefined,
  };
}

export async function processPaymentWebhook(
  event: NormalizedPaymentWebhookEvent,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.paymentWebhookEvent.findUnique({
        where: {
          provider_providerEventId: {
            provider: event.provider,
            providerEventId: event.providerEventId,
          },
        },
      });
      if (existing)
        return { status: "duplicate" as const, eventId: existing.id };

      const payment = event.orderId
        ? await tx.payment.findFirst({
            where: { provider: event.provider, providerOrderId: event.orderId },
            include: { booking: true },
          })
        : event.paymentId
          ? await tx.payment.findFirst({
              where: {
                provider: event.provider,
                providerPaymentId: event.paymentId,
              },
              include: { booking: true },
            })
          : null;
      const storedEvent = await tx.paymentWebhookEvent.create({
        data: {
          provider: event.provider,
          providerEventId: event.providerEventId,
          orderId: event.orderId,
          providerPaymentId: event.paymentId,
          eventType: event.eventType,
          paymentId: payment?.id,
          status: payment ? "RECEIVED" : "REJECTED",
          outcome: payment ? undefined : "unknown_payment",
        },
      });
      if (!payment) {
        await tx.paymentWebhookEvent.update({
          where: { id: storedEvent.id },
          data: {
            processedAt: new Date(),
            failureReason: "No matching persisted payment.",
          },
        });
        return { status: "rejected" as const, eventId: storedEvent.id };
      }

      const current = payment.status as PaymentStatus;
      const terminal = current === "PAID";
      const regressing =
        terminal && (event.state === "failed" || event.state === "cancelled");
      const nextStatus: PaymentStatus = regressing
        ? current
        : event.state === "paid"
          ? "PAID"
          : event.state === "failed"
            ? "FAILED"
            : event.state === "cancelled"
              ? "CANCELLED"
              : current === "CREATED"
                ? "PENDING"
                : current;
      const bookingStatus =
        nextStatus === "PAID"
          ? "CONFIRMED"
          : nextStatus === "FAILED"
            ? "FAILED"
            : nextStatus === "CANCELLED"
              ? "CANCELLED"
              : payment.booking.status;
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          providerPaymentId: event.paymentId || payment.providerPaymentId,
        },
      });
      if (
        bookingStatus !== payment.booking.status &&
        !(payment.booking.status === "CONFIRMED" && nextStatus !== "PAID")
      ) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: bookingStatus },
        });
      }
      if (!regressing && nextStatus !== current) {
        await tx.notification.createMany({
          data: [
            {
              userId: payment.booking.userId,
              bookingId: payment.bookingId,
              paymentId: payment.id,
              type: `PAYMENT_${nextStatus}`,
              status: "QUEUED",
              message: `Payment for booking ${payment.booking.reference} is ${nextStatus.toLowerCase()}.`,
              dedupeKey: `payment:${payment.id}:${nextStatus}`,
            },
          ],
          skipDuplicates: true,
        });
      }
      await tx.paymentWebhookEvent.update({
        where: { id: storedEvent.id },
        data: {
          status: "PROCESSED",
          outcome: regressing
            ? "ignored_terminal_state"
            : `payment_${nextStatus.toLowerCase()}`,
          processedAt: new Date(),
        },
      });
      return {
        status: "processed" as const,
        eventId: storedEvent.id,
        paymentStatus: nextStatus,
      };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: "duplicate" as const };
    }
    throw error;
  }
}

export async function cancelBooking(
  id: string,
  userId: string,
  isAdmin = false,
) {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: { payment: true, availability: true },
    });
    if (!booking || (!isAdmin && booking.userId !== userId))
      return { error: "NOT_FOUND" as const };
    if (booking.status === "CANCELLED") return { booking: toBooking(booking) };
    const policy = await tx.businessPolicy.findUnique({
      where: { id: "default" },
    });
    const hoursUntil =
      (booking.availability.startsAt.getTime() - Date.now()) / 3_600_000;
    if (
      !isAdmin &&
      (!policy?.cancellationEnabled ||
        hoursUntil < (policy.minimumNoticeHours ?? 12))
    )
      return { error: "CANCELLATION_WINDOW_CLOSED" as const };
    const updated = await tx.booking.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: { payment: true },
    });
    await tx.availability.update({
      where: { id: booking.availabilityId },
      data: { isOpen: true, claimedAt: null },
    });
    if (booking.payment && booking.payment.status !== "PAID")
      await tx.payment.update({
        where: { bookingId: id },
        data: { status: "CANCELLED" },
      });
    await tx.notification.create({
      data: {
        userId: booking.userId,
        bookingId: id,
        type: "BOOKING_CANCELLED",
        status: "QUEUED",
        message: `Booking ${booking.reference} was cancelled.`,
      },
    });
    return { booking: toBooking(updated) };
  });
  return result;
}

export async function rescheduleBooking(
  id: string,
  userId: string,
  availabilityId: string,
  isAdmin = false,
) {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id },
          include: { availability: true, payment: true },
        });
        const slot = await tx.availability.findUnique({
          where: { id: availabilityId },
        });
        if (
          !booking ||
          (!isAdmin && booking.userId !== userId) ||
          !slot ||
          !slot.isOpen ||
          slot.startsAt <= new Date()
        )
          return { error: "INVALID_RESCHEDULE" as const };
        if (
          !ACTIVE_BOOKING_STATUSES.includes(
            booking.status as (typeof ACTIVE_BOOKING_STATUSES)[number],
          )
        )
          return { error: "INVALID_RESCHEDULE" as const };
        const policy = await tx.businessPolicy.findUnique({
          where: { id: "default" },
        });
        if (
          !isAdmin &&
          (!policy?.allowReschedule ||
            booking.rescheduleCount >= (policy.rescheduleLimit ?? 1))
        )
          return { error: "RESCHEDULE_LIMIT_REACHED" as const };
        const occupied = await tx.booking.findFirst({
          where: {
            id: { not: id },
            availabilityId,
            status: { in: [...ACTIVE_BOOKING_STATUSES] },
          },
        });
        if (occupied) return { error: "SLOT_ALREADY_BOOKED" as const };
        const claimed = await tx.availability.updateMany({
          where: { id: availabilityId, isOpen: true },
          data: { isOpen: false, claimedAt: new Date() },
        });
        if (claimed.count !== 1)
          return { error: "SLOT_ALREADY_BOOKED" as const };
        await tx.availability.update({
          where: { id: booking.availabilityId },
          data: { isOpen: true, claimedAt: null },
        });
        const updated = await tx.booking.update({
          where: { id },
          data: {
            availabilityId,
            rescheduledFromId: booking.availabilityId,
            rescheduleCount: { increment: 1 },
          },
          include: { payment: true },
        });
        await tx.notification.create({
          data: {
            userId: booking.userId,
            bookingId: id,
            type: "BOOKING_RESCHEDULED",
            status: "QUEUED",
            message: `Booking ${booking.reference} was moved to a new time.`,
          },
        });
        return { booking: toBooking(updated) };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return result;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    )
      return { error: "SLOT_ALREADY_BOOKED" as const };
    throw error;
  }
}

export async function getBookingAccess(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true, availability: true, program: true },
  });
  if (!booking) return null;
  return {
    ...toBooking(booking),
    startsAt: booking.availability.startsAt.toISOString(),
    endsAt: booking.availability.endsAt.toISOString(),
    programTitle: booking.program.title,
  };
}

export async function listNotifications(userId?: string) {
  const rows = await prisma.notification.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(
    (item): NotificationEvent => ({
      id: item.id,
      userId: item.userId,
      bookingId: item.bookingId || undefined,
      paymentId: item.paymentId || undefined,
      type: item.type,
      channel: item.channel as NotificationEvent["channel"],
      status: item.status,
      message: item.message,
      attemptCount: item.attemptCount,
      lastAttemptAt: item.lastAttemptAt?.toISOString(),
      failureReason: item.failureReason || undefined,
      nextRetryAt: item.nextRetryAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
    }),
  );
}

export async function listPaymentWebhookEvents() {
  const rows = await prisma.paymentWebhookEvent.findMany({
    orderBy: { receivedAt: "desc" },
    take: 200,
  });
  return rows.map((event) => ({
    id: event.id,
    provider: event.provider,
    providerEventId: event.providerEventId,
    orderId: event.orderId || undefined,
    paymentId: event.providerPaymentId || undefined,
    eventType: event.eventType,
    status: event.status,
    outcome: event.outcome || undefined,
    failureReason: event.failureReason || undefined,
    receivedAt: event.receivedAt.toISOString(),
    processedAt: event.processedAt?.toISOString(),
  }));
}

export async function retryNotification(id: string, actorId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (
    !notification ||
    notification.status === "SENT" ||
    notification.attemptCount >= 5
  )
    return null;
  const now = new Date();
  const attemptCount = notification.attemptCount + 1;
  const updated = await prisma.notification.update({
    where: { id },
    data: {
      status: "QUEUED",
      attemptCount,
      lastAttemptAt: now,
      failureReason: null,
      nextRetryAt: new Date(now.getTime() + retryDelay(attemptCount)),
    },
  });
  await prisma.operationalAudit.create({
    data: {
      actorId,
      action: "RETRY_NOTIFICATION",
      entity: "NOTIFICATION",
      entityId: id,
    },
  });
  return {
    id: updated.id,
    status: updated.status,
    attemptCount: updated.attemptCount,
    nextRetryAt: updated.nextRetryAt?.toISOString(),
  };
}

export async function deliverNotification(id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (
    !notification ||
    notification.status === "SENT" ||
    notification.attemptCount >= 5
  )
    return null;
  const now = new Date();
  const attemptCount = notification.attemptCount + 1;
  if (notification.channel === "IN_APP") {
    const sent = await prisma.notification.update({
      where: { id },
      data: {
        status: "SENT",
        attemptCount,
        lastAttemptAt: now,
        failureReason: null,
        nextRetryAt: null,
      },
    });
    return {
      id: sent.id,
      status: sent.status,
      attemptCount: sent.attemptCount,
    };
  }
  const failed = await prisma.notification.update({
    where: { id },
    data: {
      status: "FAILED",
      attemptCount,
      lastAttemptAt: now,
      failureReason: "Delivery provider is not configured.",
      nextRetryAt:
        attemptCount < 5
          ? new Date(now.getTime() + retryDelay(attemptCount))
          : null,
    },
  });
  return {
    id: failed.id,
    status: failed.status,
    attemptCount: failed.attemptCount,
    nextRetryAt: failed.nextRetryAt?.toISOString(),
  };
}

export async function listReviews(status?: ReviewStatus) {
  const rows = await prisma.review.findMany({
    where: status ? { status } : undefined,
    include: { user: true, booking: { include: { program: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(
    (item): Review => ({
      id: item.id,
      bookingId: item.bookingId,
      userId: item.userId,
      rating: item.rating,
      text: item.text,
      status: item.status as ReviewStatus,
      createdAt: item.createdAt.toISOString(),
      userName: item.user.name,
      programTitle: item.booking.program.title,
    }),
  );
}

export async function submitReview(input: {
  userId: string;
  bookingId: string;
  rating: number;
  text: string;
}) {
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, userId: input.userId, status: "CONFIRMED" },
  });
  if (!booking) return { error: "BOOKING_NOT_ELIGIBLE" as const };
  try {
    const review = await prisma.review.create({
      data: {
        bookingId: input.bookingId,
        userId: input.userId,
        rating: input.rating,
        text: input.text.trim(),
      },
    });
    return {
      review: {
        ...review,
        createdAt: review.createdAt.toISOString(),
        status: review.status as ReviewStatus,
      },
    };
  } catch {
    return { error: "REVIEW_EXISTS" as const };
  }
}

export async function moderateReview(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });
    return {
      ...review,
      createdAt: review.createdAt.toISOString(),
      status: review.status as ReviewStatus,
    };
  } catch {
    return null;
  }
}

export async function getCancellationPolicy(): Promise<CancellationPolicy> {
  const policy = await prisma.businessPolicy.findUnique({
    where: { id: "default" },
  });
  return {
    enabled: policy?.cancellationEnabled ?? true,
    minimumHours: policy?.minimumNoticeHours ?? 12,
    allowReschedule: policy?.allowReschedule ?? true,
    rescheduleLimit: policy?.rescheduleLimit ?? 1,
  };
}

export async function updateCancellationPolicy(
  input: Partial<CancellationPolicy>,
) {
  const current = await getCancellationPolicy();
  const next = { ...current, ...input };
  await prisma.businessPolicy.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      cancellationEnabled: next.enabled,
      minimumNoticeHours: next.minimumHours,
      allowReschedule: next.allowReschedule,
      rescheduleLimit: next.rescheduleLimit,
    },
    update: {
      cancellationEnabled: next.enabled,
      minimumNoticeHours: next.minimumHours,
      allowReschedule: next.allowReschedule,
      rescheduleLimit: next.rescheduleLimit,
    },
  });
  return next;
}

export async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return users.map(toUser);
}

export async function listPayments() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return payments.map((payment) => ({
    id: payment.id,
    bookingId: payment.bookingId,
    orderId: payment.providerOrderId || "",
    amountInr: payment.amountInr,
    status: payment.status as PaymentStatus,
    paymentId: payment.providerPaymentId || undefined,
  }));
}

export async function updateUserRole(id: string, role: Role) {
  try {
    return toUser(await prisma.user.update({ where: { id }, data: { role } }));
  } catch {
    return null;
  }
}

export async function seedReferenceData() {
  for (const program of catalogPrograms) {
    await prisma.program.upsert({
      where: { id: program.id },
      create: {
        id: program.id,
        slug: program.slug,
        title: program.title,
        tagline: program.tagline,
        description: program.description,
        durationMins: program.durationMins,
        priceInr: program.priceInr,
        format: program.format,
        inclusions: program.inclusions,
        eligibility: program.eligibility,
        expectations: program.expectations,
      },
      update: {
        slug: program.slug,
        title: program.title,
        tagline: program.tagline,
        description: program.description,
        durationMins: program.durationMins,
        priceInr: program.priceInr,
        format: program.format,
        inclusions: program.inclusions,
        eligibility: program.eligibility,
        expectations: program.expectations,
      },
    });
  }
  await prisma.businessPolicy.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}
