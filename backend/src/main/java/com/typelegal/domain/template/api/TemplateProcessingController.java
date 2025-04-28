package com.typelegal.domain.template.api;

import com.typelegal.domain.template.application.TemplateProcessingService;
import com.typelegal.domain.clause.application.ClauseService;
import com.typelegal.domain.clause.dto.ClauseResponseDto;
import com.typelegal.domain.question.application.QuestionService;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * 템플릿 처리 컨트롤러
 * 클라이언트에서 요청하는 템플릿 데이터를 가공하여 반환합니다.
 */
@RestController
@RequestMapping("/api/template")
public class TemplateProcessingController {

    private final ClauseService clauseService;
    private final QuestionService questionService;
    private final TemplateProcessingService templateProcessingService;

    @Autowired
    public TemplateProcessingController(
            ClauseService clauseService,
            QuestionService questionService,
            TemplateProcessingService templateProcessingService) {
        this.clauseService = clauseService;
        this.questionService = questionService;
        this.templateProcessingService = templateProcessingService;
    }

    /**
     * 템플릿 데이터 처리 API (GET 방식)
     * 조항과 질문 데이터를 가져와서 클라이언트가 사용할 수 있는 형태로 가공합니다.
     * @param query1 첫 번째 필터 조건
     * @param query2 두 번째 필터 조건
     * @return 가공된 데이터
     */
    @GetMapping("/process")
    public ResponseEntity<Map<String, Object>> processDataGet(
            @RequestParam(defaultValue = "all") String query1,
            @RequestParam(defaultValue = "all") String query2) {
        
        System.out.println("[API] 템플릿 데이터 처리 API GET 호출됨. query1=" + query1 + ", query2=" + query2);
        return processTemplateData(query1, query2);
    }
    
    /**
     * 템플릿 데이터 처리 API (POST 방식)
     * 조항과 질문 데이터를 가져와서 클라이언트가 사용할 수 있는 형태로 가공합니다.
     * @param requestBody 요청 본문 (type 필드 사용)
     * @return 가공된 데이터
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processDataPost(@RequestBody Map<String, Object> requestBody) {
        String type = (String) requestBody.get("type");
        
        // 클라이언트에서 보낸 query1, query2 값 사용
        String query1 = (String) requestBody.get("query1");
        String query2 = (String) requestBody.get("query2");
        
        // 값이 없는 경우 기본값 설정
        if (query1 == null) {
            query1 = "10"; // 기본값 '10'으로 설정
        }
        
        if (query2 == null && type != null) {
            query2 = type; // query2가 없으면 type 값 사용
        } else if (query2 == null) {
            query2 = "all"; // 둘 다 없으면 기본값
        }
        
        System.out.println("[API] 템플릿 데이터 처리 API POST 호출됨. query1=" + query1 + ", query2=" + query2 + ", type=" + type);
        return processTemplateData(query1, query2);
    }
    
    /**
     * 템플릿 데이터 처리 공통 로직
     * GET과 POST 요청 모두에서 사용
     */
    private ResponseEntity<Map<String, Object>> processTemplateData(String query1, String query2) {
        try {
            // 조항 데이터 조회 (DTO 형태로 반환됨)
            List<ClauseResponseDto> clauseDtos = clauseService.getFilteredClauses(query1, query2);
            System.out.println("[API] 조회된 조항 데이터 수: " + clauseDtos.size());
            
            // 질문 데이터 조회 (DTO 형태로 반환됨)
            List<QuestionResponseDto> questionDtos = questionService.getFilteredQuestions(query1, query2);
            System.out.println("[API] 조회된 질문 데이터 수: " + questionDtos.size());
            
            // 데이터 가공 서비스 호출
            Map<String, Object> processedData = templateProcessingService.processData(clauseDtos, questionDtos);
            
            return ResponseEntity.ok(processedData);
        } catch (Exception e) {
            System.err.println("[ERROR] 데이터 처리 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 오류 응답
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("message", "데이터 처리 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
} 