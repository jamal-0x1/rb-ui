"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchPublic,
  buildProductQuery,
  dbProductToShopItem,
  type DbProduct,
} from "@/lib/publicApi";
import type { Product } from "@/types/product";

export default function HeroPromos() {
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    fetchPublic<DbProduct[]>(
      `/products${buildProductQuery({ tags: ["featured"], sort: "latest", limit: 2 })}`,
    )
      .then((rows) => setItems(rows.map(dbProductToShopItem)))
      .catch(() => setItems([]));
  }, []);

  if (items === null) {
    return (
      <>
        <PromoSkeleton />
        <PromoSkeleton />
      </>
    );
  }

  return (
    <>
      {[0, 1].map((i) => {
        const p = items[i];
        return p ? <PromoTile key={p.id} p={p} /> : <PromoSkeleton key={i} />;
      })}
    </>
  );
}

function PromoTile({ p }: { p: Product }) {
  const img = p.imgs.previews[0] ?? "/images/products/product-1-bg-1.png";
  const price = p.discountedPrice;
  const hasStrike = p.price > price;
  return (
    <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
      <div className="flex items-center gap-6 sm:gap-10">
        <div className="flex-1 min-w-0">
          <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-10 sm:mb-20 line-clamp-2">
            <Link
              href={`/shop-details/${p.slug}`}
              className="hover:text-blue ease-out duration-200"
            >
              {p.title}
            </Link>
          </h2>
          <div>
            <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
              limited time offer
            </p>
            <span className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-heading-5 text-red">
                ৳{price}
              </span>
              {hasStrike && (
                <span className="font-medium text-2xl text-dark-4 line-through">
                  ৳{p.price}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Image
            src={img}
            alt={p.title}
            width={123}
            height={161}
            className="object-contain h-[161px] w-[123px]"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

function PromoSkeleton() {
  return (
    <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 animate-pulse">
      <div className="flex items-center gap-6 sm:gap-10">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 rounded bg-gray-2" />
          <div className="h-3 w-24 rounded bg-gray-2 mt-10 sm:mt-20" />
          <div className="h-7 w-20 rounded bg-gray-2" />
        </div>
        <div className="shrink-0 h-[161px] w-[123px] rounded bg-gray-2" />
      </div>
    </div>
  );
}
