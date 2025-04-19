package com.typelegal.domain.question.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;

/**
 * 질문 엔티티
 * questions 테이블에 매핑됩니다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "questions")
public class Question {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "c_id")
    private String cId;

    @Column(name = "binding_key")
    private String bindingKey;

    @Column(name = "question_type")
    private String questionType;

    @Column(name = "placeholder")
    private String placeholder;

    @Column(name = "options_backup", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> options;

    @Column(name = "output_type")
    private String outputType;

    @Column(name = "binding_parent")
    private String bindingParent;

    @Column(name = "is_default")
    private Boolean isDefault;

    @Column(name = "is_fixed")
    private Boolean isFixed;

    @Column(name = "question_guide")
    private String questionGuide;

    @Column(name = "m_idx")
    private int mIdx;

    @Column(name = "q_idx")
    private int qIdx;

    @Column(name = "binding_cidx", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Integer> bindingCidx;

    @Column(name = "binding_trigger", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> bindingTrigger;

    @Column(name = "title")
    private String title;

    @Column(name = "question_category")
    private String questionCategory;

    @Column(name = "question_title_ko")
    private String questionTitleKo;

    @Column(name = "binding_question_ko")
    private String bindingQuestionKo;

    @Column(name = "question_title_tag")
    private String questionTitleTag;

    @Column(name = "question_tip")
    private String questionTip;
}
