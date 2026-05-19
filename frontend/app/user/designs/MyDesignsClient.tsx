"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { formatApiError } from "@/app/lib/api/formatApiError";
import {
  fetchMyLogoAssets,
  logoAssetImageUrl,
  titleFromLogoPrompt,
  updateLogoAssetVisibility,
  type LogoAssetVisibility,
  type MyLogoAssetItem,
} from "@/app/lib/api/logoAssets";
import { fetchSessionStatus } from "@/app/lib/api/members";
import AddToCartConfirmDialog from "@/components/shop/AddToCartConfirmDialog";
import { postCartLine } from "@/lib/api/cart";
import { isCartableDesignCategory } from "@/lib/designCategories";
import { clearSession, reconcileAuthSessionFromServer } from "@/lib/auth/session";

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const VISIBILITY_OPTIONS: { value: LogoAssetVisibility; label: string }[] = [
  { value: "PRIVATE", label: "나만 보기" },
  { value: "PUBLIC", label: "모두 보기" },
];

export default function MyDesignsClient() {
  const [items, setItems] = useState<MyLogoAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartDialogTitle, setCartDialogTitle] = useState<string | null>(null);
  const [cartError, setCartError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sessionResult = await fetchSessionStatus();
      if (
        !sessionResult.ok ||
        !sessionResult.data.valid ||
        !reconcileAuthSessionFromServer(sessionResult.data)
      ) {
        clearSession();
        setError(
          "로그인 정보가 일치하지 않습니다. 로그아웃 후 다시 로그인해 주세요.",
        );
        setItems([]);
        return;
      }
      const list = await fetchMyLogoAssets();
      setItems(list);
    } catch (err: unknown) {
      setError(formatApiError(err, "저장한 디자인을 불러오지 못했습니다."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleVisibilityChange(
    item: MyLogoAssetItem,
    visibility: LogoAssetVisibility,
  ) {
    setUpdatingId(item.id);
    setError("");
    try {
      const updated = await updateLogoAssetVisibility(item.id, visibility);
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, ...updated } : row)),
      );
    } catch (err: unknown) {
      setError(formatApiError(err, "공개 설정을 변경하지 못했습니다."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAddToCart(item: MyLogoAssetItem) {
    setCartError("");
    if (!isCartableDesignCategory(String(item.category))) {
      setCartError(
        "로고는 쇼핑백에 담을 수 없습니다. 유니폼 시안만 담아 주세요.",
      );
      return;
    }
    if (item.designId == null || item.productId == null) {
      setCartError(
        "이 디자인은 장바구니에 연결할 수 없습니다. 스튜디오에서 다시 저장해 주세요.",
      );
      return;
    }
    try {
      await postCartLine({
        designId: item.designId,
        productId: item.productId,
        category: String(item.category),
      });
      setCartDialogTitle(titleFromLogoPrompt(item.prompt));
    } catch (err: unknown) {
      setCartError(formatApiError(err, "쇼핑백에 담지 못했습니다."));
    }
  }

  return (
    <>
      {loading ? (
        <p className="mt-10 text-sm text-neutral-500">불러오는 중…</p>
      ) : error ? (
        <p className="mt-10 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-md border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center text-sm text-neutral-500">
          저장한 디자인이 없습니다.
          <br />
          디자인 스튜디오에서 로고·유니폼 시안을 만든 뒤 저장해 주세요.
        </p>
      ) : (
        <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const src = logoAssetImageUrl(item.accessPath);
            const canCart =
              isCartableDesignCategory(String(item.category)) &&
              item.designId != null &&
              item.productId != null;
            const isLogo = !isCartableDesignCategory(String(item.category));
            const isPublic = item.visibility === "PUBLIC";
            return (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <div className="relative aspect-[4/3] bg-neutral-100 p-3">
                  {isPublic ? (
                    <span className="absolute right-2 top-2 rounded bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
                      구경하기 공개
                    </span>
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={titleFromLogoPrompt(item.prompt)}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    {item.category}
                  </span>
                  <h2 className="line-clamp-2 text-sm font-semibold text-neutral-900">
                    {titleFromLogoPrompt(item.prompt)}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    저장일 {formatSavedAt(item.createdAt)}
                  </p>
                  <label className="text-xs font-medium text-neutral-700">
                    공개 설정
                    <select
                      className="mt-1 w-full rounded border border-neutral-300 bg-white px-2 py-2 text-sm"
                      value={item.visibility ?? "PRIVATE"}
                      disabled={updatingId === item.id}
                      onChange={(e) =>
                        void handleVisibilityChange(
                          item,
                          e.target.value as LogoAssetVisibility,
                        )
                      }
                    >
                      {VISIBILITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {isPublic ? (
                    <Link
                      href={`/shop/browse/${item.id}`}
                      className="text-center text-xs font-medium text-neutral-700 underline-offset-2 hover:underline"
                    >
                      구경하기에서 보기
                    </Link>
                  ) : null}
                  {isLogo ? (
                    <p className="mt-auto text-xs text-neutral-500">
                      로고는 유니폼 시안 제작용입니다. 쇼핑백에는 유니폼
                      시안만 담을 수 있습니다.
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={!canCart}
                      onClick={() => void handleAddToCart(item)}
                      className="mt-auto w-full rounded-md border border-neutral-900 bg-neutral-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      쇼핑백에 담기
                    </button>
                  )}
                  {!isLogo && !canCart ? (
                    <p className="text-xs text-amber-700">
                      예전에 저장한 항목입니다. 다시 저장하면 담을 수 있습니다.
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {cartError ? (
        <p className="mt-4 text-center text-sm text-red-700">{cartError}</p>
      ) : null}

      <AddToCartConfirmDialog
        open={cartDialogTitle !== null}
        productTitle={cartDialogTitle ?? ""}
        onClose={() => setCartDialogTitle(null)}
      />
    </>
  );
}
