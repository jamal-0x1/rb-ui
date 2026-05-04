"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { getResource } from "@/lib/admin/resources";
import { api } from "@/lib/admin/api";
import { AttributesEditor } from "@/components/Admin/AttributesEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Row = Record<string, any>;

export default function ResourceNewPage() {
  const params = useParams<{ resource: string }>();
  const router = useRouter();
  const resource = getResource(params.resource);
  const [saving, setSaving] = useState(false);
  const [relations, setRelations] = useState<Record<string, Record<string, string>>>({});

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
      await api(resource.apiPath, {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Record created.");
      router.push(`/admin/${resource.slug}`);
    } catch (err: any) {
      toast.error(err.message ?? "Create failed.");
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
            {" / new"}
          </p>
          <h1 className="text-xl font-semibold">New {resource.label}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-5 max-w-lg">
            {formFields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.type === "boolean" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox id={f.key} name={f.key} />
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
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                ) : f.type === "keyvalue" ? (
                  <AttributesEditor name={f.key} />
                ) : f.type === "json" ? (
                  <textarea
                    id={f.key}
                    name={f.key}
                    rows={6}
                    placeholder='{"Brand":"Apple","Model":"iPhone 14 Plus"}'
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                ) : (
                  <Input
                    id={f.key}
                    name={f.key}
                    type={f.type === "number" ? "number" : "text"}
                    step={f.type === "number" ? "any" : undefined}
                  />
                )}
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/${resource.slug}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
