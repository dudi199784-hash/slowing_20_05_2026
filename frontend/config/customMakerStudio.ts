/**
 * 커스텀 제작(로고·유니폼) 상단 큰 박스 배경
 * ----------------------------------------
 * - `null` 이면 기본 단색 배경(`bg-neutral-100`)만 씁니다.
 * - 실제 이미지를 쓰려면 파일을 `public/` 아래에 두고, 여기에는 **브라우저 기준 경로**만 적습니다.
 *   예: `public/images/custom/logo-hero.jpg` 저장 → 아래에 `"/images/custom/logo-hero.jpg"` 입력
 * - Next/Image 최적화 없이 CSS `background-image`로 깔아 두었기 때문에, 경로만 바꿔도 됩니다.
 */
export const customMakerStudioBoxBackgrounds = {
  /** 로고 쪽 큰 박스 (팀 로고 생성) */
  logoBox: "/images/custom/logo-box.png",
  /** 유니폼 쪽 큰 박스 (상품 디자인 생성) */
  uniformBox: "/images/custom/uniform-box.png",
};

/**
 * 유니폼 제안서 시안 — 서버 classpath 와 동일 레이아웃 (미리보기·문서용)
 * 실제 생성 시 템플릿은 백엔드 `classpath:uniform/proposal-template.png` 를 사용합니다.
 */
export const uniformProposalTemplateUrl = "/uniform/proposal-template.png";

/**
 * (레거시) 마스크 인페인트 — playground 등에서만 사용
 */
export const uniformInpaintAssetUrls = {
  templateUrl: "/uniform/template.png",
  maskUrl: "/uniform/mask.png",
} as const;
