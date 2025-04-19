package com.typelegal.domain.clause.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.UUID;

/**
 * 조항 엔티티
 * clauses 테이블에 매핑됩니다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "clauses")
public class Clause {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "c_id")
    private String cId;

    @Column(name = "c_idx")
    private int cIdx;

    @Column(name = "clause_title_en")
    private String clauseTitleEn;

    @Column(name = "clause_guide")
    private String clauseGuide;

    @Column(name = "content_en")
    private String contentEn;

    @Column(name = "binding_question")
    private String bindingQuestion;

    @Column(name = "binding_input")
    private String bindingInput;

    @Column(name = "clause_trigger", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] clauseTrigger;

    @Column(name = "is_clause")
    private Boolean isClause;

    @Column(name = "is_default")
    private Boolean isDefault;

    @Column(name = "clause_category")
    private String clauseCategory;

    /**
     * 호환성을 위한 메서드: cId를 반환합니다.
     * 필드명이 cId이지만 자바 Bean 명명 규칙에 따라 getter는 getCId()입니다.
     */
    public String getCId() {
        return cId;
    }

    /**
     * 호환성을 위한 메서드: cIdx를 반환합니다.
     * 필드명이 cIdx이지만 자바 Bean 명명 규칙에 따라 getter는 getCIdx()입니다.
     */
    public int getCIdx() {
        return cIdx;
    }
} 