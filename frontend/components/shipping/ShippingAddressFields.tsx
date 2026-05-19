"use client";

import { useCallback, useEffect, useId } from "react";

import {
  formatKoreanPhone,
  formatZipCode,
  type ShippingAddressFields as ShippingValue,
} from "@/lib/shipping/format";

const DAUM_POSTCODE_SRC =
  "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: { oncomplete: (data: DaumPostcodeData) => void }) => {
        open: () => void;
      };
    };
  }
}

let daumScriptPromise: Promise<void> | null = null;

function loadDaumPostcodeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.daum?.Postcode) return Promise.resolve();
  if (daumScriptPromise) return daumScriptPromise;
  daumScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${DAUM_POSTCODE_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("postcode")));
      return;
    }
    const script = document.createElement("script");
    script.src = DAUM_POSTCODE_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("postcode"));
    document.head.appendChild(script);
  });
  return daumScriptPromise;
}

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none ring-neutral-900 focus:ring-2 disabled:bg-neutral-100 disabled:text-neutral-500";

const labelClass = "text-sm font-medium text-neutral-800";
const hintClass = "text-[11px] font-normal text-neutral-500";

type ShippingAddressFieldsProps = {
  value: ShippingValue;
  onChange: (next: ShippingValue) => void;
  /** 작은 라벨 (구매 옵션 패널) */
  compact?: boolean;
  disabled?: boolean;
};

export default function ShippingAddressFields({
  value,
  onChange,
  compact = false,
  disabled = false,
}: ShippingAddressFieldsProps) {
  const formId = useId();
  const label = compact
    ? (text: string) => (
        <span className="text-[11px] text-neutral-500">{text}</span>
      )
    : (text: string) => <span className={labelClass}>{text}</span>;

  const patch = useCallback(
    (partial: Partial<ShippingValue>) => onChange({ ...value, ...partial }),
    [onChange, value],
  );

  useEffect(() => {
    void loadDaumPostcodeScript().catch(() => {
      /* 주소 검색 없이 직접 입력 가능 */
    });
  }, []);

  async function openAddressSearch() {
    try {
      await loadDaumPostcodeScript();
    } catch {
      window.alert("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (!window.daum?.Postcode) {
      window.alert("주소 검색을 사용할 수 없습니다.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const road =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        patch({
          zipCode: formatZipCode(data.zonecode),
          addressLine1: road,
        });
      },
    }).open();
  }

  return (
    <div className="space-y-3">
      <div>
        {label("수령인")}
        <input
          id={`${formId}-receiver`}
          type="text"
          value={value.receiver}
          disabled={disabled}
          onChange={(e) => patch({ receiver: e.target.value })}
          placeholder="받으실 분 성함"
          className={inputClass}
          autoComplete="name"
        />
      </div>

      <div>
        {label("휴대폰 번호")}
        <p className={hintClass}>숫자만 입력해도 자동으로 하이픈이 붙습니다.</p>
        <input
          id={`${formId}-phone`}
          type="tel"
          inputMode="numeric"
          value={value.phone}
          disabled={disabled}
          onChange={(e) => patch({ phone: formatKoreanPhone(e.target.value) })}
          placeholder="010-0000-0000"
          className={inputClass}
          autoComplete="tel"
          maxLength={13}
        />
      </div>

      <div>
        {label("주소")}
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            id={`${formId}-zip`}
            type="text"
            inputMode="numeric"
            value={value.zipCode}
            readOnly
            disabled={disabled}
            placeholder="우편번호"
            className={`${inputClass} mt-0 w-28 shrink-0 tabular-nums`}
            aria-label="우편번호"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => void openAddressSearch()}
            className="shrink-0 rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            주소 찾기
          </button>
        </div>
        <input
          id={`${formId}-addr1`}
          type="text"
          value={value.addressLine1}
          readOnly
          disabled={disabled}
          placeholder="주소 찾기로 기본 주소를 입력하세요"
          className={inputClass}
          aria-label="기본 주소"
        />
        <input
          id={`${formId}-addr2`}
          type="text"
          value={value.addressLine2}
          disabled={disabled}
          onChange={(e) => patch({ addressLine2: e.target.value })}
          placeholder="상세 주소 (동, 호수, 공동현관 비밀번호 등)"
          className={inputClass}
          autoComplete="address-line2"
          aria-label="상세 주소"
        />
      </div>
    </div>
  );
}
