import Link from "next/link";

type CustomProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function CustomProductDetailPage({
  params,
}: CustomProductPageProps) {
  const { productId } = await params;
  const decoded = decodeURIComponent(productId);

  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
        CUSTOM
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-wide md:text-3xl">
        커스텀 제품 상세 · 수정
      </h1>
      <p className="mt-4 text-sm text-neutral-600">
        에디터·옵션 선택 UI는 이후 연동합니다. 상품 식별자:{" "}
        <span className="font-mono text-neutral-800">{decoded}</span>
      </p>
      <p className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link
          href="/shop/popular"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          ← 인기 상품
        </Link>
        <Link
          href="/cart"
          className="font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          쇼핑백
        </Link>
      </p>
    </main>
  );
}
