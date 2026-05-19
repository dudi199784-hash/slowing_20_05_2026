import Image from "next/image";
import Link from "next/link";

import {
  designHrefForProduct,
  getStudioProduct,
  productIntroOrder,
  studioProductTemplateUrl,
} from "@/config/studioProducts";

export default function ProductIntroPage() {
  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
          PRODUCT INTRO
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">
          상품 소개
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600">
          유니폼·축구화·키퍼 글러브·스포츠 용품 네 가지 카테고리로 맞춤 시안을
          제작합니다. 아래 템플릿은 실제 디자인 생성 시 AI가 참고하는 제안서
          양식입니다.
        </p>
      </header>

      <section className="mt-10 grid gap-8 sm:grid-cols-2">
        {productIntroOrder.map((productId) => {
          const product = getStudioProduct(productId);
          if (!product) return null;
          const templateSrc = studioProductTemplateUrl(productId);

          return (
            <article
              key={productId}
              className="flex flex-col overflow-hidden border border-neutral-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-neutral-50 p-4 md:p-6">
                <Image
                  src={templateSrc}
                  alt={`${product.label} 디자인 시안 템플릿`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 border-t border-neutral-100 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {product.label}
                </h2>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {product.introDescription}
                </p>
                <Link
                  href={designHrefForProduct(productId)}
                  className="mt-auto text-sm font-medium text-neutral-900 underline-offset-4 transition hover:underline"
                >
                  이 상품으로 시안 만들기 →
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        <Link
          href="/shop/popular"
          className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-800 transition hover:bg-neutral-50"
        >
          인기 디자인 보기
        </Link>
        <Link
          href="/cart"
          className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white transition hover:bg-neutral-800"
        >
          쇼핑백 이동
        </Link>
      </div>
    </main>
  );
}
