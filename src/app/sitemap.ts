import type { MetadataRoute } from "next";
import { PUBLIC_API_URL, type DbProduct, type DbCategory } from "@/lib/publicApi";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riyad-bhai.orbitalmind.xyz"
).replace(/\/$/, "");

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${PUBLIC_API_URL}${path}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/signin`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const products = (await safeFetch<DbProduct[]>("/products?limit=500")) ?? [];
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.active && !p.noIndex)
    .map((p) => ({
      url: `${SITE_URL}/shop-details/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const categories = (await safeFetch<DbCategory[]>("/categories?topLevel=true")) ?? [];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/shop?category=${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
