"use client";

import { PUBLIC_API_URL } from "./publicApi";
import { getUserToken } from "./userAuth";

export type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

export type ReviewsResponse = {
  items: ReviewItem[];
  stats: { count: number; average: number };
};

export async function fetchReviewsForProduct(
  productId: string,
): Promise<ReviewsResponse> {
  const res = await fetch(`${PUBLIC_API_URL}/reviews/product/${productId}`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [], stats: { count: 0, average: 0 } };
  return res.json();
}

export async function submitReview(input: {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
}): Promise<ReviewItem> {
  const token = getUserToken();
  if (!token) throw new Error("AUTH_REQUIRED");
  const res = await fetch(`${PUBLIC_API_URL}/reviews`, {
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
  return data as ReviewItem;
}
