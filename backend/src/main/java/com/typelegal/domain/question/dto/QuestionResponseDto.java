package com.typelegal.domain.question.dto;

import com.typelegal.domain.question.domain.Question;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.*;

/**
 * 질문 응답 DTO
 * 클라이언트에게 필요한 질문 데이터를 전달합니다.
 */
@Getter
@NoArgsConstructor
public class QuestionResponseDto {

    private UUID id;
    private String cId;
    private String bindingKey;
    private String questionType;
    private String placeholder;
    private List<Map<String, Object>> options = new ArrayList<>();
    private String outputType;
    private String bindingParent;
    private Boolean isDefault;
    private Boolean isFixed;
    private String questionGuide;
    private int mIdx;
    private int qIdx;
    private List<Integer> bindingCidx = new ArrayList<>();
    private List<String> bindingTrigger = new ArrayList<>();
    private String title;
    private String questionCategory;
    private String questionTitleKo;
    private String bindingQuestionKo;
    private String questionTitleTag;
    private String questionTip;

    /**
     * Entity → DTO 변환 생성자
     */
    public QuestionResponseDto(Question question) {
        this.id = question.getId();
        this.cId = question.getCId();
        this.bindingKey = question.getBindingKey();
        this.questionType = question.getQuestionType();
        this.placeholder = question.getPlaceholder();
        this.options = Optional.ofNullable(question.getOptions()).orElse(new ArrayList<>());
        this.outputType = question.getOutputType();
        this.bindingParent = question.getBindingParent();
        this.isDefault = question.getIsDefault();
        this.isFixed = question.getIsFixed();
        this.questionGuide = question.getQuestionGuide();
        this.mIdx = question.getMIdx();
        this.qIdx = question.getQIdx();
        this.bindingCidx = Optional.ofNullable(question.getBindingCidx()).orElse(new ArrayList<>());
        this.bindingTrigger = Optional.ofNullable(question.getBindingTrigger()).orElse(new ArrayList<>());
        this.title = question.getTitle();
        this.questionCategory = question.getQuestionCategory();
        this.questionTitleKo = question.getQuestionTitleKo();
        this.bindingQuestionKo = question.getBindingQuestionKo();
        this.questionTitleTag = question.getQuestionTitleTag();
        this.questionTip = question.getQuestionTip();
    }

    /**
     * 테스트 전용 생성자 (간편한 필드 세팅용)
     */
    @Builder
    public QuestionResponseDto(UUID id, String cId, String bindingKey, String questionType,
                               Boolean isDefault, Boolean isFixed, String questionCategory, String questionTitleKo) {
        this.id = id;
        this.cId = cId;
        this.bindingKey = bindingKey;
        this.questionType = questionType;
        this.isDefault = isDefault;
        this.isFixed = isFixed;
        this.questionCategory = questionCategory;
        this.questionTitleKo = questionTitleKo;
    }

    /**
     * UUID 기반 테스트 생성자
     */
    public static QuestionResponseDto testInstance(UUID id, String cId, String bindingKey,
                                                   String questionType, Boolean isDefault, Boolean isFixed,
                                                   String category, String titleKo) {
        return QuestionResponseDto.builder()
                .id(id)
                .cId(cId)
                .bindingKey(bindingKey)
                .questionType(questionType)
                .isDefault(isDefault)
                .isFixed(isFixed)
                .questionCategory(category)
                .questionTitleKo(titleKo)
                .build();
    }

    // 테스트 전용 setter (진짜 필요한 것만 유지)
    public void setId(UUID id) { this.id = id; }
    public void setCId(String cId) { this.cId = cId; }
    public void setBindingKey(String bindingKey) { this.bindingKey = bindingKey; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public void setQuestionTitleKo(String questionTitleKo) { this.questionTitleKo = questionTitleKo; }
    public void setQuestionCategory(String questionCategory) { this.questionCategory = questionCategory; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
    public void setIsFixed(Boolean isFixed) { this.isFixed = isFixed; }
    public void setMIdx(int mIdx) { this.mIdx = mIdx; }
    public void setQIdx(int qIdx) { this.qIdx = qIdx; }
    public void setBindingQuestionKo(String bindingQuestionKo) { this.bindingQuestionKo = bindingQuestionKo; }
    public void setBindingParent(String bindingParent) { this.bindingParent = bindingParent; }
    public void setQuestionTitleTag(String questionTitleTag) { this.questionTitleTag = questionTitleTag; }
    public void setQuestionTip(String questionTip) { this.questionTip = questionTip; }
    public void setQuestionGuide(String questionGuide) { this.questionGuide = questionGuide; }
    public void setOutputType(String outputType) { this.outputType = outputType; }
    public void setPlaceholder(String placeholder) { this.placeholder = placeholder; }
    public void setOptions(List<Map<String, Object>> options) { this.options = options; }
    public void setTitle(String title) { this.title = title; }
    public void setBindingCidx(List<Integer> bindingCidx) { this.bindingCidx = bindingCidx; }
    public void setBindingTrigger(List<String> bindingTrigger) { this.bindingTrigger = bindingTrigger; }
}
