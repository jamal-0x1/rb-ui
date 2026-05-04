"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  FolderTree,
  Ticket,
  Star,
  ShoppingBag,
  CreditCard,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/lib/admin/api";
import { Skeleton } from "@/components/ui/skeleton";

type Stat = {
  slug: string;
  label: string;
  path: string;
  Icon: LucideIcon;
  gradient: string;
  ring: string;
};

const STATS: Stat[] = [
  {
    slug: "users",
    label: "Users",
    path: "/users",
    Icon: Users,
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
    ring: "shadow-blue-500/20",
  },
  {
    slug: "products",
    label: "Products",
    path: "/products",
    Icon: Package,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    ring: "shadow-purple-500/20",
  },
  {
    slug: "orders",
    label: "Orders",
    path: "/orders",
    Icon: ShoppingCart,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    ring: "shadow-emerald-500/20",
  },
  {
    slug: "categories",
    label: "Categories",
    path: "/categories",
    Icon: FolderTree,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    ring: "shadow-orange-500/20",
  },
  {
    slug: "coupons",
    label: "Coupons",
    path: "/coupons",
    Icon: Ticket,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    ring: "shadow-rose-500/20",
  },
  {
    slug: "reviews",
    label: "Reviews",
    path: "/reviews",
    Icon: Star,
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    ring: "shadow-amber-500/20",
  },
  {
    slug: "carts",
    label: "Carts",
    path: "/carts",
    Icon: ShoppingBag,
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    ring: "shadow-sky-500/20",
  },
  {
    slug: "payments",
    label: "Payments",
    path: "/payments",
    Icon: CreditCard,
    gradient: "from-lime-500 via-green-500 to-emerald-500",
    ring: "shadow-green-500/20",
  },
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
      <p className="text-sm text-muted-foreground mb-6">
        Quick stats across the store.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {STATS.map(({ slug, label, Icon, gradient, ring }) => (
          <Link
            key={slug}
            href={`/admin/${slug}`}
            className="group relative block overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-transparent"
            style={{ willChange: "transform" }}
          >
            {/* gradient wash on hover */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              aria-hidden
            />

            {/* decorative blur orb */}
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-30`}
              aria-hidden
            />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md ${ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-white"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground transition-colors duration-300 group-hover:text-white/90">
                  {label}
                </p>
                {loading ? (
                  <Skeleton className="mt-2 h-9 w-16" />
                ) : (
                  <p className="mt-1 text-3xl font-bold tracking-tight transition-colors duration-300 group-hover:text-white">
                    {counts[slug] === null ? "—" : counts[slug]}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
