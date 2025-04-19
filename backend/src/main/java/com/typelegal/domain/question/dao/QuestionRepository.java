package com.typelegal.domain.question.dao;

import com.typelegal.domain.question.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 질문 Repository
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
   

    // 모든 질문 조회
    @Query(value = "SELECT * FROM questions", nativeQuery = true)
    List<Question> findAll();

    // query1, query2 두 개의 조건을 모두 만족하는 질문 조회
    @Query(value = "SELECT * FROM questions " +
                   "WHERE c_id = :query1 " +
                   "OR (c_id LIKE CONCAT(:query1, '_%') AND c_id LIKE CONCAT('%_', :query2)) " +
                   "ORDER BY m_idx ASC, q_idx ASC", nativeQuery = true)
    List<Question> searchByCid(@Param("query1") String query1, @Param("query2") String query2);
    
    // 특정 cid로 조회
    @Query(value = "SELECT * FROM questions " +
                   "WHERE c_id = :cid " +
                   "ORDER BY m_idx ASC, q_idx ASC", nativeQuery = true)
    List<Question> findByCid(@Param("cid") String cid);

    // 데이터베이스 연결 테스트
    @Query(value = "SELECT COUNT(*) FROM questions", nativeQuery = true)
    List<Object[]> testDatabaseConnection();

    // 테이블 구조 확인
    @Query(value = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'questions'", nativeQuery = true)
    List<Object[]> getTableStructure();
} 