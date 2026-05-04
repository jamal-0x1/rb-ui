"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { api, API_URL, getToken } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const apiOrigin = API_URL.replace(/\/api\/?$/, "");

function resolveUrl(url: string) {
  return url.startsWith("http") ? url : `${apiOrigin}${url}`;
}

type Category = { id: string; imageUrl: string | null };

export function CategoryImageManager({ categoryId }: { categoryId: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    try {
      const cat = await api<Category>(`/categories/${categoryId}`);
      setImageUrl(cat.imageUrl ?? null);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load category.");
    }
  };

  useEffect(() => {
    load();
  }, [categoryId]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const token = getToken();
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/categories/upload/${categoryId}`, {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error((await res.text()) || "Upload failed");
      toast.success("Image uploaded.");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = async () => {
    try {
      await api(`/categories/${categoryId}`, {
        method: "PATCH",
        body: JSON.stringify({ imageUrl: null }),
      });
      toast.success("Image cleared.");
      setImageUrl(null);
    } catch (e: any) {
      toast.error(e.message ?? "Clear failed.");
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Icon</h2>
          <div className="flex gap-2">
            {imageUrl && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClear}
              >
                <Trash2 className="size-3.5 mr-1.5" strokeWidth={1.75} />
                Clear
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-3.5 mr-1.5" strokeWidth={1.75} />
              {uploading ? "Uploading…" : imageUrl ? "Replace" : "Upload"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="flex">
          <div className="size-32 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={resolveUrl(imageUrl)}
                alt=""
                className="size-full object-contain p-2"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No icon</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
