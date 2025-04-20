package com.typelegal.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * API 응답 래퍼 클래스
 * 모든 API 응답을 일관된 형식으로 제공합니다.
 * 테스트 코드에서 $.data 경로를 사용하여 접근할 수 있습니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private T data;

    /**
     * 데이터만 포함하는 API 응답을 생성합니다.
     * @param data 응답 데이터
     * @return ApiResponse 객체
     */
    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data);
    }
} 