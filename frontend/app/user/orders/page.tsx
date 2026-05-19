"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import UserAuthGate from "@/components/auth/UserAuthGate";
import ShippingAddressSummary from "@/components/shipping/ShippingAddressSummary";
import { getOrdersForUser, type Order } from "@/app/lib/api/orders";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { getMemberSession } from "@/lib/auth/session";
import type { MemberSession } from "@/lib/auth/types";

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("ko-KR");
}

function OrdersInner() {
  const searchParams = useSearchParams();
  const orderedId = searchParams.get("ordered");
  const [member, setMember] = useState<MemberSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshMember = useCallback(() => {
    setMember(getMemberSession());
  }, []);

  useEffect(() => {
    refreshMember();
    window.addEventListener(AUTH_CHANGED_EVENT, refreshMember);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, refreshMember);
  }, [refreshMember]);

  useEffect(() => {
    const m = getMemberSession();
    if (!m?.id) {
      setLoading(false);
      setOrders([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const list = await getOrdersForUser(m.id);
        if (!cancelled) setOrders(list);
      } catch {
        if (!cancelled) setError("주문 내역을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">ORDER HISTORY</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">주문내역</h1>
        <p className="mt-2 text-sm text-neutral-600">회원 번호 기준으로 서버에서 불러온 주문입니다.</p>
      </header>

      {orderedId ? (
        <p className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          주문이 접수되었습니다. 주문 번호{" "}
          <span className="font-mono font-medium">#{orderedId}</span>
        </p>
      ) : null}

      {loading ? (
        <p className="mt-12 text-center text-sm text-neutral-500">불러오는 중…</p>
      ) : error ? (
        <p className="mt-12 rounded-md border border-red-200 bg-red-50 py-8 text-center text-sm text-red-800">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-12 rounded-md border border-dashed border-neutral-200 bg-neutral-50 py-14 text-center text-sm text-neutral-500">
          주문 내역이 없습니다.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {orders.map((o) => (
            <li key={o.id} className="px-4 py-5 md:px-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-neutral-900">주문 #{o.id}</span>
                <span className="text-xs text-neutral-500">{formatDate(o.createTime)}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {o.status ? `상태: ${o.status}` : "상태: —"} · 총 수량 {o.quantity} ·{" "}
                <span className="font-medium text-neutral-900">
                  {o.totalPrice?.toLocaleString("ko-KR") ?? "0"}원
                </span>
              </p>
              {o.shippingReceiver || o.shippingPhone || o.shippingAddress ? (
                <div className="mt-2 rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    배송지
                  </p>
                  <ShippingAddressSummary
                    className="mt-1 text-xs"
                    receiver={o.shippingReceiver}
                    phone={o.shippingPhone}
                    zipCode={o.shippingZipCode}
                    addressLine1={o.shippingAddressLine1}
                    addressLine2={o.shippingAddressLine2}
                    shippingAddress={o.shippingAddress}
                  />
                </div>
              ) : null}
              {o.personalizationNote ? (
                <p className="mt-1 text-xs text-neutral-500">
                  인쇄: {o.personalizationNote}
                </p>
              ) : null}
              {o.items && o.items.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-neutral-600">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      품목 #{it.id} · {it.product?.name ?? `상품 ${it.product?.id ?? "—"}`} ·{" "}
                      {it.quantity}개 · {it.price?.toLocaleString("ko-KR") ?? "0"}원
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm">
        <Link href="/user/mypage" className="font-medium text-neutral-800 underline">
          ← 마이페이지
        </Link>
      </p>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <UserAuthGate>
      <Suspense
        fallback={
          <main className="mx-auto max-w-7xl px-6 py-16 text-sm text-neutral-500 md:px-10">
            불러오는 중…
          </main>
        }
      >
        <OrdersInner />
      </Suspense>
    </UserAuthGate>
  );
}
