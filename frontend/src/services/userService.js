/**
 * 사용자 관련 서비스
 * 로그인, 회원가입, 유저 정보 조회 등의 기능을 제공합니다.
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
 * 백엔드 API 기본 URL 가져오기
 * @returns {string} 백엔드 API 기본 URL
 */
const getBackendUrl = () => {
	return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';
};

/**
 * 사용자 서비스
 * @type {Object}
 */
const userService = {
	/**
	 * 로그인 처리를 합니다.
	 * 쿠키 기반 인증을 사용합니다 (HTTP-Only 쿠키).
	 * @param {Object} credentials - 로그인 정보 { email, password }
	 * @returns {Promise<Object>} 인증 정보 및 사용자 데이터
	 */
	login: async credentials => {
		log.debug(`[userService.login] 로그인 요청: email=${credentials.email}`);
		try {
			// 백엔드 서버 API 엔드포인트로 요청
			const response = await apiClient.post('/api/auth/login', credentials);
			log.debug(`[userService.login] 로그인 성공`, response);

			// 응답 데이터 구조 확인 및 처리
			let userData = null;

			// 다양한 API 응답 구조 처리
			if (response.user) {
				// { user: {...} } 구조
				userData = response.user;
			} else if (response.data && response.data.user) {
				// { data: { user: {...} } } 구조
				userData = response.data.user;
			} else if (response.data && typeof response.data === 'object') {
				// { data: {...} } 구조 (data 자체가 사용자 정보인 경우)
				userData = response.data;
			} else {
				// 그 외의 경우, 응답 전체를 사용자 데이터로 간주
				userData = response;
			}

			// 사용자 데이터가 객체인지 확인
			if (!userData || typeof userData !== 'object') {
				throw new Error('서버에서 유효한 사용자 정보를 반환하지 않았습니다.');
			}

			// 로그인 성공 시 로그인 상태 저장
			if (typeof window !== 'undefined') {
				localStorage.setItem('is_logged_in', 'true');

				// 사용자 정보 저장
				sessionStorage.setItem('member_key', JSON.stringify(userData));
				log.debug(`[userService.login] 사용자 정보 저장됨`, userData);
			}

			return userData;
		} catch (error) {
			log.error('[userService.login] 로그인 실패:', error);
			throw error;
		}
	},

	/**
	 * 회원가입 처리를 합니다.
	 * @param {Object} userData - 회원가입 정보 { name, email, password }
	 * @returns {Promise<Object>} 회원가입 결과
	 */
	register: async userData => {
		log.debug(`[userService.register] 회원가입 요청: email=${userData.email}`);
		try {
			const response = await apiClient.post('/api/auth/register', userData);
			log.debug(`[userService.register] 회원가입 성공`);
			return response;
		} catch (error) {
			log.error('[userService.register] 회원가입 실패:', error);
			throw error;
		}
	},

	/**
	 * 이메일 중복 확인을 합니다.
	 * @param {string} email - 확인할 이메일
	 * @returns {Promise<Object>} 이메일 중복 확인 결과
	 */
	checkEmailDuplicate: async email => {
		log.debug(`[userService.checkEmailDuplicate] 이메일 중복 확인 요청: email=${email}`);
		try {
			const response = await apiClient.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
			log.debug(`[userService.checkEmailDuplicate] 이메일 중복 확인 성공`);
			return response;
		} catch (error) {
			log.error('[userService.checkEmailDuplicate] 이메일 중복 확인 실패:', error);
			throw error;
		}
	},

	/**
	 * 현재 로그인한 사용자 정보를 조회합니다.
	 * JWT 토큰을 통해 서버에서 사용자를 식별합니다 (쿠키에 저장된 토큰 사용).
	 * @returns {Promise<Object>} 사용자 정보
	 */
	getCurrentUser: async () => {
		log.debug(`[userService.getCurrentUser] 사용자 정보 요청 (토큰 기반)`);
		try {
			const response = await apiClient.get(`/api/auth/me`);
			log.debug(`[userService.getCurrentUser] 사용자 정보 조회 성공`);

			// 응답 데이터 구조 확인 및 처리
			let userData = null;

			// 다양한 API 응답 구조 처리
			if (response.user) {
				userData = response.user;
			} else if (response.data && response.data.user) {
				userData = response.data.user;
			} else if (response.data && typeof response.data === 'object') {
				userData = response.data;
			} else {
				userData = response;
			}

			// 사용자 데이터가 객체인지 확인
			if (!userData || typeof userData !== 'object') {
				throw new Error('서버에서 유효한 사용자 정보를 반환하지 않았습니다.');
			}

			// 사용자 정보 캐싱
			if (typeof window !== 'undefined') {
				sessionStorage.setItem('member_key', JSON.stringify(userData));
				localStorage.setItem('is_logged_in', 'true');
			}

			return userData;
		} catch (error) {
			log.error('[userService.getCurrentUser] 사용자 정보 조회 실패:', error);

			// 클라이언트 측 상태 정리
			if (typeof window !== 'undefined') {
				localStorage.removeItem('is_logged_in');
				sessionStorage.removeItem('member_key');
			}

			throw error;
		}
	},

	/**
	 * 로그아웃 처리를 합니다.
	 * 클라이언트 측 인증 상태를 초기화합니다.
	 * @returns {Promise<boolean>} 로그아웃 성공 여부
	 */
	logout: async () => {
		log.debug(`[userService.logout] 로그아웃 요청`);
		try {
			// 서버 측 로그아웃
			try {
				await apiClient.post(`/api/auth/logout`);
				log.debug(`[userService.logout] 서버 로그아웃 성공`);
			} catch (e) {
				log.warn(`[userService.logout] 서버 로그아웃 실패:`, e);
				// 서버 로그아웃 실패해도 계속 진행
			}

			// 클라이언트 측 인증 상태 초기화
			if (typeof window !== 'undefined') {
				localStorage.removeItem('is_logged_in');
				sessionStorage.removeItem('member_key');
			}

			log.debug(`[userService.logout] 로그아웃 성공`);
			return true;
		} catch (error) {
			log.error('[userService.logout] 로그아웃 실패:', error);

			// 클라이언트 측 상태는 어쨌든 정리
			if (typeof window !== 'undefined') {
				localStorage.removeItem('is_logged_in');
				sessionStorage.removeItem('member_key');
			}

			return false;
		}
	},

	/**
	 * 로그인 상태 확인
	 * @returns {boolean} 로그인 여부
	 */
	isLoggedIn: () => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('is_logged_in') === 'true';
		}
		return false;
	},

	/**
	 * 세션 스토리지에서 사용자 정보 가져오기
	 * @returns {Object|null} 사용자 정보 또는 null
	 */
	getUserFromStorage: () => {
		if (typeof window !== 'undefined') {
			try {
				const userJSON = sessionStorage.getItem('member_key');
				return userJSON ? JSON.parse(userJSON) : null;
			} catch (e) {
				log.error('사용자 정보 파싱 오류:', e);
				return null;
			}
		}
		return null;
	},

	/**
	 * 인증 상태 확인 (서버 측에서 토큰 유효성 확인)
	 * @returns {Promise<Object>} - 인증 상태 확인 결과
	 */
	checkAuth: async () => {
		log.debug(`[userService.checkAuth] 인증 상태 확인 요청`);

		// 먼저 로컬 스토리지의 로그인 상태 확인
		if (typeof window !== 'undefined' && !localStorage.getItem('is_logged_in')) {
			log.debug(`[userService.checkAuth] 로컬 스토리지에 로그인 정보 없음`);
			const error = new Error('로그인 상태가 아닙니다.');
			error.status = 401;
			throw error;
		}

		try {
			// 백엔드 서버 API 엔드포인트로 요청
			const response = await apiClient.get('/api/auth/me');
			log.debug(`[userService.checkAuth] 인증 상태 확인 성공`);

			// 백엔드 응답에서 사용자 정보 추출
			let userData = null;
			if (response.user) {
				userData = response.user;
			} else if (response.data && response.data.user) {
				userData = response.data.user;
			} else {
				userData = response;
			}

			// 세션 스토리지에 사용자 정보 저장 (만약 없거나 다르다면)
			if (typeof window !== 'undefined' && userData) {
				const currentUserData = userService.getUserFromStorage();

				// 저장된 사용자 정보가 없거나 ID가 다른 경우에만 업데이트
				if (!currentUserData || currentUserData.id !== userData.id) {
					log.debug(`[userService.checkAuth] 사용자 정보 업데이트됨`);
					sessionStorage.setItem('member_key', JSON.stringify(userData));
					localStorage.setItem('is_logged_in', 'true');
				}
			}

			return response;
		} catch (error) {
			log.error('[userService.checkAuth] 인증 상태 확인 실패:', error);

			// 에러가 401 Unauthorized인 경우 로그인 상태 초기화
			if (error.status === 401) {
				if (typeof window !== 'undefined') {
					localStorage.removeItem('is_logged_in');
					sessionStorage.removeItem('member_key');
				}
				log.debug(`[userService.checkAuth] 인증 실패로 로그인 상태 초기화됨`);
			}

			throw error;
		}
	},
};

export default userService;
