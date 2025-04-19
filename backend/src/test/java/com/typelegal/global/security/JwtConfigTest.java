package com.typelegal.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.openMocks;

/**
 * JwtConfig 테스트 클래스
 * JWT 토큰 생성 및 검증 기능을 테스트합니다.
 */
public class JwtConfigTest {

    @InjectMocks
    private JwtConfig jwtConfig;

    @Mock
    private UserDetails userDetails;

    private final String SECRET_KEY = "testSecretKey1234567890AbcdefghijklmnopqrstuvwxyzTestSecretKey";
    private final long EXPIRATION = 3600000; // 1시간 (밀리초)

    @BeforeEach
    public void setUp() {
        openMocks(this);
        
        // 프로퍼티 값 주입
        ReflectionTestUtils.setField(jwtConfig, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtConfig, "jwtExpiration", EXPIRATION);

        // UserDetails 목 설정
        when(userDetails.getUsername()).thenReturn("test@example.com");
    }

    /**
     * JWT 토큰 생성 테스트
     * 기본 토큰 생성 기능이 정상 작동하는지 테스트합니다.
     */
    @Test
    @DisplayName("JWT 토큰 생성 - 기본")
    public void shouldGenerateTokenWithUserDetails() {
        // when
        String token = jwtConfig.generateToken(userDetails);

        // then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        
        // 토큰 포맷 확인 (3개의 세그먼트로 구성)
        String[] tokenParts = token.split("\\.");
        assertThat(tokenParts).hasSize(3);
    }

    /**
     * JWT 토큰에서 사용자 이름 추출 테스트
     * 토큰에서 사용자 이름(이메일)을 올바르게 추출하는지 테스트합니다.
     */
    @Test
    @DisplayName("JWT 토큰에서 사용자 이름 추출")
    public void shouldExtractUsernameFromToken() {
        // given
        String token = jwtConfig.generateToken(userDetails);

        // when
        String extractedUsername = jwtConfig.extractUsername(token);

        // then
        assertThat(extractedUsername).isEqualTo("test@example.com");
    }

    /**
     * UUID 기반 토큰 생성 및 추출 테스트
     * UUID를 사용하여 토큰을 생성하고 추출하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("UUID 기반 토큰 생성 및 추출")
    public void shouldGenerateAndExtractTokenWithUserId() {
        // given
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";

        // when
        String token = jwtConfig.generateTokenWithUserId(userId, email);
        UUID extractedUserId = jwtConfig.extractUserId(token);
        String extractedEmail = jwtConfig.extractClaim(token, claims -> claims.get("email", String.class));

        // then
        assertThat(token).isNotNull();
        assertThat(extractedUserId).isEqualTo(userId);
        assertThat(extractedEmail).isEqualTo(email);
    }

    /**
     * 토큰 만료 테스트
     * 만료된 토큰이 올바르게 검증되는지 테스트합니다.
     */
    @Test
    @DisplayName("만료된 토큰 검증")
    public void shouldValidateTokenExpiration() throws Exception {
        // given - 만료 시간이 과거인 토큰 생성
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", "test@example.com");
        String expiredToken = createExpiredToken(claims, "test@example.com");

        // when & then - validateToken 메서드는 내부적으로 isTokenExpired를 호출함
        // 여기서는 private 메서드를 직접 테스트하기 어려우므로 public API로 간접 테스트
        assertThat(jwtConfig.validateToken(expiredToken, userDetails)).isFalse();
    }

    /**
     * 유효한 토큰 검증 테스트
     * 유효한 토큰이 올바르게 검증되는지 테스트합니다.
     */
    @Test
    @DisplayName("유효한 토큰 검증")
    public void shouldValidateValidToken() {
        // given
        String token = jwtConfig.generateToken(userDetails);

        // when
        boolean isValid = jwtConfig.validateToken(token, userDetails);

        // then
        assertThat(isValid).isTrue();
    }

    /**
     * UUID 기반 토큰 검증 테스트
     * UUID 기반 토큰이 올바르게 검증되는지 테스트합니다.
     */
    @Test
    @DisplayName("UUID 기반 토큰 검증")
    public void shouldValidateTokenWithUserId() {
        // given
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";
        String token = jwtConfig.generateTokenWithUserId(userId, email);

        // when
        boolean isValid = jwtConfig.validateTokenWithUserId(token, userId);

        // then
        assertThat(isValid).isTrue();
    }

    /**
     * 추가 클레임으로 토큰 생성 테스트
     * 추가 클레임이 포함된 토큰 생성이 정상 작동하는지 테스트합니다.
     */
    @Test
    @DisplayName("추가 클레임으로 토큰 생성")
    public void shouldGenerateTokenWithExtraClaims() {
        // given
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ADMIN");
        extraClaims.put("name", "Test User");

        // when
        String token = jwtConfig.generateToken(extraClaims, userDetails);
        String extractedRole = jwtConfig.extractClaim(token, claims -> claims.get("role", String.class));
        String extractedName = jwtConfig.extractClaim(token, claims -> claims.get("name", String.class));

        // then
        assertThat(token).isNotNull();
        assertThat(extractedRole).isEqualTo("ADMIN");
        assertThat(extractedName).isEqualTo("Test User");
    }

    /**
     * 도우미 메서드: 만료된 토큰 생성
     */
    private String createExpiredToken(Map<String, Object> claims, String subject) {
        long currentTimeMillis = System.currentTimeMillis();
        Date now = new Date(currentTimeMillis);
        Date expiration = new Date(currentTimeMillis - 1000); // 현재보다 1초 전 만료
        
        String base64EncodedSecretKey = java.util.Base64.getEncoder().encodeToString(SECRET_KEY.getBytes());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        java.util.Base64.getDecoder().decode(base64EncodedSecretKey)
                ), io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
    }
} 