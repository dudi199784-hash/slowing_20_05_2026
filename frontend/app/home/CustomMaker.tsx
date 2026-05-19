import type { StudioProductId } from "@/config/studioProducts";

import CustomMakerInteractive from "./CustomMakerInteractive";

type CustomMakerProps = {
  /** 쇼핑백 등 다른 페이지 하단에 붙일 때 홈과 동일 `mt-20` 중복 방지 */
  noTopMargin?: boolean;
  /** `/design?product=uniform` 등 — 시안 상품 초기 선택 */
  initialProduct?: StudioProductId;
  /** 디자인 스튜디오 — 축구화·유니폼·키퍼 장갑·스포츠 용품 선택 UI */
  showProductPicker?: boolean;
};

export default function CustomMaker({
  noTopMargin,
  initialProduct = "uniform",
  showProductPicker = false,
}: CustomMakerProps) {
  return (
    <section
      className={`mx-auto w-full max-w-7xl px-6 pb-20 md:px-10 ${
        noTopMargin ? "mt-0" : "mt-20"
      }`}
      aria-labelledby="custom-maker-title"
    >
      <h2
        id="custom-maker-title"
        className="mb-6 flex justify-center text-lg font-semibold tracking-wide md:text-xl"
      >
        커스텀 제작
      </h2>
      <CustomMakerInteractive
        initialProduct={initialProduct}
        showProductPicker={showProductPicker}
      />
    </section>
  );
}
