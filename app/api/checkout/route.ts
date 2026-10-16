import { NextResponse } from "next/server";
import { validatePhoneToken } from "@/lib/otp";
import { createOrder, updateOrder } from "@/lib/orders";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneToken, customer, address, items, paymentMethod } = body;

    // 1. Validate Phone OTP verification token
    if (!phoneToken || !customer?.phone) {
      return NextResponse.json(
        { error: "Phone number must be verified via OTP prior to checkout." },
        { status: 401 }
      );
    }

    const isTokenValid = await validatePhoneToken(phoneToken, customer.phone);
    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Phone verification session expired or invalid. Please verify phone again." },
        { status: 401 }
      );
    }

    // 2. Validate Customer fields
    if (!customer?.name?.trim()) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    // 3. Validate Address fields
    if (!address?.line1?.trim() || !address?.city?.trim() || !address?.state?.trim() || !address?.pincode?.trim()) {
      return NextResponse.json(
        { error: "Delivery address requires street address, city, state and pincode." },
        { status: 400 }
      );
    }

    const pin = address.pincode.replace(/\D/g, "");
    if (pin.length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit Indian PIN code." }, { status: 400 });
    }

    // 4. Validate Items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your shopping bag is empty." }, { status: 400 });
    }

    // 5. Payment Method: 100% Prepaid via Razorpay
    const method = "razorpay" as const;

    // 6. Create Order in Database
    const order = await createOrder({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone,
        email: customer.email?.trim() || undefined,
      },
      address: {
        line1: address.line1.trim(),
        line2: address.line2?.trim() || undefined,
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: pin,
      },
      items: items.map((it: { slug: string; qty: number }) => ({
        slug: it.slug,
        qty: parseInt(String(it.qty), 10) || 1,
      })),
      paymentMethod: method,
    });

    // 7. Initiate Razorpay payment order
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: order.total,
      receipt: order.order_number,
      notes: {
        customer_phone: order.customer.phone,
        customer_name: order.customer.name,
        order_number: order.order_number,
      },
    });

    // Save razorpay_order_id
    await updateOrder(order.order_number, {
      razorpay_order_id: razorpayOrder.id,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      total: order.total,
      subtotal: order.subtotal,
      shippingFee: order.shipping_fee,
      paymentMethod: method,
      razorpayOrder,
    });
  } catch (error: unknown) {
    console.error("[Checkout API Error]", error);
    const message = error instanceof Error ? error.message : "Checkout failed. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
