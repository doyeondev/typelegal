package com.typelegal.global.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.openMocks;

/**
 * JwtAuthenticationFilter 테스트 클래스
 * JWT 토큰 기반의 인증 필터 기능을 테스트합니다.
 */
public class JwtAuthenticationFilterTest {

    @Mock
    private JwtConfig jwtConfig;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private final String EMAIL = "test@example.com";
    private final String VALID_TOKEN = "valid.jwt.token";
    private final UUID USER_ID = UUID.randomUUID();

    @BeforeEach
    public void setUp() {
        openMocks(this);
        SecurityContextHolder.clearContext(); // 각 테스트 전에 보안 컨텍스트 초기화
    }

    /**
     * OPTIONS 메서드 요청 테스트
     * OPTIONS 메서드 요청은 JWT 검증 없이 통과해야 합니다.
     */
    @Test
    @DisplayName("OPTIONS 메서드 요청 처리")
    public void shouldSkipAuthenticationForOptionsMethod() throws Exception {
        // given
        when(request.getMethod()).thenReturn("OPTIONS");

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
        verify(jwtConfig, never()).extractUsername(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    /**
     * Authorization 헤더가 없는 요청 테스트
     * Authorization 헤더가 없는 요청은 JWT 검증 없이 통과해야 합니다.
     */
    @Test
    @DisplayName("Authorization 헤더가 없는 요청 처리")
    public void shouldSkipAuthenticationWhenNoAuthorizationHeader() throws Exception {
        // given
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn(null);

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
        verify(jwtConfig, never()).extractUsername(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    /**
     * Bearer 접두사가 없는 Authorization 헤더 테스트
     * Bearer 접두사가 없는 Authorization 헤더는 JWT 검증 없이 통과해야 합니다.
     */
    @Test
    @DisplayName("Bearer 접두사가 없는 Authorization 헤더 처리")
    public void shouldSkipAuthenticationWhenNoBearerPrefix() throws Exception {
        // given
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Token " + VALID_TOKEN);

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
        verify(jwtConfig, never()).extractUsername(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    /**
     * 이메일 기반 유효한 JWT 토큰 처리 테스트
     * 이메일 기반 유효한 JWT 토큰이 인증 정보를 올바르게 설정하는지 테스트합니다.
     */
    @Test
    @DisplayName("이메일 기반 유효한 JWT 토큰 처리")
    public void shouldAuthenticateWithValidEmailBasedToken() throws Exception {
        // given
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);
        
        // UUID 추출 시도 실패 (이메일 기반 토큰이므로)
        when(jwtConfig.extractUserId(VALID_TOKEN)).thenReturn(null);
        when(jwtConfig.extractUsername(VALID_TOKEN)).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(userDetails);
        when(jwtConfig.validateToken(VALID_TOKEN, userDetails)).thenReturn(true);

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
        verify(jwtConfig).extractUsername(VALID_TOKEN);
        verify(userDetailsService).loadUserByUsername(EMAIL);
        verify(jwtConfig).validateToken(VALID_TOKEN, userDetails);
        
        // SecurityContext에 인증 정보가 설정되었는지 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(userDetails);
    }

    /**
     * UUID 기반 유효한 JWT 토큰 처리 테스트
     * UUID 기반 유효한 JWT 토큰이 인증 정보를 올바르게 설정하는지 테스트합니다.
     */
    @Test
    @DisplayName("UUID 기반 유효한 JWT 토큰 처리")
    public void shouldAuthenticateWithValidUuidBasedToken() throws Exception {
        // given
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);
        
        // UUID 기반 토큰 설정
        when(jwtConfig.extractUserId(VALID_TOKEN)).thenReturn(USER_ID);
        when(jwtConfig.extractClaim(eq(VALID_TOKEN), any())).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(userDetails);
        when(jwtConfig.validateTokenWithUserId(VALID_TOKEN, USER_ID)).thenReturn(true);

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
        verify(jwtConfig).extractUserId(VALID_TOKEN);
        verify(jwtConfig).extractClaim(eq(VALID_TOKEN), any());
        verify(userDetailsService).loadUserByUsername(EMAIL);
        verify(jwtConfig).validateTokenWithUserId(VALID_TOKEN, USER_ID);
        
        // SecurityContext에 인증 정보가 설정되었는지 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(userDetails);
    }

    /**
     * 유효하지 않은 JWT 토큰 처리 테스트
     * 유효하지 않은 JWT 토큰은 인증 정보를 설정하지 않아야 합니다.
     */
    @Test
    @DisplayName("유효하지 않은 JWT 토큰 처리")
    public void shouldNotAuthenticateWithInvalidToken() throws Exception {
        // given
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);
        
        when(jwtConfig.extractUserId(VALID_TOKEN)).thenReturn(null);
        when(jwtConfig.extractUsername(VALID_TOKEN)).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(userDetails);
        when(jwtConfig.validateToken(VALID_TOKEN, userDetails)).thenReturn(false);

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
        verify(jwtConfig).extractUsername(VALID_TOKEN);
        verify(userDetailsService).loadUserByUsername(EMAIL);
        verify(jwtConfig).validateToken(VALID_TOKEN, userDetails);
        
        // SecurityContext에 인증 정보가 설정되지 않아야 함
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNull();
    }

    /**
     * JWT 토큰 처리 중 예외 발생 테스트
     * 토큰 처리 중 예외가 발생해도 필터 체인이 계속 진행되어야 합니다.
     */
    @Test
    @DisplayName("JWT 토큰 처리 중 예외 발생")
    public void shouldContinueFilterChainWhenExceptionOccurs() throws Exception {
        // given
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);
        when(jwtConfig.extractUserId(VALID_TOKEN)).thenThrow(new RuntimeException("토큰 파싱 오류"));

        // when
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // then
        verify(filterChain).doFilter(request, response);
        verify(jwtConfig).extractUserId(VALID_TOKEN);
        
        // SecurityContext에 인증 정보가 설정되지 않아야 함
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNull();
    }
} 