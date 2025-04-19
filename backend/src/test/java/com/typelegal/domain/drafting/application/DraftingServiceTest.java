package com.typelegal.domain.drafting.application;

import com.typelegal.domain.drafting.dao.DraftingRepository;
import com.typelegal.domain.drafting.domain.Drafting;
import com.typelegal.domain.drafting.dto.DraftingDto;
import com.typelegal.domain.drafting.exception.DraftingNotFoundException;
import com.typelegal.domain.member.dao.MemberRepository;
import com.typelegal.domain.member.domain.Member;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * DraftingService 클래스 단위 테스트
 */
@ExtendWith(MockitoExtension.class)
class DraftingServiceTest {

    @Mock
    private DraftingRepository draftingRepository;

    @Mock
    private MemberRepository memberRepository;
    
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private DraftingService draftingService;

    private Member testMember;
    private Drafting testDrafting;
    private DraftingDto testDraftingDto;
    private UUID memberId;
    private UUID draftingId;

    @BeforeEach
    void setUp() {
        // 테스트 회원 생성
        memberId = UUID.randomUUID();
        testMember = new Member();
        testMember.setId(memberId);
        testMember.setEmail("test@typelegal.com");
        testMember.setPassword("password");
        testMember.setName("테스트 사용자");
        testMember.setRole("USER");
        testMember.setCreatedAt(LocalDateTime.now());
        testMember.setLastLogin(LocalDateTime.now());

        // 테스트 드래프트 생성
        draftingId = UUID.randomUUID();
        testDrafting = new Drafting();
        testDrafting.setId(draftingId);
        testDrafting.setContractTitle("테스트 계약서");
        testDrafting.setIsDeleted(false);
        testDrafting.setCreatedAt(LocalDateTime.now());
        testDrafting.setUpdatedAt(LocalDateTime.now());
        testDrafting.setMember(testMember);
        testDrafting.setStatus("stage1");
        testDrafting.setQuery("테스트 쿼리");
        testDrafting.setType("일반계약");
        testDrafting.setProgress("진행중");
        
        // 계약서 데이터 생성
        Map<String, Object> contractData = new HashMap<>();
        contractData.put("clause1", "계약 조항 1 내용");
        contractData.put("clause2", "계약 조항 2 내용");
        // testDrafting.setContractData(List.of(contractData));
        testDrafting.setContractData(contractData);
        
        // 계약 정보 생성
        Map<String, Object> contractInfo = new HashMap<>();
        contractInfo.put("partyA", "계약자 A");
        contractInfo.put("partyB", "계약자 B");
        testDrafting.setContractInfo(contractInfo);

        // DTO 생성
        // List<Map<String, Object>> contractDataList = List.of(contractData);
        testDraftingDto = DraftingDto.builder()
                .id(draftingId)
                .contractTitle("테스트 계약서")
                .isDeleted(false)
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
    @DisplayName("saveDraft_회원이_존재하는_경우_드래프트를_저장한다")
    void saveDraft_회원_존재_성공() {
        // given
        when(memberRepository.findById(any(UUID.class))).thenReturn(Optional.of(testMember));
        when(draftingRepository.save(any(Drafting.class))).thenReturn(testDrafting);

        // when
        DraftingDto savedDto = draftingService.saveDraft(testDraftingDto);

        // then
        assertNotNull(savedDto);
        assertEquals(testDraftingDto.getContractTitle(), savedDto.getContractTitle());
        assertEquals(testDraftingDto.getMemberId(), savedDto.getMemberId());
        verify(draftingRepository).save(any(Drafting.class));
    }

    @Test
    @DisplayName("saveDraft_회원이_존재하지_않는_경우에도_드래프트를_저장한다")
    void saveDraft_회원_미존재_성공() {
        // given
        when(memberRepository.findById(any(UUID.class))).thenReturn(Optional.empty());
        
        // 회원 없는 드래프트
        Drafting noMemberDrafting = new Drafting();
        noMemberDrafting.setId(draftingId);
        noMemberDrafting.setContractTitle("테스트 계약서");
        noMemberDrafting.setMember(null);
        noMemberDrafting.setStatus("stage1");
        noMemberDrafting.setContractData(testDrafting.getContractData());
        noMemberDrafting.setContractInfo(testDrafting.getContractInfo());
        
        when(draftingRepository.save(any(Drafting.class))).thenReturn(noMemberDrafting);

        // when
        DraftingDto savedDto = draftingService.saveDraft(testDraftingDto);

        // then
        assertNotNull(savedDto);
        assertEquals(testDraftingDto.getContractTitle(), savedDto.getContractTitle());
        verify(draftingRepository).save(any(Drafting.class));
    }

    @Test
    @DisplayName("updateDraft_드래프트_수정_성공")
    void updateDraft_성공() {
        // given
        when(draftingRepository.findByIdAndNotDeleted(any(UUID.class))).thenReturn(Optional.of(testDrafting));
        when(draftingRepository.save(any(Drafting.class))).thenReturn(testDrafting);

        // 업데이트할 DTO 생성
        DraftingDto updateDto = DraftingDto.builder()
                .contractTitle("수정된 계약서")
                .status("stage2")
                .contractData(testDraftingDto.getContractData())
                .contractInfo(testDraftingDto.getContractInfo())
                .build();

        // when
        DraftingDto updatedDto = draftingService.updateDraft(draftingId, updateDto);

        // then
        assertNotNull(updatedDto);
        assertEquals("수정된 계약서", updatedDto.getContractTitle());
        assertEquals("stage2", updatedDto.getStatus());
        verify(draftingRepository).save(any(Drafting.class));
    }

    @Test
    @DisplayName("updateDraft_존재하지_않는_드래프트_수정시_예외를_던진다")
    void updateDraft_드래프트_미존재_예외발생() {
        // given
        when(draftingRepository.findByIdAndNotDeleted(any(UUID.class))).thenReturn(Optional.empty());

        // when & then
        assertThrows(DraftingNotFoundException.class, () -> {
            draftingService.updateDraft(draftingId, testDraftingDto);
        });
        
        verify(draftingRepository, never()).save(any(Drafting.class));
    }

    @Test
    @DisplayName("deleteDraft_드래프트_삭제_성공")
    void deleteDraft_성공() {
        // given
        when(draftingRepository.findByIdAndNotDeleted(any(UUID.class))).thenReturn(Optional.of(testDrafting));
        
        // when
        draftingService.deleteDraft(draftingId);
        
        // then
        assertTrue(testDrafting.getIsDeleted());
        verify(draftingRepository).save(testDrafting);
    }
    
    @Test
    @DisplayName("deleteDraft_존재하지_않는_드래프트_삭제시_예외를_던진다")
    void deleteDraft_드래프트_미존재_예외발생() {
        // given
        when(draftingRepository.findByIdAndNotDeleted(any(UUID.class))).thenReturn(Optional.empty());
        
        // when & then
        assertThrows(DraftingNotFoundException.class, () -> {
            draftingService.deleteDraft(draftingId);
        });
        
        verify(draftingRepository, never()).save(any(Drafting.class));
    }
    
    @Test
    @DisplayName("getDraftsByMemberId_회원ID로_드래프트_목록_조회_성공")
    void getDraftsByMemberId_성공() {
        // given
        List<Drafting> draftings = new ArrayList<>();
        draftings.add(testDrafting);
        when(draftingRepository.findAllByMemberIdAndNotDeleted(any(UUID.class))).thenReturn(draftings);
        
        // when
        List<DraftingDto> result = draftingService.getDraftsByMemberId(memberId);
        
        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testDrafting.getContractTitle(), result.get(0).getContractTitle());
    }
    
    @Test
    @DisplayName("getDraftsByMemberEmail_회원이메일로_드래프트_목록_조회_성공")
    void getDraftsByMemberEmail_성공() {
        // given
        List<Drafting> draftings = new ArrayList<>();
        draftings.add(testDrafting);
        when(draftingRepository.findAllByMemberEmailAndNotDeleted(anyString())).thenReturn(draftings);
        
        // when
        List<DraftingDto> result = draftingService.getDraftsByMemberEmail("test@typelegal.com");
        
        // then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testDrafting.getContractTitle(), result.get(0).getContractTitle());
    }
    
    @Test
    @DisplayName("getDraftById_ID로_드래프트_조회_성공")
    void getDraftById_성공() {
        // given
        when(draftingRepository.findByIdAndNotDeleted(any(UUID.class))).thenReturn(Optional.of(testDrafting));
        
        // when
        DraftingDto result = draftingService.getDraftById(draftingId);
        
        // then
        assertNotNull(result);
        assertEquals(testDrafting.getId(), result.getId());
        assertEquals(testDrafting.getContractTitle(), result.getContractTitle());
    }
    
    @Test
    @DisplayName("getDraftById_존재하지_않는_ID로_조회시_예외를_던진다")
    void getDraftById_드래프트_미존재_예외발생() {
        // given
        when(draftingRepository.findByIdAndNotDeleted(any(UUID.class))).thenReturn(Optional.empty());
        
        // when & then
        assertThrows(DraftingNotFoundException.class, () -> {
            draftingService.getDraftById(draftingId);
        });
    }
    
    @Test
    @DisplayName("existsById_드래프트_존재_여부_확인_성공")
    void existsById_성공() {
        // given
        when(draftingRepository.existsByIdAndIsDeletedFalse(any(UUID.class))).thenReturn(true);
        
        // when
        boolean result = draftingService.existsById(draftingId);
        
        // then
        assertTrue(result);
    }
} 