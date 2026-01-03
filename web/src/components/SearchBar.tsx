"use client";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Props = {
  q: string;
  setQ: (v: string) => void;
  limit: number;
  setLimit: (v: number) => void;
  loading: boolean;
  onSearch: () => void;
  onClear: () => void;
  error: string | null;
};

export function SearchBar({
  q,
  setQ,
  limit,
  setLimit,
  loading,
  onSearch,
  onClear,
  error,
}: Props) {
  return (
    <Card
      style={{
        marginBottom: 22,
        background: "rgba(var(--panel), 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {/* Search input */}
        <div style={{ flex: 1.8, minWidth: 360 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
            Search the Agora
          </div>

          <div style={{ position: "relative" }}>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              placeholder='Search products (e.g. “running shoes”)'
              style={{
                paddingRight: 64, // room for icon button
              }}
            />

            {/* Search icon button */}
            <button
              onClick={onSearch}
              disabled={loading}
              aria-label="Search"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 42,
                height: 42,
                borderRadius: 14,
                border: "1px solid rgba(var(--border), 0.55)",
                background:
                  "linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)))",
                color: "rgb(var(--panel))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        {/* Limit */}
        <div style={{ width: 130 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
            Limit
          </div>
          <Input
            type="number"
            min={1}
            max={30}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 12)}
          />
        </div>

        {/* Clear */}
        <div style={{ paddingBottom: 2 }}>
          <Button variant="ghost" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid rgba(var(--danger), 0.35)",
            background: "rgba(var(--danger), 0.12)",
            color: "rgb(255 230 230)",
            fontSize: 13,
          }}
        >
          <b>Issue:</b> {error}
        </div>
      )}
    </Card>
  );
}
