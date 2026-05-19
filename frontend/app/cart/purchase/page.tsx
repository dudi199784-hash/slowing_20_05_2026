import { Suspense } from "react";

import CartPurchasePageClient from "./CartPurchasePageClient";

export default function CartPurchasePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-6 py-16 text-sm text-neutral-500 md:px-10">
          불러오는 중…
        </main>
      }
    >
      <CartPurchasePageClient />
    </Suspense>
  );
}
