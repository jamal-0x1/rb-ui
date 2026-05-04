"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, ExternalLink } from "lucide-react";

import type { Resource, ResourceField } from "@/lib/admin/resources";
import { getResource } from "@/lib/admin/resources";
import { api, API_URL } from "@/lib/admin/api";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

type Row = Record<string, any>;
type RelationMap = Record<string, Record<string, string>>;

function renderValue(
  v: unknown,
  field?: ResourceField,
  relations?: RelationMap,
): React.ReactNode {
  if (v === null || v === undefined)
    return <span className="text-muted-foreground">—</span>;
  if (field?.relation && relations) {
    const map = relations[field.relation.resource];
    const label = map?.[String(v)];
    if (label) return label;
    return <code className="text-xs font-mono text-muted-foreground">{String(v).slice(0, 8)}…</code>;
  }
  if (typeof v === "boolean")
    return (
      <Badge variant={v ? "success" : "secondary"}>{v ? "Yes" : "No"}</Badge>
    );
  if (typeof v === "object")
    return <code className="text-xs font-mono">{JSON.stringify(v)}</code>;
  const s = String(v);
  return s.length > 40 ? s.slice(0, 40) + "…" : s;
}

// -----------------------------------------------------------------------
// Read-only dialog (non-core view)
// -----------------------------------------------------------------------
function ViewDialog({
  resource,
  row,
  relations,
  onClose,
}: {
  resource: Resource;
  row: Row | null;
  relations: RelationMap;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!row} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View {resource.label}</DialogTitle>
        </DialogHeader>
        <dl className="space-y-3 py-2">
          {resource.fields.map((f) => (
            <div key={f.key} className="grid grid-cols-[140px_1fr] gap-2 text-sm">
              <dt className="font-medium text-muted-foreground">{f.label}</dt>
              <dd>{renderValue(row?.[f.key], f, relations)}</dd>
            </div>
          ))}
        </dl>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------------------------------------------------
// Create / Edit dialog (non-core)
// -----------------------------------------------------------------------
function EditDialog({
  resource,
  row,
  relations,
  onClose,
  onSaved,
}: {
  resource: Resource;
  row: Row | null;
  relations: RelationMap;
  onClose: () => void;
  onSaved: () => void;
}) {
  const formFields = resource.fields.filter((f) => !f.hideInForm);
  const isEdit = !!(row as Row | null)?.id && row !== null && (row as Row)._isEdit;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: Row = {};
    formFields.forEach((f) => {
      const v = form.get(f.key);
      if (v === null || v === "") return;
      if (f.type === "boolean") data[f.key] = v === "on" || v === "true";
      else if (f.type === "number") data[f.key] = Number(v);
      else if (f.type === "json") {
        try { data[f.key] = JSON.parse(String(v)); } catch { /* ignore */ }
      } else data[f.key] = v;
    });

    try {
      if (isEdit) {
        await api(`${resource.apiPath}/${(row as Row).id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        toast.success("Record updated.");
      } else {
        await api(resource.apiPath, { method: "POST", body: JSON.stringify(data) });
        toast.success("Record created.");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong.");
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "New"} {resource.label}</DialogTitle>
        </DialogHeader>
        <form id="crud-form" onSubmit={handleSubmit} className="space-y-4 py-2">
          {formFields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
              {f.type === "boolean" ? (
                <div className="flex items-center gap-2 h-8">
                  <Checkbox
                    id={`field-${f.key}`}
                    name={f.key}
                    defaultChecked={!!row?.[f.key]}
                  />
                  <Label
                    htmlFor={`field-${f.key}`}
                    className="text-muted-foreground font-normal"
                  >
                    Enabled
                  </Label>
                </div>
              ) : f.relation ? (
                <select
                  id={`field-${f.key}`}
                  name={f.key}
                  defaultValue={row?.[f.key] ?? ""}
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
                  id={`field-${f.key}`}
                  name={f.key}
                  defaultValue={row?.[f.key] ?? ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                >
                  <option value="">— Select —</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`field-${f.key}`}
                  name={f.key}
                  type={f.type === "number" ? "number" : "text"}
                  step={f.type === "number" ? "any" : undefined}
                  defaultValue={row?.[f.key] ?? ""}
                />
              )}
            </div>
          ))}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="crud-form">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------------------------------------------------
// Row actions — inline icon buttons
// -----------------------------------------------------------------------
function RowActions({
  row,
  resource,
  onView,
  onEdit,
  onDelete,
}: {
  row: Row;
  resource: Resource;
  onView: (row: Row) => void;
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
}) {
  const publicHref = resource.publicHref?.(row) ?? null;
  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        aria-label="View"
        onClick={() => onView(row)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Eye className="size-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Edit"
        onClick={() => onEdit(row)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Pencil className="size-3.5" strokeWidth={1.75} />
      </button>
      {publicHref && (
        <a
          href={publicHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open public page"
          title="Open public page"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-3.5" strokeWidth={1.75} />
        </a>
      )}
      <button
        type="button"
        aria-label="Delete"
        onClick={() => onDelete(row)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------
// Main CrudPage
// -----------------------------------------------------------------------
export function CrudPage({ resource }: { resource: Resource }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relations, setRelations] = useState<RelationMap>({});
  const [productThumbs, setProductThumbs] = useState<Record<string, string>>({});

  // dialog state (non-core only)
  const [viewRow, setViewRow] = useState<Row | null>(null);
  const [editRow, setEditRow] = useState<Row | null>(null); // includes _isEdit flag
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const listFields = resource.fields.filter((f) => !f.hideInList);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Row[]>(resource.apiPath);
      setRows(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [resource.slug]);

  // Product list: fetch all product images, build productId → primary URL map
  useEffect(() => {
    if (resource.slug !== "products") {
      setProductThumbs({});
      return;
    }
    api<Row[]>("/product-images")
      .then((images) => {
        const map: Record<string, string> = {};
        images.forEach((img) => {
          const pid = img.productId;
          if (!pid) return;
          if (img.isPrimary) {
            map[pid] = img.url;
          } else if (!map[pid]) {
            map[pid] = img.url;
          }
        });
        setProductThumbs(map);
      })
      .catch(() => undefined);
  }, [resource.slug]);

  // Resolve FK relations for display
  useEffect(() => {
    const relationFields = resource.fields.filter((f) => f.relation);
    if (relationFields.length === 0) {
      setRelations({});
      return;
    }
    const uniqueResources = Array.from(
      new Set(relationFields.map((f) => f.relation!.resource)),
    );
    Promise.all(
      uniqueResources.map(async (slug) => {
        const r = getResource(slug);
        if (!r) return [slug, {}] as const;
        try {
          const list = await api<Row[]>(r.apiPath);
          const labelField = relationFields.find(
            (f) => f.relation!.resource === slug,
          )!.relation!.labelField;
          const map: Record<string, string> = {};
          list.forEach((row) => {
            if (row.id) map[row.id] = String(row[labelField] ?? row.id);
          });
          return [slug, map] as const;
        } catch {
          return [slug, {}] as const;
        }
      }),
    ).then((entries) => {
      setRelations(Object.fromEntries(entries));
    });
  }, [resource.slug]);

  const useModalActions = !resource.coreModule;

  const handleView = (row: Row) => {
    if (useModalActions) {
      setViewRow(row);
    } else {
      router.push(`/admin/${resource.slug}/${row.id}`);
    }
  };

  const handleEdit = (row: Row) => {
    if (useModalActions) {
      setEditRow({ ...row, _isEdit: true });
    } else {
      router.push(`/admin/${resource.slug}/${row.id}/edit`);
    }
  };

  const handleNew = () => {
    if (resource.coreModule) {
      router.push(`/admin/${resource.slug}/new`);
    } else {
      setEditRow({});
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await api(`${resource.apiPath}/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Record deleted.");
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed.");
      setDeleteTarget(null);
    }
  };

  // Build column definitions from resource fields
  const columns = useMemo<ColumnDef<Row>[]>(() => {
    const fieldCols: ColumnDef<Row>[] = listFields.map((f) => ({
      accessorKey: f.key,
      header: f.label,
      cell: ({ getValue }) => renderValue(getValue(), f, relations),
      enableSorting: true,
    }));

    if (resource.slug === "products") {
      const apiOrigin = API_URL.replace(/\/api\/?$/, "");
      const thumbCol: ColumnDef<Row> = {
        id: "thumbnail",
        header: () => <span className="sr-only">Image</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const url = productThumbs[row.original.id];
          if (!url)
            return (
              <div className="size-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-[10px]">
                —
              </div>
            );
          const src = url.startsWith("http") ? url : `${apiOrigin}${url}`;
          return (
            <img
              src={src}
              alt=""
              className="size-10 rounded-md object-cover bg-muted"
            />
          );
        },
      };
      fieldCols.unshift(thumbCol);
    }

    if (resource.slug === "categories") {
      const apiOrigin = API_URL.replace(/\/api\/?$/, "");
      const thumbCol: ColumnDef<Row> = {
        id: "thumbnail",
        header: () => <span className="sr-only">Icon</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const url = row.original.imageUrl as string | undefined;
          if (!url)
            return (
              <div className="size-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-[10px]">
                —
              </div>
            );
          const src = url.startsWith("http") ? url : `${apiOrigin}${url}`;
          return (
            <img
              src={src}
              alt=""
              className="size-10 rounded-md object-contain bg-muted p-1"
            />
          );
        },
      };
      fieldCols.unshift(thumbCol);
    }

    const actionsCol: ColumnDef<Row> = {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RowActions
            row={row.original}
            resource={resource}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      ),
    };

    return [...fieldCols, actionsCol];
  }, [resource, listFields, relations, productThumbs]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{resource.label}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rows.length} {rows.length === 1 ? "record" : "records"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={load}>
            Refresh
          </Button>
          <Button size="sm" className="rounded-full" onClick={handleNew}>
            + New
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            searchPlaceholder={`Search ${resource.label.toLowerCase()}…`}
          />
        </CardContent>
      </Card>

      {/* Non-core dialogs */}
      {!resource.coreModule && (
        <>
          <ViewDialog
            resource={resource}
            row={viewRow}
            relations={relations}
            onClose={() => setViewRow(null)}
          />
          <EditDialog
            resource={resource}
            row={editRow}
            relations={relations}
            onClose={() => setEditRow(null)}
            onSaved={() => { setEditRow(null); load(); }}
          />
        </>
      )}

      {/* Delete confirmation — shared by all */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The record will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
