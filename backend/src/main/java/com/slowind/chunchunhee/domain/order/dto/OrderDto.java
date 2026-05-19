package com.slowind.chunchunhee.domain.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class OrderDto {

    private Long orderId;

    private String customerName;

    private int totalPrice;

    private List<OrderItemDto> items;
}
