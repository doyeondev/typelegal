package com.typelegal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Mocking 관련 임포트
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.context.annotation.Profile;
import org.mockito.Mockito;
import com.typelegal.domain.clause.dao.ClauseRepository;
import com.typelegal.domain.question.dao.QuestionRepository;
import io.github.cdimascio.dotenv.Dotenv;

/**
 * Spring Boot 애플리케이션 메인 클래스
 * 애플리케이션의 시작점이자 전체 설정의 중심점입니다.
 */
@SpringBootApplication // Spring Boot 애플리케이션 설정 (자동 설정 포함)
public class BackendApplication {
    
    /**
     * 애플리케이션 시작 메소드
     */
    public static void main(String[] args) {
        // .env 파일 로드
        Dotenv dotenv = Dotenv.load();
        System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
        System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
        System.setProperty("DIRECTUS_API_TOKEN", dotenv.get("DIRECTUS_API_TOKEN"));
        System.setProperty("SPRING_SECURITY_USER", dotenv.get("SPRING_SECURITY_USER"));
        System.setProperty("SPRING_SECURITY_PASS", dotenv.get("SPRING_SECURITY_PASS"));
        
        SpringApplication.run(BackendApplication.class, args); // Spring Boot 서버 실행
    }

    /**
     * DB 연결 없이 실행될 때 모의 객체(mock) 제공하는 구성 클래스
     * directus.mock.enabled=true 설정 시에만 활성화됩니다.
     */
    @Configuration
    @ConditionalOnProperty(name = "directus.mock.enabled", havingValue = "true")
    public static class MockRepositoryConfig {

        @Bean
        public ClauseRepository clauseRepository() {
            System.out.println("모의 ClauseRepository 생성");
            return Mockito.mock(ClauseRepository.class);
        }

        @Bean
        public QuestionRepository questionRepository() {
            System.out.println("모의 QuestionRepository 생성");
            return Mockito.mock(QuestionRepository.class);
        }

        // 필요한 다른 Repository 모의 객체 추가 가능
        // 예: UserRepository, ContractRepository 등
    }
}
