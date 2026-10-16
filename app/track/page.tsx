"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Truck,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderInput, setOrderInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderInput.trim().toUpperCase();

    if (!clean) {
      setError("Please enter your Order Number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        throw new Error(data.error || "Order not found. Please verify the order number and retry.");
      }

      // Navigate to the detailed order receipt & tracking page
      router.push(`/order/${data.order.order_number}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to locate order. Please check the ID or contact support.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50/60 pb-24 pt-12 md:pt-16">
      <div className="shell max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-gold-400 shadow-md">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
            Track Your Order
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-sand-600 sm:text-base">
            Check the real-time fulfillment status and Delhivery courier tracking for your Genomed herbal formulation delivery.
          </p>
        </div>

        {/* Search Card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-sand-200 bg-white p-6 shadow-sm md:p-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                Order Number
              </label>
              <div className="relative mt-2">
                <input
                  id="orderId"
                  type="text"
                  placeholder="e.g. GNM-2610-ABCD"
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-sand-300 bg-sand-50/40 px-5 py-4 pl-12 font-mono text-base font-semibold tracking-wide text-forest-950 placeholder:text-sand-400 focus:border-forest-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-forest-700/10"
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sand-400" />
              </div>
              <p className="mt-2 text-xs text-sand-500">
                You can find your Order ID in the confirmation screen or transaction notification.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  <p className="mt-1 text-rose-700/90">
                    Need assistance? WhatsApp our dispatch desk at{" "}
                    <a href="tel:+919760411123" className="font-bold underline">
                      +91 97604 11123
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-forest-900 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-forest-800 focus:outline-none focus:ring-4 focus:ring-forest-900/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin text-gold-400" />
                  <span>Locating Shipment...</span>
                </>
              ) : (
                <>
                  <span>Track Shipment Status</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Fulfillment Standards Info */}
          <div className="mt-10 grid gap-4 border-t border-sand-100 pt-8 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 flex-none text-forest-700" />
              <div className="text-left">
                <p className="text-xs font-bold text-forest-950">100% Prepaid</p>
                <p className="text-[11px] text-sand-500">Prioritized dispatch</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 flex-none text-forest-700" />
              <div className="text-left">
                <p className="text-xs font-bold text-forest-950">Delhivery Express</p>
                <p className="text-[11px] text-sand-500">2–5 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 flex-none text-forest-700" />
              <div className="text-left">
                <p className="text-xs font-bold text-forest-950">Plant Sealed</p>
                <p className="text-[11px] text-sand-500">Dhakauli QC inspected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="text-xs font-semibold text-forest-800 transition-colors hover:text-forest-950 hover:underline"
          >
            ← Continue shopping Ayurvedic formulations
          </Link>
        </div>
      </div>
    </div>
  );
}
