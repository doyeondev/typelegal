package com.typelegal.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.UUID;

/**
 * JWT 토큰 생성 및 검증을 담당하는 클래스
 */
@Component
public class JwtConfig {

    // application.properties에서 jwt.secret 값을 가져옴 (이 값은 .env의 JWT_SECRET에서 주입됨)
    @Value("${jwt.secret}")
    private String secretKey;

    // application.properties에서 jwt.expiration 값을 가져옴 (이 값은 .env의 JWT_EXPIRATION에서 주입됨)
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * 토큰에서 사용자 ID 추출
     * 이전에는 이메일을 추출했지만 이제 UUID 문자열을 추출합니다.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    /**
     * 토큰에서 사용자 ID를 UUID로 추출
     */
    public UUID extractUserId(String token) {
        String userId = extractClaim(token, Claims::getSubject);
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            // 이전 버전 토큰 호환성 유지 (이메일 기반 토큰)
            return null;
        }
    }

    /**
     * 토큰의 만료 시간 추출
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 토큰에서 특정 클레임 추출
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 토큰의 모든 클레임 추출
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 토큰 만료 여부 확인
     */
    private Boolean isTokenExpired(String token) {
        // 현재 시간과 토큰의 만료 시간을 비교
        Date now = new Date();
        Date expiration = extractExpiration(token);
        
        // 디버그 로깅
        System.out.println("현재 시간: " + now);
        System.out.println("토큰 만료 시간: " + expiration);
        
        return expiration.before(now);
    }

    /**
     * 사용자 정보로 토큰 생성 - UserDetails 객체 사용
     * @param userDetails 사용자 상세 정보
     * @return JWT 토큰
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // 사용자 이메일 추가 (이전 버전 호환성 유지)
        claims.put("email", userDetails.getUsername());
        
        // userDetails는 email을 username으로 사용 중이므로 member ID를 추출해야 함
        // Member ID를 JWT의 sub로 사용하도록 변경하기 위해선
        // Service 레이어에서 UserDetails를 생성할 때 ID를 찾아 전달해야 함
        return createToken(claims, userDetails.getUsername());
    }
    
    /**
     * 사용자 ID를 직접 지정하여 토큰 생성 (새로운 방식)
     * @param userId 사용자 ID (UUID)
     * @param email 사용자 이메일
     * @return JWT 토큰
     */
    public String generateTokenWithUserId(UUID userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email); // 이메일은 클레임에 추가
        return createToken(claims, userId.toString()); // userId를 subject로 사용
    }

    /**
     * 추가 클레임을 포함한 토큰 생성
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return createToken(extraClaims, userDetails.getUsername());
    }

    /**
     * 토큰 생성 로직
     */
    private String createToken(Map<String, Object> claims, String subject) {
        // 현재 시간 가져오기
        Date now = new Date();
        System.out.println("토큰 생성 시간: " + now);
        
        // 만료 시간 계산 (현재 시간 + jwtExpiration)
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        System.out.println("설정된 만료 시간: " + expiryDate);
        
        return Jwts
                .builder()
                .setClaims(claims)
                .setSubject(subject) // 이제 subject는 userId(UUID)
                .setIssuedAt(now) // 현재 시간으로 발급 시간 설정
                .setExpiration(expiryDate) // 명시적으로 계산된 만료 시간 사용
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰 유효성 검증
     * UserDetails 기반 검증은 이전 버전과의 호환성을 위해 유지
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    
    /**
     * 토큰 유효성 검증 (새로운 방식)
     * 사용자 ID 기반으로 검증
     */
    public Boolean validateTokenWithUserId(String token, UUID userId) {
        try {
            final UUID tokenUserId = extractUserId(token);
            return (tokenUserId != null && tokenUserId.equals(userId) && !isTokenExpired(token));
        } catch (Exception e) {
            // 기존 이메일 기반 토큰인 경우 이 검증은 실패할 수 있음
            return false;
        }
    }

    /**
     * 서명 키 가져오기
     * 시크릿 키가 Base64로 인코딩되어 있지 않은 경우 인코딩
     */
    private Key getSigningKey() {
        try {
            // Base64 디코딩 시도
            byte[] keyBytes = Base64.getDecoder().decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            // Base64가 아닌 경우 인코딩 후 사용
            String encodedKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
            byte[] keyBytes = Base64.getDecoder().decode(encodedKey);
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }
} 