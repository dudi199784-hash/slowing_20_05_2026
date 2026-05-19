package com.slowind.chunchunhee.domain.member.repository;

import com.slowind.chunchunhee.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    /** 로그인 아이디(`Member.userId`)로만 조회 — 파라미터 이름만으로는 JPA가 오해할 수 있어 JPQL 고정 */
    @Query("SELECT m FROM Member m WHERE m.userId = :loginUserId")
    Optional<Member> findByUserId(@Param("loginUserId") String loginUserId);

    Optional<Member> findByRefreshToken(String refreshToken);
}
