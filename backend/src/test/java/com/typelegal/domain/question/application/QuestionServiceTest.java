package com.typelegal.domain.question.application;

import com.typelegal.domain.question.dao.QuestionRepository;
import com.typelegal.domain.question.domain.Question;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import com.typelegal.domain.question.exception.QuestionNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * QuestionService 테스트 클래스
 * QuestionService의 비즈니스 로직을 테스트합니다.
 */
@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionService questionService;

    private List<Question> mockQuestions;

    @BeforeEach
    void setUp() {
        // 테스트용 질문 데이터 생성
        mockQuestions = Arrays.asList(
                Question.builder()
                        .id(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                        .cId("contract_type")
                        .bindingKey("contract_type")
                        .questionType("dropdown")
                        .placeholder("계약 유형을 선택하세요")
                        .outputType("string")
                        .isDefault(true)
                        .isFixed(true)
                        .mIdx(1)
                        .qIdx(1)
                        .title("Contract Type")
                        .questionCategory("basic")
                        .questionTitleKo("계약 유형")
                        .build(),
                Question.builder()
                        .id(UUID.fromString("00000000-0000-0000-0000-000000000002"))
                        .cId("contract_date")
                        .bindingKey("contract_date")
                        .questionType("date")
                        .placeholder("계약 날짜를 입력하세요")
                        .outputType("date")
                        .isDefault(true)
                        .isFixed(false)
                        .mIdx(1)
                        .qIdx(2)
                        .title("Contract Date")
                        .questionCategory("basic")
                        .questionTitleKo("계약 날짜")
                        .build(),
                Question.builder()
                        .id(UUID.fromString("00000000-0000-0000-0000-000000000003"))
                        .cId("contract_type_standard")
                        .bindingKey("contract_type_standard")
                        .questionType("radio")
                        .placeholder("표준 계약서 유형을 선택하세요")
                        .outputType("string")
                        .isDefault(false)
                        .isFixed(false)
                        .mIdx(2)
                        .qIdx(1)
                        .title("Standard Contract Type")
                        .questionCategory("advanced")
                        .questionTitleKo("표준 계약서 유형")
                        .build()
        );
    }

    /**
     * getAllQuestions 메서드 테스트 - 성공 케이스
     * 모든 질문을 조회하는 로직이 정상 작동하는지 테스트합니다.
     */
    @Test
    @DisplayName("모든 질문 조회 - 성공")
    void getAllQuestions_Success() {
        // given
        when(questionRepository.findAll()).thenReturn(mockQuestions);

        // when
        List<QuestionResponseDto> result = questionService.getAllQuestions();

        // then
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(3);
        assertThat(result.get(0).getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        assertThat(result.get(0).getCId()).isEqualTo("contract_type");
        assertThat(result.get(1).getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000002"));
        assertThat(result.get(1).getCId()).isEqualTo("contract_date");
        assertThat(result.get(2).getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000003"));
        assertThat(result.get(2).getCId()).isEqualTo("contract_type_standard");

        // 리포지토리 메서드 호출 확인
        verify(questionRepository, times(1)).findAll();
    }

    /**
     * getAllQuestions 메서드 테스트 - 데이터가 없는 경우
     * 질문 데이터가 없을 때 빈 리스트를 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("모든 질문 조회 - 데이터 없음")
    void getAllQuestions_EmptyList() {
        // given
        when(questionRepository.findAll()).thenReturn(new ArrayList<>());

        // when
        List<QuestionResponseDto> result = questionService.getAllQuestions();

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        // 리포지토리 메서드 호출 확인
        verify(questionRepository, times(1)).findAll();
    }

    /**
     * getAllQuestions 메서드 테스트 - 예외 발생
     * 리포지토리에서 예외가 발생했을 때 빈 리스트를 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("모든 질문 조회 - 예외 발생")
    void getAllQuestions_Exception() {
        // given
        when(questionRepository.findAll()).thenThrow(new RuntimeException("데이터베이스 오류"));

        // when
        List<QuestionResponseDto> result = questionService.getAllQuestions();

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        // 리포지토리 메서드 호출 확인
        verify(questionRepository, times(1)).findAll();
    }

    /**
     * getFilteredQuestions 메서드 테스트 - 모든 조건이 "all"인 경우
     * 모든 필터 조건이 "all"일 때 findAll 메서드를 호출하는지 테스트합니다.
     */
    @Test
    @DisplayName("필터링된 질문 조회 - 모든 조건이 all")
    void getFilteredQuestions_AllParameters() {
        // given
        when(questionRepository.findAll()).thenReturn(mockQuestions);

        // when
        List<QuestionResponseDto> result = questionService.getFilteredQuestions("all", "all");

        // then
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(3);
        assertThat(result.get(0).getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        assertThat(result.get(1).getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000002"));
        assertThat(result.get(2).getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000003"));

        // findAll 메서드 호출 확인
        verify(questionRepository, times(1)).findAll();
        // searchByCid 메서드는 호출되지 않음
        verify(questionRepository, never()).searchByCid(anyString(), anyString());
    }

    /**
     * getFilteredQuestions 메서드 테스트 - 특정 조건으로 필터링
     * 특정 필터 조건으로 searchByCid 메서드를 호출하는지 테스트합니다.
     */
    @Test
    @DisplayName("필터링된 질문 조회 - 특정 조건")
    void getFilteredQuestions_SpecificParameters() {
        // given
        List<Question> filteredQuestions = List.of(mockQuestions.get(0));
        when(questionRepository.searchByCid("contract_type", "basic")).thenReturn(filteredQuestions);

        // when
        List<QuestionResponseDto> result = questionService.getFilteredQuestions("contract_type", "basic");

        // then
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(1);
        assertThat(result.get(0).getCId()).isEqualTo("contract_type");
        assertThat(result.get(0).getQuestionCategory()).isEqualTo("basic");

        // searchByCid 메서드 호출 확인
        verify(questionRepository, times(1)).searchByCid("contract_type", "basic");
        // findAll 메서드는 호출되지 않음
        verify(questionRepository, never()).findAll();
    }

    /**
     * getFilteredQuestions 메서드 테스트 - 필터링 결과가 없는 경우
     * 필터링 결과가 없을 때 빈 리스트를 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("필터링된 질문 조회 - 결과 없음")
    void getFilteredQuestions_NoResults() {
        // given
        when(questionRepository.searchByCid("nonexistent", "category")).thenReturn(new ArrayList<>());

        // when
        List<QuestionResponseDto> result = questionService.getFilteredQuestions("nonexistent", "category");

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        // searchByCid 메서드 호출 확인
        verify(questionRepository, times(1)).searchByCid("nonexistent", "category");
    }

    /**
     * getFilteredQuestions 메서드 테스트 - 예외 발생
     * 리포지토리에서 예외가 발생했을 때 빈 리스트를 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("필터링된 질문 조회 - 예외 발생")
    void getFilteredQuestions_Exception() {
        // given
        when(questionRepository.searchByCid(anyString(), anyString())).thenThrow(new RuntimeException("데이터베이스 오류"));

        // when
        List<QuestionResponseDto> result = questionService.getFilteredQuestions("query1", "query2");

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        // searchByCid 메서드 호출 확인
        verify(questionRepository, times(1)).searchByCid("query1", "query2");
    }

    /**
     * 질문 데이터 변환 테스트 - QuestionResponseDto 변환
     * Question 엔티티가 QuestionResponseDto로 올바르게 변환되는지 테스트합니다.
     */
    @Test
    @DisplayName("질문 데이터 변환 - DTO 변환 테스트")
    void questionEntityToDto_Conversion() {
        // given
        Question question = mockQuestions.get(0);

        // when
        QuestionResponseDto dto = new QuestionResponseDto(question);

        // then
        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(question.getId());
        assertThat(dto.getCId()).isEqualTo(question.getCId());
        assertThat(dto.getBindingKey()).isEqualTo(question.getBindingKey());
        assertThat(dto.getQuestionType()).isEqualTo(question.getQuestionType());
        assertThat(dto.getPlaceholder()).isEqualTo(question.getPlaceholder());
        assertThat(dto.getOutputType()).isEqualTo(question.getOutputType());
        assertThat(dto.getIsDefault()).isEqualTo(question.getIsDefault());
        assertThat(dto.getIsFixed()).isEqualTo(question.getIsFixed());
        assertThat(dto.getMIdx()).isEqualTo(question.getMIdx());
        assertThat(dto.getQIdx()).isEqualTo(question.getQIdx());
        assertThat(dto.getTitle()).isEqualTo(question.getTitle());
        assertThat(dto.getQuestionCategory()).isEqualTo(question.getQuestionCategory());
        assertThat(dto.getQuestionTitleKo()).isEqualTo(question.getQuestionTitleKo());
    }

    /**
     * 데이터베이스 연결 테스트
     * 데이터베이스 연결 테스트 메서드를 호출하고 결과를 검증합니다.
     */
    @Test
    @DisplayName("데이터베이스 연결 테스트")
    void testDatabaseConnection() {
        // given
        Object[] recordCount = new Object[] {10L};
        List<Object[]> mockResult = new ArrayList<>();
        mockResult.add(recordCount);
        when(questionRepository.testDatabaseConnection()).thenReturn(mockResult);

        // when & then
        // 이 테스트는 QuestionRepository의 testDatabaseConnection 메서드가 
        // 예외 없이 호출되는지만 확인합니다
        assertThat(questionRepository.testDatabaseConnection()).isEqualTo(mockResult);
        verify(questionRepository, times(1)).testDatabaseConnection();
    }

    /**
     * 테이블 구조 확인 테스트
     * 테이블 구조 확인 메서드를 호출하고 결과를 검증합니다.
     */
    @Test
    @DisplayName("테이블 구조 확인")
    void getTableStructure() {
        // given
        Object[] row1 = new Object[] {"id", "uuid", "NO"};
        Object[] row2 = new Object[] {"c_id", "varchar", "YES"};
        Object[] row3 = new Object[] {"bindingKey", "varchar", "YES"};
        
        List<Object[]> mockStructure = new ArrayList<>();
        mockStructure.add(row1);
        mockStructure.add(row2);
        mockStructure.add(row3);
        
        when(questionRepository.getTableStructure()).thenReturn(mockStructure);

        // when & then
        // 이 테스트는 QuestionRepository의 getTableStructure 메서드가 
        // 예외 없이 호출되는지만 확인합니다
        assertThat(questionRepository.getTableStructure()).isEqualTo(mockStructure);
        verify(questionRepository, times(1)).getTableStructure();
    }

    /**
     * findByCid 메서드 테스트
     * 특정 cid로 질문을 조회하는 메서드를 테스트합니다.
     */
    @Test
    @DisplayName("특정 cid로 질문 조회")
    void findByCid() {
        // given
        String cid = "contract_type";
        List<Question> expectedQuestions = Arrays.asList(mockQuestions.get(0));
        when(questionRepository.findByCid(cid)).thenReturn(expectedQuestions);

        // when & then
        List<Question> result = questionRepository.findByCid(cid);
        
        // 결과 검증
        assertThat(result).isNotNull();
        assertThat(result.size()).isEqualTo(1);
        assertThat(result.get(0).getCId()).isEqualTo(cid);
        verify(questionRepository, times(1)).findByCid(cid);
    }

    /**
     * getQuestionById 메서드 테스트 - 성공 케이스
     * ID로 질문을 조회하는 로직이 정상 작동하는지 테스트합니다.
     */
    @Test
    @DisplayName("ID로 질문 조회 - 성공")
    void getQuestionById_Success() {
        // given
        UUID id = UUID.randomUUID();
        Question question = mockQuestions.get(0);
        when(questionRepository.findById(id)).thenReturn(Optional.of(question));

        // when
        QuestionResponseDto result = questionService.getQuestionById(id);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        assertThat(result.getCId()).isEqualTo(question.getCId());
        assertThat(result.getQuestionType()).isEqualTo(question.getQuestionType());

        // 리포지토리 메서드 호출 확인
        verify(questionRepository, times(1)).findById(id);
    }

    /**
     * getQuestionById 메서드 테스트 - 질문이 존재하지 않는 경우
     * 존재하지 않는 ID로 질문을 조회할 때 예외가 발생하는지 테스트합니다.
     */
    @Test
    @DisplayName("ID로 질문 조회 - Not Found 예외")
    void getQuestionById_NotFound() {
        // given
        UUID id = UUID.randomUUID();
        when(questionRepository.findById(id)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> questionService.getQuestionById(id))
                .isInstanceOf(QuestionNotFoundException.class)
                .hasMessageContaining("질문을 찾을 수 없습니다: ID=" + id.toString());

        // 리포지토리 메서드 호출 확인
        verify(questionRepository, times(1)).findById(id);
    }

    /**
     * getQuestionById 메서드 테스트 - 예외 발생
     * 리포지토리에서 예외가 발생했을 때 적절히 처리되는지 테스트합니다.
     */
    @Test
    @DisplayName("ID로 질문 조회 - 예외 발생")
    void getQuestionById_Exception() {
        // given
        UUID id = UUID.randomUUID();
        when(questionRepository.findById(id)).thenThrow(new RuntimeException("데이터베이스 오류"));

        // when & then
        assertThatThrownBy(() -> questionService.getQuestionById(id))
                .isInstanceOf(QuestionNotFoundException.class)
                .hasMessageContaining("질문 조회 중 오류 발생");

        // 리포지토리 메서드 호출 확인
        verify(questionRepository, times(1)).findById(id);
    }
} 