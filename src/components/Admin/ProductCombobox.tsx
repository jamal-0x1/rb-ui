"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ComboProduct = {
  id: string;
  name: string;
  brand?: string | null;
};

export function ProductCombobox({
  products,
  value,
  onChange,
  placeholder = "Search product…",
  id,
}: {
  products: ComboProduct[] | null;
  value: string;
  onChange: (productId: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const selected = products?.find((p) => p.id === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products
      .filter((p) => {
        const hay = `${p.name} ${p.brand ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [products, query]);

  const display = open ? query : selected?.name ?? "";

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          placeholder={placeholder}
          value={display}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-8 pr-16"
          autoComplete="off"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {selected && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground"
              onClick={() => {
                onChange("");
                setQuery("");
                setOpen(false);
              }}
              aria-label="Clear"
            >
              <X className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle"
          >
            <ChevronsUpDown className="size-3.5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          {!products ? (
            <p className="p-3 text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No products match “{query}”
            </p>
          ) : (
            <ul className="max-h-64 overflow-auto py-1 text-sm">
              {filtered.map((p) => {
                const active = p.id === value;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground ${
                        active ? "bg-accent/60" : ""
                      }`}
                      onClick={() => {
                        onChange(p.id);
                        setQuery("");
                        setOpen(false);
                      }}
                    >
                      <span className="min-w-0 truncate">
                        {p.brand && (
                          <span className="text-xs uppercase tracking-wide text-muted-foreground mr-2">
                            {p.brand}
                          </span>
                        )}
                        {p.name}
                      </span>
                      {active && <Check className="size-3.5 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
