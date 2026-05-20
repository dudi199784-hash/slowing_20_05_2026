"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { formatApiError } from "@/app/lib/api/formatApiError";
import {
  fetchBrowseLogoAssets,
  formatMetricCount,
  handleBrowseCardClick,
  logoAssetImageUrl,
  titleFromLogoPrompt,
  type LogoAssetItem,
} from "@/app/lib/api/logoAssets";
import MemberDesignMetricsRow from "@/components/community/MemberDesignMetricsRow";

const CATEGORIES = ["전체", "로고", "유니폼"] as const;

export default function BrowseClient() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [items, setItems] = useState<LogoAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchBrowseLogoAssets(category);
      setItems(list);
    } catch (err: unknown) {
      setError(formatApiError(err, "공개 디자인을 불러오지 못했습니다."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="mt-10" aria-label="공개 디자인 목록">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition md:text-sm ${
              category === c
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-neutral-500">불러오는 중…</p>
      ) : error ? (
        <p className="mt-10 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-md border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
          아직 공개된 디자인이 없습니다.
          <br />
          내 디자인에서 「모두 보기」로 공유해 보세요.
        </p>
      ) : (
        <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/shop/browse/${item.id}`}
                onClick={() => handleBrowseCardClick(item.id)}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-neutral-400 hover:shadow-sm"
              >
                <div className="aspect-[4/3] bg-neutral-100 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoAssetImageUrl(item.accessPath)}
                    alt={titleFromLogoPrompt(item.prompt)}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    {item.category}
                  </span>
                  <h2 className="line-clamp-2 text-sm font-semibold text-neutral-900">
                    {titleFromLogoPrompt(item.prompt)}
                  </h2>
                  <p className="text-xs text-neutral-500">{item.authorName}</p>
                  <MemberDesignMetricsRow
                    viewsDisplay={formatMetricCount(item.viewCount)}
                    likesDisplay={formatMetricCount(item.likeCount)}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
