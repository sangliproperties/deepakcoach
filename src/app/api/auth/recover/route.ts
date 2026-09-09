import { z } from "zod";
import { findUserByEmail } from "@/lib/demo-store";

export async function POST(request: Request) {
  const parsed = z.object({ email: z.string().email() }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  findUserByEmail(parsed.data.email);
  return Response.json({ message: "If an account exists, recovery guidance will be sent. In demo mode, no email is dispatched." });
}
