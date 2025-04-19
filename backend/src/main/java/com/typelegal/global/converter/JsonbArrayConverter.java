package com.typelegal.global.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Supabase의 jsonb 배열(stringified json list) → List<Map<String, Object>> 컨버터
 */
@Converter
public class JsonbArrayConverter implements AttributeConverter<List<Map<String, Object>>, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Map<String, Object>> attribute) {
        try {
            if (attribute == null) return null;

            // 각 Map을 JSON 문자열로 바꾸고 → 문자열 배열로 저장
            List<String> jsonStrings = new ArrayList<>();
            for (Map<String, Object> map : attribute) {
                jsonStrings.add(objectMapper.writeValueAsString(map));
            }
            return objectMapper.writeValueAsString(jsonStrings);
        } catch (Exception e) {
            throw new IllegalArgumentException("options 쓰기 실패", e);
        }
    }

    @Override
    public List<Map<String, Object>> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.isBlank()) return new ArrayList<>();

            // 1. 문자열 리스트로 먼저 파싱
            List<String> rawJsonList = objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
            
            // 2. 각 문자열을 Map으로 변환
            List<Map<String, Object>> result = new ArrayList<>();
            for (String json : rawJsonList) {
                result.add(objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {}));
            }

            return result;
        } catch (Exception e) {
            throw new IllegalArgumentException("options 읽기 실패", e);
        }
    }
}
