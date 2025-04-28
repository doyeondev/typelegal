/**
 * 계약서 드래프트 데이터 조회 API 라우트
 * 백엔드 서버의 drafting 엔드포인트로 요청을 프록시합니다.
 * HttpOnly 쿠키 기반 인증을 사용하여 사용자 식별을 합니다.
 */

// 백엔드 API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default async function handler(req, res) {
	// 요청 메서드 확인
	const { method } = req;
	const url = req.url;

	// URL에서 ID 부분 추출
	const matches = url.match(/\/api\/data\/drafting-data\/([^\/]+)(?:\/([^\/]+))?/);
	const id = matches ? matches[1] : null;
	const action = matches && matches[2] ? matches[2] : null;

	console.log(`[API 라우트] drafting-data 요청: 메서드=${method}, ID=${id}, 액션=${action}`);
	console.log(`[API 라우트] 요청 헤더:`, req.headers);

	try {
		// 적절한 백엔드 엔드포인트 구성
		let backendUrl;
		if (action === 'exists') {
			backendUrl = `${API_BASE_URL}/api/drafting/exists/${id}`;
		} else if (id && method === 'PUT') {
			backendUrl = `${API_BASE_URL}/api/drafting/${id}`;
		} else if (id && method === 'GET') {
			backendUrl = `${API_BASE_URL}/api/drafting/${id}`;
		} else if (method === 'GET') {
			// 사용자의 모든 드래프트 조회 (이메일 파라미터 불필요 - 서버가 쿠키에서 유저 정보 가져옴)
			backendUrl = `${API_BASE_URL}/api/drafting/user`;
		} else if (method === 'POST') {
			backendUrl = `${API_BASE_URL}/api/drafting`;
		} else if (url.includes('/delete') && method === 'PUT') {
			backendUrl = `${API_BASE_URL}/api/drafting/delete`;
		} else {
			throw new Error('지원하지 않는 요청 형식입니다.');
		}

		// 쿠키 및 인증 정보 처리
		const cookies = req.headers.cookie || '';
		const authorization = req.headers.authorization || '';

		// 요청 헤더 설정
		const headers = {
			'Content-Type': 'application/json',
		};

		// 쿠키가 있으면 추가
		if (cookies) {
			headers['Cookie'] = cookies;
		}

		// Authorization 헤더가 있으면 추가
		if (authorization) {
			headers['Authorization'] = authorization;
		}

		console.log(`[API 라우트] 백엔드 API 요청: ${method} ${backendUrl}`);
		console.log(`[API 라우트] 전송 헤더:`, headers);

		// 요청 바디 구성 (필요한 경우)
		let body = null;
		if (['POST', 'PUT'].includes(method)) {
			body = JSON.stringify(req.body);
		}

		// 백엔드 API 호출
		const fetchOptions = {
			method,
			headers,
			credentials: 'include',
		};

		// body가 있으면 추가
		if (body) {
			fetchOptions.body = body;
		}

		const response = await fetch(backendUrl, fetchOptions);

		// 응답 상태 및 헤더 로깅
		console.log(`[API 라우트] 백엔드 응답 상태: ${response.status}`);
		console.log(`[API 라우트] 백엔드 응답 헤더:`, Object.fromEntries([...response.headers.entries()]));

		// 응답이 JSON인지 확인
		const contentType = response.headers.get('content-type');
		const isJson = contentType && contentType.includes('application/json');

		// 응답 데이터 추출
		let data;
		try {
			data = isJson ? await response.json() : await response.text();
		} catch (error) {
			console.error('[API 라우트] 응답 데이터 파싱 오류:', error);
			data = { error: 'JSON 파싱 오류', message: error.message };
		}

		// 백엔드 응답을 클라이언트에 그대로 전달
		res.status(response.status);

		// 백엔드 서버에서 설정한 모든 헤더 복사
		response.headers.forEach((value, key) => {
			// Set-Cookie 헤더는 특별히 처리
			if (key.toLowerCase() !== 'set-cookie') {
				res.setHeader(key, value);
			}
		});

		// Set-Cookie 헤더 처리 (있는 경우)
		const setCookieHeader = response.headers.get('set-cookie');
		if (setCookieHeader) {
			res.setHeader('Set-Cookie', setCookieHeader);
		}

		if (isJson || typeof data === 'object') {
			res.json(data);
		} else {
			res.send(data);
		}
	} catch (error) {
		console.error('[API 라우트] 드래프트 데이터 처리 오류:', error);
		res.status(500).json({
			message: '드래프트 데이터 처리 중 오류가 발생했습니다.',
			error: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		});
	}
}
