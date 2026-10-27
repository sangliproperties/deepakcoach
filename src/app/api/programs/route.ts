
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: {
        active: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return Response.json({ programs });
  } catch (error) {
    console.error("Could not load programs:", error);

    return Response.json(
      { error: "Could not load programs." },
      { status: 500 }
    );
  }
}
