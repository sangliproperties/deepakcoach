export async function POST() {
  return Response.json(
    { error: "Demo checkout has been permanently disabled" },
    { status: 410 },
  );
}
