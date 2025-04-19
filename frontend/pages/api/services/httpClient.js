/**
 * HTTP 클라이언트
 * 서버 API 요청을 처리하고 JWT 토큰 인증을 자동으로 관리합니다.
 */

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

/**
 * JWT 토큰을 로컬 스토리지에서 가져옵니다.
 * @returns {string|null} 저장된 토큰 또는 null
 */
export const getAuthToken = () => {
	if (typeof window !== 'undefined') {
		// 토큰 가져오기
		const token = localStorage.getItem('auth_token');

		// 토큰이 없을 경우 로그 출력
		if (!token) {
			console.warn('인증 토큰이 없습니다. 로그인 상태를 확인하세요.');
			return null;
		}

		// 토큰이 있을 경우 유효성 검사 (간단한 JWT 형식 확인)
		if (!token.includes('.') || token.split('.').length !== 3) {
			console.warn('잘못된 형식의 토큰입니다:', token);
			return null;
		}

		return token;
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
		console.log('인증 헤더 설정됨:', `Bearer ${token.substring(0, 15)}...`);
	} else {
		console.warn('인증 헤더를 설정할 수 없습니다. 토큰이 없습니다.');
	}

	// 추가: 멤버 ID를 헤더에 직접 포함
	const memberId = getMemberIdFromStorage();
	if (memberId) {
		headers['X-Member-ID'] = memberId;
		console.log('멤버 ID 헤더 설정됨:', memberId);
	}

	return headers;
};

// 세션 만료 시 로그인 페이지로 리디렉션
export function redirectToLogin() {
	if (typeof window !== 'undefined') {
		console.warn('세션이 만료되어 로그인 페이지로 이동합니다.');
		// 로그인 페이지로 이동 전에 현재 페이지 URL을 저장 (로그인 후 돌아오기 위함)
		const currentPath = window.location.pathname + window.location.search;
		sessionStorage.setItem('redirectAfterLogin', currentPath);

		// 로그인 페이지로 이동
		window.location.href = '/login';
	}
}

/**
 * API 요청을 수행합니다.
 * @param {string} endpoint - API 엔드포인트 경로 (/로 시작)
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
export const request = async (endpoint, options = {}) => {
	console.log('endpoint', endpoint);
	const url = `${API_BASE_URL}${endpoint}`;

	// 헤더에 인증 토큰 추가
	const headers = {
		...getAuthHeaders(),
		...options.headers,
	};

	console.log(`[API 요청] URL: ${url}`);
	console.log(`[API 요청] 메서드: ${options.method || 'GET'}`);
	console.log(`[API 요청] 헤더:`, headers);

	if (options.body) {
		// console.log(`[API 요청] 요청 데이터:`, options.body);
	}

	try {
		const response = await fetch(url, {
			...options,
			headers,
		});

		console.log(`[API 응답] 상태: ${response.status} ${response.statusText}`);

		// 응답이 JSON 형식인지 확인
		const contentType = response.headers.get('content-type');
		const isJson = contentType && contentType.includes('application/json');

		// 응답 데이터 파싱
		const data = isJson ? await response.json() : await response.text();

		// 403 오류 (권한 없음/세션 만료)
		if (response.status === 403) {
			console.error('[API 오류] 권한 없음 또는 세션 만료 (403)');

			// 토큰 확인
			const token = getAuthToken();
			console.log(`[API 오류] 현재 토큰: ${token ? '존재함' : '없음'}`);

			// 로컬 스토리지와 세션 스토리지 내용 로깅
			if (typeof window !== 'undefined') {
				console.log('로컬 스토리지 키:', Object.keys(localStorage));
				console.log('세션 스토리지 키:', Object.keys(sessionStorage));
			}

			// 로그인 페이지로 리디렉션 (1초 후)
			setTimeout(() => {
				redirectToLogin();
			}, 1000);

			throw {
				status: 403,
				data,
				message: '세션이 만료되었습니다. 다시 로그인해 주세요.',
			};
		}

		// 기타 오류 응답 처리
		if (!response.ok) {
			console.error(`[API 오류] 상태 코드: ${response.status}, 응답:`, data);

			throw {
				status: response.status,
				data,
				message: isJson && data.message ? data.message : '요청 처리 중 오류가 발생했습니다.',
			};
		}

		if (isJson) {
			console.log(`[API 응답] 데이터:`, data);
		} else {
			console.log(`[API 응답] 데이터: 텍스트 응답 (${data.length} 바이트)`);
		}

		return data;
	} catch (error) {
		console.error('[API 요청 오류]:', error);
		throw error;
	}
};

// HTTP 메소드별 헬퍼 함수
export const get = (endpoint, options = {}) => {
	return request(endpoint, {
		method: 'GET',
		...options,
	});
};

export const post = (endpoint, data, options = {}) => {
	return request(endpoint, {
		method: 'POST',
		body: JSON.stringify(data),
		...options,
	});
};

export const put = (endpoint, data, options = {}) => {
	return request(endpoint, {
		method: 'PUT',
		body: JSON.stringify(data),
		...options,
	});
};

export const del = (endpoint, options = {}) => {
	return request(endpoint, {
		method: 'DELETE',
		...options,
	});
};

// 세션스토리지에서 회원 ID 가져오기
export function getMemberIdFromStorage() {
	try {
		// 브라우저 환경인지 확인
		if (typeof window === 'undefined') {
			console.error('[getMemberIdFromStorage] 브라우저 환경이 아닙니다.');
			return null;
		}

		// 세션 스토리지에서 member_key 가져오기
		const memberDataStr = sessionStorage.getItem('member_key');
		if (!memberDataStr) {
			console.error('[getMemberIdFromStorage] 세션스토리지에 member_key가 없습니다.');
			return null;
		}

		console.log('[getMemberIdFromStorage] 세션 데이터:', memberDataStr);

		// JSON 파싱
		const memberData = JSON.parse(memberDataStr);

		// 유효한 ID 확인
		if (!memberData || !memberData.id) {
			console.error('[getMemberIdFromStorage] 세션에 사용자 ID가 없습니다:', memberData);
			return null;
		}

		console.log('[getMemberIdFromStorage] 사용자 ID 찾음:', memberData.id);

		// 중요: 이 ID는 백엔드 API 요청 시 권한 검증에 필수적입니다.
		// JWT 토큰의 subject가 member_id(UUID)로 변경되었으므로,
		// 클라이언트에서 보내는 member_id와 토큰의 subject가 일치해야 인증이 성공합니다.
		// HTTP 요청 시 X-Member-ID 헤더와 쿼리 파라미터 ?member_id= 모두에 이 값이 사용됩니다.
		return memberData.id;
	} catch (error) {
		console.error('[getMemberIdFromStorage] 오류:', error);
		return null;
	}
}

// 기본 export
export default {
	get,
	post,
	put,
	del,
	getAuthToken,
	getAuthHeaders,
	getMemberIdFromStorage,
};
