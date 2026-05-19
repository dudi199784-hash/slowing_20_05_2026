package com.slowind.chunchunhee.domain.logoasset.service;

import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.design.service.DesignService;
import com.slowind.chunchunhee.domain.logoasset.dto.LogoAssetDto;
import com.slowind.chunchunhee.domain.logoasset.entity.LogoAsset;
import com.slowind.chunchunhee.domain.logoasset.entity.LogoAssetLike;
import com.slowind.chunchunhee.domain.logoasset.entity.LogoAssetVisibility;
import com.slowind.chunchunhee.domain.logoasset.repository.LogoAssetLikeRepository;
import com.slowind.chunchunhee.domain.logoasset.repository.LogoAssetRepository;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.product.entity.Product;
import com.slowind.chunchunhee.domain.product.repository.ProductRepository;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LogoAssetService {

    private static final int MAX_BYTES = 8 * 1024 * 1024; // 8MB
    private static final int TITLE_MAX = 120;

    private final LocalLogoStorageService localLogoStorageService;
    private final LogoAssetRepository logoAssetRepository;
    private final LogoAssetLikeRepository logoAssetLikeRepository;
    private final ProductRepository productRepository;
    private final DesignService designService;

    @Transactional
    public LogoAsset saveFromBase64Png(String prompt, String b64Png, Member member, String categoryParam) {
        if (member == null) {
            throw new IllegalStateException("로그인한 회원만 저장할 수 있습니다.");
        }
        byte[] bytes = Base64.getDecoder().decode(b64Png);
        if (bytes.length > MAX_BYTES) {
            throw new IllegalArgumentException("이미지가 너무 큽니다. (최대 " + MAX_BYTES + " bytes)");
        }
        String category = resolveCategory(prompt, categoryParam);
        Product product = productRepository.findFirstByCategoryOrderByIdAsc(category)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "카테고리 '%s' 상품이 없습니다. 관리자에게 문의해 주세요.".formatted(category)));

        String title = buildTitle(prompt);
        Design design = designService.create(
                member.getId(),
                product.getId(),
                title,
                prompt,
                category
        );

        String fileName = localLogoStorageService.savePng(bytes);
        String accessPath = "/api/v1/files/logos/" + fileName;

        LogoAsset entity = LogoAsset.builder()
                .prompt(prompt)
                .accessPath(accessPath)
                .member(member)
                .category(category)
                .design(design)
                .visibility(LogoAssetVisibility.PRIVATE)
                .viewCount(0)
                .likeCount(0)
                .build();
        return logoAssetRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<LogoAssetDto> listByMember(Long memberId) {
        if (memberId == null) {
            return List.of();
        }
        List<LogoAsset> assets = logoAssetRepository.findAllByOwnerMemberId(memberId);
        Set<Long> likedIds = likedAssetIds(memberId, assets);
        return assets.stream()
                .filter(a -> a.getMember() != null && memberId.equals(a.getMember().getId()))
                .map(a -> LogoAssetDto.from(a, likedIds.contains(a.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LogoAssetDto> listPublic(String categoryParam, Long viewerMemberId) {
        List<LogoAsset> assets;
        if (StringUtils.hasText(categoryParam) && !"전체".equals(categoryParam.trim())) {
            assets = logoAssetRepository.findByVisibilityAndCategoryOrderByCreateTimeDesc(
                    LogoAssetVisibility.PUBLIC,
                    categoryParam.trim()
            );
        } else {
            assets = logoAssetRepository.findByVisibilityOrderByCreateTimeDesc(LogoAssetVisibility.PUBLIC);
        }
        Set<Long> likedIds = likedAssetIds(viewerMemberId, assets);
        return assets.stream()
                .map(a -> LogoAssetDto.from(a, likedIds.contains(a.getId())))
                .toList();
    }

    @Transactional
    public LogoAssetDto getPublicAsset(Long assetId, Long viewerMemberId, boolean countView) {
        LogoAsset asset = logoAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("디자인을 찾을 수 없습니다."));
        if (asset.getVisibility() != LogoAssetVisibility.PUBLIC) {
            throw new ResourceNotFoundException("디자인을 찾을 수 없습니다.");
        }
        if (countView) {
            asset.setViewCount(asset.getViewCount() + 1);
            logoAssetRepository.save(asset);
        }
        boolean liked = viewerMemberId != null
                && logoAssetLikeRepository.existsByMemberIdAndLogoAssetId(viewerMemberId, assetId);
        return LogoAssetDto.from(asset, liked);
    }

    @Transactional
    public LogoAssetDto updateVisibility(Long assetId, Long memberId, LogoAssetVisibility visibility) {
        LogoAsset asset = getOwnedAsset(assetId, memberId);
        asset.setVisibility(visibility);
        logoAssetRepository.save(asset);
        boolean liked = logoAssetLikeRepository.existsByMemberIdAndLogoAssetId(memberId, assetId);
        return LogoAssetDto.from(asset, liked);
    }

    @Transactional
    public LogoAssetDto toggleLike(Long assetId, Member member) {
        if (member == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        LogoAsset asset = logoAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("디자인을 찾을 수 없습니다."));
        if (asset.getVisibility() != LogoAssetVisibility.PUBLIC) {
            throw new ResourceNotFoundException("공개된 디자인만 좋아요할 수 있습니다.");
        }

        var existing = logoAssetLikeRepository.findByMemberIdAndLogoAssetId(member.getId(), assetId);
        if (existing.isPresent()) {
            logoAssetLikeRepository.delete(existing.get());
            asset.setLikeCount(Math.max(0, asset.getLikeCount() - 1));
        } else {
            logoAssetLikeRepository.save(
                    LogoAssetLike.builder()
                            .member(member)
                            .logoAsset(asset)
                            .build()
            );
            asset.setLikeCount(asset.getLikeCount() + 1);
        }
        logoAssetRepository.save(asset);
        boolean liked = logoAssetLikeRepository.existsByMemberIdAndLogoAssetId(member.getId(), assetId);
        return LogoAssetDto.from(asset, liked);
    }

    @Transactional(readOnly = true)
    public LogoAsset getOwnedAsset(Long assetId, Long memberId) {
        LogoAsset asset = logoAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("디자인을 찾을 수 없습니다."));
        if (asset.getMember() == null || !asset.getMember().getId().equals(memberId)) {
            throw new ResourceNotFoundException("디자인을 찾을 수 없습니다.");
        }
        return asset;
    }

    private Set<Long> likedAssetIds(Long memberId, List<LogoAsset> assets) {
        if (memberId == null || assets.isEmpty()) {
            return Set.of();
        }
        List<Long> ids = assets.stream().map(LogoAsset::getId).toList();
        return new HashSet<>(
                logoAssetLikeRepository.findByMemberIdAndLogoAssetIdIn(memberId, ids).stream()
                        .map(like -> like.getLogoAsset().getId())
                        .toList()
        );
    }

    private static String resolveCategory(String prompt, String categoryParam) {
        if (StringUtils.hasText(categoryParam)) {
            String c = categoryParam.trim();
            if ("로고".equals(c) || "유니폼".equals(c) || "축구화".equals(c)
                    || "키퍼장갑".equals(c) || "스포츠용품".equals(c) || "기타".equals(c)) {
                return c;
            }
        }
        if (prompt != null) {
            if (prompt.contains("유니폼")) return "유니폼";
            if (prompt.contains("축구화")) return "축구화";
            if (prompt.contains("키퍼") || prompt.contains("장갑")) return "키퍼장갑";
            if (prompt.contains("스포츠")) return "스포츠용품";
        }
        return "로고";
    }

    private static String buildTitle(String prompt) {
        if (!StringUtils.hasText(prompt)) {
            return "내 디자인";
        }
        String oneLine = prompt.strip().replaceAll("\\s+", " ");
        if (oneLine.length() <= TITLE_MAX) {
            return oneLine;
        }
        return oneLine.substring(0, TITLE_MAX - 1) + "…";
    }
}
