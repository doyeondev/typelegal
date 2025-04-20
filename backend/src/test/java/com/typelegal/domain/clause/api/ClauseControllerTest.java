package com.typelegal.domain.clause.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.typelegal.domain.clause.application.ClauseService;
import com.typelegal.domain.clause.domain.Clause;
import com.typelegal.domain.clause.dto.ClauseResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ClauseController API 엔드포인트 테스트
 * 조항 API의 동작을 검증합니다.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ClauseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClauseService clauseService;

    @Autowired
    private ObjectMapper objectMapper;

    private List<ClauseResponseDto> clauseDtos;

    @BeforeEach
    void setUp() {
        clauseDtos = new ArrayList<>();
        
        // ClauseResponseDto 불변 객체 생성 - 생성자 사용
        // 주석: ClauseResponseDto가 불변 객체로 변경되어 setter 대신 생성자를 사용합니다.
        ClauseResponseDto clause1 = new ClauseResponseDto(
            UUID.randomUUID(), 
            "clause1", 
            "조항 1", 
            "내용 1", 
            true, 
            true, 
            "카테고리 A"
        );
        
        ClauseResponseDto clause2 = new ClauseResponseDto(
            UUID.randomUUID(), 
            "clause2", 
            "조항 2", 
            "내용 2", 
            true, 
            true, 
            "카테고리 B"
        );
        
        ClauseResponseDto clause3 = new ClauseResponseDto(
            UUID.randomUUID(), 
            "clause3", 
            "조항 3", 
            "내용 3", 
            true, 
            true, 
            "카테고리 A"
        );
        
        clauseDtos.add(clause1);
        clauseDtos.add(clause2);
        clauseDtos.add(clause3);
    }

    @Test
    @WithMockUser
    public void getAllClauses_성공() throws Exception {
        // 모킹
        when(clauseService.getAllClauses()).thenReturn(clauseDtos);
        
        // 실행 및 검증
        mockMvc.perform(get("/api/clause/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[0].clauseTitleEn", is("조항 1")))
                .andExpect(jsonPath("$.data[1].clauseTitleEn", is("조항 2")))
                .andExpect(jsonPath("$.data[2].clauseTitleEn", is("조항 3")));
    }

    @Test
    @WithMockUser
    public void getAllClauses_빈_결과() throws Exception {
        // 모킹 - 빈 결과 반환
        when(clauseService.getAllClauses()).thenReturn(new ArrayList<>());
        
        // 실행 및 검증
        mockMvc.perform(get("/api/clause/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @WithMockUser
    public void getFilteredClauses_성공() throws Exception {
        // "카테고리 A"로 필터링된 결과만 반환하도록 모킹
        List<ClauseResponseDto> filteredClauses = clauseDtos.stream()
                .filter(c -> "카테고리 A".equals(c.getClauseCategory()))
                .toList();
        
        // 주석: getFilteredClauses 메서드가 2개의 인자를 받도록 변경되었으므로 mock 설정을 수정합니다.
        when(clauseService.getFilteredClauses(anyString(), anyString())).thenReturn(filteredClauses);
        
        // 실행 및 검증
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "카테고리 A")
                .param("query2", "all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].clauseCategory", is("카테고리 A")))
                .andExpect(jsonPath("$.data[1].clauseCategory", is("카테고리 A")));
    }

    @Test
    @WithMockUser
    public void getFilteredClauses_all_쿼리() throws Exception {
        // "all" 쿼리는 모든 조항을 반환
        // 주석: getFilteredClauses 메서드가 2개의 인자를 받도록 변경되었으므로 mock 설정을 수정합니다.
        when(clauseService.getFilteredClauses("all", "all")).thenReturn(clauseDtos);
        
        // 실행 및 검증
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "all")
                .param("query2", "all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(3)));
    }

    @Test
    @WithMockUser
    public void getFilteredClauses_빈_결과() throws Exception {
        // 필터링 결과가 없는 경우
        // 주석: getFilteredClauses 메서드가 2개의 인자를 받도록 변경되었으므로 mock 설정을 수정합니다.
        when(clauseService.getFilteredClauses("존재하지 않음", "all")).thenReturn(new ArrayList<>());
        
        // 실행 및 검증
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "존재하지 않음")
                .param("query2", "all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @WithMockUser
    public void getFilteredClauses_빈_문자열_파라미터() throws Exception {
        // 빈 문자열 쿼리는 모든 조항을 반환
        // 주석: getFilteredClauses 메서드가 2개의 인자를 받도록 변경되었으므로 mock 설정을 수정합니다.
        when(clauseService.getFilteredClauses("", "all")).thenReturn(clauseDtos);
        
        // 실행 및 검증
        mockMvc.perform(get("/api/clause/filtered")
                .param("query1", "")
                .param("query2", "all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(3)));
    }

    @Test
    @WithMockUser
    public void getFilteredClauses_파라미터_누락() throws Exception {
        // 파라미터가 없는 경우 모든 조항을 반환
        // 주석: getFilteredClauses 메서드가 2개의 인자를 받도록 변경되었으므로 mock 설정을 수정합니다.
        when(clauseService.getFilteredClauses(null, null)).thenReturn(clauseDtos);
        
        // 실행 및 검증
        mockMvc.perform(get("/api/clause/filtered")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(3)));
    }
} 