"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatApiError } from "@/app/lib/api/formatApiError";
import {
  fetchBrowseLogoAsset,
  formatMetricCount,
  logoAssetImageUrl,
  titleFromLogoPrompt,
  toggleBrowseLike,
  type LogoAssetItem,
} from "@/app/lib/api/logoAssets";
import MemberDesignMetricsRow from "@/components/community/MemberDesignMetricsRow";
import { getAccessToken } from "@/lib/auth/session";

type BrowseDetailClientProps = {
  id: number;
};

function browseCountSessionKey(id: number): string {
  return `browse-view-counted-${id}`;
}

export default function BrowseDetailClient({ id }: BrowseDetailClientProps) {
  const [item, setItem] = useState<LogoAssetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const countKey = browseCountSessionKey(id);
    const shouldCountView = sessionStorage.getItem(countKey) !== "1";
    if (shouldCountView) {
      sessionStorage.setItem(countKey, "1");
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchBrowseLogoAsset(id, {
          countView: shouldCountView,
        });
        if (!cancelled) setItem(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(formatApiError(err, "디자인을 불러오지 못했습니다."));
          setItem(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleLike() {
    if (!getAccessToken()) {
      setError("좋아요는 로그인 후 이용할 수 있습니다.");
      return;
    }
    setLikeLoading(true);
    setError("");
    try {
      const updated = await toggleBrowseLike(id);
      setItem(updated);
    } catch (err: unknown) {
      setError(formatApiError(err, "좋아요 처리에 실패했습니다."));
    } finally {
      setLikeLoading(false);
    }
  }

  if (loading) {
    return <p className="mt-12 text-sm text-neutral-500">불러오는 중…</p>;
  }

  if (error && !item) {
    return (
      <p className="mt-12 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!item) {
    return (
      <p className="mt-12 text-sm text-neutral-500">
        디자인을 찾을 수 없습니다.
      </p>
    );
  }

  const liked = Boolean(item.likedByMe);

  return (
    <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 p-4 md:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoAssetImageUrl(item.accessPath)}
          alt={titleFromLogoPrompt(item.prompt)}
          className="mx-auto max-h-[min(75vh,720px)] w-full object-contain"
        />
      </div>

      <aside className="w-full max-w-md space-y-4 lg:sticky lg:top-24">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {item.category}
        </span>
        <h1 className="text-xl font-semibold text-neutral-900 md:text-2xl">
          {titleFromLogoPrompt(item.prompt)}
        </h1>
        <p className="text-sm text-neutral-600">
          제작 <span className="font-medium text-neutral-900">{item.authorName}</span>
        </p>
        <MemberDesignMetricsRow
          viewsDisplay={formatMetricCount(item.viewCount)}
          likesDisplay={formatMetricCount(item.likeCount)}
        />
        <button
          type="button"
          disabled={likeLoading}
          onClick={() => void handleLike()}
          className={`w-full rounded-md border px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
            liked
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
          }`}
        >
          {likeLoading ? "처리 중…" : liked ? "좋아요 취소" : "좋아요"}
        </button>
        {!getAccessToken() ? (
          <p className="text-xs text-neutral-500">
            <Link href="/login" className="font-medium underline">
              로그인
            </Link>
            하면 좋아요를 남길 수 있습니다.
          </p>
        ) : null}
        {error ? (
          <p className="text-xs text-red-700">{error}</p>
        ) : null}
        <Link
          href="/shop/browse"
          className="inline-block text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          ← 구경하기 목록
        </Link>
      </aside>
    </div>
  );
}
