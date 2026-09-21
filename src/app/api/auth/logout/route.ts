import { cookies } from "next/headers";
import { deleteSession } from "@/lib/persistence";
import { expiredSessionCookie, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", expiredSessionCookie());
  return response;
}
