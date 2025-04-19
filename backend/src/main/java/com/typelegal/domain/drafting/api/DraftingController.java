package com.typelegal.domain.drafting.api;

import com.typelegal.domain.drafting.application.DraftingService;
import com.typelegal.domain.drafting.dto.DraftingDto;
import com.typelegal.global.security.JwtConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 계약서 드래프트 관련 REST API를 제공하는 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DraftingController {

    private final DraftingService draftingService;
    private final JwtConfig jwtConfig; // JWT 설정 주입

    /**
     * 회원의 모든 드래프트 목록을 조회합니다.
     *
     * @param email 회원 이메일
     * @return 드래프트 목록
     */
    @GetMapping("/drafting-data")
    public ResponseEntity<List<DraftingDto>> getMemberDrafts(@RequestParam String email) {
        log.info("회원의 드래프트 목록 조회 요청: email={}", email);
        // 현재 인증된 사용자의 이메일 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            if (!userDetails.getUsername().equals(email)) {
                log.warn("권한 없음: 현재 인증된 사용자({}), 요청 이메일({})", userDetails.getUsername(), email);
                throw new AccessDeniedException("다른 사용자의 드래프트를 조회할 권한이 없습니다");
            }
        }

        List<DraftingDto> drafts = draftingService.getDraftsByMemberEmail(email);
        log.info("회원의 드래프트 목록 조회 결과: {} 건", drafts.size());
        return ResponseEntity.ok(drafts);
    }

    /**
     * ID로 특정 드래프트를 조회합니다.
     *
     * @param id 드래프트 ID
     * @return 드래프트 정보
     */
    @GetMapping("/drafting-data/{id}")
    public ResponseEntity<DraftingDto> getDraft(@PathVariable UUID id) {
        log.info("드래프트 조회 요청: id={}", id);
        DraftingDto draft = draftingService.getDraftById(id);
        log.info("드래프트 조회 완료: id={}", id);
        return ResponseEntity.ok(draft);
    }

    /**
     * 드래프트를 저장합니다.
     * @param draftingDto 저장할 드래프트 정보
     * @param member_id 쿼리 파라미터로 받은 회원 ID (선택적)
     * @param headerMemberId 헤더로 받은 회원 ID (선택적)
     * @return 저장된 드래프트 정보
     */
    @PostMapping("/drafting-data")
    public ResponseEntity<DraftingDto> saveDraft(
        @RequestBody DraftingDto draftingDto,
        @RequestParam(required = false) UUID member_id,
        @RequestHeader(value = "X-Member-ID", required = false) String headerMemberId
    ) {
        log.info("드래프트 저장 요청: title={}", draftingDto.getContractTitle());
        
        // 계약 데이터 유효성 확인
        if (draftingDto.getContractData() != null) {
            log.info("계약 데이터 타입: {}", draftingDto.getContractData().getClass().getName());
        } else {
            log.warn("계약 데이터가 null입니다");
        }
        
        // 현재 인증된 사용자 정보 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID authenticatedUserId = null;
        
        // 토큰에서 사용자 ID 추출 (새로운 방식 - UUID)
        if (authentication != null && authentication.isAuthenticated()) {
            String authToken = extractTokenFromAuthentication(authentication);
            if (authToken != null) {
                authenticatedUserId = jwtConfig.extractUserId(authToken);
                log.info("토큰에서 추출한 사용자 ID: {}", authenticatedUserId);
            }
        }
        
        // member_id 확인 (쿼리 파라미터 또는 헤더에서 가져옴)
        UUID requestMemberId = null;
        
        // 1. DTO에 있는 member_id 사용
        if (draftingDto.getMemberId() != null) {
            requestMemberId = draftingDto.getMemberId();
            log.info("DTO에서 member_id 사용: {}", requestMemberId);
        } 
        // 2. 쿼리 파라미터에 있는 member_id 사용
        else if (member_id != null) {
            log.info("쿼리 파라미터에서 member_id 사용: {}", member_id);
            requestMemberId = member_id;
            draftingDto.setMemberId(member_id);
        } 
        // 3. 헤더에 있는 member_id 사용
        else if (headerMemberId != null) {
            try {
                UUID memberId = UUID.fromString(headerMemberId);
                log.info("헤더에서 member_id 사용: {}", memberId);
                requestMemberId = memberId;
                draftingDto.setMemberId(memberId);
            } catch (IllegalArgumentException e) {
                log.error("헤더의 member_id가 유효한 UUID 형식이 아닙니다: {}", headerMemberId);
            }
        }
        
        // 권한 검증: 토큰의 사용자 ID와 요청의 member_id가 일치하는지 확인
        if (authenticatedUserId != null && requestMemberId != null && !authenticatedUserId.equals(requestMemberId)) {
            log.error("권한 불일치: 토큰의 사용자 ID({})와 요청의 member_id({})가 다릅니다", authenticatedUserId, requestMemberId);
            throw new AccessDeniedException("이 작업을 수행할 권한이 없습니다");
        }
        
        // member_id가 설정되지 않은 경우 오류 반환
        if (draftingDto.getMemberId() == null) {
            log.error("member_id가 제공되지 않았습니다");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        DraftingDto savedDraft = draftingService.saveDraft(draftingDto);
        log.info("드래프트 저장 완료: id={}", savedDraft.getId());
        return new ResponseEntity<>(savedDraft, HttpStatus.CREATED);
    }

    /**
     * 인증 객체에서 JWT 토큰 추출
     */
    private String extractTokenFromAuthentication(Authentication authentication) {
        if (authentication.getCredentials() != null) {
            return authentication.getCredentials().toString();
        }
        
        // 토큰을 직접 추출할 수 없는 경우
        // (이미 UserDetailsService에서 사용자 정보를 로드한 후)
        return null;
    }

    /**
     * 드래프트를 수정합니다.
     *
     * @param id 수정할 드래프트 ID
     * @param draftingDto 수정할 드래프트 정보
     * @return 수정된 드래프트 정보
     */
    @PutMapping("/drafting-data/{id}")
    public ResponseEntity<DraftingDto> updateDraft(@PathVariable UUID id, @RequestBody DraftingDto draftingDto) {
        log.info("드래프트 수정 요청: id={}", id);
        DraftingDto updatedDraft = draftingService.updateDraft(id, draftingDto);
        log.info("드래프트 수정 완료: id={}", id);
        return ResponseEntity.ok(updatedDraft);
    }

    /**
     * 드래프트를 논리적으로 삭제합니다.
     *
     * @param requestBody 삭제할 드래프트 정보
     * @return 성공 메시지
     */
    @PutMapping("/drafting-data/delete")
    public ResponseEntity<String> deleteDraft(@RequestBody DeleteRequestBody requestBody) {
        log.info("드래프트 삭제 요청: id={}", requestBody.getId());
        draftingService.deleteDraft(requestBody.getId());
        log.info("드래프트 삭제 완료: id={}", requestBody.getId());
        return ResponseEntity.ok("드래프트가 성공적으로 삭제되었습니다.");
    }

    /**
     * 삭제 요청을 위한 내부 클래스
     */
    static class DeleteRequestBody {
        private UUID id;
        private boolean isDeleted;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public boolean isDeleted() {
            return isDeleted;
        }

        public void setDeleted(boolean deleted) {
            isDeleted = deleted;
        }
    }

    /**
     * 특정 ID의 드래프트가 존재하는지 확인합니다.
     *
     * @param id 드래프트 ID
     * @return 존재 여부 (200: 존재함, 404: 존재하지 않음)
     */
    @GetMapping("/drafting-data/{id}/exists")
    public ResponseEntity<Void> checkDraftExists(@PathVariable UUID id) {
        log.info("드래프트 존재 여부 확인: id={}", id);
        boolean exists = draftingService.existsById(id);
        
        if (exists) {
            log.info("드래프트 존재함: id={}", id);
            return ResponseEntity.ok().build(); // 200: 존재함
        } else {
            log.info("드래프트 존재하지 않음: id={}", id);
            return ResponseEntity.notFound().build(); // 404: 존재하지 않음
        }
    }
} 