package com.slowind.chunchunhee.domain.community.repository;

import com.slowind.chunchunhee.domain.community.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityRepository extends JpaRepository<Post, Long> {
    List<Post> findByMemberId(Long memberId);
}
