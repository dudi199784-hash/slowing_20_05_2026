package com.slowind.chunchunhee.domain.member.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.slowind.chunchunhee.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class Member extends BaseEntity {
    private String username;
    private String userId;

    @JsonIgnore
    private String userpassword;
    @JsonIgnore
    private String refreshToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MemberRole role = MemberRole.USER;

    /** 기본 배송지 — 수령인 */
    private String shippingReceiver;
    /** 기본 배송지 — 연락처 (010-1234-5678) */
    private String shippingPhone;
    /** 우편번호 5자리 */
    private String shippingZipCode;
    /** 도로명·지번 기본 주소 */
    private String shippingAddressLine1;
    /** 동·호수 등 상세 주소 */
    private String shippingAddressLine2;
    /** 표시용 전체 주소 (우편번호+기본+상세 요약) */
    private String shippingAddress;
}
