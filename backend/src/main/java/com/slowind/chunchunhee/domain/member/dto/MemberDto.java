package com.slowind.chunchunhee.domain.member.dto;

import com.slowind.chunchunhee.domain.member.entity.Member;
import com.slowind.chunchunhee.domain.member.entity.MemberRole;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MemberDto {
    private Long id;
    /** 로그인 아이디 */
    private String userId;
    /** 화면에 보이는 이름(로그인 아이디와 다를 수 있음) */
    private String username;
    private MemberRole role;
    private LocalDateTime createTime;
    private LocalDateTime modifyTime;
    private String shippingReceiver;
    private String shippingPhone;
    private String shippingZipCode;
    private String shippingAddressLine1;
    private String shippingAddressLine2;
    private String shippingAddress;

    public MemberDto(Member member) {
        this.id = member.getId();
        this.userId = member.getUserId();
        this.username = member.getUsername();
        this.role = member.getRole();
        this.createTime = member.getCreateTime();
        this.modifyTime = member.getUpdateTime();
        this.shippingReceiver = member.getShippingReceiver();
        this.shippingPhone = member.getShippingPhone();
        this.shippingZipCode = member.getShippingZipCode();
        this.shippingAddressLine1 = member.getShippingAddressLine1();
        this.shippingAddressLine2 = member.getShippingAddressLine2();
        this.shippingAddress = member.getShippingAddress();
    }
}
