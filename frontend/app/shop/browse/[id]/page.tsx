import Link from "next/link";

import BrowseDetailClient from "./BrowseDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BrowseDetailPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  const valid = Number.isFinite(id) && id > 0;

  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-6">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">
          BROWSE
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-wide md:text-3xl">
          디자인 구경
        </h1>
      </header>

      {valid ? (
        <BrowseDetailClient id={id} />
      ) : (
        <p className="mt-12 text-sm text-neutral-500">잘못된 주소입니다.</p>
      )}

      <p className="mt-12 text-center text-sm text-neutral-500">
        <Link href="/shop/browse" className="underline-offset-4 hover:underline">
          구경하기 목록
        </Link>
      </p>
    </main>
  );
}
