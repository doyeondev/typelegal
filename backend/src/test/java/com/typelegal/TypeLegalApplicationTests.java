package com.typelegal;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class TypeLegalApplicationTests {

    @Test
    @Disabled("환경 설정 문제로 인해 테스트 비활성화 (.env 파일 의존성)")
    void contextLoads() {
        assertTrue(true);
    }
}
