"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Package } from "lucide-react";

import { getResource, type ResourceField } from "@/lib/admin/resources";
import { api } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ProductImageManager } from "@/components/Admin/ProductImageManager";
import { CategoryImageManager } from "@/components/Admin/CategoryImageManager";

type Row = Record<string, any>;

const ORDER_STATUS_VARIANT: Record<
  string,
  "success" | "secondary" | "destructive" | "default"
> = {
  paid: "success",
  shipped: "success",
  delivered: "success",
  pending: "secondary",
  cancelled: "destructive",
  refunded: "destructive",
};

function fmt(_currency: string, amount: string | number) {
  const n = Number(amount);
  const safe = isNaN(n) ? 0 : n;
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return `৳${num}`;
}

function formatValue(
  v: unknown,
  field?: ResourceField,
  relations?: Record<string, Record<string, string>>,
) {
  if (v === null || v === undefined)
    return <span className="text-muted-foreground">—</span>;
  if (field?.relation && relations) {
    const label = relations[field.relation.resource]?.[String(v)];
    if (label) return <span>{label}</span>;
    return <code className="text-xs font-mono text-muted-foreground">{String(v).slice(0, 8)}…</code>;
  }
  if (typeof v === "boolean")
    return (
      <Badge variant={v ? "success" : "secondary"}>{v ? "Yes" : "No"}</Badge>
    );
  if (typeof v === "object")
    return (
      <code className="text-xs font-mono break-all whitespace-pre-wrap">
        {JSON.stringify(v, null, 2)}
      </code>
    );
  return <span className="break-all">{String(v)}</span>;
}

export default function ResourceViewPage() {
  const params = useParams<{ resource: string; id: string }>();
  const router = useRouter();
  const resource = getResource(params.resource);
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relations, setRelations] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (!resource) return;
    setLoading(true);
    api<Row>(`${resource.apiPath}/${params.id}`)
      .then((data) => setRow(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id, resource?.apiPath]);

  useEffect(() => {
    if (!resource) return;
    const relFields = resource.fields.filter((f) => f.relation);
    if (relFields.length === 0) return;
    const slugs = Array.from(new Set(relFields.map((f) => f.relation!.resource)));
    Promise.all(
      slugs.map(async (slug) => {
        const r = getResource(slug);
        if (!r) return [slug, {}] as const;
        try {
          const list = await api<Row[]>(r.apiPath);
          const labelField = relFields.find((f) => f.relation!.resource === slug)!.relation!.labelField;
          const map: Record<string, string> = {};
          list.forEach((row) => { if (row.id) map[row.id] = String(row[labelField] ?? row.id); });
          return [slug, map] as const;
        } catch {
          return [slug, {}] as const;
        }
      }),
    ).then((entries) => setRelations(Object.fromEntries(entries)));
  }, [resource?.slug]);

  if (!resource) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Unknown resource &quot;{params.resource}&quot;.
        </p>
      </div>
    );
  }

  const isOrder = resource.slug === "orders";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/${resource.slug}`)}
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              <Link
                href={`/admin/${resource.slug}`}
                className="hover:underline"
              >
                {resource.label}
              </Link>
              {" / "}
              {isOrder && row?.orderNumber ? row.orderNumber : params.id}
            </p>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {isOrder
                ? row?.orderNumber ?? "Order"
                : `View ${resource.label}`}
              {isOrder && row?.status && (
                <Badge variant={ORDER_STATUS_VARIANT[row.status] ?? "secondary"}>
                  {row.status}
                </Badge>
              )}
            </h1>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() =>
            router.push(`/admin/${resource.slug}/${params.id}/edit`)
          }
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : row ? (
        isOrder ? (
          <OrderView row={row} />
        ) : (
          (() => {
            const hasImages =
              resource.slug === "products" || resource.slug === "categories";
            const fieldsCard = (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {resource.fields.map((f) => (
                        <TableRow key={f.key}>
                          <TableCell className="w-[200px] font-medium text-muted-foreground">
                            {f.label}
                          </TableCell>
                          <TableCell>
                            {formatValue(row[f.key], f, relations)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
            if (!hasImages) return fieldsCard;
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">{fieldsCard}</div>
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-6">
                    {resource.slug === "products" && (
                      <ProductImageManager productId={params.id} />
                    )}
                    {resource.slug === "categories" && (
                      <CategoryImageManager categoryId={params.id} />
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        )
      ) : (
        <p className="text-muted-foreground text-sm">Record not found.</p>
      )}
    </div>
  );
}

function OrderView({ row }: { row: Row }) {
  const items: any[] = row.items ?? [];
  const payments: any[] = row.payments ?? [];
  const shipments: any[] = row.shipments ?? [];
  const currency = row.currency ?? "BDT";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="size-4" />
              Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => {
                  const img = it.variant?.product?.images?.[0]?.url;
                  const productHref = it.variant?.product?.id
                    ? `/admin/products/${it.variant.product.id}`
                    : null;
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
                        {it.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(currency, it.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {fmt(currency, it.lineTotal)}
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
                <span>{fmt(currency, row.subtotal)}</span>
              </div>
              {Number(row.discountAmount) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    Discount{row.coupon ? ` (${row.coupon.code})` : ""}
                  </span>
                  <span>-{fmt(currency, row.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{fmt(currency, row.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{fmt(currency, row.shippingAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{fmt(currency, row.grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">None</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between items-center"
                    >
                      <span className="capitalize">
                        {p.method === "cod" ? "Cash on delivery" : p.method}
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge
                          variant={
                            p.status === "collected" ? "success" : "secondary"
                          }
                        >
                          {p.status}
                        </Badge>
                        <span className="font-medium">
                          {fmt(currency, p.amount)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {shipments.length === 0 ? (
                <p className="text-sm text-muted-foreground">None</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {shipments.map((s) => (
                    <li key={s.id}>
                      <div className="flex justify-between items-center">
                        <span>{s.carrier ?? "—"}</span>
                        <Badge
                          variant={
                            s.status === "delivered" || s.status === "shipped"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {s.status}
                        </Badge>
                      </div>
                      {s.trackingNumber && (
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          {s.trackingNumber}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {row.user ? (
              <>
                <Link
                  href={`/admin/users/${row.user.id}`}
                  className="font-medium hover:underline"
                >
                  {[row.user.firstName, row.user.lastName]
                    .filter(Boolean)
                    .join(" ") || row.user.email}
                </Link>
                <p className="text-muted-foreground">{row.user.email}</p>
              </>
            ) : (
              <p className="text-muted-foreground">No user</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ship to</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-0.5">
            {row.shippingAddress ? (
              <>
                <p>{row.shippingAddress.line1}</p>
                {row.shippingAddress.line2 && <p>{row.shippingAddress.line2}</p>}
                <p>
                  {row.shippingAddress.city}
                  {row.shippingAddress.state
                    ? `, ${row.shippingAddress.state}`
                    : ""}{" "}
                  {row.shippingAddress.postalCode}
                </p>
                <p>{row.shippingAddress.country}</p>
              </>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-muted-foreground">
              Placed{" "}
              <span className="text-foreground">
                {row.placedAt ? new Date(row.placedAt).toLocaleString() : "—"}
              </span>
            </p>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {row.id}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
