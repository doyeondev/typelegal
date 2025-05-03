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
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = extractJwtFromRequest(request);

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            UUID userId = jwtConfig.extractUserId(jwt);
            String userEmail = null;

            if (userId == null) {
                userEmail = jwtConfig.extractUsername(jwt);
                logger.info("이메일 기반 토큰 감지: " + userEmail);
            } else {
                userEmail = jwtConfig.extractClaim(jwt, claims -> claims.get("email", String.class));
                logger.info("UUID 기반 토큰 감지: ID=" + userId + ", 이메일=" + userEmail);
            }

            if (userEmail == null) {
                logger.error("토큰에서 사용자 정보를 추출할 수 없습니다.");
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                boolean isValid = (userId != null)
                        ? jwtConfig.validateTokenWithUserId(jwt, userId)
                        : jwtConfig.validateToken(jwt, userDetails);

                if (isValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.info("사용자 인증 성공: " + userEmail + " (UserDetails 객체 사용)");
                } else {
                    logger.warn("JWT 토큰이 유효하지 않음: " + userEmail);
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
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    System.out.println("[DEBUG] 쿠키 이름: " + cookie.getName() + ", 값: " + cookie.getValue());
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
