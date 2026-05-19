package com.slowind.chunchunhee.domain.order.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.slowind.chunchunhee.domain.design.entity.Design;
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
public class OrderItem extends BaseEntity {

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "design_id")
    private Design design;

    private int quantity;
    private int price;
}
