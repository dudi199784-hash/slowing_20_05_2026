import CartItemCard from "@/components/cart/CartItemCard";

import type { CartItemPlaceholder } from "./types";
import { boardCardListItem } from "@/lib/boardCardHover";

export type { CartItemPlaceholder } from "./types";

type CartCategorySectionProps = {
  title: string;
  items: CartItemPlaceholder[];
  /** 섹션 사이 구분선 위 여백 등 */
  className?: string;
};

export default function CartCategorySection({
  title,
  items,
  className = "",
}: CartCategorySectionProps) {
  return (
    <section className={className} aria-labelledby={`cart-section-${title}`}>
      <div className="flex items-center gap-4">
        <h2
          id={`cart-section-${title}`}
          className="shrink-0 text-lg font-semibold tracking-wide text-neutral-900 md:text-xl"
        >
          {title}
        </h2>
        <div className="h-px flex-1 bg-neutral-200" role="separator" aria-hidden />
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-neutral-200 bg-neutral-50/80 py-12 text-center text-sm text-neutral-500">
          담긴 상품이 없습니다.
        </p>
      ) : (
        <ul
          className="mt-6 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {items.map((item) => (
            <li key={item.id} className={boardCardListItem}>
              <CartItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
