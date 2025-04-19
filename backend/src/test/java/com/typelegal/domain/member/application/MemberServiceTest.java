package com.typelegal.domain.member.application;

import com.typelegal.domain.member.dao.MemberRepository;
import com.typelegal.domain.member.domain.Member;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * MemberService 클래스 단위 테스트
 */
@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private MemberService memberService;

    private Member testMember;
    private UUID memberId;

    @BeforeEach
    void setUp() {
        // 테스트 회원 생성
        memberId = UUID.randomUUID();
        testMember = new Member();
        testMember.setId(memberId);
        testMember.setEmail("test@typelegal.com");
        testMember.setPassword("rawPassword");
        testMember.setName("테스트 사용자");
        testMember.setRole("USER");
        testMember.setCreatedAt(LocalDateTime.now());
        testMember.setLastLogin(LocalDateTime.now());
    }

    @Test
    @DisplayName("loadUserByUsername_이메일로_사용자를_조회하면_UserDetails를_반환한다")
    void loadUserByUsername_사용자_존재시_UserDetails_반환() {
        // given
        when(memberRepository.findByEmail(anyString())).thenReturn(Optional.of(testMember));

        // when
        UserDetails userDetails = memberService.loadUserByUsername("test@typelegal.com");

        // then
        assertNotNull(userDetails);
        assertEquals(testMember.getEmail(), userDetails.getUsername());
        assertEquals(testMember.getPassword(), userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    @DisplayName("loadUserByUsername_존재하지_않는_이메일로_조회시_예외를_던진다")
    void loadUserByUsername_사용자_없음_예외발생() {
        // given
        when(memberRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // when & then
        assertThrows(UsernameNotFoundException.class, () -> {
            memberService.loadUserByUsername("nonexistent@example.com");
        });
    }

    @Test
    @DisplayName("registerMember_유효한_회원정보로_가입시_암호화_후_저장한다")
    void registerMember_성공() {
        // given
        String encodedPassword = "encodedPassword";
        when(memberRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn(encodedPassword);
        when(memberRepository.save(any(Member.class))).thenReturn(testMember);

        // when
        Member savedMember = memberService.registerMember(testMember);

        // then
        assertNotNull(savedMember);
        assertEquals(encodedPassword, savedMember.getPassword());
        verify(memberRepository).save(testMember);
    }

    @Test
    @DisplayName("registerMember_이미_존재하는_이메일로_가입시_예외를_던진다")
    void registerMember_이메일_중복_예외발생() {
        // given
        when(memberRepository.existsByEmail(anyString())).thenReturn(true);

        // when & then
        assertThrows(IllegalArgumentException.class, () -> {
            memberService.registerMember(testMember);
        });
        
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    @DisplayName("findByEmail_존재하는_이메일로_조회시_회원정보를_반환한다")
    void findByEmail_성공() {
        // given
        when(memberRepository.findByEmail(anyString())).thenReturn(Optional.of(testMember));

        // when
        Optional<Member> result = memberService.findByEmail("test@typelegal.com");

        // then
        assertTrue(result.isPresent());
        assertEquals(testMember.getId(), result.get().getId());
        assertEquals(testMember.getEmail(), result.get().getEmail());
    }
    
    @Test
    @DisplayName("updateLastLogin_존재하는_회원의_마지막_로그인_시간을_업데이트한다")
    void updateLastLogin_성공() {
        // given
        when(memberRepository.findByEmail(anyString())).thenReturn(Optional.of(testMember));
        
        // when
        memberService.updateLastLogin("test@typelegal.com");
        
        // then
        verify(memberRepository).save(testMember);
    }
    
    @Test
    @DisplayName("findAllMembers_모든_회원_목록을_반환한다")
    void findAllMembers_성공() {
        // given
        List<Member> memberList = new ArrayList<>();
        memberList.add(testMember);
        when(memberRepository.findAll()).thenReturn(memberList);
        
        // when
        List<Member> result = memberService.findAllMembers();
        
        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testMember.getEmail(), result.get(0).getEmail());
    }
    
    @Test
    @DisplayName("findById_존재하는_ID로_조회시_회원정보를_반환한다")
    void findById_성공() {
        // given
        when(memberRepository.findById(any(UUID.class))).thenReturn(Optional.of(testMember));
        
        // when
        Optional<Member> result = memberService.findById(memberId);
        
        // then
        assertTrue(result.isPresent());
        assertEquals(testMember.getId(), result.get().getId());
    }
    
    @Test
    @DisplayName("updateMember_회원정보_업데이트_성공")
    void updateMember_성공() {
        // given
        when(memberRepository.save(any(Member.class))).thenReturn(testMember);
        
        // when
        Member updatedMember = memberService.updateMember(testMember);
        
        // then
        assertNotNull(updatedMember);
        assertEquals(testMember.getId(), updatedMember.getId());
        verify(memberRepository).save(testMember);
    }
    
    @Test
    @DisplayName("deleteMember_회원_삭제_성공")
    void deleteMember_성공() {
        // given
        doNothing().when(memberRepository).deleteById(any(UUID.class));
        
        // when
        memberService.deleteMember(memberId);
        
        // then
        verify(memberRepository).deleteById(memberId);
    }
} 