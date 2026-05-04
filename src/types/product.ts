export type ProductVariantInfo = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
};

export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number | string;
  slug?: string;
  description?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  variants?: ProductVariantInfo[];
  tags?: string[];
  inStock?: boolean;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
