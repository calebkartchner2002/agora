"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { getGuestSessionId } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Order = {
  // Keep flexible because your backend shape may differ.
  id?: string;
  order_id?: string;

  status?: string;
  created_at?: string;
  updated_at?: string;

  total?: number;
  subtotal?: number;
  currency?: string;

  // Some APIs include line items or retailer info:
  items?: Array<{
    title?: string;
    quantity?: number;
    unit_price?: number;
    line_total?: number;
  }>;
};

type OrdersResponse =
  | { orders: Order[] } // common
  | Order[];            // also common

function normalizeOrders(resp: OrdersResponse): Order[] {
  if (Array.isArray(resp)) return resp;
  return resp.orders ?? [];
}

function prettyDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function money(n?: number, currency?: string) {
  if (n == null) return "—";
  return `${n.toFixed(2)} ${currency ?? "USD"}`;
}

export default function OrdersPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(getGuestSessionId());
  }, []);

  async function loadOrders(activeSessionId: string) {
    setLoading(true);
    setError(null);
    try {
      // If your backend filters by session via header, include it.
      // If it doesn't need it, it will ignore it.
      const resp = await apiGet<OrdersResponse>("/orders", {
        headers: { "x-session-id": activeSessionId },
      });
      setOrders(normalizeOrders(resp));
    } catch (e: any) {
      setOrders([]);
      setError(e?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    loadOrders(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Orders</h2>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            History for your current guest session.
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => sessionId && loadOrders(sessionId)}
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

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <Card style={{ padding: 16 }}>
            <div style={{ opacity: 0.8 }}>Loading…</div>
          </Card>
        ) : orders.length === 0 ? (
          <Card style={{ padding: 16 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>No orders yet.</div>
            <div style={{ opacity: 0.8, fontSize: 13 }}>
              Place an order from Checkout and it will appear here.
            </div>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((o, idx) => {
              const oid = o.order_id ?? o.id ?? `order-${idx}`;
              const currency = o.currency ?? "USD";

              return (
                <Card key={oid} style={{ padding: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "baseline",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>
                        Order <code>{oid}</code>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.82 }}>
                        <b>Status:</b> {o.status ?? "—"}
                        {"  •  "}
                        <b>Created:</b> {prettyDate(o.created_at)}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900 }}>
                        {o.total != null ? money(o.total, currency) : money(o.subtotal, currency)}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        {o.total != null ? "Total" : "Subtotal"}
                      </div>
                    </div>
                  </div>

                  {o.items?.length ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
                        Items
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {o.items.slice(0, 5).map((it, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              padding: "10px 12px",
                              borderRadius: 14,
                              border: "1px solid rgba(var(--border), 0.20)",
                              background: "rgba(var(--panel), 0.06)",
                              fontSize: 13,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 800 }}>
                                {it.title ?? "Item"}
                              </div>
                              <div style={{ marginTop: 4, opacity: 0.8 }}>
                                Qty {it.quantity ?? "—"}
                              </div>
                            </div>
                            <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>
                              {it.line_total != null
                                ? money(it.line_total, currency)
                                : it.unit_price != null
                                ? money(it.unit_price, currency)
                                : "—"}
                            </div>
                          </div>
                        ))}
                        {o.items.length > 5 && (
                          <div style={{ fontSize: 12, opacity: 0.75 }}>
                            + {o.items.length - 5} more…
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                      No item details returned by API for this order.
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
