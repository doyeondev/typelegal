package com.typelegal.domain.drafting.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 드래프트를 찾을 수 없을 때 발생하는 예외
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class DraftingNotFoundException extends RuntimeException {
    public DraftingNotFoundException(String message) {
        super(message);
    }
} 