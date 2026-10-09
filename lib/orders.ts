import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { products } from "./products";
import { query, withTransaction } from "./db";
import { sendOrderConfirmationEmail, sendOrderDispatchedEmail } from "./email";
import { normalizePhone } from "./otp";

export interface CheckoutItemInput {
  slug: string;
  qty: number;
}

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
}

export interface AddressInput {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CalculatedPricing {
  items: Array<{
    slug: string;
    name: string;
    pack: string;
    unitPrice: number;
    qty: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface OrderRecord {
  id: number;
  order_number: string;
  status: "pending" | "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled";
  payment_method: "razorpay" | "cod";
  payment_status: "unpaid" | "paid" | "failed" | "refunded";
  subtotal: number;
  shipping_fee: number;
  total: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  delhivery_awb: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  dispatched_at: string | null;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string | null;
  };
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: Array<{
    id: number;
    slug: string;
    name: string;
    pack: string;
    unit_price: number;
    qty: number;
    line_total: number;
  }>;
}

interface OrderDbRow extends RowDataPacket {
  id: number;
  order_number: string;
  status: OrderRecord["status"];
  payment_method: OrderRecord["payment_method"];
  payment_status: OrderRecord["payment_status"];
  subtotal: string | number;
  shipping_fee: string | number;
  total: string | number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  delhivery_awb: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  dispatched_at: string | null;
  cust_id: number;
  cust_name: string;
  cust_phone: string;
  cust_email: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  addr_phone: string;
}

interface OrderItemDbRow extends RowDataPacket {
  id: number;
  order_id: number;
  slug: string;
  name: string;
  pack: string;
  unit_price: string | number;
  qty: number;
  line_total: string | number;
}

interface StockDbRow extends RowDataPacket {
  slug: string;
  qty_available: number;
}

interface CustomerDbRow extends RowDataPacket {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  totalOrders: string | number;
  totalSpend: string | number;
}

declare global {
  var __genomedDevStore: {
    orders: OrderRecord[];
    stock: Map<string, number>;
    customers: Map<string, { id: number; name: string; phone: string; email: string | null }>;
  } | undefined;
}

// In-memory fallback database for local developer mode when MySQL is offline
const devStore = (globalThis.__genomedDevStore ??= {
  orders: [] as OrderRecord[],
  stock: new Map<string, number>(products.map((p) => [p.slug, 100])),
  customers: new Map<string, { id: number; name: string; phone: string; email: string | null }>(),
});

/**
 * Calculates authoritative order pricing directly from server-side catalog.
 * Never trusts prices sent from client browser/cart.
 */
export function calculateOrderPricing(requestedItems: CheckoutItemInput[]): CalculatedPricing {
  if (!requestedItems || requestedItems.length === 0) {
    throw new Error("Order must contain at least one product item.");
  }

  const items: CalculatedPricing["items"] = [];
  let subtotal = 0;

  for (const req of requestedItems) {
    const rawQty = Number(req.qty);
    if (isNaN(rawQty) || rawQty <= 0) {
      throw new Error(`Invalid quantity for product ${req.slug}`);
    }
    const qty = Math.max(1, Math.min(500, Math.floor(rawQty)));
    const product = products.find((p) => p.slug === req.slug);
    if (!product) {
      throw new Error(`Invalid product in cart: ${req.slug}`);
    }

    const unitPrice = product.mrp;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    items.push({
      slug: product.slug,
      name: product.name,
      pack: product.pack,
      unitPrice,
      qty,
      lineTotal,
    });
  }

  const freeThreshold = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || "499");
  const standardFee = parseFloat(process.env.SHIPPING_FEE || "50");
  const shippingFee = subtotal >= freeThreshold ? 0 : standardFee;
  const total = subtotal + shippingFee;

  return {
    items,
    subtotal,
    shippingFee,
    total,
  };
}

/**
 * Generates human-friendly unique order numbers like GNM-2610-8KD2
 */
export function generateOrderNumber(): string {
  const d = new Date();
  const yr = d.getFullYear().toString().slice(-2);
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GNM-${yr}${mo}-${rand}`;
}

/**
 * Creates an order in the database.
 */
export async function createOrder({
  customer,
  address,
  items,
  paymentMethod,
}: {
  customer: CustomerInput;
  address: AddressInput;
  items: CheckoutItemInput[];
  paymentMethod: "razorpay" | "cod";
}): Promise<OrderRecord> {
  const pricing = calculateOrderPricing(items);
  const orderNumber = generateOrderNumber();
  const phone = normalizePhone(customer.phone);
  const initialStatus = paymentMethod === "cod" ? "confirmed" : "pending";
  const initialPaymentStatus = "unpaid";

  const safeName = customer.name.trim().slice(0, 100);
  const safeEmail = customer.email ? customer.email.trim().slice(0, 120) : null;
  const safeLine1 = address.line1.trim().slice(0, 200);
  const safeLine2 = address.line2 ? address.line2.trim().slice(0, 200) : null;
  const safeCity = address.city.trim().slice(0, 100);
  const safeState = address.state.trim().slice(0, 100);
  const safePincode = address.pincode.replace(/\D/g, "").slice(0, 6);

  let createdOrder: OrderRecord;

  try {
    createdOrder = await withTransaction(async (conn) => {
      // 1. Upsert customer
      const [custRows] = await conn.execute<(RowDataPacket & { id: number })[]>(
        `SELECT id FROM customers WHERE phone = ? LIMIT 1`,
        [phone]
      );
      let customerId: number;
      if (custRows.length > 0) {
        customerId = custRows[0].id;
        await conn.execute(
          `UPDATE customers SET name = ?, email = COALESCE(?, email) WHERE id = ?`,
          [safeName, safeEmail, customerId]
        );
      } else {
        const [insertCust] = await conn.execute<ResultSetHeader>(
          `INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)`,
          [safeName, phone, safeEmail]
        );
        customerId = insertCust.insertId;
      }

      // 2. Insert address
      const [insertAddr] = await conn.execute<ResultSetHeader>(
        `INSERT INTO addresses (customer_id, line1, line2, city, state, pincode, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customerId, safeLine1, safeLine2, safeCity, safeState, safePincode, phone]
      );
      const addressId = insertAddr.insertId;

      // 3. Insert order
      const [insertOrder] = await conn.execute<ResultSetHeader>(
        `INSERT INTO orders 
         (order_number, customer_id, address_id, status, payment_method, payment_status, subtotal, shipping_fee, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          customerId,
          addressId,
          initialStatus,
          paymentMethod,
          initialPaymentStatus,
          pricing.subtotal,
          pricing.shippingFee,
          pricing.total,
        ]
      );
      const orderId = insertOrder.insertId;

      // 4. Insert order items & reduce stock
      for (const item of pricing.items) {
        await conn.execute(
          `INSERT INTO order_items (order_id, slug, name, pack, unit_price, qty, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.slug, item.name, item.pack, item.unitPrice, item.qty, item.lineTotal]
        );

        // Deduct available stock
        await conn.execute(
          `UPDATE stock SET qty_available = GREATEST(0, qty_available - ?) WHERE slug = ?`,
          [item.qty, item.slug]
        );
      }

      return {
        id: orderId,
        order_number: orderNumber,
        status: initialStatus,
        payment_method: paymentMethod,
        payment_status: initialPaymentStatus,
        subtotal: pricing.subtotal,
        shipping_fee: pricing.shippingFee,
        total: pricing.total,
        razorpay_order_id: null,
        razorpay_payment_id: null,
        delhivery_awb: null,
        tracking_url: null,
        notes: null,
        created_at: new Date().toISOString(),
        paid_at: null,
        dispatched_at: null,
        customer: {
          id: customerId,
          name: safeName,
          phone,
          email: safeEmail,
        },
        address: {
          line1: safeLine1,
          line2: safeLine2,
          city: safeCity,
          state: safeState,
          pincode: safePincode,
          phone,
        },
        items: pricing.items.map((it, idx) => ({
          id: idx + 1,
          slug: it.slug,
          name: it.name,
          pack: it.pack,
          unit_price: it.unitPrice,
          qty: it.qty,
          line_total: it.lineTotal,
        })),
      };
    });
  } catch (err) {
    console.warn("[Orders] MySQL unreachable or error, creating in local dev store:", (err as Error).message);
    // Dev store fallback
    const orderId = devStore.orders.length + 1;
    const customerId = 100 + orderId;
    createdOrder = {
      id: orderId,
      order_number: orderNumber,
      status: initialStatus,
      payment_method: paymentMethod,
      payment_status: initialPaymentStatus,
      subtotal: pricing.subtotal,
      shipping_fee: pricing.shippingFee,
      total: pricing.total,
      razorpay_order_id: null,
      razorpay_payment_id: null,
      delhivery_awb: null,
      tracking_url: null,
      notes: null,
      created_at: new Date().toISOString(),
      paid_at: null,
      dispatched_at: null,
      customer: {
        id: customerId,
        name: safeName,
        phone,
        email: safeEmail,
      },
      address: {
        line1: safeLine1,
        line2: safeLine2,
        city: safeCity,
        state: safeState,
        pincode: safePincode,
        phone,
      },
      items: pricing.items.map((it, idx) => ({
        id: idx + 1,
        slug: it.slug,
        name: it.name,
        pack: it.pack,
        unit_price: it.unitPrice,
        qty: it.qty,
        line_total: it.lineTotal,
      })),
    };

    devStore.orders.unshift(createdOrder);
    devStore.customers.set(phone, createdOrder.customer);

    // Deduct stock in devStore
    for (const item of pricing.items) {
      const cur = devStore.stock.get(item.slug) || 100;
      devStore.stock.set(item.slug, Math.max(0, cur - item.qty));
    }
  }

  // Send confirmation email (async non-blocking)
  sendOrderConfirmationEmail({
    orderNumber: createdOrder.order_number,
    customerName: createdOrder.customer.name,
    customerEmail: createdOrder.customer.email,
    customerPhone: createdOrder.customer.phone,
    items: createdOrder.items.map((i) => ({
      name: i.name,
      pack: i.pack,
      unitPrice: i.unit_price,
      qty: i.qty,
      lineTotal: i.line_total,
    })),
    subtotal: createdOrder.subtotal,
    shippingFee: createdOrder.shipping_fee,
    total: createdOrder.total,
    paymentMethod: createdOrder.payment_method,
    paymentStatus: createdOrder.payment_status,
    address: createdOrder.address,
  }).catch((e) => console.error("[Order Email Error]", e));

  return createdOrder;
}

/**
 * Retrieves a single order by order number with full relations.
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderRecord | null> {
  const devMatch = devStore.orders.find((o) => o.order_number === orderNumber);
  if (devMatch) return devMatch;

  try {
    const orderRows = await query<OrderDbRow[]>(
      `SELECT o.*, 
              c.id as cust_id, c.name as cust_name, c.phone as cust_phone, c.email as cust_email,
              a.line1, a.line2, a.city, a.state, a.pincode, a.phone as addr_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN addresses a ON o.address_id = a.id
       WHERE o.order_number = ?
       LIMIT 1`,
      [orderNumber]
    );

    if (orderRows.length === 0) return null;
    const row = orderRows[0];

    const items = await query<OrderItemDbRow[]>(
      `SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [row.id]
    );

    return {
      id: row.id,
      order_number: row.order_number,
      status: row.status,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      subtotal: parseFloat(String(row.subtotal)),
      shipping_fee: parseFloat(String(row.shipping_fee)),
      total: parseFloat(String(row.total)),
      razorpay_order_id: row.razorpay_order_id,
      razorpay_payment_id: row.razorpay_payment_id,
      delhivery_awb: row.delhivery_awb,
      tracking_url: row.tracking_url,
      notes: row.notes,
      created_at: row.created_at,
      paid_at: row.paid_at,
      dispatched_at: row.dispatched_at,
      customer: {
        id: row.cust_id,
        name: row.cust_name,
        phone: row.cust_phone,
        email: row.cust_email,
      },
      address: {
        line1: row.line1,
        line2: row.line2,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        phone: row.addr_phone,
      },
      items: items.map((it) => ({
        id: it.id,
        slug: it.slug,
        name: it.name,
        pack: it.pack,
        unit_price: parseFloat(String(it.unit_price)),
        qty: it.qty,
        line_total: parseFloat(String(it.line_total)),
      })),
    };
  } catch {
    // Dev store fallback
    const match = devStore.orders.find((o) => o.order_number === orderNumber);
    return match || null;
  }
}

/**
 * Updates order details such as status, payment, or Delhivery AWB
 */
export async function updateOrder(
  orderNumber: string,
  updates: {
    status?: OrderRecord["status"];
    payment_status?: OrderRecord["payment_status"];
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    delhivery_awb?: string;
    tracking_url?: string;
  }
): Promise<OrderRecord | null> {
  const existing = await getOrderByNumber(orderNumber);
  if (!existing) return null;

  const newStatus = updates.status || existing.status;
  const newPaymentStatus = updates.payment_status || existing.payment_status;
  const newAwb = updates.delhivery_awb !== undefined ? updates.delhivery_awb : existing.delhivery_awb;
  let trackingUrl = updates.tracking_url !== undefined ? updates.tracking_url : existing.tracking_url;

  if (newAwb && !trackingUrl) {
    trackingUrl = `https://www.delhivery.com/track/package/${newAwb.trim()}`;
  }

  // Ensure tracking URL is strictly an HTTPS link to prevent javascript: or open redirect
  if (trackingUrl && !trackingUrl.trim().startsWith("https://")) {
    trackingUrl = null;
  }

  const isNowPaid = newPaymentStatus === "paid" && existing.payment_status !== "paid";
  const isNowDispatched = newStatus === "dispatched" && existing.status !== "dispatched";

  try {
    await query(
      `UPDATE orders 
       SET status = ?, 
           payment_status = ?, 
           razorpay_order_id = COALESCE(?, razorpay_order_id),
           razorpay_payment_id = COALESCE(?, razorpay_payment_id),
           delhivery_awb = ?,
           tracking_url = ?,
           paid_at = CASE WHEN ? = 1 THEN NOW() ELSE paid_at END,
           dispatched_at = CASE WHEN ? = 1 THEN NOW() ELSE dispatched_at END
       WHERE order_number = ?`,
      [
        newStatus,
        newPaymentStatus,
        updates.razorpay_order_id || null,
        updates.razorpay_payment_id || null,
        newAwb,
        trackingUrl,
        isNowPaid ? 1 : 0,
        isNowDispatched ? 1 : 0,
        orderNumber,
      ]
    );
  } catch {
    // Dev store fallback
    existing.status = newStatus;
    existing.payment_status = newPaymentStatus;
    if (updates.razorpay_order_id) existing.razorpay_order_id = updates.razorpay_order_id;
    if (updates.razorpay_payment_id) existing.razorpay_payment_id = updates.razorpay_payment_id;
    if (newAwb !== undefined) existing.delhivery_awb = newAwb;
    if (trackingUrl !== undefined) existing.tracking_url = trackingUrl;
    if (isNowPaid) existing.paid_at = new Date().toISOString();
    if (isNowDispatched) existing.dispatched_at = new Date().toISOString();
  }

  const updated = await getOrderByNumber(orderNumber);

  if (updated && isNowDispatched) {
    sendOrderDispatchedEmail({
      orderNumber: updated.order_number,
      customerName: updated.customer.name,
      customerEmail: updated.customer.email,
      customerPhone: updated.customer.phone,
      items: updated.items.map((i) => ({
        name: i.name,
        pack: i.pack,
        unitPrice: i.unit_price,
        qty: i.qty,
        lineTotal: i.line_total,
      })),
      subtotal: updated.subtotal,
      shippingFee: updated.shipping_fee,
      total: updated.total,
      paymentMethod: updated.payment_method,
      paymentStatus: updated.payment_status,
      address: updated.address,
      delhiveryAwb: updated.delhivery_awb,
      trackingUrl: updated.tracking_url,
    }).catch((e) => console.error("[Dispatch Email Error]", e));
  }

  return updated;
}

/**
 * Lists orders for admin portal with filtering and search
 */
export async function listOrders({
  status,
  search,
  limit = 50,
}: {
  status?: string;
  search?: string;
  limit?: number;
} = {}): Promise<OrderRecord[]> {
  try {
    let sql = `
      SELECT o.*, 
             c.id as cust_id, c.name as cust_name, c.phone as cust_phone, c.email as cust_email,
             a.line1, a.line2, a.city, a.state, a.pincode, a.phone as addr_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN addresses a ON o.address_id = a.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status && status !== "all") {
      sql += ` AND o.status = ?`;
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (o.order_number LIKE ? OR c.name LIKE ? OR c.phone LIKE ? OR o.delhivery_awb LIKE ?)`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY o.id DESC LIMIT ?`;
    params.push(limit);

    const rows = await query<OrderDbRow[]>(sql, params);

    // Fetch items for each order
    const results: OrderRecord[] = [];
    for (const row of rows) {
      const items = await query<OrderItemDbRow[]>(
        `SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`,
        [row.id]
      );
      results.push({
        id: row.id,
        order_number: row.order_number,
        status: row.status,
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        subtotal: parseFloat(String(row.subtotal)),
        shipping_fee: parseFloat(String(row.shipping_fee)),
        total: parseFloat(String(row.total)),
        razorpay_order_id: row.razorpay_order_id,
        razorpay_payment_id: row.razorpay_payment_id,
        delhivery_awb: row.delhivery_awb,
        tracking_url: row.tracking_url,
        notes: row.notes,
        created_at: row.created_at,
        paid_at: row.paid_at,
        dispatched_at: row.dispatched_at,
        customer: {
          id: row.cust_id,
          name: row.cust_name,
          phone: row.cust_phone,
          email: row.cust_email,
        },
        address: {
          line1: row.line1,
          line2: row.line2,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          phone: row.addr_phone,
        },
        items: items.map((it) => ({
          id: it.id,
          slug: it.slug,
          name: it.name,
          pack: it.pack,
          unit_price: parseFloat(String(it.unit_price)),
          qty: it.qty,
          line_total: parseFloat(String(it.line_total)),
        })),
      });
    }

    return results;
  } catch {
    // Dev store fallback
    return devStore.orders.filter((o) => {
      if (status && status !== "all" && o.status !== status) return false;
      if (search && search.trim()) {
        const s = search.toLowerCase();
        return (
          o.order_number.toLowerCase().includes(s) ||
          o.customer.name.toLowerCase().includes(s) ||
          o.customer.phone.includes(s) ||
          (o.delhivery_awb && o.delhivery_awb.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }
}

/**
 * Gets stock quantities for all products
 */
export async function getStockList(): Promise<Array<{ slug: string; name: string; qty: number }>> {
  try {
    const rows = await query<StockDbRow[]>(`SELECT slug, qty_available FROM stock`);
    const stockMap = new Map<string, number>();
    for (const r of rows) {
      stockMap.set(r.slug, r.qty_available);
    }
    return products.map((p) => ({
      slug: p.slug,
      name: p.name,
      qty: stockMap.get(p.slug) ?? 100,
    }));
  } catch {
    return products.map((p) => ({
      slug: p.slug,
      name: p.name,
      qty: devStore.stock.get(p.slug) ?? 100,
    }));
  }
}

/**
 * Updates stock quantity for a given product
 */
export async function updateStockQty(slug: string, qty: number): Promise<void> {
  const safeQty = Math.max(0, Math.floor(qty));
  try {
    await query(
      `INSERT INTO stock (slug, qty_available) VALUES (?, ?) ON DUPLICATE KEY UPDATE qty_available = ?`,
      [slug, safeQty, safeQty]
    );
  } catch {
    devStore.stock.set(slug, safeQty);
  }
}

/**
 * Gets customer directory with aggregate orders & lifetime spend
 */
export async function getCustomersList(): Promise<
  Array<{ id: number; name: string; phone: string; email: string | null; totalOrders: number; totalSpend: number }>
> {
  try {
    const rows = await query<CustomerDbRow[]>(`
      SELECT c.id, c.name, c.phone, c.email,
             COUNT(o.id) as totalOrders,
             COALESCE(SUM(CASE WHEN o.payment_status = 'paid' OR o.status != 'cancelled' THEN o.total ELSE 0 END), 0) as totalSpend
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY totalSpend DESC, c.id DESC
    `);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      totalOrders: parseInt(String(r.totalOrders), 10),
      totalSpend: parseFloat(String(r.totalSpend)),
    }));
  } catch {
    // Dev store aggregation
    const map = new Map<string, { id: number; name: string; phone: string; email: string | null; totalOrders: number; totalSpend: number }>();
    for (const ord of devStore.orders) {
      const existing = map.get(ord.customer.phone);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpend += ord.total;
      } else {
        map.set(ord.customer.phone, {
          id: ord.customer.id,
          name: ord.customer.name,
          phone: ord.customer.phone,
          email: ord.customer.email,
          totalOrders: 1,
          totalSpend: ord.total,
        });
      }
    }
    return Array.from(map.values());
  }
}

/**
 * Generates CSV string formatted for Delhivery & Shiprocket courier upload
 */
export function generateCourierCsv(orders: OrderRecord[]): string {
  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Phone",
    "Delivery Address 1",
    "Delivery Address 2",
    "City",
    "State",
    "Pincode",
    "Total Items",
    "Order Description",
    "Order Total (INR)",
    "Payment Mode",
    "COD Amount Due",
    "AWB Number",
    "Order Date",
  ];

  const rows = orders.map((o) => {
    const desc = o.items.map((i) => `${i.name} x${i.qty}`).join("; ");
    const codDue = o.payment_method === "cod" ? o.total : 0;
    return [
      `"${o.order_number}"`,
      `"${o.customer.name.replace(/"/g, '""')}"`,
      `"${o.customer.phone}"`,
      `"${o.address.line1.replace(/"/g, '""')}"`,
      `"${(o.address.line2 || "").replace(/"/g, '""')}"`,
      `"${o.address.city}"`,
      `"${o.address.state}"`,
      `"${o.address.pincode}"`,
      o.items.reduce((sum, it) => sum + it.qty, 0),
      `"${desc.replace(/"/g, '""')}"`,
      o.total.toFixed(2),
      o.payment_method === "cod" ? "COD" : "PREPAID",
      codDue.toFixed(2),
      `"${o.delhivery_awb || ""}"`,
      `"${new Date(o.created_at).toISOString().split("T")[0]}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
