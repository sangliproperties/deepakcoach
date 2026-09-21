import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export type PaymentProviderName = "demo" | "razorpay" | "stripe";
export type PaymentEventState = "pending" | "paid" | "failed" | "cancelled";

export type PaymentOrder = {
  orderId: string;
  amountInr: number;
  currency: "INR";
};

export type PaymentWebhookEvent = {
  provider: PaymentProviderName;
  providerEventId: string;
  eventType: string;
  orderId?: string;
  paymentId?: string;
  state: PaymentEventState;
  amountInr?: number;
};

export type PaymentProvider = {
  name: PaymentProviderName;
  createOrder: (input: { amountInr: number; receipt: string }) => Promise<PaymentOrder>;
  verifyCheckoutSignature: (input: { orderId: string; paymentId: string; signature: string }) => boolean;
  verifySignature: (input: { orderId: string; paymentId: string; signature: string }) => boolean;
  verifyWebhookSignature: (rawBody: string, signature: string) => boolean;
  parseWebhookEvent: (rawBody: string) => PaymentWebhookEvent;
};

function safeCompare(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret = process.env.RAZORPAY_KEY_SECRET) {
  if (!secret) return process.env.PERSISTENCE_MODE === "demo" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  return safeCompare(createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex"), signature);
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string, secret = process.env.RAZORPAY_WEBHOOK_SECRET) {
  if (!secret) return false;
  return safeCompare(createHmac("sha256", secret).update(rawBody).digest("hex"), signature);
}

function parseRazorpayEvent(rawBody: string): PaymentWebhookEvent {
  const payload: unknown = JSON.parse(rawBody);
  if (!payload || typeof payload !== "object") throw new Error("Malformed webhook payload.");
  const root = payload as { id?: unknown; event?: unknown; payload?: { payment?: { entity?: Record<string, unknown> }; order?: { entity?: Record<string, unknown> } } };
  const eventType = typeof root.event === "string" ? root.event : "";
  const payment = root.payload?.payment?.entity;
  const order = root.payload?.order?.entity;
  const orderId = typeof payment?.order_id === "string" ? payment.order_id : typeof order?.id === "string" ? order.id : undefined;
  const paymentId = typeof payment?.id === "string" ? payment.id : undefined;
  const amountPaise = typeof payment?.amount === "number" ? payment.amount : typeof order?.amount === "number" ? order.amount : undefined;
  const state: PaymentEventState = eventType.includes("captured") || eventType === "order.paid"
    ? "paid"
    : eventType.includes("failed")
      ? "failed"
      : eventType.includes("cancel")
        ? "cancelled"
        : "pending";
  if (!root.id || typeof root.id !== "string" || !eventType || !orderId) throw new Error("Webhook event is missing required identifiers.");
  return {
    provider: "razorpay",
    providerEventId: root.id,
    eventType,
    orderId,
    paymentId,
    state,
    amountInr: amountPaise === undefined ? undefined : Math.round(amountPaise / 100)
  };
}

function razorpayConfiguration() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keySecret === "replace_me") throw new Error("Razorpay payment configuration is incomplete.");
  return { keyId, keySecret };
}

export const razorpayPaymentProvider: PaymentProvider = {
  name: "razorpay",
  async createOrder(input) {
    const { keyId, keySecret } = razorpayConfiguration();
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount: input.amountInr * 100, currency: "INR", receipt: input.receipt, payment_capture: 1 }),
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error("Razorpay order creation failed.");
    const data = await response.json() as { id?: unknown; amount?: unknown; currency?: unknown };
    if (typeof data.id !== "string" || data.currency !== "INR" || typeof data.amount !== "number") throw new Error("Razorpay returned an invalid order.");
    return { orderId: data.id, amountInr: Math.round(data.amount / 100), currency: "INR" };
  },
  verifyCheckoutSignature(input) {
    return verifyRazorpaySignature(input.orderId, input.paymentId, input.signature);
  },
  verifySignature(input) {
    return this.verifyCheckoutSignature(input);
  },
  verifyWebhookSignature(rawBody, signature) {
    return verifyRazorpayWebhookSignature(rawBody, signature);
  },
  parseWebhookEvent: parseRazorpayEvent
};

export const demoPaymentProvider: PaymentProvider = {
  name: "demo",
  async createOrder(input) {
    return { orderId: `demo_order_${input.receipt}`, amountInr: input.amountInr, currency: "INR" };
  },
  verifyCheckoutSignature(input) {
    return input.signature === "demo_signature" || verifyRazorpaySignature(input.orderId, input.paymentId, input.signature);
  },
  verifySignature(input) {
    return this.verifyCheckoutSignature(input);
  },
  verifyWebhookSignature(rawBody, signature) {
    return signature === "demo_webhook_signature" || verifyRazorpayWebhookSignature(rawBody, signature);
  },
  parseWebhookEvent(rawBody) {
    const event = parseRazorpayEvent(rawBody);
    return { ...event, provider: "demo" };
  }
};

export function getPaymentProvider(): PaymentProvider {
  if (process.env.PERSISTENCE_MODE === "demo") return demoPaymentProvider;
  if (process.env.PERSISTENCE_MODE === "prisma") return razorpayPaymentProvider;
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? demoPaymentProvider : razorpayPaymentProvider;
}
