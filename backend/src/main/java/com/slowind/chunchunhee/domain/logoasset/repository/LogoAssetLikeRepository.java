package com.slowind.chunchunhee.domain.logoasset.repository;

import com.slowind.chunchunhee.domain.logoasset.entity.LogoAssetLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LogoAssetLikeRepository extends JpaRepository<LogoAssetLike, Long> {
    Optional<LogoAssetLike> findByMemberIdAndLogoAssetId(Long memberId, Long logoAssetId);

    boolean existsByMemberIdAndLogoAssetId(Long memberId, Long logoAssetId);

    List<LogoAssetLike> findByMemberIdAndLogoAssetIdIn(Long memberId, Collection<Long> logoAssetIds);

    void deleteByMemberIdAndLogoAssetId(Long memberId, Long logoAssetId);
}
