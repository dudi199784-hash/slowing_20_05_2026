import type { MediaSource } from "@/lib/media/types";

/** 히어로(ScreenVideo) 전체 영역 */
export const heroMedia: MediaSource = {
  kind: "image",
  src: "/media/hero.png?v=3",
  alt: "SLOWIND Tailored Series — 맞춤 유니폼 메인 비주얼",
  priority: true,
  unoptimized: true,
};

/** Recommend 카드별 (홈 4열) */
export const recommendMedia: {
  id: "cleats" | "uniform" | "keeper" | "sports";
  label: string;
  media: MediaSource | null;
}[] = [
  {
    id: "cleats",
    label: "축구화",
    media: {
      kind: "image",
      src: "/media/recommend/cleats.png",
      alt: "SLOWIND 맞춤 축구화",
      unoptimized: true,
    },
  },
  {
    id: "uniform",
    label: "유니폼",
    media: {
      kind: "image",
      src: "/media/recommend/uniform.png",
      alt: "SLOWIND 맞춤 유니폼",
      unoptimized: true,
    },
  },
  {
    id: "keeper",
    label: "키퍼 글로브",
    media: {
      kind: "image",
      src: "/media/recommend/keeper.png",
      alt: "SLOWIND 키퍼 글로브",
      unoptimized: true,
    },
  },
  {
    id: "sports",
    label: "스포츠 용품",
    media: {
      kind: "image",
      src: "/media/recommend/sports.png",
      alt: "SLOWIND 스포츠 용품",
      unoptimized: true,
    },
  },
];

/** CustomMaker 카드별 */
export const customMakerMedia = {
  logo: null as MediaSource | null,
  product: null as MediaSource | null,
};

/** Nav 우측 액션 — 쇼핑백 · 멤버 · 메뉴 (표시 순서) */
export const navMedia = {
  cart: {
    kind: "image",
    src: "/media/nav/cart.png?v=3",
    alt: "",
    unoptimized: true,
  } satisfies MediaSource,
  search: null as MediaSource | null,
  user: {
    kind: "image",
    src: "/media/nav/user.png?v=3",
    alt: "",
    unoptimized: true,
  } satisfies MediaSource,
  menu: {
    kind: "image",
    src: "/media/nav/menu.png?v=3",
    alt: "",
    unoptimized: true,
  } satisfies MediaSource,
};
