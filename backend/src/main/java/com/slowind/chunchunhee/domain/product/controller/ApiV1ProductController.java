package com.slowind.chunchunhee.domain.product.controller;

import com.slowind.chunchunhee.domain.product.entity.Product;
import com.slowind.chunchunhee.domain.product.service.ProductService;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ApiV1ProductController {
    private final ProductService productService;

    // --- inner 클래스 - 다건조회 응답
    @Getter
    @AllArgsConstructor
    public static class ProductsResponse {
        private final List<Product> products;
    }

    // --- 다건 조회
    @GetMapping("")
    public ProductsResponse getProducts() {
        List<Product> products = productService.getList();
        return new ProductsResponse(products);
    }


    // --- inner 클래스 - 단건조회 응답
    @Getter
    @AllArgsConstructor
    public static class ProductResponse {
        private final Product product;
    }

    // --- 단건 조회
    @GetMapping("{id}")
    public ProductResponse getProduct(@PathVariable("id") Long id) {
        return productService.getProduct(id)
                .map( ProductResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%d번 상품은 존재하지 않습니다.".formatted(id)
                ));
    }

    // --- inner 클래스 - 상품게시 요청
    @Data
    public static class WriteRequest {
        @NotBlank
        private String title;
        @NotBlank
        private String description;
        @NotBlank
        private String category;
    }

    // --- inner 클래스 - 상품게시 응답
    @Getter
    @AllArgsConstructor
    public static class WriteResponse {
        private final Product product;
    }

    // --- 새로운 상품 게시
    @PostMapping("")
    public WriteResponse write(@Valid @RequestBody WriteRequest writeRequest) {
        Product writeProduct = productService.create(
                                        writeRequest.getTitle(),
                                        writeRequest.getDescription(),
                                        writeRequest.getCategory()
                                        );

        return new WriteResponse(writeProduct);
    }

    // --- inner 클래스 - 상품수정 요청
    @Data
    public static class ModifyRequest {
        @NotBlank
        private String title;
        @NotBlank
        private String description;
        @NotBlank
        private String category;
    }

    // --- inner 클래스 - 상품수정 응답
    @Getter
    @AllArgsConstructor
    public static class ModifyResponse {
        private final Product product;
    }

    // --- 상품정보 수정
    @PatchMapping("/{id}")
    public ModifyResponse modify(@Valid @RequestBody ModifyRequest modifyRequest, @PathVariable("id")  Long id) {
        Product product = productService.findyById(id).orElseThrow(() ->  new ResourceNotFoundException(
                "%d번 상품은 존재하지 않습니다.".formatted(id)
        ));


//        if (modifyRequest.authority != "관리자" ) { return new ResourceNotFoundException ("권한이 올바르지 않습니다."); }
//        >> canModify or cnaAuth

        Product modified = productService.modify(
                product,
                modifyRequest.getTitle(),
                modifyRequest.getDescription(),
                modifyRequest.getCategory());

        return new ModifyResponse(modified);
    }

    // --- inner 클래스 - 상품제거 응답
    @Getter
    @AllArgsConstructor
    public static class RemoveResponse {
        private final Product product;
    }

    // --- 상품 삭제
    @DeleteMapping("/{id}")
    public RemoveResponse remove(@PathVariable("id") Long id) {
        Product product = productService.findyById(id).orElseThrow(() ->  new ResourceNotFoundException(
                "존재하지 않는 상품입니다."
        ));

        productService.delete(id);
        return new RemoveResponse(product);
    }
}
