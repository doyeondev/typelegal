package com.typelegal.domain.drafting.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.typelegal.domain.drafting.dao.DraftingRepository;
import com.typelegal.domain.drafting.domain.Drafting;
import com.typelegal.domain.drafting.dto.DraftingDto;
import com.typelegal.domain.drafting.exception.DraftingNotFoundException;
import com.typelegal.domain.member.dao.MemberRepository;
import com.typelegal.domain.member.domain.Member;
import com.typelegal.domain.member.application.MemberService;
import com.typelegal.domain.member.exception.MemberNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 계약서 드래프트 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DraftingService {

    private final DraftingRepository draftingRepository;
    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final ObjectMapper objectMapper;

    /**
     * 드래프트를 저장합니다.
     *
     * @param draftingDto 저장할 드래프트 정보
     * @return 저장된 드래프트 정보
     */
    @Transactional
    public DraftingDto saveDraft(DraftingDto draftingDto) {
        log.info("드래프트 저장 시작: title={}", draftingDto.getContractTitle());

        // 회원 조회 (있는 경우에만)
        Member member = null;
        if (draftingDto.getMemberId() != null) {
            try {
                member = memberRepository.findById(draftingDto.getMemberId())
                        .orElse(null);
                
                if (member == null) {
                    log.warn("존재하지 않는 회원 ID: {}", draftingDto.getMemberId());
                    // 예외를 던지지 않고 계속 진행
                }
            } catch (Exception e) {
                log.error("회원 조회 중 오류 발생: {}", e.getMessage());
                // 예외를 던지지 않고 계속 진행
            }
        } else {
            log.warn("회원 ID가 제공되지 않았습니다.");
            // 예외를 던지지 않고 계속 진행
        }

        // 새 Drafting 엔티티 생성
        Drafting drafting = new Drafting();
        
        // ID가 있으면 설정 (기존 데이터 업데이트)
        if (draftingDto.getId() != null) {
            drafting.setId(draftingDto.getId());
        }
        
        // 기본 정보 설정
        drafting.setContractTitle(draftingDto.getContractTitle());
        
        // contractData 타입 변환 처리 (DTO: Map -> Entity: List<Map>)
        if (draftingDto.getContractData() != null) {
            drafting.setContractData(draftingDto.getContractData());
        }
        
        drafting.setStatus(draftingDto.getStatus());
        drafting.setQuery(draftingDto.getQuery());
        
        // contractInfo는 이미 동일한 Map<String, Object> 형식이므로 바로 설정
        drafting.setContractInfo(draftingDto.getContractInfo());
        
        drafting.setType(draftingDto.getType());

        drafting.setProgress(draftingDto.getProgress());
        
        // isDeleted 항상 false로 명시적 설정 (기존 데이터 업데이트 시에도 적용)
        drafting.setIsDeleted(false);
        
        // 회원 정보 설정 (있는 경우에만)
        if (member != null) {
            drafting.setMember(member);
        }

        // 저장
        Drafting savedDrafting = draftingRepository.save(drafting);
        log.info("드래프트 저장 완료: id={}", savedDrafting.getId());

        // DTO로 변환하여 반환
        return convertToDto(savedDrafting);
    }

    /**
     * 드래프트를 수정합니다.
     *
     * @param id 수정할 드래프트 ID
     * @param draftingDto 수정할 드래프트 정보
     * @return 수정된 드래프트 정보
     */
    @Transactional
    public DraftingDto updateDraft(UUID id, DraftingDto draftingDto) {
        log.info("계약서 드래프트 수정 시작: id={}", id);
        
        Drafting drafting = draftingRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new DraftingNotFoundException("드래프트를 찾을 수 없습니다: " + id));

        drafting.setContractTitle(draftingDto.getContractTitle());
        
        // contractData 타입 변환 처리 (DTO: Map -> Entity: List<Map>)
        if (draftingDto.getContractData() != null) {
            drafting.setContractData(draftingDto.getContractData());
        }
        
        drafting.setStatus(draftingDto.getStatus());
        
        // contractInfo는 이미 동일한 Map<String, Object> 형식이므로 바로 설정
        drafting.setContractInfo(draftingDto.getContractInfo());
        
        drafting.setType(draftingDto.getType());

        drafting.setProgress(draftingDto.getProgress());
        
        // isDeleted 항상 false로 명시적 설정 (기존 데이터가 삭제된 것으로 표시되는 것 방지)
        drafting.setIsDeleted(false);

        Drafting updatedDrafting = draftingRepository.save(drafting);
        log.info("계약서 드래프트 수정 완료: id={}", updatedDrafting.getId());
        
        return convertToDto(updatedDrafting);
    }

    /**
     * 드래프트를 논리적으로 삭제합니다.
     *
     * @param id 삭제할 드래프트 ID
     */
    @Transactional
    public void deleteDraft(UUID id) {
        log.info("계약서 드래프트 삭제 시작: id={}", id);
        
        Drafting drafting = draftingRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new DraftingNotFoundException("드래프트를 찾을 수 없습니다: " + id));

        drafting.setIsDeleted(true);
        draftingRepository.save(drafting);
        
        log.info("계약서 드래프트 삭제 완료: id={}", id);
    }

    /**
     * 회원 ID로 해당 회원의 모든 드래프트를 조회합니다.
     *
     * @param memberId 회원 ID
     * @return 드래프트 목록
     */
    @Transactional(readOnly = true)
    public List<DraftingDto> getDraftsByMemberId(UUID memberId) {
        log.info("회원 ID로 드래프트 목록 조회: memberId={}", memberId);
        
        List<Drafting> draftings = draftingRepository.findAllByMemberIdAndNotDeleted(memberId);
        return draftings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 회원 이메일로 해당 회원의 모든 드래프트를 조회합니다.
     *
     * @param email 회원 이메일
     * @return 드래프트 목록
     */
    @Transactional(readOnly = true)
    public List<DraftingDto> getDraftsByMemberEmail(String email) {
        log.info("회원 이메일로 드래프트 목록 조회: email={}", email);
        
        // MemberService에서 가져온 ID 사용
        UUID memberId = memberService.getMemberIdByEmail(email);
        List<Drafting> draftings = draftingRepository.findAllByMemberIdAndNotDeleted(memberId);
        
        return draftings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * ID로 드래프트를 조회합니다.
     *
     * @param id 드래프트 ID
     * @return 드래프트 정보
     */
    @Transactional(readOnly = true)
    public DraftingDto getDraftById(UUID id) {
        log.info("ID로 드래프트 조회: id={}", id);
        
        Drafting drafting = draftingRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new DraftingNotFoundException("드래프트를 찾을 수 없습니다: " + id));
        
        return convertToDto(drafting);
    }

    /**
     * ID로 드래프트 존재 여부를 확인합니다.
     *
     * @param id 드래프트 ID
     * @return 존재 여부
     */
    @Transactional(readOnly = true)
    public boolean existsById(UUID id) {
        log.info("ID로 드래프트 존재 여부 확인: id={}", id);
        return draftingRepository.existsByIdAndIsDeletedFalse(id);
    }

    /**
     * 엔티티를 DTO로 변환합니다.
     *
     * @param drafting 엔티티
     * @return DTO
     */
    private DraftingDto convertToDto(Drafting drafting) {
        DraftingDto dto = DraftingDto.builder()
                .id(drafting.getId())
                .contractTitle(drafting.getContractTitle())
                .isDeleted(drafting.getIsDeleted())
                .createdAt(drafting.getCreatedAt())
                .updatedAt(drafting.getUpdatedAt())
                .status(drafting.getStatus())
                .query(drafting.getQuery())
                .type(drafting.getType())
                .progress(drafting.getProgress())
                .build();
                
        // contractData 타입 변환 처리 (Entity: List<Map> -> DTO: Map)
        if (drafting.getContractData() != null && !drafting.getContractData().isEmpty()) {
            try {
                // List<Map>를 그대로 설정
                dto.setContractData(drafting.getContractData());
                log.debug("contractData 변환 성공: {}", drafting.getId());
            } catch (Exception e) {
                log.error("contractData 변환 중 오류 발생: {}", e.getMessage());
            }
        } else {
            log.debug("contractData가 null이거나 비어 있음: id={}", drafting.getId());
        }
        
        // contractInfo 설정
        dto.setContractInfo(drafting.getContractInfo());
        
        // 회원 정보 설정
        if (drafting.getMember() != null) {
            dto.setMemberId(drafting.getMember().getId());
            dto.setMemberName(drafting.getMember().getName());
            log.debug("회원 정보 설정 완료: memberId={}", drafting.getMember().getId());
        } else {
            log.warn("회원 정보가 null입니다: draftingId={}", drafting.getId());
        }
        
        return dto;
    }
} 