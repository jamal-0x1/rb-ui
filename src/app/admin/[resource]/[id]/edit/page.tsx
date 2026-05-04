"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { getResource } from "@/lib/admin/resources";
import { api } from "@/lib/admin/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductImageManager } from "@/components/Admin/ProductImageManager";
import { CategoryImageManager } from "@/components/Admin/CategoryImageManager";
import { AttributesEditor } from "@/components/Admin/AttributesEditor";
import { VariantMatrixManager } from "@/components/Admin/VariantMatrixManager";
import { OrderItemsManager } from "@/components/Admin/OrderItemsManager";

type Row = Record<string, any>;

export default function ResourceEditPage() {
  const params = useParams<{ resource: string; id: string }>();
  const router = useRouter();
  const resource = getResource(params.resource);
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    const relFields = resource.fields.filter((f) => f.relation && !f.hideInForm);
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

  const formFields = resource.fields.filter((f) => !f.hideInForm);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const data: Row = {};
    formFields.forEach((f) => {
      const v = form.get(f.key);
      if (v === null || v === "") return;
      if (f.type === "boolean") data[f.key] = v === "on";
      else if (f.type === "number") data[f.key] = Number(v);
      else if (f.type === "json" || f.type === "keyvalue") {
        try { data[f.key] = JSON.parse(String(v)); } catch { /* skip invalid */ }
      } else data[f.key] = v;
    });

    try {
      await api(`${resource.apiPath}/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      toast.success("Record updated.");
      router.push(`/admin/${resource.slug}`);
    } catch (err: any) {
      toast.error(err.message ?? "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/${resource.slug}/${params.id}`)}
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
            <Link
              href={`/admin/${resource.slug}/${params.id}`}
              className="hover:underline"
            >
              {params.id}
            </Link>
            {" / edit"}
          </p>
          <h1 className="text-xl font-semibold">Edit {resource.label}</h1>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div
        className={
          resource.slug === "products" || resource.slug === "categories"
            ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
            : ""
        }
      >
      <Card
        className={
          resource.slug === "products" || resource.slug === "categories"
            ? "lg:col-span-2"
            : ""
        }
      >
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : row ? (
            <form onSubmit={submit} className="space-y-5">
              {formFields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.type === "boolean" ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={f.key}
                        name={f.key}
                        defaultChecked={!!row[f.key]}
                      />
                      <Label
                        htmlFor={f.key}
                        className="text-muted-foreground font-normal"
                      >
                        Enabled
                      </Label>
                    </div>
                  ) : f.relation ? (
                    <select
                      id={f.key}
                      name={f.key}
                      defaultValue={row[f.key] ?? ""}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">— Select —</option>
                      {Object.entries(relations[f.relation.resource] ?? {}).map(
                        ([id, label]) => (
                          <option key={id} value={id}>{label}</option>
                        ),
                      )}
                    </select>
                  ) : f.options ? (
                    <select
                      id={f.key}
                      name={f.key}
                      defaultValue={row[f.key] ?? ""}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                    >
                      <option value="">— Select —</option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      id={f.key}
                      name={f.key}
                      rows={5}
                      defaultValue={row[f.key] ?? ""}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  ) : f.type === "keyvalue" ? (
                    <AttributesEditor name={f.key} defaultValue={row[f.key]} />
                  ) : f.type === "json" ? (
                    <textarea
                      id={f.key}
                      name={f.key}
                      rows={6}
                      placeholder='{"Brand":"Apple","Model":"iPhone 14 Plus"}'
                      defaultValue={
                        row[f.key]
                          ? typeof row[f.key] === "string"
                            ? row[f.key]
                            : JSON.stringify(row[f.key], null, 2)
                          : ""
                      }
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  ) : (
                    <Input
                      id={f.key}
                      name={f.key}
                      type={f.type === "number" ? "number" : "text"}
                      step={f.type === "number" ? "any" : undefined}
                      defaultValue={row[f.key] ?? ""}
                    />
                  )}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(`/admin/${resource.slug}/${params.id}`)
                  }
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-muted-foreground text-sm">Record not found.</p>
          )}
        </CardContent>
      </Card>

      {(resource.slug === "products" || resource.slug === "categories") && row ? (
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            {resource.slug === "products" && (
              <ProductImageManager productId={params.id} />
            )}
            {resource.slug === "categories" && (
              <CategoryImageManager categoryId={params.id} />
            )}
          </div>
        </div>
      ) : null}
      </div>

      {resource.slug === "products" && row ? (
        <VariantMatrixManager productId={params.id} />
      ) : null}

      {resource.slug === "orders" && row ? (
        <OrderItemsManager orderId={params.id} />
      ) : null}
    </div>
  );
}
