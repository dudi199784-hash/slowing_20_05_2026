package com.slowind.chunchunhee.domain.order.service;

import com.slowind.chunchunhee.domain.cart.entity.Cart;
import com.slowind.chunchunhee.domain.cart.repository.CartRepository;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.repository.MemberRepository;
import com.slowind.chunchunhee.domain.order.entity.Order;
import com.slowind.chunchunhee.domain.order.entity.OrderItem;
import com.slowind.chunchunhee.domain.order.repository.OrderRepository;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import com.slowind.chunchunhee.global.util.ShippingAddressFormatter;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
        private final MemberRepository memberRepository;
        private final CartRepository cartRepository;
        private final OrderRepository orderRepository;

    public List<Order> getList(Long memberId) {
        if (memberId != null) {
            return orderRepository.findByMemberId(memberId);
        }
        return orderRepository.findAll();
    }

    public Optional<Order> getOrder(Long orderId) {
        return orderRepository.findById(orderId);
    }

    public Optional<Order> findById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    @Transactional
    public Order createOrder(
            Long memberId,
            List<Long> cartIds,
            Integer quantityOverride,
            String shippingReceiver,
            String shippingPhone,
            String shippingZipCode,
            String shippingAddressLine1,
            String shippingAddressLine2,
            String shippingAddress,
            String personalizationNote
    ) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow();

        List<Cart> carts = cartIds.stream()
                .map(cartRepository::findById)
                .flatMap(Optional::stream)
                .filter(c -> c.getMember().getId().equals(memberId))
                .toList();

        if (carts.size() != cartIds.size()) {
            throw new ResourceNotFoundException(
                    "요청한 카트 중 일부를 찾을수 없습니다."
            );
        }

        if (quantityOverride != null && quantityOverride > 0) {
            for (Cart cart : carts) {
                cart.setQuantity(quantityOverride);
            }
        }

        Order order = new Order();
        order.setMember(member);
        order.setShippingReceiver(shippingReceiver);
        order.setShippingPhone(shippingPhone);
        order.setShippingZipCode(shippingZipCode);
        order.setShippingAddressLine1(shippingAddressLine1);
        order.setShippingAddressLine2(shippingAddressLine2);
        String fullAddress = shippingAddress != null && !shippingAddress.isBlank()
                ? shippingAddress.trim()
                : ShippingAddressFormatter.formatFull(shippingZipCode, shippingAddressLine1, shippingAddressLine2);
        order.setShippingAddress(fullAddress);
        order.setPersonalizationNote(personalizationNote);
        order.setStatus("주문완료");

        List<OrderItem> orderItems = carts.stream()
                .map(c -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(c.getProduct());
                    orderItem.setDesign(c.getDesign());
                    orderItem.setQuantity(c.getQuantity());
                    orderItem.setPrice(c.getProduct().getPrice());

                    return orderItem;
                })
                .toList();

        int totalQuantity = orderItems.stream().mapToInt(OrderItem::getQuantity).sum();
        int totalAmount = orderItems.stream()
                .mapToInt(i -> i.getPrice() * i.getQuantity())
                .sum();


        order.setQuantity(totalQuantity);
        order.setTotalPrice(totalAmount);
        order.setItems(orderItems);

        orderRepository.save(order);

        // ⭐ 주문 후 카트 비우기
        cartRepository.deleteAll(carts);

        return order;
    }

//    @Transactional
//    public OrderItem update(Long orderId, String userName, String designerName) {
//    }

    public void updateStatus(Long orderId, @NotBlank String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();
        order.setStatus(status);
        orderRepository.save(order);
    }

    public void delete(Long orderId) {
        orderRepository.deleteById(orderId);
    }
}
