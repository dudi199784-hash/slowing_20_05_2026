package com.slowind.chunchunhee.domain.cart.repository;

import com.slowind.chunchunhee.domain.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByMemberId(Long userSerial);
    List<Cart> findByIdAndMemberId(Long id, Long userSerial);
}
