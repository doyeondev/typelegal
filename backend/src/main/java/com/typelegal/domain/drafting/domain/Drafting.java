package com.typelegal.domain.drafting.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.typelegal.domain.member.domain.Member;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Map;
/**
 * 계약서 드래프트 정보를 담는 엔티티 클래스
 * drafting_data 테이블에 매핑됩니다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "drafting_data")
public class Drafting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "contract_title")
    private String contractTitle;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "contract_data", columnDefinition = "jsonb")
    private Map<String, Object> contractData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "contract_info", columnDefinition = "jsonb")
    private Map<String, Object> contractInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "status")
    private String status;

    @Column(name = "query")
    private String query;

    @Column(name = "type")
    private String type;

    @Column(name = "progress")
    private String progress;

    // 엔티티 생성 전에 생성/수정 시간 자동 설정
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // 기본값 설정
        if (this.isDeleted == null) {
            this.isDeleted = false;
        }
        
        if (this.status == null) {
            this.status = "stage1";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 