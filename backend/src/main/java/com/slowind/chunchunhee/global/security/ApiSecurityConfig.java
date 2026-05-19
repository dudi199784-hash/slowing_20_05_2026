package com.slowind.chunchunhee.global.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class ApiSecurityConfig {
    private final JwtAuthorizationFilter jwtAuthorizationFilter;

    @Bean
    SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http
                // (선택) 이 프로젝트가 전부 /api 라면 생략해도 됨. H2만 따로 두고 싶으면 체인을 둘로 쪼개고 @Order 사용.
                // .securityMatcher("/api/**")
                .securityMatcher("/api/**")
                .authorizeHttpRequests(auth -> auth
                        // --- 공개
                        .requestMatchers(HttpMethod.GET, "/api/v1/products", "/api/v1/products/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/files/logos/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/members/login")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/members/session")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/members/logout")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/members")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/communities", "/api/v1/communities/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/comments", "/api/v1/comments/**")
                        .permitAll()
                        // --- 로그인 사용자 (이미지 생성·저장 등)
                        .requestMatchers(HttpMethod.POST, "/api/v1/openai/images/generate")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/openai/images/edit-uniform")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/openai/images/uniform-reference-teams")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/openai/images/uniform-proposal")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/openai/images/product-proposal")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/logo-assets")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/logo-assets/mine")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/logo-assets/browse", "/api/v1/logo-assets/browse/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/logo-assets/*/visibility")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/logo-assets/*/like")
                        .authenticated()
                        .requestMatchers("/api/v1/carts/**")
                        .authenticated()
                        .requestMatchers("/api/v1/orders/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/communities", "/api/v1/communities/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/communities/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/communities/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/comments", "/api/v1/comments/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/comments/**")
                        .authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/comments/**")
                        .authenticated()
                        // --- 회원: 목록·삭제는 관리자, 단건 조회·본인 정보 수정은 로그인 사용자(컨트롤러에서 본인 여부 검사)
                        .requestMatchers(HttpMethod.GET, "/api/v1/members")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/members/*")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/members/*")
                        .authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/members/*")
                        .authenticated()
                        // --- 관리자 전용 (회원 API 위에서 처리됨)
                        .requestMatchers(HttpMethod.POST, "/api/v1/products")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/products/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**")
                        .hasRole("ADMIN")
                        // 디자인: 목록·단건 조회는 공개(쇼룸/홈), 변경은 관리자
                        .requestMatchers(HttpMethod.GET, "/api/v1/designs", "/api/v1/designs/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/designs")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/designs/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/designs/**")
                        .hasRole("ADMIN")
                        // --- 나머지 API
                        .requestMatchers("/api/**")
                        .authenticated()
                        .anyRequest()
                        .authenticated())
                .csrf(
                        csrf -> csrf
                                .disable()
                ) // csrf 토큰 끄기
                .cors(
                        cors -> cors
                                .configurationSource(configurationSource()))
                .httpBasic(
                        httpBasic -> httpBasic.disable()
                ) // httpBasic 로그인 방식 끄기
                .formLogin(
                        formLogin -> formLogin.disable()
                ) // 폼 로그인 방식 끄기
                .sessionManagement(
                        sm -> sm
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                ) // 세션 끄기
                .addFilterBefore(
                        jwtAuthorizationFilter, // 엑세스 토큰을 이용한 로그인 처리
                        UsernamePasswordAuthenticationFilter.class
                );

        // JWT 붙인 뒤:
        // http.addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource configurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("http://localhost:*");
        configuration.addAllowedOrigin("http://cdpn.io");
        configuration.addAllowedMethod("*");                        // 모든 HTTP 메서드 헏용
        configuration.addAllowedHeader("*");                        // 모든 요청 헤더 허용
        configuration.setAllowCredentials(true);                    // 쿠키 및 인증 정보 포함 허용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
