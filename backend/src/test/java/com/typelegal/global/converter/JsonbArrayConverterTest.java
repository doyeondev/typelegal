package com.typelegal.global.converter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * JsonbArrayConverter 테스트 클래스
 * JSON 배열과 List<Map<String, Object>> 간의 변환 기능을 테스트합니다.
 */
public class JsonbArrayConverterTest {

    private JsonbArrayConverter converter;
    private List<Map<String, Object>> sampleData;

    @BeforeEach
    public void setUp() {
        converter = new JsonbArrayConverter();
        
        // 테스트용 샘플 데이터 생성
        sampleData = new ArrayList<>();
        
        Map<String, Object> item1 = new HashMap<>();
        item1.put("id", 1);
        item1.put("name", "옵션 1");
        item1.put("value", "option_1");
        
        Map<String, Object> item2 = new HashMap<>();
        item2.put("id", 2);
        item2.put("name", "옵션 2");
        item2.put("value", "option_2");
        item2.put("isDefault", true);
        
        Map<String, Object> item3 = new HashMap<>();
        item3.put("id", 3);
        item3.put("name", "옵션 3");
        item3.put("value", "option_3");
        item3.put("isDisabled", true);
        
        sampleData.add(item1);
        sampleData.add(item2);
        sampleData.add(item3);
    }

    /**
     * 데이터베이스 컬럼으로 변환 테스트
     * List<Map<String, Object>>를 JSON 문자열로 변환하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("List<Map<String, Object>>를 JSON 문자열로 변환")
    public void shouldConvertAttributeToDatabaseColumn() {
        // when
        String jsonString = converter.convertToDatabaseColumn(sampleData);
        
        // then
        assertThat(jsonString).isNotNull();
        assertThat(jsonString).contains("옵션 1");
        assertThat(jsonString).contains("옵션 2");
        assertThat(jsonString).contains("옵션 3");
        assertThat(jsonString).contains("option_1");
        assertThat(jsonString).contains("option_2");
        assertThat(jsonString).contains("option_3");
        assertThat(jsonString).contains("isDefault");
        assertThat(jsonString).contains("isDisabled");
    }

    /**
     * 엔티티 속성으로 변환 테스트
     * JSON 문자열을 List<Map<String, Object>>로 변환하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("JSON 문자열을 List<Map<String, Object>>로 변환")
    public void shouldConvertDatabaseColumnToAttribute() {
        // given
        String jsonString = converter.convertToDatabaseColumn(sampleData);
        
        // when
        List<Map<String, Object>> result = converter.convertToEntityAttribute(jsonString);
        
        // then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        
        // 첫 번째 항목 검증
        assertThat(result.get(0)).containsEntry("id", 1);
        assertThat(result.get(0)).containsEntry("name", "옵션 1");
        assertThat(result.get(0)).containsEntry("value", "option_1");
        
        // 두 번째 항목 검증
        assertThat(result.get(1)).containsEntry("id", 2);
        assertThat(result.get(1)).containsEntry("name", "옵션 2");
        assertThat(result.get(1)).containsEntry("value", "option_2");
        assertThat(result.get(1)).containsEntry("isDefault", true);
        
        // 세 번째 항목 검증
        assertThat(result.get(2)).containsEntry("id", 3);
        assertThat(result.get(2)).containsEntry("name", "옵션 3");
        assertThat(result.get(2)).containsEntry("value", "option_3");
        assertThat(result.get(2)).containsEntry("isDisabled", true);
    }

    /**
     * null 입력 처리 테스트
     * null 입력이 올바르게 처리되는지 테스트합니다.
     */
    @Test
    @DisplayName("null 입력 처리")
    public void shouldHandleNullInput() {
        // when
        String result = converter.convertToDatabaseColumn(null);
        
        // then
        assertThat(result).isNull();
    }

    /**
     * 빈 JSON 문자열 처리 테스트
     * 빈 JSON 문자열이 올바르게 처리되는지 테스트합니다.
     */
    @Test
    @DisplayName("빈 JSON 문자열 처리")
    public void shouldHandleEmptyJsonString() {
        // when
        List<Map<String, Object>> result = converter.convertToEntityAttribute("");
        
        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    /**
     * 빈 리스트 변환 테스트
     * 빈 리스트가 올바르게 변환되는지 테스트합니다.
     */
    @Test
    @DisplayName("빈 리스트 변환")
    public void shouldConvertEmptyList() {
        // given
        List<Map<String, Object>> emptyList = new ArrayList<>();
        
        // when
        String jsonString = converter.convertToDatabaseColumn(emptyList);
        List<Map<String, Object>> result = converter.convertToEntityAttribute(jsonString);
        
        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    /**
     * 중첩된 객체 변환 테스트
     * 중첩된 객체가 포함된 데이터가 올바르게 변환되는지 테스트합니다.
     */
    @Test
    @DisplayName("중첩된 객체 변환")
    public void shouldConvertNestedObjects() {
        // given
        List<Map<String, Object>> nestedData = new ArrayList<>();
        
        Map<String, Object> item = new HashMap<>();
        item.put("id", 1);
        item.put("name", "중첩 객체 테스트");
        
        Map<String, Object> nestedObject = new HashMap<>();
        nestedObject.put("key1", "value1");
        nestedObject.put("key2", 123);
        
        item.put("nested", nestedObject);
        nestedData.add(item);
        
        // when
        String jsonString = converter.convertToDatabaseColumn(nestedData);
        List<Map<String, Object>> result = converter.convertToEntityAttribute(jsonString);
        
        // then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsKey("nested");
        
        @SuppressWarnings("unchecked")
        Map<String, Object> resultNestedObject = (Map<String, Object>) result.get(0).get("nested");
        assertThat(resultNestedObject).containsEntry("key1", "value1");
        assertThat(resultNestedObject).containsEntry("key2", 123);
    }

    /**
     * 잘못된 입력 처리 테스트
     * 잘못된 형식의 JSON 문자열 입력이 올바르게 처리되는지 테스트합니다.
     */
    @Test
    @DisplayName("잘못된 입력 처리")
    public void shouldHandleInvalidInput() {
        // Invalid JSON string
        String invalidJson = "This is not a valid JSON string";
        
        // then
        assertThatThrownBy(() -> converter.convertToEntityAttribute(invalidJson))
                .isInstanceOf(IllegalArgumentException.class);
    }
} 