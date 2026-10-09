"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-10 items-center gap-1.5 border border-sand-300 bg-sand-50 px-3.5 text-xs font-bold text-forest-900 hover:bg-sand-100"
    >
      <Printer className="h-4 w-4" />
      Print Invoice
    </button>
  );
}
