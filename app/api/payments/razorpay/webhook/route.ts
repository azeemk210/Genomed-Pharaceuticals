import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { updateOrder, getOrderByNumber } from "@/lib/orders";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.warn("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
      secret: webhookSecret,
    });

    if (!isValid) {
      console.error("[Razorpay Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;
      const notes = orderEntity?.notes || paymentEntity?.notes || {};
      const orderNumber = notes.order_number || notes.orderNumber;

      if (orderNumber) {
        const existing = await getOrderByNumber(orderNumber);
        if (existing && existing.payment_status !== "paid") {
          await updateOrder(orderNumber, {
            payment_status: "paid",
            status: "confirmed",
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
          });
          console.log(`[Razorpay Webhook] Order ${orderNumber} marked as paid`);
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const orderNumber = notes.order_number || notes.orderNumber;

      if (orderNumber) {
        await updateOrder(orderNumber, {
          payment_status: "failed",
        });
        console.log(`[Razorpay Webhook] Payment failed for order ${orderNumber}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[Razorpay Webhook Error]", err);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
