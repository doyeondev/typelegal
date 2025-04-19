package com.typelegal.domain.clause.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.typelegal.domain.clause.application.ClauseService;
import com.typelegal.domain.clause.dto.ClauseResponseDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ClauseController API 엔드포인트 테스트
 * 조항 API의 동작을 검증합니다.
 */
@WebMvcTest(ClauseController.class)
class ClauseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClauseService clauseService;

    @Test
    @DisplayName("getAllClauses_성공적으로_모든_조항을_반환한다")
    void getAllClauses_성공() throws Exception {
        // given
        List<ClauseResponseDto> clauseList = Arrays.asList(
                new ClauseResponseDto(UUID.fromString("00000000-0000-0000-0000-000000000001"), "A001", "Confidentiality", 
                        "All parties shall keep confidential...", true, true, "General"),
                new ClauseResponseDto(UUID.fromString("00000000-0000-0000-0000-000000000002"), "B001", "Termination", 
                        "This agreement may be terminated...", true, false, "Special")
        );
        
        when(clauseService.getAllClauses()).thenReturn(clauseList);

        // when & then
        mockMvc.perform(get("/api/clause/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].cid").value("A001"))
                .andExpect(jsonPath("$[0].clauseTitleEn").value("Confidentiality"))
                .andExpect(jsonPath("$[1].cid").value("B001"))
                .andExpect(jsonPath("$[1].clauseTitleEn").value("Termination"));

        verify(clauseService, times(1)).getAllClauses();
    }

    @Test
    @DisplayName("getAllClauses_결과가_없는_경우_빈_배열을_반환한다")
    void getAllClauses_빈_결과() throws Exception {
        // given
        when(clauseService.getAllClauses()).thenReturn(Collections.emptyList());

        // when & then
        mockMvc.perform(get("/api/clause/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(clauseService, times(1)).getAllClauses();
    }

    @Test
    @DisplayName("getFilteredClauses_성공적으로_필터링된_조항을_반환한다")
    void getFilteredClauses_성공() throws Exception {
        // given
        ClauseResponseDto clause = new ClauseResponseDto(UUID.fromString("00000000-0000-0000-0000-000000000001"), "A001", "Confidentiality", 
                "All parties shall keep confidential...", true, true, "General");
        
        when(clauseService.getFilteredClauses("A", "General")).thenReturn(Collections.singletonList(clause));

        // when & then
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "A")
                .param("query2", "General")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].cId").value("A001"))
                .andExpect(jsonPath("$[0].clauseTitleEn").value("Confidentiality"))
                .andExpect(jsonPath("$[0].clauseCategory").value("General"));

        verify(clauseService, times(1)).getFilteredClauses("A", "General");
    }

    @Test
    @DisplayName("getFilteredClauses_all_쿼리로_모든_조항을_반환한다")
    void getFilteredClauses_all_쿼리() throws Exception {
        // given
        List<ClauseResponseDto> clauseList = Arrays.asList(
                new ClauseResponseDto(UUID.fromString("00000000-0000-0000-0000-000000000001"), "A001", "Confidentiality", 
                        "All parties shall keep confidential...", true, true, "General"),
                new ClauseResponseDto(UUID.fromString("00000000-0000-0000-0000-000000000002"), "B001", "Termination", 
                        "This agreement may be terminated...", true, false, "Special")
        );
        
        when(clauseService.getFilteredClauses("all", "all")).thenReturn(clauseList);

        // when & then
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "all")
                .param("query2", "all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].cId").value("A001"))
                .andExpect(jsonPath("$[1].cId").value("B001"));

        verify(clauseService, times(1)).getFilteredClauses("all", "all");
    }

    @Test
    @DisplayName("getFilteredClauses_필터링_결과가_없는_경우_빈_배열을_반환한다")
    void getFilteredClauses_빈_결과() throws Exception {
        // given
        when(clauseService.getFilteredClauses("X", "Unknown")).thenReturn(Collections.emptyList());

        // when & then
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "X")
                .param("query2", "Unknown")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(clauseService, times(1)).getFilteredClauses("X", "Unknown");
    }

    @Test
    @DisplayName("getFilteredClauses_파라미터가_누락된_경우_기본값으로_처리한다")
    void getFilteredClauses_파라미터_누락() throws Exception {
        // given
        List<ClauseResponseDto> clauseList = Arrays.asList(
                new ClauseResponseDto(UUID.fromString("00000000-0000-0000-0000-000000000001"), "A001", "Confidentiality", 
                        "All parties shall keep confidential...", true, true, "General")
        );
        
        when(clauseService.getFilteredClauses(eq(null), eq(null))).thenReturn(clauseList);

        // when & then
        mockMvc.perform(get("/api/clause/filtered")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)));

        verify(clauseService, times(1)).getFilteredClauses(null, null);
    }
    
    @Test
    @DisplayName("getFilteredClauses_빈_문자열_파라미터로_요청시_정상_처리한다")
    void getFilteredClauses_빈_문자열_파라미터() throws Exception {
        // given
        List<ClauseResponseDto> clauseList = Arrays.asList(
                new ClauseResponseDto(UUID.fromString("00000000-0000-0000-0000-000000000001"), "A001", "Confidentiality", 
                        "All parties shall keep confidential...", true, true, "General")
        );
        
        when(clauseService.getFilteredClauses("", "")).thenReturn(clauseList);

        // when & then
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "")
                .param("query2", "")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)));

        verify(clauseService, times(1)).getFilteredClauses("", "");
    }
} 