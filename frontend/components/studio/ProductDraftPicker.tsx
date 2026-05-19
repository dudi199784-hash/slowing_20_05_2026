"use client";

import {
  studioProducts,
  type StudioProductId,
} from "@/config/studioProducts";

type ProductDraftPickerProps = {
  selected: StudioProductId;
  onSelect: (id: StudioProductId) => void;
};

export default function ProductDraftPicker({
  selected,
  onSelect,
}: ProductDraftPickerProps) {
  return (
    <div className="flex flex-col gap-2" role="tablist" aria-label="시안 상품">
      <span className="text-center text-xs font-medium tracking-wide text-neutral-500">
        시안 상품 선택
      </span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {studioProducts.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(p.id)}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
              }`}
            >
              <span className="block text-sm font-semibold">{p.label}</span>
              <span
                className={`mt-1 block text-[11px] leading-snug ${
                  active ? "text-white/80" : "text-neutral-500"
                }`}
              >
                {p.shortDescription}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
