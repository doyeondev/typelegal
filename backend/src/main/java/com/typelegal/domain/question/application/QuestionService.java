package com.typelegal.domain.question.application;

import com.typelegal.domain.question.domain.Question;
import com.typelegal.domain.question.dao.QuestionRepository;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import com.typelegal.domain.question.exception.QuestionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.UUID;
/**
 * 질문 서비스
 * 질문 관련 비즈니스 로직을 처리합니다.
 */
@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    /**
     * 모든 질문 조회
     * @return 질문 목록 DTO
     */
    public List<QuestionResponseDto> getAllQuestions() {
        System.out.println("[INFO] 모든 질문 조회 시작");
        
        try {
            // 모든 데이터 조회
            List<Question> questions = questionRepository.findAll();
            
            if (questions.isEmpty()) {
                System.out.println("[WARN] 질문 데이터가 존재하지 않습니다.");
                // 데이터가 없으면 빈 리스트 반환
                return new ArrayList<>();
            }
            
            System.out.println("[INFO] " + questions.size() + "개의 질문 데이터 조회 완료");
            
            // Entity를 DTO로 변환하여 반환
            return questions.stream()
                    .map(QuestionResponseDto::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("[ERROR] 질문 데이터 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            // 오류 발생 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }

    /**
     * 필터링된 질문 조회
     * @param query1 첫 번째 필터 조건
     * @param query2 두 번째 필터 조건
     * @return 필터링된 질문 목록 DTO
     */
    public List<QuestionResponseDto> getFilteredQuestions(String query1, String query2) {
        System.out.println("[INFO] 필터링된 질문 조회 시작: query1=" + query1 + ", query2=" + query2);
        
        try {
            List<Question> list;
            
            if ("all".equals(query1) && "all".equals(query2)) {
                list = questionRepository.findAll();
                System.out.println("[INFO] 전체 조회 - findAll() 사용");
            } else {
                // 중요: ClauseService와 동일하게 searchByCid 사용 (이게 핵심)
                list = questionRepository.searchByCid(query1, query2);
                System.out.println("[INFO] 필터링 조회 - searchByCid() 사용");
            }
            
            System.out.println("[INFO] Retrieved Filtered Data Size: " + list.size());
            if (!list.isEmpty()) {
                list.forEach(item -> System.out.println("[INFO] Filtered Data: " + item.getCId()));
            } else {
                System.out.println("[WARN] 필터링된 데이터가 없습니다.");
                
                // 데이터가 없는 경우 빈 리스트 반환
                return new ArrayList<>();
            }
            
            // Entity를 DTO로 변환하여 반환
            return list.stream()
                    .map(QuestionResponseDto::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("[ERROR] 필터링 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 오류 발생 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }

    /**
     * ID로 질문 조회
     * @param id 질문 ID
     * @return 질문 DTO
     * @throws QuestionNotFoundException 질문을 찾을 수 없을 때 발생
     */
    public QuestionResponseDto getQuestionById(UUID id) {
        System.out.println("[INFO] ID로 질문 조회 시작: id=" + id);
        
        try {
            // 리포지토리에서 ID로 질문 조회
            Question question = questionRepository.findById(id)
                    .orElseThrow(() -> {
                        String idString = id.toString();
                        System.out.println("[WARN] ID=" + idString + "인 질문을 찾을 수 없습니다.");
                        return new QuestionNotFoundException("질문을 찾을 수 없습니다: ID=" + idString);
                    });
            
            System.out.println("[INFO] ID=" + id + "인 질문 조회 완료");
            
            // Entity를 DTO로 변환하여 반환
            return new QuestionResponseDto(question);
        } catch (QuestionNotFoundException e) {
            // 질문을 찾을 수 없는 예외는 그대로 던짐
            throw e;
        } catch (Exception e) {
            System.err.println("[ERROR] ID로 질문 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 다른 예외는 QuestionNotFoundException으로 변환하여 던짐
            String errorMsg = "질문 조회 중 오류 발생: " + e.getMessage();
            throw new QuestionNotFoundException(errorMsg, e);
        }
    }
} 