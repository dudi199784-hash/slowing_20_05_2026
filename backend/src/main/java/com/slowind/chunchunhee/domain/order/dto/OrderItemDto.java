package com.slowind.chunchunhee.domain.order.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class OrderItemDto {
    private Long productId;
    private Long customerId;

    private String productName;
    private String customerName;

    private int productPrice;
    private int productQuantity;
    private int productTotalPrice;
}
