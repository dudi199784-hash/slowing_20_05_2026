package com.slowind.chunchunhee.domain.logoasset.entity;

import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "logo_asset")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class LogoAsset extends BaseEntity {

    @Column(nullable = false, length = 2000)
    private String prompt;

    /** 예: /api/v1/files/logos/{uuid}.png — 프론트는 baseURL + 이 문자열로 img 요청 */
    @Column(nullable = false, length = 500)
    private String accessPath;

    @ManyToOne(optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /** 로고 | 유니폼 — 장바구니·상품 매핑용 */
    @Column(length = 20)
    private String category;

    @ManyToOne
    @JoinColumn(name = "design_id")
    private Design design;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LogoAssetVisibility visibility = LogoAssetVisibility.PRIVATE;

    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Builder.Default
    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;
}