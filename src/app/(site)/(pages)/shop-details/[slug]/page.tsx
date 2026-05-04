import type { Metadata } from "next";
import { PUBLIC_API_URL, resolveAsset, type DbProduct } from "@/lib/publicApi";
import ShopDetailsClient from "./ShopDetailsClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://riyad-bhai.orbitalmind.xyz").replace(/\/$/, "");

async function getProduct(slug: string): Promise<DbProduct | null> {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/products/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as DbProduct;
  } catch {
    return null;
  }
}

function clip(text: string | null | undefined, max: number): string | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return undefined;
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) {
    return { title: "Product not found", robots: { index: false, follow: false } };
  }

  const brandPart = p.brand ? `${p.brand} ` : "";
  const fallbackTitle = `${brandPart}${p.name} | RB`;
  const title = clip(p.metaTitle, 70) ?? clip(fallbackTitle, 70) ?? p.name;

  const fallbackDesc = p.shortDescription ?? p.description ?? p.specifications;
  const description = clip(p.metaDescription, 200) ?? clip(fallbackDesc, 200);

  const primary = (p.images ?? []).find((i) => i.isPrimary) ?? (p.images ?? [])[0];
  const ogImage = primary ? resolveAsset(primary.url) : undefined;

  const canonical = `${SITE_URL}/shop-details/${p.slug}`;
  const indexable = p.active && !p.noIndex;

  return {
    title,
    description,
    alternates: { canonical },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "RB Accessories",
      images: ogImage ? [{ url: ogImage, alt: primary?.altText ?? p.name }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function ShopDetailsBySlugPage() {
  return <ShopDetailsClient />;
}
