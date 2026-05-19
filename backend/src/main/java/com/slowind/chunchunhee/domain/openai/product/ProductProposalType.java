package com.slowind.chunchunhee.domain.openai.product;

import java.util.Arrays;

public enum ProductProposalType {
    CLEATS("cleats", "product/cleats-proposal-template.png", "CUSTOM SOCCER CLEATS DESIGN PROPOSAL", "축구화"),
    KEEPER("keeper", "product/keeper-proposal-template.png", "CUSTOM SOCCER GLOVES DESIGN PROPOSAL", "키퍼 장갑"),
    SPORTS("sports", "product/sports-proposal-template.png", "CUSTOM SOCCER BALL DESIGN PROPOSAL", "스포츠 용품");

    private final String paramId;
    private final String templateClasspath;
    private final String proposalTitle;
    private final String labelKo;

    ProductProposalType(String paramId, String templateClasspath, String proposalTitle, String labelKo) {
        this.paramId = paramId;
        this.templateClasspath = templateClasspath;
        this.proposalTitle = proposalTitle;
        this.labelKo = labelKo;
    }

    public String paramId() {
        return paramId;
    }

    public String templateClasspath() {
        return templateClasspath;
    }

    public String proposalTitle() {
        return proposalTitle;
    }

    public String labelKo() {
        return labelKo;
    }

    public static ProductProposalType requireByParamId(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("productId는 필수입니다.");
        }
        String id = raw.trim();
        return Arrays.stream(values())
                .filter(t -> t.paramId.equalsIgnoreCase(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 productId: " + raw));
    }
}
