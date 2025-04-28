package com.typelegal.domain.member.application;

import com.typelegal.domain.member.domain.Member;
import com.typelegal.domain.member.dao.MemberRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 회원 관련 서비스 및 UserDetailsService 구현
 */
@Service
public class MemberService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Spring Security UserDetailsService 인터페이스 구현
     * UUID와 이메일 모두 지원하는 사용자 조회 메서드
     * @param username 사용자 식별자(이메일 또는 UUID 문자열)
     * @return UserDetails 객체
     * @throws UsernameNotFoundException 사용자가 존재하지 않을 경우
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = null;
        
        // 1. UUID 형식인지 먼저 확인
        try {
            UUID userId = UUID.fromString(username);
            System.out.println("UUID 형식 확인됨: " + userId);
            
            member = memberRepository.findById(userId).orElse(null);
                    
            if (member != null) {
                System.out.println("UUID로 사용자 조회 성공: " + member.getEmail());
            } else {
                System.out.println("UUID로 사용자 조회 실패: " + userId);
            }
        } catch (IllegalArgumentException e) {
            // UUID 형식이 아니면 무시하고 이메일로 조회 시도
            System.out.println("UUID 형식 아님, 이메일로 간주: " + username);
        }
        
        // 2. UUID로 찾지 못했거나 UUID 형식이 아닌 경우 이메일로 조회
        if (member == null) {
            try {
                member = memberRepository.findByEmail(username)
                        .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
                System.out.println("이메일로 사용자 조회 성공: " + username);
            } catch (Exception e) {
                System.out.println("사용자 조회 실패 (UUID/이메일 모두): " + username);
                throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username, e);
            }
        }

        // 조회된 사용자로 UserDetails 객체 생성
        return new User(
                member.getEmail(),
                member.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + (member.getRole() != null ? member.getRole() : "USER")))
        );
    }

    /**
     * 회원 등록
     * @param member 회원 정보
     * @return 등록된 회원 정보
     */
    public Member registerMember(Member member) {
        // 이메일 중복 체크
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(member.getPassword());
        System.out.println("원본 비밀번호: " + member.getPassword());
        System.out.println("암호화된 비밀번호: " + encodedPassword);
        
        member.setPassword(encodedPassword);
        
        // 회원 정보 저장
        Member savedMember = memberRepository.save(member);
        System.out.println("저장된 회원 ID: " + savedMember.getId() + ", 타입: " + (savedMember.getId() != null ? savedMember.getId().getClass().getName() : "null"));
        return savedMember;
    }
    
    /**
     * 특정 비밀번호를 해시화하여 출력 (테스트용)
     * @param rawPassword 평문 비밀번호
     * @return 해시화된 비밀번호
     */
    public String encodePassword(String rawPassword) {
        String encoded = passwordEncoder.encode(rawPassword);
        System.out.println("원본 비밀번호: " + rawPassword);
        System.out.println("해시화된 비밀번호: " + encoded);
        return encoded;
    }
    
    /**
     * 비밀번호 일치 검증 (테스트용)
     * @param rawPassword 평문 비밀번호
     * @param encodedPassword 해시화된 비밀번호
     * @return 일치 여부
     */
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);
        System.out.println("비밀번호 일치 여부: " + matches);
        return matches;
    }

    /**
     * 이메일로 회원 조회
     * @param email 이메일
     * @return 회원 정보 Optional
     */
    public Optional<Member> findByEmail(String email) {
        Optional<Member> member = memberRepository.findByEmail(email);
        if (member.isPresent()) {
            System.out.println("회원 조회 - ID: " + member.get().getId() + ", 타입: " + 
                (member.get().getId() != null ? member.get().getId().getClass().getName() : "null"));
        }
        return member;
    }

    /**
     * 이메일로 회원 ID를 조회합니다.
     * @param email 회원 이메일
     * @return 회원 ID
     * @throws UsernameNotFoundException 이메일에 해당하는 회원이 존재하지 않을 경우
     */
    public UUID getMemberIdByEmail(String email) {
        System.out.println("이메일로 회원 ID 조회: email=" + email);
        
        return memberRepository.findByEmail(email)
                .map(Member::getId)
                .orElseThrow(() -> new UsernameNotFoundException("이메일에 해당하는 회원을 찾을 수 없습니다: " + email));
    }

    /**
     * 로그인 처리 및 마지막 로그인 시간 업데이트
     * @param email 이메일
     */
    public void updateLastLogin(String email) {
        try {
            Optional<Member> memberOpt = memberRepository.findByEmail(email);
            if (memberOpt.isPresent()) {
                Member member = memberOpt.get();
                System.out.println("로그인 시간 업데이트 - ID: " + member.getId() + ", 타입: " + 
                    (member.getId() != null ? member.getId().getClass().getName() : "null"));
                member.setLastLogin(LocalDateTime.now());
                
                // 예외 처리를 추가하여 데이터베이스 오류 발생 시에도 로그인 프로세스가 계속 진행되도록 함
                try {
                    memberRepository.save(member);
                    System.out.println("로그인 시간 업데이트 성공");
                } catch (Exception e) {
                    System.err.println("로그인 시간 업데이트 실패 (무시됨): " + e.getMessage());
                    // 로그인 시간 업데이트 실패는 치명적인 오류가 아니므로 예외를 던지지 않고 무시
                }
            }
        } catch (Exception e) {
            System.err.println("로그인 시간 업데이트 중 예외 발생 (무시됨): " + e.getMessage());
            // 예외를 로깅만 하고 다시 던지지 않음
        }
    }

    /**
     * 모든 회원 조회
     * @return 회원 목록
     */
    public List<Member> findAllMembers() {
        return memberRepository.findAll();
    }

    /**
     * 아이디로 회원 조회
     * @param id 회원 아이디
     * @return 회원 정보 Optional
     */
    public Optional<Member> findById(UUID id) {
        return memberRepository.findById(id);
    }

    /**
     * 회원 정보 업데이트
     * @param member 업데이트할 회원 정보
     * @return 업데이트된 회원 정보
     */
    public Member updateMember(Member member) {
        System.out.println("회원 정보 업데이트 - ID: " + member.getId() + ", 타입: " + 
            (member.getId() != null ? member.getId().getClass().getName() : "null"));
        return memberRepository.save(member);
    }

    /**
     * 회원 삭제
     * @param id 회원 아이디
     */
    public void deleteMember(UUID id) {
        memberRepository.deleteById(id);
    }
} 