"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, Minus, Package, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ProductCombobox } from "@/components/Admin/ProductCombobox";

const TERMINAL = new Set(["delivered", "cancelled", "refunded"]);

type ServerInventory = { quantityOnHand: number } | null | undefined;

type ServerImage = { url: string };

type ServerVariant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceOverride: string | null;
  inventory?: ServerInventory;
  product?: {
    id: string;
    name: string;
    basePrice: string;
    images?: ServerImage[];
  };
};

type ServerOrderItem = {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  productNameSnapshot: string;
  variantSkuSnapshot: string;
  variant?: ServerVariant | null;
};

type ServerOrder = {
  id: string;
  status: string;
  currency: string;
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  discountAmount: string;
  grandTotal: string;
  items: ServerOrderItem[];
};

type ProductLite = {
  id: string;
  name: string;
  basePrice: string;
  brand?: string | null;
  images?: ServerImage[];
  variants?: ServerVariant[];
};

const fmtBdt = (v: string | number) => {
  const n = Number(v);
  const safe = isNaN(n) ? 0 : n;
  return `৳${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe)}`;
};

export function OrderItemsManager({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<ServerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [adderOpen, setAdderOpen] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await api<ServerOrder>(`/orders/${orderId}`);
      setOrder(data);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const locked = order ? TERMINAL.has(order.status) : false;

  const onSetQty = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    setBusy(itemId);
    try {
      const updated = await api<ServerOrder>(
        `/orders/${orderId}/items/${itemId}`,
        { method: "PATCH", body: JSON.stringify({ quantity: qty }) },
      );
      setOrder(updated);
    } catch (err: any) {
      toast.error(err.message ?? "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const onRemove = async (itemId: string) => {
    setBusy(itemId);
    try {
      const updated = await api<ServerOrder>(
        `/orders/${orderId}/items/${itemId}`,
        { method: "DELETE" },
      );
      setOrder(updated);
      toast.success("Item removed");
    } catch (err: any) {
      toast.error(err.message ?? "Remove failed");
    } finally {
      setBusy(null);
    }
  };

  const onAdd = async (variantId: string, qty: number) => {
    setBusy("__add__");
    try {
      const updated = await api<ServerOrder>(`/orders/${orderId}/items`, {
        method: "POST",
        body: JSON.stringify({ variantId, quantity: qty }),
      });
      setOrder(updated);
      setAdderOpen(false);
      toast.success("Item added");
    } catch (err: any) {
      toast.error(err.message ?? "Add failed");
    } finally {
      setBusy(null);
    }
  };

  if (loading && !order) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="size-4" /> Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!order) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="size-4" />
          Items ({order.items.length})
          <Badge variant="secondary" className="ml-2 capitalize">
            {order.status}
          </Badge>
        </CardTitle>
        {!locked && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdderOpen((v) => !v)}
          >
            <Plus className="size-3.5" /> Add item
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {locked && (
          <div className="mx-6 mb-4 flex items-start gap-2 rounded-md border border-amber-300/40 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
            <Lock className="size-4 mt-0.5 flex-shrink-0" />
            <span>
              This order is <strong>{order.status}</strong>. Line items are
              locked. Refund or cancel a delivered order from a separate flow if
              needed.
            </span>
          </div>
        )}

        {adderOpen && !locked && (
          <div className="mx-6 mb-4">
            <ItemAdder
              currentVariantIds={new Set(order.items.map((i) => i.variantId))}
              busy={busy === "__add__"}
              onCancel={() => setAdderOpen(false)}
              onSubmit={(variantId, qty) => onAdd(variantId, qty)}
            />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Line total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((it) => {
              const img = it.variant?.product?.images?.[0]?.url;
              const productHref = it.variant?.product?.id
                ? `/admin/products/${it.variant.product.id}`
                : null;
              const stock = it.variant?.inventory?.quantityOnHand ?? 0;
              const itemBusy = busy === it.id;
              return (
                <TableRow key={it.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-muted-foreground">
                            <Package className="size-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        {productHref ? (
                          <Link
                            href={productHref}
                            className="font-medium hover:underline block truncate"
                          >
                            {it.productNameSnapshot}
                          </Link>
                        ) : (
                          <span className="font-medium">
                            {it.productNameSnapshot}
                          </span>
                        )}
                        {(it.variant?.size || it.variant?.color) && (
                          <p className="text-xs text-muted-foreground">
                            {[it.variant?.size, it.variant?.color]
                              .filter(Boolean)
                              .join(" / ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {it.variantSkuSnapshot}
                  </TableCell>
                  <TableCell className="text-right">
                    {locked ? (
                      <span>{it.quantity}</span>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          disabled={itemBusy || it.quantity <= 1}
                          onClick={() => onSetQty(it.id, it.quantity - 1)}
                          aria-label="Decrease"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (Number.isFinite(n) && n >= 1) {
                              onSetQty(it.id, n);
                            }
                          }}
                          className="h-7 w-14 text-center"
                          disabled={itemBusy}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          disabled={itemBusy || stock <= 0}
                          onClick={() => onSetQty(it.id, it.quantity + 1)}
                          aria-label="Increase"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {fmtBdt(it.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {fmtBdt(it.lineTotal)}
                  </TableCell>
                  <TableCell>
                    {!locked && order.items.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        disabled={itemBusy}
                        onClick={() => onRemove(it.id)}
                        aria-label="Remove"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Separator />

        <div className="p-4 space-y-2 text-sm max-w-sm ml-auto">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{fmtBdt(order.subtotal)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span>
              <span>-{fmtBdt(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{fmtBdt(order.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{fmtBdt(order.shippingAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{fmtBdt(order.grandTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ItemAdder({
  currentVariantIds,
  busy,
  onSubmit,
  onCancel,
}: {
  currentVariantIds: Set<string>;
  busy: boolean;
  onSubmit: (variantId: string, qty: number) => void;
  onCancel: () => void;
}) {
  const [products, setProducts] = useState<ProductLite[] | null>(null);
  const [productId, setProductId] = useState<string>("");
  const [variantId, setVariantId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    api<ProductLite[]>("/products?limit=500")
      .then((list) => setProducts(list))
      .catch((e) => toast.error(e.message ?? "Failed to load products"));
  }, []);

  const selectedProduct = products?.find((p) => p.id === productId);
  const selectedVariant = selectedProduct?.variants?.find(
    (v) => v.id === variantId,
  );
  const stock = selectedVariant?.inventory?.quantityOnHand ?? 0;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ord-add-product">Product</Label>
          <ProductCombobox
            id="ord-add-product"
            products={products}
            value={productId}
            onChange={(id) => {
              setProductId(id);
              setVariantId("");
            }}
          />
        </div>

        {selectedProduct && (selectedProduct.variants?.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="ord-add-variant">Variant</Label>
              <select
                id="ord-add-variant"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— Select variant —</option>
                {selectedProduct.variants!.map((v) => {
                  const onHand = v.inventory?.quantityOnHand ?? 0;
                  const label = [v.sku, v.color, v.size]
                    .filter(Boolean)
                    .join(" · ");
                  const dup = currentVariantIds.has(v.id) ? " (already on order — adds qty)" : "";
                  return (
                    <option key={v.id} value={v.id} disabled={onHand <= 0}>
                      {label} — stock: {onHand}
                      {dup}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ord-add-qty">
                Quantity (max {stock})
              </Label>
              <Input
                id="ord-add-qty"
                type="number"
                min={1}
                max={stock || 1}
                value={qty}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n >= 1) setQty(n);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!variantId || busy || qty < 1 || qty > stock}
            onClick={() => onSubmit(variantId, qty)}
          >
            {busy ? "Adding…" : "Add to order"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
