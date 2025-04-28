/**
 * 드래프팅 데이터 관련 API
 */

import { get, post, put } from './httpClient';

const draftingApi = {
	/**
	 * 사용자의 모든 드래프트 목록을 가져옵니다.
	 * @returns {Promise<Array>} 드래프트 목록
	 */
	getMemberDrafts: async () => {
		console.log(`[draftingApi.getMemberDrafts] 사용자 드래프트 목록 요청`);
		try {
			// 서버가 쿠키에서 사용자 정보를 가져오므로 이메일을 전송할 필요 없음
			const data = await get(`/api/drafting/user`);
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
			// 데이터 형식 확인 및 변환 (member_id는 서버에서 인증 쿠키로 확인)
			const draftingDto = {
				id: draftData.id,
				contractTitle: draftData.contract_title,
				contractData: draftData.contract_data,
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

			// 해당 ID의 문서가 DB에 존재하는지 확인
			let documentExists = false;
			try {
				// 문서 존재 여부 확인 (404 에러가 발생하지 않으면 문서가 존재함)
				console.log(`[draftingApi.saveDraft] 문서 존재 여부 확인: id=${draftingDto.id}`);
				await get(`/api/drafting/exists/${draftingDto.id}`);
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
				response = await put(`/api/drafting/${draftingDto.id}`, draftingDto);
			} else {
				// 새 문서 생성 (POST 요청)
				console.log(`[draftingApi.saveDraft] 신규 문서 생성: id=${draftingDto.id}`);
				response = await post(`/api/drafting`, draftingDto);
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
			const response = await put('/api/drafting/delete', {
				id,
				isDeleted: true,
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
			const data = await get(`/api/drafting/${id}`);
			console.log(`[draftingApi.getDraft] 응답 데이터:`, data);

			// 데이터 구조 매핑: 백엔드 → 프론트엔드
			let contractData;
			try {
				contractData = typeof data.contractData === 'string' ? JSON.parse(data.contractData) : data.contractData;
			} catch (e) {
				console.error('계약 데이터 파싱 오류:', e);
				contractData = {};
			}

			return {
				id: data.id,
				contractTitle: data.contractTitle,
				type: data.type,
				contractData: contractData,
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

	/**
	 * 드래프트가 존재하는지 확인합니다.
	 * @param {string} id - 드래프트 ID
	 * @returns {Promise<boolean>} 존재 여부
	 */
	draftExists: async id => {
		console.log(`[draftingApi.draftExists] 드래프트 존재 여부 확인: id=${id}`);
		try {
			await get(`/api/drafting/exists/${id}`);
			console.log(`[draftingApi.draftExists] 드래프트 존재함: id=${id}`);
			return true;
		} catch (error) {
			if (error.status === 404) {
				console.log(`[draftingApi.draftExists] 드래프트 존재하지 않음: id=${id}`);
				return false;
			}
			console.error('[draftingApi.draftExists] 오류:', error);
			throw error;
		}
	},
};

export default draftingApi;
