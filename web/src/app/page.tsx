"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, Product } from "@/lib/api";
import { getGuestSessionId } from "@/lib/session";
import { SearchBar } from "@/components/SearchBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Card } from "@/components/ui/Card";

type SearchResponse = {
  query: string;
  limit: number;
  results: Product[];
};

type CartResponse = {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  items: Array<{ quantity: number }>;
};


export default function HomePage() {
  const HERO_MAX_WIDTH = 720;
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(12);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cartCount, setCartCount] = useState(0);


  useEffect(() => {
    const sid = getGuestSessionId();
    setSessionId(sid);
    refreshCartCount(sid);
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
      await refreshCartCount(sessionId);
      alert("Added to cart");
    } catch (e: any) {
      setError(e?.message ?? "Add to cart failed");
    }
  }

  async function refreshCartCount(sid: string) {
    try {
      const cart = await apiGet<CartResponse>("/cart", {
        headers: { "x-session-id": sid },
      });
      const count = (cart.items ?? []).reduce((sum, it) => sum + (it.quantity ?? 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }


  function clear() {
    setQ("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  }

  return (
    <div>
      {/* Hero / Search */}
      <div
        style={{
          paddingTop: hasSearched ? 16 : "12vh",
          paddingBottom: hasSearched ? 24 : 40,
          transition: "padding 300ms ease",
          maxWidth: hasSearched ? "100%" : HERO_MAX_WIDTH,
          margin: "0 auto",
        }}
      >
        {!hasSearched && (
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: "0 0 10px",
                color: "rgb(var(--text))",
                lineHeight: 1.2,
              }}
            >
              Find anything.
            </h1>
            <p style={{ fontSize: 16, color: "rgb(var(--muted))", margin: 0, lineHeight: 1.5 }}>
              Search millions of products across the web.
            </p>
          </div>
        )}

        <SearchBar
          q={q}
          setQ={setQ}
          limit={limit}
          setLimit={setLimit}
          loading={loading}
          onSearch={runSearch}
          onClear={clear}
          error={error}
        />
      </div>

      {/* Results */}
      {hasSearched && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "rgb(var(--muted))", fontSize: 15 }}>
              Searching…
            </div>
          ) : results.length === 0 ? (
            <Card style={{ padding: "28px 24px" }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>No results found.</div>
              <div style={{ fontSize: 14, color: "rgb(var(--muted))" }}>
                Try a broader query or increase the limit.
              </div>
            </Card>
          ) : (
            <>
              <div style={{ marginBottom: 18, fontSize: 13, color: "rgb(var(--muted))" }}>
                {results.length} result{results.length !== 1 ? "s" : ""}
              </div>
              <ProductGrid products={results} onAdd={addToCart} addDisabled={!sessionId} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
