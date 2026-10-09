"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Layers,
  Users,
  Download,
  LogOut,
  Search,
  Truck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { inr } from "@/lib/format";
import type { AdminPayload } from "@/lib/admin-auth";
import type { OrderRecord } from "@/lib/orders";

interface AdminDashboardProps {
  admin: AdminPayload;
}

export default function AdminDashboardClient({ admin }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "stock" | "customers">("orders");

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [awbInputs, setAwbInputs] = useState<Record<string, string>>({});
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Stock State
  const [stockList, setStockList] = useState<Array<{ slug: string; name: string; qty: number }>>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [savingStockSlug, setSavingStockSlug] = useState<string | null>(null);

  // Customers State
  const [customers, setCustomers] = useState<
    Array<{ id: number; name: string; phone: string; email: string | null; totalOrders: number; totalSpend: number }>
  >([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "all") q.set("status", statusFilter);
      if (searchTerm.trim()) q.set("search", searchTerm.trim());

      const res = await fetch(`/api/admin/orders?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Stock
  const fetchStock = async () => {
    setLoadingStock(true);
    try {
      const res = await fetch("/api/admin/stock");
      const data = await res.json();
      if (res.ok) {
        setStockList(data.stock || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStock(false);
    }
  };

  // Fetch Customers
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (activeTab === "orders") {
        try {
          const q = new URLSearchParams();
          if (statusFilter !== "all") q.set("status", statusFilter);
          if (searchTerm.trim()) q.set("search", searchTerm.trim());

          const res = await fetch(`/api/admin/orders?${q.toString()}`);
          const data = await res.json();
          if (!ignore && res.ok) {
            setOrders(data.orders || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (!ignore) setLoadingOrders(false);
        }
      } else if (activeTab === "stock") {
        try {
          const res = await fetch("/api/admin/stock");
          const data = await res.json();
          if (!ignore && res.ok) {
            setStockList(data.stock || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (!ignore) setLoadingStock(false);
        }
      } else if (activeTab === "customers") {
        try {
          const res = await fetch("/api/admin/customers");
          const data = await res.json();
          if (!ignore && res.ok) {
            setCustomers(data.customers || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (!ignore) setLoadingCustomers(false);
        }
      }
    };

    void loadData();

    return () => {
      ignore = true;
    };
  }, [activeTab, statusFilter, searchTerm]);

  // Update Order Status
  const handleStatusChange = async (orderNumber: string, newStatus: string) => {
    setUpdatingOrder(orderNumber);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.order_number === orderNumber ? data.order : o)));
        showToast(`Order #${orderNumber} status changed to ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Save Delhivery AWB
  const handleSaveAwb = async (orderNumber: string) => {
    const awb = awbInputs[orderNumber];
    if (!awb || !awb.trim()) return;

    setUpdatingOrder(orderNumber);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delhivery_awb: awb.trim(),
          status: "dispatched",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.order_number === orderNumber ? data.order : o)));
        showToast(`Delhivery AWB saved & dispatch notification sent for #${orderNumber}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Update Stock Qty
  const handleSaveStock = async (slug: string) => {
    const newQty = stockEdits[slug];
    if (newQty === undefined) return;

    setSavingStockSlug(slug);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, qty: newQty }),
      });
      if (res.ok) {
        setStockList((prev) => prev.map((item) => (item.slug === slug ? { ...item, qty: newQty } : item)));
        showToast(`Stock updated for ${slug}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStockSlug(null);
    }
  };

  // KPI calculations
  const totalRevenue = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.total : sum), 0);
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const dispatchedCount = orders.filter((o) => o.status === "dispatched").length;

  return (
    <div className="min-h-screen bg-sand-50/60 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-forest-900 px-4 py-3 text-xs font-semibold text-white shadow-raise-lg">
          <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="border-b border-sand-200 bg-white">
        <div className="shell flex flex-wrap items-center justify-between py-4 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-forest-900 text-white text-caption font-bold px-2 py-0.5 uppercase tracking-wider">
                Backoffice
              </span>
              <h1 className="text-xl font-display font-bold text-forest-950">Genomed Pharmaceuticals</h1>
            </div>
            <p className="mt-0.5 text-xs text-sand-600">Logged in as {admin.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export/orders.csv"
              download
              className="inline-flex min-h-10 items-center gap-2 border border-sand-300 bg-sand-50 px-3.5 text-xs font-bold text-forest-900 hover:bg-sand-100"
            >
              <Download className="h-4 w-4 text-forest-700" />
              Download Courier CSV
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center gap-1.5 border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-800 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Shell */}
      <main className="shell mt-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="border border-sand-200 bg-white p-3.5 sm:p-5">
            <span className="text-caption uppercase tracking-wider font-bold text-sand-500">Total Orders</span>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold font-display text-forest-950">{orders.length}</p>
          </div>
          <div className="border border-sand-200 bg-white p-3.5 sm:p-5">
            <span className="text-caption uppercase tracking-wider font-bold text-sand-500">Pending Packing</span>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold font-display text-amber-700">{pendingCount}</p>
          </div>
          <div className="border border-sand-200 bg-white p-3.5 sm:p-5">
            <span className="text-caption uppercase tracking-wider font-bold text-sand-500">In Transit</span>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold font-display text-forest-700">{dispatchedCount}</p>
          </div>
          <div className="border border-sand-200 bg-white p-3.5 sm:p-5">
            <span className="text-caption uppercase tracking-wider font-bold text-sand-500">Total Volume</span>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold font-display text-forest-950">{inr(totalRevenue)}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-sand-200">
          <nav className="flex gap-4 sm:gap-8 overflow-x-auto whitespace-nowrap pb-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex shrink-0 items-center gap-2 border-b-2 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-colors ${
                activeTab === "orders"
                  ? "border-forest-800 text-forest-950"
                  : "border-transparent text-sand-500 hover:text-forest-800"
              }`}
            >
              <Package className="h-4 w-4" />
              Orders & Consignments ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("stock")}
              className={`flex shrink-0 items-center gap-2 border-b-2 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-colors ${
                activeTab === "stock"
                  ? "border-forest-800 text-forest-950"
                  : "border-transparent text-sand-500 hover:text-forest-800"
              }`}
            >
              <Layers className="h-4 w-4" />
              Inventory & Stock ({stockList.length || 10})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("customers")}
              className={`flex shrink-0 items-center gap-2 border-b-2 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-colors ${
                activeTab === "customers"
                  ? "border-forest-800 text-forest-950"
                  : "border-transparent text-sand-500 hover:text-forest-800"
              }`}
            >
              <Users className="h-4 w-4" />
              Customer Directory
            </button>
          </nav>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="mt-6 space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border border-sand-200 bg-white p-3.5 sm:p-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-sand-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                  placeholder="Search order #, customer, phone, AWB…"
                  className="w-full border border-sand-300 py-2 pr-3 pl-9 text-xs text-forest-950 focus:border-forest-700 focus:outline-none"
                />
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {["all", "pending", "confirmed", "processing", "dispatched", "delivered", "cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 font-bold uppercase tracking-wider text-caption transition-colors ${
                      statusFilter === st
                        ? "bg-forest-900 text-white"
                        : "bg-sand-100 text-sand-700 hover:bg-sand-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sand-600 hover:text-forest-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            {/* Orders Listing */}
            {loadingOrders ? (
              <div className="border border-sand-200 bg-white p-12 text-center text-sm text-sand-500">
                Loading orders…
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-sand-200 bg-white p-12 text-center text-sm text-sand-500">
                No orders match your filter.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div key={order.id} className="border border-sand-200 bg-white transition-shadow hover:shadow-raise-sm">
                      <div className="p-5 md:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/order/${order.order_number}`}
                                target="_blank"
                                className="font-display font-bold text-lg text-forest-900 hover:underline flex items-center gap-1.5"
                              >
                                #{order.order_number}
                                <ExternalLink className="h-3.5 w-3.5 text-sand-400" />
                              </Link>
                              <span
                                className={`px-2 py-0.5 text-caption font-bold uppercase ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "dispatched"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {order.status}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-caption font-bold uppercase ${
                                  order.payment_status === "paid"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-sand-100 text-sand-700 border border-sand-200"
                                }`}
                              >
                                {order.payment_method === "cod" ? "COD" : "Prepaid"} · {order.payment_status}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-sand-600">
                              {new Date(order.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-display font-bold text-lg text-forest-950">{inr(order.total)}</span>
                            <p className="text-caption text-sand-500">
                              {order.items.reduce((s, i) => s + i.qty, 0)} items
                            </p>
                          </div>
                        </div>

                        {/* Customer & Address Quick Info */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-sand-100 pt-4 text-xs">
                          <div>
                            <span className="font-semibold text-sand-500">Customer:</span>
                            <p className="font-bold text-forest-950">{order.customer.name}</p>
                            <p className="text-sand-600">+91 {order.customer.phone}</p>
                          </div>

                          <div>
                            <span className="font-semibold text-sand-500">Delivery Address:</span>
                            <p className="text-forest-950 truncate">{order.address.line1}</p>
                            <p className="text-sand-600">
                              {order.address.city}, {order.address.state} - {order.address.pincode}
                            </p>
                          </div>

                          {/* Quick Status & AWB controls */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sand-500">Status:</span>
                              <select
                                value={order.status}
                                disabled={updatingOrder === order.order_number}
                                onChange={(e) => handleStatusChange(order.order_number, e.target.value)}
                                className="border border-sand-300 bg-sand-50 px-2 py-1 text-xs font-semibold text-forest-950 focus:border-forest-700"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing (Packing)</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            {/* Delhivery AWB */}
                            <div className="flex flex-wrap items-center gap-2">
                              <Truck className="h-3.5 w-3.5 text-forest-700 shrink-0" />
                              <input
                                type="text"
                                placeholder={order.delhivery_awb || "Assign Delhivery AWB"}
                                value={awbInputs[order.order_number] ?? (order.delhivery_awb || "")}
                                onChange={(e) =>
                                  setAwbInputs({ ...awbInputs, [order.order_number]: e.target.value })
                                }
                                className="w-36 border border-sand-300 bg-white px-2 py-1 text-xs font-mono text-forest-950 focus:border-forest-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveAwb(order.order_number)}
                                disabled={updatingOrder === order.order_number}
                                className="bg-forest-800 px-2.5 py-1 text-caption font-bold text-white hover:bg-forest-900"
                              >
                                Save AWB
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Items Drawer */}
                        <div className="mt-4 border-t border-sand-100 pt-3 flex justify-between items-center text-xs">
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:underline"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {isExpanded ? "Hide items breakdown" : "View items breakdown"}
                          </button>

                          {order.delhivery_awb && (
                            <a
                              href={
                                order.tracking_url && order.tracking_url.startsWith("https://")
                                  ? order.tracking_url
                                  : `https://www.delhivery.com/track/package/${encodeURIComponent(order.delhivery_awb)}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                            >
                              Track on Delhivery ({order.delhivery_awb})
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {/* Expanded items */}
                        {isExpanded && (
                          <div className="mt-3 rounded border border-sand-200 bg-sand-50 p-4">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-900 mb-2">
                              Order Items
                            </h4>
                            <div className="divide-y divide-sand-200">
                              {order.items.map((it) => (
                                <div key={it.id} className="py-2 flex justify-between text-xs">
                                  <span>
                                    <strong>{it.name}</strong> ({it.pack}) × {it.qty}
                                  </span>
                                  <span className="font-bold text-forest-900">{inr(it.line_total)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 border-t border-sand-200 pt-2 flex justify-between text-xs text-sand-600">
                              <span>Subtotal: {inr(order.subtotal)} | Delivery: {inr(order.shipping_fee)}</span>
                              <span className="font-bold text-forest-950">Total: {inr(order.total)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVENTORY & STOCK */}
        {activeTab === "stock" && (
          <div className="mt-6 border border-sand-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-4">
              <div>
                <h2 className="text-lg font-display font-bold text-forest-950">Dhakauli Plant Stock Inventory</h2>
                <p className="text-xs text-sand-600">Real-time available units per formulation SKU</p>
              </div>
              <button
                type="button"
                onClick={fetchStock}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sand-600 hover:text-forest-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Stock
              </button>
            </div>

            {loadingStock ? (
              <div className="py-12 text-center text-sm text-sand-500">Loading inventory…</div>
            ) : (
              <div className="mt-4 divide-y divide-sand-200">
                {stockList.map((item) => {
                  const editVal = stockEdits[item.slug] ?? item.qty;
                  const isLow = editVal < 20;

                  return (
                    <div key={item.slug} className="py-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-forest-950">{item.name}</h3>
                        <p className="text-caption font-mono text-sand-500">{item.slug}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-caption font-bold uppercase px-2 py-0.5 ${
                            isLow ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isLow ? "Low Stock" : "Healthy Stock"}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={editVal}
                          onChange={(e) =>
                            setStockEdits({ ...stockEdits, [item.slug]: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-24 border border-sand-300 bg-white px-2 py-1.5 text-center font-mono text-sm text-forest-950 focus:border-forest-700"
                        />

                        <button
                          type="button"
                          onClick={() => handleSaveStock(item.slug)}
                          disabled={savingStockSlug === item.slug}
                          className="inline-flex items-center gap-1 bg-forest-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-forest-900"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Update
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER DIRECTORY */}
        {activeTab === "customers" && (
          <div className="mt-6 border border-sand-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-4">
              <div>
                <h2 className="text-lg font-display font-bold text-forest-950">Customer Directory</h2>
                <p className="text-xs text-sand-600">Customers with verified phone numbers and lifetime value</p>
              </div>
              <button
                type="button"
                onClick={fetchCustomers}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sand-600 hover:text-forest-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Customers
              </button>
            </div>

            {loadingCustomers ? (
              <div className="py-12 text-center text-sm text-sand-500">Loading customers…</div>
            ) : customers.length === 0 ? (
              <div className="py-12 text-center text-sm text-sand-500">No customers registered yet.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-200 bg-sand-50 text-sand-600">
                      <th className="py-3 px-4 font-bold uppercase">Customer</th>
                      <th className="py-3 px-4 font-bold uppercase">Phone</th>
                      <th className="py-3 px-4 font-bold uppercase">Email</th>
                      <th className="py-3 px-4 font-bold uppercase text-center">Orders</th>
                      <th className="py-3 px-4 font-bold uppercase text-right">Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {customers.map((c) => (
                      <tr key={c.phone} className="hover:bg-sand-50/50">
                        <td className="py-3 px-4 font-bold text-forest-950">{c.name}</td>
                        <td className="py-3 px-4 font-mono text-sand-700">+91 {c.phone}</td>
                        <td className="py-3 px-4 text-sand-600">{c.email || "—"}</td>
                        <td className="py-3 px-4 text-center font-bold text-forest-900">{c.totalOrders}</td>
                        <td className="py-3 px-4 text-right font-bold text-forest-950">{inr(c.totalSpend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
