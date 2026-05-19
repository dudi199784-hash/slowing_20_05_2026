"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { CartLine } from "@/lib/api/cart";
import { fetchCartItemById } from "@/lib/api/cart";

import CartPurchaseClient from "./CartPurchaseClient";

export default function CartPurchasePageClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? undefined;

  const [product, setProduct] = useState<CartLine | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchCartItemById(id);
      setProduct(p);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-6 py-12 text-neutral-900 md:px-10 md:py-16">
      <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
        CHECKOUT
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-wide md:text-3xl">
        구매하기
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        왼쪽 상품과 오른쪽 옵션(가로 3:2)은 넓은 화면에서 나란히 보이고, 하단
        내비로 부가 정보를 볼 수 있습니다.
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">상품 정보를 불러오는 중…</p>
      ) : null}
      {!loading && id && !product ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          해당 ID의 쇼핑백 상품을 찾지 못했습니다. 쇼핑백에서 다시 시도하거나, 아래는
          데모 입력만 가능합니다.{" "}
          <Link href="/cart" className="font-medium underline">
            쇼핑백
          </Link>
        </p>
      ) : null}

      <div className="mt-10">
        <CartPurchaseClient product={product} productId={id ?? null} />
      </div>
    </main>
  );
}
