package com.slowind.chunchunhee.domain.comment.controller;

import com.slowind.chunchunhee.domain.comment.entity.Comment;
import com.slowind.chunchunhee.domain.comment.service.CommentService;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/comments")
public class ApiV1CommentController {
    private final CommentService commentService;

    @Getter
    @AllArgsConstructor
    public static class CommentsResponse {
        private List<Comment> comments;
    }

    @GetMapping("")
    public CommentsResponse getComments(Long postId) {
        List<Comment> comments = commentService.getList(postId);
        return new CommentsResponse(comments);
    }

    @Data
    public static class CommentRequest {
        @NotBlank
        private String commentContent;
    }

    @Getter
    @AllArgsConstructor
    public static class CommentResponse {
        private Comment comment;
    }

    @GetMapping("{id}")
    public CommentResponse getComment(@Valid @PathVariable("id") Long id, @RequestBody CommentRequest commentRequest) {
        Comment comment = commentService.getComment(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 댓글은 존재하지 않습니다.".formatted(id)
        ));

        return new CommentResponse(comment);
    }


    @Data
    public static class WriteCommentRequest {
        @NotNull
        private Long memberId;
        @NotNull
        private Long postId;
        @NotBlank
        private String commentContent;
    }

    @Getter
    @AllArgsConstructor
    public static class WriteCommentResponse {
        private final Comment comment;
    }

    @PostMapping("")
    public WriteCommentResponse writeComment(Long id,String commentContent,@RequestBody WriteCommentRequest writeCommentRequest ) {

        Comment comment = commentService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 댓글은 존재하지 않습니다.".formatted(id)
        ));

        Comment writeComment = commentService.create(id, commentContent, writeCommentRequest.getMemberId(),writeCommentRequest.getPostId());
        return new WriteCommentResponse(writeComment);
    }


    @Data
    public static class ModifyCommentRequest {
        @NotNull
        private Long memberId;
        @NotNull
        private Long postId;
        @NotBlank
        private String commentContent;
    }

    @Getter
    @AllArgsConstructor
    public static class ModifyCommentResponse {
        private final Comment comment;
    }

    @PatchMapping("/{id}")
    public ModifyCommentResponse modifyComment(@Valid @PathVariable("id") Long commentId, @RequestBody ModifyCommentRequest modifyCommentRequest) {
        Comment comment =  commentService.findById(commentId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 게시글은 존재하지 않습니다.".formatted(commentId)
        ));

        Comment updateComment = commentService.update(comment, modifyCommentRequest.getMemberId(), modifyCommentRequest.getPostId(), modifyCommentRequest.getCommentContent() );
        return new ModifyCommentResponse(updateComment);
    }


    @Getter
    @AllArgsConstructor
    public static class RemoveCommentResponse {
        private final Comment comment;
    }
    @DeleteMapping("/{id}")
    public RemoveCommentResponse removeComment(@Valid @PathVariable("id") Long id) {
        Comment comment = commentService.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 게시글은 존재하지 않습니다.".formatted(id)
        ));

        commentService.delete(id);
        return new RemoveCommentResponse(comment);
    }

}
