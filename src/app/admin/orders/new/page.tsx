"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Minus, Package, Plus, Trash2, User } from "lucide-react";

import { api } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCombobox } from "@/components/Admin/ProductCombobox";

const SAARC_COUNTRIES = [
  "Bangladesh",
  "India",
  "Pakistan",
  "Sri Lanka",
  "Nepal",
  "Bhutan",
  "Maldives",
  "Afghanistan",
];

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const SHIPPING_METHODS: Array<{
  value: "free" | "standard" | "express";
  label: string;
  rate: number;
}> = [
  { value: "free", label: "Free", rate: 0 },
  { value: "standard", label: "Standard", rate: 60 },
  { value: "express", label: "Express", rate: 150 },
];

const fmtBdt = (v: number) =>
  `৳${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(v) ? v : 0)}`;

type ServerInventory = { quantityOnHand: number } | null | undefined;
type ServerVariant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceOverride: string | null;
  inventory?: ServerInventory;
};
type ProductLite = {
  id: string;
  name: string;
  basePrice: string;
  brand?: string | null;
  variants?: ServerVariant[];
};
type UserLite = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};
type AddressLite = {
  id: string;
  userId: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
};

type DraftLine = {
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  stock: number;
};

export default function NewOrderPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserLite[] | null>(null);
  const [products, setProducts] = useState<ProductLite[] | null>(null);
  const [addresses, setAddresses] = useState<AddressLite[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("pending");
  const [shippingMethod, setShippingMethod] =
    useState<(typeof SHIPPING_METHODS)[number]["value"]>("standard");
  const [notes, setNotes] = useState("");

  const [shipping, setShipping] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
  });

  const [pickProductId, setPickProductId] = useState("");
  const [pickVariantId, setPickVariantId] = useState("");
  const [pickQty, setPickQty] = useState(1);
  const [lines, setLines] = useState<DraftLine[]>([]);

  useEffect(() => {
    Promise.all([
      api<UserLite[]>("/users"),
      api<ProductLite[]>("/products?limit=500"),
    ])
      .then(([u, p]) => {
        setUsers(u);
        setProducts(p);
      })
      .catch((e) => toast.error(e.message ?? "Failed to load references"))
      .finally(() => setLoadingRefs(false));
  }, []);

  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      return;
    }
    api<AddressLite[]>(`/addresses?userId=${userId}`)
      .catch(() => api<AddressLite[]>("/addresses"))
      .then((all) => {
        const mine = (all ?? []).filter((a) => a.userId === userId);
        setAddresses(mine);
        const def =
          mine.find((a) => a.isDefaultShipping) ?? mine[0];
        if (def) {
          setShipping({
            line1: def.line1,
            line2: def.line2 ?? "",
            city: def.city,
            state: def.state ?? "",
            postalCode: def.postalCode,
            country: def.country,
          });
        }
      })
      .catch(() => {/* tolerate */});
  }, [userId]);

  const pickProduct = products?.find((p) => p.id === pickProductId);
  const pickVariant = pickProduct?.variants?.find((v) => v.id === pickVariantId);
  const pickStock = pickVariant?.inventory?.quantityOnHand ?? 0;

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const shippingRate =
    SHIPPING_METHODS.find((m) => m.value === shippingMethod)?.rate ?? 0;
  const grandTotal = Math.max(0, subtotal + shippingRate);

  const addLine = () => {
    if (!pickProduct || !pickVariant) return;
    if (pickQty < 1 || pickQty > pickStock) {
      toast.error(`Enter a quantity between 1 and ${pickStock}`);
      return;
    }
    const unitPrice = Number(
      pickVariant.priceOverride ?? pickProduct.basePrice,
    );
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.variantId === pickVariant.id);
      if (idx >= 0) {
        const next = [...prev];
        const newQty = next[idx].quantity + pickQty;
        if (newQty > pickStock) {
          toast.error(`Only ${pickStock} in stock`);
          return prev;
        }
        next[idx] = { ...next[idx], quantity: newQty };
        return next;
      }
      const variantLabel = [pickVariant.sku, pickVariant.color, pickVariant.size]
        .filter(Boolean)
        .join(" · ");
      return [
        ...prev,
        {
          variantId: pickVariant.id,
          productId: pickProduct.id,
          productName: pickProduct.name,
          variantLabel,
          unitPrice,
          quantity: pickQty,
          stock: pickStock,
        },
      ];
    });
    setPickProductId("");
    setPickVariantId("");
    setPickQty(1);
  };

  const setLineQty = (variantId: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.variantId === variantId
          ? { ...l, quantity: Math.max(1, Math.min(l.stock, qty)) }
          : l,
      ),
    );
  };

  const removeLine = (variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Pick a customer");
      return;
    }
    if (lines.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    if (!shipping.line1 || !shipping.city || !shipping.postalCode) {
      toast.error("Shipping address required (line 1, city, postal code)");
      return;
    }

    setSaving(true);
    try {
      const order = await api<{ id: string; orderNumber: string }>(
        "/orders/admin",
        {
          method: "POST",
          body: JSON.stringify({
            userId,
            items: lines.map((l) => ({
              variantId: l.variantId,
              quantity: l.quantity,
            })),
            shipping: {
              line1: shipping.line1,
              line2: shipping.line2 || undefined,
              city: shipping.city,
              state: shipping.state || undefined,
              postalCode: shipping.postalCode,
              country: shipping.country,
            },
            shippingMethod,
            paymentMethod: "cod",
            status,
            notes: notes || undefined,
          }),
        },
      );
      toast.success(`Order ${order.orderNumber} created`);
      router.push(`/admin/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Create failed");
    } finally {
      setSaving(false);
    }
  };

  if (loadingRefs) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/orders")}
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            <Link href="/admin/orders" className="hover:underline">
              Orders
            </Link>
            {" / new"}
          </p>
          <h1 className="text-xl font-semibold">New order</h1>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4" /> Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <Label htmlFor="ord-user">Customer</Label>
                  <select
                    id="ord-user"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">— Select customer —</option>
                    {(users ?? []).map((u) => {
                      const name = [u.firstName, u.lastName]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <option key={u.id} value={u.id}>
                          {name ? `${name} (${u.email})` : u.email}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="size-4" /> Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ord-product">Product</Label>
                  <ProductCombobox
                    id="ord-product"
                    products={products}
                    value={pickProductId}
                    onChange={(id) => {
                      setPickProductId(id);
                      setPickVariantId("");
                    }}
                  />
                </div>

                {pickProduct && (pickProduct.variants?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="ord-variant">Variant</Label>
                      <select
                        id="ord-variant"
                        value={pickVariantId}
                        onChange={(e) => setPickVariantId(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">— Select variant —</option>
                        {pickProduct.variants!.map((v) => {
                          const stock = v.inventory?.quantityOnHand ?? 0;
                          const label = [v.sku, v.color, v.size]
                            .filter(Boolean)
                            .join(" · ");
                          return (
                            <option
                              key={v.id}
                              value={v.id}
                              disabled={stock <= 0}
                            >
                              {label} — stock: {stock}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ord-qty">Quantity (max {pickStock})</Label>
                      <Input
                        id="ord-qty"
                        type="number"
                        min={1}
                        max={pickStock || 1}
                        value={pickQty}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n) && n >= 1) setPickQty(n);
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!pickVariantId || pickQty < 1 || pickQty > pickStock}
                    onClick={addLine}
                  >
                    <Plus className="size-3.5" /> Add to order
                  </Button>
                </div>

                <Separator />

                {lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No items yet. Pick a product above to start the order.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lines.map((l) => (
                      <div
                        key={l.variantId}
                        className="flex items-center gap-3 rounded-md border p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{l.productName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {l.variantLabel}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="size-7"
                            disabled={l.quantity <= 1}
                            onClick={() => setLineQty(l.variantId, l.quantity - 1)}
                            aria-label="Decrease"
                          >
                            <Minus className="size-3" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            max={l.stock}
                            value={l.quantity}
                            onChange={(e) => {
                              const n = Number(e.target.value);
                              if (Number.isFinite(n) && n >= 1)
                                setLineQty(l.variantId, n);
                            }}
                            className="h-7 w-14 text-center"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="size-7"
                            disabled={l.quantity >= l.stock}
                            onClick={() => setLineQty(l.variantId, l.quantity + 1)}
                            aria-label="Increase"
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <div className="text-right text-sm w-28">
                          <p className="font-medium">
                            {fmtBdt(l.unitPrice * l.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fmtBdt(l.unitPrice)} ea
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => removeLine(l.variantId)}
                          aria-label="Remove"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipping address</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="ship-line1">Address line 1</Label>
                  <Input
                    id="ship-line1"
                    value={shipping.line1}
                    onChange={(e) =>
                      setShipping({ ...shipping, line1: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="ship-line2">Address line 2 (optional)</Label>
                  <Input
                    id="ship-line2"
                    value={shipping.line2}
                    onChange={(e) =>
                      setShipping({ ...shipping, line2: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ship-city">City</Label>
                  <Input
                    id="ship-city"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ship-state">State / division</Label>
                  <Input
                    id="ship-state"
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping({ ...shipping, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ship-postal">Postal code</Label>
                  <Input
                    id="ship-postal"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping({ ...shipping, postalCode: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ship-country">Country</Label>
                  <select
                    id="ship-country"
                    value={shipping.country}
                    onChange={(e) =>
                      setShipping({ ...shipping, country: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {SAARC_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ord-status">Status</Label>
                  <select
                    id="ord-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ord-shipping">Shipping method</Label>
                  <select
                    id="ord-shipping"
                    value={shippingMethod}
                    onChange={(e) =>
                      setShippingMethod(
                        e.target.value as (typeof SHIPPING_METHODS)[number]["value"],
                      )
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {SHIPPING_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} — {fmtBdt(m.rate)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ord-notes">Notes (optional)</Label>
                  <textarea
                    id="ord-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment captured as Cash on delivery (BDT). Order number is
                  auto-generated with <code>INV-</code> prefix on save.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Totals</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{fmtBdt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{fmtBdt(shippingRate)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{fmtBdt(grandTotal)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/orders")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
