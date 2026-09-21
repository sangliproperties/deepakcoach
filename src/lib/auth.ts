import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteSession, sessionUser } from "@/lib/persistence";
import type { Role, SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "deepakcoach_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  return sessionUser(cookies().get(SESSION_COOKIE)?.value);
}

export async function requireUser(role?: Role, nextPath = "/book") {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
  if (role && user.role !== role && !(role === "CUSTOMER" && user.role === "ADMIN")) redirect("/?error=unauthorized");
  return user;
}

export async function clearCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
}

export function sessionCookie(token: string, maxAge = 60 * 60 * 24 * 7) {
  const secure = process.env.NODE_ENV !== "development" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function expiredSessionCookie() {
  const secure = process.env.NODE_ENV !== "development" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
