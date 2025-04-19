package com.typelegal.domain.question.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * QuestionNotFoundException 테스트 클래스
 * 질문을 찾을 수 없을 때 발생하는 예외를 테스트합니다.
 */
public class QuestionNotFoundExceptionTest {

    /**
     * 메시지 생성자 테스트
     * 메시지만 받는 생성자를 테스트합니다.
     */
    @Test
    @DisplayName("메시지 생성자 테스트")
    void constructor_WithMessage() {
        // given
        String errorMessage = "질문을 찾을 수 없습니다: ID=1";
        
        // when
        QuestionNotFoundException exception = new QuestionNotFoundException(errorMessage);
        
        // then
        assertThat(exception.getMessage()).isEqualTo(errorMessage);
        assertThat(exception.getCause()).isNull();
    }
    
    /**
     * 메시지와 원인 생성자 테스트
     * 메시지와 원인 예외를 받는 생성자를 테스트합니다.
     */
    @Test
    @DisplayName("메시지와 원인 생성자 테스트")
    void constructor_WithMessageAndCause() {
        // given
        String errorMessage = "질문을 찾을 수 없습니다: ID=1";
        Throwable cause = new RuntimeException("원인 예외");
        
        // when
        QuestionNotFoundException exception = new QuestionNotFoundException(errorMessage, cause);
        
        // then
        assertThat(exception.getMessage()).isEqualTo(errorMessage);
        assertThat(exception.getCause()).isEqualTo(cause);
    }
    
    /**
     * RuntimeException 상속 테스트
     * QuestionNotFoundException이 RuntimeException을 상속하는지 테스트합니다.
     */
    @Test
    @DisplayName("RuntimeException 상속 테스트")
    void extendsRuntimeException() {
        // given
        QuestionNotFoundException exception = new QuestionNotFoundException("테스트 예외");
        
        // then
        assertThat(exception).isInstanceOf(RuntimeException.class);
    }
} 