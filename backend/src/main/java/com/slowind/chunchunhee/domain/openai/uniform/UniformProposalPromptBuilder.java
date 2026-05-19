package com.slowind.chunchunhee.domain.openai.uniform;

public final class UniformProposalPromptBuilder {

    private UniformProposalPromptBuilder() {
    }

    public static String build(
            UniformReferenceTeam team,
            UniformKitType kitType,
            String teamName
    ) {
        return build(team, kitType, teamName, true);
    }

    public static String build(
            UniformReferenceTeam team,
            UniformKitType kitType,
            String teamName,
            boolean withLogo
    ) {
        String safeName = teamName.strip();
        String logoSection = withLogo
                ? """
                - 두 번째 입력 이미지: 고객 팀 로고입니다. 가슴·반바지·양말 등에 **자연스럽게** 합성하세요.
                """
                : """
                - 로고 이미지는 없습니다. 가슴·반바지에는 팀명 "%s"을(를) **타이포그래피·엠블럼 스타일**로 배치하고, 별도 로고 파일은 넣지 마세요.
                """.formatted(safeName);

        return """
                [역할]
                - 첫 번째 입력 이미지: "CUSTOM SOCCER UNIFORM DESIGN PROPOSAL" 레이아웃 템플릿입니다.
                  칸 배치(상의 정·후·측, 하의 정·측·후, 양말), 제목·라벨 위치, 오른쪽 Color Palette / Fabric Pattern / Jersey Details 영역 구조, 하단 아이콘 영역은 **그대로 유지**하세요.
                %s
                [레퍼런스 팀 스타일 — %s / %s]
                %s

                [고객 팀]
                - 팀 이름: %s
                - 템플릿에 있는 예시 팀명·스폰서·선수명(SMITH, CITY UNITED, VELOCITY 등)은 모두 "%s" 및 새 디자인에 맞게 교체하세요.

                [출력 규칙]
                - 동일한 제안서 형식의 **완성 시안 1장** (프로페셔널 인포그래픽).
                - 6뷰(상의·하의 정/측/후) 색상·패턴·번호·로고가 **일관**되게 맞출 것.
                - 배경 스타디움, 레이아웃 글자, 칸 제목은 변경하지 마세요.
                """.formatted(
                logoSection.strip(),
                team.labelKo(),
                kitType.name(),
                team.styleFor(kitType).strip(),
                safeName,
                safeName
        );
    }
}
