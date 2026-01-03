"use client";

import { Product } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ProductCard({
  product,
  onAdd,
  disabled,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  disabled?: boolean;
}) {
  const p = product;

  return (
    <Card padded={true} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          borderRadius: 14,
          border: "1px solid rgba(var(--border), 0.08)",
          background: "rgba(0,0,0,0.25)",
          height: 170,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.title}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ opacity: 0.6, fontSize: 12 }}>No image</div>
        )}
      </div>

      <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>{p.title}</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{p.brand ?? ""}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>
          {p.price != null ? `${p.price} ${p.currency ?? "USD"}` : "—"}
        </div>

        <Button onClick={() => onAdd(p)} disabled={!!disabled} size="sm">
          Add
        </Button>
      </div>

      <a
        href={p.product_url}
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 12,
          opacity: 0.75,
          borderTop: "1px solid rgba(var(--border), 0.08)",
          paddingTop: 10,
          marginTop: 4,
        }}
      >
        View product →
      </a>
    </Card>
  );
}
