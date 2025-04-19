package com.typelegal.domain.member.dao;

import com.typelegal.domain.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

/**
 * Member 엔티티에 대한 데이터 접근 인터페이스
 */
@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {
    
    /**
     * 이메일로 회원 찾기
     * @param email 검색할 이메일
     * @return 회원 정보를 담은 Optional 객체
     */
    Optional<Member> findByEmail(String email);
    
    /**
     * 이메일 존재 여부 확인
     * @param email 검색할 이메일
     * @return 이메일 존재 여부
     */
    boolean existsByEmail(String email);
    
    /**
     * 네이티브 SQL을 사용하여 회원 조회 (네이티브 쿼리 사용 예시)
     * @param email 검색할 이메일
     * @return 회원 정보를 담은 Optional 객체
     */
    @Query(value = "SELECT * FROM members WHERE email = :email", nativeQuery = true)
    Optional<Member> findMemberByEmailNative(@Param("email") String email);
} 