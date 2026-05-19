package com.slowind.chunchunhee.domain.cart.service;

import com.slowind.chunchunhee.domain.cart.entity.Cart;
import com.slowind.chunchunhee.domain.cart.repository.CartRepository;
import com.slowind.chunchunhee.domain.cart.dto.CartDto;
import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.design.repository.DesignRepository;
import com.slowind.chunchunhee.domain.logoasset.repository.LogoAssetRepository;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.repository.MemberRepository;
import com.slowind.chunchunhee.domain.product.entity.Product;
import com.slowind.chunchunhee.domain.product.repository.ProductRepository;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final DesignRepository designRepository;
    private final LogoAssetRepository logoAssetRepository;

    public CartDto toDto(Cart cart) {
        String preview = null;
        if (cart.getDesign() != null) {
            preview = logoAssetRepository
                    .findFirstByDesign_IdOrderByCreateTimeDesc(cart.getDesign().getId())
                    .map(a -> a.getAccessPath())
                    .orElse(null);
        }
        return new CartDto(
                cart.getId(),
                cart.getDesign() != null ? cart.getDesign().getId() : null,
                cart.getMember().getId(),
                cart.getProduct().getId(),
                cart.getMember().getUsername(),
                preview
        );
    }

    public List<Cart> getList(Long userSerial, Long productSerial, Long designSerial, String category) {
        if (userSerial == null) {
            return cartRepository.findAll();
        }
        List<Cart> carts = cartRepository.findByMemberId(userSerial);
        boolean filterByCategory = StringUtils.hasText(category);
        return carts.stream()
                .filter(c -> productSerial == null || c.getProduct().getId().equals(productSerial))
                .filter(c -> designSerial == null || c.getDesign().getId().equals(designSerial))
                .filter(c -> !filterByCategory
                        || (c.getProduct().getCategory() != null
                        && c.getProduct().getCategory().equals(category)))
                .toList();
    }

    public List<Cart> getUserOrders(Long id,Long userSerial) {
        List<Cart> carts = cartRepository.findByIdAndMemberId(id, userSerial);
        return carts;
    }

    public Optional<Cart> getCart(@Valid Long id) {
        return cartRepository.findById(id);
    }
    
    public Optional<Cart> findById(Long id) {
        return cartRepository.findById(id);
    }

    public Product findProductById(@Valid @NotBlank Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("상품 없음"));
    }

    public Member findMemberById(@Valid @NotBlank Long customerId) {
        return memberRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("회원 없음"));
    }

    public Design findDesignById(@Valid @NotBlank Long designId) {
        return designRepository.findById(designId)
                .orElseThrow(() -> new ResourceNotFoundException("디자인 없음"));
    }

    // --- 생성
    public Cart create(@NotNull Long cartId, @NotNull Long designId, @NotNull Long customerId, @NotNull Long productId, @NotBlank String customerName) {

        Product product = findProductById(productId);
        assertCartableProduct(product.getCategory());

        Member member = findMemberById(customerId);

        Design design = findDesignById(designId);
        if (design.getProduct() != null) {
            assertCartableProduct(design.getProduct().getCategory());
        }

        Cart cart = Cart.builder()
                .member(member)
                .product(product)
                .design(design)
                .quantity(10)
                .size("m size")
                .build();
        cartRepository.save(cart);
        return cart;
    }

    // --- 수정
    public Cart update(Cart cart, @NotNull Long cartId, @NotNull Long productId, @NotNull Long customerId, @NotNull Long designId, @NotBlank String customerName, @NotBlank String designTitle, @NotBlank String size, @NotNull Integer quantity) {

        Product product = findProductById(productId);
        Member member = findMemberById(customerId);
        Design design = findDesignById(designId);

        cart.setQuantity(quantity);
        cart.setSize(size);

        cartRepository.save(cart);
        return cart;
    }


    // --- 삭제
    public void delete(@NotNull Long id) {
        cartRepository.deleteById(id);
    }

    private static void assertCartableProduct(String category) {
        if (category == null) {
            return;
        }
        String t = category.trim();
        if ("로고".equals(t) || "logo".equalsIgnoreCase(t) || "LOGO".equals(t)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "로고는 쇼핑백에 담을 수 없습니다. 유니폼 시안만 담아 주세요."
            );
        }
    }

}
