/**
 * 로고 생성 고정 프롬프트 — 사용자는 팀 이름만 입력합니다.
 */
export function buildLogoGenerationPrompt(teamName: string): string {
  const name = teamName.trim();
  return [
    "간지나는 축구팀 로고 하나만 제작해줘.",
    "로고는 선으로만 그려줘.",
    "색상은 전부 빼고 검은색 클린 아웃라인만 사용하고, 배경은 순수 흰색(#FFFFFF)으로 해줘.",
    `팀 이름은 "${name}" 이야. 팀 이름이 로고 디자인에 자연스럽게 들어가게 해줘.`,
    "flat vector emblem, black stroke lines only, no color fill, white background, minimal soccer club badge.",
  ].join("\n");
}

export const LOGO_GENERATION_PROMPT_HINT =
  "선만 사용 · 검은 아웃라인 · 흰 배경 · 팀 이름만 입력";
