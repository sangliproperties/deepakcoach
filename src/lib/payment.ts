
import { verifyCheckoutSignature } from "@/lib/razorpay";

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  return verifyCheckoutSignature(
    orderId,
    paymentId,
    signature
  );
}
