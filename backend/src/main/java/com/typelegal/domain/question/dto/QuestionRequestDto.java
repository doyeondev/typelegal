package com.typelegal.domain.question.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 질문 생성/수정 요청에 사용하는 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionRequestDto {
    private UUID id;
    private String cid;
    private String binding_key; 
    private String question_type;
    private String placeholder;
    private List<Map<String, Object>> options;
    private String output_type;
    private String binding_parent;
    private Boolean is_default;
    private Boolean is_fixed;
    private String question_guide;
    private int midx;
    private int qidx;
    private List<Integer> binding_cidx;
    private List<String> binding_trigger;
    private String title;
    private String question_category;
    private String question_title_ko;
    private String binding_question_ko;
    private String question_title_tag;
    private String question_tip;
} 