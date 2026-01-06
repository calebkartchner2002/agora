"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiDelete } from "@/lib/api";
import { getGuestSessionId } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type CartItem = {
  cart_item_id: string;
  product_id: string;
  title: string;
  product_url: string;
  image_url?: string | null;
  price?: number | null;
  currency?: string | null;
  quantity: number;
};

type CartResponse = {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  items: CartItem[];
};

function fmtMoney(price: number | null | undefined, currency?: string | null) {
  if (price == null) return "—";
  return `${price} ${currency ?? "USD"}`;
}

function getCartItemId(it: CartItem): string | null {
  return it.cart_item_id;
}

export default function CartPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const items = cart?.items ?? [];
    const count = items.reduce((sum, it) => sum + (it.quantity ?? 0), 0);
    const subtotal = items.reduce((sum, it) => {
      const p = it.price ?? 0;
      const q = it.quantity ?? 0;
      return sum + p * q;
    }, 0);
    const currency = items.find((x) => x.currency)?.currency ?? "USD";
    return { count, subtotal, currency };
  }, [cart]);

  // IMPORTANT: only set sessionId on client AFTER mount (prevents hydration mismatch)
  useEffect(() => {
    setSessionId(getGuestSessionId());
  }, []);

  async function loadCart(activeSessionId: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<CartResponse>("/cart", {
        headers: { "x-session-id": activeSessionId },
      });
      setCart(data);
    } catch (e: any) {
      setCart(null);
      setError(e?.message ?? "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  // Load cart once session is ready
  useEffect(() => {
    if (!sessionId) return;
    loadCart(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function removeItem(cartItemId: string) {
    if (!sessionId) return;

    setBusyItemId(cartItemId);
    setError(null);
    try {
      await apiDelete(`/cart/items/${encodeURIComponent(cartItemId)}`, {
        headers: { "x-session-id": sessionId },
      });
      await loadCart(sessionId);
    } catch (e: any) {
      setError(e?.message ?? "Remove failed.");
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <main>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Cart</h2>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            Guest session:{" "}
            <code suppressHydrationWarning>
              {sessionId ?? "loading..."}
            </code>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => sessionId && loadCart(sessionId)}
          disabled={!sessionId || loading}
        >
          Refresh
        </Button>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          marginTop: 16,
        }}
      >
        {/* Items */}
        <Card style={{ padding: 16 }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>
            Items
          </div>

          {!sessionId || loading ? (
            <div style={{ opacity: 0.8 }}>Loading…</div>
          ) : !cart || (cart.items?.length ?? 0) === 0 ? (
            <div style={{ opacity: 0.8 }}>
              Your cart is empty. Go back and add something.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.items.map((it) => {
                const cartItemId = getCartItemId(it);

                return (
                  <div
                    key={cartItemId ?? it.product_id}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(var(--border), 0.22)",
                      background: "rgba(var(--panel), 0.06)",
                    }}
                  >
                    {/* image */}
                    <div
                      style={{
                        width: 92,
                        height: 92,
                        borderRadius: 14,
                        border: "1px solid rgba(var(--border), 0.18)",
                        background: "rgba(0,0,0,0.18)",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {it.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image_url}
                          alt={it.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div style={{ opacity: 0.6, fontSize: 12 }}>No image</div>
                      )}
                    </div>

                    {/* details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 900, lineHeight: 1.25 }}>
                        {it.title}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                        {fmtMoney(it.price, it.currency)} • Qty {it.quantity}
                      </div>
                      <a
                        href={it.product_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 8,
                          fontSize: 12,
                          opacity: 0.8,
                        }}
                      >
                        View product →
                      </a>

                    </div>

                    {/* actions */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {it.price != null
                          ? fmtMoney(it.price * it.quantity, it.currency)
                          : "—"}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!cartItemId) {
                            setError(
                              "This cart item has no cart_item_id in the API response. Confirm the field name in GET /cart."
                            );
                            return;
                          }
                          removeItem(cartItemId);
                        }}
                        disabled={!cartItemId || busyItemId === cartItemId}
                      >
                        {busyItemId === cartItemId ? "Removing…" : "Remove"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Summary */}
        <Card style={{ padding: 16, height: "fit-content" }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>
            Summary
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ opacity: 0.85 }}>Items</div>
            <div style={{ fontWeight: 900 }}>{totals.count}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ opacity: 0.85 }}>Subtotal</div>
            <div style={{ fontWeight: 900 }}>
              {`${totals.subtotal.toFixed(2)} ${totals.currency}`}
            </div>
          </div>

          <Button
            onClick={() => window.location.href = "/checkout"}
            disabled={!cart || (cart.items?.length ?? 0) === 0}
            style={{ width: "100%" }}
          >
            Checkout
          </Button>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Checkout will come next: price re-check + Rye execution.
          </div>
        </Card>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
