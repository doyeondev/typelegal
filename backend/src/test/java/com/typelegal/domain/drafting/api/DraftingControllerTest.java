package com.typelegal.domain.drafting.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.typelegal.domain.drafting.application.DraftingService;
import com.typelegal.domain.drafting.dto.DraftingDto;
import com.typelegal.domain.drafting.exception.DraftingNotFoundException;
import com.typelegal.domain.member.domain.Member;
import com.typelegal.global.security.JwtConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
// import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * DraftingController 통합 테스트
 * - 테스트 환경 설정을 사용
 * - 실제 빈을 사용하되 Service는 모킹
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")  // application-test.yml 사용
class DraftingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DraftingService draftingService;

    @Autowired
    private JwtConfig jwtConfig;

    private DraftingDto testDraftingDto;
    private UUID draftingId;
    private UUID memberId;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 준비
        draftingId = UUID.randomUUID();
        memberId = UUID.randomUUID();
        
        // 계약서 데이터 생성
        // Map<String, Object> contractDataMap = new HashMap<>();
        // contractDataMap.put("clause1", "계약 조항 1 내용");
        // contractDataMap.put("clause2", "계약 조항 2 내용");
        // List<Map<String, Object>> contractData = List.of(contractDataMap);
        Map<String, Object> contractData = new HashMap<>();
        contractData.put("clause1", "계약 조항 1 내용");
        contractData.put("clause2", "계약 조항 2 내용");
        
        // 계약 정보 생성
        Map<String, Object> contractInfo = new HashMap<>();
        contractInfo.put("partyA", "계약자 A");
        contractInfo.put("partyB", "계약자 B");

        // DTO 생성
        testDraftingDto = DraftingDto.builder()
                .id(draftingId)
                .contractTitle("테스트 계약서")
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .memberId(memberId)
                .memberName("테스트 사용자")
                .status("stage1")
                .query("테스트 쿼리")
                .type("일반계약")
                .progress("진행중")
                .contractData(contractData)
                .contractInfo(contractInfo)
                .build();
    }

    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("이메일로_드래프트_목록_조회_성공시_200_응답과_목록을_반환한다")
    void getDraftsByEmail_성공() throws Exception {
        // given
        List<DraftingDto> draftingList = new ArrayList<>();
        draftingList.add(testDraftingDto);
        
        when(draftingService.getDraftsByMemberEmail(anyString())).thenReturn(draftingList);

        // when & then
        mockMvc.perform(get("/api/drafting")
                .param("email", "test@typelegal.com")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(draftingId.toString())))
                .andExpect(jsonPath("$[0].contractTitle", is("테스트 계약서")))
                .andExpect(jsonPath("$[0].memberId", is(memberId.toString())));
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("빈_이메일로_드래프트_목록_조회시_400_응답을_반환한다")
    void getDraftsByEmail_이메일_누락_실패() throws Exception {
        // when & then
        mockMvc.perform(get("/api/drafting")
                .param("email", "")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("드래프트_저장_성공시_201_응답과_저장된_드래프트를_반환한다")
    void saveDraft_성공() throws Exception {
        // given
        when(draftingService.saveDraft(any(DraftingDto.class))).thenReturn(testDraftingDto);

        // when & then
        mockMvc.perform(post("/api/drafting")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDraftingDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(draftingId.toString())))
                .andExpect(jsonPath("$.contractTitle", is("테스트 계약서")));
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("드래프트_수정_성공시_200_응답과_수정된_드래프트를_반환한다")
    void updateDraft_성공() throws Exception {
        // given
        DraftingDto updatedDto = DraftingDto.builder()
                .id(draftingId)
                .contractTitle("수정된 계약서")
                .isDeleted(false)
                .memberId(memberId)
                .status("stage2")
                .contractData(testDraftingDto.getContractData())
                .contractInfo(testDraftingDto.getContractInfo())
                .build();
                
        when(draftingService.updateDraft(any(UUID.class), any(DraftingDto.class))).thenReturn(updatedDto);

        // when & then
        mockMvc.perform(put("/api/drafting/{id}", draftingId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(draftingId.toString())))
                .andExpect(jsonPath("$.contractTitle", is("수정된 계약서")))
                .andExpect(jsonPath("$.status", is("stage2")));
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("존재하지_않는_드래프트_수정시_404_응답을_반환한다")
    void updateDraft_드래프트_미존재_실패() throws Exception {
        // given
        UUID nonExistentId = UUID.randomUUID();
        
        when(draftingService.updateDraft(any(UUID.class), any(DraftingDto.class)))
                .thenThrow(new DraftingNotFoundException("드래프트를 찾을 수 없습니다: " + nonExistentId));

        // when & then
        mockMvc.perform(put("/api/drafting/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDraftingDto)))
                .andExpect(status().isNotFound());
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("드래프트_삭제_성공시_204_응답을_반환한다")
    void deleteDraft_성공() throws Exception {
        // given
        doNothing().when(draftingService).deleteDraft(any(UUID.class));

        // when & then
        mockMvc.perform(delete("/api/drafting/{id}", draftingId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
                
        verify(draftingService, times(1)).deleteDraft(draftingId);
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("존재하지_않는_드래프트_삭제시_404_응답을_반환한다")
    void deleteDraft_드래프트_미존재_실패() throws Exception {
        // given
        UUID nonExistentId = UUID.randomUUID();
        
        doThrow(new DraftingNotFoundException("드래프트를 찾을 수 없습니다: " + nonExistentId))
                .when(draftingService).deleteDraft(any(UUID.class));

        // when & then
        mockMvc.perform(delete("/api/drafting/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("드래프트_ID로_조회_성공시_200_응답과_드래프트를_반환한다")
    void getDraftById_성공() throws Exception {
        // given
        when(draftingService.getDraftById(any(UUID.class))).thenReturn(testDraftingDto);

        // when & then
        mockMvc.perform(get("/api/drafting/{id}", draftingId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(draftingId.toString())))
                .andExpect(jsonPath("$.contractTitle", is("테스트 계약서")));
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("존재하지_않는_ID로_조회시_404_응답을_반환한다")
    void getDraftById_드래프트_미존재_실패() throws Exception {
        // given
        UUID nonExistentId = UUID.randomUUID();
        
        when(draftingService.getDraftById(any(UUID.class)))
                .thenThrow(new DraftingNotFoundException("드래프트를 찾을 수 없습니다: " + nonExistentId));

        // when & then
        mockMvc.perform(get("/api/drafting/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("드래프트_존재_여부_확인_존재하는_경우_200_응답을_반환한다")
    void checkDraftExists_존재() throws Exception {
        // given
        when(draftingService.existsById(any(UUID.class))).thenReturn(true);

        // when & then
        mockMvc.perform(get("/api/drafting/exists/{id}", draftingId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }
    
    @Test
    // @WithMockUser(username = "test@typelegal.com", roles = "USER")
    @DisplayName("드래프트_존재_여부_확인_존재하지_않는_경우_200_응답과_false를_반환한다")
    void checkDraftExists_미존재() throws Exception {
        // given
        UUID nonExistentId = UUID.randomUUID();
        when(draftingService.existsById(any(UUID.class))).thenReturn(false);

        // when & then
        mockMvc.perform(get("/api/drafting/exists/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }
} 