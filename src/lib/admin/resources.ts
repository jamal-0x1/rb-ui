export type ResourceField = {
  key: string;
  label: string;
  type?: "text" | "number" | "boolean" | "json";
  hideInList?: boolean;
  hideInForm?: boolean;
  relation?: { resource: string; labelField: string };
};

export type Resource = {
  slug: string;
  label: string;
  apiPath: string;
  fields: ResourceField[];
  coreModule?: boolean;
};

export const RESOURCES: Resource[] = [
  {
    slug: "users",
    label: "Users",
    apiPath: "/users",
    coreModule: true,
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
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
    coreModule: true,
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "parentId", label: "Parent", relation: { resource: "categories", labelField: "name" } },
      { key: "sortOrder", label: "Sort", type: "number" },
    ],
  },
  {
    slug: "products",
    label: "Products",
    apiPath: "/products",
    coreModule: true,
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "sku", label: "SKU" },
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "categoryId", label: "Category", relation: { resource: "categories", labelField: "name" } },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "productId", label: "Product", relation: { resource: "products", labelField: "name" } },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "productId", label: "Product", relation: { resource: "products", labelField: "name" } },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "name", label: "Name" },
    ],
  },
  {
    slug: "inventory",
    label: "Inventory",
    apiPath: "/inventory",
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "variantId", label: "Variant", relation: { resource: "product-variants", labelField: "sku" } },
      { key: "quantityOnHand", label: "On hand", type: "number" },
      { key: "quantityReserved", label: "Reserved", type: "number" },
      { key: "reorderThreshold", label: "Reorder at", type: "number" },
    ],
  },
  {
    slug: "orders",
    label: "Orders",
    apiPath: "/orders",
    coreModule: true,
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "orderNumber", label: "Number" },
      { key: "userId", label: "User", relation: { resource: "users", labelField: "email" } },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "orderId", label: "Order", relation: { resource: "orders", labelField: "orderNumber" } },
      { key: "variantId", label: "Variant", relation: { resource: "product-variants", labelField: "sku" } },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "userId", label: "User", relation: { resource: "users", labelField: "email" } },
      { key: "couponId", label: "Coupon", relation: { resource: "coupons", labelField: "code" } },
      { key: "createdAt", label: "Created", hideInForm: true },
    ],
  },
  {
    slug: "cart-items",
    label: "Cart items",
    apiPath: "/cart-items",
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "cartId", label: "Cart", relation: { resource: "carts", labelField: "id" } },
      { key: "variantId", label: "Variant", relation: { resource: "product-variants", labelField: "sku" } },
      { key: "quantity", label: "Qty", type: "number" },
      { key: "unitPriceSnapshot", label: "Unit price" },
    ],
  },
  {
    slug: "coupons",
    label: "Coupons",
    apiPath: "/coupons",
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "userId", label: "User", relation: { resource: "users", labelField: "email" } },
      { key: "label", label: "Label" },
      { key: "line1", label: "Line 1" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "postalCode", label: "ZIP" },
      { key: "country", label: "Country" },
    ],
  },
  {
    slug: "payments",
    label: "Payments",
    apiPath: "/payments",
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "orderId", label: "Order", relation: { resource: "orders", labelField: "orderNumber" } },
      { key: "method", label: "Method" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "collectedAt", label: "Collected" },
      { key: "notes", label: "Notes", hideInList: true },
    ],
  },
  {
    slug: "shipments",
    label: "Shipments",
    apiPath: "/shipments",
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "orderId", label: "Order", relation: { resource: "orders", labelField: "orderNumber" } },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "shipmentId", label: "Shipment", relation: { resource: "shipments", labelField: "trackingNumber" } },
      { key: "orderItemId", label: "Order item", relation: { resource: "order-items", labelField: "id" } },
      { key: "quantity", label: "Qty", type: "number" },
    ],
  },
  {
    slug: "reviews",
    label: "Reviews",
    apiPath: "/reviews",
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "userId", label: "User", relation: { resource: "users", labelField: "email" } },
      { key: "productId", label: "Product", relation: { resource: "products", labelField: "name" } },
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
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "userId", label: "User", relation: { resource: "users", labelField: "email" } },
      { key: "name", label: "Name" },
      { key: "isPublic", label: "Public", type: "boolean" },
    ],
  },
  {
    slug: "wishlist-items",
    label: "Wishlist items",
    apiPath: "/wishlist-items",
    fields: [
      { key: "id", label: "ID", hideInForm: true, hideInList: true },
      { key: "wishlistId", label: "Wishlist", relation: { resource: "wishlists", labelField: "name" } },
      { key: "variantId", label: "Variant", relation: { resource: "product-variants", labelField: "sku" } },
      { key: "addedAt", label: "Added", hideInForm: true },
    ],
  },
];

export function getResource(slug: string) {
  return RESOURCES.find((r) => r.slug === slug);
}
