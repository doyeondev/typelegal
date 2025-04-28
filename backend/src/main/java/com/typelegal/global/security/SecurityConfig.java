package com.typelegal.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    
    public SecurityConfig(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * CORS 설정을 위한 CorsConfigurationSource 빈 정의
     * Spring Security에서 사용할 CORS 설정을 제공합니다.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 오리진(도메인) 설정
        // - 개발 환경: localhost:3000, 127.0.0.1:3000
        // - 프로덕션 환경: typelegal.io 도메인
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://typelegal.io"  // 실제 프로덕션 도메인 (필요시 추가)
        ));
        
        // 허용할 HTTP 메서드 설정 (RESTful API 지원)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); 
        
        // 허용할 HTTP 헤더 설정
        // - Authorization: JWT 토큰 전송용
        // - Content-Type: 요청 본문 타입 지정
        // - X-Requested-With: Ajax 요청 식별
        // - X-Member-ID: 사용자 식별자
        // - Cookie: 쿠키 기반 인증 지원
        // - Accept: 클라이언트가 허용하는 응답 형식
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "X-Member-ID", "Cookie", "Accept")); 
        
        // 브라우저에 노출할 응답 헤더 설정
        // - Authorization: 클라이언트가 JWT 토큰 접근 가능
        // - Set-Cookie: 쿠키 설정 허용
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie"));
        
        // 자격 증명(쿠키, 인증) 포함 요청 허용
        // - 쿠키 기반 인증을 위해 필수적인 설정
        // - true로 설정해야 쿠키가 크로스 도메인 요청에 포함됨
        configuration.setAllowCredentials(true);
        
        // SameSite 설정을 위한 커스텀 필터 구성
        // - 개발 환경에서는 Lax나 None 사용
        // - 프로덕션 환경에서는 보안을 위해 Strict 권장
        // 참고: Spring에서는 직접 CorsConfiguration에 SameSite 설정 불가능하므로 
        // 해당 설정은 쿠키 생성 시 직접 설정해야 함
        
        // 프리플라이트 요청 캐시 시간 설정 (1시간)
        // - OPTIONS 요청 횟수 감소로 성능 향상
        configuration.setMaxAge(3600L);
        
        // 모든 API 경로에 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Spring Security 필터 체인 설정
     * 보안 정책과 인증/인가 규칙을 정의합니다.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
            // CSRF 보호 비활성화 (REST API는 세션을 사용하지 않으므로 불필요)
            // - JWT 기반 인증은 이미 CSRF 공격에 대한 보호 기능 제공
            .csrf(csrf -> csrf.disable())
            
            // CORS 설정 적용
            // - 위에서 정의한 corsConfigurationSource 빈 사용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // HTTP 요청 인가 규칙 설정
            .authorizeHttpRequests(auth -> auth
                // 인증 없이 접근 가능한 경로 설정 (화이트리스트)
                // - 인증 관련 API: 로그인, 회원가입 등
                // - 공개 API: 공개 정보 접근용
                // - 계약서 템플릿, 조항, 질문 관련 API: 인증 없이 접근 가능
                .requestMatchers(
                    new AntPathRequestMatcher("/api/auth/**"),
                    new AntPathRequestMatcher("/api/public/**"),
                    new AntPathRequestMatcher("/api/clause/**"),
                    new AntPathRequestMatcher("/api/question/**"),
                    new AntPathRequestMatcher("/api/template/**")
                ).permitAll()
                // 그 외 모든 요청은 인증 필요 (블랙리스트 방식)
                .anyRequest().authenticated()
            )
            
            // 세션 관리 정책 설정
            // - STATELESS: 세션을 생성하지 않음 (JWT 기반 인증 시 권장)
            // - JWT는 상태를 저장하지 않는 인증 방식이므로 서버 세션 불필요
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 인증 제공자 설정
            // - 사용자 인증 처리를 위한 AuthenticationProvider 등록
            .authenticationProvider(authenticationProvider())
            
            // JWT 인증 필터 등록
            // - UsernamePasswordAuthenticationFilter 전에 실행되도록 설정
            // - 모든 요청에서 JWT 토큰을 검증하고 인증 정보 설정
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 인증 제공자 설정
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    /**
     * 인증 관리자 설정
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
} 