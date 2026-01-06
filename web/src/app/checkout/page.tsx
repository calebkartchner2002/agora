"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
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

type CheckoutPreviewResponse = {
  // These fields may vary; we keep it flexible.
  subtotal?: number;
  total?: number;
  currency?: string;
  line_items?: Array<{
    title?: string;
    quantity?: number;
    unit_price?: number;
    line_total?: number;
  }>;
  warnings?: string[];
};

type CheckoutSubmitResponse = {
  // Often includes order id + status
  order_id?: string;
  status?: string;
  message?: string;
};

function money(n: number | null | undefined, currency: string) {
  if (n == null) return "—";
  return `${n.toFixed(2)} ${currency}`;
}

export default function CheckoutPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<CheckoutSubmitResponse | null>(null);

  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(getGuestSessionId());
  }, []);

  async function loadCart(activeSessionId: string) {
    setLoadingCart(true);
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
      setLoadingCart(false);
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    loadCart(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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

  async function runPreview() {
    if (!sessionId) return;
    setLoadingPreview(true);
    setError(null);
    setSubmitResult(null);

    try {
      // Backend should derive cart from x-session-id
      const data = await apiPost<CheckoutPreviewResponse>(
        "/checkout/preview",
        {},
        { headers: { "x-session-id": sessionId } }
      );
      setPreview(data);
    } catch (e: any) {
      setPreview(null);
      setError(e?.message ?? "Checkout preview failed");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function submitCheckout() {
    if (!sessionId) return;
    setSubmitting(true);
    setError(null);

    try {
      // Many backends require preview first; you can keep the guard
      // but we won't hard-block—just recommend.
      const data = await apiPost<CheckoutSubmitResponse>(
        "/checkout/submit",
        {},
        { headers: { "x-session-id": sessionId } }
      );
      setSubmitResult(data);
    } catch (e: any) {
      setSubmitResult(null);
      setError(e?.message ?? "Checkout submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  const hasItems = (cart?.items?.length ?? 0) > 0;

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Checkout</h2>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            Preview totals, then submit your order.
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => sessionId && loadCart(sessionId)}
          disabled={!sessionId || loadingCart}
        >
          Refresh cart
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

      {submitResult ? (
        <Card style={{ marginTop: 16, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6 }}>Submitted ✅</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            {submitResult.order_id && (
              <div>
                <b>Order ID:</b> <code>{submitResult.order_id}</code>
              </div>
            )}
            {submitResult.status && (
              <div style={{ marginTop: 6 }}>
                <b>Status:</b> {submitResult.status}
              </div>
            )}
            {submitResult.message && (
              <div style={{ marginTop: 6 }}>
                <b>Message:</b> {submitResult.message}
              </div>
            )}
          </div>

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
            Next step: show Order History using <code>GET /orders</code>.
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginTop: 16 }}>
          {/* Review */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>Review</div>

            {loadingCart ? (
              <div style={{ opacity: 0.8 }}>Loading…</div>
            ) : !hasItems ? (
              <div style={{ opacity: 0.8 }}>Your cart is empty.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cart!.items.map((it) => (
                  <div
                    key={it.cart_item_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(var(--border), 0.22)",
                      background: "rgba(var(--panel), 0.06)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, lineHeight: 1.25 }}>{it.title}</div>
                      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                        {it.quantity} × {it.price ?? "—"} {it.currency ?? "USD"}
                      </div>
                    </div>
                    <div style={{ fontWeight: 900, whiteSpace: "nowrap" }}>
                      {it.price != null ? (it.price * it.quantity).toFixed(2) : "—"} {it.currency ?? "USD"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Summary + Actions */}
          <Card style={{ padding: 16, height: "fit-content" }}>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>Summary</div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ opacity: 0.85 }}>Items</div>
              <div style={{ fontWeight: 900 }}>{totals.count}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ opacity: 0.85 }}>Cart subtotal</div>
              <div style={{ fontWeight: 900 }}>{money(totals.subtotal, totals.currency)}</div>
            </div>

            <Button
              onClick={runPreview}
              disabled={!hasItems || loadingPreview || submitting || !sessionId}
              style={{ width: "100%", marginBottom: 10 }}
            >
              {loadingPreview ? "Previewing…" : "Preview checkout"}
            </Button>

            <Button
              onClick={submitCheckout}
              disabled={!hasItems || submitting || !sessionId}
              style={{ width: "100%" }}
            >
              {submitting ? "Submitting…" : "Submit order"}
            </Button>

            {preview && (
              <div style={{ marginTop: 14, fontSize: 13, opacity: 0.9 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Preview</div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ opacity: 0.85 }}>Subtotal</div>
                  <div style={{ fontWeight: 900 }}>
                    {money(preview.subtotal ?? totals.subtotal, preview.currency ?? totals.currency)}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ opacity: 0.85 }}>Total</div>
                  <div style={{ fontWeight: 900 }}>
                    {money(preview.total ?? totals.subtotal, preview.currency ?? totals.currency)}
                  </div>
                </div>

                {preview.warnings?.length ? (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>Warnings</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {preview.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
              Preview confirms price/availability; Submit places the order.
            </div>
          </Card>
        </div>
      )}

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
