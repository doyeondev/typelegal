/**
 * 템플릿 관련 서비스
 * 계약서 템플릿 조회, 처리 등의 기능을 제공합니다.
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
 * 템플릿 서비스
 * @type {Object}
 */
const templateService = {
	/**
	 * 템플릿 정보를 가져옵니다.
	 * @param {string} type - 템플릿 타입 (계약서 종류)
	 * @returns {Promise<Object>} 템플릿 정보
	 */
	getTemplateInfo: async type => {
		log.debug(`[templateService.getTemplateInfo] 템플릿 정보 요청: type=${type}`);
		try {
			const response = await fetch(`https://conan.ai/_functions/getTemplateInfo/${type}`);
			if (!response.ok) {
				throw new Error(`템플릿 정보 가져오기 실패: ${response.status}`);
			}
			const data = await response.json();
			log.debug(`[templateService.getTemplateInfo] 템플릿 정보 조회 성공`);
			return data.items;
		} catch (error) {
			log.error('[templateService.getTemplateInfo] 오류:', error);
			throw error;
		}
	},

	/**
	 * 템플릿을 처리하여 필요한 데이터 구조를 생성합니다.
	 * @param {string} query1 - 쿼리 파라미터 1
	 * @param {string} query2 - 쿼리 파라미터 2 (템플릿 타입)
	 * @returns {Promise<Object>} 처리된 템플릿 데이터
	 */
	processTemplate: async (query1, query2) => {
		log.debug(`[templateService.processTemplate] 템플릿 처리 요청: query1=${query1}, query2=${query2}`);
		try {
			const response = await apiClient.post('/api/template/process', {
				query1,
				query2,
				type: query2,
			});
			log.debug(`[templateService.processTemplate] 템플릿 처리 성공`);
			return response;
		} catch (error) {
			log.error('[templateService.processTemplate] 오류:', error);
			throw error;
		}
	},

	/**
	 * 클라이언트에서 템플릿 데이터를 처리합니다.
	 * 서버 측 처리가 불가능할 때 폴백으로 사용합니다.
	 * @param {string} query1 - 쿼리 파라미터 1
	 * @param {string} query2 - 쿼리 파라미터 2 (템플릿 타입)
	 * @returns {Promise<Object>} 처리된 템플릿 데이터
	 */
	processTemplateClient: async (query1, query2) => {
		log.debug(`[templateService.processTemplateClient] 클라이언트 템플릿 처리 요청: query1=${query1}, query2=${query2}`);
		try {
			// 백엔드 API 대신 서버 API 경로로 요청
			const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/api/template/process?query1=${encodeURIComponent(query1)}&query2=${encodeURIComponent(query2)}`;

			// 인증 헤더 추가
			const headers = {};
			if (typeof window !== 'undefined') {
				// 쿠키 기반 인증이므로 credentials를 include로 설정
				headers.credentials = 'include';
			}

			const response = await fetch(apiUrl, {
				headers,
				credentials: 'include', // 쿠키 전송을 위해 필요
			});

			if (!response.ok) {
				throw new Error(`데이터 요청 실패: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			log.debug(`[templateService.processTemplateClient] 클라이언트 템플릿 처리 성공`);
			return data;
		} catch (error) {
			log.error('[templateService.processTemplateClient] 오류:', error);
			throw error;
		}
	},
};

export default templateService;
