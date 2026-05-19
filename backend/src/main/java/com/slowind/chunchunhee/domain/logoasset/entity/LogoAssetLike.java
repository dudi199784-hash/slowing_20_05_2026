package com.slowind.chunchunhee.domain.logoasset.entity;

import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "logo_asset_like",
        uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "logo_asset_id"})
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class LogoAssetLike extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(optional = false)
    @JoinColumn(name = "logo_asset_id")
    private LogoAsset logoAsset;
}
