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
  specifications?: string | null;
  careInstructions?: string | null;
  attributes?: Record<string, string | number | null> | null;
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
  const sortedImages = (p.images ?? []).slice().sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });
  const allUrls = sortedImages.map((i) => resolveAsset(i.url));
  const previews = allUrls.slice(0, 4);
  const thumbnails = allUrls.length > 1 ? allUrls : previews;
  const price = Number(p.basePrice);
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    reviews: 0,
    price,
    discountedPrice: price,
    description: p.description,
    specifications: p.specifications ?? null,
    careInstructions: p.careInstructions ?? null,
    attributes: p.attributes ?? null,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : null,
    variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
    })),
    tags: (p.tags ?? []).map((t) => t.tag.name),
    inStock: p.active,
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
