"use client";

import Link from "next/link";

import type { CartItemPlaceholder } from "@/app/cart/types";
import { boardCardHoverShell } from "@/lib/boardCardHover";

type CartItemCardProps = {
  item: CartItemPlaceholder;
};

export default function CartItemCard({ item }: CartItemCardProps) {
  const purchaseHref = `/cart/purchase?id=${encodeURIComponent(item.id)}`;
  const refId = item.productId ?? item.id;
  const customHref = `/shop/custom/${encodeURIComponent(refId)}`;

  return (
    <div className={boardCardHoverShell}>
      <article className="group/card relative flex h-full flex-col overflow-hidden border border-neutral-200 bg-white transition-colors duration-500 ease-in-out hover:border-neutral-300">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- API base URL 동적
            <img
              src={item.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100" aria-hidden />
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-neutral-900/50 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover/card:opacity-100 sm:group-focus-within/card:opacity-100">
            <Link
              href={customHref}
              className="rounded-md border border-white/90 bg-transparent px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm"
            >
              수정하기
            </Link>
            <Link
              href={purchaseHref}
              className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-100 sm:text-sm"
            >
              구매하기
            </Link>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="text-sm font-medium text-neutral-900">{item.title}</h3>
          {item.subtitle ? (
            <p className="text-xs text-neutral-500">{item.subtitle}</p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
