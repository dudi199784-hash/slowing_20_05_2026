package com.slowind.chunchunhee.domain.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@AllArgsConstructor
public class CartDto {
    private Long cartId;

    private Long designerId;
    private Long customerId;
    private Long productId;

//    private String customerEmail;
    private String customerName;
    /** 연결된 logo_asset 미리보기 경로 (없으면 null) */
    private String previewAccessPath;
//    private String customerPhone;
//    private String customerAddress;
//    private String customerCity;
//    private String customerZipCode;
//    private String customerPostalCode;
//    private String customerCountry;
}
