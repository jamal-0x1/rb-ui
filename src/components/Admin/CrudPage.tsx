"use client";

import { useEffect, useState } from "react";
import type { Resource } from "@/lib/admin/resources";
import { api } from "@/lib/admin/api";

type Row = Record<string, any>;

export function CrudPage({ resource }: { resource: Resource }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);

  const listFields = resource.fields.filter((f) => !f.hideInList);
  const formFields = resource.fields.filter((f) => !f.hideInForm);

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

  useEffect(() => {
    load();
  }, [resource.slug]);

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
        try {
          data[f.key] = JSON.parse(String(v));
        } catch {
          /* ignore */
        }
      } else data[f.key] = v;
    });

    try {
      if (editing?.id) {
        await api(`${resource.apiPath}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        await api(resource.apiPath, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this row?")) return;
    try {
      await api(`${resource.apiPath}/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const renderCell = (row: Row, key: string) => {
    const v = row[key];
    if (v === null || v === undefined) return <span className="text-slate-400">—</span>;
    if (typeof v === "boolean") return v ? "✓" : "—";
    if (typeof v === "object") return <code className="text-xs">{JSON.stringify(v)}</code>;
    const s = String(v);
    return s.length > 40 ? s.slice(0, 40) + "…" : s;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{resource.label}</h1>
          <p className="text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? "record" : "records"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 text-sm rounded border border-slate-300 bg-white hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            + New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {listFields.map((f) => (
                  <th
                    key={f.key}
                    className="text-left px-4 py-2 font-medium text-slate-600 whitespace-nowrap"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id ?? JSON.stringify(row)}
                  className="border-b last:border-0 border-slate-100 hover:bg-slate-50"
                >
                  {listFields.map((f) => (
                    <td key={f.key} className="px-4 py-2 whitespace-nowrap text-slate-700">
                      {renderCell(row, f.key)}
                    </td>
                  ))}
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setEditing(row);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => row.id && handleDelete(row.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={listFields.length + 1}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit" : "New"} {resource.label}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {formFields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {f.label}
                  </label>
                  {f.type === "boolean" ? (
                    <input
                      name={f.key}
                      type="checkbox"
                      defaultChecked={!!editing?.[f.key]}
                      className="h-4 w-4"
                    />
                  ) : (
                    <input
                      name={f.key}
                      type={f.type === "number" ? "number" : "text"}
                      step={f.type === "number" ? "any" : undefined}
                      defaultValue={editing?.[f.key] ?? ""}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 text-sm rounded border border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
