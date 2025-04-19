package com.typelegal.domain.question.exception;

/**
 * 질문을 찾을 수 없을 때 발생하는 예외
 * 요청한 질문 ID가 데이터베이스에 존재하지 않는 경우 사용됩니다.
 */
public class QuestionNotFoundException extends RuntimeException {
    public QuestionNotFoundException(String message) {
        super(message);
    }
    
    public QuestionNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
} 