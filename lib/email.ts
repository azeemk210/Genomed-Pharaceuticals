import nodemailer from "nodemailer";

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  items: Array<{
    name: string;
    pack: string;
    unitPrice: number;
    qty: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "paid" | "unpaid" | "failed" | "refunded" | string;
  address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  delhiveryAwb?: string | null;
  trackingUrl?: string | null;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("https://")) return trimmed;
  return null;
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Sends an order confirmation receipt to the customer and company admin
 */
export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  const transporter = getMailTransporter();
  const recipient = order.customerEmail || process.env.ADMIN_EMAIL || "genomedpharma@gmail.com";
  const from = process.env.SMTP_FROM || "Genomed Pharmaceuticals <orders@genomedpharmaceuticals.com>";

  const safeCustomerName = escapeHtml(order.customerName);
  const safeOrderNumber = escapeHtml(order.orderNumber);
  const safeLine1 = escapeHtml(order.address.line1);
  const safeLine2 = escapeHtml(order.address.line2);
  const safeCity = escapeHtml(order.address.city);
  const safeState = escapeHtml(order.address.state);
  const safePincode = escapeHtml(order.address.pincode);
  const safePhone = escapeHtml(order.customerPhone);

  const itemRows = order.items
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #e4decb;">
        <td style="padding: 12px 8px; font-family: sans-serif; color: #162a22;">
          <strong>${escapeHtml(it.name)}</strong><br>
          <span style="font-size: 12px; color: #625c50;">${escapeHtml(it.pack)}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-family: sans-serif; color: #162a22;">${Number(it.qty)}</td>
        <td style="padding: 12px 8px; text-align: right; font-family: sans-serif; color: #162a22;">₹${Number(it.unitPrice).toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; font-family: sans-serif; font-weight: bold; color: #162a22;">₹${Number(it.lineTotal).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const paymentDesc =
    order.paymentMethod === "cod"
      ? "Cash on Delivery (Pay ₹" + Number(order.total).toFixed(2) + " to courier)"
      : "Prepaid Online (Razorpay / UPI)";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation - ${safeOrderNumber}</title>
  </head>
  <body style="margin: 0; padding: 24px; background-color: #faf7ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #d4cbb3; border-radius: 4px; overflow: hidden;">
      <!-- Header -->
      <tr>
        <td style="background-color: #162a22; padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; font-weight: 600;">GENOMED PHARMACEUTICALS</h1>
          <p style="color: #c7a760; margin: 6px 0 0; font-size: 13px; font-style: italic;">Your health, our priority</p>
        </td>
      </tr>

      <!-- Order Summary Intro -->
      <tr>
        <td style="padding: 24px 24px 12px;">
          <h2 style="color: #162a22; margin: 0 0 12px; font-size: 20px;">Thank you for your order, ${safeCustomerName}!</h2>
          <p style="color: #4a453b; line-height: 1.5; margin: 0 0 16px;">
            Your order <strong>#${safeOrderNumber}</strong> has been received and is being prepared for dispatch from our Dhakauli plant.
          </p>
          <div style="background-color: #f7f3e8; border-left: 4px solid #162a22; padding: 12px 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #162a22;">
              <strong>Payment Method:</strong> ${paymentDesc}<br>
              <strong>Status:</strong> ${order.paymentStatus === "paid" ? "Paid" : "Pending on Delivery"}
            </p>
          </div>
        </td>
      </tr>

      <!-- Items Table -->
      <tr>
        <td style="padding: 0 24px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #ece5d3; color: #162a22; text-align: left;">
                <th style="padding: 10px 8px;">Product</th>
                <th style="padding: 10px 8px; text-align: center;">Qty</th>
                <th style="padding: 10px 8px; text-align: right;">Unit Price</th>
                <th style="padding: 10px 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px 8px 4px; text-align: right; color: #625c50;">Subtotal:</td>
                <td style="padding: 12px 8px 4px; text-align: right; font-weight: bold; color: #162a22;">₹${Number(order.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 4px 8px; text-align: right; color: #625c50;">Shipping:</td>
                <td style="padding: 4px 8px; text-align: right; font-weight: bold; color: #162a22;">
                  ${order.shippingFee === 0 ? '<span style="color: #228b22;">FREE</span>' : "₹" + Number(order.shippingFee).toFixed(2)}
                </td>
              </tr>
              <tr style="border-top: 2px solid #162a22;">
                <td colspan="3" style="padding: 12px 8px; text-align: right; font-size: 16px; font-weight: bold; color: #162a22;">Grand Total:</td>
                <td style="padding: 12px 8px; text-align: right; font-size: 18px; font-weight: bold; color: #162a22;">₹${Number(order.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </td>
      </tr>

      <!-- Shipping Address -->
      <tr>
        <td style="padding: 20px 24px;">
          <h3 style="color: #162a22; font-size: 15px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Destination</h3>
          <p style="margin: 0; font-size: 14px; color: #4a453b; line-height: 1.5;">
            ${safeCustomerName}<br>
            ${safeLine1}${safeLine2 ? ", " + safeLine2 : ""}<br>
            ${safeCity}, ${safeState} - ${safePincode}<br>
            Phone: +91 ${safePhone}
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f7f3e8; padding: 20px 24px; text-align: center; border-top: 1px solid #e4decb; font-size: 12px; color: #625c50;">
          <p style="margin: 0 0 6px;">Questions? Call us at <strong>+91 97604 11123</strong> or reply to this email.</p>
          <p style="margin: 0;">Genomed Pharmaceuticals | Dhakauli Plant, Bulandshahr, UP 203001</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[EMAIL MOCK] To: ${recipient}`);
    console.log(`[EMAIL MOCK] Subject: Order Confirmed: #${order.orderNumber}`);
    console.log(`[EMAIL MOCK] Total: ₹${order.total} | Payment: ${order.paymentMethod}`);
    console.log(`========================================\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to: recipient,
      subject: `Order Confirmed: #${order.orderNumber} - Genomed Pharmaceuticals`,
      html,
    });
  } catch (err) {
    console.error("[Email Delivery Error]", err);
  }
}

/**
 * Sends shipping dispatch notification with Delhivery tracking info
 */
export async function sendOrderDispatchedEmail(order: OrderEmailData): Promise<void> {
  const transporter = getMailTransporter();
  const recipient = order.customerEmail || process.env.ADMIN_EMAIL || "genomedpharma@gmail.com";
  const from = process.env.SMTP_FROM || "Genomed Pharmaceuticals <orders@genomedpharmaceuticals.com>";

  const safeOrderNumber = escapeHtml(order.orderNumber);
  const safeAwb = escapeHtml(order.delhiveryAwb);
  const safeUrl = sanitizeUrl(order.trackingUrl);

  const trackingLinkHtml = safeUrl
    ? `<p style="margin: 16px 0;"><a href="${escapeHtml(safeUrl)}" style="background-color: #162a22; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Track Your Consignment</a></p>`
    : "";

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 24px; background-color: #faf7ef; font-family: sans-serif;">
    <table align="center" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #d4cbb3; border-radius: 4px;">
      <tr>
        <td style="background-color: #162a22; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">GENOMED PHARMACEUTICALS</h1>
          <p style="color: #c7a760; margin: 4px 0 0; font-size: 13px;">Consignment Dispatched</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px;">
          <h2 style="color: #162a22; margin: 0 0 12px;">Your Order #${safeOrderNumber} is on the way!</h2>
          <p style="color: #4a453b; line-height: 1.5;">
            Great news! Your package has been securely sealed and handed over to our courier partner (Delhivery Logistics).
          </p>
          <div style="background-color: #f7f3e8; border: 1px solid #e4decb; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #162a22;">Courier: Delhivery Logistics</p>
            <p style="margin: 0; color: #162a22;">AWB Tracking Number: <strong>${safeAwb || "Assigned"}</strong></p>
            ${trackingLinkHtml}
          </div>
          <p style="color: #625c50; font-size: 13px;">Estimated delivery: 2–5 business days depending on destination.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  if (!transporter) {
    console.log(`[EMAIL MOCK DISPATCH] Order #${order.orderNumber} AWB: ${order.delhiveryAwb}`);
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to: recipient,
      subject: `Order #${order.orderNumber} Dispatched - Delhivery AWB: ${order.delhiveryAwb || ""}`,
      html,
    });
  } catch (err) {
    console.error("[Email Dispatch Error]", err);
  }
}
