import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus } from "@prisma/client";


// =====================================================
// AVAILABILITY
// =====================================================

export async function listDatabaseAvailability() {
    const slots = await prisma.availability.findMany({
        orderBy: {
            startsAt: "asc"
        },
        include: {
            bookings: {
                where: {
                    status: {
                        in: ["PENDING", "CONFIRMED"]
                    }
                },
                select: {
                    id: true
                }
            }
        }
    });

    return slots.map((slot) => ({
        id: slot.id,
        startsAt: slot.startsAt.toISOString(),
        endsAt: slot.endsAt.toISOString(),
        isOpen:
            slot.isOpen &&
            slot.bookings.length === 0
    }));
}


export async function addDatabaseAvailability(
    startsAt: string,
    durationMins: number
) {
    const start = new Date(startsAt);

    if (
        Number.isNaN(start.getTime()) ||
        start <= new Date()
    ) {
        return null;
    }

    const end = new Date(
        start.getTime() +
        durationMins * 60_000
    );

    const conflict =
        await prisma.availability.findFirst({
            where: {
                startsAt: {
                    lt: end
                },
                endsAt: {
                    gt: start
                }
            }
        });

    if (conflict) {
        return null;
    }

    const slot =
        await prisma.availability.create({
            data: {
                startsAt: start,
                endsAt: end,
                isOpen: true
            }
        });

    return {
        id: slot.id,
        startsAt: slot.startsAt.toISOString(),
        endsAt: slot.endsAt.toISOString(),
        isOpen: slot.isOpen
    };
}


export async function removeDatabaseAvailability(
    id: string
) {
    const booking =
        await prisma.booking.findFirst({
            where: {
                availabilityId: id,
                status: {
                    not: "CANCELLED"
                }
            }
        });

    if (booking) {
        return false;
    }

    const result =
        await prisma.availability.deleteMany({
            where: {
                id
            }
        });

    return result.count > 0;
}


// =====================================================
// BOOKINGS
// =====================================================

export async function createDatabaseBooking(input: {
    userId: string;
    programId: string;
    availabilityId: string;
}) {
    return prisma.$transaction(async (tx) => {

        const program =
            await tx.program.findUnique({
                where: {
                    id: input.programId
                }
            });

        if (!program || !program.active) {
            return {
                error: "SLOT_UNAVAILABLE" as const
            };
        }

        const slot =
            await tx.availability.findUnique({
                where: {
                    id: input.availabilityId
                }
            });

        if (
            !slot ||
            !slot.isOpen ||
            slot.startsAt <= new Date()
        ) {
            return {
                error: "SLOT_UNAVAILABLE" as const
            };
        }

        const existingBooking =
            await tx.booking.findFirst({
                where: {
                    availabilityId:
                        input.availabilityId,

                    status: {
                        in: [
                            "PENDING",
                            "CONFIRMED"
                        ]
                    }
                }
            });

        if (existingBooking) {
            return {
                error: "SLOT_ALREADY_BOOKED" as const
            };
        }

        const reference =
            `DK-${randomBytes(4)
                .toString("hex")
                .toUpperCase()}`;

        const booking =
            await tx.booking.create({
                data: {
                    reference,
                    userId: input.userId,
                    programId: input.programId,
                    availabilityId:
                        input.availabilityId,

                    status:
                        program.priceInr === 0
                            ? "CONFIRMED"
                            : "PENDING",

                    ...(program.priceInr > 0
                        ? {
                            payment: {
                                create: {
                                    amountInr: program.priceInr,
                                    status: "CREATED"
                                }
                            }
                        }
                        : {})
                },

                include: {
                    payment: true
                }
            });

        return {
            booking
        };
    });
}


export async function getDatabaseBooking(
    id: string
) {
    return prisma.booking.findUnique({
        where: {
            id
        },

        include: {
            payment: true,
            program: true,
            availability: true,
            user: true
        }
    });
}


export async function listDatabaseBookings(
    userId?: string
) {
    return prisma.booking.findMany({
        where: userId
            ? {
                userId
            }
            : undefined,

        orderBy: {
            createdAt: "desc"
        },

        include: {
            payment: true,
            program: true,
            availability: true
        }
    });
}


// =====================================================
// PAYMENT
// =====================================================

export async function getDatabasePaymentForBooking(
    bookingId: string
) {
    return prisma.payment.findUnique({
        where: {
            bookingId
        }
    });
}


export async function setDatabasePaymentOrder(
    bookingId: string,
    orderId: string
) {
    return prisma.payment.update({
        where: {
            bookingId
        },

        data: {
            providerOrderId: orderId
        }
    });
}


export async function markDatabasePayment(
    bookingId: string,
    status: PaymentStatus,
    paymentId?: string
) {
    return prisma.$transaction(async (tx) => {

        const payment =
            await tx.payment.findUnique({
                where: {
                    bookingId
                }
            });

        const booking =
            await tx.booking.findUnique({
                where: {
                    id: bookingId
                }
            });

        if (!payment || !booking) {
            return null;
        }

        if (payment.status === "PAID") {
            return {
                payment,
                booking
            };
        }

        const updatedPayment =
            await tx.payment.update({
                where: {
                    bookingId
                },

                data: {
                    status,
                    providerPaymentId:
                        paymentId || undefined
                }
            });

        let bookingStatus =
            booking.status;

        if (status === "PAID") {
            bookingStatus = "CONFIRMED";
        }

        if (status === "FAILED") {
            bookingStatus = "FAILED";
        }

        if (status === "CANCELLED") {
            bookingStatus = "CANCELLED";
        }

        const updatedBooking =
            await tx.booking.update({
                where: {
                    id: bookingId
                },

                data: {
                    status: bookingStatus
                }
            });

        return {
            payment: updatedPayment,
            booking: updatedBooking
        };
    });
}


// =====================================================
// CANCEL
// =====================================================

export async function cancelDatabaseBooking(
    id: string,
    userId: string,
    isAdmin = false
) {
    const booking =
        await prisma.booking.findUnique({
            where: {
                id
            },

            include: {
                availability: true,
                payment: true
            }
        });

    if (
        !booking ||
        (!isAdmin &&
            booking.userId !== userId)
    ) {
        return {
            error: "NOT_FOUND" as const
        };
    }

    if (booking.status === "CANCELLED") {
        return {
            booking
        };
    }

    /*
     * Your existing demo-store has configurable
     * cancellation-policy logic.
     *
     * We are preserving the basic cancellation here.
     * We can migrate CancellationPolicy separately.
     */

    const updated =
        await prisma.booking.update({
            where: {
                id
            },

            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),

                ...(booking.payment &&
                    booking.payment.status !== "PAID"
                    ? {
                        payment: {
                            update: {
                                status: "CANCELLED"
                            }
                        }
                    }
                    : {})
            },

            include: {
                payment: true,
                availability: true,
                program: true
            }
        });

    return {
        booking: updated
    };
}


// =====================================================
// RESCHEDULE
// =====================================================

export async function rescheduleDatabaseBooking(
    id: string,
    userId: string,
    availabilityId: string,
    isAdmin = false
) {
    return prisma.$transaction(async (tx) => {

        const booking =
            await tx.booking.findUnique({
                where: {
                    id
                }
            });

        if (
            !booking ||
            (!isAdmin &&
                booking.userId !== userId)
        ) {
            return {
                error: "NOT_FOUND" as const
            };
        }

        const slot =
            await tx.availability.findUnique({
                where: {
                    id: availabilityId
                }
            });

        if (
            !slot ||
            !slot.isOpen ||
            slot.startsAt <= new Date()
        ) {
            return {
                error: "INVALID_RESCHEDULE" as const
            };
        }

        const claimed =
            await tx.booking.findFirst({
                where: {
                    availabilityId,

                    id: {
                        not: id
                    },

                    status: {
                        in: [
                            "PENDING",
                            "CONFIRMED"
                        ]
                    }
                }
            });

        if (claimed) {
            return {
                error: "SLOT_ALREADY_BOOKED" as const
            };
        }

        const updated =
            await tx.booking.update({
                where: {
                    id
                },

                data: {
                    rescheduledFromId:
                        booking.availabilityId,

                    availabilityId,

                    rescheduleCount: {
                        increment: 1
                    }
                },

                include: {
                    payment: true,
                    program: true,
                    availability: true
                }
            });

        return {
            booking: updated
        };
    });
}


// =====================================================
// ADMIN SCHEDULE
// =====================================================

export async function listAdminBookings(input?: {
    startDate?: Date;
    endDate?: Date;
    paymentStatus?: PaymentStatus;
}) {
    return prisma.booking.findMany({

        where: {
            ...(input?.startDate ||
                input?.endDate
                ? {
                    availability: {
                        startsAt: {
                            ...(input?.startDate
                                ? {
                                    gte:
                                        input.startDate
                                }
                                : {}),

                            ...(input?.endDate
                                ? {
                                    lt:
                                        input.endDate
                                }
                                : {})
                        }
                    }
                }
                : {}),

            ...(input?.paymentStatus
                ? {
                    payment: {
                        is: {
                            status:
                                input.paymentStatus
                        }
                    }
                }
                : {})
        },

        select: {
            id: true,
            reference: true,
            status: true,
            createdAt: true,
            cancelledAt: true,

            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },

            program: {
                select: {
                    id: true,
                    title: true,
                    priceInr: true,
                    durationMins: true
                }
            },

            availability: {
                select: {
                    id: true,
                    startsAt: true,
                    endsAt: true
                }
            },

            payment: {
                select: {
                    id: true,
                    amountInr: true,
                    status: true,
                    providerOrderId: true,
                    providerPaymentId: true
                }
            }
        },

        orderBy: {
            availability: {
                startsAt: "asc"
            }
        }
    });
}