package com.typelegal.domain.drafting.api;

import com.typelegal.domain.drafting.application.DraftingService;
import com.typelegal.domain.drafting.dto.DraftingDto;
import com.typelegal.domain.member.application.MemberService;
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
@RequestMapping("/api/drafting")
@RequiredArgsConstructor
public class DraftingController {

    private final DraftingService draftingService;
    private final MemberService memberService;
    private final JwtConfig jwtConfig; // JWT 설정 주입

    /**
     * 로그인한 회원의 모든 드래프트 목록을 조회합니다.
     * 회원 이메일은 세션에서 직접 추출합니다.
     * @return 드래프트 목록
     */
    @GetMapping("/user")
    public ResponseEntity<List<DraftingDto>> getMemberDrafts() {
        log.info("회원의 드래프트 목록 조회 요청");

        // 현재 인증된 사용자 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("인증되지 않은 요청");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername(); // 세션에서 email 추출

        log.info("현재 로그인한 사용자 email={}", email);

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
    @GetMapping("/{id}")
    public ResponseEntity<DraftingDto> getDraft(@PathVariable UUID id) {
        log.info("드래프트 조회 요청: id={}", id);
        DraftingDto draft = draftingService.getDraftById(id);
        log.info("드래프트 조회 완료: id={}", id);
        return ResponseEntity.ok(draft);
    }

    /**
     * 드래프트를 저장합니다.
     * 회원 ID는 더 이상 클라이언트로부터 받지 않고, 세션에서 직접 추출합니다.
     * @param draftingDto 저장할 드래프트 정보
     * @return 저장된 드래프트 정보
     */
    @PostMapping("")
    public ResponseEntity<DraftingDto> saveDraft(@RequestBody DraftingDto draftingDto) {
        log.info("드래프트 저장 요청: title={}", draftingDto.getContractTitle());
        
        // 계약 데이터 유효성 확인
        if (draftingDto.getContractData() != null) {
            log.info("계약 데이터 타입: {}", draftingDto.getContractData().getClass().getName());
        } else {
            log.warn("계약 데이터가 null입니다");
        }
        
        // 현재 인증된 사용자 정보 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("인증되지 않은 요청");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // 현재 인증된 사용자의 이메일 추출
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        
        // 이메일로 회원 ID 조회 및 DTO에 설정
        UUID memberId = memberService.getMemberIdByEmail(email);
        if (memberId == null) {
            log.error("이메일에 해당하는 회원을 찾을 수 없습니다: {}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        // 드래프트 DTO에 회원 ID 설정
        draftingDto.setMemberId(memberId);
        log.info("세션에서 추출한 사용자 ID 설정: {}", memberId);
        
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
    @PutMapping("/{id}")
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
    @PutMapping("/delete")
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
    @GetMapping("/exists/{id}")
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