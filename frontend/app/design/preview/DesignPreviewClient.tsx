"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { formatApiError } from "@/app/lib/api/formatApiError";
import { http } from "@/app/lib/api/http";
import { saveLogoAsset } from "@/app/lib/api/logoAssets";
import { normalizeDesignCategory } from "@/lib/designCategories";
import {
  loadGeneratedPreviewAsync,
  patchGeneratedPreview,
  type GeneratedPreviewRecord,
} from "@/lib/customMaker/generatedPreview";

export default function DesignPreviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewId = searchParams.get("id");

  const [record, setRecord] = useState<GeneratedPreviewRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!previewId) {
      setRecord(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void loadGeneratedPreviewAsync(previewId).then((loaded) => {
      if (!cancelled) {
        setRecord(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [previewId]);

  async function handleSave() {
    if (!record?.b64Png) {
      setError("저장할 이미지 데이터가 없습니다. 스튜디오에서 다시 생성해 주세요.");
      return;
    }
    setError("");
    setSaveMessage("");
    setSaving(true);
    try {
      const { id, accessPath } = await saveLogoAsset({
        prompt: record.promptSummary,
        b64Png: record.b64Png,
        category: normalizeDesignCategory(record.category),
      });
      const base = (http.defaults.baseURL ?? "").replace(/\/$/, "");
      const fileUrl = `${base}${accessPath}`;
      const next = patchGeneratedPreview(record.id, {
        savedAssetId: id,
        savedAccessPath: accessPath,
        previewSrc: fileUrl,
      });
      if (next) setRecord(next);
      setSaveMessage(
        `디자인이 저장되었습니다. (id: ${id}) · 마이페이지 「내 디자인」에서 확인할 수 있습니다.`,
      );
    } catch (err: unknown) {
      setError(formatApiError(err, "디자인 저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  const apiBase = (http.defaults.baseURL ?? "").replace(/\/$/, "");
  const displaySrc = record
    ? record.savedAccessPath
      ? `${apiBase}${record.savedAccessPath}`
      : record.previewSrc
    : null;

  const isSaved = Boolean(record?.savedAssetId);

  if (loading) {
    return (
      <p className="mt-12 text-sm text-neutral-500">미리보기를 불러오는 중…</p>
    );
  }

  if (!previewId || !record) {
    return (
      <div className="mt-12 rounded-md border border-amber-200 bg-amber-50 px-4 py-8 text-center text-sm text-amber-950">
        <p className="font-medium">미리보기를 찾을 수 없습니다.</p>
        <p className="mt-2 text-xs text-amber-800/90">
          생성 직후 「자세히 보기」로 들어와 주세요. 이미지가 커서 저장에 실패했거나
          다른 탭·브라우저에서는 보이지 않을 수 있습니다.
        </p>
        <Link
          href="/design"
          className="mt-4 inline-block rounded bg-neutral-900 px-4 py-2 text-xs font-medium text-white"
        >
          디자인 스튜디오로
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8 lg:mt-10">
      <div className="flex min-h-[min(72vh,820px)] w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 p-4 md:min-h-[min(78vh,900px)] md:p-8">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt={record.title}
            className="max-h-[min(85vh,880px)] w-full object-contain"
          />
        ) : (
          <span className="text-neutral-500">이미지 없음</span>
        )}
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-3 text-sm text-neutral-600">
        <p>
          <span className="font-medium text-neutral-800">종류</span> ·{" "}
          {record.category}
        </p>
        <p className="whitespace-pre-wrap break-words">
          <span className="font-medium text-neutral-800">설명</span>
          <br />
          {record.promptSummary}
        </p>
        {isSaved && record.savedAssetId ? (
          <p className="text-xs text-green-700">
            저장됨 · asset id {record.savedAssetId}
          </p>
        ) : null}
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={saving || !record.b64Png || isSaved}
          onClick={() => void handleSave()}
          className="flex-1 rounded-md border border-neutral-400 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-40"
        >
          {saving
            ? "저장 중…"
            : isSaved
              ? "저장 완료"
              : "디자인 저장하기"}
        </button>
        <Link
          href="/user/designs"
          className="flex-1 rounded-md bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          내 디자인 · 주문
        </Link>
      </div>

      {!record.b64Png ? (
        <p className="mx-auto max-w-2xl text-center text-xs text-amber-700">
          URL로만 받은 이미지는 서버 저장이 불가합니다. 스튜디오에서 다시 생성해
          주세요.
        </p>
      ) : null}

      {saveMessage ? (
        <p className="mx-auto max-w-2xl break-all text-center text-xs text-green-700">
          {saveMessage}
        </p>
      ) : null}
      {error ? (
        <pre className="mx-auto max-w-2xl overflow-auto rounded bg-red-50 p-3 text-xs text-red-800">
          {error}
        </pre>
      ) : null}

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          ← 이전
        </button>
        <Link
          href="/design"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          디자인 스튜디오
        </Link>
      </div>
    </div>
  );
}
