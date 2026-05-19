"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import UserAuthGate from "@/components/auth/UserAuthGate";
import ShippingAddressFields from "@/components/shipping/ShippingAddressFields";
import ShippingAddressSummary from "@/components/shipping/ShippingAddressSummary";
import { getMember, updateMemberShipping } from "@/app/lib/api/members";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { getMemberSession } from "@/lib/auth/session";
import type { MemberSession } from "@/lib/auth/types";
import {
  isShippingAddressComplete,
  shippingFromMember,
  shippingToApiBody,
  type ShippingAddressFields as ShippingValue,
} from "@/lib/shipping/format";

const emptyShipping = (): ShippingValue => ({
  receiver: "",
  phone: "",
  zipCode: "",
  addressLine1: "",
  addressLine2: "",
});

function MyPageInner() {
  const [member, setMember] = useState<MemberSession | null>(null);
  const [shipping, setShipping] = useState<ShippingValue>(emptyShipping);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

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
      return;
    }
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const { member: row } = await getMember(m.id);
        if (cancelled) return;
        setShipping(shippingFromMember(row));
      } catch {
        if (!cancelled) setError("배송지 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [member?.id]);

  async function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const m = getMemberSession();
    if (!m?.id) return;
    if (!isShippingAddressComplete(shipping)) {
      setError("수령인, 휴대폰(010 형식), 우편번호, 기본·상세 주소를 모두 입력해 주세요.");
      return;
    }
    setSaving(true);
    setError("");
    setDone("");
    try {
      await updateMemberShipping(m.id, shippingToApiBody(shipping));
      setDone("배송지를 저장했습니다. 구매 시 자동으로 채워집니다.");
    } catch {
      setError("배송지 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = member?.role === "ADMIN" ? "관리자" : "일반 회원";
  const hasShipping = isShippingAddressComplete(shipping);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-16 text-neutral-900 md:px-10 md:py-20">
      <header className="border-b border-neutral-200 pb-8">
        <p className="text-xs font-medium tracking-[0.2em] text-neutral-500">MY PAGE</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-wide md:text-4xl">마이페이지</h1>
      </header>

      <section className="mt-10 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold">계정 요약</h2>
        <p className="mt-2 text-sm text-neutral-600">
          {member?.userId ? (
            <>
              아이디 <span className="font-medium text-neutral-900">{member.userId}</span> ·{" "}
              {roleLabel}
            </>
          ) : (
            "회원 정보를 불러오는 중입니다."
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/user/designs"
            className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white"
          >
            내 디자인
          </Link>
          <Link
            href="/user/orders"
            className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-800"
          >
            주문내역
          </Link>
          <Link
            href="/user/account"
            className="rounded-md border border-neutral-300 px-4 py-2 font-medium text-neutral-800"
          >
            로그인 정보 변경
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold">배송지 관리</h2>
        <p className="mt-1 text-sm text-neutral-600">
          쇼핑몰과 같이 우편번호·기본 주소·상세 주소로 저장합니다. 구매 시 자동으로
          불러옵니다.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-neutral-500">불러오는 중…</p>
        ) : (
          <form className="mt-4 max-w-lg" onSubmit={handleShippingSubmit}>
            <ShippingAddressFields value={shipping} onChange={setShipping} />
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            {done ? <p className="mt-3 text-sm text-green-700">{done}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "저장 중…" : "배송지 저장"}
            </button>
          </form>
        )}

        {!loading && hasShipping ? (
          <div className="mt-6 max-w-lg rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-900">저장된 기본 배송지</p>
            <ShippingAddressSummary
              className="mt-2"
              receiver={shipping.receiver}
              phone={shipping.phone}
              zipCode={shipping.zipCode}
              addressLine1={shipping.addressLine1}
              addressLine2={shipping.addressLine2}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default function MyPage() {
  return (
    <UserAuthGate>
      <MyPageInner />
    </UserAuthGate>
  );
}
