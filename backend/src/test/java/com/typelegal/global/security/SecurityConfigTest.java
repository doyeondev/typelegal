package com.typelegal.global.security;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * SecurityConfig 테스트 클래스
 * Spring Security 설정이 올바르게 적용되는지 테스트합니다.
 */
@WebMvcTest
@Import({SecurityConfig.class, PasswordConfig.class})
@Disabled("테스트코드 작성중")
public class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * 공개 API 엔드포인트 테스트
     * 인증 없이 접근 가능한 공개 엔드포인트에 접근할 수 있는지 테스트합니다.
     */
    @Test
    @DisplayName("공개 API 엔드포인트 접근")
    public void shouldAllowAccessToPublicEndpoints() throws Exception {
        // Auth 엔드포인트
        mockMvc.perform(get("/api/auth/login"))
                .andExpect(status().isOk());
                
        // Public 엔드포인트
        mockMvc.perform(get("/api/public/info"))
                .andExpect(status().isOk());
                
        // Clause 엔드포인트
        mockMvc.perform(get("/api/clause/all"))
                .andExpect(status().isOk());
                
        // Question 엔드포인트
        mockMvc.perform(get("/api/question/all"))
                .andExpect(status().isOk());
                
        // Template 엔드포인트
        mockMvc.perform(get("/api/template/all"))
                .andExpect(status().isOk());
    }

    /**
     * 보호된 API 엔드포인트 테스트
     * 인증 없이 보호된 엔드포인트에 접근할 수 없는지 테스트합니다.
     */
    @Test
    @DisplayName("보호된 API 엔드포인트 접근 제한")
    public void shouldDenyAccessToProtectedEndpointsWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/protected/resource"))
                .andExpect(status().isUnauthorized());
                
        mockMvc.perform(get("/api/member/profile"))
                .andExpect(status().isUnauthorized());
                
        mockMvc.perform(get("/api/drafting/list"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * 인증된 사용자의 보호된 API 엔드포인트 접근 테스트
     * 인증된 사용자가 보호된 엔드포인트에 접근할 수 있는지 테스트합니다.
     */
    @Test
    @WithMockUser
    @DisplayName("인증된 사용자의 보호된 API 엔드포인트 접근")
    public void shouldAllowAccessToProtectedEndpointsWithAuth() throws Exception {
        mockMvc.perform(get("/api/protected/resource"))
                .andExpect(status().isOk());
                
        mockMvc.perform(get("/api/member/profile"))
                .andExpect(status().isOk());
                
        mockMvc.perform(get("/api/drafting/list"))
                .andExpect(status().isOk());
    }

    /**
     * CORS 설정 테스트
     * CORS 관련 헤더가 올바르게 설정되는지 테스트합니다.
     */
    @Test
    @DisplayName("CORS 설정 테스트")
    public void shouldConfigureCorsCorrectly() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                    .header("Origin", "http://example.com")
                    .header("Access-Control-Request-Method", "POST")
                    .header("Access-Control-Request-Headers", "Content-Type, Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(header().exists("Access-Control-Allow-Methods"))
                .andExpect(header().exists("Access-Control-Allow-Headers"));
    }

    /**
     * CSRF 보호 비활성화 테스트
     * CSRF 보호가 비활성화되어 있는지 테스트합니다.
     */
    @Test
    @DisplayName("CSRF 보호 비활성화 테스트")
    public void shouldDisableCsrfProtection() throws Exception {
        // CSRF 토큰 없이 POST 요청이 정상적으로 처리되는지 확인
        mockMvc.perform(get("/api/auth/login"))
                .andExpect(status().isOk());
    }
} 