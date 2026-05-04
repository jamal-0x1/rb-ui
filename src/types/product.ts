export type ProductVariantInfo = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  inventory?: { quantityOnHand: number } | null;
};

export type ReviewStats = {
  count: number;
  average: number;
};

export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number | string;
  slug?: string;
  description?: string | null;
  specifications?: string | null;
  careInstructions?: string | null;
  attributes?: Record<string, string | number | null> | null;
  category?: { id: string; name: string; slug: string } | null;
  variants?: ProductVariantInfo[];
  tags?: string[];
  inStock?: boolean;
  reviewStats?: ReviewStats;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
