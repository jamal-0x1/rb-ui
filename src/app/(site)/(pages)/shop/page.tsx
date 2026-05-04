import React from "react";
import ShopPage from "@/components/ShopPage";
import type { Metadata } from "next";
import { PUBLIC_API_URL, type DbCategory } from "@/lib/publicApi";

export const dynamic = "force-dynamic";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riyad-bhai.orbitalmind.xyz"
).replace(/\/$/, "");

async function findCategory(slug: string): Promise<DbCategory | null> {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/categories?topLevel=true`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const list = (await res.json()) as DbCategory[];
    return list.find((c) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categorySlug = typeof sp.category === "string" ? sp.category : "";

  if (q) {
    return {
      title: `Search: ${q}`,
      description: `Accessories matching "${q}" — phones, watches, peripherals and more on RB Bangladesh.`,
      robots: { index: false, follow: true },
    };
  }

  if (categorySlug) {
    const cat = await findCategory(categorySlug);
    if (cat) {
      return {
        title: `${cat.name} — accessories in BDT`,
        description: `Shop ${cat.name.toLowerCase()} on RB. Bangladesh storefront, cash on delivery.`,
        alternates: { canonical: `${SITE_URL}/shop?category=${cat.slug}` },
      };
    }
  }

  return {
    title: "Shop all accessories",
    description:
      "Browse all accessories on RB — phones, watches, audio, peripherals, networking. BDT pricing, cash on delivery across Bangladesh.",
    alternates: { canonical: `${SITE_URL}/shop` },
  };
}

const Shop = () => {
  return (
    <main>
      <ShopPage />
    </main>
  );
};

export default Shop;
