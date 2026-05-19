package com.slowind.chunchunhee.domain.product.repository;

import com.slowind.chunchunhee.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findFirstByCategoryOrderByIdAsc(String category);
}
