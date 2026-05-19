"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatApiError } from "@/app/lib/api/formatApiError";
import type { MemberDesignPreview } from "@/config/memberDesignPreview";
import { fetchShowcaseDesigns } from "@/lib/api/designs";
import {
  boardCardHoverShell,
  boardCardListItem,
} from "@/lib/boardCardHover";
import MemberDesignMetricsRow from "./MemberDesignMetricsRow";

const ROTATE_MS = 5000;
const TRANSITION_MS = 450;

type Mode = "views" | "likes";

type MemberDesignShowcaseProps = {
  className?: string;
};

export default function MemberDesignShowcase({
  className = "",
}: MemberDesignShowcaseProps) {
  const [mode, setMode] = useState<Mode>("views");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [designsByViews, setDesignsByViews] = useState<MemberDesignPreview[]>([]);
  const [designsByLikes, setDesignsByLikes] = useState<MemberDesignPreview[]>([]);

  const items = mode === "views" ? designsByViews : designsByLikes;

  useEffect(() => {
    void (async () => {
      setInitialLoading(true);
      setLoadError("");
      try {
        const [views, likes] = await Promise.all([
          fetchShowcaseDesigns("views"),
          fetchShowcaseDesigns("likes"),
        ]);
        setDesignsByViews(views);
        setDesignsByLikes(likes);
      } catch (err: unknown) {
        setLoadError(
          formatApiError(err, "커뮤니티 디자인을 불러오지 못했습니다."),
        );
        setDesignsByViews([]);
        setDesignsByLikes([]);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let settleId: number | undefined;

    const intervalId = window.setInterval(() => {
      setIsLoading(true);
      settleId = window.setTimeout(() => {
        setMode((prev) => (prev === "views" ? "likes" : "views"));
        setIsLoading(false);
      }, TRANSITION_MS);
    }, ROTATE_MS);

    return () => {
      window.clearInterval(intervalId);
      if (settleId !== undefined) window.clearTimeout(settleId);
    };
  }, []);

  const modeTitle =
    mode === "views" ? "조회수가 높은 디자인" : "좋아요가 많은 디자인";

  return (
    <section
      className={`mx-auto max-w-7xl border border-neutral-200 bg-neutral-50/60 px-6 py-12 md:px-10 md:py-16 ${className}`}
      aria-labelledby="member-design-showcase-title"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
            COMMUNITY
          </p>
          <h2
            id="member-design-showcase-title"
            className="mt-2 text-2xl font-semibold tracking-wide text-neutral-900 md:text-3xl"
          >
            회원 유니폼 디자인
          </h2>
          {/* 개발 안내 — 배포 전까지 숨김
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            회원이 올린 유니폼·로고 디자인을 카테고리별로 모아 보여줍니다. 아래
            목록은 조회수 순위와 좋아요 순위가 번갈아 갱신됩니다.
          </p>
          */}
        </div>
        <Link
          href="/shop/popular"
          className="shrink-0 text-sm font-medium text-neutral-900 underline-offset-4 transition hover:underline"
        >
          인기 상품 전체 보기 →
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-white px-4 py-3 md:px-5">
        <p className="text-xs font-medium text-neutral-500 md:text-sm">
          지금 보는 순위
        </p>
        <p
          className={`text-sm font-semibold text-neutral-900 transition-opacity duration-300 md:text-base ${
            isLoading ? "opacity-40" : "opacity-100"
          }`}
          aria-live="polite"
        >
          {modeTitle}
        </p>
      </div>

      {initialLoading ? (
        <p className="mt-6 text-center text-sm text-neutral-500">불러오는 중…</p>
      ) : loadError ? (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-center text-sm text-red-800">
          {loadError}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-500">
          아직 표시할 커뮤니티 디자인이 없습니다.
          <br />
          <span className="mt-2 block text-xs text-neutral-400">
            내 디자인에서 「모두 보기」로 공개한 시안만 여기에 표시됩니다.
          </span>
          <Link
            href="/user/designs"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            내 디자인 관리 →
          </Link>
        </p>
      ) : (
        <ul
          className={`mt-6 grid list-none grid-cols-1 gap-6 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 ${
            isLoading ? "opacity-50" : "opacity-100"
          }`}
          role="list"
        >
          {items.map((item) => (
            <li key={`${item.assetId}-${item.id}`} className={boardCardListItem}>
              <Link
                href={item.browseHref}
                className={`${boardCardHoverShell} block h-full`}
              >
                <article className="flex h-full flex-col overflow-hidden border border-neutral-200 bg-white transition-colors duration-500 ease-in-out hover:border-neutral-300">
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
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
