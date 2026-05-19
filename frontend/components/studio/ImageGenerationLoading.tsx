"use client";

import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "AI가 시안을 준비하고 있습니다…",
  "팀 컨셉과 로고를 반영하는 중입니다…",
  "제안서 템플릿에 디자인을 입히는 중입니다…",
  "고해상도 이미지를 생성하고 있습니다…",
  "완료까지 보통 30초~2분 정도 걸릴 수 있습니다.",
] as const;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}분 ${String(s).padStart(2, "0")}초`;
  return `${s}초`;
}

export function ImageGenerationSpinner({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

type ImageGenerationLoadingProps = {
  className?: string;
  /** 어두운 오버레이 위(이전 미리보기 위) */
  overlay?: boolean;
};

export default function ImageGenerationLoading({
  className = "",
  overlay = false,
}: ImageGenerationLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3500);
    const elapsedTimer = window.setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => {
      window.clearInterval(messageTimer);
      window.clearInterval(elapsedTimer);
    };
  }, []);

  const titleClass = overlay ? "text-white" : "text-neutral-900";
  const subClass = overlay ? "text-neutral-200" : "text-neutral-600";
  const metaClass = overlay ? "text-neutral-300" : "text-neutral-400";
  const trackClass = overlay ? "bg-white/25" : "bg-neutral-200";
  const barClass = overlay ? "bg-white" : "bg-neutral-800";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 px-6 py-8 text-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <ImageGenerationSpinner
        className={`h-11 w-11 border-[3px] ${overlay ? "border-white/30 border-t-white" : "border-neutral-200 border-t-neutral-900"}`}
      />
      <div className="max-w-sm">
        <p className={`text-sm font-semibold tracking-wide ${titleClass}`}>
          이미지 생성 중
        </p>
        <p
          key={messageIndex}
          className={`mt-2 text-sm leading-relaxed ${subClass}`}
        >
          {STATUS_MESSAGES[messageIndex]}
        </p>
        <p className={`mt-2 text-xs tabular-nums ${metaClass}`}>
          경과 시간 {formatElapsed(elapsed)}
        </p>
      </div>
      <div
        className={`relative h-1.5 w-full max-w-xs overflow-hidden rounded-full ${trackClass}`}
        aria-hidden
      >
        <span className={`image-gen-progress-bar absolute inset-y-0 left-0 w-2/5 rounded-full ${barClass}`} />
      </div>
    </div>
  );
}
