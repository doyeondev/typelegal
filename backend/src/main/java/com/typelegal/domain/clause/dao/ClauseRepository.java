package com.typelegal.domain.clause.dao;

import com.typelegal.domain.clause.domain.Clause;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * 조항 Repository
 */
@Repository
public interface ClauseRepository extends JpaRepository<Clause, UUID> {

    // 모든 조항 조회
    @Query(value = "SELECT * FROM clauses", nativeQuery = true)
    List<Clause> findAll();

    // query1, query2 두 개의 조건을 모두 만족하는 조항 조회
    @Query(value = "SELECT * FROM clauses " +
                   "WHERE c_id = :query1 " +
                   "   OR (c_id LIKE CONCAT(:query1, '_%') AND c_id LIKE CONCAT('%_', :query2)) " +
                   "ORDER BY c_idx ASC", nativeQuery = true)
    List<Clause> searchByCid(@Param("query1") String query1, @Param("query2") String query2);

    // 특정 cid로 조회
    @Query(value = "SELECT * FROM clauses WHERE c_id = :cid", nativeQuery = true)
    List<Clause> findByCid(@Param("cid") String cid);

    // 데이터베이스 연결 테스트
    @Query(value = "SELECT COUNT(*) FROM clauses", nativeQuery = true)
    List<Object[]> testDatabaseConnection();
    
    // 테이블 구조 확인
    @Query(value = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'clauses'", nativeQuery = true)
    List<Object[]> getTableStructure();
} 