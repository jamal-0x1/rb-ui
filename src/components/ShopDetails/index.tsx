"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import ShopDetailsJsonLd from "./JsonLd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  fetchReviewsForProduct,
  submitReview,
  type ReviewItem,
} from "@/lib/reviewsApi";
import { useCurrentUser } from "@/lib/userAuth";
import type { Product, ProductVariantInfo } from "@/types/product";
import { toast } from "sonner";

const COLOR_HEX: Record<string, string> = {
  Black: "#111",
  Midnight: "#1a1a2e",
  Purple: "#7c3aed",
  Silver: "#cbd5e1",
  "Space Gray": "#4a4a4a",
  Titanium: "#a8a29e",
  Graphite: "#374151",
  "Pale Gray": "#e5e7eb",
  Blue: "#3b82f6",
  Red: "#ef4444",
  Orange: "#f97316",
  Pink: "#ec4899",
  Navy: "#1e3a8a",
  White: "#fafafa",
  Green: "#22c55e",
  Gold: "#d4af37",
};
const colorSwatch = (name: string) =>
  COLOR_HEX[name] ?? name.toLowerCase();

const formatBDT = (n: number) => `৳${Number(n).toLocaleString("en-IN")}`;

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill={filled ? "#FFA645" : "none"}
      stroke="#FFA645"
      strokeWidth="1.2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16.79 6.72L11.7 5.93L9.39 1.10C9.22 0.76 8.78 0.76 8.61 1.10L6.30 5.96L1.24 6.72C0.87 6.78 0.73 7.26 1.01 7.51L4.70 11.31L3.83 16.62C3.77 16.99 4.13 17.30 4.47 17.07L9.06 14.57L13.61 17.07C13.92 17.24 14.32 16.96 14.23 16.62L13.36 11.31L17.04 7.51C17.27 7.26 17.16 6.78 16.79 6.72Z" />
    </svg>
  );
}

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} filled={i < Math.round(rating)} />
      ))}
    </div>
  );
}

const TABS = [
  { id: "tabOne", title: "Description" },
  { id: "tabTwo", title: "Additional Information" },
  { id: "tabThree", title: "Reviews" },
];

const ShopDetails = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { openCartModal } = useCartModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const { user } = useCurrentUser();

  const productFromStorage = useAppSelector(
    (state) => state.productDetailsReducer.value,
  );

  const initialProduct =
    typeof window !== "undefined"
      ? (() => {
          const raw = localStorage.getItem("productDetails");
          return raw ? (JSON.parse(raw) as Product) : null;
        })()
      : null;

  const product: Product = (initialProduct ??
    productFromStorage) as Product;

  useEffect(() => {
    if (productFromStorage?.title) {
      try {
        localStorage.setItem(
          "productDetails",
          JSON.stringify(productFromStorage),
        );
      } catch {
        /* ignore */
      }
    }
  }, [productFromStorage]);

  const variants: ProductVariantInfo[] = product.variants ?? [];
  const productTags: string[] = product.tags ?? [];

  const variantColors = Array.from(
    new Set(variants.map((v) => v.color).filter((c): c is string => !!c)),
  );
  const variantSizes = Array.from(
    new Set(variants.map((v) => v.size).filter((s): s is string => !!s)),
  );

  const [activeColor, setActiveColor] = useState<string>(
    variantColors[0] ?? "",
  );
  const [activeSize, setActiveSize] = useState<string>(variantSizes[0] ?? "");
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tabOne");

  // Pick variant matching color+size, else first
  const selectedVariant: ProductVariantInfo | undefined = useMemo(() => {
    const match = variants.find(
      (v) =>
        (!variantColors.length || v.color === activeColor) &&
        (!variantSizes.length || v.size === activeSize),
    );
    return match ?? variants[0];
  }, [variants, activeColor, activeSize, variantColors.length, variantSizes.length]);

  // Variant-aware gallery: prefer images attached to selected variant, else
  // product-level (variantId null), else legacy imgs.
  const gallery = useMemo(() => {
    const images = product.images ?? [];
    const variantId = selectedVariant?.id ?? null;
    const variantImgs = variantId
      ? images.filter((i) => i.variantId === variantId)
      : [];
    const productImgs = images.filter((i) => !i.variantId);
    const chosen =
      variantImgs.length > 0
        ? variantImgs
        : productImgs.length > 0
          ? productImgs
          : images;
    if (chosen.length > 0) {
      const urls = chosen.map((i) => i.url);
      return {
        previews: urls.slice(0, 4),
        thumbnails: urls.length > 1 ? urls : urls,
      };
    }
    return product.imgs ?? { previews: [], thumbnails: [] };
  }, [product.images, product.imgs, selectedVariant?.id]);

  // Reset preview index when variant gallery changes
  useEffect(() => {
    setPreviewImg(0);
  }, [selectedVariant?.id]);

  const stockQty = selectedVariant?.inventory?.quantityOnHand ?? 0;
  const inStock = stockQty > 0;
  const lowStock = inStock && stockQty <= 5;

  const displayPrice =
    selectedVariant?.priceOverride ??
    product.discountedPrice ??
    product.price;

  const colorHasStock = (color: string) =>
    variants.some(
      (v) => v.color === color && (v.inventory?.quantityOnHand ?? 0) > 0,
    );
  const sizeAvailableForActiveColor = (size: string) => {
    if (!variantColors.length) {
      return variants.some(
        (v) => v.size === size && (v.inventory?.quantityOnHand ?? 0) > 0,
      );
    }
    return variants.some(
      (v) =>
        v.color === activeColor &&
        v.size === size &&
        (v.inventory?.quantityOnHand ?? 0) > 0,
    );
  };

  // Cap quantity to stock when stock changes
  useEffect(() => {
    if (stockQty > 0 && quantity > stockQty) setQuantity(stockQty);
  }, [stockQty, quantity]);

  // Switch to first available size when active color leaves current size out of stock
  useEffect(() => {
    if (!variantSizes.length) return;
    if (sizeAvailableForActiveColor(activeSize)) return;
    const next = variantSizes.find((s) => sizeAvailableForActiveColor(s));
    if (next && next !== activeSize) setActiveSize(next);
  }, [activeColor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reviews
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    count: number;
    average: number;
  }>(product.reviewStats ?? { count: 0, average: 0 });

  useEffect(() => {
    if (!product.id) return;
    let cancelled = false;
    (async () => {
      const data = await fetchReviewsForProduct(String(product.id));
      if (cancelled) return;
      setReviews(data.items);
      setReviewStats(data.stats);
      setReviewsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  // Add a Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewOk, setReviewOk] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewOk(null);
    if (!user) {
      router.push(
        `/signin?next=${encodeURIComponent(`/shop-details/${product.slug ?? ""}`)}`,
      );
      return;
    }
    setSubmittingReview(true);
    try {
      const created = await submitReview({
        productId: String(product.id),
        rating: reviewRating,
        title: reviewTitle || undefined,
        body: reviewBody || undefined,
      });
      setReviews((prev) => [created, ...prev]);
      setReviewStats((prev) => {
        const newCount = prev.count + 1;
        const newAvg = (prev.average * prev.count + created.rating) / newCount;
        return { count: newCount, average: newAvg };
      });
      setReviewBody("");
      setReviewTitle("");
      setReviewName("");
      setReviewOk("Thanks — your review is posted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      if (msg === "AUTH_REQUIRED") {
        router.push(`/signin?next=/shop-details/${product.slug ?? ""}`);
        return;
      }
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const buildCartPayload = () => ({
    ...product,
    variantId: selectedVariant?.id,
    variantSku: selectedVariant?.sku,
    variantSize: selectedVariant?.size ?? null,
    variantColor: selectedVariant?.color ?? null,
    quantity,
    price: Number(product.price),
    discountedPrice: Number(displayPrice),
  });

  const handleAddToCart = () => {
    if (!inStock) return;
    dispatch(addItemToCart(buildCartPayload() as never));
    toast.success(`Added to cart — ${product.title}`);
    openCartModal();
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    dispatch(addItemToCart(buildCartPayload() as never));
    toast.success(`Added to cart — ${product.title}`);
    router.push("/checkout");
  };

  const handleAddToWishlist = () => {
    dispatch(
      addItemToWishlist({
        ...product,
        status: inStock ? "available" : "out-of-stock",
        quantity: 1,
      } as never),
    );
    toast.success(`Added to wishlist — ${product.title}`);
  };

  if (!product || !product.title) {
    return (
      <main className="max-w-[1170px] mx-auto px-4 py-20 text-center">
        <p className="text-dark-4">Loading product…</p>
      </main>
    );
  }

  return (
    <>
      <ShopDetailsJsonLd product={product} />
      <Breadcrumb title={product.title} pages={["shop", "/", "details"]} />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* Gallery */}
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => openPreviewModal(previewImg)}
                  aria-label="zoom"
                  className="w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center text-dark hover:text-blue absolute top-4 right-4 z-10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {gallery.previews?.[previewImg] && (
                  <Image
                    src={gallery.previews[previewImg]}
                    alt={product.title}
                    width={400}
                    height={400}
                    unoptimized
                  />
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                {gallery.thumbnails?.map((src, key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setPreviewImg(key)}
                    className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 border-2 hover:border-blue ${
                      key === previewImg ? "border-blue" : "border-transparent"
                    }`}
                  >
                    <Image src={src} alt="thumbnail" width={50} height={50} unoptimized />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="max-w-[539px] w-full">
              {product.brand && (
                <p className="text-xs uppercase tracking-wide font-medium text-dark-4 mb-1.5">
                  {product.brand}
                </p>
              )}
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                  {product.title}
                </h2>
                {productTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {productTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5 capitalize"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-dark-4 mb-3">
                {product.category?.name && (
                  <span>
                    Category:{" "}
                    <Link
                      href={`/shop?categoryIds=${product.category.id}`}
                      className="text-dark hover:text-blue"
                    >
                      {product.category.name}
                    </Link>
                  </span>
                )}
                {product.mpn && (
                  <span>
                    MPN: <span className="text-dark">{product.mpn}</span>
                  </span>
                )}
                {product.condition && product.condition !== "new" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-light-4 text-yellow-dark text-xs capitalize">
                    {product.condition}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                <div className="flex items-center gap-2.5">
                  <StarRow rating={reviewStats.average} />
                  <span>
                    {reviewStats.count > 0
                      ? `${reviewStats.average.toFixed(1)} (${reviewStats.count} review${
                          reviewStats.count === 1 ? "" : "s"
                        })`
                      : "No reviews yet"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      inStock ? "bg-green" : "bg-red"
                    }`}
                  />
                  <span className={inStock ? "text-green" : "text-red"}>
                    {inStock
                      ? lowStock
                        ? `Only ${stockQty} left`
                        : "In Stock"
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              <h3 className="font-medium text-custom-1 mb-4.5">
                <span className="text-sm sm:text-base text-dark">
                  Price: {formatBDT(Number(displayPrice))}
                </span>
                {displayPrice !== product.price && (
                  <span className="line-through ml-2 text-dark-4">
                    {formatBDT(Number(product.price))}
                  </span>
                )}
              </h3>

              {(product.shortDescription || product.description) && (
                <p className="text-sm text-dark-4 mb-5 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>
              )}

              <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                {variantColors.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="min-w-[65px]">
                      <h4 className="font-medium text-dark">Color:</h4>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {variantColors.map((color) => {
                        const available = colorHasStock(color);
                        return (
                          <button
                            type="button"
                            key={color}
                            onClick={() => available && setActiveColor(color)}
                            disabled={!available}
                            title={available ? color : `${color} — out of stock`}
                            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                              activeColor === color
                                ? "border-blue"
                                : "border-transparent"
                            } ${!available ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            <span
                              className="block w-4 h-4 rounded-full ring-1 ring-gray-3"
                              style={{ backgroundColor: colorSwatch(color) }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {variantSizes.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="min-w-[65px]">
                      <h4 className="font-medium text-dark">Size:</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {variantSizes.map((s) => {
                        const available = sizeAvailableForActiveColor(s);
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() => available && setActiveSize(s)}
                            disabled={!available}
                            title={
                              available ? s : `${s} — out of stock for ${activeColor || "this product"}`
                            }
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                              activeSize === s
                                ? "border-blue bg-blue text-white"
                                : "border-gray-4 text-dark hover:border-blue"
                            } ${!available ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4.5">
                <div className="flex items-center rounded-md border border-gray-3">
                  <button
                    type="button"
                    aria-label="decrement"
                    className="flex items-center justify-center w-12 h-12 hover:text-blue disabled:opacity-50"
                    disabled={quantity <= 1}
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    −
                  </button>
                  <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="increment"
                    className="flex items-center justify-center w-12 h-12 hover:text-blue disabled:opacity-50"
                    disabled={inStock && quantity >= stockQty}
                    onClick={() =>
                      (!inStock || quantity < stockQty) &&
                      setQuantity(quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="inline-flex font-medium text-white bg-dark py-3 px-7 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inStock ? "Add to Cart" : "Out of stock"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>

                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  aria-label="add to wishlist"
                  className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-3 text-dark hover:text-white hover:bg-dark hover:border-transparent"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s-7-4.5-9.5-9.5C.7 7.5 4 4 7.5 4 9.7 4 11 5 12 6.5 13 5 14.3 4 16.5 4 20 4 23.3 7.5 21.5 11.5 19 16.5 12 21 12 21z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {TABS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`font-medium lg:text-lg hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 ${
                  activeTab === t.id
                    ? "text-blue before:w-full"
                    : "text-dark before:w-0"
                }`}
              >
                {t.title}
                {t.id === "tabThree" && reviewStats.count > 0 && (
                  <span className="ml-2 text-custom-sm text-dark-4">
                    ({reviewStats.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Description */}
          {activeTab === "tabOne" && (
            <div className="flex flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5">
              <div className="max-w-[670px] w-full">
                <h2 className="font-medium text-2xl text-dark mb-7">Description</h2>
                {(product.specifications || product.description) ? (
                  (product.specifications || product.description)
                    ?.split(/\n\n+/)
                    .map((para, i) => (
                      <p key={i} className="mb-3 text-dark-4 leading-relaxed">
                        {para}
                      </p>
                    ))
                ) : (
                  <p className="text-dark-4">No description.</p>
                )}
                {product.careInstructions && (
                  <>
                    <h3 className="font-medium text-xl text-dark mt-7 mb-4">
                      Care Instructions
                    </h3>
                    {product.careInstructions
                      .split(/\n\n+/)
                      .map((para, i) => (
                        <p key={i} className="mb-3 text-dark-4 leading-relaxed">
                          {para}
                        </p>
                      ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {activeTab === "tabTwo" && (
            <div className="mt-12.5">
              <h2 className="font-medium text-2xl text-dark mb-7">
                Additional Information
              </h2>
              <div className="bg-white rounded-xl shadow-1">
                {product.attributes &&
                Object.keys(product.attributes).length > 0 ? (
                  Object.entries(
                    product.attributes as Record<string, unknown>,
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5"
                    >
                      <div className="max-w-[450px] min-w-[140px] w-full">
                        <p className="text-sm sm:text-base text-dark capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="w-full">
                        <p className="text-sm sm:text-base text-dark">
                          {String(value)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-dark-4 px-5 py-6">No additional information.</p>
                )}
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === "tabThree" && (
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-12.5 mt-12.5">
              <div className="lg:max-w-[570px] w-full">
                <h2 className="font-medium text-2xl text-dark mb-9">
                  {reviewStats.count} Review{reviewStats.count === 1 ? "" : "s"} for this product
                </h2>

                {!reviewsLoaded ? (
                  <p className="text-dark-4">Loading reviews…</p>
                ) : reviews.length === 0 ? (
                  <p className="text-dark-4">
                    No reviews yet. Be the first to write one.
                  </p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {reviews.map((r) => {
                      const display =
                        [r.user.firstName, r.user.lastName]
                          .filter(Boolean)
                          .join(" ") || r.user.email.split("@")[0];
                      return (
                        <div
                          key={r.id}
                          className="rounded-xl bg-white shadow-1 p-4 sm:p-6"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="font-medium text-dark">
                                {display}
                                {r.verifiedPurchase && (
                                  <span className="ml-2 inline-flex text-custom-xs text-green bg-green-light-6 px-2 py-0.5 rounded">
                                    Verified
                                  </span>
                                )}
                              </h3>
                              <p className="text-custom-xs text-dark-4">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <StarRow rating={r.rating} />
                          </div>
                          {r.title && (
                            <p className="text-dark mt-4 font-medium">
                              {r.title}
                            </p>
                          )}
                          {r.body && (
                            <p className="text-dark-4 mt-2 leading-relaxed">
                              {r.body}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="max-w-[550px] w-full">
                <form onSubmit={handleReviewSubmit}>
                  <h2 className="font-medium text-2xl text-dark mb-3.5">
                    Add a Review
                  </h2>
                  <p className="mb-6 text-dark-4">
                    Share your experience with this product. Required fields are
                    marked *.
                  </p>

                  {!user && (
                    <div className="mb-5 rounded-lg border border-blue/30 bg-blue/5 px-4 py-3 text-sm text-dark">
                      You must be{" "}
                      <Link
                        href={`/signin?next=${encodeURIComponent(
                          `/shop-details/${product.slug ?? ""}`,
                        )}`}
                        className="text-blue underline"
                      >
                        signed in
                      </Link>{" "}
                      to post a review.
                    </div>
                  )}

                  {reviewError && (
                    <div className="mb-5 rounded-lg border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
                      {reviewError}
                    </div>
                  )}
                  {reviewOk && (
                    <div className="mb-5 rounded-lg border border-green/30 bg-green-light-6 px-4 py-3 text-sm text-green">
                      {reviewOk}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-7.5">
                    <span>Your Rating*</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setReviewRating(n)}
                          aria-label={`Rate ${n} stars`}
                          className="p-0.5"
                        >
                          <Star filled={n <= reviewRating} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                    <div className="mb-5">
                      <label htmlFor="review-title" className="block mb-2.5">
                        Title (optional)
                      </label>
                      <input
                        type="text"
                        id="review-title"
                        maxLength={120}
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="A short headline"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <div className="mb-5">
                      <label htmlFor="comments" className="block mb-2.5">
                        Comments
                      </label>
                      <textarea
                        id="comments"
                        rows={5}
                        maxLength={2000}
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Your comments"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                      <span className="flex items-center justify-between mt-2.5 text-custom-sm text-dark-4">
                        <span>Maximum 2000</span>
                        <span>{reviewBody.length}/2000</span>
                      </span>
                    </div>

                    {!user && (
                      <div className="mb-5">
                        <label htmlFor="rev-name" className="block mb-2.5">
                          Name
                        </label>
                        <input
                          type="text"
                          id="rev-name"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="Your name"
                          disabled
                          className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? "Posting…" : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      <RecentlyViewdItems />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
