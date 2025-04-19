package com.typelegal.domain.drafting.dao;

import com.typelegal.domain.drafting.domain.Drafting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 계약서 드래프트 데이터에 접근하는 레포지토리 인터페이스
 */
@Repository
public interface DraftingRepository extends JpaRepository<Drafting, UUID> {

    /**
     * 특정 회원의 모든 드래프트 목록을 가져옵니다.
     * 논리적 삭제되지 않은 항목만 반환합니다.
     * 
     * @param memberId 회원 ID
     * @return 드래프트 목록
     */
    @Query("SELECT d FROM Drafting d WHERE d.member.id = :memberId AND d.isDeleted = false ORDER BY d.updatedAt DESC")
    List<Drafting> findAllByMemberIdAndNotDeleted(@Param("memberId") UUID memberId);
    
    /**
     * 특정 회원의 이메일로 모든 드래프트 목록을 가져옵니다.
     * 논리적 삭제되지 않은 항목만 반환합니다.
     * 
     * @param email 회원 이메일
     * @return 드래프트 목록
     */
    @Query("SELECT d FROM Drafting d JOIN d.member m WHERE m.email = :email AND d.isDeleted = false ORDER BY d.updatedAt DESC")
    List<Drafting> findAllByMemberEmailAndNotDeleted(@Param("email") String email);
    
    /**
     * ID로 드래프트를 조회합니다.
     * 논리적 삭제되지 않은 항목만 반환합니다.
     * 
     * @param id 드래프트 ID
     * @return 드래프트 Optional
     */
    @Query("SELECT d FROM Drafting d WHERE d.id = :id AND d.isDeleted = false")
    Optional<Drafting> findByIdAndNotDeleted(@Param("id") UUID id);

    /**
     * ID로 드래프트 존재 여부를 확인합니다.
     * 논리적 삭제되지 않은 항목만 확인합니다.
     * 
     * @param id 드래프트 ID
     * @return 존재 여부
     */
    boolean existsByIdAndIsDeletedFalse(UUID id);
} 