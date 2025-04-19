// 클라이언트가 필요한 필드만 골라서 보내주기 위한 DTO

package com.typelegal.domain.clause.dto;

import com.typelegal.domain.clause.domain.Clause;
import lombok.Getter;
import java.util.UUID;

@Getter
public class ClauseResponseDto {
    private UUID id;
    private String cId;
    private int cIdx;
    private String clauseTitleEn;
    private String clauseGuide;
    private String contentEn;
    private String bindingQuestion;
    private String bindingInput;
    private String[] clauseTrigger;
    private Boolean isClause;
    private Boolean isDefault;
    private String clauseCategory;

    public ClauseResponseDto(Clause clause) {
        this.id = clause.getId();
        this.cId = clause.getCId();
        this.cIdx = clause.getCIdx();
        this.clauseTitleEn = clause.getClauseTitleEn();
        this.clauseGuide = clause.getClauseGuide();
        this.contentEn = clause.getContentEn();
        this.bindingQuestion = clause.getBindingQuestion();
        this.bindingInput = clause.getBindingInput();
        this.clauseTrigger = clause.getClauseTrigger();
        this.isClause = clause.getIsClause();
        this.isDefault = clause.getIsDefault();
        this.clauseCategory = clause.getClauseCategory();
    }
    
    /**
     * 테스트 전용 기본 생성자
     * 외부에서 사용하지 말 것
     */
    public ClauseResponseDto() {
        // 테스트용 기본 생성자
    }
    
    /**
     * 테스트 전용 생성자
     * 외부에서 사용하지 말 것
     */
    public ClauseResponseDto(UUID id, String cId, String clauseTitleEn, 
                            String contentEn, Boolean isClause, Boolean isDefault, 
                            String clauseCategory) {
        this.id = id;
        this.cId = cId;
        this.clauseTitleEn = clauseTitleEn;
        this.contentEn = contentEn;
        this.isClause = isClause;
        this.isDefault = isDefault;
        this.clauseCategory = clauseCategory;
    }
    
    // 테스트 전용 Setter 메서드들

    /**
     * 테스트 전용 메서드
     * UUID를 String으로 변환하여 저장
     * 외부에서 사용하지 말 것
     */
    public void setId(UUID id) {
        this.id = id;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setCId(String cId) {
        this.cId = cId;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setCIdx(int cIdx) {
        this.cIdx = cIdx;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setClauseTitleEn(String clauseTitleEn) {
        this.clauseTitleEn = clauseTitleEn;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setClauseGuide(String clauseGuide) {
        this.clauseGuide = clauseGuide;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setContentEn(String contentEn) {
        this.contentEn = contentEn;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setBindingQuestion(String bindingQuestion) {
        this.bindingQuestion = bindingQuestion;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setBindingInput(String bindingInput) {
        this.bindingInput = bindingInput;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setClauseTrigger(String[] clauseTrigger) {
        this.clauseTrigger = clauseTrigger;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setIsClause(Boolean isClause) {
        this.isClause = isClause;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
    
    /**
     * 테스트 전용 메서드
     * 외부에서 사용하지 말 것
     */
    public void setClauseCategory(String clauseCategory) {
        this.clauseCategory = clauseCategory;
    }
    
    // snake_case getter 메서드들 - 이전 코드와의 호환성을 위해 유지
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public String getClause_title_en() {
        return this.clauseTitleEn;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public String getClause_guide() {
        return this.clauseGuide;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public String getContent_en() {
        return this.contentEn;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public String getBinding_question() {
        return this.bindingQuestion;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public String getBinding_input() {
        return this.bindingInput;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public String[] getClause_trigger() {
        return this.clauseTrigger;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public Boolean getIs_clause() {
        return this.isClause;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public Boolean getIs_default() {
        return this.isDefault;
    }
    
    /**
     * 이전 코드와의 호환성을 위한 메서드
     */
    public String getClause_category() {
        return this.clauseCategory;
    }

    /**
     * camelCase 규칙에 맞는 getter
     */
    public String getCId() {
        return this.cId;
    }
    
    /**
     * camelCase 규칙에 맞는 getter
     */
    public int getCIdx() {
        return this.cIdx;
    }
    
    /**
     * 테스트 전용 정적 팩토리 메서드
     * 외부에서 사용하지 말 것
     */
    public static ClauseResponseDto testInstance(UUID id, String cId, String clauseTitleEn, 
                                            String contentEn, Boolean isClause, 
                                            Boolean isDefault, String clauseCategory) {
        ClauseResponseDto dto = new ClauseResponseDto(id, cId, clauseTitleEn, contentEn, isClause, isDefault, clauseCategory);
        return dto;
    }
}
