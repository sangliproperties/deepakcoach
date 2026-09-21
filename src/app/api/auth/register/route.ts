import { z } from "zod";
import { createSession, createUser } from "@/lib/persistence";
import { sessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().max(30).optional()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Please provide a name, valid email, and password of at least 8 characters." }, { status: 400 });
  const user = await createUser(parsed.data);
  if (!user) return Response.json({ error: "An account with that email already exists. Try signing in." }, { status: 409 });
  const response = Response.json({ user }, { status: 201 });
  response.headers.append("Set-Cookie", sessionCookie(await createSession(user.id)));
  return response;
}
