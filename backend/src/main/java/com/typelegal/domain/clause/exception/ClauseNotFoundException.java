package com.typelegal.domain.clause.exception;

/**
 * 조항을 찾을 수 없을 때 발생하는 예외
 * 요청한 조항 ID가 데이터베이스에 존재하지 않는 경우 사용됩니다.
 */
public class ClauseNotFoundException extends RuntimeException {
    public ClauseNotFoundException(String message) {
        super(message);
    }
    
    public ClauseNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
