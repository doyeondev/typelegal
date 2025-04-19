/**
 * 회원 관련 API
 */

import { get, post } from './httpClient';

const memberApi = {
	/**
	 * 로그인 처리를 합니다.
	 * @param {Object} credentials - 로그인 정보 { email, password }
	 * @returns {Promise<Object>} 인증 정보 및 사용자 데이터
	 */
	login: credentials => {
		console.log(`[memberApi.login] 로그인 요청: email=${credentials.email}`);
		try {
			const response = post('/api/auth/login', credentials);
			console.log(`[memberApi.login] 로그인 성공`);
			return response;
		} catch (error) {
			console.error('[memberApi.login] 로그인 실패:', error);
			throw error;
		}
	},

	/**
	 * 회원가입 처리를 합니다.
	 * @param {Object} userData - 회원가입 정보 { name, email, password }
	 * @returns {Promise<Object>} 회원가입 결과
	 */
	register: userData => {
		console.log(`[memberApi.register] 회원가입 요청: email=${userData.email}`);
		try {
			const response = post('/api/auth/register', userData);
			console.log(`[memberApi.register] 회원가입 성공`);
			return response;
		} catch (error) {
			console.error('[memberApi.register] 회원가입 실패:', error);
			throw error;
		}
	},

	/**
	 * 이메일 중복 확인을 합니다.
	 * @param {string} email - 확인할 이메일
	 * @returns {Promise<Object>} 이메일 중복 확인 결과
	 */
	checkEmailDuplicate: email => {
		console.log(`[memberApi.checkEmailDuplicate] 이메일 중복 확인 요청: email=${email}`);
		try {
			const response = get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
			console.log(`[memberApi.checkEmailDuplicate] 이메일 중복 확인 성공`);
			return response;
		} catch (error) {
			console.error('[memberApi.checkEmailDuplicate] 이메일 중복 확인 실패:', error);
			throw error;
		}
	},

	/**
	 * 현재 로그인한 사용자 정보를 조회합니다.
	 * @param {string} email - 사용자 이메일
	 * @returns {Promise<Object>} 사용자 정보
	 */
	getCurrentUser: email => {
		console.log(`[memberApi.getCurrentUser] 사용자 정보 요청: email=${email}`);
		try {
			const response = get(`/api/auth/me?email=${email}`);
			console.log(`[memberApi.getCurrentUser] 사용자 정보 조회 성공`);
			return response;
		} catch (error) {
			console.error('[memberApi.getCurrentUser] 사용자 정보 조회 실패:', error);
			throw error;
		}
	},
};

export default memberApi;
