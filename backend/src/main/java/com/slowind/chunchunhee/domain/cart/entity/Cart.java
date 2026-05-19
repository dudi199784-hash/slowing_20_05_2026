package com.slowind.chunchunhee.domain.cart.entity;

import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.product.entity.Product;
import com.slowind.chunchunhee.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class Cart extends BaseEntity {

    // 구매 유저 정보
    @ManyToOne
    @JoinColumn( name = "member_id")
    private Member member;

    // 상품 정보
    @ManyToOne
    @JoinColumn( name = "product_id")
    private Product product;

    // 디자인 정보
    @ManyToOne
    @JoinColumn( name = "design_id")
    private Design design;

    // 주문 정보
    private int quantity;
    private String size;
}
