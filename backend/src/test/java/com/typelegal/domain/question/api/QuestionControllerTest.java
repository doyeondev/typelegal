package com.typelegal.domain.question.api;

import com.typelegal.domain.question.application.QuestionService;
import com.typelegal.domain.question.domain.Question;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import com.typelegal.domain.question.exception.QuestionNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.junit.jupiter.api.Disabled;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * QuestionController 테스트 클래스
 * QuestionController의 API 엔드포인트를 테스트합니다.
 */
@WebMvcTest(QuestionController.class)
@Disabled("테스트코드 작성중")
public class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionService questionService;

    private List<QuestionResponseDto> mockQuestionDtos;
    private Question mockQuestion;
    private QuestionResponseDto mockQuestionDto;

    @BeforeEach
    void setUp() {
        // 테스트용 Question 객체 생성
        mockQuestion = Question.builder()
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
                .build();

        Question question2 = Question.builder()
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
                .build();

        // Question을 QuestionResponseDto로 변환
        mockQuestionDto = new QuestionResponseDto(mockQuestion);
        mockQuestionDtos = Arrays.asList(
                mockQuestionDto,
                new QuestionResponseDto(question2)
        );
    }

    /**
     * 모든 질문 조회 API 테스트 - 성공 케이스
     * 모든 질문을 조회하는 API가 정상 작동하는지 테스트합니다.
     */
    @Test
    @DisplayName("모든 질문 조회 API - 성공")
    void getAllQuestions_Success() throws Exception {
        // given
        when(questionService.getAllQuestions()).thenReturn(mockQuestionDtos);

        // when & then
        mockMvc.perform(get("/api/question/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is("00000000-0000-0000-0000-000000000001")))
                .andExpect(jsonPath("$[0].cId", is("contract_type")))
                .andExpect(jsonPath("$[1].id", is("00000000-0000-0000-0000-000000000002")))
                .andExpect(jsonPath("$[1].cId", is("contract_date")));

        // 서비스 메서드 호출 확인
        verify(questionService, times(1)).getAllQuestions();
    }

    /**
     * 모든 질문 조회 API 테스트 - 데이터가 없는 경우
     * 질문 데이터가 없을 때 빈 배열을 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("모든 질문 조회 API - 데이터 없음")
    void getAllQuestions_EmptyList() throws Exception {
        // given
        when(questionService.getAllQuestions()).thenReturn(Collections.emptyList());

        // when & then
        mockMvc.perform(get("/api/question/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 서비스 메서드 호출 확인
        verify(questionService, times(1)).getAllQuestions();
    }

    /**
     * 필터링된 질문 조회 API 테스트 - 성공 케이스
     * 특정 조건으로 필터링된 질문을 조회하는 API가 정상 작동하는지 테스트합니다.
     */
    @Test
    @DisplayName("필터링된 질문 조회 API - 성공")
    void getFilteredQuestions_Success() throws Exception {
        // given
        List<QuestionResponseDto> filteredList = List.of(mockQuestionDtos.get(0));
        when(questionService.getFilteredQuestions("contract_type", "basic")).thenReturn(filteredList);

        // when & then
        mockMvc.perform(get("/api/question/filtered")
                .param("query1", "contract_type")
                .param("query2", "basic")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("00000000-0000-0000-0000-000000000001")))
                .andExpect(jsonPath("$[0].cId", is("contract_type")))
                .andExpect(jsonPath("$[0].questionCategory", is("basic")));

        // 서비스 메서드 호출 확인
        verify(questionService, times(1)).getFilteredQuestions("contract_type", "basic");
    }

    /**
     * 필터링된 질문 조회 API 테스트 - 데이터가 없는 경우
     * 필터링 결과가 없을 때 빈 배열을 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("필터링된 질문 조회 API - 데이터 없음")
    void getFilteredQuestions_EmptyList() throws Exception {
        // given
        when(questionService.getFilteredQuestions("nonexistent", "category")).thenReturn(Collections.emptyList());

        // when & then
        mockMvc.perform(get("/api/question/filtered")
                .param("query1", "nonexistent")
                .param("query2", "category")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 서비스 메서드 호출 확인
        verify(questionService, times(1)).getFilteredQuestions("nonexistent", "category");
    }

    /**
     * 필터링된 질문 조회 API 테스트 - 필수 파라미터 누락
     * 필수 파라미터가 누락되었을 때 예외를 처리하는지 테스트합니다.
     */
    @Test
    @DisplayName("필터링된 질문 조회 API - 필수 파라미터 누락")
    void getFilteredQuestions_MissingParam() throws Exception {
        // when & then - query2 파라미터 누락
        mockMvc.perform(get("/api/question/filtered")
                .param("query1", "contract_type")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        // 서비스 메서드가 호출되지 않아야 함
        verify(questionService, never()).getFilteredQuestions(anyString(), anyString());
    }

    /**
     * API 응답 로깅 테스트
     * API 응답이 정상적으로 로깅되는지 테스트합니다.
     */
    @Test
    @DisplayName("API 응답 로깅 테스트")
    void testApiResponseLogging() throws Exception {
        // given
        when(questionService.getAllQuestions()).thenReturn(mockQuestionDtos);

        // when
        MvcResult result = mockMvc.perform(get("/api/question/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        // then
        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).isNotEmpty();
        assertThat(responseBody).contains("\"id\":\"00000000-0000-0000-0000-000000000001\"");
        assertThat(responseBody).contains("\"cId\":\"contract_type\"");
    }

    /**
     * ID로 질문 조회 API 테스트 - 성공 케이스
     * ID로 질문을 조회하는 API가 정상 작동하는지 테스트합니다.
     */
    @Test
    @DisplayName("ID로 질문 조회 API - 성공")
    void getQuestionById_Success() throws Exception {
        // given
        UUID id = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(questionService.getQuestionById(id)).thenReturn(mockQuestionDto);

        // when & then
        mockMvc.perform(get("/api/question/{id}", id)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("00000000-0000-0000-0000-000000000001")))
                .andExpect(jsonPath("$.cId", is("contract_type")))
                .andExpect(jsonPath("$.questionType", is("dropdown")))
                .andExpect(jsonPath("$.questionCategory", is("basic")));

        // 서비스 메서드 호출 확인
        verify(questionService, times(1)).getQuestionById(id);
    }

    /**
     * ID로 질문 조회 API 테스트 - 질문이 존재하지 않는 경우
     * 존재하지 않는 ID로 질문을 조회할 때 404 에러를 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("ID로 질문 조회 API - 질문 없음")
    void getQuestionById_NotFound() throws Exception {
        // given
        UUID id = UUID.fromString("123e4567-e89b-12d3-a456-426614174999"); // 없는 UUID
        when(questionService.getQuestionById(id)).thenThrow(new QuestionNotFoundException("질문을 찾을 수 없습니다: ID=" + id.toString()));

        // when & then
        mockMvc.perform(get("/api/question/{id}", id)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.message", containsString("질문을 찾을 수 없습니다")));

        // 서비스 메서드 호출 확인
        verify(questionService, times(1)).getQuestionById(id);
    }

    /**
     * ID로 질문 조회 API 테스트 - 서버 오류 발생
     * 서버 오류가 발생했을 때 500 에러를 반환하는지 테스트합니다.
     */
    @Test
    @DisplayName("ID로 질문 조회 API - 서버 오류")
    void getQuestionById_ServerError() throws Exception {
        // given
        UUID id = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(questionService.getQuestionById(id)).thenThrow(new RuntimeException("서버 오류 발생"));

        // when & then
        mockMvc.perform(get("/api/question/{id}", id)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.error", is("서버 오류가 발생했습니다")));

        // 서비스 메서드 호출 확인
        verify(questionService, times(1)).getQuestionById(id);
    }
} 