import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { getOrderByNumber } from "@/lib/orders";
import { inr } from "@/lib/format";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Order Receipt & Status",
  description: "Track your Genomed Pharmaceuticals order status, courier shipment, and download your order receipt.",
  robots: { index: false, follow: false },
};

const STATUS_STEPS = [
  { key: "confirmed", label: "Order Confirmed", desc: "Order registered and verified" },
  { key: "processing", label: "Formulation Packing", desc: "Inspected at Dhakauli Plant" },
  { key: "dispatched", label: "Dispatched", desc: "In transit with Delhivery" },
  { key: "delivered", label: "Delivered", desc: "Received by customer" },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return 0;
    case "processing":
      return 1;
    case "dispatched":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderByNumber(id);

  if (!order) {
    notFound();
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const whatsappUrl = `https://wa.me/919760411123?text=${encodeURIComponent(
    `Hi Genomed Pharmaceuticals, I am inquiring regarding my order #${order.order_number}`
  )}`;

  return (
    <div className="bg-sand-50/50 py-10 md:py-16">
      <div className="shell max-w-4xl">
        {/* Top Header Card */}
        <div className="border border-sand-200 bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-6">
            <div>
              <span className="text-caption uppercase tracking-wider text-sand-600 font-semibold">
                Order Receipt
              </span>
              <h1 className="mt-1 text-2xl md:text-3xl font-display font-bold text-forest-950">
                #{order.order_number}
              </h1>
              <p className="mt-1 text-xs text-sand-500">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <PrintButton />
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 border border-sand-300 bg-sand-50 px-3.5 text-xs font-bold text-forest-900 hover:bg-sand-100"
              >
                <MessageSquare className="h-4 w-4 text-green-700" />
                WhatsApp Help
              </Link>
            </div>
          </div>

          {/* Status Tracker */}
          {!isCancelled ? (
            <div className="mt-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div
                      key={step.key}
                      className={`relative border p-3 sm:p-3.5 transition-colors ${
                        isCurrent
                          ? "border-forest-700 bg-forest-50/30 ring-1 ring-forest-700"
                          : isDone
                          ? "border-sand-300 bg-sand-50"
                          : "border-sand-200 bg-white opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-green-700 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-sand-400 shrink-0" />
                        )}
                        <span className={`text-xs font-bold leading-tight ${isDone ? "text-forest-950" : "text-sand-600"}`}>
                          {step.label}
                        </span>
                      </div>
                      <p className="mt-1 text-caption text-sand-600 leading-snug">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              This order was cancelled. If you believe this is an error, please contact customer support.
            </div>
          )}

          {/* Delhivery Courier Dispatch Banner */}
          {order.delhivery_awb && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-green-200 bg-green-50/60 p-4 text-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-green-800 shrink-0" />
                <div>
                  <p className="font-bold text-green-950">Dispatched via Delhivery Logistics</p>
                  <p className="text-xs text-green-800">AWB Tracking Number: <strong className="font-mono">{order.delhivery_awb}</strong></p>
                </div>
              </div>
              {order.tracking_url && order.tracking_url.startsWith("https://") && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-forest-800 px-4 py-2 text-xs font-bold text-white hover:bg-forest-900"
                >
                  Track Consignment Live
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Breakdown Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Items & Financial Table */}
          <div className="md:col-span-2 border border-sand-200 bg-white p-6 md:p-8">
            <h2 className="text-lg font-display font-bold text-forest-950 border-b border-sand-200 pb-3">
              Items Ordered
            </h2>

            <div className="mt-4 divide-y divide-sand-200">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-forest-950 text-sm truncate">{item.name}</h3>
                    <p className="text-caption text-sand-600">
                      {item.pack} · {inr(item.unit_price)} × {item.qty}
                    </p>
                  </div>
                  <span className="tnum font-bold text-forest-900 shrink-0">{inr(item.line_total)}</span>
                </div>
              ))}
            </div>

            <dl className="mt-6 border-t border-sand-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-sand-600">Subtotal</dt>
                <dd className="tnum font-semibold text-forest-950">{inr(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sand-600">Delivery</dt>
                <dd className="tnum font-semibold text-forest-950">
                  {order.shipping_fee === 0 ? (
                    <span className="text-green-700 font-bold uppercase">FREE</span>
                  ) : (
                    inr(order.shipping_fee)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-sand-200 pt-3 text-base">
                <dt className="font-bold text-forest-950">Grand Total</dt>
                <dd className="tnum font-bold text-forest-950 text-lg">{inr(order.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="space-y-6">
            <div className="border border-sand-200 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-forest-950 border-b border-sand-200 pb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-forest-700" />
                Delivery Address
              </h2>
              <div className="mt-3 text-xs leading-relaxed text-sand-700">
                <p className="font-bold text-forest-950 text-sm">{order.customer.name}</p>
                <p className="mt-1">{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <p className="mt-2 text-sand-900 font-semibold">Phone: +91 {order.customer.phone}</p>
              </div>
            </div>

            <div className="border border-sand-200 bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-forest-950 border-b border-sand-200 pb-2">
                Payment Status
              </h2>
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-sand-600">Method: </span>
                  <strong className="text-forest-950">
                    Online Prepaid (Razorpay)
                  </strong>
                </div>
                <div>
                  <span className="text-sand-600">Payment: </span>
                  <span
                    className={`inline-block px-2 py-0.5 font-bold uppercase text-caption ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.payment_status === "paid" ? "Paid" : "Awaiting Confirmation"}
                  </span>
                </div>
                {order.razorpay_payment_id && (
                  <div>
                    <span className="text-sand-600">Payment Ref: </span>
                    <span className="font-mono text-forest-950">{order.razorpay_payment_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center bg-forest-700 px-6 text-sm font-bold text-white hover:bg-forest-800"
          >
            Continue Browsing Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
