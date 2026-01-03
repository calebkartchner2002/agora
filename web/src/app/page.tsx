"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, Product } from "@/lib/api";

type SearchResponse = {
  query: string;
  limit: number;
  results: Product[];
};

function getGuestSessionId(): string {
  const key = "agora_guest_session_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const newId =
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(key, newId);
  return newId;
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(12);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setSessionId(getGuestSessionId());
  }, []);

  async function runSearch() {
    const trimmed = q.trim();
    if (!trimmed) {
      setError("Type a search query first.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await apiGet<SearchResponse>(
        `/products/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`
      );
      setResults(data.results ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(p: Product) {
    if (!sessionId) {
      setError("Session not initialized yet. Try again.");
      return;
    }

    try {
      await apiPost(
        "/cart/items",
        {
          product_id: p.id,
          product_url: p.product_url,
          title: p.title,
          price: p.price ?? null,
          currency: p.currency ?? "USD",
          image_url: p.image_url ?? null,
          quantity: 1,
        },
        { headers: { "x-session-id": sessionId } }
      );
      // quick modern “toast-ish” feedback without a lib:
      setError(null);
      alert("Added to cart");
    } catch (e: any) {
      setError(e?.message ?? "Add to cart failed");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.20), transparent 55%)," +
          "radial-gradient(900px 500px at 80% 30%, rgba(16,185,129,0.14), transparent 60%)," +
          "linear-gradient(180deg, #070A12 0%, #05060B 100%)",
        color: "#E7EAF3",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px 60px" }}>
        {/* Header */}
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
                    "linear-gradient(135deg, rgba(99,102,241,1) 0%, rgba(16,185,129,1) 100%)",
                  boxShadow: "0 10px 30px rgba(99,102,241,0.25)",
                }}
              />
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.2, margin: 0 }}>
                Agora
              </h1>
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
              Search the catalog, add items to a guest cart, and check out later.
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              opacity: 0.75,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
              maxWidth: 360,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={sessionId ?? ""}
          >
            Guest session: <code style={{ opacity: 0.95 }}>{sessionId ?? "loading..."}</code>
          </div>
        </header>

        {/* Search Bar */}
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 18,
            padding: 14,
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Search query</div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch();
                }}
                placeholder="Try “running shoes”, “air fryer”, “monitor”…"
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#E7EAF3",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ width: 120 }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Limit</div>
              <input
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 12)}
                type="number"
                min={1}
                max={30}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#E7EAF3",
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={runSearch}
              disabled={loading}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(16,185,129,0.90) 100%)",
                color: "#071019",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 18px 60px rgba(99,102,241,0.25)",
                minWidth: 120,
              }}
            >
              {loading ? "Searching…" : "Search"}
            </button>

            <button
              onClick={() => {
                setQ("");
                setResults([]);
                setHasSearched(false);
                setError(null);
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "#E7EAF3",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,80,80,0.25)",
                background: "rgba(255,80,80,0.10)",
                color: "#FFD7D7",
                fontSize: 13,
              }}
            >
              <b>Issue:</b> {error}
            </div>
          )}
        </section>

        {/* Results */}
        <section>
          {!hasSearched ? (
            <div
              style={{
                border: "1px dashed rgba(255,255,255,0.14)",
                borderRadius: 18,
                padding: 18,
                background: "rgba(255,255,255,0.03)",
                opacity: 0.9,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                Ready when you are.
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                Enter a query above and hit <b>Search</b> to load products.
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 18,
                padding: 18,
                background: "rgba(255,255,255,0.03)",
                opacity: 0.9,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                No results.
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                Try a broader query or reduce filters.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {results.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 18,
                    padding: 14,
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.08)",
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

                  <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{p.brand ?? ""}</div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      {p.price != null ? `${p.price} ${p.currency ?? "USD"}` : "—"}
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={!sessionId}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(16,185,129,0.90) 100%)",
                        color: "#071019",
                        fontWeight: 900,
                        cursor: sessionId ? "pointer" : "not-allowed",
                      }}
                    >
                      Add
                    </button>
                  </div>

                  <a
                    href={p.product_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      opacity: 0.75,
                      textDecoration: "none",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: 10,
                      marginTop: 4,
                    }}
                  >
                    View product →
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Responsive tweak */}
        <style jsx>{`
          @media (max-width: 980px) {
            section > div[style*="grid-template-columns: repeat(3"] {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 640px) {
            section > div[style*="grid-template-columns: repeat(3"],
            section > div[style*="grid-template-columns: repeat(2"] {
              grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
