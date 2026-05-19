"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  editUniformInpaint,
  generateOpenAiImage,
} from "@/app/lib/api/openai";
import { http } from "@/app/lib/api/http";
import { saveLogoAsset } from "@/app/lib/api/logoAssets";
import ImageGenerationLoading, {
  ImageGenerationSpinner,
} from "@/components/studio/ImageGenerationLoading";
import { uniformInpaintAssetUrls } from "@/config/customMakerStudio";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/session";

export type AiImagePlaygroundProps = {
  /** 같은 페이지에 두 개일 때 label/for/id 충돌 방지 */
  instanceId: string;
  heading: string;
  previewAreaLabel: string;
  placeholder: string;
  defaultPrompt: string;
  previewAlt: string;
  rootClassName?: string;
  /** 로고: 텍스트 생성 / 유니폼: 틀+마스크 인페인트 */
  imageMode?: "generate" | "uniform-inpaint";
  /** 커스텀 제작 카드 안: 바깥 테두리·여백 최소화 */
  variant?: "default" | "embedded";
};

export default function AiImagePlayground({
  instanceId,
  heading,
  previewAreaLabel,
  placeholder,
  defaultPrompt,
  previewAlt,
  rootClassName = "mt-4",
  imageMode = "generate",
  variant = "default",
}: AiImagePlaygroundProps) {
  const [authed, setAuthed] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [lastB64Png, setLastB64Png] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const titleId = `ai-playground-title-${instanceId}`;
  const promptId = `ai-playground-prompt-${instanceId}`;

  const syncAuth = useCallback(() => {
    setAuthed(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
  }, [syncAuth]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaveMessage("");
    setPreviewSrc(null);
    setLastB64Png(null);
    setLoading(true);
    try {
      let data;
      if (imageMode === "uniform-inpaint") {
        const origin = window.location.origin;
        const templateUrl = new URL(uniformInpaintAssetUrls.templateUrl, origin).href;
        const maskUrl = new URL(uniformInpaintAssetUrls.maskUrl, origin).href;
        const [tRes, mRes] = await Promise.all([
          fetch(templateUrl, { cache: "no-store" }),
          fetch(maskUrl, { cache: "no-store" }),
        ]);
        if (!tRes.ok || !mRes.ok) {
          setError(
            `템플릿/마스크를 불러오지 못했습니다. (${uniformInpaintAssetUrls.templateUrl}, ${uniformInpaintAssetUrls.maskUrl})`,
          );
          return;
        }
        const [templateBlob, maskBlob] = await Promise.all([
          tRes.blob(),
          mRes.blob(),
        ]);
        data = await editUniformInpaint({ prompt, template: templateBlob, mask: maskBlob });
      } else {
        data = await generateOpenAiImage({ prompt });
      }
      if (data.b64Json) {
        setLastB64Png(data.b64Json);
        setPreviewSrc(`data:image/png;base64,${data.b64Json}`);
      } else if (data.imageUrl) {
        setLastB64Png(null);
        setPreviewSrc(data.imageUrl);
      } else {
        setError("응답에 이미지 데이터(b64Json / imageUrl)가 없습니다.");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? JSON.stringify(
              (err as { response?: { data?: unknown } }).response?.data ??
                "요청 실패",
            )
          : "이미지 생성 요청 실패";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!lastB64Png) return;
    setError("");
    setSaveMessage("");
    setSaving(true);
    try {
      const { id, accessPath } = await saveLogoAsset({
        prompt,
        b64Png: lastB64Png,
        category: "로고",
      });
      const base = (http.defaults.baseURL ?? "").replace(/\/$/, "");
      const fileUrl = `${base}${accessPath}`;
      setSaveMessage(`저장됨 (id: ${id}) · ${fileUrl}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? JSON.stringify(
              (err as { response?: { data?: unknown } }).response?.data ??
                "저장 실패",
            )
          : "이미지 저장 요청 실패";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const embedded = variant === "embedded";
  const outerClass = embedded
    ? `flex h-full min-h-0 flex-col ${rootClassName}`.trim()
    : `rounded-lg border border-neutral-300 p-4 dark:border-neutral-600 ${rootClassName}`.trim();

  const Tag = embedded ? "div" : "section";

  return (
    <Tag className={outerClass} aria-labelledby={titleId} role="region">
      <h2
        id={titleId}
        className={
          embedded
            ? "mb-3 text-base font-semibold tracking-wide text-neutral-900"
            : "mb-4 text-lg font-semibold"
        }
      >
        {heading}
      </h2>
      {!authed ? (
        <div
          className={
            embedded
              ? "rounded-md border border-amber-200 bg-amber-50 px-3 py-4 text-center text-xs text-amber-950"
              : "rounded-md border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
          }
        >
          <p className="font-medium">로그인 후 이용할 수 있습니다.</p>
          {!embedded ? (
            <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/90">
              이미지 생성·저장은 회원 인증(JWT)이 필요합니다.
            </p>
          ) : null}
          <Link
            href="/login"
            className={
              embedded
                ? "mt-3 inline-block rounded bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white"
                : "mt-4 inline-block rounded bg-neutral-900 px-4 py-2 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
            }
          >
            로그인하기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
              {previewAreaLabel}
            </p>
            <div
              className="relative flex min-h-[min(280px,42vh)] w-full items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 p-3 dark:border-neutral-700 dark:bg-neutral-800 md:min-h-[320px]"
              aria-busy={loading}
            >
              {!loading && previewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- 동적 data URL / 외부 URL
                <img
                  src={previewSrc}
                  alt={previewAlt}
                  className="max-h-[min(360px,50vh)] w-full object-contain"
                />
              ) : !loading ? (
                <span className="text-neutral-500 dark:text-neutral-400">
                  {placeholder}
                </span>
              ) : null}
              {loading ? (
                <>
                  {previewSrc ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewSrc}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-contain opacity-25 blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-neutral-900/40" aria-hidden />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800"
                      aria-hidden
                    />
                  )}
                  <ImageGenerationLoading
                    overlay={Boolean(previewSrc)}
                    className="relative z-10 w-full"
                  />
                </>
              ) : null}
            </div>
            <button
              type="button"
              disabled={!lastB64Png || saving || loading}
              onClick={handleSave}
              className="mt-4 w-full rounded border border-neutral-400 px-3 py-2 text-sm disabled:opacity-40 dark:border-neutral-500"
            >
              {saving ? "저장 중…" : "로컬 디스크 + DB에 저장"}
            </button>
            {!lastB64Png && previewSrc ? (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                URL로만 받은 이미지는 base64가 없어 이 저장 API를 쓸 수 없습니다. 생성 응답에
                b64Json이 있을 때만 저장됩니다.
              </p>
            ) : null}
            {saveMessage ? (
              <p className="mt-2 break-all text-xs text-green-700 dark:text-green-400">
                {saveMessage}
              </p>
            ) : null}
          </div>

          <div className="w-full border-t border-neutral-200 pt-6 dark:border-neutral-600">
            <form onSubmit={handleGenerate} className="flex flex-col gap-3">
              <label className="text-sm font-medium" htmlFor={promptId}>
                프롬프트
              </label>
              <textarea
                id={promptId}
                className="min-h-[100px] w-full rounded border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {loading ? (
                  <>
                    <ImageGenerationSpinner className="h-4 w-4" />
                    생성 중…
                  </>
                ) : imageMode === "uniform-inpaint" ? (
                  "틀 유지 · 마스크 영역만 인페인트"
                ) : (
                  "백엔드로 이미지 생성 요청"
                )}
              </button>
            </form>
            {imageMode === "uniform-inpaint" ? (
              <p className="mt-2 text-xs text-neutral-500">
                파일 경로:{" "}
                <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
                  {uniformInpaintAssetUrls.templateUrl}
                </code>
                ,{" "}
                <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
                  {uniformInpaintAssetUrls.maskUrl}
                </code>{" "}
                (<code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
                  config/customMakerStudio.ts
                </code>{" "}
                의 uniformInpaintAssetUrls). mask는 알파로 편집 영역을 지정하세요.
              </p>
            ) : null}
            {error ? (
              <pre className="mt-3 max-h-40 overflow-auto rounded bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </pre>
            ) : null}
          </div>
        </div>
      )}
    </Tag>
  );
}
