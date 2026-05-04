"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { fetchOrder, type Order } from "@/lib/orderApi";
import { resolveAsset } from "@/lib/publicApi";
import { useCurrentUser } from "@/lib/userAuth";

const fmtBDT = (n: string | number) =>
  `৳${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-yellow-light-4 text-yellow-dark" },
  confirmed: { label: "Confirmed", cls: "bg-blue-light-5 text-blue-dark" },
  shipped: { label: "Shipped", cls: "bg-blue-light-4 text-blue-dark" },
  delivered: { label: "Delivered", cls: "bg-green-light-6 text-green-dark" },
  cancelled: { label: "Cancelled", cls: "bg-red-light-6 text-red-dark" },
  refunded: { label: "Refunded", cls: "bg-gray-3 text-dark-3" },
};

const PAYMENT_PILL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Awaiting payment", cls: "bg-yellow-light-4 text-yellow-dark" },
  collected: { label: "Paid", cls: "bg-green-light-6 text-green-dark" },
  refunded: { label: "Refunded", cls: "bg-gray-3 text-dark-3" },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useCurrentUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/signin?next=/orders/${id}`);
      return;
    }
    let cancelled = false;
    (async () => {
      const o = await fetchOrder(id);
      if (cancelled) return;
      if (!o) {
        setNotFound(true);
      } else {
        setOrder(o);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading, router]);

  return (
    <main>
      <Breadcrumb title="Order details" pages={["my account", "order details"]} />
      <section className="py-12 sm:py-20 bg-gray-2">
        <div className="max-w-[960px] w-full mx-auto px-4 sm:px-8 print:max-w-full print:px-0">
          {loading || authLoading ? (
            <div className="bg-white rounded-[10px] shadow-1 p-12 text-center text-dark-4">
              Loading order…
            </div>
          ) : notFound || !order ? (
            <div className="bg-white rounded-[10px] shadow-1 p-12 text-center">
              <h1 className="font-semibold text-2xl text-dark mb-3">
                Order not found
              </h1>
              <p className="text-dark-4 mb-6">
                We couldn&apos;t locate that order. It may have been removed or
                belong to another account.
              </p>
              <Link
                href="/my-account?tab=orders"
                className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md hover:bg-blue-dark"
              >
                Back to my orders
              </Link>
            </div>
          ) : (
            <InvoiceCard order={order} />
          )}
        </div>
      </section>

      <style jsx global>{`
        @media print {
          header,
          footer,
          .breadcrumb-section,
          .no-print {
            display: none !important;
          }
          body,
          main,
          section {
            background: white !important;
          }
          .invoice-card {
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function InvoiceCard({ order }: { order: Order }) {
  const isInvoice = order.orderNumber.startsWith("INV-");
  const status = STATUS_PILL[order.status] ?? {
    label: order.status,
    cls: "bg-gray-3 text-dark-3",
  };
  const payment = order.payments?.[0];
  const paymentPill = payment
    ? PAYMENT_PILL[payment.status] ?? {
        label: payment.status,
        cls: "bg-gray-3 text-dark-3",
      }
    : null;

  return (
    <article className="invoice-card bg-white rounded-[10px] shadow-1 overflow-hidden">
      <header className="px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-custom-sm uppercase tracking-wide text-dark-4 mb-1">
            {isInvoice ? "Invoice" : "Order"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-dark-4 mt-1">
            Placed {fmtDate(order.placedAt)}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${status.cls}`}
            >
              {status.label}
            </span>
            {paymentPill && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentPill.cls}`}
              >
                {paymentPill.label}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-custom-sm uppercase tracking-wide text-dark-4 mb-1">
            Riyad Bhai
          </p>
          <p className="text-sm text-dark">House 12, Road 7, Dhanmondi</p>
          <p className="text-sm text-dark">Dhaka 1205, Bangladesh</p>
          <p className="text-sm text-dark-4 mt-1">support@orbitalmind.xyz</p>
          <div className="no-print flex justify-end gap-2 mt-4">
            <button
              onClick={() => window.print()}
              className="inline-flex font-medium text-white bg-blue py-2 px-4 rounded-md hover:bg-blue-dark text-sm"
            >
              Print / save PDF
            </button>
            <Link
              href="/my-account?tab=orders"
              className="inline-flex font-medium text-dark bg-gray-2 py-2 px-4 rounded-md hover:bg-gray-3 text-sm"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="px-6 sm:px-10 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-gray-3 text-sm">
        <div>
          <p className="text-custom-sm uppercase tracking-wide text-dark-4 mb-2">
            Bill to
          </p>
          {order.user ? (
            <>
              <p className="font-medium text-dark">
                {[order.user.firstName, order.user.lastName]
                  .filter(Boolean)
                  .join(" ") || order.user.email}
              </p>
              <p className="text-dark-4">{order.user.email}</p>
            </>
          ) : (
            <p className="text-dark-4">—</p>
          )}
        </div>
        <div>
          <p className="text-custom-sm uppercase tracking-wide text-dark-4 mb-2">
            Ship to
          </p>
          {order.shippingAddress ? (
            <address className="not-italic text-dark space-y-0.5">
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p>{order.shippingAddress.line2}</p>
              )}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state
                  ? `, ${order.shippingAddress.state}`
                  : ""}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </address>
          ) : (
            <p className="text-dark-4">—</p>
          )}
        </div>
        <div>
          <p className="text-custom-sm uppercase tracking-wide text-dark-4 mb-2">
            Payment
          </p>
          {payment ? (
            <>
              <p className="font-medium text-dark capitalize">
                {payment.method === "cod" ? "Cash on delivery" : payment.method}
              </p>
              <p className="text-dark-4">{fmtBDT(payment.amount)}</p>
              {payment.collectedAt && (
                <p className="text-xs text-dark-4 mt-0.5">
                  Collected {fmtDate(payment.collectedAt)}
                </p>
              )}
            </>
          ) : (
            <p className="text-dark-4">—</p>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-10 py-6 border-b border-gray-3">
        <p className="text-custom-sm uppercase tracking-wide text-dark-4 mb-3">
          Items
        </p>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-dark-4 border-b border-gray-3">
                <th className="font-medium pb-3 pr-3">Product</th>
                <th className="font-medium pb-3 pr-3">SKU</th>
                <th className="font-medium pb-3 pr-3 text-right">Qty</th>
                <th className="font-medium pb-3 pr-3 text-right">Unit price</th>
                <th className="font-medium pb-3 text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => {
                const productSlug = it.variant?.product?.slug;
                const img = it.variant?.product?.images?.[0]?.url;
                const variantLine = [it.variant?.color, it.variant?.size]
                  .filter(Boolean)
                  .join(" · ");
                const brand = it.variant?.product?.brand;
                return (
                  <tr key={it.id} className="border-b border-gray-3 align-top">
                    <td className="py-3 pr-3">
                      <div className="flex gap-3">
                        <div className="size-12 rounded-md bg-gray-2 overflow-hidden flex-shrink-0">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveAsset(img)}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          {brand && (
                            <p className="text-[11px] uppercase tracking-wide text-dark-4">
                              {brand}
                            </p>
                          )}
                          {productSlug ? (
                            <Link
                              href={`/shop-details/${productSlug}`}
                              className="font-medium text-dark hover:text-blue block truncate"
                            >
                              {it.productNameSnapshot}
                            </Link>
                          ) : (
                            <span className="font-medium text-dark block truncate">
                              {it.productNameSnapshot}
                            </span>
                          )}
                          {variantLine && (
                            <p className="text-xs text-dark-4 mt-0.5">
                              {variantLine}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-dark-4">
                      {it.variantSkuSnapshot}
                    </td>
                    <td className="py-3 pr-3 text-right">{it.quantity}</td>
                    <td className="py-3 pr-3 text-right">
                      {fmtBDT(it.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {fmtBDT(it.lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          {order.notes && (
            <>
              <p className="text-custom-sm uppercase tracking-wide text-dark-4 mb-2">
                Notes
              </p>
              <p className="text-dark whitespace-pre-wrap">{order.notes}</p>
            </>
          )}
        </div>
        <div className="space-y-2 sm:ml-auto sm:w-full sm:max-w-xs">
          <Row label="Subtotal" value={fmtBDT(order.subtotal)} />
          {Number(order.discountAmount) > 0 && (
            <Row
              label="Discount"
              value={`− ${fmtBDT(order.discountAmount)}`}
              muted
            />
          )}
          {Number(order.taxAmount) > 0 && (
            <Row label="Tax" value={fmtBDT(order.taxAmount)} muted />
          )}
          <Row label="Shipping" value={fmtBDT(order.shippingAmount)} muted />
          <div className="border-t border-gray-3 pt-2 mt-2">
            <Row
              label="Total"
              value={fmtBDT(order.grandTotal)}
              emphasize
            />
          </div>
        </div>
      </div>

      <footer className="px-6 sm:px-10 py-6 border-t border-gray-3 text-center text-xs text-dark-4">
        Thank you for shopping with Riyad Bhai. Questions? Email{" "}
        <a href="mailto:support@orbitalmind.xyz" className="text-blue">
          support@orbitalmind.xyz
        </a>{" "}
        or call <span className="font-medium">+880 1872-570727</span>.
      </footer>
    </article>
  );
}

function Row({
  label,
  value,
  muted,
  emphasize,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${muted ? "text-dark-4" : "text-dark"} ${
        emphasize ? "text-base font-semibold" : ""
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
