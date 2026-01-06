"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";

export function Header({
  sessionId,
  cartCount,
}: {
  sessionId: string | null;
  cartCount: number;
}) {
  const router = useRouter();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginBottom: 22,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.2, margin: 0 }}>
            Agora
          </h1>
        </div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
          Search the catalog, add items to a guest cart, and check out later.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Cart button */}
        <button
          onClick={() => router.push("/cart")}
          aria-label="Open cart"
          style={{
            position: "relative",
            width: 44,
            height: 44,
            borderRadius: 14,
            border: "1px solid rgba(var(--border), 0.45)",
            background: "rgba(var(--panel), 0.10)",
            color: "rgb(var(--text))",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          }}
        >
          {/* cart icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.9 }}
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>

          {/* count badge */}
          {cartCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                minWidth: 20,
                height: 20,
                padding: "0 6px",
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)",
                color: "rgb(var(--panel))",
                fontSize: 12,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(0,0,0,0.25)",
              }}
            >
              {cartCount}
            </div>
          )}
        </button>

        {/* Guest session pill */}
        <Card
          style={{
            fontSize: 12,
            opacity: 0.9,
            padding: "10px 12px",
            maxWidth: 360,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            background: "rgba(var(--panel), 0.08)",
          }}
          title={sessionId ?? ""}
        >
          Guest session: <code style={{ opacity: 0.95 }}>{sessionId ?? "loading..."}</code>
        </Card>
      </div>
    </header>
  );
}
