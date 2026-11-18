import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function credentials() {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key || !secret) {
    throw new Error("Razorpay credentials are missing");
  }

  return { key, secret };
}

export function publicRazorpayKey() {
  return credentials().key;
}

function compareSignature(expected: Buffer, signature: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const { secret } = credentials();
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  return compareSignature(expected, signature);
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest();

  return compareSignature(expected, signature);
}

async function razorpayApi<T>(
  path: string,
  method: "GET" | "POST",
  body?: object,
): Promise<T> {
  const { key, secret } = credentials();

  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
};

export async function createRazorpayOrder(amountInr: number, receipt: string) {
  if (
    !Number.isSafeInteger(amountInr) ||
    amountInr <= 0 ||
    amountInr > 10000000
  ) {
    throw new Error("Invalid payment amount");
  }

  return razorpayApi<RazorpayOrder>("orders", "POST", {
    amount: amountInr * 100,
    currency: "INR",
    receipt: receipt.slice(0, 40),
  });
}

export async function getRazorpayPayment(paymentId: string) {
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    throw new Error("Invalid Razorpay payment ID");
  }

  return razorpayApi<RazorpayPayment>(`payments/${paymentId}`, "GET");
}

export function assertCapturedPayment(
  payment: RazorpayPayment,
  orderId: string,
  amountInr: number,
) {
  if (
    payment.status !== "captured" ||
    payment.order_id !== orderId ||
    payment.currency !== "INR" ||
    payment.amount !== amountInr * 100
  ) {
    throw new Error("Payment is not captured or does not match the order");
  }
}

export type RazorpayOrderPayment = RazorpayPayment & {
  captured?: boolean;
};

export type RazorpayOrderPaymentsResponse = {
  entity: string;
  count: number;
  items: RazorpayOrderPayment[];
};

export async function getRazorpayOrder(orderId: string) {
  if (!/^order_[A-Za-z0-9]+$/.test(orderId)) {
    throw new Error("Invalid Razorpay order ID");
  }

  return razorpayApi<RazorpayOrder>(`orders/${orderId}`, "GET");
}

export async function getRazorpayOrderPayments(
  orderId: string,
): Promise<RazorpayOrderPayment[]> {
  if (!/^order_[A-Za-z0-9]+$/.test(orderId)) {
    throw new Error("Invalid Razorpay order ID");
  }

  const result = await razorpayApi<RazorpayOrderPaymentsResponse>(
    `orders/${orderId}/payments`,
    "GET",
  );

  if (result.count > result.items.length) {
    throw new Error(
      "Razorpay returned an incomplete payment list; " +
        "booking requires reconciliation.",
    );
  }

  return result.items;
}
