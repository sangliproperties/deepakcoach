import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { Role, SessionUser } from "@/lib/types";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function publicUser(user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
}): SessionUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        role: user.role
    };
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {
            email: email.trim().toLowerCase()
        }
    });
}

export async function createUser(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
}) {
    const email = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return null;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
        data: {
            name: input.name.trim(),
            email,
            passwordHash,
            phone: input.phone?.trim() || null,
            role: "CUSTOMER"
        }
    });

    return publicUser(user);
}

export async function authenticate(
    email: string,
    password: string
): Promise<SessionUser | null> {
    const user = await prisma.user.findUnique({
        where: {
            email: email.trim().toLowerCase()
        }
    });

    if (!user) {
        return null;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        return null;
    }

    return publicUser(user);
}

export async function createSession(userId: string) {
    const token = randomBytes(32).toString("hex");

    const expiresAt = new Date(
        Date.now() + SESSION_DURATION_MS
    );

    await prisma.session.create({
        data: {
            token,
            userId,
            expiresAt
        }
    });

    return token;
}

export async function deleteSession(token: string) {
    await prisma.session.deleteMany({
        where: {
            token
        }
    });
}

export async function sessionUser(
    token?: string
): Promise<SessionUser | null> {
    if (!token) {
        return null;
    }

    const session = await prisma.session.findUnique({
        where: {
            token
        },
        include: {
            user: true
        }
    });

    if (!session) {
        return null;
    }

    if (session.expiresAt <= new Date()) {
        await prisma.session.delete({
            where: {
                id: session.id
            }
        });

        return null;
    }

    return publicUser(session.user);
}

export function roleIsAllowed(
    user: SessionUser | null,
    role: Role
) {
    if (!user) {
        return false;
    }

    if (user.role === "ADMIN") {
        return true;
    }

    return user.role === role;
}

export async function listDatabaseUsers() {
    return prisma.user.findMany({
        orderBy: {
            createdAt: "desc"
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

export async function updateDatabaseUserRole(
    id: string,
    role: Role
) {
    return prisma.user.update({
        where: {
            id
        },
        data: {
            role
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
}