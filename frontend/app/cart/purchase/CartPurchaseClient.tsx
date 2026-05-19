"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

import type { CartItemPlaceholder } from "@/app/cart/types";
import { getMember } from "@/app/lib/api/members";
import { createOrder } from "@/app/lib/api/orders";
import ShippingAddressFields from "@/components/shipping/ShippingAddressFields";
import { getMemberSession } from "@/lib/auth/session";
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

const PURCHASE_NAV = [
  { key: "desc" as const, label: "제품설명" },
  { key: "size" as const, label: "사이즈 안내" },
  { key: "review" as const, label: "리뷰" },
  { key: "qna" as const, label: "QnA" },
];

type TabKey = (typeof PURCHASE_NAV)[number]["key"];

const QTY_MAX = 30;
const PANEL_MIN_H = "min-h-[min(80vh,50rem)]";

function clampQuantity(n: number) {
  return Math.max(1, Math.min(QTY_MAX, n));
}

type CartPurchaseClientProps = {
  product: CartItemPlaceholder | null;
  productId: string | null;
};

type PersonalizationLine = {
  name: string;
  number: string;
};

function alignPersonalizationLines(
  qty: number,
  prev: PersonalizationLine[],
): PersonalizationLine[] {
  return Array.from({ length: qty }, (_, i) => prev[i] ?? { name: "", number: "" });
}

function formatPersonalizationNote(lines: PersonalizationLine[]): string {
  const parts = lines
    .map((line, i) => {
      const name = line.name.trim();
      const number = line.number.trim();
      if (!name && !number) return null;
      const bits = [name, number ? `#${number}` : ""].filter(Boolean).join(" ");
      return `${i + 1}벌: ${bits}`;
    })
    .filter((p): p is string => p != null);
  return parts.join(" · ");
}

function ProductImageSlot({
  imageUrl,
  title,
}: {
  imageUrl?: string;
  title: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-3">
      <div
        className="relative flex min-h-[16rem] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
        role="img"
        aria-label={imageUrl ? `${title} 시안 미리보기` : "상품 사진 없음"}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${title} 시안`}
            className="h-full min-h-[16rem] w-full object-contain object-center p-4"
          />
        ) : (
          <div className="flex min-h-[16rem] flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-neutral-500">상품 사진</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              시안 이미지를 불러오지 못했습니다. 쇼핑백에서 다시 시도해 주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPurchaseClient({
  product,
  productId,
}: CartPurchaseClientProps) {
  const router = useRouter();
  const title = product?.title ?? "알 수 없는 상품";
  const subtitle = product?.subtitle;
  const formId = useId();

  const [quantity, setQuantity] = useState(1);
  const [qtyText, setQtyText] = useState("1");
  const [personalizationLines, setPersonalizationLines] = useState<
    PersonalizationLine[]
  >([{ name: "", number: "" }]);
  const [activeTab, setActiveTab] = useState<TabKey>("desc");

  const [shipping, setShipping] = useState<ShippingValue>(emptyShipping);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingConfirmed, setShippingConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const applyQuantity = (n: number) => {
    const c = clampQuantity(n);
    setQuantity(c);
    setQtyText(String(c));
  };

  const loadShipping = useCallback(async () => {
    const m = getMemberSession();
    if (!m?.id) {
      setShippingLoading(false);
      return;
    }
    setShippingLoading(true);
    try {
      const { member } = await getMember(m.id);
      setShipping(shippingFromMember(member));
    } catch {
      setSubmitError("배송지 정보를 불러오지 못했습니다.");
    } finally {
      setShippingLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShipping();
  }, [loadShipping]);

  useEffect(() => {
    setPersonalizationLines((prev) => alignPersonalizationLines(quantity, prev));
  }, [quantity]);

  const shippingReady = isShippingAddressComplete(shipping);

  async function handlePurchase() {
    setSubmitError("");
    const session = getMemberSession();
    if (!session?.id) {
      setSubmitError("로그인 후 구매할 수 있습니다.");
      return;
    }
    if (!product?.id) {
      setSubmitError("쇼핑백 상품을 찾지 못했습니다. 쇼핑백에서 다시 시도해 주세요.");
      return;
    }
    if (!shippingReady) {
      setSubmitError(
        "수령인, 휴대폰(010 형식), 우편번호·기본·상세 주소를 모두 입력해 주세요. 마이페이지에서 저장할 수도 있습니다.",
      );
      return;
    }
    if (!shippingConfirmed) {
      setSubmitError("배송지·연락처 확인에 체크해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const note = formatPersonalizationNote(personalizationLines);
      const result = await createOrder({
        userId: session.id,
        cartIds: [product.id],
        quantity,
        ...shippingToApiBody(shipping),
        personalizationNote: note || undefined,
      });
      router.push(`/user/orders?ordered=${result.orderId}`);
    } catch {
      setSubmitError("주문 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div
        className="grid items-stretch gap-8"
        style={{ gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)" }}
      >
        {/* 상품: 항상 좌우 3:2 */}
        <div
          className={`flex min-h-0 flex-col overflow-hidden border border-neutral-200 bg-white ${PANEL_MIN_H}`}
        >
          <ProductImageSlot imageUrl={product?.imageUrl} title={title} />
        </div>

        {/* 옵션 */}
        <div className={`flex min-h-0 flex-col ${PANEL_MIN_H}`}>
          <h2 className="shrink-0 text-lg font-semibold text-neutral-900">
            구매 옵션 확인하기
          </h2>

          <div className="mt-4 shrink-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              제품명
            </p>
            <p className="mt-1 text-base font-medium text-neutral-900">{title}</p>
            {subtitle ? (
              <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
            ) : null}
          </div>

          <div className="mt-4 shrink-0">
            <p
              id={`${formId}-qty-label`}
              className="text-xs font-medium uppercase tracking-wide text-neutral-500"
            >
              제품 수량
            </p>
            <div className="mt-2 flex max-w-xs items-stretch gap-0 rounded-md border border-neutral-300 bg-white">
              <button
                type="button"
                aria-label="수량 감소"
                disabled={quantity <= 1}
                onClick={() => applyQuantity(quantity - 1)}
                className="w-10 shrink-0 text-lg font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-labelledby={`${formId}-qty-label`}
                value={qtyText}
                onChange={(e) => {
                  const v = e.target.value;
                  setQtyText(v);
                  const t = v.replace(/[^\d]/g, "");
                  if (t === "") return;
                  const n = parseInt(t, 10);
                  if (Number.isNaN(n)) return;
                  setQuantity(clampQuantity(n));
                }}
                onBlur={() => {
                  const t = qtyText.replace(/[^\d]/g, "");
                  if (t === "" || t === "0") {
                    applyQuantity(1);
                    return;
                  }
                  const n = parseInt(t, 10);
                  if (Number.isNaN(n)) applyQuantity(1);
                  else applyQuantity(n);
                }}
                className="min-w-0 flex-1 border-x border-neutral-200 py-2 text-center text-sm font-medium tabular-nums text-neutral-900 outline-none"
              />
              <button
                type="button"
                aria-label="수량 증가"
                disabled={quantity >= QTY_MAX}
                onClick={() => applyQuantity(quantity + 1)}
                className="w-10 shrink-0 text-lg font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              최대 {QTY_MAX}개까지 · 숫자를 누르면 직접 입력
            </p>
          </div>

          <div className="mt-4 shrink-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              배송 정보
            </p>
            {shippingLoading ? (
              <p className="mt-2 text-sm text-neutral-500">배송지 불러오는 중…</p>
            ) : (
              <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <ShippingAddressFields
                  compact
                  value={shipping}
                  onChange={(next) => {
                    setShipping(next);
                    setShippingConfirmed(false);
                  }}
                />
                <p className="text-xs text-neutral-500">
                  <Link href="/user/mypage" className="font-medium underline">
                    마이페이지
                  </Link>
                  에서 기본 배송지를 저장해 두면 자동으로 채워집니다.
                </p>
                <label className="flex cursor-pointer items-start gap-2 pt-1 text-sm text-neutral-800">
                  <input
                    type="checkbox"
                    checked={shippingConfirmed}
                    disabled={!shippingReady}
                    onChange={(e) => setShippingConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>위 배송지·연락처가 맞습니다.</span>
                </label>
              </div>
            )}
          </div>

          <div className="mt-3 flex min-h-0 flex-1 flex-col">
            <div className="shrink-0">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                이니셜·이름 · 등번호
                <span className="ml-1 font-normal normal-case text-neutral-400">
                  (박스 안에서만 스크롤)
                </span>
              </p>
              <div
                className="mt-2 flex h-[min(20rem,45vh)] min-h-[7.5rem] flex-col overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
                role="region"
                aria-label="이니셜·이름·등번호 입력. 줄이 많을 때 이 상자 안에서만 스크롤됩니다."
              >
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch] px-3 py-2.5 sm:px-3.5 sm:py-3">
                  <div className="space-y-4">
                    {personalizationLines.map((line, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-neutral-200 bg-white p-3"
                      >
                        <p className="text-xs font-medium text-neutral-700">
                          {i + 1}벌
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_5.5rem]">
                          <div>
                            <label
                              htmlFor={`${formId}-name-${i}`}
                              className="text-[11px] text-neutral-500"
                            >
                              이니셜 또는 이름
                            </label>
                            <input
                              id={`${formId}-name-${i}`}
                              type="text"
                              value={line.name}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPersonalizationLines((lines) => {
                                  const next = [...lines];
                                  next[i] = { ...next[i], name: v };
                                  return next;
                                });
                              }}
                              placeholder="예: J.H / 홍길동"
                              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
                              autoComplete="name"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`${formId}-number-${i}`}
                              className="text-[11px] text-neutral-500"
                            >
                              등번호
                            </label>
                            <input
                              id={`${formId}-number-${i}`}
                              type="text"
                              inputMode="numeric"
                              value={line.number}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^\d]/g, "");
                                setPersonalizationLines((lines) => {
                                  const next = [...lines];
                                  next[i] = { ...next[i], number: v };
                                  return next;
                                });
                              }}
                              placeholder="예: 7"
                              maxLength={3}
                              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex shrink-0 flex-col gap-0 pt-4">
              <p className="text-xs text-neutral-400">
                결제 없이 주문 접수만 진행됩니다. 확인 후 구매완료로 주문내역에
                기록됩니다.
              </p>
              {submitError ? (
                <p className="mt-2 text-sm text-red-600">{submitError}</p>
              ) : null}
              <button
                type="button"
                disabled={submitting || !product?.id || !shippingReady || !shippingConfirmed}
                onClick={() => void handlePurchase()}
                className="mt-3 w-full rounded-md bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "주문 처리 중…" : "구매완료"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        상품 ID{" "}
        <span className="font-mono text-neutral-700">{productId ?? "—"}</span>
      </p>

      <nav
        className="mt-16 border-b border-neutral-200"
        aria-label="상품 하단 정보"
      >
        <ul className="flex flex-wrap gap-1">
          {PURCHASE_NAV.map(({ key, label }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => setActiveTab(key)}
                className={`block border-b-2 px-3 py-3 text-sm font-medium transition ${
                  activeTab === key
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 min-h-[8rem] pb-16">
        {activeTab === "size" ? (
          <section aria-labelledby="tab-size">
            <h3 id="tab-size" className="text-lg font-semibold text-neutral-900">
              사이즈 안내
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              실제 사이즈는 제품·재고에 따라 API에서 불러올 수 있습니다. 여기는
              예시이며, 가슴둘레·기장 등 상세 치수 안내를 넣을 수 있습니다.
            </p>
          </section>
        ) : null}
        {activeTab === "desc" ? (
          <section aria-labelledby="tab-desc">
            <h3 id="tab-desc" className="text-lg font-semibold text-neutral-900">
              제품설명
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              {title}에 대한 상세 설명, 소재, 세탁 방법 등이 들어갑니다.
            </p>
          </section>
        ) : null}
        {activeTab === "qna" ? (
          <section aria-labelledby="tab-qna">
            <h3 id="tab-qna" className="text-lg font-semibold text-neutral-900">
              QnA
            </h3>
            <p className="mt-3 text-sm text-neutral-500">
              질문·답변 목록은 연동 후 표시됩니다.
            </p>
          </section>
        ) : null}
        {activeTab === "review" ? (
          <section aria-labelledby="tab-review">
            <h3
              id="tab-review"
              className="text-lg font-semibold text-neutral-900"
            >
              리뷰
            </h3>
            <p className="mt-3 text-sm text-neutral-500">
              구매자 리뷰는 연동 후 표시됩니다.
            </p>
          </section>
        ) : null}
      </div>

      <p className="pt-4">
        <Link
          href="/cart"
          className="text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          ← 쇼핑백으로
        </Link>
      </p>
    </div>
  );
}
