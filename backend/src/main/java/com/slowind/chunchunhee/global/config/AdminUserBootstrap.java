package com.slowind.chunchunhee.global.config;

import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.entity.MemberRole;
import com.slowind.chunchunhee.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 개발용 H2 등에서 최초 1회 관리자 계정을 만듭니다. (userId=admin / password=admin)
 */
@Configuration
@RequiredArgsConstructor
@Profile("!prod")
public class AdminUserBootstrap {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Order(Integer.MAX_VALUE)
    CommandLineRunner seedAdminUser() {
        return args -> {
            if (memberRepository.findByUserId("admin").isPresent()) {
                return;
            }
            memberRepository.save(
                    Member.builder()
                            .username("관리자")
                            .userId("admin")
                            .userpassword(passwordEncoder.encode("admin"))
                            .role(MemberRole.ADMIN)
                            .build());
        };
    }
}
