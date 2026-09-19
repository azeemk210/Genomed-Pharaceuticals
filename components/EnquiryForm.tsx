"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { contact, formEndpoint } from "@/lib/site";
import { therapies } from "@/lib/products";

const ENQUIRY_TYPES = [
  "Distribution / stockist appointment",
  "Bulk or institutional order",
  "Third-party / contract manufacturing",
  "Product literature and composition",
  "General business enquiry",
];

type Errors = Partial<Record<"name" | "phone" | "email" | "enquiryType" | "consent", string>>;

export default function EnquiryForm({
  subject = "",
  compact = false,
  prefillMessage = "",
}: {
  subject?: string;
  compact?: boolean;
  /** Seeds the message box — used by the cart to attach the itemised list. */
  prefillMessage?: string;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ tone: "ok" | "err"; msg: string } | null>(null);
  const [sending, setSending] = useState(false);

  const field =
    "w-full border border-sand-300 bg-sand-50 px-4 py-3 text-base text-sand-900 transition-colors placeholder:text-sand-400 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-100";
  const label = "mb-2 block text-sm font-semibold text-sand-700";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("website")) return; // honeypot

    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "");
    const email = String(data.get("email") ?? "").trim();
    const type = String(data.get("enquiryType") ?? "");

    if (name.length < 2) next.name = "Please enter your name.";
    if (phone.replace(/\D/g, "").length < 10)
      next.phone = "Please enter a phone number we can reach you on.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = "Please enter a valid email address.";
    if (!type) next.enquiryType = "Please tell us what the enquiry is about.";
    if (!data.get("consent")) next.consent = "Please confirm we may contact you.";

    setErrors(next);
    if (Object.keys(next).length) {
      setStatus({ tone: "err", msg: "Please correct the highlighted fields and try again." });
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    data.delete("website");
    setSending(true);

    if (formEndpoint) {
      try {
        const res = await fetch(formEndpoint, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus({
          tone: "ok",
          msg: "Thank you — your enquiry has reached us. We reply within two working days.",
        });
      } catch {
        setStatus({
          tone: "err",
          msg: `We could not send that just now. Please email us directly at ${contact.email} or call the number above.`,
        });
      } finally {
        setSending(false);
      }
      return;
    }

    // No endpoint configured — hand off to the visitor's mail client.
    const body = [
      `Name: ${data.get("name")}`,
      `Firm: ${data.get("organisation") || "—"}`,
      `Phone: ${data.get("phone")}`,
      `Email: ${data.get("email")}`,
      `City: ${data.get("city") || "—"}`,
      `State / territory: ${data.get("state") || "—"}`,
      `Nature of enquiry: ${data.get("enquiryType")}`,
      `Therapeutic areas: ${data.getAll("areas").join(", ") || "—"}`,
      "",
      "Message:",
      String(data.get("message") || "—"),
    ].join("\n");

    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      `Business enquiry — ${data.get("enquiryType")}`,
    )}&body=${encodeURIComponent(body)}`;

    setStatus({
      tone: "ok",
      msg: "Your email app should now be open with the enquiry filled in — press send to deliver it.",
    });
    setSending(false);
  }

  /* A plain function, not a component: defining a component inside render
     creates a new type on every keystroke, which remounts the node and drops
     focus. Called as err("name"), never as <Err />. */
  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-1.5 text-sm text-red-700">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="border border-sand-200 bg-white p-6 shadow-raise-md md:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eq-name" className={label}>
            Full name <span className="text-gold-700">*</span>
          </label>
          <input
            id="eq-name"
            name="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            className={`${field} ${errors.name ? "border-red-600 bg-red-50" : ""}`}
          />
          {err("name")}
        </div>

        <div>
          <label htmlFor="eq-org" className={label}>
            Firm / organisation
          </label>
          <input id="eq-org" name="organisation" type="text" autoComplete="organization" className={field} />
        </div>

        <div>
          <label htmlFor="eq-phone" className={label}>
            Phone <span className="text-gold-700">*</span>
          </label>
          <input
            id="eq-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 00000 00000"
            aria-invalid={Boolean(errors.phone)}
            className={`${field} ${errors.phone ? "border-red-600 bg-red-50" : ""}`}
          />
          {err("phone")}
        </div>

        <div>
          <label htmlFor="eq-email" className={label}>
            Email <span className="text-gold-700">*</span>
          </label>
          <input
            id="eq-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={`${field} ${errors.email ? "border-red-600 bg-red-50" : ""}`}
          />
          {err("email")}
        </div>

        <div>
          <label htmlFor="eq-city" className={label}>
            City
          </label>
          <input id="eq-city" name="city" type="text" autoComplete="address-level2" className={field} />
        </div>

        <div>
          <label htmlFor="eq-state" className={label}>
            State / territory covered
          </label>
          <input id="eq-state" name="state" type="text" autoComplete="address-level1" className={field} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="eq-type" className={label}>
            Nature of enquiry <span className="text-gold-700">*</span>
          </label>
          <select
            id="eq-type"
            name="enquiryType"
            defaultValue={subject}
            aria-invalid={Boolean(errors.enquiryType)}
            className={`${field} appearance-none ${errors.enquiryType ? "border-red-600 bg-red-50" : ""}`}
          >
            <option value="">Please choose…</option>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {err("enquiryType")}
        </div>

        {!compact && (
          <fieldset className="sm:col-span-2">
            <legend className={label}>Therapeutic areas of interest</legend>
            <div className="flex flex-wrap gap-2">
              {therapies.map((t) => (
                <label key={t.slug} className="cursor-pointer">
                  <input type="checkbox" name="areas" value={t.name} className="peer sr-only" />
                  <span className="inline-block border border-sand-300 bg-sand-50 px-3.5 py-2 text-sm transition-colors peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400">
                    {t.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="eq-message" className={label}>
            Message
          </label>
          <textarea
            id="eq-message"
            name="message"
            rows={prefillMessage ? 10 : 4}
            defaultValue={prefillMessage || (subject ? `Enquiry regarding: ${subject}` : "")}
            placeholder="Tell us about your territory, the products you are interested in, and expected monthly volumes."
            className={`${field} min-h-28 resize-y`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-3 text-sm leading-relaxed text-sand-600">
            <input
              type="checkbox"
              name="consent"
              id="eq-consent"
              aria-invalid={Boolean(errors.consent)}
              className="mt-0.5 h-5 w-5 flex-none accent-forest-700"
            />
            <span>
              I agree that Genomed Pharmaceuticals may contact me about this enquiry using the
              details above. See our{" "}
              <a href="/privacy" className="text-forest-700 underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {err("consent")}
        </div>
      </div>

      {/* Honeypot — real people never fill this in. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="eq-website">Website</label>
        <input id="eq-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-sand-100 pt-6">
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex items-center gap-2 bg-forest-700 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send enquiry"}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <p className="text-sm text-sand-600">
          We reply to business enquiries within two working days. Prefer to talk?{" "}
          <a href={`tel:${contact.phoneHref}`} className="font-semibold text-forest-700">
            {contact.phoneDisplay}
          </a>
          .
        </p>
      </div>

      {status && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-6 border px-4 py-3 text-sm ${
            status.tone === "ok"
              ? "border-forest-200 bg-forest-50 text-forest-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {status.msg}
        </p>
      )}
    </form>
  );
}
