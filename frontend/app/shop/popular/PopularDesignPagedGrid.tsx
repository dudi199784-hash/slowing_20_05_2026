"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { handleBrowseCardClick } from "@/app/lib/api/logoAssets";
import type { MemberDesignPreview } from "@/config/memberDesignPreview";
import MemberDesignMetricsRow from "@/components/community/MemberDesignMetricsRow";
import AddToCartConfirmDialog from "@/components/shop/AddToCartConfirmDialog";
import { postCartLine } from "@/lib/api/cart";
import { isCartableDesignCategory } from "@/lib/designCategories";
import {
  boardCardHoverShell,
  boardCardListItem,
} from "@/lib/boardCardHover";

/** 한 페이지 = 3열 × 4행 = 12개 */
const PAGE_SIZE = 12;

type PopularDesignPagedGridProps = {
  items: MemberDesignPreview[];
};

function DesignCard({
  item,
  onAddToCart,
}: {
  item: MemberDesignPreview;
  onAddToCart: (item: MemberDesignPreview) => void;
}) {
  const customHref = `/shop/custom/${encodeURIComponent(item.id)}`;
  const showCart = isCartableDesignCategory(item.category);

  return (
    <div className={boardCardHoverShell}>
      <article className="flex h-full flex-col overflow-hidden border border-neutral-200 bg-white transition-colors duration-500 ease-in-out hover:border-neutral-300">
        <Link
          href={item.browseHref}
          onClick={() => handleBrowseCardClick(item.assetId)}
          className="block flex flex-1 flex-col"
        >
          <div className="aspect-[4/3] w-full bg-neutral-100 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1 p-4">
            <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              {item.category}
            </span>
            <h3 className="text-sm font-semibold text-neutral-900 md:text-base">
              {item.title}
            </h3>
            <p className="text-xs text-neutral-500">{item.author}</p>
            <MemberDesignMetricsRow
              viewsDisplay={item.viewsDisplay}
              likesDisplay={item.likesDisplay}
            />
          </div>
        </Link>
        <div className="mt-3 flex gap-2 px-4 pb-4">
          {showCart ? (
            <button
              type="button"
              onClick={() => onAddToCart(item)}
              className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 sm:text-sm"
            >
              쇼핑백
            </button>
          ) : null}
          <Link
            href={customHref}
            className={`rounded-md border border-neutral-900 bg-neutral-900 px-2 py-2 text-center text-xs font-medium text-white transition hover:bg-neutral-800 sm:text-sm ${
              showCart ? "flex-1" : "w-full"
            }`}
          >
            래퍼런스
          </Link>
        </div>
      </article>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/**
 * 페이지네이션: `currentPage`가 바뀔 때마다 `slice`로 12개만 잘라서 그립니다.
 */
export default function PopularDesignPagedGrid({
  items,
}: PopularDesignPagedGridProps) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState(1);
  const [cartDialogTitle, setCartDialogTitle] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages, items.length]);

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const shown = items.slice(start, start + PAGE_SIZE);

  const go = (p: number) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  };

  const handleAddToCart = async (item: MemberDesignPreview) => {
    setCartError(null);
    if (!isCartableDesignCategory(item.category)) {
      setCartError("로고는 쇼핑백에 담을 수 없습니다.");
      return;
    }
    try {
      await postCartLine({
        designId: item.id,
        productId: item.productId,
        category: item.category,
      });
      setCartDialogTitle(item.title);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                "쇼핑백에 담지 못했습니다.",
            )
          : err instanceof Error
            ? err.message
            : "쇼핑백에 담지 못했습니다.";
      setCartError(msg);
    }
  };

  return (
    <>
      <div>
        <div className="mt-8 flex items-stretch gap-2 sm:gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => go(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="이전 페이지"
          className="group flex w-10 shrink-0 items-center justify-center self-stretch rounded-lg text-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-11 md:w-12"
        >
          <ChevronLeftIcon className="h-5 w-5 transition-transform duration-300 ease-out will-change-transform group-hover:scale-110 motion-reduce:group-hover:scale-100 sm:h-6 sm:w-6" />
        </button>

        <ul
          className="grid min-h-0 min-w-0 flex-1 list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {shown.map((item) => (
            <li key={item.id} className={boardCardListItem}>
              <DesignCard item={item} onAddToCart={handleAddToCart} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => go(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="다음 페이지"
          className="group flex w-10 shrink-0 items-center justify-center self-stretch rounded-lg text-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-11 md:w-12"
        >
          <ChevronRightIcon className="h-5 w-5 transition-transform duration-300 ease-out will-change-transform group-hover:scale-110 motion-reduce:group-hover:scale-100 sm:h-6 sm:w-6" />
        </button>
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-neutral-100 pt-8"
          aria-label="상품 페이지"
        >
          <button
            type="button"
            onClick={() => go(safePage - 1)}
            disabled={safePage <= 1}
            className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 md:text-sm"
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => go(num)}
              className={`min-w-[2.25rem] rounded-md border px-3 py-2 text-xs font-medium transition md:text-sm ${
                num === safePage
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={() => go(safePage + 1)}
            disabled={safePage >= totalPages}
            className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 md:text-sm"
          >
            다음
          </button>
        </nav>
      ) : null}

      {cartError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800">
          {cartError}
        </p>
      ) : null}

      <p className="mt-4 text-center text-xs text-neutral-400">
        페이지 {safePage} / {totalPages} · 총 {items.length}개 (페이지당 최대{" "}
        {PAGE_SIZE}개)
      </p>
    </div>

      <AddToCartConfirmDialog
        open={cartDialogTitle !== null}
        productTitle={cartDialogTitle ?? ""}
        onClose={() => {
          setCartDialogTitle(null);
          setCartError(null);
        }}
      />
    </>
  );
}
