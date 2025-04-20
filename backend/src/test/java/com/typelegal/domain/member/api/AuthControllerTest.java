package com.typelegal.domain.member.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.typelegal.domain.member.application.MemberService;
import com.typelegal.domain.member.domain.Member;
import com.typelegal.domain.member.dto.AuthRequest;
import com.typelegal.domain.member.dto.RegisterRequest;
import com.typelegal.global.security.JwtConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AuthController 통합 테스트
 * - 테스트 환경 설정을 사용
 * - 실제 빈을 사용하되 Repository는 모킹
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")  // application-test.yml 사용
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MemberService memberService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtConfig jwtConfig;
    
    @BeforeEach
    void setUp() {
        // Mockito 초기화 - MissingMethodInvocation 오류 해결
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("회원가입_유효한_정보로_요청시_201_응답을_반환한다")
    void register_성공() throws Exception {
        // given
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@typelegal.com");
        request.setPassword("Test1234!");
        request.setName("테스트 사용자");

        UUID memberId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        Member member = Member.builder()
                .id(memberId)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role("USER")
                .build();

        when(memberService.findByEmail(anyString())).thenReturn(Optional.empty());
        when(memberService.registerMember(any(Member.class))).thenReturn(member);

        // when & then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().string("회원가입이 완료되었습니다."));
    }

    @Test
    @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("회원가입_이미_존재하는_이메일로_요청시_409_응답을_반환한다")
    void register_이메일_중복_실패() throws Exception {
        // given
        RegisterRequest request = new RegisterRequest();
        request.setEmail("exists@typelegal.com");
        request.setPassword("Test1234!");
        request.setName("테스트 사용자");

        Member existingMember = Member.builder()
                .id(UUID.randomUUID())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role("USER")
                .build();

        when(memberService.findByEmail(request.getEmail())).thenReturn(Optional.of(existingMember));

        // when & then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(content().string("이미 등록된 이메일입니다."));
    }

    @Test
    @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("로그인_유효한_자격증명으로_요청시_200_응답과_JWT_토큰을_반환한다")
    void login_성공() throws Exception {
        // given
        AuthRequest request = new AuthRequest();
        request.setEmail("test@typelegal.com");
        request.setPassword("Test1234!");

        UUID memberId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        Member member = Member.builder()
                .id(memberId)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name("테스트 사용자")
                .role("USER")
                .createdAt(LocalDateTime.now())
                .submittedSurvey(false)
                .build();

        when(memberService.findByEmail(request.getEmail())).thenReturn(Optional.of(member));
        when(passwordEncoder.matches(request.getPassword(), member.getPassword())).thenReturn(true);
        when(memberService.loadUserByUsername(request.getEmail())).thenReturn(
                org.springframework.security.core.userdetails.User.builder()
                        .username(member.getEmail())
                        .password(member.getPassword())
                        .authorities("ROLE_USER")
                        .build()
        );

        // when & then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(member.getEmail())))
                .andExpect(jsonPath("$.name", is(member.getName())))
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("로그인_잘못된_자격증명으로_요청시_401_응답을_반환한다")
    void login_실패() throws Exception {
        // given
        AuthRequest request = new AuthRequest();
        request.setEmail("test@typelegal.com");
        request.setPassword("WrongPassword");

        Member member = Member.builder()
                .id(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                .email(request.getEmail())
                .password(passwordEncoder.encode("CorrectPassword"))
                .name("테스트 사용자")
                .role("USER")
                .build();

        when(memberService.findByEmail(request.getEmail())).thenReturn(Optional.of(member));
        when(passwordEncoder.matches(request.getPassword(), member.getPassword())).thenReturn(false);

        // when & then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("이메일 또는 비밀번호가 일치하지 않습니다."));
    }

    @Test
    @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("이메일_중복확인_사용가능한_이메일일_경우_200_응답을_반환한다")
    void checkEmailDuplicate_사용가능() throws Exception {
        // given
        String email = "available@typelegal.com";
        when(memberService.findByEmail(email)).thenReturn(Optional.empty());

        // when & then
        mockMvc.perform(get("/api/auth/check-email")
                .param("email", email))
                .andExpect(status().isOk())
                .andExpect(content().string("사용 가능한 이메일입니다."));
    }

    @Test
    @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("이메일_중복확인_이미_사용중인_이메일일_경우_409_응답을_반환한다")
    void checkEmailDuplicate_중복() throws Exception {
        // given
        String email = "exists@typelegal.com";
        Member existingMember = Member.builder()
                .id(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                .email(email)
                .build();
        when(memberService.findByEmail(email)).thenReturn(Optional.of(existingMember));

        // when & then
        mockMvc.perform(get("/api/auth/check-email")
                .param("email", email))
                .andExpect(status().isConflict())
                .andExpect(content().string("이미 등록된 이메일입니다."));
    }
} 