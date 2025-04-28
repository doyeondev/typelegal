/**
 * 회원 관련 API
 * HTTP-Only 쿠키 기반 인증 방식으로 보안 강화
 */

import { get, post } from './httpClient';

// 개발 환경인지 확인
const isDev = process.env.NODE_ENV !== 'production';

// 로깅 유틸리티
const log = {
	debug: (...args) => isDev && console.log(...args),
	info: (...args) => console.info(...args),
	error: (...args) => console.error(...args),
	warn: (...args) => console.warn(...args),
};

const memberApi = {
	/**
	 * 로그인 처리를 합니다.
	 * 쿠키 기반 인증을 사용합니다 (HTTP-Only 쿠키).
	 * @param {Object} credentials - 로그인 정보 { email, password }
	 * @returns {Promise<Object>} 인증 정보 및 사용자 데이터
	 */
	login: async credentials => {
		log.debug(`[memberApi.login] 로그인 요청: email=${credentials.email}`);
		try {
			const response = await post('/api/auth/login', credentials);
			log.debug(`[memberApi.login] 로그인 성공`);
			return response;
		} catch (error) {
			log.error('[memberApi.login] 로그인 실패:', error);
			throw error;
		}
	},

	/**
	 * 회원가입 처리를 합니다.
	 * @param {Object} userData - 회원가입 정보 { name, email, password }
	 * @returns {Promise<Object>} 회원가입 결과
	 */
	register: async userData => {
		log.debug(`[memberApi.register] 회원가입 요청: email=${userData.email}`);
		try {
			const response = await post('/api/auth/register', userData);
			log.debug(`[memberApi.register] 회원가입 성공`);
			return response;
		} catch (error) {
			log.error('[memberApi.register] 회원가입 실패:', error);
			throw error;
		}
	},

	/**
	 * 이메일 중복 확인을 합니다.
	 * @param {string} email - 확인할 이메일
	 * @returns {Promise<Object>} 이메일 중복 확인 결과
	 */
	checkEmailDuplicate: async email => {
		log.debug(`[memberApi.checkEmailDuplicate] 이메일 중복 확인 요청: email=${email}`);
		try {
			const response = await get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
			log.debug(`[memberApi.checkEmailDuplicate] 이메일 중복 확인 성공`);
			return response;
		} catch (error) {
			log.error('[memberApi.checkEmailDuplicate] 이메일 중복 확인 실패:', error);
			throw error;
		}
	},

	/**
	 * 현재 로그인한 사용자 정보를 조회합니다.
	 * JWT 토큰을 통해 서버에서 사용자를 식별합니다 (쿠키에 저장된 토큰 사용).
	 * @returns {Promise<Object>} 사용자 정보
	 */
	getCurrentUser: async () => {
		log.debug(`[memberApi.getCurrentUser] 사용자 정보 요청 (토큰 기반)`);
		try {
			const response = await get(`/api/auth/me`);
			log.debug(`[memberApi.getCurrentUser] 사용자 정보 조회 성공`);
			return response;
		} catch (error) {
			log.error('[memberApi.getCurrentUser] 사용자 정보 조회 실패:', error);
			throw error;
		}
	},

	/**
	 * 로그아웃 처리를 합니다.
	 * 클라이언트 측 인증 상태를 초기화합니다.
	 * @returns {Promise<boolean>} 로그아웃 성공 여부
	 */
	logout: async () => {
		log.debug(`[memberApi.logout] 로그아웃 요청`);
		try {
			// 서버 측 로그아웃 (쿠키 만료 처리 등)
			// const response = await post(`/api/auth/logout`);

			// 클라이언트 측 인증 상태 초기화
			localStorage.removeItem('is_logged_in');
			sessionStorage.removeItem('member_key');

			log.debug(`[memberApi.logout] 로그아웃 성공`);
			return true;
		} catch (error) {
			log.error('[memberApi.logout] 로그아웃 실패:', error);

			// 클라이언트 측 상태는 어쨌든 정리
			localStorage.removeItem('is_logged_in');
			sessionStorage.removeItem('member_key');

			return false;
		}
	},
};

export default memberApi;
