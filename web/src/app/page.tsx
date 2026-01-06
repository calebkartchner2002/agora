"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, Product } from "@/lib/api";
import { getGuestSessionId } from "@/lib/session";
import { Header } from "@/components/Header";
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
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(12);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cartCount, setCartCount] = useState(0);


  // useEffect(() => {
  //   setSessionId(getGuestSessionId());
  // }, []);
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
      // We’ll replace alert with a Toast component later
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
      // If cart isn't created yet or endpoint errors, just show 0
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
    <>
      <Header sessionId={sessionId} cartCount={cartCount} />

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

      {!hasSearched ? (
      <div
        style={{
          marginTop: 12,
          padding: "20px 22px",
          borderRadius: 18,
          background: "rgba(var(--panel), 0.06)",
          color: "rgb(var(--muted))",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
          Ready when you are.
        </div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          Enter a query above and use the search icon to explore products.
        </div>
      </div>
      ) : results.length === 0 && !loading ? (
        <Card style={{ padding: 18, opacity: 0.92 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>No results.</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Try a broader query or increase the limit.
          </div>
        </Card>
      ) : (
        <ProductGrid products={results} onAdd={addToCart} addDisabled={!sessionId} />
      )}
    </>
  );
}
