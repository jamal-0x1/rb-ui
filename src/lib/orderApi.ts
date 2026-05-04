"use client";

import { PUBLIC_API_URL } from "./publicApi";
import { getUserToken } from "./userAuth";

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
};

export type CheckoutShippingMethod = "free" | "standard" | "express";

export type CheckoutInput = {
  items: { variantId: string; quantity: number }[];
  shipping: CheckoutAddress;
  paymentMethod: "cod";
  shippingMethod?: CheckoutShippingMethod;
  couponCode?: string;
  notes?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  discountAmount: string;
  grandTotal: string;
  currency: string;
  placedAt: string;
  items: Array<{
    id: string;
    variantId: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
    productNameSnapshot: string;
    variantSkuSnapshot: string;
    variant?: {
      id: string;
      sku: string;
      size: string | null;
      color: string | null;
    } | null;
  }>;
};

export const SHIPPING_RATES: Record<CheckoutShippingMethod, number> = {
  free: 0,
  standard: 60,
  express: 150,
};

export const SHIPPING_LABELS: Record<CheckoutShippingMethod, string> = {
  free: "Free Shipping (5-7 days)",
  standard: "Standard (2-3 days)",
  express: "Express (next day)",
};

export async function createCheckout(input: CheckoutInput): Promise<Order> {
  const token = getUserToken();
  if (!token) throw new Error("AUTH_REQUIRED");

  const res = await fetch(`${PUBLIC_API_URL}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message ?? res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return data as Order;
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const res = await fetch(`${PUBLIC_API_URL}/orders/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMyOrders(): Promise<Order[]> {
  const token = getUserToken();
  if (!token) return [];
  const res = await fetch(`${PUBLIC_API_URL}/orders/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}
