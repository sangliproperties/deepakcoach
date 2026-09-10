import { listPublicPrograms } from "@/lib/demo-store";

export async function GET() {
  return Response.json({ programs: listPublicPrograms() });
}
