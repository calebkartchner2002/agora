import { Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export function ProductGrid({
  products,
  onAdd,
  addDisabled,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  addDisabled?: boolean;
}) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} disabled={addDisabled} />
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: repeat(3"],
          div[style*="grid-template-columns: repeat(2"] {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </>
  );
}
