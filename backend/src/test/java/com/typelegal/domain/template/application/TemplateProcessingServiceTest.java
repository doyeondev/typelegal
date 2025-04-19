package com.typelegal.domain.template.application;

import com.typelegal.domain.clause.dto.ClauseResponseDto;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TemplateProcessingService 단위 테스트
 * 템플릿 처리 서비스의 기능을 검증합니다.
 */
@ExtendWith(MockitoExtension.class)
public class TemplateProcessingServiceTest {

    @InjectMocks
    private TemplateProcessingService templateProcessingService;

    private List<ClauseResponseDto> mockClauseList;
    private List<QuestionResponseDto> mockQuestionList;

    @BeforeEach
    void setUp() {
        // 테스트용 조항 데이터 생성
        mockClauseList = new ArrayList<>();
        ClauseResponseDto clause1 = new ClauseResponseDto();
        clause1.setId(UUID.randomUUID());
        clause1.setCIdx(1);
        clause1.setCId("A001");
        clause1.setClauseTitleEn("Confidentiality");
        clause1.setContentEn("The {party1} agrees to keep all information confidential.");
        clause1.setClauseTrigger(new String[]{"party1"});
        clause1.setIsClause(true);
        clause1.setIsDefault(true);
        clause1.setClauseCategory("General");

        ClauseResponseDto clause2 = new ClauseResponseDto();
        clause2.setId(UUID.randomUUID());
        clause2.setCIdx(2);
        clause2.setCId("B001");
        clause2.setClauseTitleEn("Termination");
        clause2.setContentEn("This agreement may be terminated by {party2} with {notice_period} days notice.");
        clause2.setClauseTrigger(new String[]{"party2", "notice_period"});
        clause2.setIsClause(true);
        clause2.setIsDefault(false);
        clause2.setClauseCategory("Special");

        mockClauseList.add(clause1);
        mockClauseList.add(clause2);

        // 테스트용 질문 데이터 생성
        mockQuestionList = new ArrayList<>();
        QuestionResponseDto question1 = new QuestionResponseDto();
        question1.setId(UUID.randomUUID());
        question1.setMIdx(1);
        question1.setQIdx(1);
        question1.setBindingQuestionKo("기본 정보");
        question1.setQuestionTitleKo("계약 당사자 1");
        question1.setQuestionTitleTag("당사자명을 입력하세요");
        question1.setBindingKey("party1");
        question1.setOutputType("text");
        question1.setQuestionType("text");
        question1.setIsDefault(true);

        QuestionResponseDto question2 = new QuestionResponseDto();
        question2.setId(UUID.randomUUID());
        question2.setMIdx(1);
        question2.setQIdx(2);
        question2.setBindingQuestionKo("기본 정보");
        question2.setQuestionTitleKo("계약 당사자 2");
        question2.setQuestionTitleTag("상대방명을 입력하세요");
        question2.setBindingKey("party2");
        question2.setOutputType("text");
        question2.setQuestionType("text");
        question2.setIsDefault(true);

        QuestionResponseDto question3 = new QuestionResponseDto();
        question3.setId(UUID.randomUUID());
        question3.setMIdx(2);
        question3.setQIdx(1);
        question3.setBindingQuestionKo("계약 조건");
        question3.setQuestionTitleKo("통지 기간(일)");
        question3.setQuestionTitleTag("통지 일수를 입력하세요");
        question3.setBindingKey("notice_period");
        question3.setOutputType("number");
        question3.setQuestionType("number");
        question3.setIsDefault(true);

        mockQuestionList.add(question1);
        mockQuestionList.add(question2);
        mockQuestionList.add(question3);
    }

    @Test
    @DisplayName("processData_조항과_질문_데이터를_처리하여_통합된_결과를_반환한다")
    void processData_성공() {
        // when
        Map<String, Object> result = templateProcessingService.processData(mockClauseList, mockQuestionList);

        // then
        assertNotNull(result);
        
        // 1. clause 배열 검증
        List<Map<String, Object>> clauseArray = (List<Map<String, Object>>) result.get("clause");
        assertNotNull(clauseArray);
        assertEquals(2, clauseArray.size());
        assertEquals("A001", clauseArray.get(0).get("cid"));
        assertEquals("B001", clauseArray.get(1).get("cid"));
        
        // 2. question 배열 검증
        List<Map<String, Object>> questionArray = (List<Map<String, Object>>) result.get("question");
        assertNotNull(questionArray);
        assertEquals(3, questionArray.size());
        assertEquals("party1", questionArray.get(0).get("binding_key"));
        assertEquals("party2", questionArray.get(1).get("binding_key"));
        assertEquals("notice_period", questionArray.get(2).get("binding_key"));
        
        // 3. grouped_question 검증
        Map<String, List<Map<String, Object>>> groupedQuestion = 
                (Map<String, List<Map<String, Object>>>) result.get("grouped_question");
        assertNotNull(groupedQuestion);
        assertTrue(groupedQuestion.containsKey("기본 정보"));
        assertTrue(groupedQuestion.containsKey("계약 조건"));
        assertEquals(2, groupedQuestion.get("기본 정보").size());
        assertEquals(1, groupedQuestion.get("계약 조건").size());
        
        // 4. input_array 검증
        List<Map<String, Object>> inputArray = (List<Map<String, Object>>) result.get("input_array");
        assertNotNull(inputArray);
        assertTrue(inputArray.size() >= 3); // party1, party2, notice_period
        
        // 5. clauseGuide 검증
        List<Map<String, Object>> clauseGuide = (List<Map<String, Object>>) result.get("clauseGuide");
        assertNotNull(clauseGuide);
    }
    
    @Test
    @DisplayName("processData_빈_데이터를_처리할_경우에도_오류없이_처리한다")
    void processData_빈_데이터() {
        // when
        Map<String, Object> result = templateProcessingService.processData(
            new ArrayList<>(), new ArrayList<>());

        // then
        assertNotNull(result);
        assertTrue(((List<?>) result.get("clause")).isEmpty());
        assertTrue(((List<?>) result.get("question")).isEmpty());
        assertTrue(((Map<?, ?>) result.get("grouped_question")).isEmpty());
        assertTrue(((List<?>) result.get("input_array")).isEmpty());
        assertTrue(((List<?>) result.get("clauseGuide")).isEmpty());
    }
    
    @Test
    @DisplayName("processData_조항에_clause_trigger가_없는_경우에도_정상_처리한다")
    void processData_조항_트리거_누락() {
        // given
        ClauseResponseDto clauseWithNoTrigger = new ClauseResponseDto();
        clauseWithNoTrigger.setId(UUID.randomUUID());
        clauseWithNoTrigger.setCIdx(3);
        clauseWithNoTrigger.setCId("C001");
        clauseWithNoTrigger.setClauseTitleEn("Default Clause");
        clauseWithNoTrigger.setContentEn("This is a default clause with no triggers.");
        clauseWithNoTrigger.setClauseTrigger(null); // 트리거 없음
        clauseWithNoTrigger.setIsClause(true);
        clauseWithNoTrigger.setIsDefault(true);
        clauseWithNoTrigger.setClauseCategory("General");

        List<ClauseResponseDto> testClauses = new ArrayList<>(mockClauseList);
        testClauses.add(clauseWithNoTrigger);
        
        // when
        Map<String, Object> result = templateProcessingService.processData(testClauses, mockQuestionList);
        
        // then
        assertNotNull(result);
        List<Map<String, Object>> clauseArray = (List<Map<String, Object>>) result.get("clause");
        assertEquals(3, clauseArray.size());
        assertEquals("C001", clauseArray.get(2).get("cid"));
    }
    
    @Test
    @DisplayName("processData_질문의_binding_key가_조항의_clause_trigger와_일치하는_경우_binding_cidx가_설정된다")
    void processData_바인딩_연결() {
        // when
        Map<String, Object> result = templateProcessingService.processData(mockClauseList, mockQuestionList);
        
        // then
        List<Map<String, Object>> inputArray = (List<Map<String, Object>>) result.get("input_array");
        
        // 각 input의 binding_cidx 확인
        Optional<Map<String, Object>> party1Input = inputArray.stream()
                .filter(input -> "party1".equals(input.get("key")))
                .findFirst();
                
        assertTrue(party1Input.isPresent());
        List<Integer> party1BindingCidx = (List<Integer>) party1Input.get().get("binding_cidx");
        assertTrue(party1BindingCidx.contains(1)); // party1은 cidx 1번 조항에 연결됨
        
        Optional<Map<String, Object>> party2Input = inputArray.stream()
                .filter(input -> "party2".equals(input.get("key")))
                .findFirst();
                
        assertTrue(party2Input.isPresent());
        List<Integer> party2BindingCidx = (List<Integer>) party2Input.get().get("binding_cidx");
        assertTrue(party2BindingCidx.contains(2)); // party2는 cidx 2번 조항에 연결됨
    }
} 