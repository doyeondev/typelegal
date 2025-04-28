package com.typelegal.domain.member.api;

import com.typelegal.global.security.JwtConfig;
import com.typelegal.domain.member.domain.Member;
import com.typelegal.domain.member.dto.AuthRequest;
import com.typelegal.domain.member.dto.AuthResponse;
import com.typelegal.domain.member.dto.RegisterRequest;
import com.typelegal.domain.member.application.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.core.env.Environment;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.UUID;

/**
 * 인증 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final MemberService memberService;
    private final JwtConfig jwtConfig;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;

    // 환경이 프로덕션인지 확인하는 변수 추가
    private boolean isProduction() {
        String[] activeProfiles = env.getActiveProfiles();
        return activeProfiles.length > 0 && !activeProfiles[0].equals("local");
    }

    /**
     * 로그인 API
     * @param request 로그인 요청 정보
     * @param response 응답 객체
     * @return 인증 토큰 및 사용자 정보
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            System.out.println("로그인 시도: " + request.getEmail());
            
            // 이메일로 회원 조회
            Optional<Member> memberOpt = memberService.findByEmail(request.getEmail());
            
            if (memberOpt.isEmpty()) {
                System.out.println("회원 정보 없음: " + request.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("이메일 또는 비밀번호가 일치하지 않습니다.");
            }
            
            Member member = memberOpt.get();
            System.out.println("회원 찾음: " + member.getEmail());
            System.out.println("DB 저장 비밀번호(해시): " + member.getPassword());
            System.out.println("입력 비밀번호: " + request.getPassword());
            
            boolean passwordMatches = false;
            
            // 1. 먼저 PasswordEncoder를 사용하여 해시된 비밀번호 비교
            if (passwordEncoder.matches(request.getPassword(), member.getPassword())) {
                passwordMatches = true;
                System.out.println("해시 비밀번호 일치");
            } 
            // 2. 만약 일치하지 않고, 입력한 비밀번호와 저장된 비밀번호가 평문으로 일치한다면
            // (레거시 지원 방식 - 기존 등록 계정을 위한 임시 지원)
            else if (member.getPassword().equals(request.getPassword())) {
                passwordMatches = true;
                System.out.println("평문 비밀번호 일치 (레거시 방식)");
                
                // 비밀번호를 해시화하여 업데이트 (다음 로그인부터는 해시 방식 사용)
                member.setPassword(passwordEncoder.encode(request.getPassword()));
                Member updatedMember = memberService.updateMember(member);
                System.out.println("사용자 비밀번호를 해시 방식으로 업그레이드함");
                System.out.println("업데이트된 회원 ID: " + updatedMember.getId() + ", 타입: " + updatedMember.getId().getClass().getName());
            }
            
            if (!passwordMatches) {
                System.out.println("비밀번호 불일치");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("이메일 또는 비밀번호가 일치하지 않습니다.");
            }
            
            System.out.println("로그인 성공");
            
            // JWT 토큰 생성용 UserDetails 객체 로드
            UserDetails userDetails = memberService.loadUserByUsername(request.getEmail());
            
            // 회원 ID를 subject로 사용하여 JWT 토큰 생성
            // - 이메일 대신 UUID를 사용하여 보안성 강화
            // - 사용자의 고유 식별자를 토큰에 포함
            String token = jwtConfig.generateTokenWithUserId(member.getId(), member.getEmail());
            System.out.println("새로운 방식으로 생성된 토큰: " + token);
            
            // 마지막 로그인 시간 업데이트 (사용자 활동 추적)
            try {
                memberService.updateLastLogin(request.getEmail());
            } catch (Exception e) {
                // 로그인 시간 업데이트 실패는 로그만 남기고 로그인 처리는 계속 진행
                System.err.println("로그인 시간 업데이트 실패 (무시됨): " + e.getMessage());
            }
            
            // 클라이언트에 반환할 사용자 정보와 토큰을 포함한 응답 객체 생성
            // localStorage에 저장할 수 있도록 토큰이 포함됨
            AuthResponse responseDto = AuthResponse.builder()
                    .id(member.getId()) // ID 정보 추가
                    .token(token) // 토큰 포함 - 프론트엔드에서 localStorage 저장에 사용
                    .email(member.getEmail())
                    .name(member.getName())
                    .role(member.getRole()) // 역할 정보 추가 (권한 관리용)
                    .submittedSurvey(member.getSubmittedSurvey() != null && member.getSubmittedSurvey())
                    .build();
            
            // 현재 실행 환경 확인 (보안 설정 적용을 위해)
            System.out.println("현재 환경: " + (isProduction() ? "Production" : "Development"));

            // 보안 쿠키 설정
            // - httpOnly: JavaScript에서 쿠키 접근 방지 (XSS 공격 방어)
            // - secure: HTTPS 연결에서만 쿠키 전송 (프로덕션 환경에서만 적용)
            // - path: 쿠키가 유효한 경로 설정
            // - sameSite: CSRF 공격 방지 및 크로스 사이트 요청에서의 쿠키 전송 제어
            // - maxAge: 쿠키 유효 기간 설정 (7일)
            ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                    .httpOnly(true)
                    .secure(isProduction())
                    .path("/")
                    .sameSite("Lax")
                    .maxAge(Duration.ofDays(7))
                    .build();
            
            // 쿠키를 헤더에 포함하여 응답 반환
            // - 클라이언트는 이후 요청에서 자동으로 쿠키를 포함하여 인증 상태 유지 (이중 인증 방식)
            // - 응답 바디에도 토큰을 포함하여 클라이언트에서 localStorage에 저장 가능
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(responseDto);
        } catch (Exception e) {
            System.out.println("로그인 처리 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("로그인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 회원가입 API
     * @param request 회원가입 요청 정보
     * @return 생성된 회원 정보
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // 이메일 중복 체크
            if (memberService.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("이미 등록된 이메일입니다.");
            }
            
            // 회원 정보 생성
            Member member = Member.builder()
                    .email(request.getEmail())
                    .password(request.getPassword()) // Service에서 암호화됨
                    .name(request.getName())
                    .role("USER") // 기본 역할
                    .submittedSurvey(false) // 기본값
                    .build();
            
            // 회원 등록
            Member savedMember = memberService.registerMember(member);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("회원가입이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회원가입 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 이메일 중복 확인 API
     * @param email 확인할 이메일
     * @return 이메일 사용 가능 여부
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailDuplicate(@RequestParam String email) {
        try {
            System.out.println("이메일 중복 확인 요청: " + email);
            
            // 이메일 형식 검증 (간단한 검증)
            if (email == null || email.trim().isEmpty() || !email.contains("@")) {
                return ResponseEntity.badRequest()
                        .body("유효하지 않은 이메일 형식입니다.");
            }
            
            // 이메일 중복 체크
            boolean exists = memberService.findByEmail(email).isPresent();
            
            if (exists) {
                System.out.println("이메일 중복 확인 결과: 중복된 이메일");
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("이미 등록된 이메일입니다.");
            }
            
            System.out.println("이메일 중복 확인 결과: 사용 가능한 이메일");
            return ResponseEntity.ok("사용 가능한 이메일입니다.");
        } catch (Exception e) {
            System.out.println("이메일 중복 확인 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이메일 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 로그인 사용자 정보 조회 API
     * @return 현재 인증된 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            // 현재 인증된 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("인증되지 않은 요청입니다.");
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            Member member = memberService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));
            
            return ResponseEntity.ok(AuthResponse.builder()
                    .id(member.getId()) // ID 추가
                    .email(member.getEmail())
                    .name(member.getName())
                    .role(member.getRole()) // 역할 정보 추가
                    .submittedSurvey(member.getSubmittedSurvey() != null && member.getSubmittedSurvey())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("사용자 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 비밀번호 해시화 테스트 API
     * @param password 해시화할 비밀번호
     * @return 해시화된 비밀번호
     */
    @GetMapping("/test-password")
    public ResponseEntity<?> testPasswordEncoding(@RequestParam String password) {
        try {
            String hashedPassword = memberService.encodePassword(password);
            return ResponseEntity.ok("해시화된 비밀번호: " + hashedPassword);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비밀번호 해시화 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 비밀번호 검증 테스트 API
     * @param password 평문 비밀번호
     * @param hash 해시화된 비밀번호
     * @return 검증 결과
     */
    @GetMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestParam String password, @RequestParam String hash) {
        try {
            boolean matches = memberService.verifyPassword(password, hash);
            return ResponseEntity.ok("비밀번호 일치 여부: " + matches);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비밀번호 검증 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 