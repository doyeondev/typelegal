package com.typelegal.domain.clause.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * 조항 생성/수정 요청에 사용하는 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClauseRequestDto {
    private UUID id;
    private String cid;
    private int cidx;
    private String clause_title_en; // 이건 그대로 snake_case로 
    private String clause_guide;
    private String content_en;
    private String binding_question;
    private String binding_input;
    private String[] clause_trigger;
    private Boolean is_clause;
    private Boolean is_default;
    private String clause_category;
}
