import type { Product } from "@/types/product";

export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const ASSET_ORIGIN = PUBLIC_API_URL.replace(/\/api\/?$/, "");

export type DbCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
};

export type DbProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type DbProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: string;
  currency: string;
  active: boolean;
  category?: DbCategory | null;
  categoryId: string;
  images?: DbProductImage[];
  variants?: Array<{ id: string; sku: string; size: string | null; color: string | null }>;
  tags?: Array<{ tag: { id: string; name: string } }>;
};

export function resolveAsset(url: string | null | undefined): string {
  if (!url) return "/images/products/product-1-bg-1.png";
  if (url.startsWith("http")) return url;
  return `${ASSET_ORIGIN}${url}`;
}

export function dbProductToShopItem(p: DbProduct): Product {
  const previews = (p.images ?? [])
    .filter((i) => i.isPrimary || i.sortOrder < 2)
    .slice(0, 2)
    .map((i) => resolveAsset(i.url));
  const thumbnails = (p.images ?? [])
    .slice(2, 4)
    .map((i) => resolveAsset(i.url));
  const price = Number(p.basePrice);
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    reviews: 0,
    price,
    discountedPrice: price,
    imgs: {
      previews: previews.length > 0 ? previews : ["/images/products/product-1-bg-1.png"],
      thumbnails: thumbnails.length > 0 ? thumbnails : previews,
    },
  };
}

export async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}
