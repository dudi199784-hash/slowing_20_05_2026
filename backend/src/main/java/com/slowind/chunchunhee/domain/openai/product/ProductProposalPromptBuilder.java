package com.slowind.chunchunhee.domain.openai.product;

public final class ProductProposalPromptBuilder {

    private ProductProposalPromptBuilder() {
    }

    public static String build(
            ProductProposalType type,
            String teamName,
            String notes,
            boolean withUniformReference
    ) {
        String safeName = teamName.strip();
        String notesBlock = notes != null && !notes.isBlank()
                ? "\n- 추가 요청: " + notes.strip()
                : "";

        String uniformSection = withUniformReference
                ? buildUniformReferenceSection(type)
                : """
                - 유니폼 참조 이미지는 없습니다. 팀 이름과 추가 요청만 반영해 새 디자인을 만드세요.
                """;

        return """
                [역할]
                - 첫 번째 입력 이미지: "%s" **레이아웃 템플릿**입니다.
                  %s
                %s
                [고객 팀]
                - 팀 이름: %s
                - 템플릿에 있는 예시 팀명·스폰서·샘플 문구(CITY UNITED FC 등)는 모두 "%s" 및 새 디자인에 맞게 교체하세요.%s

                [출력 규칙]
                - 동일한 제안서 형식의 **완성 시안 1장** (프로페셔널 인포그래픽).
                - 모든 뷰에서 색상·패턴·로고 배치가 **일관**되게 맞출 것.
                - 템플릿의 칸 제목·레이아웃 글자·배경 구도는 변경하지 마세요.
                """.formatted(
                type.proposalTitle(),
                layoutRulesFor(type),
                uniformSection.strip(),
                safeName,
                safeName,
                notesBlock
        );
    }

    private static String layoutRulesFor(ProductProposalType type) {
        return switch (type) {
            case CLEATS -> """
                  제품 뷰(LATERAL/MEDIAL/TOP VIEW/REAR VIEW/SOLE VIEW) 칸 배치, 제목·라벨 위치,
                  오른쪽 Logo Application / Color Palette / Fabric Pattern / Detail Highlights,
                  하단 기능 아이콘·시즌 표기 영역의 **구조와 구도는 그대로 유지**하세요.
                  """;
            case KEEPER -> """
                  제품 뷰(PALM VIEW/BACKHAND VIEW/SIDE VIEW/PAIR VIEW)와 하단 클로즈업(WRIST STRAP, FINGER PROTECTION 등) 칸 배치,
                  오른쪽 Logo Application / Color Palette / Fabric Pattern / Detail Highlights,
                  하단 기능 아이콘(Excellent Grip, Shock Absorption 등)·시즌 표기 영역의 **구조와 구도는 그대로 유지**하세요.
                  """;
            case SPORTS -> """
                  축구공 뷰(FRONT VIEW/BACK VIEW/SIDE VIEW/TOP VIEW/BOTTOM VIEW)와 하단 패널·사이즈 다이어그램 칸 배치,
                  오른쪽 Logo Application / Sponsor Logo / Monogram / Color Palette / Fabric Texture,
                  하단 기능 아이콘(Premium PU Material 등)·시즌 표기 영역의 **구조와 구도는 그대로 유지**하세요.
                  """;
        };
    }

    private static String buildUniformReferenceSection(ProductProposalType type) {
        String itemLabel = switch (type) {
            case CLEATS -> "축구화";
            case KEEPER -> "키퍼 글러브(장갑)";
            case SPORTS -> "축구공";
        };
        return """
                - 두 번째 입력 이미지: 고객이 만든 **유니폼 디자인 시안**입니다.
                - **우선순위**: %s의 **색상·패턴**은 두 번째 유니폼 시안을 **강하게 따라야** 합니다.
                  템플릿(첫 번째 이미지)에 있는 예시 색·패턴(CITY UNITED FC 등)은 **사용하지 마세요**.
                - 유니폼에서 주색·보조색·패턴·로고·브랜딩을 추출해, 모든 제품 뷰와 오른쪽 Color Palette / Fabric Pattern(또는 Fabric Texture)에 **동일 계열**로 반영하세요.
                - 로고·팀 타이포는 유니폼 시안과 일관되게 제품에 배치하세요.
                - 유니폼 이미지의 레이아웃·칸 구조·제안서 틀은 복사하지 말고, 첫 번째 이미지의 **레이아웃만** 유지하세요.
                """.formatted(itemLabel);
    }
}
