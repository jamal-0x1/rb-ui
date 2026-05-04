import type { Product } from "@/types/product";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riyad-bhai.orbitalmind.xyz"
).replace(/\/$/, "");

type Props = { product: Product };

export default function ShopDetailsJsonLd({ product }: Props) {
  if (!product || !product.title || !product.slug) return null;

  const url = `${SITE_URL}/shop-details/${product.slug}`;
  const image = product.imgs?.previews?.filter(Boolean) ?? [];

  const totalStock = (product.variants ?? []).reduce(
    (sum, v) => sum + (v.inventory?.quantityOnHand ?? 0),
    0,
  );
  const availability =
    totalStock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const conditionMap: Record<string, string> = {
    new: "https://schema.org/NewCondition",
    refurbished: "https://schema.org/RefurbishedCondition",
    used: "https://schema.org/UsedCondition",
  };
  const itemCondition = conditionMap[product.condition ?? "new"] ?? conditionMap.new;

  const description =
    product.shortDescription ??
    product.description ??
    product.specifications ??
    undefined;

  const rating =
    product.reviewStats && product.reviewStats.count > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: product.reviewStats.average.toFixed(1),
          reviewCount: product.reviewStats.count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    image,
    sku: (product as { sku?: string }).sku,
    mpn: product.mpn ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BDT",
      price: product.price,
      availability,
      itemCondition,
    },
    aggregateRating: rating,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${SITE_URL}/shop?category=${product.category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.title,
              item: url,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product.title,
              item: url,
            },
          ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
