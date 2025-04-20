package com.typelegal.domain.clause.api;

import com.typelegal.domain.clause.domain.Clause;
import com.typelegal.domain.clause.application.ClauseService;
import com.typelegal.domain.clause.dto.ClauseResponseDto;
import com.typelegal.global.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 조항 API 컨트롤러
 * 조항 관련 API 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/clause")
public class ClauseController {

    private final ClauseService clauseService;

    @Autowired
    public ClauseController(ClauseService clauseService) {
        this.clauseService = clauseService;
    }

    /**
     * 모든 조항 조회
     * @return 조항 목록 DTO
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ClauseResponseDto>>> getAllClauses() {
        System.out.println("조항 전체 조회 API 호출됨");
        List<ClauseResponseDto> result = clauseService.getAllClauses();
        return ResponseEntity.ok(ApiResponse.of(result));
    }

    /**
     * 필터링된 조항 조회
     * @param query1 첫 번째 필터 조건
     * @param query2 두 번째 필터 조건
     * @return 필터링된 조항 목록 DTO
     */
    @GetMapping("/filtered")
    public ResponseEntity<ApiResponse<List<ClauseResponseDto>>> getFilteredClauses(
            @RequestParam(required = false) String query1, 
            @RequestParam(required = false) String query2) {
        List<ClauseResponseDto> result = clauseService.getFilteredClauses(query1, query2);
        return ResponseEntity.ok(ApiResponse.of(result));
    }
} 