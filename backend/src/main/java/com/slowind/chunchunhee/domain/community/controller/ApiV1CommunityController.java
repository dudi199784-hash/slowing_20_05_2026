package com.slowind.chunchunhee.domain.community.controller;

import com.slowind.chunchunhee.domain.community.entity.Post;
import com.slowind.chunchunhee.domain.community.service.CommunityService;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/communities")
public class ApiV1CommunityController {
    private final CommunityService communityService;

    @GetMapping("")
    public List<Post> getPosts(Long userId) {
        return communityService.getList(userId);
    }

    @GetMapping("{id}")
    public Post getPostById(@PathVariable Long id) {
        return communityService.getPost(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 게시글은 존재하지 않습니다.".formatted(id)
        ));
    }

    @Data
    public static class WritePostRequest {
        private Long userId;
        private Long designId;

        private String title;
        private String content;
    }

    @Getter
    @AllArgsConstructor
    public static class WritePostResponse {
        private final Post post;
    }

    @PostMapping("")
    public WritePostResponse createPost(@Valid @RequestBody WritePostRequest writePostRequest) {
        Post post = communityService.create(
                writePostRequest.getUserId(),
                writePostRequest.designId,
                writePostRequest.title,
                writePostRequest.content
                );

        return new WritePostResponse(post);
    }

    @Data
    public static class ModifyPostRequest {
        private String title;
        private String content;
    }

    @Getter
    @AllArgsConstructor
    public static class ModifyPostResponse {
        private final Post post;
    }

    @PatchMapping("/{id}")
    public ModifyPostResponse modifyPost(@PathVariable Long id, @Valid @RequestBody ModifyPostRequest modifyPostRequest) {
        Post post = communityService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 게시글은 존재하지 않습니다.".formatted(id)
        ));
        Post updatedPost = communityService.updatePost(
                post,
                modifyPostRequest.getTitle(),
                modifyPostRequest.getContent()
        );
        return new ModifyPostResponse(updatedPost);
    }

    @Data
    public static class ModifyPostLikeViewRequest {
        private int likeCount;
        private int viewCount;
        private int numberOfComments;
    }

    @Getter
    @AllArgsConstructor
    public static class ModifyPostLikeViewResponse {
        private final Post post;
    }

    @PatchMapping("/{id}/like")
    public ModifyPostLikeViewResponse modifyPostLike(@Valid @PathVariable("id") Long id, @RequestBody ModifyPostLikeViewRequest modifyPostLikeViewRequest) {
        Post post = communityService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 게시글은 존재하지 않습니다.".formatted(id)
        ));
        Post updatedPostLike = communityService.updatePostLike(
                post,
                modifyPostLikeViewRequest.getLikeCount(),
                modifyPostLikeViewRequest.getViewCount(),
                modifyPostLikeViewRequest.getNumberOfComments()
        );
        return new ModifyPostLikeViewResponse(updatedPostLike);
    }

    @Getter
    @AllArgsConstructor
    public static class RemovePostResponse {
        private final Post post;
    }

    @DeleteMapping("{id}")
    public RemovePostResponse deletePostById(@PathVariable Long id) {
        Post post = communityService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 회원은 존재하지 않습니다.".formatted(id)
        ));
                communityService.deleteById(id);
        return new RemovePostResponse(post);
    }
}
