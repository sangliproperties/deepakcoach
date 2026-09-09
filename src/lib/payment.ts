import { createHmac, timingSafeEqual } from "node:crypto";

export type PaymentProvider = {
  createOrder: (input: { amountInr: number; receipt: string }) => Promise<{ orderId: string; amountInr: number; currency: "INR" }>;
  verifySignature: (input: { orderId: string; paymentId: string; signature: string }) => boolean;
};

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret = process.env.RAZORPAY_KEY_SECRET) {
  if (!secret) return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export const demoPaymentProvider: PaymentProvider = {
  async createOrder(input) {
    return { orderId: `demo_order_${input.receipt}`, amountInr: input.amountInr, currency: "INR" };
  },
  verifySignature(input) {
    return input.signature === "demo_signature" || verifyRazorpaySignature(input.orderId, input.paymentId, input.signature);
  }
};
