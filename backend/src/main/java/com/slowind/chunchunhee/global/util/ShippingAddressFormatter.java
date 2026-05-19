package com.slowind.chunchunhee.global.util;

public final class ShippingAddressFormatter {

    private ShippingAddressFormatter() {
    }

    public static String formatFull(String zipCode, String addressLine1, String addressLine2) {
        String zip = zipCode != null ? zipCode.trim() : "";
        String line1 = addressLine1 != null ? addressLine1.trim() : "";
        String line2 = addressLine2 != null ? addressLine2.trim() : "";
        StringBuilder sb = new StringBuilder();
        if (!zip.isEmpty()) {
            sb.append("(").append(zip).append(") ");
        }
        sb.append(line1);
        if (!line2.isEmpty()) {
            if (!line1.isEmpty()) {
                sb.append(", ");
            }
            sb.append(line2);
        }
        return sb.toString().trim();
    }
}
