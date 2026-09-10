import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteSession, roleIsAllowed, sessionUser } from "@/lib/demo-store";
import type { Role, SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "deepakcoach_session";

export function getCurrentUser(): SessionUser | null {
  return sessionUser(cookies().get(SESSION_COOKIE)?.value);
}

export function requireUser(role?: Role, nextPath = "/book") {
  const user = getCurrentUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
  if (role && !roleIsAllowed(user, role)) redirect("/?error=unauthorized");
  return user;
}

export function clearCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) deleteSession(token);
}
