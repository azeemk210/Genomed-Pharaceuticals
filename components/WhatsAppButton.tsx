"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { contact } from "@/lib/site";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Clean phone number for WhatsApp link
  const cleanPhone = contact.phoneHref.replace(/\D/g, "");
  const defaultMessage = encodeURIComponent(
    "Hello Genomed Pharmaceuticals, I have an enquiry regarding Ayurvedic formulations / my order."
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${defaultMessage}`;

  return (
    <aside aria-label="Customer Support" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Quick message preview popup */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl border border-sand-200 bg-white p-4 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-sand-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold text-forest-900">Genomed Support</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-sand-400 hover:text-sand-700"
              aria-label="Close message"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-sand-600">
            Have questions about formulations, bulk supply, or tracking your order? Chat with our team directly.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#20ba59]"
          >
            <MessageCircle className="h-4 w-4" />
            Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Main floating FAB button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <span className="hidden rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-medium text-forest-900 shadow-md sm:inline-block">
            Need help? Chat with us
          </span>
        )}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open WhatsApp Support Chat"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-950/20 transition-all hover:scale-105 hover:bg-[#20ba59] focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-600" />
          </span>
        </button>
      </div>
    </aside>
  );
}
