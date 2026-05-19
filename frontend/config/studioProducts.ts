import { uniformProposalTemplateUrl } from "@/config/customMakerStudio";
import { recommendMedia } from "@/config/media";

/** Recommend 카드 id · URL `?product=` 과 동일 */
export type StudioProductId = "cleats" | "uniform" | "keeper" | "sports";

export type StudioProductConfig = {
  id: StudioProductId;
  label: string;
  /** DB `product.category` · `logo_asset.category` */
  saveCategory: string;
  shortDescription: string;
  /** 상품 소개 페이지 본문 */
  introDescription: string;
};

/** 상품 소개 · 홈 노출 순서 */
export const productIntroOrder: StudioProductId[] = [
  "uniform",
  "cleats",
  "keeper",
  "sports",
];

export const studioProducts: StudioProductConfig[] = [
  {
    id: "cleats",
    label: "축구화",
    saveCategory: "축구화",
    shortDescription: "팀 컨셉에 맞춘 축구화 시안",
    introDescription:
      "맞춤 축구화 제안서 템플릿 위에 팀명·컨셉을 반영한 제품 시안을 만듭니다. 정면·측면이 보이는 스튜디오 제품 사진 형식으로 생성됩니다.",
  },
  {
    id: "uniform",
    label: "유니폼",
    saveCategory: "유니폼",
    shortDescription: "레퍼런스 팀·로고 반영 유니폼 제안서",
    introDescription:
      "레퍼런스 팀의 홈·어웨이 스타일과 팀 로고를 반영한 유니폼 제안서 시안입니다. 상의·하의·로고 배치까지 한 장의 제안서 형식으로 확인할 수 있습니다.",
  },
  {
    id: "keeper",
    label: "키퍼 글러브",
    saveCategory: "키퍼장갑",
    shortDescription: "골키퍼 장갑 디자인 시안",
    introDescription:
      "골키퍼 글러브 전용 제안서 템플릿에 팀 색상과 로고를 입힌 시안입니다. 저장한 유니폼 시안을 참조하면 색·로고 스타일을 함께 맞출 수 있습니다.",
  },
  {
    id: "sports",
    label: "스포츠 용품",
    saveCategory: "스포츠용품",
    shortDescription: "팀 컨셉에 맞춘 축구공 시안",
    introDescription:
      "축구공 등 스포츠 용품 제안서 템플릿 위에 팀 컨셉을 반영한 시안입니다. 유니폼 시안을 선택하면 팀 색상과 로고를 용품 디자인에 함께 적용합니다.",
  },
];

const productById = new Map(studioProducts.map((p) => [p.id, p]));

export function getStudioProduct(
  id: StudioProductId | string | null | undefined,
): StudioProductConfig | null {
  if (!id) return null;
  return productById.get(id as StudioProductId) ?? null;
}

export function parseStudioProductParam(
  raw: string | null | undefined,
): StudioProductId | null {
  if (!raw) return null;
  const t = raw.trim() as StudioProductId;
  return productById.has(t) ? t : null;
}

export function designHrefForProduct(id: StudioProductId): string {
  return `/design?product=${encodeURIComponent(id)}`;
}

/** 홈 Recommend 카드와 동일한 상품 이미지 경로 */
export function getRecommendImageSrc(
  productId: StudioProductId,
): string | null {
  const item = recommendMedia.find((m) => m.id === productId);
  const media = item?.media;
  if (media?.kind === "image" && media.src) return media.src;
  return null;
}

/** 제안서 템플릿 미리보기 (public) — 유니폼은 별도 */
export function productProposalTemplateUrl(
  productId: StudioProductId,
): string | null {
  if (productId === "uniform") return null;
  return `/product/${productId}-proposal-template.png`;
}

/** 디자인 시안 생성에 쓰는 제안서 템플릿 이미지 (상품 소개·미리보기 공용) */
export function studioProductTemplateUrl(
  productId: StudioProductId,
): string {
  if (productId === "uniform") return uniformProposalTemplateUrl;
  return productProposalTemplateUrl(productId) ?? "";
}

export function buildProductDraftPrompt(
  productId: StudioProductId,
  teamName: string,
  notes?: string,
): string {
  const team = teamName.trim() || "팀";
  const extra = notes?.trim() ? `, ${notes.trim()}` : "";
  const label = getStudioProduct(productId)?.label ?? productId;
  const base = `[${label} 시안] 팀명: ${team}${extra}`;
  switch (productId) {
    case "cleats":
      return `${base}. 프로페셔널 맞춤 축구화 제품 시안, 정면·측면이 보이는 스튜디오 촬영 느낌, 흰 배경, 고해상도 제품 사진.`;
    case "keeper":
      return `${base}. 키퍼 글러브 제안서 템플릿 형식 시안. 유니폼 시안을 선택하면 색상·로고를 함께 반영합니다.`;
    case "sports":
      return `${base}. 축구공 제안서 템플릿 형식 시안. 유니폼 시안을 선택하면 색상·로고를 함께 반영합니다.`;
    case "uniform":
      return base;
    default:
      return base;
  }
}
