"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Star, Trash2, Upload } from "lucide-react";
import { api, API_URL, getToken } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ProductImage = {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

type VariantOption = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
};

const apiOrigin = API_URL.replace(/\/api\/?$/, "");

function resolveUrl(url: string) {
  return url.startsWith("http") ? url : `${apiOrigin}${url}`;
}

export function ProductImageManager({ productId }: { productId: string }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    try {
      const [allImgs, vrnts] = await Promise.all([
        api<ProductImage[]>("/product-images"),
        api<VariantOption[]>(`/product-variants?productId=${productId}`),
      ]);
      setImages(
        allImgs
          .filter((i) => i.productId === productId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setVariants(vrnts);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load images.");
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  const handleAssignVariant = async (id: string, variantId: string | null) => {
    try {
      await api(`/product-images/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ variantId }),
      });
      setImages((prev) =>
        prev.map((i) => (i.id === id ? { ...i, variantId } : i)),
      );
    } catch (e: any) {
      toast.error(e.message ?? "Failed to assign variant.");
    }
  };

  const variantLabel = (v: VariantOption) =>
    [v.color, v.size].filter(Boolean).join(" / ") || v.sku;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const token = getToken();
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(
          `${API_URL}/product-images/upload/${productId}`,
          {
            method: "POST",
            body: fd,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Upload failed");
        }
      }
      toast.success(`Uploaded ${files.length} image${files.length > 1 ? "s" : ""}.`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/product-images/${id}`, { method: "DELETE" });
      toast.success("Image removed.");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed.");
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await Promise.all(
        images
          .filter((i) => i.isPrimary && i.id !== id)
          .map((i) =>
            api(`/product-images/${i.id}`, {
              method: "PATCH",
              body: JSON.stringify({ isPrimary: false }),
            }),
          ),
      );
      await api(`/product-images/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPrimary: true }),
      });
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to set primary.");
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Images</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5 mr-1.5" strokeWidth={1.75} />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group rounded-md overflow-hidden border bg-muted"
              >
                <div className="relative aspect-square">
                  <img
                    src={resolveUrl(img.url)}
                    alt={img.altText ?? ""}
                    className="absolute inset-0 size-full object-cover"
                  />
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 rounded bg-foreground/80 text-background text-[10px] px-1.5 py-0.5">
                      Primary
                    </span>
                  )}
                  {img.variantId && (
                    <span className="absolute top-1.5 right-1.5 rounded bg-blue/80 text-white text-[10px] px-1.5 py-0.5">
                      {variantLabel(
                        variants.find((v) => v.id === img.variantId) ?? {
                          id: "",
                          sku: "?",
                          size: null,
                          color: null,
                        },
                      )}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 p-1.5">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        aria-label="Set primary"
                        className="inline-flex size-6 items-center justify-center rounded-md bg-white/90 text-foreground hover:bg-white"
                        onClick={() => handleSetPrimary(img.id)}
                      >
                        <Star className="size-3.5" strokeWidth={1.75} />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Delete"
                      className="inline-flex size-6 items-center justify-center rounded-md bg-white/90 text-destructive hover:bg-white"
                      onClick={() => handleDelete(img.id)}
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
                {variants.length > 0 && (
                  <select
                    value={img.variantId ?? ""}
                    onChange={(e) =>
                      handleAssignVariant(img.id, e.target.value || null)
                    }
                    className="w-full text-xs px-2 py-1 border-t bg-white"
                    aria-label="Assign image to variant"
                  >
                    <option value="">All variants</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {variantLabel(v)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
