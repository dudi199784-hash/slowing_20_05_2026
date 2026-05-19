"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import type { MediaSource } from "@/lib/media/types";

type MediaSlotProps = {
  media: MediaSource | null;
  /** 부모는 `relative` + 높이가 잡혀 있어야 `fill` 이미지가 맞게 보입니다 */
  className?: string;
  sizes?: string;
  /** 소스 없을 때 */
  fallback?: ReactNode;
  /** 이미지/비디오 object-fit */
  objectClassName?: string;
  /** 네비 아이콘 등 작은 영역 — 빈 슬롯일 때 최소 높이 제약 완화 */
  dense?: boolean;
};

export default function MediaSlot({
  media,
  className = "",
  sizes = "100vw",
  fallback = null,
  objectClassName = "object-cover",
  dense = false,
}: MediaSlotProps) {
  const hasSrc = Boolean(media && "src" in media && media.src);

  if (media?.kind === "image" && hasSrc) {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          priority={media.priority}
          unoptimized={media.unoptimized}
          sizes={sizes}
          className={objectClassName}
        />
      </div>
    );
  }

  if (media?.kind === "video" && hasSrc) {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
        <video
          className={`h-full w-full ${objectClassName}`}
          poster={media.poster}
          controls={media.controls ?? false}
          muted={media.muted ?? true}
          loop={media.loop ?? true}
          playsInline={media.playsInline ?? true}
          autoPlay={media.autoPlay ?? false}
        >
          <source src={media.src} />
        </video>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-neutral-50 text-neutral-500 ${
        dense ? "" : "min-h-[120px]"
      } ${className}`}
    >
      {fallback}
    </div>
  );
}
