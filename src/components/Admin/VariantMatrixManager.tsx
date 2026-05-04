"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { api } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServerInventory = {
  id: string;
  variantId: string;
  quantityOnHand: number;
};

type ServerVariant = {
  id: string;
  productId: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceOverride: string | null;
  weightGrams: number | null;
  inventory?: ServerInventory | null;
};

type ServerProduct = {
  id: string;
  sku: string;
  variants?: ServerVariant[];
};

type Row = {
  rowKey: string;
  variantId?: string;
  inventoryId?: string;
  sku: string;
  size: string;
  color: string;
  priceOverride: string;
  weightGrams: string;
  quantityOnHand: string;
  dirty: boolean;
  saving: boolean;
  isNew: boolean;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const autoSku = (productSku: string, color: string, size: string) => {
  const parts = [productSku, color, size].filter(Boolean).map(slugify);
  return parts.join("-").toUpperCase();
};

const toRow = (v: ServerVariant): Row => ({
  rowKey: v.id,
  variantId: v.id,
  inventoryId: v.inventory?.id,
  sku: v.sku,
  size: v.size ?? "",
  color: v.color ?? "",
  priceOverride: v.priceOverride ?? "",
  weightGrams: v.weightGrams != null ? String(v.weightGrams) : "",
  quantityOnHand: v.inventory ? String(v.inventory.quantityOnHand) : "0",
  dirty: false,
  saving: false,
  isNew: false,
});

export function VariantMatrixManager({ productId }: { productId: string }) {
  const [productSku, setProductSku] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [sizesInput, setSizesInput] = useState("");
  const [colorsInput, setColorsInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const product = await api<ServerProduct>(`/products/${productId}`);
      setProductSku(product.sku);
      const fresh = (product.variants ?? []).map(toRow);
      setRows(fresh);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load variants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  const updateRow = (rowKey: string, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r) => (r.rowKey === rowKey ? { ...r, ...patch, dirty: true } : r)),
    );
  };

  const removeRow = async (rowKey: string) => {
    const row = rows.find((r) => r.rowKey === rowKey);
    if (!row) return;
    if (row.isNew && !row.variantId) {
      setRows((prev) => prev.filter((r) => r.rowKey !== rowKey));
      return;
    }
    if (!confirm(`Delete variant ${row.sku}?`)) return;
    try {
      await api(`/product-variants/${row.variantId}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.rowKey !== rowKey));
      toast.success("Variant deleted.");
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed.");
    }
  };

  const saveRow = async (rowKey: string) => {
    const row = rows.find((r) => r.rowKey === rowKey);
    if (!row) return;
    if (!row.sku.trim()) {
      toast.error("SKU required.");
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.rowKey === rowKey ? { ...r, saving: true } : r)),
    );

    const variantBody: Record<string, unknown> = {
      productId,
      sku: row.sku.trim(),
      size: row.size.trim() || null,
      color: row.color.trim() || null,
      priceOverride:
        row.priceOverride.trim() === "" ? null : Number(row.priceOverride),
      weightGrams:
        row.weightGrams.trim() === "" ? null : Number(row.weightGrams),
    };

    try {
      let variantId = row.variantId;
      if (row.isNew || !variantId) {
        const created = await api<ServerVariant>("/product-variants", {
          method: "POST",
          body: JSON.stringify(variantBody),
        });
        variantId = created.id;
      } else {
        await api(`/product-variants/${variantId}`, {
          method: "PATCH",
          body: JSON.stringify(variantBody),
        });
      }

      const qty = Number(row.quantityOnHand) || 0;
      let inventoryId = row.inventoryId;
      if (inventoryId) {
        await api(`/inventory/${inventoryId}`, {
          method: "PATCH",
          body: JSON.stringify({ quantityOnHand: qty }),
        });
      } else {
        const inv = await api<ServerInventory>("/inventory", {
          method: "POST",
          body: JSON.stringify({ variantId, quantityOnHand: qty }),
        });
        inventoryId = inv.id;
      }

      setRows((prev) =>
        prev.map((r) =>
          r.rowKey === rowKey
            ? {
                ...r,
                rowKey: variantId!,
                variantId,
                inventoryId,
                dirty: false,
                saving: false,
                isNew: false,
              }
            : r,
        ),
      );
      toast.success(`Saved ${row.sku}.`);
    } catch (e: any) {
      setRows((prev) =>
        prev.map((r) => (r.rowKey === rowKey ? { ...r, saving: false } : r)),
      );
      toast.error(e.message ?? "Save failed.");
    }
  };

  const addBlank = () => {
    const rowKey = `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setRows((prev) => [
      ...prev,
      {
        rowKey,
        sku: "",
        size: "",
        color: "",
        priceOverride: "",
        weightGrams: "",
        quantityOnHand: "0",
        dirty: true,
        saving: false,
        isNew: true,
      },
    ]);
  };

  const generateMatrix = () => {
    const sizes = sizesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = colorsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (sizes.length === 0 && colors.length === 0) {
      toast.error("Enter at least one size or color.");
      return;
    }

    const existing = new Set(
      rows.map((r) => `${r.color.toLowerCase()}|${r.size.toLowerCase()}`),
    );

    const sizeAxis = sizes.length ? sizes : [""];
    const colorAxis = colors.length ? colors : [""];
    const additions: Row[] = [];

    for (const c of colorAxis) {
      for (const s of sizeAxis) {
        const key = `${c.toLowerCase()}|${s.toLowerCase()}`;
        if (existing.has(key)) continue;
        additions.push({
          rowKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${key}`,
          sku: autoSku(productSku, c, s),
          size: s,
          color: c,
          priceOverride: "",
          weightGrams: "",
          quantityOnHand: "0",
          dirty: true,
          saving: false,
          isNew: true,
        });
      }
    }

    if (additions.length === 0) {
      toast.info("No new combinations.");
      return;
    }
    setRows((prev) => [...prev, ...additions]);
    setSizesInput("");
    setColorsInput("");
    toast.success(`Added ${additions.length} draft rows. Save to persist.`);
  };

  const dirtyCount = useMemo(
    () => rows.filter((r) => r.dirty).length,
    [rows],
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Variants</h3>
            <p className="text-xs text-muted-foreground">
              Size × Color matrix. Inline edit. Inventory per variant.
            </p>
          </div>
          {dirtyCount > 0 && (
            <span className="text-xs text-amber-600">
              {dirtyCount} unsaved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pb-4 border-b">
          <div className="space-y-1.5">
            <Label htmlFor="sizesInput">Sizes (comma)</Label>
            <Input
              id="sizesInput"
              placeholder="S, M, L, XL"
              value={sizesInput}
              onChange={(e) => setSizesInput(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="colorsInput">Colors (comma)</Label>
            <Input
              id="colorsInput"
              placeholder="Black, Navy, White"
              value={colorsInput}
              onChange={(e) => setColorsInput(e.target.value)}
            />
          </div>
          <Button type="button" onClick={generateMatrix} variant="secondary">
            Generate matrix
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading variants…</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              No variants yet.
            </p>
            <Button type="button" variant="outline" onClick={addBlank}>
              <Plus className="size-4 mr-1" /> Add variant
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-3 font-medium">Color</th>
                  <th className="py-2 pr-3 font-medium">Size</th>
                  <th className="py-2 pr-3 font-medium">SKU</th>
                  <th className="py-2 pr-3 font-medium">Price override</th>
                  <th className="py-2 pr-3 font-medium">Weight (g)</th>
                  <th className="py-2 pr-3 font-medium">On hand</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.rowKey}
                    className={`border-b last:border-0 ${r.dirty ? "bg-amber-50/40" : ""}`}
                  >
                    <td className="py-2 pr-3">
                      <Input
                        value={r.color}
                        onChange={(e) =>
                          updateRow(r.rowKey, { color: e.target.value })
                        }
                        className="h-8"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Input
                        value={r.size}
                        onChange={(e) =>
                          updateRow(r.rowKey, { size: e.target.value })
                        }
                        className="h-8"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Input
                        value={r.sku}
                        onChange={(e) =>
                          updateRow(r.rowKey, { sku: e.target.value })
                        }
                        className="h-8 font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Input
                        type="number"
                        step="any"
                        value={r.priceOverride}
                        onChange={(e) =>
                          updateRow(r.rowKey, { priceOverride: e.target.value })
                        }
                        className="h-8 w-28"
                        placeholder="—"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Input
                        type="number"
                        value={r.weightGrams}
                        onChange={(e) =>
                          updateRow(r.rowKey, { weightGrams: e.target.value })
                        }
                        className="h-8 w-24"
                        placeholder="—"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Input
                        type="number"
                        value={r.quantityOnHand}
                        onChange={(e) =>
                          updateRow(r.rowKey, {
                            quantityOnHand: e.target.value,
                          })
                        }
                        className="h-8 w-20"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant={r.dirty ? "default" : "outline"}
                          disabled={r.saving || !r.dirty}
                          onClick={() => saveRow(r.rowKey)}
                          aria-label="Save row"
                        >
                          <Save className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeRow(r.rowKey)}
                          aria-label="Delete row"
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={addBlank}>
                <Plus className="size-4 mr-1" /> Add variant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
