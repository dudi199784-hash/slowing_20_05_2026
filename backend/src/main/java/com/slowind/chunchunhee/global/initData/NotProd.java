package com.slowind.chunchunhee.global.initData;

import com.slowind.chunchunhee.domain.member.service.MemberService;
import com.slowind.chunchunhee.domain.product.service.ProductService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile({"dev", "test"})
/** 배포 제외 — 개발용 최소 시드(상품·테스트 회원만) */
public class NotProd {
    @Bean
    CommandLineRunner initData(
            ProductService productService,
            MemberService memberService
    ) {
        return args -> {
            productService.create("커스텀 로고 제작", "AI 로고 디자인", "로고");
            productService.create("커스텀 유니폼 제작", "AI 유니폼 시안", "유니폼");
            productService.create("커스텀 축구화 제작", "AI 축구화 시안", "축구화");
            productService.create("커스텀 키퍼 장갑", "AI 키퍼 장갑 시안", "키퍼장갑");
            productService.create("스포츠 용품", "AI 스포츠 용품 시안", "스포츠용품");
            productService.create("기타 굿즈", "기타 상품", "기타");

            memberService.createMember("테스트", "test", "123");
        };
    }
}
