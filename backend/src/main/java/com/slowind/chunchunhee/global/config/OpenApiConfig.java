package com.slowind.chunchunhee.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger UI: {@code /swagger-ui/index.html}<br>
 * OpenAPI JSON: {@code /v3/api-docs}<br>
 * 프론트(Next) 개발 시 {@code /api/v1/**} 는 보통 Vite/Next 프록시로 백엔드로 전달됩니다.
 */
@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("SLOWIND API")
                                .description(
                                        """
                                                Spring Boot REST API (`/api/v1/**`).

                                                **인증:** 로그인(`POST /api/v1/members/login`) 응답의 `accessToken`을 \
                                                우측 상단 **Authorize**에 입력하세요. (HTTP Bearer, `Bearer ` 접두사는 Swagger가 붙입니다.)

                                                **공개/비공개**는 `ApiSecurityConfig`와 각 컨트롤러를 참고하세요.""")
                                .version("1.0"))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        BEARER_AUTH,
                                        new SecurityScheme()
                                                .name(BEARER_AUTH)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                                .description("JWT accessToken (로그인 응답)")));
    }
}
