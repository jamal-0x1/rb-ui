"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/admin/api";

const STATS = [
  { slug: "users", label: "Users", path: "/users" },
  { slug: "products", label: "Products", path: "/products" },
  { slug: "orders", label: "Orders", path: "/orders" },
  { slug: "categories", label: "Categories", path: "/categories" },
  { slug: "coupons", label: "Coupons", path: "/coupons" },
  { slug: "reviews", label: "Reviews", path: "/reviews" },
  { slug: "carts", label: "Carts", path: "/carts" },
  { slug: "payments", label: "Payments", path: "/payments" },
];

export default function DashPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      STATS.map(async (s) => {
        try {
          const rows = await api<any[]>(s.path);
          return [s.slug, Array.isArray(rows) ? rows.length : 0] as const;
        } catch {
          return [s.slug, null] as const;
        }
      }),
    ).then((entries) => {
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">
        Quick stats across the store.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Link
            key={s.slug}
            href={`/admin/${s.slug}`}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-400 hover:shadow-sm transition"
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {s.label}
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {loading
                ? "…"
                : counts[s.slug] === null
                  ? "—"
                  : counts[s.slug]}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
