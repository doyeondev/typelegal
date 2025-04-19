package com.typelegal.domain.clause.application;

import com.typelegal.domain.clause.dao.ClauseRepository;
import com.typelegal.domain.clause.domain.Clause;
import com.typelegal.domain.clause.dto.ClauseResponseDto;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * ClauseService 클래스 단위 테스트
 * 조항 서비스의 기능을 검증합니다.
 */
@ExtendWith(MockitoExtension.class)
class ClauseServiceTest {

    @Mock
    private ClauseRepository clauseRepository;

    @InjectMocks
    private ClauseService clauseService;

    private List<Clause> mockClauses;

    @BeforeEach
    void setUp() {
        // 테스트용 조항 데이터 생성
        mockClauses = new ArrayList<>();
        
        Clause clause1 = new Clause();
        clause1.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        clause1.setCId("A001");
        clause1.setClauseTitleEn("Confidentiality");
        clause1.setContentEn("All parties shall keep confidential...");
        clause1.setIsClause(true);
        clause1.setIsDefault(true);
        clause1.setClauseCategory("General");
        
        Clause clause2 = new Clause();
        clause2.setId(UUID.fromString("00000000-0000-0000-0000-000000000002"));
        clause2.setCId("B001");
        clause2.setClauseTitleEn("Termination");
        clause2.setContentEn("This agreement may be terminated...");
        clause2.setIsClause(true);
        clause2.setIsDefault(false);
        clause2.setClauseCategory("Special");
        
        Clause clause3 = new Clause();
        clause3.setId(UUID.fromString("00000000-0000-0000-0000-000000000003"));
        clause3.setCId("A002");
        clause3.setClauseTitleEn("Intellectual Property");
        clause3.setContentEn("All intellectual property rights shall remain...");
        clause3.setIsClause(true);
        clause3.setIsDefault(true);
        clause3.setClauseCategory("General");
        
        mockClauses.add(clause1);
        mockClauses.add(clause2);
        mockClauses.add(clause3);
    }

    @Test
    @DisplayName("getAllClauses_모든_조항을_조회하고_DTO로_변환하여_반환한다")
    void getAllClauses_성공() {
        // given
        when(clauseRepository.findAll()).thenReturn(mockClauses);

        // when
        List<ClauseResponseDto> result = clauseService.getAllClauses();

        // then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(mockClauses.get(0).getCId(), result.get(0).getCId());
        assertEquals(mockClauses.get(0).getClauseTitleEn(), result.get(0).getClauseTitleEn());
        assertEquals(mockClauses.get(1).getCId(), result.get(1).getCId());
        assertEquals(mockClauses.get(1).getClauseTitleEn(), result.get(1).getClauseTitleEn());
        verify(clauseRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllClauses_조회_결과가_없을_경우_빈_리스트를_반환한다")
    void getAllClauses_빈_결과() {
        // given
        when(clauseRepository.findAll()).thenReturn(new ArrayList<>());
        when(clauseRepository.testDatabaseConnection()).thenReturn(new ArrayList<>());

        // when
        List<ClauseResponseDto> result = clauseService.getAllClauses();

        // then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(clauseRepository, times(1)).findAll();
        verify(clauseRepository, times(1)).testDatabaseConnection();
    }

    @Test
    @DisplayName("getAllClauses_예외_발생시_빈_리스트를_반환한다")
    void getAllClauses_예외_처리() {
        // given
        when(clauseRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        // when
        List<ClauseResponseDto> result = clauseService.getAllClauses();

        // then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(clauseRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getFilteredClauses_all_쿼리로_모든_조항을_반환한다")
    void getFilteredClauses_all_쿼리() {
        // given
        when(clauseRepository.findAll()).thenReturn(mockClauses);

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses("all", "all");

        // then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(clauseRepository, times(1)).findAll();
        verify(clauseRepository, never()).searchByCid(anyString(), anyString());
    }

    @Test
    @DisplayName("getFilteredClauses_특정_조건으로_필터링된_조항을_반환한다")
    void getFilteredClauses_필터링() {
        // given
        List<Clause> filteredClauses = Arrays.asList(mockClauses.get(0));
        when(clauseRepository.searchByCid("A", "General")).thenReturn(filteredClauses);

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses("A", "General");

        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("A001", result.get(0).getCId());
        assertEquals("Confidentiality", result.get(0).getClauseTitleEn());
        verify(clauseRepository, never()).findAll();
        verify(clauseRepository, times(1)).searchByCid("A", "General");
    }

    @Test
    @DisplayName("getFilteredClauses_필터링_결과가_없을_경우_빈_리스트를_반환한다")
    void getFilteredClauses_빈_결과() {
        // given
        when(clauseRepository.searchByCid("X", "Unknown")).thenReturn(new ArrayList<>());

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses("X", "Unknown");

        // then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(clauseRepository, times(1)).searchByCid("X", "Unknown");
    }

    @Test
    @DisplayName("getFilteredClauses_예외_발생시_빈_리스트를_반환한다")
    void getFilteredClauses_예외_처리() {
        // given
        when(clauseRepository.searchByCid("A", "General")).thenThrow(new RuntimeException("Database error"));

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses("A", "General");

        // then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(clauseRepository, times(1)).searchByCid("A", "General");
    }
    
    @Test
    @DisplayName("getFilteredClauses_query1만_all인_경우에도_필터링을_수행한다")
    void getFilteredClauses_부분_필터링_1() {
        // given
        List<Clause> filteredClauses = Arrays.asList(mockClauses.get(0), mockClauses.get(2));
        when(clauseRepository.searchByCid("all", "General")).thenReturn(filteredClauses);

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses("all", "General");

        // then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("A001", result.get(0).getCId());
        assertEquals("A002", result.get(1).getCId());
        verify(clauseRepository, never()).findAll();
        verify(clauseRepository, times(1)).searchByCid("all", "General");
    }
    
    @Test
    @DisplayName("getFilteredClauses_query2만_all인_경우에도_필터링을_수행한다")
    void getFilteredClauses_부분_필터링_2() {
        // given
        List<Clause> filteredClauses = Arrays.asList(mockClauses.get(0), mockClauses.get(2));
        when(clauseRepository.searchByCid("A", "all")).thenReturn(filteredClauses);

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses("A", "all");

        // then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("A001", result.get(0).getCId());
        assertEquals("A002", result.get(1).getCId());
        verify(clauseRepository, never()).findAll();
        verify(clauseRepository, times(1)).searchByCid("A", "all");
    }
    
    @Test
    @DisplayName("getFilteredClauses_빈_문자열_쿼리는_필터링을_수행하지_않고_전체_결과를_반환한다")
    void getFilteredClauses_빈_쿼리() {
        // given
        when(clauseRepository.findAll()).thenReturn(mockClauses);

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses("", "");

        // then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(clauseRepository, times(1)).findAll();
        verify(clauseRepository, never()).searchByCid(anyString(), anyString());
    }
    
    @Test
    @DisplayName("getFilteredClauses_null_쿼리는_필터링을_수행하지_않고_전체_결과를_반환한다")
    void getFilteredClauses_null_쿼리() {
        // given
        when(clauseRepository.findAll()).thenReturn(mockClauses);

        // when
        List<ClauseResponseDto> result = clauseService.getFilteredClauses(null, null);

        // then
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(clauseRepository, times(1)).findAll();
        verify(clauseRepository, never()).searchByCid(anyString(), anyString());
    }
}