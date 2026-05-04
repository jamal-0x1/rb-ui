"use client";

import { useEffect, useMemo, useState } from "react";
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
  TrendingUp,
  DollarSign,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/lib/admin/api";
import { Skeleton } from "@/components/ui/skeleton";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: string;
  currency: string;
  placedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  confirmed: "bg-blue-100 text-blue-800 ring-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 ring-rose-200",
  refunded: "bg-slate-200 text-slate-700 ring-slate-300",
};

const formatBDT = (n: number) =>
  `৳${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

type Stat = {
  slug: string;
  label: string;
  path: string;
  Icon: LucideIcon;
  gradient: string;
  shadowColor: string;
};

const STATS: Stat[] = [
  {
    slug: "users",
    label: "Users",
    path: "/users",
    Icon: Users,
    gradient: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%)",
    shadowColor: "rgba(59, 130, 246, 0.35)",
  },
  {
    slug: "products",
    label: "Products",
    path: "/products",
    Icon: Package,
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)",
    shadowColor: "rgba(168, 85, 247, 0.35)",
  },
  {
    slug: "orders",
    label: "Orders",
    path: "/orders",
    Icon: ShoppingCart,
    gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
    shadowColor: "rgba(16, 185, 129, 0.35)",
  },
  {
    slug: "categories",
    label: "Categories",
    path: "/categories",
    Icon: FolderTree,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
    shadowColor: "rgba(249, 115, 22, 0.35)",
  },
  {
    slug: "coupons",
    label: "Coupons",
    path: "/coupons",
    Icon: Ticket,
    gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #ef4444 100%)",
    shadowColor: "rgba(244, 63, 94, 0.35)",
  },
  {
    slug: "reviews",
    label: "Reviews",
    path: "/reviews",
    Icon: Star,
    gradient: "linear-gradient(135deg, #facc15 0%, #f59e0b 50%, #f97316 100%)",
    shadowColor: "rgba(245, 158, 11, 0.35)",
  },
  {
    slug: "carts",
    label: "Carts",
    path: "/carts",
    Icon: ShoppingBag,
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)",
    shadowColor: "rgba(14, 165, 233, 0.35)",
  },
  {
    slug: "payments",
    label: "Payments",
    path: "/payments",
    Icon: CreditCard,
    gradient: "linear-gradient(135deg, #84cc16 0%, #22c55e 50%, #10b981 100%)",
    shadowColor: "rgba(34, 197, 94, 0.35)",
  },
];

export default function DashPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

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

  useEffect(() => {
    api<Order[]>("/orders")
      .then((rows) => setOrders(Array.isArray(rows) ? rows : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  const orderReport = useMemo(() => {
    if (!orders) return null;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.grandTotal || 0),
      0,
    );
    const aov = orders.length > 0 ? totalRevenue / orders.length : 0;
    const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    // last 7 days bars
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: { label: string; date: Date; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        label: d.toLocaleDateString("en-GB", { weekday: "short" }),
        date: d,
        total: 0,
        count: 0,
      });
    }
    for (const o of orders) {
      const od = new Date(o.placedAt);
      od.setHours(0, 0, 0, 0);
      const idx = days.findIndex((d) => d.date.getTime() === od.getTime());
      if (idx >= 0) {
        days[idx].total += Number(o.grandTotal || 0);
        days[idx].count += 1;
      }
    }
    const peakDay = Math.max(...days.map((d) => d.total), 1);
    const recent = [...orders]
      .sort(
        (a, b) =>
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
      )
      .slice(0, 5);

    return { totalRevenue, aov, statusCounts, days, peakDay, recent };
  }, [orders]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Quick stats across the store.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {STATS.map(({ slug, label, Icon, gradient, shadowColor }) => (
          <Link
            key={slug}
            href={`/admin/${slug}`}
            className="group relative block overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-transparent"
            style={{ willChange: "transform" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: gradient }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
              style={{ backgroundImage: gradient }}
              aria-hidden
            />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundImage: gradient,
                    boxShadow: `0 8px 16px -4px ${shadowColor}`,
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground opacity-40 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-white"
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

      {/* Order report */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Order report</h2>
            <p className="text-xs text-muted-foreground">
              Revenue, status breakdown, and recent activity.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* KPI strip */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="relative overflow-hidden rounded-xl border p-5 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
                boxShadow: "0 12px 24px -8px rgba(16, 185, 129, 0.45)",
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-medium text-white/80">
                    Total revenue
                  </p>
                  {ordersLoading ? (
                    <Skeleton className="mt-2 h-9 w-32 bg-white/20" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold tracking-tight">
                      {formatBDT(orderReport?.totalRevenue ?? 0)}
                    </p>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <DollarSign className="h-5 w-5" strokeWidth={2.25} />
                </div>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-xl border p-5 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)",
                boxShadow: "0 12px 24px -8px rgba(168, 85, 247, 0.45)",
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-medium text-white/80">
                    Avg order value
                  </p>
                  {ordersLoading ? (
                    <Skeleton className="mt-2 h-9 w-28 bg-white/20" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold tracking-tight">
                      {formatBDT(orderReport?.aov ?? 0)}
                    </p>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <Receipt className="h-5 w-5" strokeWidth={2.25} />
                </div>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-xl border p-5 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)",
                boxShadow: "0 12px 24px -8px rgba(249, 115, 22, 0.45)",
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-medium text-white/80">
                    Total orders
                  </p>
                  {ordersLoading ? (
                    <Skeleton className="mt-2 h-9 w-16 bg-white/20" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold tracking-tight">
                      {orders?.length ?? 0}
                    </p>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <TrendingUp className="h-5 w-5" strokeWidth={2.25} />
                </div>
              </div>
            </div>
          </div>

          {/* 7-day line chart */}
          <div className="lg:col-span-2 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Last 7 days</h3>
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            {ordersLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (() => {
              const days = orderReport?.days ?? [];
              const peak = orderReport?.peakDay ?? 1;
              const W = 700;
              const H = 200;
              const PAD_X = 24;
              const PAD_TOP = 16;
              const PAD_BOTTOM = 36;
              const innerW = W - PAD_X * 2;
              const innerH = H - PAD_TOP - PAD_BOTTOM;
              const xFor = (i: number) =>
                PAD_X + (innerW * i) / Math.max(days.length - 1, 1);
              const yFor = (v: number) =>
                PAD_TOP + innerH - (innerH * v) / peak;
              const points = days.map((d, i) => ({
                x: xFor(i),
                y: yFor(d.total),
                d,
                i,
              }));
              const linePath = points
                .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
                .join(" ");
              const areaPath =
                points.length > 0
                  ? `${linePath} L ${xFor(days.length - 1)} ${PAD_TOP + innerH} L ${PAD_X} ${PAD_TOP + innerH} Z`
                  : "";
              const hovered = hoverIdx !== null ? points[hoverIdx] : null;
              return (
                <div className="relative">
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="w-full h-48"
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoverIdx(null)}
                  >
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* baseline */}
                    <line
                      x1={PAD_X}
                      x2={W - PAD_X}
                      y1={PAD_TOP + innerH}
                      y2={PAD_TOP + innerH}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />

                    {/* area */}
                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                    {/* line */}
                    {linePath && (
                      <path
                        d={linePath}
                        stroke="url(#lineGrad)"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* hover guideline */}
                    {hovered && (
                      <line
                        x1={hovered.x}
                        x2={hovered.x}
                        y1={PAD_TOP}
                        y2={PAD_TOP + innerH}
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.4"
                      />
                    )}

                    {/* points + hover targets */}
                    {points.map((p) => (
                      <g key={p.i}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoverIdx === p.i ? 5 : 3.5}
                          fill={hoverIdx === p.i ? "#3b82f6" : "white"}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          className="transition-all"
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={24}
                          fill="transparent"
                          onMouseEnter={() => setHoverIdx(p.i)}
                          style={{ cursor: "pointer" }}
                        />
                      </g>
                    ))}

                    {/* day labels */}
                    {points.map((p) => (
                      <text
                        key={`l${p.i}`}
                        x={p.x}
                        y={H - 12}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        fontSize="11"
                        style={{
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: hoverIdx === p.i ? 600 : 400,
                        }}
                      >
                        {p.d.label}
                      </text>
                    ))}
                  </svg>

                  {/* tooltip */}
                  {hovered && (
                    <div
                      className="absolute pointer-events-none rounded-lg bg-slate-900 text-white text-xs px-3 py-2 shadow-lg whitespace-nowrap"
                      style={{
                        left: `${(hovered.x / W) * 100}%`,
                        top: `${(hovered.y / H) * 100}%`,
                        transform: "translate(-50%, calc(-100% - 14px))",
                      }}
                    >
                      <div className="font-semibold mb-0.5">
                        {hovered.d.date.toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <div className="text-sm font-bold">
                        {formatBDT(hovered.d.total)}
                      </div>
                      <div className="text-white/70">
                        {hovered.d.count} order
                        {hovered.d.count === 1 ? "" : "s"}
                      </div>
                      <div
                        className="absolute left-1/2 -bottom-1 size-2 -translate-x-1/2 rotate-45 bg-slate-900"
                        aria-hidden
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* status breakdown */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">By status</h3>
            {ordersLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
              </div>
            ) : Object.keys(orderReport?.statusCounts ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(orderReport!.statusCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const pct = (count / (orders?.length || 1)) * 100;
                    return (
                      <li key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full ring-1 capitalize ${STATUS_STYLE[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}
                          >
                            {status}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundImage:
                                "linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)",
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* recent orders */}
          <div className="lg:col-span-3 rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-sm font-semibold">Recent orders</h3>
              <Link
                href="/admin/orders"
                className="text-xs text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>
            {ordersLoading ? (
              <div className="p-5 space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !orderReport?.recent.length ? (
              <p className="p-5 text-sm text-muted-foreground">
                No orders yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2 font-medium">Order</th>
                    <th className="px-5 py-2 font-medium">Customer</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 font-medium text-right">Total</th>
                    <th className="px-5 py-2 font-medium">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orderReport.recent.map((o) => {
                    const customerName =
                      [o.user?.firstName, o.user?.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      o.user?.email ||
                      "—";
                    return (
                      <tr
                        key={o.id}
                        className="border-t hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono text-xs">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="hover:underline"
                          >
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3">{customerName}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ring-1 capitalize ${STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold">
                          {formatBDT(Number(o.grandTotal))}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {formatDate(o.placedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
