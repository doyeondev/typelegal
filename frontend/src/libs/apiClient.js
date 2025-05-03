/**
 * API 클라이언트
 * 백엔드 API 호출을 위한 통합 인터페이스
 */

// API 기본 URL 설정
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
 * 로그인 페이지로 리디렉션
 * 인증 만료 또는 인증 오류 시 호출됨
 * @param {string} currentUrl - 현재 URL (로그인 후 리디렉션용)
 */
const redirectToLogin = currentUrl => {
	if (typeof window !== 'undefined') {
		// 현재 URL이 제공되지 않은 경우 현재 페이지 경로 사용
		const redirectPath = currentUrl || window.location.pathname + window.location.search;

		// 로그인 후 돌아올 경로 저장
		sessionStorage.setItem('redirectAfterLogin', redirectPath);

		// 인증 만료 파라미터를 포함하여 로그인 페이지로 리디렉션
		window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}&tokenExpired=true`;
	}
};

/**
 * API 응답 처리 공통 로직
 * @param {Response} response - Fetch API의 Response 객체
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.skipErrorLogging - 에러 로깅을 건너뛸지 여부
 * @returns {Promise<any>} 파싱된 응답 데이터
 */
const handleResponse = async (response, options = {}) => {
	// 먼저 Content-Type 헤더 확인
	const contentType = response.headers.get('Content-Type') || '';
	const { skipErrorLogging = false } = options;

	// 응답이 성공이 아닌 경우 (HTTP 상태 코드가 200-299 범위를 벗어남)
	if (!response.ok) {
		// 응답 본문 가져오기 시도
		let errorData;
		try {
			// JSON 응답인 경우
			if (contentType.includes('application/json')) {
				errorData = await response.json();
			} else {
				// 일반 텍스트 응답인 경우
				errorData = await response.text();
			}
		} catch (err) {
			// 응답 본문 파싱 실패 시 기본 오류 메시지 사용
			errorData = '응답 처리 중 오류가 발생했습니다.';
		}

		// 인증 오류 처리 (401 Unauthorized)
		if (response.status === 401) {
			// 401 에러는 옵션에 따라 로깅할지 결정
			if (!skipErrorLogging) {
				log.warn('API 요청 인증 실패 (401):', response.url);
			}

			// 인증 만료 처리
			if (typeof window !== 'undefined') {
				localStorage.removeItem('is_logged_in');
				sessionStorage.removeItem('member_key');

				// 인증 요청 중에는 리디렉션하지 않음 (무한 루프 방지)
				const isAuthRequest = response.url.includes('/api/auth/login') || response.url.includes('/api/auth/register') || response.url.includes('/api/auth/check-email') || response.url.includes('/api/auth/me');

				if (!isAuthRequest) {
					// 현재 URL 저장
					const currentUrl = window.location.pathname + window.location.search;

					// 로그인 페이지로 리디렉션
					redirectToLogin(currentUrl);

					// 사용자 경험을 위한 오류 메시지 구성
					const error = new Error('인증이 만료되었습니다. 다시 로그인이 필요합니다.');
					error.status = 401;
					error.isAuthError = true;
					throw error;
				}
			}
		}

		// 오류 객체 구성 (에러 데이터가 HTML인 경우 처리)
		let errorMessage = '알 수 없는 오류가 발생했습니다.';
		if (typeof errorData === 'string') {
			// HTML 응답에서 에러 메시지 추출 시도
			if (errorData.includes('<!DOCTYPE html>')) {
				// HTML 응답은 서버 에러로 간주
				errorMessage = `서버 에러: ${response.status} ${response.statusText}`;
			} else {
				errorMessage = errorData;
			}
		} else if (errorData && errorData.message) {
			errorMessage = errorData.message;
		} else if (errorData && typeof errorData === 'object') {
			errorMessage = JSON.stringify(errorData);
		}

		const error = new Error(errorMessage);

		// 추가 오류 정보 설정
		error.status = response.status;
		error.statusText = response.statusText;
		error.data = errorData;

		// 오류 로깅 및 던지기 (401 에러가 아니거나 로깅을 스킵하지 않는 경우에만)
		if (!(response.status === 401 && skipErrorLogging)) {
			// 403 에러의 경우 더 자세한 메시지 처리
			if (response.status === 403) {
				log.error('API 접근 권한 없음 (403):', response.url);

				// 에러 데이터에서 메시지 추출
				let forbiddenMessage = '서버에서 요청을 거부했습니다.';
				if (errorData && typeof errorData === 'string') {
					forbiddenMessage = errorData;
				} else if (errorData && errorData.message) {
					forbiddenMessage = errorData.message;
				}

				// 더 명확한 에러 메시지 설정
				error.message = forbiddenMessage;
			}

			log.error('API 요청 실패:', error);
		}

		throw error;
	}

	// 응답에 내용이 없는 경우 (204 No Content 등)
	if (response.status === 204) {
		return null;
	}

	// Content-Type에 따라 응답 파싱
	if (contentType.includes('application/json')) {
		try {
			return await response.json();
		} catch (error) {
			log.error('JSON 응답 파싱 오류:', error);
			throw new Error('응답을 JSON 형식으로 파싱할 수 없습니다.');
		}
	} else {
		// JSON이 아닌 경우 텍스트로 반환
		return await response.text();
	}
};

/**
 * API 요청 옵션 구성
 * @param {string} method - HTTP 메서드
 * @param {Object} [data] - 요청 바디 데이터
 * @param {Object} [customOptions] - 추가 옵션
 * @returns {Object} Fetch API 요청 옵션
 */
const createRequestOptions = (method, data, customOptions = {}) => {
	// 기본 헤더 설정
	const headers = {
		Accept: 'application/json',
		...customOptions.headers,
	};

	// POST, PUT, PATCH 요청에 Content-Type 헤더 추가 (데이터가 있는 경우)
	if (['POST', 'PUT', 'PATCH'].includes(method)) {
		headers['Content-Type'] = 'application/json';
	}

	// 요청 옵션 구성
	const options = {
		method,
		headers,
		credentials: 'include', // 인증 쿠키 포함
		...customOptions,
	};

	// 요청 바디 설정 (GET, HEAD 메서드는 바디 없음)
	if (data && !['GET', 'HEAD'].includes(method)) {
		options.body = JSON.stringify(data);
	}

	return options;
};

/**
 * API 호출 공통 함수
 * @param {string} url - API 엔드포인트 경로
 * @param {string} method - HTTP 메서드
 * @param {Object} [data] - 요청 바디 데이터
 * @param {Object} [options] - 추가 옵션
 * @returns {Promise<any>} API 응답 데이터
 */
const fetchClient = async (url, method, data, options = {}) => {
	// URL 구성: 백엔드 API URL + 경로
	let fullUrl;

	// 외부 URL 또는 절대 경로인 경우
	if (url.startsWith('http') || url.startsWith('//')) {
		fullUrl = url;
	} else {
		// 백엔드 URL에 API 경로 추가
		// 항상 슬래시로 시작하도록 보장
		const apiPath = url.startsWith('/') ? url : `/${url}`;
		fullUrl = `${API_BASE_URL}${apiPath}`;
	}

	// 요청 옵션 구성
	const isServer = typeof window === 'undefined';
	const { skipErrorLogging, ...otherOptions } = options || {};

	// 서버 환경에서 쿠키가 전달되면 headers.cookie에 포함시킴 (25.05.01 추가)
	const requestOptions = createRequestOptions(method, data, {
		...otherOptions,
		credentials: 'include', // 인증 정보 포함 (쿠키 전송)
		headers: {
			...(otherOptions.headers || {}),
			...(isServer && otherOptions.cookie ? { cookie: otherOptions.cookie } : {}), // SSR 환경 쿠키 전달
		},
	});

	try {
		// 요청 시작 로깅
		log.debug(`API 요청: ${method} ${fullUrl}`);
		if (data) log.debug('요청 데이터:', data);
		if (isServer && otherOptions.cookie) log.debug('SSR 쿠키 전달:', otherOptions.cookie);

		// 요청 보내기
		const response = await fetch(fullUrl, requestOptions);

		// 응답 처리 (특별한 옵션 전달)
		const result = await handleResponse(response, { skipErrorLogging });

		// 성공 응답 로깅
		log.debug(`API 응답: ${method} ${fullUrl}`, result);

		return result;
	} catch (error) {
		// 네트워크 오류 또는 응답 처리 중 오류
		if (!error.status) {
			log.error(`API 요청 중 네트워크 오류: ${method} ${fullUrl}`, error);

			// 오류 객체 구성 및 던지기
			const networkError = new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
			networkError.isNetworkError = true;
			throw networkError;
		}

		// 이미 처리된 오류는 그대로 던지기
		throw error;
	}
};

/**
 * API 클라이언트 인터페이스
 */
const apiClient = {
	/**
	 * GET 요청
	 * @param {string} url - API 엔드포인트 경로
	 * @param {Object} [options] - 추가 옵션
	 * @returns {Promise<any>} API 응답 데이터
	 */
	get: (url, options) => fetchClient(url, 'GET', null, options),

	/**
	 * POST 요청
	 * @param {string} url - API 엔드포인트 경로
	 * @param {Object} data - 요청 바디 데이터
	 * @param {Object} [options] - 추가 옵션
	 * @returns {Promise<any>} API 응답 데이터
	 */
	post: (url, data, options) => fetchClient(url, 'POST', data, options),

	/**
	 * PUT 요청
	 * @param {string} url - API 엔드포인트 경로
	 * @param {Object} data - 요청 바디 데이터
	 * @param {Object} [options] - 추가 옵션
	 * @returns {Promise<any>} API 응답 데이터
	 */
	put: (url, data, options) => fetchClient(url, 'PUT', data, options),

	/**
	 * PATCH 요청
	 * @param {string} url - API 엔드포인트 경로
	 * @param {Object} data - 요청 바디 데이터
	 * @param {Object} [options] - 추가 옵션
	 * @returns {Promise<any>} API 응답 데이터
	 */
	patch: (url, data, options) => fetchClient(url, 'PATCH', data, options),

	/**
	 * DELETE 요청
	 * @param {string} url - API 엔드포인트 경로
	 * @param {Object} [options] - 추가 옵션
	 * @returns {Promise<any>} API 응답 데이터
	 */
	delete: (url, options) => fetchClient(url, 'DELETE', null, options),
};

export default apiClient;
