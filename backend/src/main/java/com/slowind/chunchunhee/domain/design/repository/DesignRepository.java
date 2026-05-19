package com.slowind.chunchunhee.domain.design.repository;

import com.slowind.chunchunhee.domain.design.entity.Design;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignRepository extends JpaRepository<Design,Long> {
    List<Design> findByProductCategory(String category);
    List<Design> findByMemberId(Long userSerial);
    List<Design> findByMemberIdAndProductCategory(Long userSerial, String category);

}
