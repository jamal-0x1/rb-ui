"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { clearToken } from "@/lib/admin/api";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ slug: "", label: "Dashboard" }],
  },
  {
    label: "Customers",
    items: [
      { slug: "users", label: "Users" },
      { slug: "addresses", label: "Addresses" },
      { slug: "payment-methods", label: "Payment methods" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { slug: "categories", label: "Categories" },
      { slug: "products", label: "Products" },
      { slug: "product-variants", label: "Variants" },
      { slug: "product-images", label: "Images" },
      { slug: "tags", label: "Tags" },
      { slug: "inventory", label: "Inventory" },
    ],
  },
  {
    label: "Sales",
    items: [
      { slug: "carts", label: "Carts" },
      { slug: "cart-items", label: "Cart items" },
      { slug: "orders", label: "Orders" },
      { slug: "order-items", label: "Order items" },
      { slug: "coupons", label: "Coupons" },
    ],
  },
  {
    label: "Fulfillment",
    items: [
      { slug: "payments", label: "Payments" },
      { slug: "shipments", label: "Shipments" },
      { slug: "shipment-items", label: "Shipment items" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { slug: "reviews", label: "Reviews" },
      { slug: "wishlists", label: "Wishlists" },
      { slug: "wishlist-items", label: "Wishlist items" },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearToken();
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800">
        <Link
          href="/admin"
          className="text-lg font-semibold tracking-tight"
          onClick={onNavigate}
        >
          rb-admin
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-2 pb-1 text-xs uppercase tracking-wider text-slate-500">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const href = item.slug
                  ? `/admin/${item.slug}`
                  : "/admin";
                const active =
                  pathname === href ||
                  (item.slug && pathname?.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`block px-2 py-1.5 rounded text-sm transition-colors ${
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full px-3 py-2 text-sm rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
