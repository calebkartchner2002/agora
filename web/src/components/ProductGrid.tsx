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
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} disabled={addDisabled} />
        ))}
      </div>

      <style jsx>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        @media (max-width: 1100px) {
          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 760px) {
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 500px) {
          .product-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
}
