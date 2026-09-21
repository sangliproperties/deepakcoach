import { getPaymentProvider } from "@/lib/payment";
import { processPaymentWebhook } from "@/lib/persistence";
import { jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !rawBody) return jsonError("Webhook signature is required.", 400);
  const provider = getPaymentProvider();
  if (!provider.verifyWebhookSignature(rawBody, signature)) return jsonError("Invalid webhook signature.", 400);
  try {
    const event = provider.parseWebhookEvent(rawBody);
    const result = await processPaymentWebhook(event);
    return Response.json({ ok: true, status: result.status });
  } catch {
    // Keep provider payloads and signatures out of logs and responses.
    return jsonError("Webhook event could not be processed.", 400);
  }
}
