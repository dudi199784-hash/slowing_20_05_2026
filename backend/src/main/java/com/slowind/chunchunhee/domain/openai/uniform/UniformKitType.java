package com.slowind.chunchunhee.domain.openai.uniform;

public enum UniformKitType {
    HOME,
    AWAY;

    public static UniformKitType fromParam(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("kitType은 HOME 또는 AWAY 여야 합니다.");
        }
        try {
            return UniformKitType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("kitType은 HOME 또는 AWAY 여야 합니다.");
        }
    }
}
