"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/Card";

type NavBarProps = {
  cartCount?: number; // optional for now; we’ll wire it up next
};

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        textDecoration: "none",
        color: active ? "rgb(var(--text))" : "rgb(var(--muted))",
        background: active ? "rgba(var(--panel), 0.14)" : "transparent",
        border: active ? "1px solid rgba(var(--border), 0.35)" : "1px solid transparent",
        fontWeight: 800,
        fontSize: 13,
      }}
    >
      {label}
    </Link>
  );
}

export function NavBar({ cartCount = 0 }: NavBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, paddingTop: 14 }}>
      <Card
        style={{
          padding: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          backdropFilter: "blur(10px)",
          background: "rgba(var(--panel), 0.08)",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "rgb(var(--text))",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
            }}
          />
          <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>Agora</div>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <NavItem href="/" label="Search" active={isActive("/")} />
          <NavItem href="/cart" label="Cart" active={isActive("/cart")} />
          <NavItem href="/checkout" label="Checkout" active={isActive("/checkout")} />
          <NavItem href="/orders" label="Orders" active={isActive("/orders")} />
        </div>

        {/* Right-side cart badge (optional) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/cart"
            aria-label="Open cart"
            style={{
              position: "relative",
              width: 42,
              height: 42,
              borderRadius: 14,
              border: "1px solid rgba(var(--border), 0.45)",
              background: "rgba(var(--panel), 0.10)",
              color: "rgb(var(--text))",
              display: "grid",
              placeItems: "center",
              textDecoration: "none",
              boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
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
                  fontWeight: 950,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0,0,0,0.25)",
                }}
              >
                {cartCount}
              </div>
            )}
          </Link>
        </div>
      </Card>
    </div>
  );
}
