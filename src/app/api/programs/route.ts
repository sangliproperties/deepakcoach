import { listPublicPrograms } from "@/lib/persistence";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ programs: await listPublicPrograms() });
}
