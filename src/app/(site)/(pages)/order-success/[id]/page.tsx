"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { fetchOrder, type Order } from "@/lib/orderApi";

const formatBDT = (n: string | number) =>
  `৳${Number(n).toLocaleString("en-IN")}`;

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const o = await fetchOrder(id);
      if (!cancelled) {
        setOrder(o);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main>
      <Breadcrumb title="Order placed" pages={["order placed"]} />
      <section className="py-20 bg-gray-2">
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8">
          <div className="bg-white shadow-1 rounded-[10px] p-8 sm:p-12 text-center">
            {loading ? (
              <p className="text-dark-4">Loading order...</p>
            ) : !order ? (
              <>
                <h1 className="font-semibold text-2xl text-dark mb-3">
                  Order not found
                </h1>
                <p className="text-dark-4 mb-6">
                  The order you&apos;re looking for doesn&apos;t exist or was
                  removed.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md hover:bg-blue-dark"
                >
                  Back to shop
                </Link>
              </>
            ) : (
              <>
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-light-6 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h1 className="font-semibold text-2xl text-dark mb-2">
                  Thanks — your order is in!
                </h1>
                <p className="text-dark-4 mb-6">
                  Order number{" "}
                  <span className="font-medium text-dark">
                    {order.orderNumber}
                  </span>
                  . Cash on delivery — pay when it arrives.
                </p>

                <div className="text-left border border-gray-3 rounded-lg overflow-hidden mb-6">
                  <div className="bg-gray-1 px-5 py-3 border-b border-gray-3 flex justify-between">
                    <span className="font-medium text-dark">Item</span>
                    <span className="font-medium text-dark">Subtotal</span>
                  </div>
                  {order.items.map((it) => {
                    const variantLine = [it.variant?.color, it.variant?.size]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <div
                        key={it.id}
                        className="px-5 py-3 border-b border-gray-3 flex justify-between gap-4"
                      >
                        <div className="flex-1">
                          <span className="text-dark">
                            {it.productNameSnapshot}
                            {it.quantity > 1 && (
                              <span className="text-dark-4 text-custom-sm">
                                {" "}
                                × {it.quantity}
                              </span>
                            )}
                          </span>
                          {variantLine && (
                            <p className="text-xs text-dark-4 mt-0.5 text-left">
                              {variantLine}
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-dark-4/70 mt-0.5 text-left">
                            {it.variantSkuSnapshot}
                          </p>
                        </div>
                        <span className="text-dark">
                          {formatBDT(it.lineTotal)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="px-5 py-3 border-b border-gray-3 flex justify-between text-dark-4">
                    <span>Subtotal</span>
                    <span>{formatBDT(order.subtotal)}</span>
                  </div>
                  <div className="px-5 py-3 border-b border-gray-3 flex justify-between text-dark-4">
                    <span>Shipping</span>
                    <span>{formatBDT(order.shippingAmount)}</span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="px-5 py-3 border-b border-gray-3 flex justify-between text-dark-4">
                      <span>Discount</span>
                      <span>− {formatBDT(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="px-5 py-4 flex justify-between font-semibold text-lg text-dark">
                    <span>Total</span>
                    <span>{formatBDT(order.grandTotal)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/shop"
                    className="inline-flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md hover:bg-blue-dark"
                  >
                    Continue shopping
                  </Link>
                  <Link
                    href="/my-account"
                    className="inline-flex justify-center font-medium text-dark bg-gray-2 py-3 px-6 rounded-md hover:bg-gray-3"
                  >
                    My account
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
