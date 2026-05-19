package com.slowind.chunchunhee.global.util;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.Map;

public class Util {
    public static class json{
        public static Object toStr(Map<String, Object> map) {
            try {
                return new ObjectMapper().writeValueAsString(map);
            }catch (Exception e){
                return null;
            }
        }
    }
    public static Map<String, Object> toMap(String jsonStr) {
        try {
            return new ObjectMapper().readValue(jsonStr, LinkedHashMap.class);
        }catch (Exception e){
            return null;
        }
    }
}
