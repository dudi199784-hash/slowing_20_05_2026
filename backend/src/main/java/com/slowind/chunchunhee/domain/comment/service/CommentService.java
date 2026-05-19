package com.slowind.chunchunhee.domain.comment.service;

import com.slowind.chunchunhee.domain.comment.entity.Comment;
import com.slowind.chunchunhee.domain.comment.repository.CommentRepository;
import com.slowind.chunchunhee.domain.community.entity.Post;
import com.slowind.chunchunhee.domain.community.repository.CommunityRepository;
import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.repository.MemberRepository;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final CommunityRepository communityRepository;

    public List<Comment> getList(Long postId) {
        if ( postId != null ) {
            return commentRepository.findByPostId(postId);
        }
        return commentRepository.findAll();
    }

    public Optional<Comment> getComment(Long commentId) {
        return commentRepository.findById(commentId);
    }

    public Optional<Comment> findById(Long commentId) {
        return commentRepository.findById(commentId);
    }

    public Comment create(Long id, String commentContent, Long memberId,Long postId) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new ResourceNotFoundException(
                "%d반 회원은 존재하지 않습니다.".formatted(memberId)
        ));
        Post post = communityRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 게시글은 존재하지 않습니다.".formatted(postId)
        ));

        Comment comment = Comment.builder()
                .member(member)
                .post(post)
                .commentContent(commentContent)
                .build();
        commentRepository.save(comment);
        return comment;
    }

    public Comment update(Comment comment, @NotNull Long memberId, @NotNull Long postId, @NotBlank String commentContent) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new ResourceNotFoundException(
                "%d반 회원은 존재하지 않습니다.".formatted(memberId)
        ));
        Post post = communityRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 게시글은 존재하지 않습니다.".formatted(postId)
        ));

        comment.setCommentContent(commentContent);

        commentRepository.save(comment);
        return comment;
    }

    public void delete(@Valid Long id) {
        commentRepository.deleteById(id);
    }
}
