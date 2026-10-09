"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials");
      }

      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid login credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-sand-50/60 px-4 py-12">
      <div className="w-full max-w-md border border-sand-200 bg-white p-8 shadow-raise-sm">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest-900 text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-display font-bold text-forest-950">Genomed Backoffice</h1>
          <p className="mt-1 text-xs text-sand-600">Administrative portal for orders, stock & fulfillment</p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2.5 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
              Admin Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-sand-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@genomedpharmaceuticals.com"
                className="w-full border border-sand-300 bg-white py-2.5 pr-3 pl-9 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-sand-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full border border-sand-300 bg-white py-2.5 pr-3 pl-9 text-sm text-forest-950 focus:border-forest-700 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center bg-forest-800 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-900 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In to Backoffice"}
          </button>
        </form>

        <p className="mt-6 text-center text-caption text-sand-500">
          Default admin: <span className="font-mono">admin@genomedpharmaceuticals.com</span>
        </p>
      </div>
    </div>
  );
}
