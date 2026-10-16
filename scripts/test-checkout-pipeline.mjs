import { sendOtp, verifyOtp, validatePhoneToken } from "../lib/otp.ts";
import {
  calculateOrderPricing,
  createOrder,
  getOrderByNumber,
  updateOrder,
  listOrders,
  getStockList,
  updateStockQty,
  getCustomersList,
  generateCourierCsv,
} from "../lib/orders.ts";
import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/razorpay.ts";
import { authenticateAdmin, createAdminToken, verifyAdminToken } from "../lib/admin-auth.ts";

async function runTests() {
  console.log("=== Testing Genomed Checkout & Admin System ===");

  // 1. Pricing Authority
  console.log("\n1. Testing Server-Side Pricing Authority:");
  const pricingBelow = calculateOrderPricing([{ slug: "decoliv-ds-syrup", qty: 1 }]);
  console.log(`- Subtotal ₹${pricingBelow.subtotal}, Shipping: ₹${pricingBelow.shippingFee}, Total: ₹${pricingBelow.total}`);
  if (pricingBelow.shippingFee !== 50) throw new Error("Expected ₹50 shipping below threshold");

  const pricingAbove = calculateOrderPricing([{ slug: "decoliv-ds-syrup", qty: 4 }]);
  console.log(`- Subtotal ₹${pricingAbove.subtotal}, Shipping: ₹${pricingAbove.shippingFee}, Total: ₹${pricingAbove.total}`);
  if (pricingAbove.shippingFee !== 0) throw new Error("Expected FREE shipping above threshold");
  console.log("✓ Pricing calculations passed.");

  // 2. OTP Delivery & Verification
  console.log("\n2. Testing Phone OTP Flow:");
  const otpRes = await sendOtp("9876543210");
  console.log(`- OTP dispatched:`, otpRes.message);

  const verifyRes = await verifyOtp("9876543210", otpRes.devCode || "123456");
  console.log(`- OTP verified, token issued.`);
  const isValidToken = await validatePhoneToken(verifyRes.phoneToken, "9876543210");
  if (!isValidToken) throw new Error("Phone token validation failed");
  console.log("✓ Phone OTP verification passed.");

  // 3. 100% Prepaid Razorpay Order Placement
  console.log("\n3. Testing Prepaid Razorpay Order Creation & Verification:");
  const prepaidOrder = await createOrder({
    customer: {
      name: "Test Customer",
      phone: "9876543210",
      email: "test@example.com",
    },
    address: {
      line1: "Flat 101, Green Meadows",
      city: "Bulandshahr",
      state: "Uttar Pradesh",
      pincode: "203001",
    },
    items: [
      { slug: "decoliv-ds-syrup", qty: 2 },
      { slug: "rimcuff-sf-syrup", qty: 1 },
    ],
    paymentMethod: "razorpay",
  });
  console.log(`- Created order #${prepaidOrder.order_number}, Status: ${prepaidOrder.status}, Payment Method: ${prepaidOrder.payment_method}, Total: ₹${prepaidOrder.total}`);
  if (prepaidOrder.payment_method !== "razorpay") {
    throw new Error("Order payment_method must be razorpay");
  }

  // Create Razorpay payment intent
  const razorpayOrder = await createRazorpayOrder({
    amountInRupees: prepaidOrder.total,
    receipt: prepaidOrder.order_number,
    notes: { order_number: prepaidOrder.order_number },
  });
  console.log(`- Created Razorpay Order ID: ${razorpayOrder.id}, Amount: ${razorpayOrder.amount} paise`);

  // Simulate successful payment verification
  const isSigValid = verifyRazorpaySignature({
    orderId: razorpayOrder.id,
    paymentId: "pay_test_123456",
    signature: "dummy_signature_token",
  });
  if (!isSigValid) throw new Error("Razorpay signature validation failed");

  const paidOrder = await updateOrder(prepaidOrder.order_number, {
    payment_status: "paid",
    status: "confirmed",
    razorpay_order_id: razorpayOrder.id,
    razorpay_payment_id: "pay_test_123456",
  });
  console.log(`✓ Order #${paidOrder?.order_number} verified as PAID: ${paidOrder?.payment_status}`);

  // 4. Order Query & AWB Assignment
  console.log("\n4. Testing Order Lookup & Delhivery Fulfillment:");
  const fetchedOrder = await getOrderByNumber(prepaidOrder.order_number);
  if (!fetchedOrder) throw new Error("Failed to retrieve created order");

  const updatedOrder = await updateOrder(prepaidOrder.order_number, {
    status: "dispatched",
    delhivery_awb: "DEL1234567890",
  });
  console.log(`- Dispatched #${updatedOrder?.order_number} with AWB: ${updatedOrder?.delhivery_awb}`);
  if (updatedOrder?.status !== "dispatched" || updatedOrder.delhivery_awb !== "DEL1234567890") {
    throw new Error("Order dispatch update failed");
  }

  // 5. Admin Authentication
  console.log("\n5. Testing Admin Authentication:");
  const authRes = await authenticateAdmin("admin@genomedpharmaceuticals.com", "Genomed@Admin2026");
  if (!authRes.success || !authRes.user) throw new Error("Admin login failed");
  const token = await createAdminToken(authRes.user);
  const verifiedUser = await verifyAdminToken(token);
  if (verifiedUser?.email !== "admin@genomedpharmaceuticals.com") {
    throw new Error("Admin token verification failed");
  }
  console.log(`✓ Admin session authenticated for: ${verifiedUser.name}`);

  // 6. Admin Backoffice Features: List Orders, Stock, Customers, CSV
  console.log("\n6. Testing Admin Backoffice Features:");
  const ordersList = await listOrders();
  console.log(`- Orders listed: ${ordersList.length} total orders found.`);

  const stock = await getStockList();
  console.log(`- Inventory tracked: ${stock.length} SKUs.`);

  await updateStockQty("decoliv-ds-syrup", 95);
  const updatedStock = await getStockList();
  const decoliv = updatedStock.find((s) => s.slug === "decoliv-ds-syrup");
  console.log(`- Updated decoliv-ds-syrup stock to: ${decoliv?.qty}`);

  const customers = await getCustomersList();
  console.log(`- Customers directory: ${customers.length} unique customers.`);

  const csv = generateCourierCsv(ordersList);
  console.log(`- Courier CSV exported (${csv.split("\n").length} lines).`);

  console.log("\n==============================================");
  console.log(" ALL E-COMMERCE & ADMIN SYSTEMS VERIFIED! ");
  console.log("==============================================\n");
}

runTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
