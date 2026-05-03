export type ResourceField = {
  key: string;
  label: string;
  type?: "text" | "number" | "boolean" | "json";
  hideInList?: boolean;
  hideInForm?: boolean;
};

export type Resource = {
  slug: string;
  label: string;
  apiPath: string;
  fields: ResourceField[];
};

export const RESOURCES: Resource[] = [
  {
    slug: "users",
    label: "Users",
    apiPath: "/users",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "email", label: "Email" },
      { key: "firstName", label: "First name" },
      { key: "lastName", label: "Last name" },
      { key: "role", label: "Role" },
      { key: "emailVerified", label: "Verified", type: "boolean" },
      { key: "createdAt", label: "Created", hideInForm: true },
    ],
  },
  {
    slug: "categories",
    label: "Categories",
    apiPath: "/categories",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "parentId", label: "Parent ID" },
      { key: "sortOrder", label: "Sort", type: "number" },
    ],
  },
  {
    slug: "products",
    label: "Products",
    apiPath: "/products",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "sku", label: "SKU" },
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "categoryId", label: "Category ID" },
      { key: "basePrice", label: "Price" },
      { key: "currency", label: "Currency" },
      { key: "active", label: "Active", type: "boolean" },
      { key: "description", label: "Description", hideInList: true },
    ],
  },
  {
    slug: "product-variants",
    label: "Variants",
    apiPath: "/product-variants",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "productId", label: "Product ID" },
      { key: "sku", label: "SKU" },
      { key: "size", label: "Size" },
      { key: "color", label: "Color" },
      { key: "priceOverride", label: "Price override" },
      { key: "weightGrams", label: "Weight g", type: "number" },
    ],
  },
  {
    slug: "product-images",
    label: "Images",
    apiPath: "/product-images",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "productId", label: "Product ID" },
      { key: "url", label: "URL" },
      { key: "altText", label: "Alt" },
      { key: "isPrimary", label: "Primary", type: "boolean" },
      { key: "sortOrder", label: "Sort", type: "number" },
    ],
  },
  {
    slug: "tags",
    label: "Tags",
    apiPath: "/tags",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "name", label: "Name" },
    ],
  },
  {
    slug: "inventory",
    label: "Inventory",
    apiPath: "/inventory",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "variantId", label: "Variant ID" },
      { key: "quantityOnHand", label: "On hand", type: "number" },
      { key: "quantityReserved", label: "Reserved", type: "number" },
      { key: "reorderThreshold", label: "Reorder at", type: "number" },
    ],
  },
  {
    slug: "orders",
    label: "Orders",
    apiPath: "/orders",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "orderNumber", label: "Number" },
      { key: "userId", label: "User ID" },
      { key: "status", label: "Status" },
      { key: "grandTotal", label: "Total" },
      { key: "currency", label: "Currency" },
      { key: "placedAt", label: "Placed", hideInForm: true },
    ],
  },
  {
    slug: "order-items",
    label: "Order items",
    apiPath: "/order-items",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "orderId", label: "Order ID" },
      { key: "variantId", label: "Variant ID" },
      { key: "quantity", label: "Qty", type: "number" },
      { key: "unitPrice", label: "Unit price" },
      { key: "lineTotal", label: "Total" },
    ],
  },
  {
    slug: "carts",
    label: "Carts",
    apiPath: "/carts",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "userId", label: "User ID" },
      { key: "couponId", label: "Coupon ID" },
      { key: "createdAt", label: "Created", hideInForm: true },
    ],
  },
  {
    slug: "cart-items",
    label: "Cart items",
    apiPath: "/cart-items",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "cartId", label: "Cart ID" },
      { key: "variantId", label: "Variant ID" },
      { key: "quantity", label: "Qty", type: "number" },
      { key: "unitPriceSnapshot", label: "Unit price" },
    ],
  },
  {
    slug: "coupons",
    label: "Coupons",
    apiPath: "/coupons",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "code", label: "Code" },
      { key: "discountType", label: "Type" },
      { key: "discountValue", label: "Value" },
      { key: "minOrderAmount", label: "Min order" },
      { key: "usageLimit", label: "Limit", type: "number" },
      { key: "timesUsed", label: "Used", type: "number" },
      { key: "active", label: "Active", type: "boolean" },
    ],
  },
  {
    slug: "addresses",
    label: "Addresses",
    apiPath: "/addresses",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "userId", label: "User ID" },
      { key: "label", label: "Label" },
      { key: "line1", label: "Line 1" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "postalCode", label: "ZIP" },
      { key: "country", label: "Country" },
    ],
  },
  {
    slug: "payment-methods",
    label: "Payment methods",
    apiPath: "/payment-methods",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "userId", label: "User ID" },
      { key: "provider", label: "Provider" },
      { key: "brand", label: "Brand" },
      { key: "last4", label: "Last 4" },
      { key: "isDefault", label: "Default", type: "boolean" },
    ],
  },
  {
    slug: "payments",
    label: "Payments",
    apiPath: "/payments",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "orderId", label: "Order ID" },
      { key: "provider", label: "Provider" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "processedAt", label: "Processed" },
    ],
  },
  {
    slug: "shipments",
    label: "Shipments",
    apiPath: "/shipments",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "orderId", label: "Order ID" },
      { key: "carrier", label: "Carrier" },
      { key: "trackingNumber", label: "Tracking" },
      { key: "status", label: "Status" },
      { key: "shippedAt", label: "Shipped" },
    ],
  },
  {
    slug: "shipment-items",
    label: "Shipment items",
    apiPath: "/shipment-items",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "shipmentId", label: "Shipment ID" },
      { key: "orderItemId", label: "Order item ID" },
      { key: "quantity", label: "Qty", type: "number" },
    ],
  },
  {
    slug: "reviews",
    label: "Reviews",
    apiPath: "/reviews",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "userId", label: "User ID" },
      { key: "productId", label: "Product ID" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "title", label: "Title" },
      { key: "body", label: "Body", hideInList: true },
      { key: "verifiedPurchase", label: "Verified", type: "boolean" },
    ],
  },
  {
    slug: "wishlists",
    label: "Wishlists",
    apiPath: "/wishlists",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "userId", label: "User ID" },
      { key: "name", label: "Name" },
      { key: "isPublic", label: "Public", type: "boolean" },
    ],
  },
  {
    slug: "wishlist-items",
    label: "Wishlist items",
    apiPath: "/wishlist-items",
    fields: [
      { key: "id", label: "ID", hideInForm: true },
      { key: "wishlistId", label: "Wishlist ID" },
      { key: "variantId", label: "Variant ID" },
      { key: "addedAt", label: "Added", hideInForm: true },
    ],
  },
];

export function getResource(slug: string) {
  return RESOURCES.find((r) => r.slug === slug);
}
