/**
 * 드래프트 관련 서비스
 * 계약서 드래프트 생성, 조회, 수정, 삭제 등의 기능 제공
 */

import apiClient from '../libs/apiClient';

// 개발 환경인지 확인
const isDev = process.env.NODE_ENV !== 'production';

// 로깅 유틸리티
const log = {
	debug: (...args) => isDev && console.log(...args),
	info: (...args) => console.info(...args),
	error: (...args) => console.error(...args),
	warn: (...args) => console.warn(...args),
};

/**
 * 드래프트 서비스
 * @type {Object}
 */
const draftService = {
	/**
	 * 사용자의 모든 드래프트 목록을 가져옵니다.
	 * @returns {Promise<Array>} 드래프트 목록
	 */
	getMemberDrafts: async () => {
		log.debug(`[draftService.getMemberDrafts] 사용자 드래프트 목록 요청`);
		try {
			// 백엔드 API에 드래프트 목록 요청
			const response = await apiClient.get(`/api/drafting/user`);
			log.debug(`[draftService.getMemberDrafts] 응답 수신됨`);

			// 응답 구조 확인
			let data = response;
			if (response.data && Array.isArray(response.data)) {
				data = response.data;
			}

			// 데이터가 배열인지 확인
			if (!Array.isArray(data)) {
				log.warn(`[draftService.getMemberDrafts] 응답이 배열이 아님:`, data);
				return [];
			}

			log.debug(`[draftService.getMemberDrafts] 응답 데이터:`, data.length, '개 항목');

			// 데이터 형식을 프론트엔드 표준에 맞게 변환
			return data.map(item => ({
				id: item.id,
				contract_title: item.contractTitle || item.contract_title || '',
				type: item.type || 'default',
				creator: item.memberName || item.creator || '사용자',
				updated_at: item.updatedAt || item.updated_at || new Date().toISOString(),
				status: item.status || 'stage1',
				query: item.query || '',
				is_deleted: item.isDeleted || item.is_deleted || false,
				progress: item.progress || 0,
			}));
		} catch (error) {
			log.error('[draftService.getMemberDrafts] 오류:', error);

			// 인증 관련 오류는 apiClient에서 이미 리디렉션 처리
			if (error.status === 401) {
				throw error;
			}

			// 그 외의 오류는 빈 배열 반환
			return [];
		}
	},

	/**
	 * SSR에서 사용자의 드래프트 목록을 가져옵니다.
	 * 클라이언트 저장소 접근 없이 서버 측 쿠키로 인증합니다.
	 * @param {Object} param
	 * @param {string} param.cookie - 요청 헤더에서 가져온 쿠키 문자열
	 * @returns {Promise<Array>} 드래프트 목록
	 */
	getMemberDraftsSSR: async ({ cookie }) => {
		log.debug(`[draftService.getMemberDraftsSSR] SSR 드래프트 목록 요청, 쿠키 존재: ${!!cookie}`);
		try {
			const response = await apiClient.get(`/api/drafting/user`, { cookie });
			log.debug(`[draftService.getMemberDraftsSSR] 응답 성공`);

			// 응답 데이터 추출
			const data = response.data || response;

			// 배열 타입 검증
			if (!Array.isArray(data)) {
				log.warn(`[draftService.getMemberDraftsSSR] 응답이 배열이 아님:`, data);
				return [];
			}

			log.debug(`[draftService.getMemberDraftsSSR] 응답 데이터:`, data.length, '개 항목');

			// 프론트에서 사용하는 형식으로 가공
			return data.map(item => ({
				id: item.id,
				contract_title: item.contractTitle || item.contract_title || '',
				type: item.type || 'default',
				creator: item.memberName || item.creator || '사용자',
				updated_at: item.updatedAt || item.updated_at || new Date().toISOString(),
				status: item.status || 'stage1',
				query: item.query || '',
				is_deleted: item.isDeleted || item.is_deleted || false,
				progress: item.progress || 0,
			}));
		} catch (error) {
			log.error('[draftService.getMemberDraftsSSR] SSR 오류:', error);
			// 인증 오류 시 명확한 처리
			if (error.status === 401) {
				log.warn('[draftService.getMemberDraftsSSR] 인증 오류로 인한 요청 실패');
			}
			throw error;
		}
	},

	/**
	 * 드래프트를 저장합니다.
	 * @param {Object} draftData - 저장할 드래프트 데이터
	 * @returns {Promise<Object>} 저장된 드래프트 정보
	 */
	saveDraft: async draftData => {
		log.debug(`[draftService.saveDraft] 드래프트 저장 요청:`, draftData.id);

		try {
			// 데이터 형식 확인 및 변환 (백엔드 DTO 형식에 맞춤)
			const draftingDto = {
				id: draftData.id,
				contractTitle: draftData.contract_title,
				contractData: draftData.contract_data,
				status: draftData.status || 'stage1',
				query: draftData.query,
				contractInfo: draftData.contract_info,
				type: draftData.type,
				progress: draftData.progress,
				isDeleted: false,
			};

			log.debug(`[draftService.saveDraft] 요청 데이터 준비 완료:`, draftingDto.id);

			// 항상 POST 요청으로 저장 (404 에러 방지)
			// exists 체크를 별도로 하지 않고 직접 저장 API만 호출
			log.debug(`[draftService.saveDraft] 드래프트 저장 시작: id=${draftingDto.id}`);
			const response = await apiClient.post(`/api/drafting`, draftingDto, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
			log.debug(`[draftService.saveDraft] 저장 성공: id=${draftingDto.id}`);
			return response;
		} catch (error) {
			log.error('[draftService.saveDraft] 오류:', error);
			throw error;
		}
	},

	/**
	 * 드래프트를 삭제합니다 (논리적 삭제).
	 * @param {string} id - 드래프트 ID
	 * @returns {Promise<Object>} 삭제 결과
	 */
	deleteDraft: async id => {
		log.debug(`[draftService.deleteDraft] 드래프트 삭제 요청: id=${id}`);
		try {
			// 드래프트 논리적 삭제 API 호출
			const response = await apiClient.put(
				'/api/drafting/delete',
				{
					id,
					isDeleted: true,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			log.debug(`[draftService.deleteDraft] 삭제 성공: id=${id}`);
			return response;
		} catch (error) {
			log.error('[draftService.deleteDraft] 오류:', error);
			throw error;
		}
	},

	/**
	 * 특정 드래프트를 조회합니다.
	 * @param {string} id - 드래프트 ID
	 * @returns {Promise<Object>} 드래프트 데이터
	 */
	getDraft: async id => {
		log.debug(`[draftService.getDraft] 드래프트 조회 요청: id=${id}`);
		try {
			const data = await apiClient.get(`/api/drafting/${id}`);
			log.debug(`[draftService.getDraft] 조회 성공: id=${id}`);

			// 데이터 구조 매핑: 백엔드 → 프론트엔드
			let contractData = {};
			try {
				contractData = typeof data.contractData === 'string' ? JSON.parse(data.contractData) : data.contractData;
			} catch (e) {
				log.error('계약 데이터 파싱 오류:', e);
			}

			return {
				id: data.id,
				contractTitle: data.contractTitle || '',
				type: data.type || 'default',
				contractData: contractData || {},
				contractingParty: data.party || 'temp',
				creator: data.memberName || '사용자',
				query: data.query || '',
				status: data.status || 'stage1',
				templateInfo: data.contractInfo || {},
				updated_at: data.updatedAt || new Date().toISOString(),
				progress: data.progress || 0,
			};
		} catch (error) {
			log.error('[draftService.getDraft] 오류:', error);
			throw error;
		}
	},

	/**
	 * 드래프트가 존재하는지 확인합니다.
	 * @param {string} id - 드래프트 ID
	 * @returns {Promise<boolean>} 존재 여부
	 */
	draftExists: async id => {
		log.debug(`[draftService.draftExists] 드래프트 존재 여부 확인: id=${id}`);
		try {
			await apiClient.get(`/api/drafting/${id}`);
			log.debug(`[draftService.draftExists] 드래프트 존재함: id=${id}`);
			return true;
		} catch (error) {
			// 404 에러는 존재하지 않음으로 처리
			if (error.status === 404) {
				log.debug(`[draftService.draftExists] 드래프트 존재하지 않음: id=${id}`);
				return false;
			}

			// 401 등의 인증 오류는 그대로 전파
			if (error.status === 401 || error.status === 403) {
				throw error;
			}

			// 그 외 오류도 존재하지 않음으로 처리 (더 안전한 접근)
			log.warn(`[draftService.draftExists] 드래프트 존재 여부 확인 중 오류 (존재하지 않는 것으로 처리): id=${id}, 오류:`, error);
			return false;
		}
	},
};

export default draftService;
