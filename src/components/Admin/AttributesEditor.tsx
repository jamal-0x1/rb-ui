"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = { key: string; value: string };

export function AttributesEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: unknown;
}) {
  const initial: Row[] = (() => {
    if (!defaultValue) return [];
    let parsed: unknown = defaultValue;
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { return []; }
    }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed as Record<string, unknown>).map(
        ([key, value]) => ({ key, value: value == null ? "" : String(value) }),
      );
    }
    return [];
  })();

  const [rows, setRows] = useState<Row[]>(initial.length > 0 ? initial : []);
  const [serialized, setSerialized] = useState<string>("");

  useEffect(() => {
    const obj: Record<string, string> = {};
    rows.forEach((r) => {
      const k = r.key.trim();
      if (k) obj[k] = r.value;
    });
    setSerialized(Object.keys(obj).length > 0 ? JSON.stringify(obj) : "");
  }, [rows]);

  const update = (i: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const add = () => setRows((prev) => [...prev, { key: "", value: "" }]);
  const remove = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={serialized} />
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No attributes yet. Add rows like Brand → Apple, Memory → 128GB.
        </p>
      )}
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Key (e.g. Brand)"
            value={r.key}
            onChange={(e) => update(i, { key: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="Value (e.g. Apple)"
            value={r.value}
            onChange={(e) => update(i, { value: e.target.value })}
            className="flex-[2]"
          />
          <button
            type="button"
            aria-label="Remove"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={() => remove(i)}
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={add}
        className="rounded-full"
      >
        <Plus className="size-3.5 mr-1.5" strokeWidth={1.75} />
        Add attribute
      </Button>
    </div>
  );
}
