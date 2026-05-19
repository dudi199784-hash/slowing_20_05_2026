package com.slowind.chunchunhee.domain.logoasset.dto;

import com.slowind.chunchunhee.domain.logoasset.entity.LogoAsset;
import com.slowind.chunchunhee.domain.logoasset.entity.LogoAssetVisibility;
import com.slowind.chunchunhee.domain.member.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class LogoAssetDto {
    private final Long id;
    private final String prompt;
    private final String accessPath;
    private final String category;
    private final Long designId;
    private final Long productId;
    private final LocalDateTime createdAt;
    private final String visibility;
    private final int viewCount;
    private final int likeCount;
    private final String authorName;
    private final Long ownerMemberId;
    private final String ownerUserId;
    private final Boolean likedByMe;

    public static LogoAssetDto from(LogoAsset asset) {
        return from(asset, null);
    }

    public static LogoAssetDto from(LogoAsset asset, Boolean likedByMe) {
        Long designId = asset.getDesign() != null ? asset.getDesign().getId() : null;
        Long productId = asset.getDesign() != null && asset.getDesign().getProduct() != null
                ? asset.getDesign().getProduct().getId()
                : null;
        LogoAssetVisibility vis = asset.getVisibility() != null
                ? asset.getVisibility()
                : LogoAssetVisibility.PRIVATE;
        Member owner = asset.getMember();
        Long ownerMemberId = owner != null ? owner.getId() : null;
        String ownerUserId = owner != null ? owner.getUserId() : null;
        return new LogoAssetDto(
                asset.getId(),
                asset.getPrompt(),
                asset.getAccessPath(),
                asset.getCategory(),
                designId,
                productId,
                asset.getCreateTime(),
                vis.name(),
                asset.getViewCount(),
                asset.getLikeCount(),
                resolveAuthorName(owner),
                ownerMemberId,
                ownerUserId,
                likedByMe
        );
    }

    private static String resolveAuthorName(Member member) {
        if (member == null) {
            return "익명";
        }
        if (member.getUsername() != null && !member.getUsername().isBlank()) {
            return member.getUsername();
        }
        return member.getUserId() != null ? member.getUserId() : "회원";
    }
}
