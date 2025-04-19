package com.typelegal.domain.template.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.typelegal.domain.clause.application.ClauseService;
import com.typelegal.domain.clause.dto.ClauseResponseDto;
import com.typelegal.domain.question.application.QuestionService;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import com.typelegal.domain.template.application.TemplateProcessingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TemplateProcessingController API 테스트
 * 템플릿 데이터 처리 엔드포인트를 테스트합니다.
 */
@WebMvcTest(TemplateProcessingController.class)
public class TemplateProcessingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClauseService clauseService;

    @MockBean
    private QuestionService questionService;

    @MockBean
    private TemplateProcessingService templateProcessingService;

    @Test
    @DisplayName("processData_요청을_처리하고_가공된_데이터를_반환한다")
    void processData_성공() throws Exception {
        // given
        // 1. clauseService에서 반환할 조항 데이터
        List<ClauseResponseDto> mockClauseList = new ArrayList<>();
        ClauseResponseDto clause = new ClauseResponseDto();
        clause.setId(UUID.randomUUID());
        clause.setCId("A001");
        clause.setClauseTitleEn("Confidentiality");
        mockClauseList.add(clause);
        
        // 2. questionService에서 반환할 질문 데이터
        List<QuestionResponseDto> mockQuestionList = new ArrayList<>();
        QuestionResponseDto question = new QuestionResponseDto();
        question.setId(UUID.randomUUID());
        question.setBindingQuestionKo("기본 정보");
        question.setBindingKey("party1");
        mockQuestionList.add(question);
        
        // 3. templateProcessingService에서 반환할 가공된 데이터
        Map<String, Object> processedData = new HashMap<>();
        processedData.put("clause", mockClauseList);
        processedData.put("question", mockQuestionList);
        processedData.put("grouped_question", Map.of("기본 정보", mockQuestionList));
        processedData.put("input_array", new ArrayList<>());
        processedData.put("clauseGuide", new ArrayList<>());
        
        // Mock 설정
        when(clauseService.getFilteredClauses("A", "General")).thenReturn(mockClauseList);
        when(questionService.getFilteredQuestions("A", "General")).thenReturn(mockQuestionList);
        when(templateProcessingService.processData(anyList(), anyList())).thenReturn(processedData);

        // when & then
        mockMvc.perform(get("/api/template/process")
                .param("query1", "A")
                .param("query2", "General")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.clause", hasSize(1)))
                .andExpect(jsonPath("$.question", hasSize(1)))
                .andExpect(jsonPath("$.grouped_question.['기본 정보']", hasSize(1)))
                .andExpect(jsonPath("$.input_array").isArray())
                .andExpect(jsonPath("$.clauseGuide").isArray());

        verify(clauseService, times(1)).getFilteredClauses("A", "General");
        verify(questionService, times(1)).getFilteredQuestions("A", "General");
        verify(templateProcessingService, times(1)).processData(anyList(), anyList());
    }
    
    @Test
    @DisplayName("processData_파라미터가_누락된_경우_기본값을_사용한다")
    void processData_기본_파라미터() throws Exception {
        // given
        // Mock 설정 - 빈 결과를 반환하도록 설정
        when(clauseService.getFilteredClauses("all", "all")).thenReturn(new ArrayList<>());
        when(questionService.getFilteredQuestions("all", "all")).thenReturn(new ArrayList<>());
        when(templateProcessingService.processData(anyList(), anyList())).thenReturn(Map.of(
            "clause", new ArrayList<>(),
            "question", new ArrayList<>(),
            "grouped_question", new HashMap<>(),
            "input_array", new ArrayList<>(),
            "clauseGuide", new ArrayList<>()
        ));

        // when & then
        mockMvc.perform(get("/api/template/process")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.clause").isArray())
                .andExpect(jsonPath("$.question").isArray())
                .andExpect(jsonPath("$.grouped_question").exists())
                .andExpect(jsonPath("$.input_array").isArray())
                .andExpect(jsonPath("$.clauseGuide").isArray());

        verify(clauseService, times(1)).getFilteredClauses("all", "all");
        verify(questionService, times(1)).getFilteredQuestions("all", "all");
    }
    
    @Test
    @DisplayName("processData_예외_발생시_오류_응답을_반환한다")
    void processData_예외_처리() throws Exception {
        // given
        when(clauseService.getFilteredClauses(any(), any())).thenThrow(new RuntimeException("DB 조회 오류"));

        // when & then
        mockMvc.perform(get("/api/template/process")
                .param("query1", "A")
                .param("query2", "General")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true))
                .andExpect(jsonPath("$.message").exists());

        verify(clauseService, times(1)).getFilteredClauses("A", "General");
        verify(questionService, never()).getFilteredQuestions(any(), any());
        verify(templateProcessingService, never()).processData(any(), any());
    }
    
    @Test
    @DisplayName("processData_빈_문자열_파라미터로_요청시_all로_변환한다")
    void processData_빈_파라미터() throws Exception {
        // given
        // Mock 설정
        when(clauseService.getFilteredClauses("all", "all")).thenReturn(new ArrayList<>());
        when(questionService.getFilteredQuestions("all", "all")).thenReturn(new ArrayList<>());
        when(templateProcessingService.processData(anyList(), anyList())).thenReturn(Map.of(
            "clause", new ArrayList<>(),
            "question", new ArrayList<>(),
            "grouped_question", new HashMap<>(),
            "input_array", new ArrayList<>(),
            "clauseGuide", new ArrayList<>()
        ));

        // when & then
        mockMvc.perform(get("/api/template/process")
                .param("query1", "")
                .param("query2", "")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // 빈 문자열은 기본값 "all"로 변환되어야 함
        verify(clauseService, times(1)).getFilteredClauses("all", "all");
        verify(questionService, times(1)).getFilteredQuestions("all", "all");
    }
    
    @Test
    @DisplayName("processData_필터링된_조항과_질문_데이터가_모두_없는_경우에도_정상_처리한다")
    void processData_빈_데이터() throws Exception {
        // given
        // 빈 결과 설정
        when(clauseService.getFilteredClauses(any(), any())).thenReturn(new ArrayList<>());
        when(questionService.getFilteredQuestions(any(), any())).thenReturn(new ArrayList<>());
        when(templateProcessingService.processData(anyList(), anyList())).thenReturn(Map.of(
            "clause", new ArrayList<>(),
            "question", new ArrayList<>(),
            "grouped_question", new HashMap<>(),
            "input_array", new ArrayList<>(),
            "clauseGuide", new ArrayList<>()
        ));

        // when & then
        mockMvc.perform(get("/api/template/process")
                .param("query1", "NONEXISTENT")
                .param("query2", "NONEXISTENT")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.clause", hasSize(0)))
                .andExpect(jsonPath("$.question", hasSize(0)))
                .andExpect(jsonPath("$.grouped_question").exists())
                .andExpect(jsonPath("$.input_array", hasSize(0)))
                .andExpect(jsonPath("$.clauseGuide", hasSize(0)));

        verify(clauseService, times(1)).getFilteredClauses("NONEXISTENT", "NONEXISTENT");
        verify(questionService, times(1)).getFilteredQuestions("NONEXISTENT", "NONEXISTENT");
        verify(templateProcessingService, times(1)).processData(anyList(), anyList());
    }
} 