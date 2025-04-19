/**
 * 드래프팅 데이터 관련 API
 */

import { get, post, put } from './httpClient';
import { getMemberIdFromStorage } from './httpClient';

const draftingApi = {
	/**
	 * 사용자의 모든 드래프트 목록을 가져옵니다.
	 * @param {string} email - 사용자 이메일
	 * @returns {Promise<Array>} 드래프트 목록
	 */
	getMemberDrafts: async email => {
		console.log(`[draftingApi.getMemberDrafts] 사용자 드래프트 목록 요청: email=${email}`);
		try {
			const data = await get(`/api/data/drafting-data?email=${email}`);
			console.log(`[draftingApi.getMemberDrafts] 응답 데이터:`, data);

			// 데이터 그대로 반환 (Supabase 필드명 사용)
			return data.map(item => ({
				id: item.id,
				contract_title: item.contractTitle,
				type: item.type,
				creator: item.memberName,
				updated_at: item.updatedAt,
				status: item.status || 'stage1',
				query: item.query,
				is_deleted: item.isDeleted,
				progress: item.progress,
			}));
		} catch (error) {
			console.error('[draftingApi.getMemberDrafts] 오류:', error);
			throw error;
		}
	},

	/**
	 * 드래프트를 저장합니다.
	 * @param {Object} draftData - 저장할 드래프트 데이터
	 * @returns {Promise<Object>} 저장된 드래프트 정보
	 */
	saveDraft: async draftData => {
		console.log(`[draftingApi.saveDraft] 드래프트 저장 요청:`, draftData);

		try {
			// member_id 검증
			if (!draftData.member_id) {
				console.error('[draftingApi.saveDraft] member_id가 없습니다. 로그인 상태를 확인하세요.');

				// 세션에서 다시 가져오기 시도
				const memberId = getMemberIdFromStorage();
				if (memberId) {
					console.log('[draftingApi.saveDraft] 세션에서 member_id를 복구했습니다:', memberId);
					draftData.member_id = memberId;
				} else {
					throw new Error('사용자 ID를 찾을 수 없습니다. 다시 로그인해 주세요.');
				}
			}

			console.log('draftingAPI member_id 있음');
			// 데이터 형식 확인 및 변환
			const draftingDto = {
				id: draftData.id,
				contractTitle: draftData.contract_title,
				contractData: draftData.contract_data,
				member_id: draftData.member_id,
				status: draftData.status || 'stage1',
				query: draftData.query,
				contractInfo: draftData.contract_info,
				type: draftData.type,
				progress: draftData.progress,
			};

			console.log(`[draftingApi.saveDraft] 최종 요청 데이터:`, {
				...draftingDto,
				contractData: '(생략)',
				contractInfo: '(생략)',
			});

			// 멤버 ID를 URL 쿼리 파라미터로 포함하여 요청 (URL과 바디 모두에 포함)
			const options = {
				headers: {
					'X-Member-ID': draftingDto.member_id, // 헤더에도 멤버 ID 포함
				},
			};

			// 해당 ID의 문서가 DB에 존재하는지 확인
			let documentExists = false;
			try {
				// 문서 존재 여부 확인 (404 에러가 발생하지 않으면 문서가 존재함)
				console.log(`[draftingApi.saveDraft] 문서 존재 여부 확인: id=${draftingDto.id}`);
				await get(`/api/data/drafting-data/${draftingDto.id}/exists`);
				documentExists = true;
				console.log(`[draftingApi.saveDraft] 문서가 DB에 존재함: id=${draftingDto.id}`);
			} catch (error) {
				// 문서가 존재하지 않는 경우 (404 오류) 또는 검사 중 다른 오류 발생
				if (error.status === 404) {
					documentExists = false;
					console.log(`[draftingApi.saveDraft] 문서가 DB에 존재하지 않음: id=${draftingDto.id}`);
				} else {
					// 다른 오류 발생 - 일단 계속 진행 (POST로 처리)
					console.warn(`[draftingApi.saveDraft] 문서 존재 여부 확인 중 오류:`, error);
					documentExists = false;
				}
			}

			// 문서 존재 여부에 따라 POST 또는 PUT 요청 수행
			let response;
			if (documentExists) {
				// 기존 문서 업데이트 (PUT 요청)
				console.log(`[draftingApi.saveDraft] DB에 존재하는 문서 업데이트: id=${draftingDto.id}`);
				const updateEndpoint = `/api/data/drafting-data/${draftingDto.id}?member_id=${encodeURIComponent(draftingDto.member_id)}`;
				response = await put(updateEndpoint, draftingDto, options);
			} else {
				// 새 문서 생성 (POST 요청)
				console.log(`[draftingApi.saveDraft] 신규 문서 생성: id=${draftingDto.id}`);
				const endpoint = `/api/data/drafting-data?member_id=${encodeURIComponent(draftingDto.member_id)}`;
				response = await post(endpoint, draftingDto, options);
			}

			console.log(`[draftingApi.saveDraft] 응답 데이터:`, response);
			return response;
		} catch (error) {
			console.error('[draftingApi.saveDraft] 오류:', error);
			throw error;
		}
	},

	/**
	 * 드래프트를 삭제합니다 (논리적 삭제).
	 * @param {string} id - 드래프트 ID
	 * @returns {Promise<Object>} 삭제 결과
	 */
	deleteDraft: async id => {
		console.log(`[draftingApi.deleteDraft] 드래프트 삭제 요청: id=${id}`);
		try {
			const response = await put('/api/data/drafting-data/delete', {
				id,
				is_deleted: true,
			});

			console.log(`[draftingApi.deleteDraft] 응답 데이터:`, response);
			return response;
		} catch (error) {
			console.error('[draftingApi.deleteDraft] 오류:', error);
			throw error;
		}
	},

	/**
	 * 특정 드래프트를 조회합니다.
	 * @param {string} id - 드래프트 ID
	 * @returns {Promise<Object>} 드래프트 데이터
	 */
	getDraft: async id => {
		console.log(`[draftingApi.getDraft] 드래프트 조회 요청: id=${id}`);
		try {
			const data = await get(`/api/data/drafting-data/${id}`);
			console.log(`[draftingApi.getDraft] 응답 데이터:`, data);

			// 데이터 구조 매핑: 백엔드 → 프론트엔드
			let contractData;
			try {
				contractData = typeof data.contract_data === 'string' ? JSON.parse(data.contract_data) : data.contract_data;
			} catch (e) {
				console.error('계약 데이터 파싱 오류:', e);
				contractData = {};
			}

			return {
				id: data.id,
				contractTitle: data.contractTitle,
				type: data.type,
				contractData: data.contractData,
				contractingParty: data.party || 'temp',
				creator: data.memberName,
				query: data.query,
				status: data.status,
				templateInfo: data.contractInfo,
				updated_at: data.updatedAt,
				progress: data.progress,
			};
		} catch (error) {
			console.error('[draftingApi.getDraft] 오류:', error);
			throw error;
		}
	},
};

export default draftingApi;
