package com.typelegal.domain.question.api;

import com.typelegal.domain.question.application.QuestionService;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import com.typelegal.domain.question.exception.QuestionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
/**
 * 질문 API 컨트롤러
 * 질문 관련 API 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/question")
public class QuestionController {

    private final QuestionService questionService;

    @Autowired
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    /**
     * 모든 질문 조회
     * @return 질문 목록 DTO
     */
    @GetMapping("/all")
    public List<QuestionResponseDto> getAllQuestions() {
        System.out.println("질문 전체 조회 API 호출됨");
        return questionService.getAllQuestions();
    }

    /**
     * 필터링된 질문 조회
     * @param query1 첫 번째 필터 조건
     * @param query2 두 번째 필터 조건
     * @return 필터링된 질문 목록 DTO
     */
    @GetMapping("/filtered")
    public ResponseEntity<List<QuestionResponseDto>> getFilteredQuestions(
            @RequestParam String query1, 
            @RequestParam String query2) {
        List<QuestionResponseDto> result = questionService.getFilteredQuestions(query1, query2);
        return ResponseEntity.ok(result);
    }
    
    /**
     * ID로 질문 조회
     * @param id 질문 ID
     * @return 질문 DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable UUID id) {
        try {
            System.out.println("ID로 질문 조회 API 호출됨: id=" + id);
            QuestionResponseDto dto = questionService.getQuestionById(id);
            return ResponseEntity.ok(dto);
        } catch (QuestionNotFoundException e) {
            System.out.println("질문을 찾을 수 없음: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "질문을 찾을 수 없습니다");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            System.err.println("API 오류 발생: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "서버 오류가 발생했습니다");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
} 