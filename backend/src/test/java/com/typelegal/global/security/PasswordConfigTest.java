package com.typelegal.global.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PasswordConfig 테스트 클래스
 * 비밀번호 인코딩 설정이 올바르게 작동하는지 테스트합니다.
 */
@SpringBootTest(classes = PasswordConfig.class)
public class PasswordConfigTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 비밀번호 인코더 Bean 테스트
     * PasswordEncoder 빈이 올바르게 생성되었는지 테스트합니다.
     */
    @Test
    @DisplayName("비밀번호 인코더 Bean 생성 확인")
    public void shouldCreatePasswordEncoderBean() {
        assertThat(passwordEncoder).isNotNull();
    }

    /**
     * 비밀번호 인코딩 테스트
     * 비밀번호가 올바르게 인코딩되는지 테스트합니다.
     */
    @Test
    @DisplayName("비밀번호 인코딩 기능 테스트")
    public void shouldEncodePassword() {
        // given
        String rawPassword = "testPassword123";
        
        // when
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        // then
        assertThat(encodedPassword).isNotNull();
        assertThat(encodedPassword).isNotEqualTo(rawPassword);
    }

    /**
     * 비밀번호 매칭 테스트
     * 인코딩된 비밀번호와 원본 비밀번호가 매칭되는지 테스트합니다.
     */
    @Test
    @DisplayName("비밀번호 매칭 기능 테스트")
    public void shouldMatchEncodedPassword() {
        // given
        String rawPassword = "testPassword123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        // when
        boolean isMatching = passwordEncoder.matches(rawPassword, encodedPassword);
        
        // then
        assertThat(isMatching).isTrue();
    }

    /**
     * 비밀번호 불일치 테스트
     * 다른 비밀번호와 매칭되지 않는지 테스트합니다.
     */
    @Test
    @DisplayName("비밀번호 불일치 테스트")
    public void shouldNotMatchIncorrectPassword() {
        // given
        String rawPassword = "testPassword123";
        String wrongPassword = "wrongPassword123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        
        // when
        boolean isMatching = passwordEncoder.matches(wrongPassword, encodedPassword);
        
        // then
        assertThat(isMatching).isFalse();
    }

    /**
     * 동일 비밀번호의 인코딩 결과 다름 테스트
     * 동일한 비밀번호를 인코딩해도 결과가 다른지 테스트합니다.
     */
    @Test
    @DisplayName("동일 비밀번호의 인코딩 결과 다름 테스트")
    public void shouldGenerateDifferentEncodingsForSamePassword() {
        // given
        String rawPassword = "testPassword123";
        
        // when
        String encodedPassword1 = passwordEncoder.encode(rawPassword);
        String encodedPassword2 = passwordEncoder.encode(rawPassword);
        
        // then
        assertThat(encodedPassword1).isNotEqualTo(encodedPassword2);
    }
} 