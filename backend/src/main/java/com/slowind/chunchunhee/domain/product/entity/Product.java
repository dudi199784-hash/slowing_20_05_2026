package com.slowind.chunchunhee.domain.product.entity;

import com.slowind.chunchunhee.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class Product extends BaseEntity {
    private String title;
    private String description;
    private String category;
    private int price;
//    private String image;
//    private String status;
//    private String type;
//    private Long stock;
}
