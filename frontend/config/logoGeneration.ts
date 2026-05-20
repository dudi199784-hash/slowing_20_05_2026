/**
 * 로고 생성 고정 프롬프트 — 사용자는 팀 이름만 입력합니다.
 * (API 전용, 화면에 노출하지 않음)
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

/** 저장된 프롬프트 문자열에서 팀 이름 추출 */
export function extractTeamNameFromLogoPrompt(prompt: string): string | null {
  const m = prompt.match(/팀 이름은 "([^"]+)"/);
  return m?.[1]?.trim() || null;
}

function displayTeamName(teamName: string): string {
  const name = teamName.trim();
  return name || "팀";
}

/** 로고 생성 폼 — 대기 중 안내 */
export function logoGenerationIdleMessage(): string {
  return "팀명으로 로고 디자인을 생성합니다.";
}

/** 로고 생성 폼 — 생성 중 안내 */
export function logoGenerationCreatingMessage(teamName: string): string {
  return `${displayTeamName(teamName)}에서 영감을 얻어 로고 디자인을 제작중입니다.`;
}

/** 자세히 보기 · 완성 후 설명란 */
export function logoGenerationCompletedMessage(teamName: string): string {
  return `${displayTeamName(teamName)}에서 영감을 얻어 생성된 로고 입니다.`;
}

/** DB/세션에 남은 내부 프롬프트 → 화면용 문구 */
export function logoGenerationDisplayMessage(prompt: string): string {
  const team = extractTeamNameFromLogoPrompt(prompt);
  if (team) return logoGenerationCompletedMessage(team);
  if (
    prompt.includes("간지나는") ||
    prompt.includes("선으로만") ||
    prompt.includes("flat vector emblem")
  ) {
    return logoGenerationCompletedMessage("");
  }
  return prompt;
}
