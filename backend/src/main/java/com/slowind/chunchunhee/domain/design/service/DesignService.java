package com.slowind.chunchunhee.domain.design.service;

import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.design.repository.DesignRepository;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.service.MemberService;
import com.slowind.chunchunhee.domain.product.entity.Product;
import com.slowind.chunchunhee.domain.product.service.ProductService;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DesignService {
    private final DesignRepository designRepository;
    private final MemberService memberService;
    private final ProductService productService;


    private Member valiMember(Long memberSerial) {
        return memberService.findById(memberSerial)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%d번 회원은 존재하지 않습니다.".formatted(memberSerial)
                ));
    }

    private Product valiProduct(Long productSerial) {
        return productService.findyById(productSerial)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%d번 상품은 존재하지 않습니다.".formatted(productSerial)
                ));
    }

    //
    public List<Design> getList(Long userSerial, String category) {
        String cat = (category != null && !category.isBlank()) ? category : null;

        if (userSerial != null && cat != null) {
            return designRepository.findByMemberIdAndProductCategory(userSerial, cat);
        }

        if (userSerial != null) {
            return designRepository.findByMemberId(userSerial);
        }

        if (cat != null) {
            return designRepository.findByProductCategory(cat);
        }

        return designRepository.findAll();
    }

    public Optional<Design> getDesign(Long id) {
        return designRepository.findById(id);
    }

    public Optional<Design> findById(Long id) {
        return designRepository.findById(id);
    }

    public Design create(@NotNull Long memberSerial, @NotNull Long productSerial, @NotBlank String designTitle, @NotBlank String designDescription, @NotBlank String designCategory) {

        Member member = valiMember(memberSerial);
        Product product = valiProduct(productSerial);

        Design design = Design.builder()
                .member(member)
                .product(product)
                .designTitle(designTitle)
                .designDescription(designDescription)
                .build();
        designRepository.save(design);
        return design;
    }

    public Design update(Design design, @NotNull Long userSerial, @NotNull Long productSerial, @NotBlank String designTitle, @NotBlank String designDescription, @NotBlank String designCategory) {

        Member member = valiMember(userSerial);
        Product product = valiProduct(productSerial);

        design.setMember(member);
        design.setProduct(product);
        design.setDesignTitle(designTitle);
        design.setDesignDescription(designDescription);

        designRepository.save(design);
        return design;

    }

    public void delete(Long designId) {
        designRepository.deleteById(designId);
    }
}
