"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Loader2,
} from "lucide-react";
import PackShot from "@/components/PackShot";
import { useStore } from "@/components/StoreProvider";
import { inr } from "@/lib/format";

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
];

const FREE_SHIPPING_THRESHOLD = 499;
const STANDARD_SHIPPING_FEE = 50;

export default function CheckoutClient() {
  const router = useRouter();
  const { ready, cart, rows, count, subtotal, savings, clear } = useStore();

  // Contact & Verification State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Address State
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("");

  // Payment Method: 100% Prepaid via Razorpay
  const paymentMethod = "razorpay" as const;

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Robust loader for Razorpay checkout.js script
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadRazorpay();
  }, []);

  const handleSendOtp = async () => {
    setOtpError(null);
    setOtpMessage(null);
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      setOtpError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP.");

      setOtpSent(true);
      if (data.devCode) {
        setOtpMessage(`OTP sent! (Dev test code: ${data.devCode} or 123456)`);
      } else {
        setOtpMessage("OTP sent to your mobile via SMS.");
      }
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    if (!otpCode.trim()) {
      setOtpError("Please enter the 6-digit OTP received.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP code.");

      setPhoneToken(data.phoneToken);
      setIsPhoneVerified(true);
      setOtpMessage("✓ Mobile number verified successfully!");
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Invalid OTP code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!isPhoneVerified || !phoneToken) {
      setErrorMessage("Please verify your mobile number with OTP before placing order.");
      return;
    }

    if (!line1.trim()) {
      setErrorMessage("Please enter your delivery street address.");
      return;
    }

    if (!city.trim()) {
      setErrorMessage("Please enter your delivery city.");
      return;
    }

    const cleanPin = pincode.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Your shopping bag is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send checkout request to backend
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneToken,
          customer: {
            name: name.trim(),
            phone,
            email: email.trim() || undefined,
          },
          address: {
            line1: line1.trim(),
            line2: line2.trim() || undefined,
            city: city.trim(),
            state,
            pincode: cleanPin,
          },
          items: cart.map((c) => ({
            slug: c.slug,
            qty: c.qty,
          })),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize order.");

      const orderNumber = data.orderNumber;
      const razorpayOrder = data.razorpayOrder;

      if (!razorpayOrder) {
        throw new Error("Unable to create payment order. Please contact support.");
      }

      // Ensure Razorpay SDK is ready
      if (!window.Razorpay) {
        const loaded = await loadRazorpay();
        if (!loaded || !window.Razorpay) {
          throw new Error("Payment gateway is taking too long to load. Please check your internet connection and retry.");
        }
      }

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Genomed Pharmaceuticals",
        description: `Order #${orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: name.trim(),
          contact: phone,
          email: email.trim(),
        },
        theme: {
          color: "#162a22",
        },
        handler: async function (response: RazorpaySuccessResponse) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderNumber,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

            clear();
            router.push(`/order/${orderNumber}`);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Payment verification issue";
            setErrorMessage("Payment received, but verification pending: " + msg);
            clear();
            router.push(`/order/${orderNumber}`);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setErrorMessage("Payment was not completed. You can retry when ready.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during checkout.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="shell py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-forest-700" />
        <p className="mt-4 text-sm text-sand-600">Preparing checkout…</p>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="shell py-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sand-100 text-forest-700">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-display text-forest-950">Your shopping bag is empty</h1>
        <p className="mt-3 text-sm text-sand-600">Add products to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-forest-700 px-7 text-sm font-bold text-white transition-colors hover:bg-forest-800"
        >
          Browse Formulations
        </Link>
      </div>
    );
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="bg-sand-50/50 py-10 md:py-16">
      <div className="shell">
        {/* Checkout Header */}
        <div className="mb-10 border-b border-sand-200 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href="/cart" className="text-caption font-semibold text-sand-600 hover:text-forest-700">
                ← Return to Cart
              </Link>
              <h1 className="mt-2 text-3xl md:text-4xl font-display text-forest-950">Secure Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-forest-800 bg-sand-100 px-3 py-1.5 border border-sand-200">
              <Lock className="h-3.5 w-3.5 text-forest-700" />
              <span>256-Bit Encrypted Direct Order</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Unable to proceed with checkout</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid gap-8 lg:gap-12 lg:grid-cols-12">
          {/* Main Checkout Columns */}
          <div className="space-y-8 sm:space-y-10 lg:col-span-7 min-w-0">
            {/* STEP 1: CONTACT & PHONE VERIFICATION */}
            <section className="border border-sand-200 bg-white p-4 sm:p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-200 pb-4">
                <h2 className="text-lg sm:text-xl font-display font-semibold text-forest-950 flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-900 text-xs text-white shrink-0">
                    1
                  </span>
                  <span className="leading-tight">Customer Contact & Verification</span>
                </h2>
                {isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="mt-1.5 w-full border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                      Mobile Number (for OTP & Courier Delivery) *
                    </label>
                    <div className="mt-1.5 flex">
                      <span className="inline-flex items-center border border-r-0 border-sand-300 bg-sand-100 px-3 text-xs font-semibold text-sand-700">
                        +91
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        required
                        disabled={isPhoneVerified}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full border border-sand-300 bg-white px-3 py-2.5 text-sm text-forest-950 disabled:bg-sand-100 disabled:text-sand-600 focus:border-forest-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                      Email Address (Optional receipt)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="mt-1.5 w-full border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* OTP Action Bar */}
                {!isPhoneVerified && (
                  <div className="mt-4 rounded border border-sand-200 bg-sand-50 p-4">
                    {!otpSent ? (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-sand-600">
                          We will send a 6-digit verification code to confirm your delivery phone number.
                        </p>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || !phone.trim()}
                          className="inline-flex min-h-10 items-center justify-center bg-forest-800 px-4 text-xs font-bold text-white hover:bg-forest-900 disabled:opacity-50"
                        >
                          {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="6-digit OTP"
                            className="w-full sm:w-40 border border-sand-300 bg-white px-3 py-2 text-center font-mono text-base tracking-widest text-forest-950 focus:border-forest-700 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || !otpCode.trim()}
                            className="inline-flex min-h-10 flex-1 sm:flex-initial items-center justify-center bg-forest-800 px-4 sm:px-5 text-xs font-bold text-white hover:bg-forest-900 disabled:opacity-50"
                          >
                            {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="text-xs font-semibold text-sand-600 underline hover:text-forest-700"
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    )}

                    {otpMessage && <p className="mt-2 text-xs font-medium text-forest-800">{otpMessage}</p>}
                    {otpError && <p className="mt-2 text-xs font-medium text-red-600">{otpError}</p>}
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2: DELIVERY ADDRESS */}
            <section className="border border-sand-200 bg-white p-4 sm:p-6 md:p-8">
              <div className="border-b border-sand-200 pb-4">
                <h2 className="text-lg sm:text-xl font-display font-semibold text-forest-950 flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-900 text-xs text-white shrink-0">
                    2
                  </span>
                  Shipping Destination
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="line1" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                    Flat / House No., Building, Street Address *
                  </label>
                  <input
                    id="line1"
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="e.g. 42B, Shanti Vihar, Near City Dispensary"
                    className="mt-1.5 w-full border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="line2" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                    Locality / Landmark / Area (Optional)
                  </label>
                  <input
                    id="line2"
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="e.g. Sector 12"
                    className="mt-1.5 w-full border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                      City / District *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bulandshahr"
                      className="mt-1.5 w-full border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                      State *
                    </label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-1.5 w-full border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                      PIN Code (6-Digits) *
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      maxLength={6}
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 203001"
                      className="mt-1.5 w-full border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 3: PREPAID PAYMENT METHOD */}
            <section className="border border-sand-200 bg-white p-4 sm:p-6 md:p-8">
              <div className="border-b border-sand-200 pb-4">
                <h2 className="text-lg sm:text-xl font-display font-semibold text-forest-950 flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-900 text-xs text-white shrink-0">
                    3
                  </span>
                  Payment (100% Prepaid via Razorpay)
                </h2>
              </div>

              <div className="mt-6 border border-forest-600/30 bg-forest-50/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-forest-900 text-white shrink-0">
                      <CreditCard className="h-5 w-5 text-gold-400" />
                    </div>
                    <div>
                      <span className="font-bold text-forest-950 text-sm block">
                        Online Payment (UPI, Cards, Netbanking)
                      </span>
                      <span className="text-xs text-forest-700 font-medium">
                        Instant, 256-Bit SSL Encrypted via Razorpay
                      </span>
                    </div>
                  </div>
                  <span className="text-caption font-bold text-green-800 uppercase bg-green-100/90 px-2.5 py-1 border border-green-300 shrink-0">
                    Fastest Dispatch
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-forest-200/50 space-y-2 text-xs text-sand-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                    <span><strong>Instant UPI:</strong> Google Pay, PhonePe, Paytm, BHIM & all UPI apps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                    <span><strong>Cards:</strong> RuPay, Visa, MasterCard (Debit & Credit cards)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                    <span><strong>Netbanking:</strong> All major Indian banks with instant verification</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-forest-200/40 text-caption text-sand-600 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-forest-700 shrink-0" />
                  <span>Prepaid orders are prioritized and dispatched within 24–48 hours direct from our Dhakauli plant.</span>
                </div>
              </div>
            </section>
          </div>

          {/* Responsive Order Review Sidebar */}
          <aside className="lg:col-span-5 min-w-0 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
            <div className="border border-sand-200 bg-white p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-display font-semibold text-forest-950 border-b border-sand-200 pb-4">
                Items in Order ({count})
              </h2>

              {/* Items List */}
              <ul className="divide-y divide-sand-200 max-h-72 overflow-y-auto my-4 pr-1">
                {rows.map((r) => (
                  <li key={r.slug} className="flex items-center gap-3 py-3 text-sm">
                    <div className="product-stage relative h-12 w-12 shrink-0 border border-sand-200 overflow-hidden">
                      <span className="pack-blend absolute inset-1 block">
                        <PackShot
                          form={r.product.form}
                          name={r.product.name}
                          pack={r.product.pack}
                          photo={r.product.photo}
                          sizes="48px"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-forest-950 truncate text-xs">{r.product.name}</p>
                      <p className="text-caption text-sand-600">
                        {r.product.pack} × {r.qty}
                      </p>
                    </div>
                    <span className="tnum font-bold text-forest-900 text-xs shrink-0">
                      {inr(r.product.mrp * r.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Pricing Breakdown */}
              <dl className="border-t border-sand-200 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-sand-600">Subtotal</dt>
                  <dd className="tnum font-semibold text-forest-950">{inr(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sand-600">Delivery Fee</dt>
                  <dd className="tnum font-semibold text-forest-950">
                    {shippingFee === 0 ? (
                      <span className="text-green-700 font-bold uppercase">FREE</span>
                    ) : (
                      inr(shippingFee)
                    )}
                  </dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-forest-700">
                    <dt>Off List Price</dt>
                    <dd className="tnum font-semibold">−{inr(savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-sand-200 pt-3 text-sm">
                  <dt className="font-bold text-forest-950">Grand Total</dt>
                  <dd className="tnum font-bold text-forest-950 text-base">{inr(grandTotal)}</dd>
                </div>
              </dl>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !isPhoneVerified}
                className="group mt-6 flex w-full items-center justify-center gap-2 bg-forest-700 py-4 px-6 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Payment Gateway…
                  </span>
                ) : (
                  <>
                    <span>Pay {inr(grandTotal)} with Razorpay</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {!isPhoneVerified && (
                <p className="mt-2 text-center text-caption text-amber-700">
                  Verify your mobile number in Step 1 to enable checkout.
                </p>
              )}

              {/* Badges */}
              <div className="mt-6 space-y-2 border-t border-sand-200 pt-4 text-xs text-sand-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Licensed under AYUSH Drugs & Cosmetics Act 1940</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-forest-700 shrink-0" />
                  <span>Dispatched with batch Certificate of Analysis (CoA)</span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
