package com.slowind.chunchunhee.domain.logoasset.repository;

import com.slowind.chunchunhee.domain.logoasset.entity.LogoAsset;
import com.slowind.chunchunhee.domain.logoasset.entity.LogoAssetVisibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LogoAssetRepository extends JpaRepository<LogoAsset, Long> {

    Optional<LogoAsset> findFirstByDesign_IdOrderByCreateTimeDesc(Long designId);

    @Query("""
            SELECT a FROM LogoAsset a
            WHERE a.member IS NOT NULL AND a.member.id = :memberId
            ORDER BY a.createTime DESC
            """)
    List<LogoAsset> findAllByOwnerMemberId(@Param("memberId") Long memberId);

    List<LogoAsset> findByVisibilityOrderByCreateTimeDesc(LogoAssetVisibility visibility);

    List<LogoAsset> findByVisibilityAndCategoryOrderByCreateTimeDesc(
            LogoAssetVisibility visibility,
            String category
    );
}
