/**
 * HTTP 클라이언트
 * 서버 API 요청을 처리하고 JWT 토큰 인증을 자동으로 관리합니다.
 * HttpOnly 쿠키 기반 인증 방식으로 보안 강화
 */

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

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
 * 로그인 상태 확인 - HttpOnly 쿠키 방식에서는 로컬스토리지에 플래그만 저장
 * @returns {boolean} 로그인 여부
 */
export const isLoggedIn = () => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('is_logged_in') === 'true';
	}
	return false;
};

/**
 * 세션 스토리지에서 회원 ID를 가져옵니다.
 * @returns {string|null} 회원 ID 또는 null
 */
export const getMemberIdFromStorage = () => {
	if (typeof window !== 'undefined') {
		try {
			const memberData = sessionStorage.getItem('member_key');
			if (memberData) {
				const parsed = JSON.parse(memberData);
				return parsed.id;
			}
		} catch (error) {
			console.error('회원 ID 조회 오류:', error);
		}
	}
	return null;
};

/**
 * 서버에 인증 상태를 확인합니다.
 * 쿠키 기반 인증을 사용하므로 별도의 토큰을 전달할 필요가 없습니다.
 * @returns {Promise<boolean>} 인증 여부
 */
export const checkAuthStatus = async () => {
	try {
		const response = await fetch('/api/auth/me', {
			method: 'GET',
			credentials: 'include', // 쿠키 포함
		});

		if (response.ok) {
			// 인증 성공 - 응답 데이터를 파싱하여 캐시에 저장
			const userData = await response.json();

			// 응답 데이터 검증
			if (!userData || !userData.email) {
				console.error('서버 응답에 사용자 정보가 없습니다');
				return false;
			}

			// 사용자 정보를 세션스토리지에 캐싱
			sessionStorage.setItem('member_key', JSON.stringify(userData));
			localStorage.setItem('is_logged_in', 'true');

			log.debug('인증 상태 확인: 로그인됨');
			return true;
		} else {
			// 인증 실패 - 로컬 상태 정리
			sessionStorage.removeItem('member_key');
			localStorage.removeItem('is_logged_in');

			log.debug('인증 상태 확인: 로그인되지 않음');
			return false;
		}
	} catch (error) {
		log.error('인증 상태 확인 오류:', error);
		return false;
	}
};

/**
 * 인증 헤더를 생성합니다.
 * HttpOnly 쿠키 기반 인증에서는 추가 헤더가 필요 없을 수 있지만,
 * 필요한 경우를 위해 유지합니다.
 * @returns {Object} 헤더 객체
 */
export const getAuthHeaders = () => {
	const headers = {
		'Content-Type': 'application/json',
	};

	// 세션스토리지에서 member_key를 확인하여 필요한 경우 헤더에 추가
	const memberId = getMemberIdFromStorage();
	if (memberId) {
		headers['X-Member-ID'] = memberId;
		log.debug('멤버 ID 헤더 설정됨:', memberId);
	}

	return headers;
};

// 세션 만료 시 로그인 페이지로 리디렉션
export function redirectToLogin(currentPath) {
	if (typeof window !== 'undefined') {
		log.warn('세션이 만료되어 로그인 페이지로 이동합니다.');

		// 로그인 페이지로 이동 전에 현재 페이지 URL을 저장 (로그인 후 돌아오기 위함)
		const path = currentPath || window.location.pathname + window.location.search;
		sessionStorage.setItem('redirectAfterLogin', path);

		// 로그인 상태 초기화
		localStorage.removeItem('is_logged_in');
		sessionStorage.removeItem('member_key');

		// 로그인 페이지로 이동
		const redirectUrl = `/login?redirect=${encodeURIComponent(path)}`;
		log.debug(`리디렉션 URL: ${redirectUrl}`);

		// 이미 로그인 페이지인 경우 리디렉션 방지
		if (!window.location.pathname.includes('/login')) {
			window.location.href = redirectUrl;
		}
	}
}

/**
 * API 요청을 수행합니다.
 * @param {string} endpoint - API 엔드포인트 경로 (/로 시작)
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const request = async (endpoint, options = {}) => {
	log.debug(`[API 요청] 엔드포인트: ${endpoint}`);
	const url = `${API_BASE_URL}${endpoint}`;

	// 로그인이 필요한 엔드포인트인데 로그인 상태가 아닌 경우 체크
	if (!endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
		// 로컬 스토리지의 로그인 상태를 먼저 확인
		if (!isLoggedIn()) {
			log.warn(`[API 요청] 로그인 상태가 아닙니다: ${endpoint}`);

			// 서버에 인증 상태 직접 확인 (쿠키가 유효할 수도 있음)
			const isAuthenticated = await checkAuthStatus();

			if (!isAuthenticated) {
				// 현재 경로 저장 후 로그인 페이지로 리디렉션
				if (typeof window !== 'undefined') {
					const currentPath = window.location.pathname + window.location.search;
					redirectToLogin(currentPath);

					throw {
						status: 401,
						message: '인증이 필요합니다. 로그인 페이지로 이동합니다.',
					};
				}
			}
		}
	}

	// 기본 헤더 설정
	const headers = {
		'Content-Type': 'application/json',
		...options.headers,
	};

	log.debug(`[API 요청] URL: ${url}`);
	log.debug(`[API 요청] 메서드: ${options.method || 'GET'}`);
	log.debug(`[API 요청] 헤더:`, headers);

	if (options.body) {
		log.debug(`[API 요청] 요청 데이터:`, options.body);
	}

	try {
		// credentials: 'include'를 추가하여 쿠키를 요청에 포함
		// 중요: localhost에서 CORS+쿠키 사용 시 credentials를 include로 설정해야 함
		const response = await fetch(url, {
			...options,
			headers,
			credentials: 'include', // 쿠키 포함 설정
		});

		log.debug(`[API 응답] 상태: ${response.status} ${response.statusText}`);

		// 응답 헤더 로깅 (개발 모드에서만)
		if (isDev) {
			log.debug('[API 응답] 헤더:');
			response.headers.forEach((value, key) => {
				log.debug(`  ${key}: ${value}`);
			});
		}

		// 응답이 JSON 형식인지 확인
		const contentType = response.headers.get('content-type');
		const isJson = contentType && contentType.includes('application/json');

		// 응답 데이터 파싱
		const data = isJson ? await response.json() : await response.text();

		// 401 오류 (인증 실패)
		if (response.status === 401) {
			log.error('[API 오류] 인증 실패 (401)');

			// 로그인 상태 초기화
			localStorage.removeItem('is_logged_in');
			sessionStorage.removeItem('member_key');

			// 현재 페이지 저장 및 리디렉션
			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname + window.location.search;
				redirectToLogin(currentPath);
			}

			throw {
				status: 401,
				data,
				message: '인증에 실패했습니다. 다시 로그인해 주세요.',
			};
		}

		// 403 오류 (권한 없음/세션 만료)
		if (response.status === 403) {
			log.error('[API 오류] 권한 없음 또는 세션 만료 (403)');

			// 로컬 스토리지와 세션 스토리지 내용 로깅
			if (typeof window !== 'undefined') {
				log.debug('로컬 스토리지 키:', Object.keys(localStorage));
				log.debug('세션 스토리지 키:', Object.keys(sessionStorage));
			}

			// 로그인 상태 초기화
			localStorage.removeItem('is_logged_in');
			sessionStorage.removeItem('member_key');

			// 현재 페이지 저장 및 리디렉션
			if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
				const currentPath = window.location.pathname + window.location.search;
				redirectToLogin(currentPath);
			}

			throw {
				status: 403,
				data,
				message: '세션이 만료되었거나 접근 권한이 없습니다.',
			};
		}

		// 404 오류 (찾을 수 없음)
		if (response.status === 404) {
			log.error('[API 오류] 리소스를 찾을 수 없음 (404)');
			throw {
				status: 404,
				data,
				message: '요청한 리소스를 찾을 수 없습니다.',
			};
		}

		// 500 오류 (서버 오류)
		if (response.status >= 500) {
			log.error('[API 오류] 서버 오류:', response.status);
			throw {
				status: response.status,
				data,
				message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
			};
		}

		// 기타 오류
		if (!response.ok) {
			log.error('[API 오류] HTTP 오류:', response.status);
			throw {
				status: response.status,
				data,
				message: '요청 처리 중 오류가 발생했습니다.',
			};
		}

		// 정상 응답
		return data;
	} catch (error) {
		// 네트워크 오류 또는 예외 처리
		if (!error.status) {
			log.error('[API 오류] 네트워크 오류:', error);
			throw {
				status: 0,
				message: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.',
			};
		}

		// 이미 처리된 HTTP 오류
		throw error;
	}
};

/**
 * GET 요청을 보냅니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const get = (endpoint, options = {}) => {
	return request(endpoint, {
		method: 'GET',
		...options,
	});
};

/**
 * POST 요청을 보냅니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 바디 데이터
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const post = (endpoint, data, options = {}) => {
	return request(endpoint, {
		method: 'POST',
		body: JSON.stringify(data),
		...options,
	});
};

/**
 * PUT 요청을 보냅니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 바디 데이터
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const put = (endpoint, data, options = {}) => {
	return request(endpoint, {
		method: 'PUT',
		body: JSON.stringify(data),
		...options,
	});
};

/**
 * DELETE 요청을 보냅니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const del = (endpoint, options = {}) => {
	return request(endpoint, {
		method: 'DELETE',
		...options,
	});
};

export default {
	get,
	post,
	put,
	del,
	request,
	getAuthHeaders,
	redirectToLogin,
	checkAuthStatus, // 추가: 인증 상태 확인 함수 내보내기
	isLoggedIn,
};
