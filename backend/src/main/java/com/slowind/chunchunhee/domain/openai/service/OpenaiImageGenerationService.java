package com.slowind.chunchunhee.domain.openai.service;

import com.slowind.chunchunhee.domain.openai.controller.ApiV1OpenaiImageController;
import com.slowind.chunchunhee.domain.openai.product.ProductProposalPromptBuilder;
import com.slowind.chunchunhee.domain.openai.product.ProductProposalType;
import com.slowind.chunchunhee.domain.openai.uniform.UniformKitType;
import com.slowind.chunchunhee.domain.openai.uniform.UniformProposalPromptBuilder;
import com.slowind.chunchunhee.domain.openai.uniform.UniformReferenceTeam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenaiImageGenerationService {
    private static final String UNIFORM_EDIT_PROMPT_SUFFIX = """

            [편집 규칙 — 반드시 준수]
            - 마스크 PNG에서 **완전히 투명(alpha=0)인 영역만** 새 디자인으로 채웁니다(OpenAI 이미지 편집 API 규격).
            - 그 외 영역(유니폼 틀·소매·목·밑단·접힘·색·배경)은 입력 템플릿과 **픽셀 단위로 동일**하게 유지합니다.
            - 전체 유니폼을 새로 그리지 말고, 투명 마스크 안에서만 변경합니다.
            - 출력은 입력과 **같은 구도·해상도**여야 합니다.""";

    private static final String PROPOSAL_TEMPLATE_CLASSPATH = "uniform/proposal-template.png";

    @Value("${custom.openai.api-key}")
    private String openaiApiKey;

    /** 기본 gpt-image-1. API 미지원 시 {@link #imageModelFallback} 으로 재시도 */
    @Value("${custom.openai.image-model:gpt-image-1}")
    private String imageModel;

    @Value("${custom.openai.image-model-fallback:gpt-image-2}")
    private String imageModelFallback;

    private final RestClient openaiClient = RestClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .build();

    public ApiV1OpenaiImageController.OpenaiImageResponse generate(String prompt) {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("model", imageModel);
        body.put("prompt", prompt);
        body.put("n", 1);

        Map<?, ?> res = postWithModelFallback(
                (model) -> openaiClient.post()
                        .uri("/images/generations")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("model", model, "prompt", prompt, "n", 1))
                        .retrieve()
                        .body(Map.class)
        );
        return toResponse(res);
    }

    /**
     * 유니폼 틀 PNG + 알파 마스크(편집 영역) + 프롬프트 → OpenAI {@code /v1/images/edits}.
     */
    public ApiV1OpenaiImageController.OpenaiImageResponse editUniformInpaint(
            byte[] templatePng,
            byte[] maskPng,
            String prompt
    ) {
        String augmentedPrompt = prompt.stripTrailing() + UNIFORM_EDIT_PROMPT_SUFFIX;
        String size = resolveGptImageEditSize(templatePng);

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("prompt", augmentedPrompt);
        parts.add("image", namedPng(templatePng, "template.png"));
        parts.add("mask", namedPng(maskPng, "mask.png"));
        parts.add("size", size);
        parts.add("quality", "high");

        Map<?, ?> res = postEditsWithModelFallback(parts);
        return toResponse(res);
    }

    /**
     * 제안서 레이아웃 템플릿 + 사용자 로고 + 레퍼런스 팀 스타일 → 시안 1장.
     */
    public ApiV1OpenaiImageController.OpenaiImageResponse generateUniformProposal(
            String referenceTeamId,
            String kitTypeParam,
            String teamName,
            byte[] logoImageBytes
    ) {
        if (teamName == null || teamName.isBlank()) {
            throw new IllegalArgumentException("teamName은 필수입니다.");
        }

        boolean withLogo = logoImageBytes != null && logoImageBytes.length > 0;

        UniformReferenceTeam team = UniformReferenceTeam.requireById(referenceTeamId);
        UniformKitType kitType = UniformKitType.fromParam(kitTypeParam);
        String prompt = UniformProposalPromptBuilder.build(team, kitType, teamName, withLogo);

        byte[] templatePng = loadProposalTemplate();
        String size = resolveGptImageEditSize(templatePng);

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("prompt", prompt);
        parts.add("image[]", namedPng(templatePng, "proposal-template.png"));
        if (withLogo) {
            parts.add("image[]", namedImage(logoImageBytes, "team-logo.png"));
        }
        parts.add("size", size);
        parts.add("quality", "high");

        Map<?, ?> res = postEditsWithModelFallback(parts);
        return toResponse(res);
    }

    /**
     * 축구화·키퍼 장갑·스포츠 용품 제안서 템플릿 + (선택) 유니폼 시안 참조.
     */
    public ApiV1OpenaiImageController.OpenaiImageResponse generateProductProposal(
            String productId,
            String teamName,
            String notes,
            byte[] uniformReferenceBytes
    ) {
        if (teamName == null || teamName.isBlank()) {
            throw new IllegalArgumentException("teamName은 필수입니다.");
        }

        ProductProposalType type = ProductProposalType.requireByParamId(productId);
        boolean withUniform = uniformReferenceBytes != null && uniformReferenceBytes.length > 0;
        String prompt = ProductProposalPromptBuilder.build(type, teamName, notes, withUniform);

        byte[] templatePng = loadClasspathPng(type.templateClasspath());
        String size = resolveGptImageEditSize(templatePng);

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("prompt", prompt);
        parts.add("image[]", namedPng(templatePng, type.paramId() + "-template.png"));
        if (withUniform) {
            parts.add("image[]", namedImage(uniformReferenceBytes, "uniform-reference.png"));
        }
        parts.add("size", size);
        parts.add("quality", "high");

        Map<?, ?> res = postEditsWithModelFallback(parts);
        return toResponse(res);
    }

    private Map<?, ?> postEditsWithModelFallback(MultiValueMap<String, Object> baseParts) {
        return postWithModelFallback((model) -> {
            MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>(baseParts);
            parts.add("model", model);
            if (model.startsWith("gpt-image-1")) {
                parts.add("input_fidelity", "high");
            }
            return openaiClient.post()
                    .uri("/images/edits")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(parts)
                    .retrieve()
                    .body(Map.class);
        });
    }

    private Map<?, ?> postWithModelFallback(java.util.function.Function<String, Map<?, ?>> call) {
        try {
            return call.apply(imageModel);
        } catch (HttpClientErrorException e) {
            if (imageModelFallback == null
                    || imageModelFallback.isBlank()
                    || imageModelFallback.equals(imageModel)) {
                throw e;
            }
            log.warn("OpenAI image model '{}' failed ({}), retrying with '{}'",
                    imageModel, e.getStatusCode(), imageModelFallback);
            return call.apply(imageModelFallback);
        }
    }

    private byte[] loadProposalTemplate() {
        return loadClasspathPng(PROPOSAL_TEMPLATE_CLASSPATH);
    }

    private byte[] loadClasspathPng(String classpath) {
        ClassPathResource resource = new ClassPathResource(classpath);
        if (!resource.exists()) {
            throw new IllegalStateException("제안서 템플릿이 없습니다: classpath:" + classpath);
        }
        try (InputStream in = resource.getInputStream()) {
            return in.readAllBytes();
        } catch (IOException e) {
            throw new IllegalStateException("제안서 템플릿을 읽지 못했습니다: " + classpath, e);
        }
    }

    /**
     * gpt-image-1/1.5 edits 허용 size: 1024x1024, 1536x1024, 1024x1536, auto.
     * 임의 WxH(예: 1024x560)는 minimum pixel budget 미만으로 거절됨.
     */
    private static String resolveGptImageEditSize(byte[] pngBytes) {
        try {
            BufferedImage img = ImageIO.read(new ByteArrayInputStream(pngBytes));
            if (img == null) {
                return "auto";
            }
            int w = img.getWidth();
            int h = img.getHeight();
            if (w <= 0 || h <= 0) {
                return "auto";
            }
            double aspect = (double) w / h;
            if (aspect >= 1.15) {
                return "1536x1024";
            }
            if (aspect <= 0.87) {
                return "1024x1536";
            }
            return "1024x1024";
        } catch (IOException e) {
            return "auto";
        }
    }

    private static ByteArrayResource namedPng(byte[] data, String filename) {
        return namedImage(data, filename);
    }

    private static ByteArrayResource namedImage(byte[] data, String filename) {
        return new ByteArrayResource(data) {
            @Override
            public String getFilename() {
                return filename;
            }
        };
    }

    @SuppressWarnings("unchecked")
    private ApiV1OpenaiImageController.OpenaiImageResponse toResponse(Map<?, ?> res) {
        if (res == null) {
            throw new IllegalStateException("OpenAI 응답이 비어 있습니다.");
        }
        List<Map<String, Object>> dataList = (List<Map<String, Object>>) res.get("data");
        if (dataList == null || dataList.isEmpty()) {
            throw new IllegalStateException("OpenAI 응답에 data가 없습니다.");
        }
        Map<String, Object> first = dataList.get(0);
        String b64 = first.get("b64_json") != null ? String.valueOf(first.get("b64_json")) : null;
        String url = first.get("url") != null ? String.valueOf(first.get("url")) : null;

        if (b64 != null && !b64.isBlank()) {
            return new ApiV1OpenaiImageController.OpenaiImageResponse(b64, null);
        }
        if (url != null && !url.isBlank()) {
            return new ApiV1OpenaiImageController.OpenaiImageResponse(null, url);
        }
        throw new IllegalStateException("OpenAI 응답에 b64_json/url이 없습니다.");
    }
}
