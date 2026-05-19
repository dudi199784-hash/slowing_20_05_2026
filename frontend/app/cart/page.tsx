"use client";

import { useCallback, useEffect, useState } from "react";

import CustomMaker from "@/app/home/CustomMaker";
import MemberDesignShowcase from "@/components/community/MemberDesignShowcase";
import type { CartLine } from "@/lib/api/cart";
import { fetchCartItems } from "@/lib/api/cart";
import { getCurrentMemberId } from "@/lib/auth/session";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";

import CartCategorySection from "./CartCategorySection";

export default function CartPage() {
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (getCurrentMemberId() == null) {
        setError("로그인 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
        setItems([]);
        return;
      }
      const next = await fetchCartItems();
      setItems(next);
    } catch {
      setError("쇼핑백을 불러오지 못했습니다. 네트워크와 로그인 상태를 확인해 주세요.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onAuth = () => void load();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [load]);

  const cartSectionOrder = [
    "유니폼",
    "축구화",
    "키퍼장갑",
    "스포츠용품",
    "기타",
  ] as const;
  const cartSectionTitles: Record<(typeof cartSectionOrder)[number], string> = {
    유니폼: "유니폼",
    축구화: "축구화",
    키퍼장갑: "키퍼 장갑",
    스포츠용품: "스포츠 용품",
    기타: "기타",
  };
  const cartDraftItems = items.filter((item) => item.category !== "로고");
  const cartSections = cartSectionOrder
    .map((key) => ({
      key,
      title: cartSectionTitles[key],
      items: cartDraftItems.filter((item) => item.category === key),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
          SHOPPING BAG
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">
          쇼핑백
        </h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-600">
          유니폼·축구화·키퍼 장갑·스포츠 용품 등 디자인 시안만 담깁니다. 로고
          이미지는 쇼핑백에 넣지
          않습니다. 카드에 마우스를 올리면 구매하기·수정하기를 쓸 수 있습니다.
        </p>
      </header>

      {loading ? (
        <p className="mt-12 text-center text-sm text-neutral-500">불러오는 중…</p>
      ) : error ? (
        <p className="mt-12 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!loading && !error && cartDraftItems.length === 0 ? (
        <p className="mt-12 rounded-md border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
          담긴 시안이 없습니다.
          <br />
          디자인 스튜디오에서 시안을 만든 뒤 「쇼핑백에 담기」를 눌러 주세요.
        </p>
      ) : (
        <div className="mt-12 space-y-16 md:mt-16 md:space-y-20">
          {cartSections.map((section) => (
            <CartCategorySection
              key={section.key}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      )}

      <div className="mt-16 border-t border-neutral-200 pt-12 md:mt-20 md:pt-16">
        <CustomMaker noTopMargin />
      </div>

      <MemberDesignShowcase className="mt-12 md:mt-16" />
    </main>
  );
}
