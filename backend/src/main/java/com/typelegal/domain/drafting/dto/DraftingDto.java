package com.typelegal.domain.drafting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.List;
/**
 * 계약서 드래프트 데이터 전송 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftingDto {
    private UUID id;
    private String contractTitle;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // private List<Map<String, Object>> contractData;
    private Map<String, Object> contractData;
    private Map<String, Object> contractInfo;

    private UUID memberId;
    private String memberName;
    private String status;
    private String query;
    private String type;
    private String progress;
}
