import { getCurrentUser } from "@/lib/auth";
export async function POST() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json(
    {
      error:
        "Upload files with the Add Session or Edit Session form. Those endpoints save both files and metadata together.",
    },
    { status: 409 },
  );
}
