"use client";

type CheckoutResult = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type CheckoutOptions = {
  keyId: string;
  orderId: string;
  amountInr: number;
  name: string;
  description: string;
};

type RazorpayInstance = {
  open(): void;
  on(event: string, handler: (data: unknown) => void): void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | undefined;

function loadCheckout(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser environment required"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve();

      script.onerror = () => {
        loading = undefined;
        reject(new Error("Razorpay Checkout failed to load"));
      };

      document.body.appendChild(script);
    });
  }

  return loading;
}

export async function openRazorpayCheckout(
  input: CheckoutOptions,
): Promise<CheckoutResult | null> {
  await loadCheckout();

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay Checkout unavailable"));
      return;
    }

    let settled = false;

    function finish(result: CheckoutResult | null) {
      if (settled) return;
      settled = true;
      resolve(result);
    }

    const checkout = new window.Razorpay({
      key: input.keyId,
      order_id: input.orderId,
      amount: input.amountInr * 100,
      currency: "INR",
      name: input.name,
      description: input.description,
      handler: (result: CheckoutResult) => {
        finish(result);
      },
      modal: {
        ondismiss: () => finish(null),
      },
    });

    checkout.on("payment.failed", () => {
      finish(null);
    });

    checkout.open();
  });
}
