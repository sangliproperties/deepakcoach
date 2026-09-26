import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  deleteSession,
  roleIsAllowed,
  sessionUser
} from "@/lib/auth-store";

import type { Role, SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "deepakcoach_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;

  return sessionUser(token);
}

export async function requireUser(
  role?: Role,
  nextPath = "/book"
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
  }

  if (role && !roleIsAllowed(user, role)) {
    redirect("/?error=unauthorized");
  }

  return user;
}

export async function clearCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSession(token);
  }
}