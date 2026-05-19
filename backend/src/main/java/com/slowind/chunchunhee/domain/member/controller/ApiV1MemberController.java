package com.slowind.chunchunhee.domain.member.controller;

import com.slowind.chunchunhee.domain.member.dto.MemberDto;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.service.MemberService;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import com.slowind.chunchunhee.global.security.SecurityUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/members")
public class ApiV1MemberController {
    private final MemberService memberService;

    private static void assertSelfOrAdmin(long targetMemberId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SecurityUser su)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "로그인이 필요합니다.");
        }
        boolean admin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (admin) {
            return;
        }
        if (su.getId() != targetMemberId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "다른 회원 정보에 접근할 수 없습니다.");
        }
    }

    // --- inner 클래스 - MembersResponse
    @Getter
    @AllArgsConstructor
    public static class MembersResponse {
        private List<Member> members;
    }

    // --- 유저 다건 조회
    @GetMapping("")
    public MembersResponse getMembers() {
        List<Member> members = memberService.getMemberLlist();
        return new MembersResponse(members);
    }

    // --- inner 클래스 - MemberResponse
    @Getter
    @AllArgsConstructor
    public static class MemberResponse {
        private final Member member;
    }

    // --- 유저 단건 조회
    @GetMapping("{id}")
    public MemberResponse getMember(@PathVariable("id") Long id) {
        assertSelfOrAdmin(id);
        return memberService.findById(id)
                .map( MemberResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%d번 고유넘버를 가진 회원은 존재하지 않습니다.".formatted(id)
                ));
    }

    // --- inner 클래스 - SignUpRequest
    @Data
    public static class SignUpRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String userId;
        @NotBlank
        private String userpassword;
    }

    // --- inner 클래스 - SignUpResponse
    @Getter
    @AllArgsConstructor
    public static class SignUpResponse {
        private final Member member;
    }

    // 유저 회원가입
    @PostMapping("")
    public SignUpResponse signUp(@Valid @RequestBody SignUpRequest signUpRequest) {
        Member singupMember = memberService.createMember(
                                        signUpRequest.getUsername(),
                                        signUpRequest.getUserId(),
                                        signUpRequest.getUserpassword());

        return new SignUpResponse(singupMember);
    }

    // --- inner 클래스 - ModifyRequest
    @Data
    public static class ModifyRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String userId;
        /** 비워 두면 비밀번호는 변경하지 않습니다. */
        private String userpassword;
    }

    // --- inner 클래스 - ModifyResponse
    @Data
    public static class ModifyResponse {
        private final Member member;
    }

    // 유저정보 수정
    @PatchMapping("/{id}")
    public ModifyResponse modify(@Valid @RequestBody ModifyRequest modifyRequest, @PathVariable("id") Long id) {
        assertSelfOrAdmin(id);
        Member member = memberService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 유저는 존재하지 않습니다.".formatted(id)
        ));

        Member updatedMember = memberService.updateMember(
                member,
                modifyRequest.getUsername(),
                modifyRequest.getUserId(),
                modifyRequest.getUserpassword());

        return new ModifyResponse(updatedMember);
    }

    @Data
    public static class ShippingUpdateRequest {
        private String shippingReceiver;
        private String shippingPhone;
        private String shippingZipCode;
        private String shippingAddressLine1;
        private String shippingAddressLine2;
        private String shippingAddress;
    }

    @PatchMapping("/{id}/shipping")
    public MemberResponse updateShipping(
            @PathVariable("id") Long id,
            @RequestBody ShippingUpdateRequest body
    ) {
        assertSelfOrAdmin(id);
        Member member = memberService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 유저는 존재하지 않습니다.".formatted(id)
        ));
        Member updated = memberService.updateShipping(
                member,
                body.getShippingReceiver(),
                body.getShippingPhone(),
                body.getShippingZipCode(),
                body.getShippingAddressLine1(),
                body.getShippingAddressLine2(),
                body.getShippingAddress()
        );
        return new MemberResponse(updated);
    }

    // inner 클래스 - removeResponse
    @Getter
    @AllArgsConstructor
    public static class RemoveResponse {
        private final Member member;
    }

    @DeleteMapping("/{id}")
    public RemoveResponse removeMember(@PathVariable("id") Long id) {
        Member member = memberService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 유저는 존재하지 않습니다.".formatted(id)
        ));

        memberService.deleteMember(id);
        return new RemoveResponse(member);
    }

    // ==== 로그인 관련

    @Data
    public static class LoginRequestBody {
        @NotBlank
        private String userId;
        @NotBlank
        private String password;
        /** true 이면 기존 세션을 끊고 이 기기에서 로그인 */
        private boolean force;
    }

    @Getter
    @AllArgsConstructor
    public static class SessionStatusResponse {
        private final boolean valid;
        private final Long memberId;
        private final String userId;
    }

    @Getter
    @AllArgsConstructor
    public static class LoginResponseBody {
        private MemberDto memberDto;
        private String accessToken;
    }

    @PostMapping("/login")
    public LoginResponseBody login(@Valid @RequestBody LoginRequestBody loginRequest) {
        MemberService.AuthAndMakeTokensResponseBody authAndMakeTokens = memberService.authAndMakeTokens(
                loginRequest.getUserId(),
                loginRequest.getPassword(),
                loginRequest.isForce()
        );
        return new LoginResponseBody(
                new MemberDto(authAndMakeTokens.getMember()),
                authAndMakeTokens.getAccessToken()
        );
    }

    /** JWT + 단일 세션 유효 여부 (프론트 주기 검증용) */
    @GetMapping("/session")
    public SessionStatusResponse session() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SecurityUser su)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "로그인이 필요합니다.");
        }
        Member member = memberService.findById(su.getId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.FORBIDDEN, "회원을 찾을 수 없습니다."));
        return new SessionStatusResponse(true, member.getId(), member.getUserId());
    }

    @PostMapping("/logout")
    public void logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof SecurityUser su) {
            memberService.invalidateSession(su.getId());
        }
    }
}
