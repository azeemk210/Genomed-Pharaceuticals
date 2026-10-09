import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { updateOrder, getOrderByNumber } from "@/lib/orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay payment verification fields" },
        { status: 400 }
      );
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      await updateOrder(orderNumber, {
        payment_status: "failed",
      });
      return NextResponse.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
    }

    // Payment is valid! Update order to paid & confirmed
    const updated = await updateOrder(orderNumber, {
      payment_status: "paid",
      status: "confirmed",
      razorpay_order_id,
      razorpay_payment_id,
    });

    return NextResponse.json({
      success: true,
      orderNumber: updated?.order_number || orderNumber,
      paymentStatus: "paid",
    });
  } catch (error: unknown) {
    console.error("[Razorpay Verify Error]", error);
    const message = error instanceof Error ? error.message : "Failed to verify payment";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
