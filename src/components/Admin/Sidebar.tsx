"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
  ShoppingCart,
  Truck,
  Star,
} from "lucide-react";
import { api, clearToken } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Me = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
};

type NavItem = { slug: string; label: string };
type NavGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Catalog",
    icon: Package,
    items: [
      { slug: "products", label: "Products" },
      { slug: "categories", label: "Categories" },
      { slug: "tags", label: "Tags" },
      { slug: "inventory", label: "Inventory" },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    items: [
      { slug: "users", label: "Users" },
      { slug: "addresses", label: "Addresses" },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    items: [
      { slug: "orders", label: "Orders" },
      { slug: "coupons", label: "Coupons" },
    ],
  },
  {
    label: "Fulfillment",
    icon: Truck,
    items: [
      { slug: "payments", label: "Payments" },
      { slug: "shipments", label: "Shipments" },
    ],
  },
  {
    label: "Engagement",
    icon: Star,
    items: [
      { slug: "reviews", label: "Reviews" },
      { slug: "wishlists", label: "Wishlists" },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<Me>("/auth/me")
      .then((u) => {
        if (!cancelled) setMe(u);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const containingGroup = NAV_GROUPS.find((g) =>
    g.items.some((i) => pathname?.startsWith(`/admin/${i.slug}`)),
  );

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NAV_GROUPS.map((g) => [g.label, g.label === containingGroup?.label]),
    ),
  );

  const displayName =
    [me?.firstName, me?.lastName].filter(Boolean).join(" ") ||
    me?.email?.split("@")[0] ||
    "Admin";
  const initials = (
    me?.firstName?.[0] ?? me?.email?.[0] ?? "A"
  ).toUpperCase();

  const logout = () => {
    clearToken();
    router.push("/admin/login");
  };

  const dashHref = "/admin/dash";
  const dashActive = pathname === dashHref || pathname === "/admin";

  return (
    <aside className="w-64 h-full max-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800">
        <Link
          href="/admin"
          className="text-base font-semibold tracking-tight hover:text-white transition-colors"
          onClick={onNavigate}
        >
          rb-admin
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          <Link
            href={dashHref}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors",
              dashActive
                ? "bg-white/10 text-white font-medium"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            const isOpen = !!open[group.label];
            const groupActive = group.items.some(
              (i) => pathname?.startsWith(`/admin/${i.slug}`),
            );
            return (
              <div key={group.label} className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpen((s) => ({ ...s, [group.label]: !s[group.label] }))
                  }
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors",
                    groupActive
                      ? "text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                {isOpen && (
                  <ul className="mt-0.5 ml-6 border-l border-slate-800 pl-2 space-y-0.5">
                    {group.items.map((item) => {
                      const href = `/admin/${item.slug}`;
                      const active = pathname === href;
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={onNavigate}
                            className={cn(
                              "block px-2 py-1.5 rounded-md text-sm transition-colors",
                              active
                                ? "bg-white/10 text-white font-medium"
                                : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-slate-800" />
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-white/5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
            }}
            aria-hidden
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-100 truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-400 truncate" title={me?.email}>
              {me?.email ?? "loading…"}
            </p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-slate-100 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
