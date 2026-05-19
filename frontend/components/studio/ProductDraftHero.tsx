"use client";

import {
  getRecommendImageSrc,
  getStudioProduct,
  type StudioProductId,
} from "@/config/studioProducts";

type ProductDraftHeroProps = {
  productId: StudioProductId;
};

export default function ProductDraftHero({ productId }: ProductDraftHeroProps) {
  const config = getStudioProduct(productId);
  const imageSrc = getRecommendImageSrc(productId);
  const label = config?.label ?? "상품";

  return (
    <div className="studio-maker-box-wrap">
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-sm border border-neutral-200 bg-white px-6 text-center">
        {imageSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-contain object-center p-6 pt-14 md:p-10 md:pt-16"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,transparent_68%)]"
              aria-hidden
            />
          </>
        ) : (
          <span className="absolute inset-0 bg-neutral-100" aria-hidden />
        )}
        <div
          className={`relative z-10 flex max-w-lg flex-col items-center px-4 ${
            imageSrc ? "text-white" : "text-neutral-900"
          }`}
        >
          <span
            className={`text-xs font-medium uppercase tracking-[0.2em] drop-shadow-md ${
              imageSrc ? "text-white/90" : "text-neutral-500"
            }`}
          >
            {label}
          </span>
          <h3
            className={`mt-3 text-xl font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] md:text-2xl ${
              imageSrc ? "text-white" : ""
            }`}
          >
            {label} 시안 생성
          </h3>
          <p
            className={`mt-2 text-sm drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] ${
              imageSrc ? "text-white/90" : "text-neutral-600"
            }`}
          >
            {config?.shortDescription ??
              "팀 컨셉에 맞춘 맞춤 시안을 만들어 보세요."}
          </p>
        </div>
      </div>
    </div>
  );
}
