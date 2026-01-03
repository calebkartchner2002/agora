import { Card } from "@/components/ui/Card";

export function Header({ sessionId }: { sessionId: string | null }) {
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
                "linear-gradient(135deg, rgba(var(--primary),1) 0%, rgba(var(--accent),1) 100%)",
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

      <Card
        style={{
          fontSize: 12,
          opacity: 0.85,
          padding: "10px 12px",
          maxWidth: 360,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={sessionId ?? ""}
      >
        Guest session: <code style={{ opacity: 0.95 }}>{sessionId ?? "loading..."}</code>
      </Card>
    </header>
  );
}
