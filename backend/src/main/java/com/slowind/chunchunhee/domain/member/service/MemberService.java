package com.slowind.chunchunhee.domain.member.service;

import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.entity.MemberRole;
import com.slowind.chunchunhee.domain.member.repository.MemberRepository;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import com.slowind.chunchunhee.global.jwt.JwtProvider;
import com.slowind.chunchunhee.global.util.ShippingAddressFormatter;
import com.slowind.chunchunhee.global.security.SecurityUser;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    // 모든 사용자 --- 유저 조회
    public List<Member> getMemberLlist() {
        return memberRepository.findAll();
    }

    // 모든 사용자 --- 단일 유저 조회
    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }
    // 멤버 존재 여부
    public Optional<Member> findById(Long id) {
        return memberRepository.findById(id);
    }

    // 모든 사용자 --- 유저 생성
    @Transactional
    public Member createMember(String username, String userId, String userpassword) {
        Member member = Member.builder()
                .username(username)
                .userId(userId)
                .userpassword(passwordEncoder.encode(userpassword))
                .role(MemberRole.USER)
                .build();

        memberRepository.save(member);
        return member;
    }

    // 모든 사용자 --- 유저정보 수정
    public Member updateMember(Member member, String username, String userId, String userpassword) {
        member.setUsername(username);
        member.setUserId(userId);
        if (StringUtils.hasText(userpassword)) {
            member.setUserpassword(passwordEncoder.encode(userpassword));
        }

        memberRepository.save(member);
        return member;
    }

    @Transactional
    public Member updateShipping(
            Member member,
            String shippingReceiver,
            String shippingPhone,
            String shippingZipCode,
            String shippingAddressLine1,
            String shippingAddressLine2,
            String shippingAddress
    ) {
        member.setShippingReceiver(shippingReceiver != null ? shippingReceiver.trim() : null);
        member.setShippingPhone(shippingPhone != null ? shippingPhone.trim() : null);
        member.setShippingZipCode(shippingZipCode != null ? shippingZipCode.trim() : null);
        member.setShippingAddressLine1(shippingAddressLine1 != null ? shippingAddressLine1.trim() : null);
        member.setShippingAddressLine2(shippingAddressLine2 != null ? shippingAddressLine2.trim() : null);
        String full = StringUtils.hasText(shippingAddress)
                ? shippingAddress.trim()
                : ShippingAddressFormatter.formatFull(shippingZipCode, shippingAddressLine1, shippingAddressLine2);
        member.setShippingAddress(full.isEmpty() ? null : full);
        memberRepository.save(member);
        return member;
    }

    // 모든 사용자 --- 유저 탈퇴 / 삭제
    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    public boolean validateToken(String token) {
        return jwtProvider.verify(token);
    }

    /**
     * JWT 서명·만료 + DB에 저장된 단일 세션(sessionId) 일치 여부.
     * 다른 브라우저에서 재로그인하면 이전 accessToken 은 무효화됩니다.
     */
    public boolean validateAccessTokenSession(String token) {
        if (!jwtProvider.verify(token)) {
            return false;
        }
        Map<String, Object> claims = jwtProvider.getClaims(token);
        if (claims == null) {
            return false;
        }
        Object idRaw = claims.get("id");
        if (!(idRaw instanceof Number)) {
            return false;
        }
        long id = ((Number) idRaw).longValue();
        Member member = memberRepository.findById(id).orElse(null);
        if (member == null) {
            return false;
        }
        Object sessionRaw = claims.get("sessionId");
        if (!(sessionRaw instanceof String sessionId) || sessionId.isBlank()) {
            return false;
        }
        String storedSession = member.getRefreshToken();
        if (storedSession == null || storedSession.isBlank()) {
            return false;
        }
        return storedSession.equals(sessionId);
    }

    @Transactional
    public void invalidateSession(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("회원을 찾을 수 없습니다."));
        member.setRefreshToken(null);
        memberRepository.save(member);
    }

    public String refreshAccessToken(String refreshToken) {
        System.out.println("쿠키 refreshToken = " + refreshToken);
        Member member = memberRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 리프래시 토큰입니다."));
        String accesToken = jwtProvider.genAccessToken(member);

        return accesToken;
    }

    public SecurityUser getUserFromAccessToken(String accessToken) {
        Map<String, Object> payloadBody = jwtProvider.getClaims(accessToken);
        long id = ((Number) payloadBody.get("id")).longValue();
        String username = (String) payloadBody.get("username");
        MemberRole role = MemberRole.USER;
        Object roleRaw = payloadBody.get("role");
        if (roleRaw instanceof String s && !s.isBlank()) {
            try {
                role = MemberRole.valueOf(s);
            } catch (IllegalArgumentException ignored) {
                role = MemberRole.USER;
            }
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));

        return new SecurityUser(id, username, "", authorities);
    }

    @Getter
    @AllArgsConstructor
    public static class AuthAndMakeTokensResponseBody {
        private Member member;
        private String accessToken;
    }

    @Transactional
    public AuthAndMakeTokensResponseBody authAndMakeTokens(
            @NotBlank String userId,
            @NotBlank String password,
            boolean force
    ) {
        Member member = memberRepository.findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException(
                "%s 회원은 존재하지않습니다.".formatted(userId))
        );

        if (!passwordEncoder.matches(password, member.getUserpassword())) {
            throw new ResourceNotFoundException("비밀번호가 일치하지않습니다.");
        }

        if (!force && StringUtils.hasText(member.getRefreshToken())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "다른 기기 또는 브라우저에서 이미 로그인되어 있습니다. "
                            + "이 기기에서 로그인하려면 「다른 기기 로그아웃 후 로그인」을 선택하세요."
            );
        }

        String sessionId = UUID.randomUUID().toString();
        member.setRefreshToken(sessionId);
        memberRepository.save(member);

        String accessToken = jwtProvider.genToken(member, sessionId, 60 * 60 * 5);

        return new AuthAndMakeTokensResponseBody(member, accessToken);
    }
}
