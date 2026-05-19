package com.slowind.chunchunhee.domain.comment.entity;

import com.slowind.chunchunhee.domain.community.entity.Post;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.stereotype.Service;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class Comment extends BaseEntity {
    @ManyToOne
    @JoinColumn( name = "member_id")
    private Member member;

    @ManyToOne
    @JoinColumn( name = "post_id")
    private Post post;

    @NotBlank
    private String commentContent;
}
