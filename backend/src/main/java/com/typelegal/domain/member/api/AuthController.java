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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

/**
 * 인증 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final MemberService memberService;
    private final JwtConfig jwtConfig;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, MemberService memberService, JwtConfig jwtConfig, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.memberService = memberService;
        this.jwtConfig = jwtConfig;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 로그인 API
     * @param request 로그인 요청 정보
     * @return 인증 토큰 및 사용자 정보
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
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
            
            // 수정된 부분: member.getId()를 subject로 사용하는 새로운 JWT 토큰 생성
            // JWT 토큰 생성용 UserDetails 생성
            UserDetails userDetails = memberService.loadUserByUsername(request.getEmail());
            
            // 새로운 방식으로 토큰 생성 (UUID를 subject로 사용)
            String token = jwtConfig.generateTokenWithUserId(member.getId(), member.getEmail());
            System.out.println("새로운 방식으로 생성된 토큰: " + token);
            
            // 로그인 시간 업데이트
            memberService.updateLastLogin(request.getEmail());
            
            // 응답 데이터 생성
            AuthResponse response = AuthResponse.builder()
                    .id(member.getId()) // ID 정보 추가
                    .token(token)
                    .email(member.getEmail())
                    .name(member.getName())
                    .role(member.getRole()) // 역할 정보 추가
                    .submittedSurvey(member.getSubmittedSurvey() != null && member.getSubmittedSurvey())
                    .build();
            
            return ResponseEntity.ok(response);
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
     * @param email 사용자 이메일
     * @return 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestParam String email) {
        try {
            Member member = memberService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));
            
            return ResponseEntity.ok(AuthResponse.builder()
                    .email(member.getEmail())
                    .name(member.getName())
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