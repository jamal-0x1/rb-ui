"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import ShopDetails from "@/components/ShopDetails";
import {
  fetchPublic,
  dbProductToShopItem,
  type DbProduct,
} from "@/lib/publicApi";
import { updateproductDetails } from "@/redux/features/product-details";
import type { AppDispatch } from "@/redux/store";

export default function ShopDetailsClient() {
  const params = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.slug) return;
    fetchPublic<DbProduct>(`/products/slug/${params.slug}`)
      .then((p) => {
        const item = dbProductToShopItem(p);
        try {
          localStorage.setItem("productDetails", JSON.stringify(item));
        } catch {
          /* ignore */
        }
        dispatch(updateproductDetails({ ...item, quantity: 1 }));
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
  }, [params?.slug, dispatch]);

  if (error) {
    return (
      <main className="max-w-[1170px] mx-auto px-4 py-20 text-center">
        <p className="text-dark-4">Product not found.</p>
      </main>
    );
  }

  if (!loaded) {
    return (
      <main className="max-w-[1170px] mx-auto px-4 py-20 text-center">
        <p className="text-dark-4">Loading product…</p>
      </main>
    );
  }

  return (
    <main>
      <ShopDetails />
    </main>
  );
}
