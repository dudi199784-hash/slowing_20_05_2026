package com.slowind.chunchunhee.global.rsData;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RsData<T> {
    private String resultCode;
    private String resultMessage;
    private T data;

    public static <T> RsData<T> of(String resultCode, String resultMessage, T data) {
        return new RsData<T>(resultCode, resultMessage, data);
    }

    public static <T> RsData<T> of(String resultCode, String resultMessage) {
        return new RsData<T>(resultCode, resultMessage, null);
    }

    @JsonIgnore
    public boolean isSuccess() {
        return resultCode.startsWith("S-");
    }

    @JsonIgnore
    public boolean isFail(){
        return !isSuccess();
    }

}
