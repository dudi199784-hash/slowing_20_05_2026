package com.slowind.chunchunhee.domain.logoasset.controller;

import com.slowind.chunchunhee.domain.logoasset.dto.LogoAssetDto;
import com.slowind.chunchunhee.domain.logoasset.entity.LogoAsset;
import com.slowind.chunchunhee.domain.logoasset.entity.LogoAssetVisibility;
import com.slowind.chunchunhee.domain.logoasset.service.LogoAssetService;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.repository.MemberRepository;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import com.slowind.chunchunhee.global.security.SecurityUser;
import com.slowind.chunchunhee.global.rq.Rq;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/logo-assets")
public class ApiV1LogoAssetController {

    private final LogoAssetService logoAssetService;
    private final Rq rq;
    private final MemberRepository memberRepository;

    @Data
    public static class SaveRequest {
        @NotBlank
        private String prompt;
        @NotBlank
        private String b64Png;
        private String category;
    }

    @Data
    public static class VisibilityRequest {
        @NotBlank
        private String visibility;
    }

    @Getter
    @AllArgsConstructor
    public static class SaveResponse {
        private final Long id;
        private final String accessPath;
        private final String category;
        private final Long designId;
        private final Long productId;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public SaveResponse save(@Valid @RequestBody SaveRequest body) {
        Member member = requireLoginMember();
        LogoAsset saved = logoAssetService.saveFromBase64Png(
                body.getPrompt(),
                body.getB64Png(),
                member,
                body.getCategory()
        );
        Long designId = saved.getDesign() != null ? saved.getDesign().getId() : null;
        Long productId = saved.getDesign() != null && saved.getDesign().getProduct() != null
                ? saved.getDesign().getProduct().getId()
                : null;
        return new SaveResponse(
                saved.getId(),
                saved.getAccessPath(),
                saved.getCategory(),
                designId,
                productId
        );
    }

    @GetMapping("/mine")
    public List<LogoAssetDto> myAssets() {
        long memberId = requireLoginMemberId();
        return logoAssetService.listByMember(memberId);
    }

    /** 구경하기 — 공개(모두보기) 디자인 목록 */
    @GetMapping("/browse")
    public List<LogoAssetDto> browse(@RequestParam(value = "category", required = false) String category) {
        Long viewerId = currentMemberIdOrNull();
        return logoAssetService.listPublic(category, viewerId);
    }

    /** 구경하기 상세 — `countView=false` 이면 조회수 증가 없이 조회만 */
    @GetMapping("/browse/{id}")
    public LogoAssetDto browseOne(
            @PathVariable("id") Long id,
            @RequestParam(value = "countView", defaultValue = "true") boolean countView
    ) {
        Long viewerId = currentMemberIdOrNull();
        return logoAssetService.getPublicAsset(id, viewerId, countView);
    }

    @PatchMapping("/{id}/visibility")
    public LogoAssetDto updateVisibility(
            @PathVariable("id") Long id,
            @Valid @RequestBody VisibilityRequest body
    ) {
        Member member = requireLoginMember();
        LogoAssetVisibility visibility = LogoAssetVisibility.fromParam(body.getVisibility());
        return logoAssetService.updateVisibility(id, member.getId(), visibility);
    }

    @PostMapping("/{id}/like")
    public LogoAssetDto toggleLike(@PathVariable("id") Long id) {
        Member member = requireLoginMember();
        return logoAssetService.toggleLike(id, member);
    }

    private Member requireLoginMember() {
        long memberId = requireLoginMemberId();
        return memberRepository.findById(memberId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.FORBIDDEN, "회원을 찾을 수 없습니다."));
    }

    /** JWT 에 담긴 회원 id 만 사용 (localStorage 와 어긋나도 서버 기준) */
    private long requireLoginMemberId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SecurityUser su)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "로그인이 필요합니다.");
        }
        return su.getId();
    }

    private Long currentMemberIdOrNull() {
        Member member = rq.getMember();
        return member != null ? member.getId() : null;
    }
}
