package com.typelegal.domain.template.application;

import com.typelegal.domain.clause.dto.ClauseResponseDto;
import com.typelegal.domain.question.dto.QuestionResponseDto;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 템플릿 처리 서비스
 * 조항과 질문 데이터를 가공하여 클라이언트에서 사용할 수 있는 형태로 변환합니다.
 */
@Service
public class TemplateProcessingService {

    /**
     * 데이터 처리 메서드: 입력 데이터를 가공하여 최종 결과를 반환
     * @param clauseList 조항 목록 (DTO)
     * @param questionList 질문 목록 (DTO)
     * @return 가공된 데이터
     */
    public Map<String, Object> processData(List<ClauseResponseDto> clauseList, List<QuestionResponseDto> questionList) {
        // 1. 조항 데이터를 Map으로 변환 (DTO 버전)
        List<Map<String, Object>> clauseArray = preprocessClauseArray(clauseList);

        // 2. 질문 데이터를 Map으로 변환 (DTO 버전)
        List<Map<String, Object>> questionArray = preprocessQuestionArray(questionList);

        // 3. clause_trigger 추출
        List<List<String>> keyObj = extractClauseTriggers(clauseArray);

        // 4. binding_input 생성
        List<List<Map<String, Object>>> valueObj = generateBindingInput(keyObj);

        // 5. clause_trigger 및 binding_input을 clauseArray에 추가하고 cNo 설정
        addClauseTriggerAndBindingInput(clauseArray, keyObj, valueObj);

        // 6. input_array 생성
        List<Map<String, Object>> inputArray = generateInputArray(keyObj, questionArray);

        // 7. binding_cidx 및 placeholder 값 업데이트
        updateBindingCidxAndPlaceholders(clauseArray, questionArray, inputArray);

        // 8. content_en 내부 문자열을 <span> 태그로 변환
        updateContentWithPlaceholders(clauseArray, inputArray);

        // 9. question을 binding_question_ko 기준으로 그룹화
        Map<String, List<Map<String, Object>>> groupedQuestion =
                groupQuestionsByBindingKey(questionArray);

        // 10. clauseGuide 데이터 정리
        List<Map<String, Object>> clauseGuide = generateClauseGuide(clauseArray);

        // 최종 데이터 반환
        Map<String, Object> processedData = new HashMap<>();
        processedData.put("clause", clauseArray);
        processedData.put("question", questionArray);
        processedData.put("grouped_question", groupedQuestion);
        processedData.put("input_array", inputArray);
        processedData.put("clauseGuide", clauseGuide);

        return processedData;
    }

    /**
     * ClauseResponseDto 객체 리스트를 Map 리스트로 변환
     */
    private List<Map<String, Object>> preprocessClauseArray(List<ClauseResponseDto> clauseList) {
        return clauseList.stream().map(clause -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", clause.getId());
            map.put("cidx", clause.getCIdx()); //  map.put("cIdx", clause.getCIdx()); 이런식으로 수정되어야 함
            map.put("cid", clause.getCId());
            map.put("clause_title_en", clause.getClauseTitleEn());
            map.put("clause_guide", clause.getClauseGuide());
            map.put("content_en", clause.getContentEn());
            map.put("binding_input", clause.getBindingInput());
            map.put("binding_question", clause.getBindingQuestion());
            // clause_trigger가 String[] 타입이므로 리스트로 변환
            if (clause.getClauseTrigger() != null) {
                map.put("clause_trigger", Arrays.asList(clause.getClauseTrigger()));
            } else {
                map.put("clause_trigger", new ArrayList<String>());
            }
            map.put("is_clause", clause.getIsClause());
            map.put("is_default", clause.getIsDefault());
            map.put("clause_category", clause.getClauseCategory());
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * QuestionResponseDto 객체 리스트를 Map 리스트로 변환
     */
    private List<Map<String, Object>> preprocessQuestionArray(List<QuestionResponseDto> questionList) {
        return questionList.stream().map(question -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", question.getId());
            map.put("midx", question.getMIdx());
            map.put("qidx", question.getQIdx());
            map.put("binding_question_ko", question.getBindingQuestionKo());
            map.put("binding_parent", question.getBindingParent());
            map.put("question_category", question.getQuestionCategory());
            map.put("question_title_tag", question.getQuestionTitleTag());
            map.put("question_tip", question.getQuestionTip());
            map.put("question_guide", question.getQuestionGuide());
            map.put("is_default", question.getIsDefault());
            map.put("is_fixed", question.getIsFixed());
            map.put("question_title_ko", question.getQuestionTitleKo());
            map.put("binding_key", question.getBindingKey());
            map.put("output_type", question.getOutputType());
            map.put("question_type", question.getQuestionType());
            map.put("placeholder", question.getPlaceholder());
            map.put("options", question.getOptions());
            map.put("binding_cidx", question.getBindingCidx());
            map.put("binding_trigger", question.getBindingTrigger());
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * 조항의 content_en에서 clause_trigger 추출
     */
    private List<List<String>> extractClauseTriggers(List<Map<String, Object>> clauseArray) {
        return clauseArray.stream()
            .map(clause -> {
                // 이미 존재하는 clause_trigger가 있으면 우선 사용
                if (clause.get("clause_trigger") != null && !((List<?>) clause.get("clause_trigger")).isEmpty()) {
                    return (List<String>) clause.get("clause_trigger");
                }
                // 없으면 content_en에서 추출
                return extractWords((String) clause.get("content_en"));
            })
            .collect(Collectors.toList());
    }

    /**
     * binding_input 생성
     */
    private List<List<Map<String, Object>>> generateBindingInput(List<List<String>> keyObj) {
        return keyObj.stream().map(keys -> keys.stream().map(key -> {
            Map<String, Object> map = new HashMap<>();
            map.put("key", key);
            map.put("value", "");
            map.put("placeholder", "");
            return map;
        }).collect(Collectors.toList())).collect(Collectors.toList());
    }

    /**
     * clause_trigger 및 binding_input을 clauseArray에 추가하고 cno 설정
     */
    private void addClauseTriggerAndBindingInput(List<Map<String, Object>> clauseArray,
            List<List<String>> keyObj, List<List<Map<String, Object>>> valueObj) {
        int clauseNum = 1;
        for (int i = 0; i < clauseArray.size(); i++) {
            Map<String, Object> clause = clauseArray.get(i);
            // clause_trigger는 이미 설정되어 있을 수 있으므로, 없는 경우에만 설정
            if (clause.get("clause_trigger") == null || ((List<?>) clause.get("clause_trigger")).isEmpty()) {
                clause.put("clause_trigger", keyObj.get(i));
            }
            // binding_input 처리 - Clause 엔티티의 binding_input은 String이므로 파싱 필요
            if (clause.get("binding_input") == null || clause.get("binding_input").toString().isEmpty()) {
                clause.put("binding_input", valueObj.get(i));
            } else {
                // binding_input이 문자열로 저장되어 있는 경우, 파싱하여 설정
                try {
                    String bindingInput = (String) clause.get("binding_input");
                    if (bindingInput != null && !bindingInput.isEmpty()) {
                        List<Map<String, Object>> parsedInput = parseBindingInput(bindingInput);
                        if (!parsedInput.isEmpty()) {
                            clause.put("binding_input", parsedInput);
                        } else {
                            clause.put("binding_input", valueObj.get(i));
                        }
                    }
                } catch (Exception e) {
                    System.err.println("binding_input 파싱 중 오류: " + e.getMessage());
                    clause.put("binding_input", valueObj.get(i));
                }
            }
            
            if (Boolean.TRUE.equals(clause.get("is_clause"))
                    && Boolean.TRUE.equals(clause.get("is_default"))) {
                clause.put("cno", clauseNum++);
            }
        }
    }
    
    /**
     * 문자열로 된 binding_input을 파싱
     */
    private List<Map<String, Object>> parseBindingInput(String bindingInput) {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            // 간단한 파싱 로직 (실제 구현 시 JSON 파싱 등 적용)
            String[] inputs = bindingInput.split(",");
            for (String input : inputs) {
                String[] keyValue = input.split(":");
                if (keyValue.length >= 1) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("key", keyValue[0].trim());
                    map.put("value", keyValue.length > 1 ? keyValue[1].trim() : "");
                    map.put("placeholder", "");
                    result.add(map);
                }
            }
        } catch (Exception e) {
            System.err.println("binding_input 파싱 오류: " + e.getMessage());
        }
        return result;
    }

    /**
     * input_array 생성 (binding_key에 해당하는 question_title_tag 값을 placeholder로 설정)
     */
    private List<Map<String, Object>> generateInputArray(List<List<String>> keyObj,
            List<Map<String, Object>> questionArray) {

        // keyObj를 하나의 Set으로 펼쳐서 유니크한 key 값만 추출
        Set<String> uniqueKeys = keyObj.stream().flatMap(List::stream).collect(Collectors.toSet());

        // questionArray에서 binding_key와 question_title_tag를 매핑 (빠른 조회를 위해 Map 활용)
        Map<String, String> keyToPlaceholderMap = questionArray.stream()
                .filter(q -> q.get("binding_key") != null && q.get("question_title_tag") != null)
                .collect(Collectors.toMap(q -> (String) q.get("binding_key"),
                        q -> (String) q.get("question_title_tag"),
                        (existing, replacement) -> existing // 중복 key 발생 시 기존 값 유지
                ));

        // input_array 리스트 생성
        List<Map<String, Object>> inputArray = new ArrayList<>();

        for (String key : uniqueKeys) {
            Map<String, Object> inputMap = new HashMap<>();
            inputMap.put("key", key);
            inputMap.put("value", "");
            inputMap.put("binding_cidx", new ArrayList<Integer>()); // 중복 방지 & 최적화
            inputMap.put("placeholder", keyToPlaceholderMap.getOrDefault(key, "")); // 빠른 조회

            inputArray.add(inputMap);
        }

        return inputArray;
    }

    /**
     * binding_cidx 및 placeholder 값 업데이트
     */
    private void updateBindingCidxAndPlaceholders(List<Map<String, Object>> clauseArray,
            List<Map<String, Object>> questionArray, List<Map<String, Object>> inputArray) {

        for (Map<String, Object> clause : clauseArray) {
            List<String> clauseTriggers = (List<String>) clause.get("clause_trigger");
            if (clauseTriggers == null) continue;

            for (Map<String, Object> question : questionArray) {
                String bindingKey = (String) question.get("binding_key");
                if (bindingKey == null) continue;

                // clause의 clause_trigger 안에 question의 binding_key가 포함된 경우
                if (clauseTriggers.contains(bindingKey)) {
                    // question의 binding_cidx에 clause의 cidx 추가 (Set으로 중복 방지)
                    Set<Integer> bindingSet = new HashSet<>();
                    if (question.get("binding_cidx") != null) {
                        bindingSet.addAll((List<Integer>) question.get("binding_cidx"));
                    }
                    bindingSet.add((Integer) clause.get("cidx"));
                    question.put("binding_cidx", new ArrayList<>(bindingSet));

                    // clause의 binding_input에서 question의 binding_key를 찾아 placeholder 업데이트
                    List<Map<String, Object>> bindingInput =
                            (List<Map<String, Object>>) clause.get("binding_input");
                    if (bindingInput != null) {
                        for (Map<String, Object> input : bindingInput) {
                            if (bindingKey.equals(input.get("key"))) {
                                input.put("placeholder", question.get("question_title_tag"));
                            }
                        }
                    }

                    // input_array에서도 binding_cidx 업데이트 (중복 방지)
                    inputArray.stream().filter(input -> bindingKey.equals(input.get("key")))
                            .forEach(input -> {
                                Set<Integer> inputBindingSet = new HashSet<>();
                                if (input.get("binding_cidx") != null) {
                                    inputBindingSet.addAll((List<Integer>) input.get("binding_cidx"));
                                }
                                inputBindingSet.add((Integer) clause.get("cidx"));
                                input.put("binding_cidx", new ArrayList<>(inputBindingSet));
                            });
                }
            }
        }
    }

    /**
     * clause_array 내 content_en의 `{key}`를 <span> 태그로 변환
     */
    private void updateContentWithPlaceholders(List<Map<String, Object>> clauseArray,
            List<Map<String, Object>> inputArray) {

        for (Map<String, Object> clause : clauseArray) {
            String content = (String) clause.get("content_en");
            if (content == null) continue;

            for (Map<String, Object> input : inputArray) {
                String key = (String) input.get("key");
                String placeholder = (String) input.get("placeholder");
                if (placeholder == null) placeholder = "";

                // `{key}`를 <span> 태그로 변환
                if (key.contains("etc")) {
                    content = content.replaceAll("\\{" + key + "\\}", "<span id=\"span_" + key
                            + "\" class=\"draft hidden\">[" + key + "]</span>");
                } else {
                    content = content.replaceAll("\\{" + key + "\\}", "<span id=\"span_" + key
                            + "\" class=\"draft\">[" + placeholder + "]</span>");
                }
            }

            // 불필요한 HTML 태그 정리
            content = content.replaceAll("<p class=\"font_8\">", "<p>");
            content = content.replaceAll("<b>", "").replaceAll("</b>", "");

            clause.put("content_en", content);
        }
    }

    /**
     * question을 binding_question_ko 기준으로 그룹화
     * LinkedHashMap 사용하여 입력 순서 유지
     */
    private Map<String, List<Map<String, Object>>> groupQuestionsByBindingKey(
            List<Map<String, Object>> questionArray) {
        return questionArray.stream()
                .filter(q -> q.get("binding_question_ko") != null)
                .collect(Collectors.groupingBy(
                        q -> (String) q.get("binding_question_ko"),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));
    }

    /**
     * clauseGuide 리스트 생성 (clause_guide가 존재하는 경우만 추가)
     */
    private List<Map<String, Object>> generateClauseGuide(List<Map<String, Object>> clauseArray) {
        List<Map<String, Object>> clauseGuide = new ArrayList<>();

        for (Map<String, Object> clause : clauseArray) {
            // clause_guide가 null 또는 빈 문자열("")이면 추가하지 않음
            if (clause.get("clause_guide") != null
                    && !((String) clause.get("clause_guide")).isEmpty()) {
                Map<String, Object> clauseGuideObj = new HashMap<>();
                clauseGuideObj.put("id", "tool_" + clause.get("id"));
                clauseGuideObj.put("value", clause.get("clause_guide"));
                clauseGuide.add(clauseGuideObj);
            }
        }

        return clauseGuide;
    }

    /**
     * 문자열에서 `{}`로 감싸진 키 추출
     */
    private List<String> extractWords(String str) {
        if (str == null) return new ArrayList<>();
        
        List<String> words = new ArrayList<>();

        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == '{') {
                int stopIndex = str.indexOf('}', i);
                if (stopIndex != -1) {
                    words.add(str.substring(i + 1, stopIndex));
                }
            }
        }

        return words.stream().distinct().sorted().collect(Collectors.toList()); // 중복 제거 & 정렬
    }
} 