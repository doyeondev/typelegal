/**
 * API 요청 유틸리티 함수
 * JWT 토큰을 자동으로 헤더에 포함시키고 오류 처리를 간소화합니다.
 */

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

/**
 * JWT 토큰을 로컬 스토리지에서 가져옵니다.
 * @returns {string|null} 저장된 토큰 또는 null
 */
export const getAuthToken = () => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('auth_token');
	}
	return null;
};

/**
 * 인증 헤더를 생성합니다.
 * @returns {Object} 헤더 객체
 */
export const getAuthHeaders = () => {
	const token = getAuthToken();
	const headers = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return headers;
};

/**
 * API 요청을 수행합니다.
 * @param {string} endpoint - API 엔드포인트 경로 (/로 시작)
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const apiRequest = async (endpoint, options = {}) => {
	const url = `${API_BASE_URL}${endpoint}`;

	// 헤더에 인증 토큰 추가
	const headers = {
		...getAuthHeaders(),
		...options.headers,
	};

	try {
		const response = await fetch(url, {
			...options,
			headers,
		});

		// 응답이 JSON 형식인지 확인
		const contentType = response.headers.get('content-type');
		const isJson = contentType && contentType.includes('application/json');

		// 응답 데이터 파싱
		const data = isJson ? await response.json() : await response.text();

		// 오류 응답 처리
		if (!response.ok) {
			throw {
				status: response.status,
				data,
				message: isJson && data.message ? data.message : '요청 처리 중 오류가 발생했습니다.',
			};
		}

		return data;
	} catch (error) {
		console.error('API 요청 오류:', error);
		throw error;
	}
};

/**
 * GET 요청을 수행합니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const get = (endpoint, options = {}) => {
	return apiRequest(endpoint, {
		method: 'GET',
		...options,
	});
};

/**
 * POST 요청을 수행합니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 전송할 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const post = (endpoint, data, options = {}) => {
	return apiRequest(endpoint, {
		method: 'POST',
		body: JSON.stringify(data),
		...options,
	});
};

/**
 * PUT 요청을 수행합니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 전송할 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const put = (endpoint, data, options = {}) => {
	return apiRequest(endpoint, {
		method: 'PUT',
		body: JSON.stringify(data),
		...options,
	});
};

/**
 * DELETE 요청을 수행합니다.
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const del = (endpoint, options = {}) => {
	return apiRequest(endpoint, {
		method: 'DELETE',
		...options,
	});
};

export default {
	get,
	post,
	put,
	del,
	getAuthToken,
	getAuthHeaders,
};
