import crypto from "crypto";
import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === "rzp_test_dummy") {
    return null;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}

/**
 * Creates a Razorpay Order for online checkout
 */
export async function createRazorpayOrder({
  amountInRupees,
  receipt,
  notes,
}: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string; keyId: string }> {
  const client = getRazorpayClient();
  const amountInPaise = Math.round(amountInRupees * 100);

  if (!client) {
    // Development fallback mock Razorpay order
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
    };
  }

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes: notes || {},
  });

  return {
    id: order.id,
    amount: typeof order.amount === "number" ? order.amount : amountInPaise,
    currency: order.currency || "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
  };
}

/**
 * Verifies Razorpay payment signature using HMAC SHA-256
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // In mock dev mode without real Razorpay secret:
  if (!secret || secret === "dummy_secret" || orderId.startsWith("order_mock_")) {
    return true;
  }

  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
