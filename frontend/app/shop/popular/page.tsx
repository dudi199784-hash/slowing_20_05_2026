import Link from "next/link";

import PopularDesignPagedGrid from "./PopularDesignPagedGrid";
import { fetchPopularDesigns } from "@/lib/api/designs";

const CATEGORIES = ["전체", "로고", "유니폼", "기타"] as const;

export default async function PopularDesignsPage() {
  const items = await fetchPopularDesigns();

  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
          POPULAR
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">
          인기 상품 · 회원 디자인
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Spring API에서 받아온 회원 유니폼·로고 디자인입니다. 한 페이지는{" "}
          <strong className="font-medium text-neutral-800">3열 × 4행</strong>
          (최대 12개)이고, 좌우 화살표와 아래 페이지 번호로 다음 묶음을 볼 수
          있습니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-medium transition md:text-sm ${
                c === "전체"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
              disabled={c !== "전체"}
              title={c !== "전체" ? "카테고리 필터 API 연동 후 활성화" : undefined}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <section className="mt-12" aria-label="회원 게시 디자인 목록">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 md:text-xl">
            게시된 디자인
          </h2>
          <p className="text-xs text-neutral-500 md:text-sm">
            페이지당 12개 · 화살표 또는 번호로 이동
          </p>
        </div>

        {items.length > 0 ? (
          <PopularDesignPagedGrid items={items} />
        ) : (
          <p className="mt-8 rounded-md border border-dashed border-neutral-200 bg-neutral-50 py-12 text-center text-sm text-neutral-500">
            아직 표시할 디자인이 없습니다.
          </p>
        )}
      </section>

      <p className="mt-12 text-center text-sm text-neutral-500">
        <Link href="/" className="underline-offset-4 hover:underline">
          홈으로 돌아가기
        </Link>
      </p>
    </main>
  );
}
