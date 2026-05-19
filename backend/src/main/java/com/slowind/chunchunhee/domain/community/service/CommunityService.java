package com.slowind.chunchunhee.domain.community.service;

import com.slowind.chunchunhee.domain.community.entity.Post;
import com.slowind.chunchunhee.domain.community.repository.CommunityRepository;
import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.design.repository.DesignRepository;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.repository.MemberRepository;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommunityService {
    private final CommunityRepository communityRepository;
    private final MemberRepository memberRepository;
    private final DesignRepository designRepository;

    public List<Post> getList(Long userId) {
        if (userId != null) {
            return communityRepository.findByMemberId(userId);
        }
        return communityRepository.findAll();
    }

    public Optional<Post> getPost(Long id) {
        return communityRepository.findById(id);
    }

    public Optional<Post> findById(Long id) {
        return communityRepository.findById(id);
    }

    public Post create(Long userId, Long designId, String title, String content) {

        Member member = memberRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 회원은 존재하지 않습니다.".formatted(userId)
                ));
        Design design = designRepository.findById(designId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 디자인은 존재하지 않습니다.".formatted(designId)
        ));

        Post post = Post.builder()
                .member(member)
                .design(design)
                .postTitle(title)
                .postContent(content)
                .likeCount(0)
                .viewCount(0)
                .numberOfComments(0)
                .build();

        communityRepository.save(post);
        return post;
    }

    public Post updatePost(Post post, String postTitle, String postContent) {
        post.setPostTitle(postTitle);
        post.setPostContent(postContent);
        communityRepository.save(post);
        return post;
    }

    public void deleteById(Long id) {
        communityRepository.deleteById(id);
    }

    public Post updatePostLike(Post post, int likeCount, int viewCount,  int numberOfComments) {
        post.setLikeCount(likeCount);
        post.setViewCount(viewCount);
        post.setNumberOfComments(numberOfComments);
        communityRepository.save(post);
        return post;
    }
}
