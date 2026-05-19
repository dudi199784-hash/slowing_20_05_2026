package com.slowind.chunchunhee.domain.openai.controller;

import com.slowind.chunchunhee.domain.openai.service.OpenaiImageGenerationService;
import com.slowind.chunchunhee.domain.openai.uniform.UniformReferenceTeam;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/openai/images")
public class ApiV1OpenaiImageController {
    private final OpenaiImageGenerationService openaiImageGenerationService;

    @Data
    public static class OpenaiImageRequest {
        @NotBlank(message = "prompt는 필수입니다.")
        private String prompt;
    }

    @Getter
    @AllArgsConstructor
    public static class OpenaiImageResponse {
        private final String b64Json;   // null 가능
        private final String imageUrl; // null 가능
    }

    @PostMapping(value = "/generate", consumes = MediaType.APPLICATION_JSON_VALUE)
    public OpenaiImageResponse generate(@Valid @RequestBody OpenaiImageRequest openaiImageRequest) {
        return openaiImageGenerationService.generate(openaiImageRequest.getPrompt());
    }

    /** 유니폼 틀 + 마스크 인페인트 (multipart: template, mask, prompt) */
    @PostMapping(value = "/edit-uniform", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OpenaiImageResponse editUniform(
            @RequestParam("prompt") @NotBlank String prompt,
            @RequestPart("template") MultipartFile template,
            @RequestPart("mask") MultipartFile mask
    ) {
        try {
            byte[] imageBytes = template.getBytes();
            byte[] maskBytes = mask.getBytes();
            return openaiImageGenerationService.editUniformInpaint(imageBytes, maskBytes, prompt);
        } catch (java.io.IOException e) {
            throw new IllegalStateException("업로드 파일을 읽지 못했습니다.", e);
        }
    }

    /** 레퍼런스 팀 선택 UI용 목록 */
    @GetMapping("/uniform-reference-teams")
    public List<UniformReferenceTeamDto> uniformReferenceTeams() {
        return UniformReferenceTeam.all().stream()
                .map(t -> new UniformReferenceTeamDto(t.id(), t.labelKo()))
                .toList();
    }

    /**
     * 제안서 레이아웃 시안 (multipart: logo + referenceTeamId + kitType + teamName).
     * 템플릿 PNG는 서버 classpath 에 고정.
     */
    @PostMapping(value = "/uniform-proposal", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OpenaiImageResponse uniformProposal(
            @RequestParam("referenceTeamId") @NotBlank String referenceTeamId,
            @RequestParam("kitType") @NotBlank String kitType,
            @RequestParam("teamName") @NotBlank String teamName,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ) {
        try {
            byte[] logoBytes = logo != null && !logo.isEmpty() ? logo.getBytes() : null;
            return openaiImageGenerationService.generateUniformProposal(
                    referenceTeamId,
                    kitType,
                    teamName,
                    logoBytes
            );
        } catch (java.io.IOException e) {
            throw new IllegalStateException("로고 파일을 읽지 못했습니다.", e);
        }
    }

    /**
     * 축구화·키퍼 장갑·스포츠 용품 제안서 (템플릿 서버 고정 + 선택 유니폼 시안).
     */
    @PostMapping(value = "/product-proposal", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public OpenaiImageResponse productProposal(
            @RequestParam("productId") @NotBlank String productId,
            @RequestParam("teamName") @NotBlank String teamName,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestPart(value = "uniformReference", required = false) MultipartFile uniformReference
    ) {
        try {
            byte[] uniformBytes = uniformReference != null && !uniformReference.isEmpty()
                    ? uniformReference.getBytes()
                    : null;
            return openaiImageGenerationService.generateProductProposal(
                    productId,
                    teamName,
                    notes,
                    uniformBytes
            );
        } catch (java.io.IOException e) {
            throw new IllegalStateException("유니폼 참조 이미지를 읽지 못했습니다.", e);
        }
    }

    public record UniformReferenceTeamDto(String id, String labelKo) {
    }
}
