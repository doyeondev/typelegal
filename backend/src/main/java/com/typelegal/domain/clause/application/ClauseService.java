package com.typelegal.domain.clause.application;

import com.typelegal.domain.clause.domain.Clause;
import com.typelegal.domain.clause.dao.ClauseRepository;
import com.typelegal.domain.clause.dto.ClauseResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 조항 서비스
 * 조항 관련 비즈니스 로직을 처리합니다.
 */
@Service
public class ClauseService {

    private final ClauseRepository clauseRepository;

    @Autowired
    public ClauseService(ClauseRepository clauseRepository) {
        this.clauseRepository = clauseRepository;
    }

    /**
     * 모든 조항 조회
     * @return 조항 목록
     */
    public List<ClauseResponseDto> getAllClauses() {
        System.out.println("[Service] findAllClause() 실행됨");
        
        try {
            // JpaRepository의 기본 findAll() 메서드 사용
            List<Clause> list = clauseRepository.findAll();
            System.out.println("[DEBUG] Retrieved Data Size: " + list.size());
            
            if (!list.isEmpty()) {
                System.out.println("[DEBUG] 데이터 조회 성공. 첫 번째 항목:");
                Clause firstItem = list.get(0);
                System.out.println("Data ID: " + firstItem.getId());
                System.out.println("Data CID: " + firstItem.getCId());
                System.out.println("Data Title: " + firstItem.getClauseTitleEn());
                System.out.println("Data Content: " + firstItem.getContentEn());
                System.out.println("Data Is Clause: " + firstItem.getIsClause());
                System.out.println("Data Is Default: " + firstItem.getIsDefault());
                System.out.println("Data Category: " + firstItem.getClauseCategory());
                
                // 전체 항목 요약
                System.out.println("[DEBUG] 전체 " + list.size() + "개 항목 ID 목록:");
                for (int i = 0; i < list.size(); i++) {
                    System.out.println("Item " + (i+1) + " ID: " + list.get(i).getId());
                }
            } else {
                System.out.println("[DEBUG] 데이터가 존재하지 않습니다.");
                
                // DB 직접 검증
                try {
                    // 데이터베이스 연결 확인을 위한 간단한 쿼리 수행
                    System.out.println("[DEBUG] 데이터베이스 연결 확인을 위한 테스트 쿼리 실행");
                    List<Object[]> testResult = clauseRepository.testDatabaseConnection();
                    System.out.println("[DEBUG] 테스트 쿼리 결과: " + (testResult != null ? testResult.size() : "null"));
                } catch (Exception e) {
                    System.err.println("[ERROR] 테스트 쿼리 실행 중 오류: " + e.getMessage());
                }
                
                // 데이터가 없는 경우 빈 리스트 반환
                return new ArrayList<>();
            }
            
            // Entity를 DTO로 변환하여 반환
            return list.stream()
                    .map(ClauseResponseDto::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("[ERROR] 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 오류 발생 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }

    /**
     * 필터링된 조항 조회
     * @param query1 첫 번째 필터 조건
     * @param query2 두 번째 필터 조건
     * @return 필터링된 조항 목록
     */
    public List<ClauseResponseDto> getFilteredClauses(String query1, String query2) {
        System.out.println("[Service] findFilteredClauses() 실행됨");

        try {
            List<Clause> list;
            
            if ("all".equals(query1) && "all".equals(query2)) {
                list = clauseRepository.findAll();
                System.out.println("전체 조회 - findAll() 사용");
            } else {
                list = clauseRepository.searchByCid(query1, query2);
                System.out.println("필터링 조회 - searchByCid() 사용");
            }
            
            System.out.println("Retrieved Filtered Data Size: " + list.size());
            if (!list.isEmpty()) {
                list.forEach(item -> System.out.println("Filtered Data: " + item.getCId()));
            } else {
                System.out.println("필터링된 데이터가 없습니다.");
                
                // 데이터가 없는 경우 빈 리스트 반환
                return new ArrayList<>();
            }
            
            // Entity를 DTO로 변환하여 반환
            return list.stream()
                    .map(ClauseResponseDto::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("필터링 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            // 오류 발생 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }
    
} 