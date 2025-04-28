package com.typelegal.global.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * JWT 인증 필터
 * 모든 HTTP 요청에 대해 JWT 토큰을 검증하고 인증 처리
 * Authorization 헤더 또는 쿠키에서 토큰 추출 지원
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtConfig jwtConfig;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtConfig jwtConfig, UserDetailsService userDetailsService) {
        this.jwtConfig = jwtConfig;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // OPTIONS 메소드(CORS preflight)는 인증 처리 없이 통과
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        // JWT 토큰 추출 시도 (헤더 또는 쿠키에서)
        String jwt = extractJwtFromRequest(request);
        
        // 토큰이 없는 경우 다음 필터로 넘김
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // 토큰에서 정보 추출 시도
            // 새로운 방식(UUID 기반)과 이전 방식(이메일 기반) 모두 지원
            
            // 1. UUID로 변환 시도 (새로운 방식)
            UUID userId = jwtConfig.extractUserId(jwt);
            String userEmail = null;
            
            // UUID 변환에 실패하면 이메일 기반 토큰으로 간주
            if (userId == null) {
                // 2. 이전 방식 - 이메일을 직접 추출
                userEmail = jwtConfig.extractUsername(jwt);
                logger.info("이메일 기반 토큰 감지: " + userEmail);
            } else {
                // UUID 기반 토큰에서 이메일 클레임 추출
                userEmail = jwtConfig.extractClaim(jwt, claims -> claims.get("email", String.class));
                logger.info("UUID 기반 토큰 감지: ID=" + userId + ", 이메일=" + userEmail);
            }
            
            // 이메일을 찾을 수 없으면 인증 실패
            if (userEmail == null) {
                logger.error("토큰에서 사용자 정보를 추출할 수 없습니다.");
                filterChain.doFilter(request, response);
                return;
            }
            
            // 사용자 이메일이 존재하고 인증이 되어있지 않은 경우에만 처리
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                boolean isValid;
                
                // UUID 기반 토큰이면 새로운 검증 방법 사용
                if (userId != null) {
                    isValid = jwtConfig.validateTokenWithUserId(jwt, userId);
                } else {
                    // 이메일 기반 토큰이면 기존 검증 방법 사용
                    isValid = jwtConfig.validateToken(jwt, userDetails);
                }
                
                // 토큰이 유효한 경우 인증 정보 설정
                if (isValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    logger.info("사용자 인증 성공: " + userEmail);
                } else {
                    logger.error("토큰 검증 실패");
                }
            }
        } catch (Exception e) {
            logger.error("JWT 토큰 인증 실패", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * HTTP 요청에서 JWT 토큰을 추출합니다.
     * 1. Authorization 헤더에서 Bearer 토큰 추출 시도
     * 2. 실패 시 'accessToken' 쿠키에서 추출 시도
     * 
     * @param request 요청 객체
     * @return JWT 토큰 문자열 또는 null
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        // 1. Authorization 헤더에서 토큰 추출 시도
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // 2. 쿠키에서 토큰 추출 시도
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
} 