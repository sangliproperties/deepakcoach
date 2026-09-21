import { z } from "zod";
import { authenticate, createSession } from "@/lib/persistence";
import { sessionCookie } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Enter a valid email and password." }, { status: 400 });
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  const response = Response.json({ user });
  response.headers.append("Set-Cookie", sessionCookie(await createSession(user.id)));
  return response;
}
