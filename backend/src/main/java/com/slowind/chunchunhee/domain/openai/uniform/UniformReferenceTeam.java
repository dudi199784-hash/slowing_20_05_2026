package com.slowind.chunchunhee.domain.openai.uniform;

import java.util.List;
import java.util.Optional;

public record UniformReferenceTeam(
        String id,
        String labelKo,
        String homeStylePrompt,
        String awayStylePrompt
) {
    private static final List<UniformReferenceTeam> TEAMS = List.of(
            new UniformReferenceTeam(
                    "arsenal",
                    "아스널",
                    """
                    Arsenal FC 홈 키트 스타일: 붉은 몸통, 흰 소매, 골드/크림 칼라·커프 트림, 클래식 EPL 홈 느낌.""",
                    """
                    Arsenal FC 어웨이 키트 스타일: 짙은 네이비 또는 블랙 베이스, 밝은 액센트 라인, 미니멀 어웨이 톤."""
            ),
            new UniformReferenceTeam(
                    "manchester_united",
                    "맨체스터 유나이티드",
                    """
                    Manchester United 홈: 레드 베이스, 화이트 트림, 전통 홈 키트.""",
                    """
                    Manchester United 어웨이: 화이트 또는 연회색 베이스, 레드 액센트."""
            ),
            new UniformReferenceTeam(
                    "liverpool",
                    "리버풀",
                    """
                    Liverpool FC 홈: 크림슨 레드 단색 또는 미세 그라데이션, 심플 홈.""",
                    """
                    Liverpool FC 어웨이: 퍼플/그린 계열 어웨이 또는 화이트 베이스."""
            ),
            new UniformReferenceTeam(
                    "chelsea",
                    "첼시",
                    """
                    Chelsea FC 홈: 로열 블루 베이스, 화이트 삭스 스타일 트림.""",
                    """
                    Chelsea FC 어웨이: 화이트 또는 옐로우 그린 어웨이 톤."""
            ),
            new UniformReferenceTeam(
                    "tottenham",
                    "토트넘",
                    """
                    Tottenham Hotspur 홈: 화이트 베이스, 네이비 트림.""",
                    """
                    Tottenham 어웨이: 다크 네이비 또는 그린 어웨이."""
            ),
            new UniformReferenceTeam(
                    "manchester_city",
                    "맨체스터 시티",
                    """
                    Manchester City 홈: 스카이 블루 베이스, 화이트 트림.""",
                    """
                    Manchester City 어웨이: 블랙 또는 다크 마룬 어웨이."""
            ),
            new UniformReferenceTeam(
                    "real_madrid",
                    "레알 마드리드",
                    """
                    Real Madrid 홈: 화이트 베이스, 골드/네이비 디테일, 클래식 홈.""",
                    """
                    Real Madrid 어웨이: 다크 퍼플/블랙 어웨이."""
            ),
            new UniformReferenceTeam(
                    "barcelona",
                    "바르셀로나",
                    """
                    FC Barcelona 홈: 블라우그라나(블루·레드) 스트라이프 또는 그라데이션 홈.""",
                    """
                    FC Barcelona 어웨이: 옐로우/골드 어웨이 키트."""
            ),
            new UniformReferenceTeam(
                    "bayern_munich",
                    "바이에른 뮌헨",
                    """
                    Bayern Munich 홈: 레드 베이스, 화이트 트림, 전통 홈.""",
                    """
                    Bayern Munich 어웨이: 화이트 또는 그레이 어웨이."""
            ),
            new UniformReferenceTeam(
                    "psg",
                    "파리 생제르맹",
                    """
                    PSG 홈: 네이비 베이스, 레드/화이트 액센트, 파리 홈 톤.""",
                    """
                    PSG 어웨이: 화이트 또는 다크 그레이 어웨이."""
            ),
            new UniformReferenceTeam(
                    "inter_milan",
                    "인터 밀란",
                    """
                    Inter Milan 홈: 블랙·블루 스트라이프(세로), 클래식 홈.""",
                    """
                    Inter Milan 어웨이: 화이트 또는 그린 어웨이."""
            )
    );

    public static List<UniformReferenceTeam> all() {
        return TEAMS;
    }

    public static Optional<UniformReferenceTeam> findById(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return TEAMS.stream()
                .filter(t -> t.id().equalsIgnoreCase(id.trim()))
                .findFirst();
    }

    public static UniformReferenceTeam requireById(String id) {
        return findById(id).orElseThrow(() -> new IllegalArgumentException(
                "지원하지 않는 referenceTeamId: " + id + ". 가능: "
                        + String.join(", ", TEAMS.stream().map(UniformReferenceTeam::id).toList())
        ));
    }

    public String styleFor(UniformKitType kitType) {
        return kitType == UniformKitType.HOME ? homeStylePrompt() : awayStylePrompt();
    }
}
