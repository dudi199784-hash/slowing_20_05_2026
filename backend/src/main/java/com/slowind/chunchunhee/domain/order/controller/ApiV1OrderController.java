package com.slowind.chunchunhee.domain.order.controller;

import com.slowind.chunchunhee.domain.order.dto.OrderItemDto;
import com.slowind.chunchunhee.domain.order.entity.Order;
import com.slowind.chunchunhee.domain.order.entity.OrderItem;
import com.slowind.chunchunhee.domain.order.service.OrderService;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
public class ApiV1OrderController {
    private final OrderService orderService;

    @Getter
    @AllArgsConstructor
    public static class OrdersItemResponse {
        private final List<Order> orders;
    }
    @GetMapping("")
    public OrdersItemResponse orders(
            @RequestParam( value = "user", required = false ) Long userSerial
    ) {
        List<Order> orders = orderService.getList(userSerial);
        return new OrdersItemResponse(orders);
    }


    @Getter
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long orderId;
        private String userName;
        private Integer quantity;
        private Integer totalPrice;
    }

    @GetMapping("{id}")
    public OrderItemDto order(
            @Valid @PathVariable("id") Long orderId,
            @RequestParam( value = "user", required = false ) Long userSerial
    ){
        Order order = orderService.getOrder(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%d번 주문을 찾지 못 했습니다.".formatted(orderId)
                ));

        return new OrderItemDto(
                order.getId(),
                order.getMember().getUsername(),
                order.getQuantity(),
                order.getTotalPrice()
        );
    }

    @Data
    public static class AddOrderRequest {
        @NotNull
        private Long userId;
        @NotEmpty
        private List<Long> cartIds;
        private Integer quantity;
        @NotBlank
        private String shippingReceiver;
        @NotBlank
        private String shippingPhone;
        @NotBlank
        private String shippingZipCode;
        @NotBlank
        private String shippingAddressLine1;
        @NotBlank
        private String shippingAddressLine2;
        private String shippingAddress;
        private String personalizationNote;
    }

    @PostMapping("")
    public OrderItemDto addOrder(@Valid @RequestBody AddOrderRequest addOrderRequest) {
        Order order = orderService.createOrder(
                addOrderRequest.getUserId(),
                addOrderRequest.getCartIds(),
                addOrderRequest.getQuantity(),
                addOrderRequest.getShippingReceiver().trim(),
                addOrderRequest.getShippingPhone().trim(),
                addOrderRequest.getShippingZipCode().trim(),
                addOrderRequest.getShippingAddressLine1().trim(),
                addOrderRequest.getShippingAddressLine2().trim(),
                addOrderRequest.getShippingAddress(),
                addOrderRequest.getPersonalizationNote()
        );

        return new OrderItemDto(
                order.getId(),
                order.getMember().getUsername(),
                order.getQuantity(),
                order.getTotalPrice()
        );
    }

    @Data
    public static class ModifyOrderRequest {
        private String userName;
        private String designerName;
    }

    @Getter
    @AllArgsConstructor
    public static class OrderInfoDto {
        private final String userName;
        private final String designerName;
    }

//    @PatchMapping("/{id}")
//    public OrderInfoDto modifyOrder(@Valid @RequestBody ModifyOrderRequest modifyOrderRequest, @PathVariable("id") Long orderId) {
//        Order modify = orderService.update(orderId, modifyOrderRequest.getUserName(),modifyOrderRequest.getDesignerName());
//
//        return new  OrderInfoDto(
//                modify.getItems().get().getOrder().getMember().getUsername(),
//                modify.getItems().get().getDesign().getMember().getUsername()
//        );
//    }


    @Data
    public static class OrderStatusRequest {
        @NotBlank
        private String status;
    }

    @Getter
    @AllArgsConstructor
    public static class OrderStatusDto {
        private final String status;
    }

    @PatchMapping("/{id}/status")
    public OrderStatusDto modifyOrerStatus(@Valid @RequestBody OrderStatusRequest orderStatusRequest, @PathVariable("id") Long orderId) {
        orderService.updateStatus(orderId,orderStatusRequest.getStatus());
        return new  OrderStatusDto(orderStatusRequest.getStatus());
    }

    @Getter
    @AllArgsConstructor
    public static class RemoveOrderResponse {
        private final Order order;
    }

    @DeleteMapping("{id}")
    public RemoveOrderResponse removeOrder(@PathVariable("id") Long orderId) {
        Order order = orderService.findById(orderId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 주문내역은 존재하지 않습니다.".formatted(orderId)
        ));
        orderService.delete(orderId);
        return new RemoveOrderResponse(order);
    }

}
