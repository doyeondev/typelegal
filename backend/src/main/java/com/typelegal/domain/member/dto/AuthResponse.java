package com.typelegal.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * 인증 응답에 사용하는 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private UUID id; // 사용자 ID (UUID 형식)
    private String token; // JWT 토큰
    private String email; // 이메일
    private String name; // 이름
    private String role; // 사용자 역할
    private boolean submittedSurvey; // 설문 제출 여부
} 