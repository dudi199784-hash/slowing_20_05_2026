package com.slowind.chunchunhee.domain.community.entity;

import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.stereotype.Service;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString( callSuper = true )
public class Post extends BaseEntity {

    @ManyToOne
    @JoinColumn( name = "member_id")
    private Member member;

    @ManyToOne
    @JoinColumn( name = "design_id")
    private Design design;

//    @ManyToOne
//    private Comment comments;

    private String postTitle;
    private String postContent;

    private int likeCount;
    private int viewCount;
    private int numberOfComments;
}
