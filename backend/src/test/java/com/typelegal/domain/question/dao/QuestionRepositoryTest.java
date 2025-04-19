package com.typelegal.domain.question.dao;

import com.typelegal.domain.question.domain.Question;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * QuestionRepository 테스트 클래스
 * QuestionRepository의 JPA 쿼리 메서드를 테스트합니다.
 */
@DataJpaTest
@ActiveProfiles("test")
public class QuestionRepositoryTest {

    @Autowired
    private QuestionRepository questionRepository;

    /**
     * 모든 질문 조회 테스트
     * 데이터베이스에서 모든 질문을 조회하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("모든 질문 조회")
    @Sql("classpath:test-data/question-test-data.sql")
    void findAll_ReturnsAllQuestions() {
        // when
        List<Question> questions = questionRepository.findAll();
        
        // then
        assertThat(questions).isNotNull();
        // SQL 스크립트에 2개의 레코드가 있다고 가정
        assertThat(questions.size()).isGreaterThan(0);
    }
    
    /**
     * 특정 cid로 질문 조회 테스트
     * 특정 cid로 질문을 조회하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("특정 cid로 질문 조회")
    @Sql("classpath:test-data/question-test-data.sql")
    void findByCid_ReturnsQuestions() {
        // given
        String cid = "contract_type"; // 테스트 데이터에 있는 cid 값
        
        // when
        List<Question> questions = questionRepository.findByCid(cid);
        
        // then
        assertThat(questions).isNotNull();
        assertThat(questions).allMatch(q -> q.getCId().equals(cid));
    }
    
    /**
     * 두 개의 조건으로 질문 검색 테스트
     * query1, query2 두 개의 조건으로 질문을 검색하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("두 개의 조건으로 질문 검색")
    @Sql("classpath:test-data/question-test-data.sql")
    void searchByCid_ReturnsFilteredQuestions() {
        // given
        String query1 = "contract"; // 테스트 데이터에 있는 cid의 일부분
        String query2 = "type"; // 테스트 데이터에 있는 cid의 일부분
        
        // when
        List<Question> questions = questionRepository.searchByCid(query1, query2);
        
        // then
        assertThat(questions).isNotNull();
        assertThat(questions).allMatch(q -> 
            q.getCId().equals(query1) || 
            (q.getCId().startsWith(query1 + "_") && q.getCId().endsWith("_" + query2))
        );
    }
    
    /**
     * 데이터베이스 연결 테스트
     * 데이터베이스 연결 상태를 확인하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("데이터베이스 연결 테스트")
    void testDatabaseConnection() {
        // when
        List<Object[]> result = questionRepository.testDatabaseConnection();
        
        // then
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(1);
        // 결과의 첫 번째 열은 레코드 개수를 나타냄
        assertThat(result.get(0)[0]).isInstanceOf(Number.class);
    }
    
    /**
     * 테이블 구조 확인 테스트
     * 테이블 구조를 확인하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("테이블 구조 확인")
    void getTableStructure() {
        // when
        List<Object[]> result = questionRepository.getTableStructure();
        
        // then
        assertThat(result).isNotNull();
        // 테이블에 최소한 몇 개의 열이 있어야 함
        assertThat(result.size()).isGreaterThan(0);
        
        // 결과의 각 행이 예상되는 열 이름, 데이터 타입, NULL 가능 여부 정보를 포함하는지 확인
        boolean hasIdColumn = false;
        boolean hasCidColumn = false;
        
        for (Object[] row : result) {
            String columnName = (String) row[0];
            if ("id".equals(columnName)) {
                hasIdColumn = true;
            } else if ("c_id".equals(columnName)) {
                hasCidColumn = true;
            }
        }
        
        assertThat(hasIdColumn).isTrue();
        assertThat(hasCidColumn).isTrue();
    }

    /**
     * Question 엔티티 저장 테스트
     * Question 엔티티를 저장하는 기능을 테스트합니다.
     */
    @Test
    @DisplayName("Question 엔티티 저장")
    void saveQuestion() {
        // given
        Question question = Question.builder()
                .cId("test_cid")
                .bindingKey("test_binding_key")
                .questionType("text")
                .placeholder("테스트 질문을 입력하세요")
                .outputType("string")
                .isDefault(true)
                .isFixed(false)
                .mIdx(1)
                .qIdx(1)
                .title("Test Question")
                .questionCategory("test")
                .questionTitleKo("테스트 질문")
                .build();
                
        // when
        Question savedQuestion = questionRepository.save(question);
        
        // then
        assertThat(savedQuestion).isNotNull();
        assertThat(savedQuestion.getId()).isNotNull(); // ID가 자동 생성되었는지 확인
        assertThat(savedQuestion.getCId()).isEqualTo("test_cid");
        assertThat(savedQuestion.getBindingKey()).isEqualTo("test_binding_key");
        assertThat(savedQuestion.getQuestionType()).isEqualTo("text");
    }
} 