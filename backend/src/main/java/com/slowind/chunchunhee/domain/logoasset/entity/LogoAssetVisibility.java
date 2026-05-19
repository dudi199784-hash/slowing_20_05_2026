package com.slowind.chunchunhee.domain.logoasset.entity;

public enum LogoAssetVisibility {
    PRIVATE,
    PUBLIC;

    public static LogoAssetVisibility fromParam(String raw) {
        if (raw == null || raw.isBlank()) {
            return PRIVATE;
        }
        try {
            return LogoAssetVisibility.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            if ("모두보기".equals(raw.trim()) || "PUBLIC".equalsIgnoreCase(raw.trim())) {
                return PUBLIC;
            }
            if ("나만보기".equals(raw.trim()) || "PRIVATE".equalsIgnoreCase(raw.trim())) {
                return PRIVATE;
            }
            return PRIVATE;
        }
    }
}
